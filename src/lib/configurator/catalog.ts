import { db } from "@/database/connect";
import {
    categoriesTable,
    productsTable,
    SelectProduct,
} from "@/database/schema";
import type { ComponentRole } from "@/lib/configurator-data";
import { and, eq, ne } from "drizzle-orm";
import { categoryNameToRole } from "./scoring";

export type CatalogProduct = SelectProduct & {
    categoryName: string;
    role: ComponentRole;
};

export async function loadConfiguratorCatalog(): Promise<{
    products: CatalogProduct[];
    categoriesByName: Map<string, number>;
}> {
    const [categories, rows] = await Promise.all([
        db
            .select()
            .from(categoriesTable)
            .where(eq(categoriesTable.hidden, false)),
        db
            .select({
                product: productsTable,
                categoryName: categoriesTable.name,
            })
            .from(productsTable)
            .innerJoin(
                categoriesTable,
                eq(productsTable.categoryId, categoriesTable.id)
            )
            .where(
                and(
                    eq(productsTable.hidden, false),
                    eq(categoriesTable.hidden, false),
                    ne(productsTable.quantityInStock, 0)
                )
            ),
    ]);

    const categoriesByName = new Map(categories.map((c) => [c.name, c.id]));

    const products: CatalogProduct[] = [];
    for (const row of rows) {
        const role = categoryNameToRole(row.categoryName);
        if (!role) continue;
        products.push({
            ...row.product,
            categoryName: row.categoryName,
            role,
        });
    }

    return { products, categoriesByName };
}

export function getProductsByRole(
    catalog: CatalogProduct[],
    role: ComponentRole
): CatalogProduct[] {
    return catalog.filter((p) => p.role === role);
}
