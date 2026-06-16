import type { SelectProduct } from "@/database/schema";
import type { ComponentRole } from "@/lib/configurator-data";
import type { TierSpecTargets, WorkloadRequirements } from "./requirements";
import type { TierPickMode } from "./tiers";

export interface ParsedSpecs {
    ramGb: number | null;
    storageGb: number | null;
    cpuCores: number | null;
    hasEcc: boolean;
}

export function categoryNameToRole(
    categoryName: string
): ComponentRole | null {
    const n = categoryName.trim().toLowerCase();

    if (n.includes("server")) return "server";
    if (
        n === "ram" ||
        n.startsWith("ram") ||
        n.includes("memory") ||
        n.includes("geheugen")
    ) {
        return "memory";
    }
    if (
        n.includes("ssd") ||
        n.includes("hdd") ||
        n.includes("nvme") ||
        n.includes("opslag") ||
        n.includes("storage") ||
        n.includes("uitbreidingskaart")
    ) {
        return "storage";
    }
    if (
        n.includes("cpu") ||
        n.includes("processor") ||
        n === "cpu's"
    ) {
        return "cpu";
    }

    const legacy: Record<string, ComponentRole> = {
        servers: "server",
        memory: "memory",
        storage: "storage",
        cpu: "cpu",
    };
    return legacy[n] ?? null;
}

export function parseProductSpecs(product: SelectProduct): ParsedSpecs {
    const text = `${product.name} ${product.configuration} ${product.description}`;

    let ramGb: number | null = null;
    const ramPatterns = [
        /(\d+)\s*GB\s*(?:RAM|DDR\d|ECC)/i,
        /(\d+)\s*GB\s*Kit/i,
        /(\d+)GB\s*RAM/i,
    ];
    for (const pattern of ramPatterns) {
        const m = text.match(pattern);
        if (m) {
            ramGb = parseInt(m[1], 10);
            break;
        }
    }

    let storageGb: number | null = null;
    const tbMatch = text.match(/(\d+(?:\.\d+)?)\s*TB/i);
    if (tbMatch) {
        storageGb = Math.round(parseFloat(tbMatch[1]) * 1024);
    } else {
        const gbMatch = text.match(/(\d+)\s*GB\s*(?:SSD|HDD|NVMe|storage)?/i);
        if (gbMatch) storageGb = parseInt(gbMatch[1], 10);
    }

    let cpuCores: number | null = null;
    const coreMatch = text.match(/(\d+)\s*(?:core|cores|kernen)/i);
    if (coreMatch) {
        cpuCores = parseInt(coreMatch[1], 10);
    } else if (/epyc|xeon platinum|7742|8280/i.test(text)) {
        cpuCores = 64;
    } else if (/xeon gold|epyc 7/i.test(text)) {
        cpuCores = 24;
    } else if (/xeon silver|ryzen 9|i9/i.test(text)) {
        cpuCores = 12;
    } else if (/ryzen 7|i7/i.test(text)) {
        cpuCores = 8;
    } else if (/ryzen 5|i5/i.test(text)) {
        cpuCores = 6;
    }

    const hasEcc = /ecc/i.test(text);

    return { ramGb, storageGb, cpuCores, hasEcc };
}

export function scoreCustomRequestMatch(
    product: SelectProduct,
    customRequest?: string
): number {
    if (!customRequest?.trim()) return 0;

    const text =
        `${product.name} ${product.configuration} ${product.description}`.toLowerCase();
    const terms = customRequest
        .toLowerCase()
        .split(/[\s,;.]+/)
        .filter((t) => t.length >= 3);

    let matches = 0;
    for (const term of terms) {
        if (text.includes(term)) matches += 1;
    }

    return Math.min(matches * 10, 50);
}

