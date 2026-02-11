"use server";

import { db } from "@/database/connect";
import { productAnalyticsTable } from "@/database/schema";

export async function productAnalyticsRegistration(productId: number) {
    await db.insert(productAnalyticsTable).values({
        productId,
    });
}
