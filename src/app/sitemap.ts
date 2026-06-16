import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/database/connect";
import { productsTable } from "@/database/schema";
import { locales } from "@/i18n/locales";
import { buildAbsoluteLocaleUrl } from "@/lib/seo";

const STATIC_PATHS = [
    "",
    "products",
    "configurator",
    "about-us",
    "privacy",
    "cookie",
    "tos",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const productRows = await db
        .select({ id: productsTable.id, createdAt: productsTable.createdAt })
        .from(productsTable)
        .where(eq(productsTable.hidden, false));

    const entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        for (const path of STATIC_PATHS) {
            entries.push({
                url: buildAbsoluteLocaleUrl(locale, path),
                lastModified: new Date(),
                changeFrequency: path === "" ? "daily" : "weekly",
                priority: path === "" ? 1 : path === "products" ? 0.9 : 0.8,
            });
        }

        for (const product of productRows) {
            entries.push({
                url: buildAbsoluteLocaleUrl(
                    locale,
                    `product/${product.id}`
                ),
                lastModified: product.createdAt ?? new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
            });
        }
    }

    return entries;
}