export function scoreProduct(
    product: SelectProduct,
    role: ComponentRole,
    reqs: WorkloadRequirements,
    maxUnitPrice: number,
    customRequest?: string
): number {
    if (product.price <= 0 || product.price > maxUnitPrice) {
        return -Infinity;
    }

    const specs = parseProductSpecs(product);
    let score = 0;

    if (role === "server") {
        if (specs.ramGb) {
            score +=
                specs.ramGb >= reqs.minRamGb
                    ? 40
                    : (specs.ramGb / reqs.minRamGb) * 25;
        } else {
            score += 10;
        }
        if (specs.storageGb) {
            score +=
                specs.storageGb >= reqs.minStorageGb
                    ? 25
                    : (specs.storageGb / reqs.minStorageGb) * 15;
        }
        if (specs.cpuCores) {
            score +=
                specs.cpuCores >= reqs.minCpuCores
                    ? 20
                    : (specs.cpuCores / reqs.minCpuCores) * 12;
        }
    }

    if (role === "memory" && specs.ramGb) {
        if (specs.ramGb >= reqs.minRamGb) {
            score += 55;
            const overshoot = specs.ramGb / reqs.minRamGb;
            if (overshoot > 2) score -= 12;
            if (overshoot > 4) score -= 25;
            if (overshoot > 8) score -= 40;
        } else {
            score += (specs.ramGb / reqs.minRamGb) * 35;
        }
        if (reqs.preferEcc && specs.hasEcc) score += 15;
    }

    if (role === "storage" && specs.storageGb) {
        score +=
            specs.storageGb >= reqs.minStorageGb
                ? 55
                : (specs.storageGb / reqs.minStorageGb) * 35;
    }

    if (role === "cpu" && specs.cpuCores) {
        score +=
            specs.cpuCores >= reqs.minCpuCores
                ? 55
                : (specs.cpuCores / reqs.minCpuCores) * 35;
    }

    score += (maxUnitPrice - product.price) / maxUnitPrice * 12;
    score += scoreCustomRequestMatch(product, customRequest);

    return score;
}

function scoreWithExtras(
    product: SelectProduct,
    role: ComponentRole,
    reqs: WorkloadRequirements,
    maxUnitPrice: number,
    customRequest?: string,
    customUseDescription?: string
): number {
    return (
        scoreProduct(product, role, reqs, maxUnitPrice, customRequest) +
        scoreCustomRequestMatch(product, customUseDescription)
    );
}

export function pickBestScored<T extends SelectProduct>(
    candidates: T[],
    role: ComponentRole,
    reqs: WorkloadRequirements,
    maxUnitPrice: number,
    customRequest?: string,
    customUseDescription?: string
): T | null {
    return pickProductForTier(
        candidates,
        role,
        reqs,
        maxUnitPrice,
        "normaal",
        customRequest,
        customUseDescription
    );
}

function pickClosestSpecModule<T extends SelectProduct>(
    candidates: T[],
    specGb: number,
    getGb: (p: SelectProduct) => number | null,
    maxUnitPrice: number,
    mode: TierPickMode,
    excludeProductIds?: ReadonlySet<number>
): T | null {
    if (maxUnitPrice <= 0 || specGb <= 0) return null;

    const pool = candidates.filter(
        (p) =>
            p.price > 0 &&
            p.price <= maxUnitPrice &&
            p.quantityInStock > 0 &&
            !excludeProductIds?.has(p.id)
    );

    const withSpec = pool
        .map((p) => ({ product: p, gb: getGb(p) }))
        .filter(
            (x): x is { product: T; gb: number } =>
                x.gb !== null && x.gb >= specGb
        );

    if (withSpec.length === 0) return null;

    const maxReasonable =
        mode === "duur"
            ? Math.max(specGb * 4, specGb + 48)
            : mode === "normaal"
              ? Math.max(specGb * 2.5, specGb + 32)
              : Math.max(specGb * 2, specGb + 16);

    const wellSized = withSpec.filter((x) => x.gb <= maxReasonable);
    const pickFrom = wellSized.length > 0 ? wellSized : withSpec;

    if (mode === "duur") {
        pickFrom.sort(
            (a, b) => b.gb - a.gb || b.product.price - a.product.price
        );
        return pickFrom[0].product;
    }

    if (mode === "budget") {
        pickFrom.sort(
            (a, b) => a.gb - b.gb || a.product.price - b.product.price
        );
        return pickFrom[0].product;
    }

    pickFrom.sort(
        (a, b) =>
            Math.abs(a.gb - specGb) - Math.abs(b.gb - specGb) ||
            a.gb - b.gb ||
            a.product.price - b.product.price
    );
    return pickFrom[0].product;
}

