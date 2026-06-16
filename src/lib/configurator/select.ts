import type { SelectProduct } from "@/database/schema";
import type {
    ComponentRole,
    ConfiguratorInput,
    ConfiguratorOption,
} from "@/lib/configurator-data";
import type { CatalogProduct } from "./catalog";
import { getProductsByRole } from "./catalog";
import { suggestedQuantityForAddon } from "./addon-compat";
import {
    buildCategoryIdRoleMap,
    getLinkedAddonsForServer,
    hasAllRequiredAddonRoles,
    REQUIRED_ADDON_ROLES,
} from "./linked-addons";
import {
    getTierSpecTargets,
    getWorkloadRequirements,
    type TierSpecTargets,
} from "./requirements";
import { pickCheapestInPool, pickProductForTier } from "./scoring";
import type { TierPickMode } from "./tiers";
import { tierToPickMode } from "./tiers";

export type ConfiguratorSelection = {
    server: { product: SelectProduct; quantity: number };
    addons: {
        product: SelectProduct;
        quantity: number;
        role: ComponentRole;
        categoryName: string;
    }[];
    totalPrice: number;
    configurationSummary: string;
    method: "heuristic" | "ai";
    aiReasoning?: string;
};

const MAX_SERVER_BUDGET_SHARE = 0.38;

function buildConfigurationSummary(
    server: SelectProduct,
    serverQty: number,
    addons: ConfiguratorSelection["addons"]
): string {
    const parts: string[] = [];
    parts.push(
        serverQty > 1
            ? `${serverQty}× ${server.name}: ${server.configuration}`
            : `${server.name}: ${server.configuration}`
    );

    for (const addon of addons) {
        parts.push(
            addon.quantity > 1
                ? `${addon.quantity}× ${addon.product.name} (${addon.product.configuration})`
                : `${addon.product.name} (${addon.product.configuration})`
        );
    }

    return parts.join(" · ");
}

function getCandidatePool(
    role: ComponentRole,
    catalog: CatalogProduct[],
    linkedPool: CatalogProduct[],
    excludeProductIds: ReadonlySet<number>,
    usedCategoryIds: Set<number>
): CatalogProduct[] {
    const linked = linkedPool.filter(
        (p) =>
            p.role === role &&
            p.quantityInStock > 0 &&
            !excludeProductIds.has(p.id)
    );
    if (linked.length > 0) return linked;

    return getProductsByRole(catalog, role).filter(
        (p) =>
            !usedCategoryIds.has(p.categoryId) &&
            !excludeProductIds.has(p.id) &&
            p.quantityInStock > 0
    );
}

function pickAddonForRole(
    role: ComponentRole,
    pool: CatalogProduct[],
    reqs: ReturnType<typeof getWorkloadRequirements>,
    specTargets: TierSpecTargets,
    maxSpend: number,
    pickMode: TierPickMode,
    input: ConfiguratorInput,
    excludeProductIds: ReadonlySet<number>
): CatalogProduct | null {
    if (maxSpend <= 0 || pool.length === 0) return null;

    return (
        pickProductForTier(
            pool,
            role,
            reqs,
            maxSpend,
            pickMode,
            input.customRequest,
            input.customUseDescription,
            excludeProductIds,
            specTargets
        ) ?? pickCheapestInPool(pool, maxSpend, excludeProductIds)
    );
}

async function buildAddonsForServer(
    server: CatalogProduct,
    serverQty: number,
    tierBudget: number,
    serverLineTotal: number,
    tier: ConfiguratorOption["tier"],
    catalog: CatalogProduct[],
    input: ConfiguratorInput,
    pickMode: TierPickMode,
    excludeProductIds: ReadonlySet<number>
): Promise<ConfiguratorSelection["addons"]> {
    const reqs = getWorkloadRequirements(input, tier);
    const specTargets = getTierSpecTargets(input, tier);
    let remaining = tierBudget - serverLineTotal;
    const addons: ConfiguratorSelection["addons"] = [];
    const categoryIdToRole = buildCategoryIdRoleMap(catalog);
    const linkedPool = await getLinkedAddonsForServer(
        server.id,
        catalog,
        categoryIdToRole
    );
    const usedCategoryIds = new Set<number>();

    const addonBudgetTotal = Math.max(remaining, tierBudget - serverLineTotal);
    const perRoleFloor = Math.floor(addonBudgetTotal / REQUIRED_ADDON_ROLES.length);

    for (const role of REQUIRED_ADDON_ROLES) {
        const pool = getCandidatePool(
            role,
            catalog,
            linkedPool,
            excludeProductIds,
            usedCategoryIds
        );

        let maxSpend = Math.max(perRoleFloor, Math.floor(remaining * 0.35));
        let addon = pickAddonForRole(
            role,
            pool,
            reqs,
            specTargets,
            maxSpend,
            pickMode,
            input,
            excludeProductIds
        );

        if (!addon && remaining > 0) {
            addon = pickCheapestInPool(pool, remaining, excludeProductIds);
        }

        if (!addon) continue;

        let qty = suggestedQuantityForAddon(
            role,
            addon,
            reqs,
            remaining,
            specTargets
        );

        if (qty < 1 && remaining >= addon.price) {
            qty = 1;
        }
        if (qty < 1) continue;

        let lineTotal = addon.price * qty;

        if (lineTotal > remaining && remaining > 0 && addons.length > 0) {
            const cheaper = pickCheapestInPool(pool, remaining, excludeProductIds);
            if (!cheaper) continue;
            addon = cheaper;
            qty = suggestedQuantityForAddon(
                role,
                addon,
                reqs,
                remaining,
                specTargets
            );
            if (qty < 1) qty = remaining >= addon.price ? 1 : 0;
            if (qty < 1) continue;
            lineTotal = addon.price * qty;
        }

        addons.push({
            product: addon,
            quantity: qty,
            role,
            categoryName: addon.categoryName,
        });
        usedCategoryIds.add(addon.categoryId);
        remaining -= addon.price * qty;
    }

    return addons;
}

