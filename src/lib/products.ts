"use server";
import { db } from "@/database/connect";
import { productsTable, SelectProduct } from "@/database/schema";

export async function getProducts(limit?: number): Promise<SelectProduct[]> {
    const products = await db.select().from(productsTable);
    return limit ? products.slice(0, limit) : products;
}
