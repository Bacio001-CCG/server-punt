"use server";
import { db } from "@/database/connect";
import { productsTable, SelectProduct } from "@/database/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

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

export async function uploadImages(formData: FormData) {
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Ensure upload directory exists
    try {
        await import("fs").then((fs) =>
            fs.promises.mkdir(uploadDir, { recursive: true })
        );
    } catch (error) {
        // Directory might already exist
    }

    const imageUrls: string[] = [];
    let mainImageUrl = "";

    // Handle main image
    const mainImage = formData.get("image_url") as File;
    if (mainImage && mainImage.size > 0) {
        const bytes = await mainImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${randomUUID()}-${mainImage.name}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        mainImageUrl = `/uploads/${filename}`;
    }

    // Handle additional images
    const additionalImages = formData.getAll("images_url") as File[];
    for (const image of additionalImages) {
        if (image && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${randomUUID()}-${image.name}`;
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);
            imageUrls.push(`/uploads/${filename}`);
        }
    }

    return {
        mainImageUrl,
        additionalImageUrls: imageUrls,
    };
}

export async function createProduct(formData: FormData) {
    try {
        // Upload images first
        const { mainImageUrl, additionalImageUrls } = await uploadImages(
            formData
        );

        // Get other form data
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const categoryId = parseInt(formData.get("category") as string);
        const price = parseFloat(formData.get("price") as string);
        const configuration = formData.get("configuration") as string;

        // Insert into database (you'll need to add this based on your schema)
        console.log({
            name,
            description,
            categoryId,
            price,
            configuration,
            image_url: mainImageUrl,
            images_url: additionalImageUrls,
        });

        await db.insert(productsTable).values({
            categoryId,
            name,
            imageUrl: mainImageUrl,
            noneMainImagesUrl: JSON.stringify(additionalImageUrls),
            description,
            configuration,
            price: price,
        });

        return { success: true, product: null };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Failed to create product" };
    }
}
