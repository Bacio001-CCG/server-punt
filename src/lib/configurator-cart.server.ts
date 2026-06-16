"use server";

import { getProduct } from "@/lib/products";
import type { ComponentRole } from "@/lib/configurator-data";
import type { SelectProduct } from "@/database/schema";

export type ConfiguratorCartLineInput = {
    role: ComponentRole;
    productId: number;
    quantity: number;
};

export type ResolvedConfiguratorCart = {
    mainProduct: SelectProduct;
    mainQuantity: number;
    configuredItems: { product: SelectProduct; quantity: number }[];
    bundleLabel: string;
};

/**
 * Zelfde model als productpagina: server = hoofdproduct,
 * overige onderdelen = configuredItems (vers uit DB geladen).
 */
export async function resolveConfiguratorForCart(
    lines: ConfiguratorCartLineInput[],
    bundleLabel: string
): Promise<ResolvedConfiguratorCart | null> {
    if (lines.length === 0) return null;

    const serverLine = lines.find((l) => l.role === "server");
    if (!serverLine) return null;

    const mainProduct = await getProduct(serverLine.productId, true);

    if (!mainProduct || mainProduct.quantityInStock <= 0) {
        return null;
    }

    const configuredItems: ResolvedConfiguratorCart["configuredItems"] = [];

    for (const line of lines) {
        if (line.role === "server") continue;

        const product = await getProduct(line.productId, true);
        if (!product || product.quantityInStock <= 0) {
            continue;
        }

        configuredItems.push({
            product,
            quantity: Math.min(line.quantity, product.quantityInStock),
        });
    }

    return {
        mainProduct,
        mainQuantity: Math.min(
            serverLine.quantity,
            mainProduct.quantityInStock
        ),
        configuredItems,
        bundleLabel,
    };
}
