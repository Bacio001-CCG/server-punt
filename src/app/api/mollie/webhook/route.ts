import { db } from "@/database/connect";
import {
    ordersTable,
    orderItemsTable,
    orderItemsConfigurationTable,
    productsTable,
} from "@/database/schema";
import { OrderStatus } from "@/enums";
import Axios from "axios";
import { eq, sql } from "drizzle-orm";
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
                // Update order status to paid
                const orders = await db
                    .update(ordersTable)
                    .set({ status: OrderStatus.Paid })
                    .where(eq(ordersTable.invoiceId, salesInvoiceId))
                    .returning({ id: ordersTable.id });

                console.log("Orders updated:", orders);

                if (orders.length > 0) {
                    const orderId = orders[0].id;

                    // Get all order items
                    const orderItems = await db
                        .select()
                        .from(orderItemsTable)
                        .where(eq(orderItemsTable.orderId, orderId));

                    console.log("Order items found:", orderItems.length);

                    // Reduce stock for each product
                    for (const item of orderItems) {
                        console.log(`Processing item: productId=${item.productId}, quantity=${item.quantity}`);

                        // Get current product stock
                        const product = await db
                            .select({ quantityInStock: productsTable.quantityInStock })
                            .from(productsTable)
                            .where(eq(productsTable.id, item.productId))
                            .limit(1);

                        console.log(`Current stock for product ${item.productId}:`, product);

                        if (product.length > 0) {
                            const newStock = Math.max(
                                0,
                                product[0].quantityInStock - item.quantity
                            );
                            console.log(`Updating stock from ${product[0].quantityInStock} to ${newStock}`);

                            // Update main product stock
                            await db
                                .update(productsTable)
                                .set({ quantityInStock: newStock })
                                .where(eq(productsTable.id, item.productId));

                            console.log(`Stock updated for product ${item.productId}`);
                        }

                        // Get and reduce stock for configured items
                        const configuredItems = await db
                            .select()
                            .from(orderItemsConfigurationTable)
                            .where(
                                eq(
                                    orderItemsConfigurationTable.orderItemId,
                                    item.id
                                )
                            );

                        console.log(`Configured items found:`, configuredItems.length);

                        for (const configItem of configuredItems) {
                            console.log(`Processing configured item: productId=${configItem.productId}, quantity=${configItem.quantity}`);

                            const configProduct = await db
                                .select({ quantityInStock: productsTable.quantityInStock })
                                .from(productsTable)
                                .where(eq(productsTable.id, configItem.productId))
                                .limit(1);

                            if (configProduct.length > 0) {
                                const newConfigStock = Math.max(
                                    0,
                                    configProduct[0].quantityInStock - configItem.quantity
                                );
                                console.log(`Updating configured stock from ${configProduct[0].quantityInStock} to ${newConfigStock}`);

                                await db
                                    .update(productsTable)
                                    .set({ quantityInStock: newConfigStock })
                                    .where(eq(productsTable.id, configItem.productId));

                                console.log(`Configured stock updated for product ${configItem.productId}`);
                            }
                        }
                    }
                }
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
