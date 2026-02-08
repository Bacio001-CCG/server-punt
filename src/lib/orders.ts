"use server";

import { db } from "@/database/connect";
import { ordersTable } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getOrderStatus(orderID: number) {
    const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, Number(orderID)));

    return order[0]?.status || null;
}