/** Kiest product per tier-strategie; sluit reeds gebruikte producten uit. */
export function pickProductForTier<T extends SelectProduct>(
    candidates: T[],
    role: ComponentRole,
    reqs: WorkloadRequirements,
    maxUnitPrice: number,
    mode: TierPickMode,
    customRequest?: string,
    customUseDescription?: string,
    excludeProductIds?: ReadonlySet<number>,
    specTargets?: TierSpecTargets
): T | null {
    if (candidates.length === 0 || maxUnitPrice <= 0) return null;

    const pool = candidates.filter(
        (p) =>
            p.price > 0 &&
            p.price <= maxUnitPrice &&
            !excludeProductIds?.has(p.id)
    );
    if (pool.length === 0) return null;

    const scored = pool
        .map((p) => ({
            product: p,
            score: scoreWithExtras(
                p,
                role,
                reqs,
                maxUnitPrice,
                customRequest,
                customUseDescription
            ),
        }))
        .filter((entry) => entry.score > -Infinity);

    if (scored.length === 0) return null;

    if (mode === "budget") {
        scored.sort((a, b) => a.product.price - b.product.price);
        return scored[0].product;
    }

    const ramTarget = specTargets?.ramGb ?? reqs.minRamGb;
    const storageTarget = specTargets?.storageGb ?? reqs.minStorageGb;
    const cpuTarget = specTargets?.cpuCores ?? reqs.minCpuCores;

    if (role === "memory") {
        const fit = pickClosestMemoryModule(
            pool,
            ramTarget,
            maxUnitPrice,
            excludeProductIds,
            mode
        );
        if (fit) return fit;
    }

    if (role === "storage") {
        const fit = pickClosestSpecModule(
            pool,
            storageTarget,
            (p) => parseProductSpecs(p).storageGb,
            maxUnitPrice,
            mode,
            excludeProductIds
        );
        if (fit) return fit;
    }

    if (role === "cpu") {
        const fit = pickClosestSpecModule(
            pool,
            cpuTarget,
            (p) => parseProductSpecs(p).cpuCores,
            maxUnitPrice,
            mode,
            excludeProductIds
        );
        if (fit) return fit;
    }

    if (mode === "duur") {
        scored.sort((a, b) => {
            const priceDiff = b.product.price - a.product.price;
            if (priceDiff !== 0) return priceDiff;
            return b.score - a.score;
        });
        return scored[0].product;
    }

    scored.sort((a, b) => b.score - a.score);
    return scored[0].product;
}

/**
 * Kleinste geheugenmodule die ≥ targetGb is (voorkomt 64GB-kit bij 5 websites).
 */
export function pickClosestMemoryModule<T extends SelectProduct>(
    candidates: T[],
    targetGb: number,
    maxUnitPrice: number,
    excludeProductIds?: ReadonlySet<number>,
    mode: TierPickMode = "normaal"
): T | null {
    if (maxUnitPrice <= 0 || targetGb <= 0) return null;

    const pool = candidates.filter(
        (p) =>
            p.price > 0 &&
            p.price <= maxUnitPrice &&
            p.quantityInStock > 0 &&
            !excludeProductIds?.has(p.id)
    );

    const withRam = pool
        .map((p) => ({ product: p, ramGb: parseProductSpecs(p).ramGb }))
        .filter(
            (x): x is { product: T; ramGb: number } =>
                x.ramGb !== null && x.ramGb >= targetGb
        );

    if (withRam.length === 0) return null;

    const maxReasonableGb =
        mode === "duur"
            ? Math.max(targetGb * 4, targetGb + 48)
            : mode === "normaal"
              ? Math.max(targetGb * 2.5, targetGb + 32)
              : Math.max(targetGb * 2, targetGb + 16);

    const wellSized = withRam.filter((x) => x.ramGb <= maxReasonableGb);
    const pickFrom = wellSized.length > 0 ? wellSized : withRam;

    if (mode === "duur") {
        pickFrom.sort(
            (a, b) =>
                b.ramGb - a.ramGb ||
                b.product.price - a.product.price
        );
        return pickFrom[0].product;
    }

    if (mode === "budget") {
        pickFrom.sort(
            (a, b) =>
                a.ramGb - b.ramGb ||
                a.product.price - b.product.price
        );
        return pickFrom[0].product;
    }

    pickFrom.sort(
        (a, b) =>
            Math.abs(a.ramGb - targetGb) - Math.abs(b.ramGb - targetGb) ||
            a.ramGb - b.ramGb ||
            a.product.price - b.product.price
    );
    return pickFrom[0].product;
}

/** Goedkoopste product in pool binnen prijslimiet (fallback als scoring niets vindt). */
export function pickCheapestInPool<T extends SelectProduct>(
    candidates: T[],
    maxUnitPrice: number,
    excludeProductIds?: ReadonlySet<number>
): T | null {
    if (maxUnitPrice <= 0) return null;

    const pool = candidates
        .filter(
            (p) =>
                p.price > 0 &&
                p.price <= maxUnitPrice &&
                p.quantityInStock > 0 &&
                !excludeProductIds?.has(p.id)
        )
        .sort((a, b) => a.price - b.price);

    return pool[0] ?? null;
}
