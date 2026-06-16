import type { SelectProduct } from "@/database/schema";
import type {
    ComponentRole,
    ConfiguratorComponent,
    ConfiguratorOption,
} from "@/lib/configurator-data";

export type ConfiguratorCartPayload = {
    mainProduct: SelectProduct;
    mainQuantity: number;
    configuredItems: { product: SelectProduct; quantity: number }[];
    bundleLabel: string;
    lineItems: ConfiguratorComponent[];
    totalExclVat: number;
    totalInclVat: number;
};

/** Lijnen voor server action (alleen ids). */
export function optionToCartLines(option: ConfiguratorOption) {
    return option.components.map((c) => ({
        role: c.role as ComponentRole,
        productId: c.product.id,
        quantity: c.quantity,
    }));
}

export function optionToCartPayload(
    option: ConfiguratorOption
): ConfiguratorCartPayload | null {
    if (option.components.length === 0) return null;

    const serverComponent = option.components.find((c) => c.role === "server");
    if (!serverComponent) return null;

    const configuredItems = option.components
        .filter((c) => c.role !== "server")
        .map((c) => ({
            product: c.product,
            quantity: c.quantity,
        }));

    const totalExclVat = option.totalPrice;
    const totalInclVat = totalExclVat * 1.21;

    return {
        mainProduct: serverComponent.product,
        mainQuantity: serverComponent.quantity,
        configuredItems,
        bundleLabel: `ServerPunt ${option.label} configuratie`,
        lineItems: option.components,
        totalExclVat,
        totalInclVat,
    };
}

/**
 * Query voor productpagina: addons=productId:qty,productId:qty
 * Productpagina zoekt de bijbehorende linked_products-rij en selecteert die.
 */
export function buildServerProductHref(
    serverProductId: number,
    option: ConfiguratorOption
): string {
    const addonParts = option.components
        .filter((c) => c.role !== "server")
        .map((c) => `${c.product.id}:${c.quantity}`);

    if (addonParts.length === 0) {
        return `/product/${serverProductId}`;
    }

    return `/product/${serverProductId}?addons=${encodeURIComponent(addonParts.join(","))}`;
}

/** Parse ?addons= uit URL (productpagina). */
export function parseAddonsQueryParam(addonsParam: string | null): {
    productId: number;
    quantity: number;
}[] {
    if (!addonsParam?.trim()) return [];

    return addonsParam
        .split(",")
        .map((part) => {
            const [idStr, qtyStr] = part.split(":");
            const productId = parseInt(idStr, 10);
            const quantity = parseInt(qtyStr, 10) || 1;
            if (!productId || Number.isNaN(productId)) return null;
            return { productId, quantity };
        })
        .filter((x): x is { productId: number; quantity: number } => x !== null);
}