function hasFullConfiguration(addons: ConfiguratorSelection["addons"]): boolean {
    return hasAllRequiredAddonRoles(addons);
}

function orderServersForTier(
    servers: CatalogProduct[],
    mode: TierPickMode
): CatalogProduct[] {
    const sorted = [...servers].filter((s) => s.price > 0);
    if (mode === "budget") {
        return sorted.sort((a, b) => a.price - b.price);
    }
    if (mode === "duur") {
        return sorted.sort((a, b) => b.price - a.price);
    }
    return sorted.sort((a, b) => b.price - a.price);
}

export async function selectConfigurationHeuristic(
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"],
    tierBudget: number,
    catalog: CatalogProduct[],
    excludeProductIds: ReadonlySet<number> = new Set()
): Promise<ConfiguratorSelection | null> {
    const pickMode = tierToPickMode(tier);
    const reqs = getWorkloadRequirements(input, tier);
    const servers = orderServersForTier(
        getProductsByRole(catalog, "server").filter(
            (p) => !excludeProductIds.has(p.id)
        ),
        pickMode
    );

    if (servers.length === 0) return null;

    const maxServerSpend = Math.floor(tierBudget * MAX_SERVER_BUDGET_SHARE);
    const candidates = servers.filter(
        (s) => s.price * reqs.serversNeeded <= maxServerSpend + tierBudget * 0.15
    );

    const tryOrder = candidates.length > 0 ? candidates : servers;

    for (const server of tryOrder) {
        const serverQty = Math.min(
            reqs.serversNeeded,
            Math.max(1, server.quantityInStock)
        );
        const serverLineTotal = server.price * serverQty;

        if (serverLineTotal >= tierBudget) continue;

        const addons = await buildAddonsForServer(
            server,
            serverQty,
            tierBudget,
            serverLineTotal,
            tier,
            catalog,
            input,
            pickMode,
            excludeProductIds
        );

        if (!hasFullConfiguration(addons)) continue;

        const totalPrice =
            serverLineTotal +
            addons.reduce((s, a) => s + a.product.price * a.quantity, 0);

        if (totalPrice > tierBudget) continue;

        return {
            server: { product: server, quantity: serverQty },
            addons,
            totalPrice,
            configurationSummary: buildConfigurationSummary(
                server,
                serverQty,
                addons
            ),
            method: "heuristic",
        };
    }

    const cheapestServer = pickCheapestInPool(
        servers,
        Math.floor(tierBudget * MAX_SERVER_BUDGET_SHARE),
        excludeProductIds
    );
    if (!cheapestServer) return null;

    const serverQty = 1;
    const serverLineTotal = cheapestServer.price * serverQty;
    let addons = await buildAddonsForServer(
        cheapestServer,
        serverQty,
        tierBudget,
        serverLineTotal,
        tier,
        catalog,
        input,
        "budget",
        excludeProductIds
    );

    for (const role of REQUIRED_ADDON_ROLES) {
        if (addons.some((a) => a.role === role)) continue;
        const pool = getCandidatePool(
            role,
            catalog,
            await getLinkedAddonsForServer(
                cheapestServer.id,
                catalog,
                buildCategoryIdRoleMap(catalog)
            ),
            excludeProductIds,
            new Set(addons.map((a) => a.product.categoryId))
        );
        const addon = pickCheapestInPool(
            pool,
            Math.max(1, tierBudget - serverLineTotal - addons.reduce((s, a) => s + a.product.price * a.quantity, 0)),
            excludeProductIds
        );
        if (addon) {
            addons.push({
                product: addon,
                quantity: 1,
                role,
                categoryName: addon.categoryName,
            });
        }
    }

    if (!hasFullConfiguration(addons)) return null;

    const totalPrice =
        serverLineTotal +
        addons.reduce((s, a) => s + a.product.price * a.quantity, 0);

    return {
        server: { product: cheapestServer, quantity: serverQty },
        addons,
        totalPrice,
        configurationSummary: buildConfigurationSummary(
            cheapestServer,
            serverQty,
            addons
        ),
        method: "heuristic",
    };
}

export function selectionToTotalPrice(selection: ConfiguratorSelection): number {
    return (
        selection.server.product.price * selection.server.quantity +
        selection.addons.reduce(
            (s, a) => s + a.product.price * a.quantity,
            0
        )
    );
}
