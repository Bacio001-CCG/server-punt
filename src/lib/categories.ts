"use server";
import { db } from "@/database/connect";
import { categoriesTable, SelectCategory } from "@/database/schema";

export async function getCategories(): Promise<SelectCategory[]> {
    const categories = await db.select().from(categoriesTable);
    return categories;
}
