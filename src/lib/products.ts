"use server";
import { db } from "@/database/connect";
import { productsTable, SelectProduct } from "@/database/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";

const getProductsSchema = z.object({
    limit: z.number().int().positive().optional(),
    offset: z.number().int().min(0).optional(),
});

const getProductSchema = z.object({
    id: z.number().int().positive("Product ID must be a positive integer"),
});

export async function getProducts(
    limit?: number,
    offset?: number
): Promise<{
    products: SelectProduct[];
    totalCount: number;
} | null> {
    try {
        const validatedParams = getProductsSchema.parse({ limit, offset });

        const [products, [{ value: totalCount }]] = await Promise.all([
            db
                .select()
                .from(productsTable)
                .limit(validatedParams.limit || 10)
                .offset(validatedParams.offset || 0),
            db.select({ value: count() }).from(productsTable),
        ]);

        return {
            products,
            totalCount,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation error in getProducts:", error.issues);
        } else {
            console.error("Failed to fetch products:", error);
        }
        return null;
    }
}

export async function getProduct(id: number): Promise<SelectProduct | null> {
    try {
        // Validate the ID parameter
        const { id: validatedId } = getProductSchema.parse({ id });

        const [product] = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, validatedId));

        return product || null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Invalid product ID:", error.issues);
            throw new Error("Invalid product ID provided");
        } else {
            console.error("Failed to fetch product:", error);
            throw new Error("Failed to fetch product");
        }
    }
}
