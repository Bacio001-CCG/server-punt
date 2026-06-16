import type { SelectProduct } from "@/database/schema";
import type {
    ComponentRole,
    ConfiguratorInput,
    ConfiguratorOption,
} from "@/lib/configurator-data";
import { getProductLinkedItems } from "@/lib/products";
import type { CatalogProduct } from "./catalog";
import { getProductsByRole } from "./catalog";
import {
    getTierSpecTargets,
    getWorkloadRequirements,
} from "./requirements";
import {
    applyOptimalAddonQuantities,
    filterCompatibleAddons,
    mergeAddonsByRole,
    suggestedQuantityForAddon,
} from "./addon-compat";
import {
    categoryNameToRole,
    pickCheapestInPool,
    pickProductForTier,
} from "./scoring";
import { tierToPickMode } from "./tiers";

export type ConfiguratorAddonLine = {
    product: SelectProduct;
    quantity: number;
    role: ComponentRole;
    categoryName: string;
};

export const REQUIRED_ADDON_ROLES: ComponentRole[] = [
    "memory",
    "storage",
    "cpu",
];

export function buildCategoryIdRoleMap(
    catalog: CatalogProduct[]
): Map<number, ComponentRole> {
    const map = new Map<number, ComponentRole>();
    for (const p of catalog) {
        map.set(p.categoryId, p.role);
    }
    return map;
}

export async function getLinkedAddonsForServer(
    serverId: number,
    catalog: CatalogProduct[],
    categoryIdToRole: Map<number, ComponentRole>
): Promise<CatalogProduct[]> {
    const linked = await getProductLinkedItems(serverId);
    const result: CatalogProduct[] = [];

    for (const item of linked) {
        if (!item.product || item.product.quantityInStock <= 0) continue;

        const catalogMatch = catalog.find((p) => p.id === item.product!.id);
        const role =
            catalogMatch?.role ??
            categoryIdToRole.get(item.product.categoryId) ??
            categoryNameToRole(item.product.name);

        if (!role || role === "server") continue;

        if (catalogMatch) {
            result.push(catalogMatch);
        } else {
            result.push({
                ...item.product,
                categoryName: role.toUpperCase(),
                role,
            });
        }
    }

    return result;
}

export function hasAllRequiredAddonRoles(
    addons: ConfiguratorAddonLine[]
): boolean {
    return REQUIRED_ADDON_ROLES.every((role) =>
        addons.some((a) => a.role === role)
    );
}

/**
 * Vul ontbrekende memory/storage/cpu aan via gekoppelde producten van de server
 * (zelfde bron als de productpagina en heuristiek).
 */
export async function fillMissingAddonsForServer(
    server: CatalogProduct,
    serverQty: number,
    addons: ConfiguratorAddonLine[],
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"],
    tierBudget: number,
    catalog: CatalogProduct[],
    excludeProductIds: ReadonlySet<number>
): Promise<ConfiguratorAddonLine[]> {
    const missing = REQUIRED_ADDON_ROLES.filter(
        (role) => !addons.some((a) => a.role === role)
    );
    if (missing.length === 0) return addons;

    const pickMode = tierToPickMode(tier);
    const reqs = getWorkloadRequirements(input, tier);
    const specTargets = getTierSpecTargets(input, tier);
    const categoryIdToRole = buildCategoryIdRoleMap(catalog);
    const linkedPool = await getLinkedAddonsForServer(
        server.id,
        catalog,
        categoryIdToRole
    );

    let remaining =
        tierBudget -
        server.price * serverQty -
        addons.reduce((s, a) => s + a.product.price * a.quantity, 0);

    const usedCategoryIds = new Set(addons.map((a) => a.product.categoryId));
    const result = [...addons];

    for (const role of missing) {
        let pool = linkedPool.filter(
            (p) =>
                p.role === role &&
                p.quantityInStock > 0 &&
                !excludeProductIds.has(p.id) &&
                !usedCategoryIds.has(p.categoryId)
        );

        if (pool.length === 0) {
            pool = getProductsByRole(catalog, role).filter(
                (p) =>
                    !excludeProductIds.has(p.id) &&
                    !usedCategoryIds.has(p.categoryId) &&
                    p.quantityInStock > 0
            );
        }

        if (pool.length === 0) continue;

        const addon =
            pickProductForTier(
                pool,
                role,
                reqs,
                Math.max(remaining, 1),
                pickMode,
                input.customRequest,
                input.customUseDescription,
                excludeProductIds,
                specTargets
            ) ?? pickCheapestInPool(pool, Math.max(remaining, 1), excludeProductIds);

        if (!addon) continue;

        const qty = suggestedQuantityForAddon(
            role,
            addon,
            reqs,
            remaining,
            specTargets
        );
        if (qty < 1) continue;

        result.push({
            product: addon,
            quantity: qty,
            role,
            categoryName: addon.categoryName,
        });
        usedCategoryIds.add(addon.categoryId);
        remaining -= addon.price * qty;
    }

    return result;
}

/**
 * Compatibiliteit (linked_products), ontbrekende rollen en quantities afgestemd op workload/budget.
 */
export async function finalizeServerAddons(
    server: CatalogProduct,
    serverQty: number,
    addons: ConfiguratorAddonLine[],
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"],
    tierBudget: number,
    catalog: CatalogProduct[],
    excludeProductIds: ReadonlySet<number>
): Promise<ConfiguratorAddonLine[]> {
    const reqs = getWorkloadRequirements(input, tier);
    const specTargets = getTierSpecTargets(input, tier);
    const categoryIdToRole = buildCategoryIdRoleMap(catalog);
    const linkedPool = await getLinkedAddonsForServer(
        server.id,
        catalog,
        categoryIdToRole
    );

    let result = mergeAddonsByRole(addons);
    result = filterCompatibleAddons(result, linkedPool);

    result = await fillMissingAddonsForServer(
        server,
        serverQty,
        result,
        input,
        tier,
        tierBudget,
        catalog,
        excludeProductIds
    );

    const serverLineTotal = server.price * serverQty;
    result = applyOptimalAddonQuantities(
        result,
        reqs,
        serverLineTotal,
        tierBudget,
        { keepHigherParsedQty: true, specTargets }
    );

    return result;
}
