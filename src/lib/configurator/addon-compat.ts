import type { SelectProduct } from "@/database/schema";
import type { ComponentRole } from "@/lib/configurator-data";
import type { CatalogProduct } from "./catalog";
import type { ConfiguratorAddonLine } from "./linked-addons";
import { parseProductSpecs } from "./scoring";
import type {
    TierSpecTargets,
    WorkloadRequirements,
} from "./requirements";

export function linkedProductIds(linkedPool: CatalogProduct[]): Set<number> {
    return new Set(linkedPool.map((p) => p.id));
}

/** Addon moet in linked_products van de server staan als die lijst niet leeg is. */
export function isAddonCompatibleWithServer(
    productId: number,
    role: ComponentRole,
    linkedPool: CatalogProduct[]
): boolean {
    const linkedForRole = linkedPool.filter((p) => p.role === role);
    if (linkedForRole.length === 0) return true;
    return linkedForRole.some((p) => p.id === productId);
}

export function clampAddonQuantity(
    product: SelectProduct,
    requested: number
): number {
    const stock = Math.max(0, product.quantityInStock);
    if (stock === 0) return 0;
    return Math.min(Math.max(1, Math.floor(requested)), stock);
}

/**
 * Hoeveel stuks nodig om workload-minima te halen (RAM/CPU/opslag per stuk).
 */
export function suggestedQuantityForAddon(
    role: ComponentRole,
    product: SelectProduct,
    reqs: WorkloadRequirements,
    remainingBudget: number,
    specTargets?: TierSpecTargets
): number {
    if (product.price <= 0 || product.quantityInStock <= 0) return 0;

    const targets = specTargets ?? {
        ramGb: reqs.minRamGb,
        storageGb: reqs.minStorageGb,
        cpuCores: reqs.minCpuCores,
    };

    const specs = parseProductSpecs(product);
    let needed = 1;

    if (role === "memory" && specs.ramGb && specs.ramGb > 0) {
        needed = Math.ceil(targets.ramGb / specs.ramGb);
    } else if (role === "cpu" && specs.cpuCores && specs.cpuCores > 0) {
        needed = Math.ceil(targets.cpuCores / specs.cpuCores);
    } else if (role === "storage" && specs.storageGb && specs.storageGb > 0) {
        needed = Math.ceil(targets.storageGb / specs.storageGb);
    }

    const maxByBudget =
        remainingBudget > 0
            ? Math.floor(remainingBudget / product.price)
            : 0;

    if (maxByBudget < 1) return 0;

    return clampAddonQuantity(
        product,
        Math.min(needed, maxByBudget)
    );
}

export function mergeAddonsByRole(
    addons: ConfiguratorAddonLine[]
): ConfiguratorAddonLine[] {
    const byRole = new Map<ComponentRole, ConfiguratorAddonLine>();
    for (const addon of addons) {
        const existing = byRole.get(addon.role);
        if (!existing) {
            byRole.set(addon.role, addon);
            continue;
        }
        if (addon.product.id === existing.product.id) {
            byRole.set(addon.role, {
                ...existing,
                quantity: Math.max(existing.quantity, addon.quantity),
            });
        } else if (addon.quantity > existing.quantity) {
            byRole.set(addon.role, addon);
        }
    }
    return [...byRole.values()];
}

/** Verlaag aantallen (duurste regels eerst) tot het binnen budget past. */
export function fitAddonsToBudget(
    addons: ConfiguratorAddonLine[],
    serverLineTotal: number,
    tierBudget: number
): ConfiguratorAddonLine[] {
    const result = addons.map((a) => ({ ...a }));

    const total = () =>
        serverLineTotal +
        result.reduce((s, a) => s + a.product.price * a.quantity, 0);

    while (total() > tierBudget) {
        const reducible = result
            .filter((a) => a.quantity > 1)
            .sort(
                (a, b) =>
                    b.product.price * b.quantity - a.product.price * a.quantity
            );

        if (reducible.length === 0) {
            const any = result.sort(
                (a, b) => b.product.price - a.product.price
            )[0];
            if (!any || any.quantity <= 0) break;
            any.quantity = 0;
            break;
        }

        reducible[0].quantity -= 1;
    }

    return result.filter((a) => a.quantity > 0);
}

/**
 * Stel quantities in op basis van workload + budget; alleen compatibele regels.
 */
export function applyOptimalAddonQuantities(
    addons: ConfiguratorAddonLine[],
    reqs: WorkloadRequirements,
    serverLineTotal: number,
    tierBudget: number,
    options?: {
        keepHigherParsedQty?: boolean;
        specTargets?: TierSpecTargets;
    }
): ConfiguratorAddonLine[] {
    let remaining = tierBudget - serverLineTotal;
    const ordered = [...addons].sort((a, b) => {
        const order: ComponentRole[] = ["memory", "cpu", "storage"];
        return order.indexOf(a.role) - order.indexOf(b.role);
    });

    const scaled: ConfiguratorAddonLine[] = [];
    const keepHigher = options?.keepHigherParsedQty ?? true;

    for (const addon of ordered) {
        const suggested = suggestedQuantityForAddon(
            addon.role,
            addon.product,
            reqs,
            remaining,
            options?.specTargets
        );
        let qty = keepHigher
            ? clampAddonQuantity(
                  addon.product,
                  Math.max(addon.quantity, suggested)
              )
            : clampAddonQuantity(addon.product, suggested);

        if (qty < 1 && remaining >= addon.product.price) {
            qty = clampAddonQuantity(addon.product, 1);
        }
        if (qty < 1) continue;

        scaled.push({ ...addon, quantity: qty });
        remaining -= addon.product.price * qty;
    }

    return fitAddonsToBudget(scaled, serverLineTotal, tierBudget);
}

export function filterCompatibleAddons(
    addons: ConfiguratorAddonLine[],
    linkedPool: CatalogProduct[]
): ConfiguratorAddonLine[] {
    return addons.filter((a) =>
        isAddonCompatibleWithServer(a.product.id, a.role, linkedPool)
    );
}
