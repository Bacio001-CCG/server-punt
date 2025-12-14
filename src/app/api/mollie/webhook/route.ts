import { db } from "@/database/connect";
import { ordersTable } from "@/database/schema";
import { OrderStatus } from "@/enums";
import Axios from "axios";
import { eq } from "drizzle-orm";
// ssh -p 443 -R0:localhost:3000 qr@free.pinggy.io
export async function POST(request: Request) {
    try {
        const contentType = request.headers.get("content-type");

        if (contentType?.includes("application/x-www-form-urlencoded")) {
            const formData = await request.formData();
            const paymentId = formData.get("id") as string;
            const response = await Axios.get(
                "https://api.mollie.com/v2/payments/" + paymentId,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && response.data.status === "paid") {
                const salesInvoiceId = response.data.metadata.salesInvoiceId;
                await Axios.patch(
                    `https://api.mollie.com/v2/sales-invoices/${salesInvoiceId}`,
                    {
                        status: "paid",
                        paymentDetails: {
                            source: "payment",
                            sourceReference: paymentId,
                        },
                        emailDetails: {
                            subject: `Factuur ${response.data.metadata.invoiceNumber} betaald - Server Punt`,
                            body: `Beste klant,\n\nWe hebben uw betaling voor factuur ${response.data.metadata.invoiceNumber} succesvol ontvangen. Hartelijk dank voor uw aankoop bij Server Punt!\n\nMet vriendelijke groet,\nServer Punt`,
                        },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                await db
                    .update(ordersTable)
                    .set({ status: OrderStatus.Paid })
                    .where(eq(ordersTable.invoiceId, salesInvoiceId));
            }
        }

        return new Response("OK", { status: 200 });
    } catch (error: any) {
        console.error(
            "Error processing webhook:",
            error.response?.data || error
        );
        return new Response("Error", { status: 500 });
    }
}
