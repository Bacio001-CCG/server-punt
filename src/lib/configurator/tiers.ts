import type { ConfiguratorOption } from "@/lib/configurator-data";

export const CONFIGURATOR_TIERS = ["budget", "normaal", "duur"] as const;

export type ConfiguratorTier = (typeof CONFIGURATOR_TIERS)[number];

export type TierPickMode = "budget" | "normaal" | "duur";

export const tierMeta: Record<
    ConfiguratorTier,
    {
        label: string;
        description: string;
        budgetFactor: number;
        pickMode: TierPickMode;
        recommended?: boolean;
    }
> = {
    budget: {
        label: "Budget",
        description:
            "Essentiële configuratie — lagere kosten, voldoende voor lichte workloads.",
        budgetFactor: 0.42,
        pickMode: "budget",
    },
    normaal: {
        label: "Normaal",
        description:
            "Gebalanceerde setup — andere server en onderdelen, passend bij de meeste use-cases.",
        budgetFactor: 0.68,
        pickMode: "normaal",
        recommended: true,
    },
    duur: {
        label: "Duur",
        description:
            "Premium configuratie — krachtigere hardware en ruimere specs binnen uw maximumbudget.",
        budgetFactor: 0.92,
        pickMode: "duur",
    },
};

export function tierToPickMode(tier: ConfiguratorTier): TierPickMode {
    return tierMeta[tier].pickMode;
}

export function configFingerprint(
    components: ConfiguratorOption["components"]
): string {
    return [...components]
        .map((c) => `${c.role}:${c.product.id}:${c.quantity}`)
        .sort()
        .join("|");
}
