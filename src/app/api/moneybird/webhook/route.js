import { db } from "@/database/connect";
import {
    ordersTable,
    orderItemsTable,
    orderItemsConfigurationTable,
    productsTable,
} from "@/database/schema";
import { OrderStatus } from "@/enums";
import { eq } from "drizzle-orm";

export async function POST(request) {
    const body = await request.json();
    switch (body.action) {
        case "sales_invoice_state_changed_to_paid":
            await handleSalesInvoiceStateChangedToPaid(body.entity.id);
            break;
    }

    return new Response("Webhook received", { status: 200 });
}

async function handleSalesInvoiceStateChangedToPaid(salesInvoiceId) {
    const orders = await db
        .update(ordersTable)
        .set({ status: OrderStatus.Paid })
        .where(eq(ordersTable.invoiceId, salesInvoiceId))
        .returning({ id: ordersTable.id });

    if (orders.length > 0) {
        const orderId = orders[0].id;

        const orderItems = await db
            .select()
            .from(orderItemsTable)
            .where(eq(orderItemsTable.orderId, orderId));

        for (const item of orderItems) {
            const product = await db
                .select({
                    quantityInStock: productsTable.quantityInStock,
                })
                .from(productsTable)
                .where(eq(productsTable.id, item.productId))
                .limit(1);

            if (product.length > 0) {
                const newStock = Math.max(
                    0,
                    product[0].quantityInStock - item.quantity
                );

                await db
                    .update(productsTable)
                    .set({ quantityInStock: newStock })
                    .where(eq(productsTable.id, item.productId));
            }

            const configuredItems = await db
                .select()
                .from(orderItemsConfigurationTable)
                .where(eq(orderItemsConfigurationTable.orderItemId, item.id));

            for (const configItem of configuredItems) {
                const configProduct = await db
                    .select({
                        quantityInStock: productsTable.quantityInStock,
                    })
                    .from(productsTable)
                    .where(eq(productsTable.id, configItem.productId))
                    .limit(1);

                if (configProduct.length > 0) {
                    const newConfigStock = Math.max(
                        0,
                        configProduct[0].quantityInStock - configItem.quantity
                    );

                    await db
                        .update(productsTable)
                        .set({ quantityInStock: newConfigStock })
                        .where(eq(productsTable.id, configItem.productId));
                }
            }
        }
    }
}
