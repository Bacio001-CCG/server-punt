"use server";

import {
    useCaseLabels,
    type ConfiguratorComponent,
    type ConfiguratorInput,
    type ConfiguratorOption,
    type ConfiguratorResult,
    type ComponentRole,
} from "@/lib/configurator-data";
import { loadConfiguratorCatalog } from "@/lib/configurator/catalog";
import { selectConfiguration } from "@/lib/configurator/ai-select";
import {
    resetAiRateLimitRequestFlag,
    wasAiRateLimitedThisRequest,
} from "@/lib/configurator/ai-rate-limit";
import { prepareConfiguratorInput } from "@/lib/configurator/infer-use-case";
import {
    getTierSpecTargets,
    getWorkloadRequirements,
} from "@/lib/configurator/requirements";
import type { ConfiguratorSelection } from "@/lib/configurator/select";
import {
    CONFIGURATOR_TIERS,
    configFingerprint,
    tierMeta,
    type ConfiguratorTier,
} from "@/lib/configurator/tiers";
import { truncateText } from "@/lib/format-text";
import { z } from "zod";
import { useCases } from "@/lib/configurator-data";

export type {
    ConfiguratorComponent,
    ConfiguratorInput,
    ConfiguratorOption,
    ConfiguratorResult,
} from "@/lib/configurator-data";

const configuratorInputSchema = z.object({
    useCase: z.enum(useCases),
    selectedUseCase: z.enum(useCases).optional(),
    budgetMax: z.number().positive().max(10_000_000),
    customUseDescription: z
        .string()
        .max(2000)
        .optional()
        .transform((v) => {
            const trimmed = v?.trim();
            return trimmed && trimmed.length > 0 ? trimmed : undefined;
        }),
    customRequest: z
        .string()
        .max(1500)
        .optional()
        .transform((v) => {
            const trimmed = v?.trim();
            return trimmed && trimmed.length > 0 ? trimmed : undefined;
        }),
    details: z.object({
        vmCount: z.number().int().min(1).max(500).optional(),
        siteCount: z.number().int().min(1).max(10_000).optional(),
        trafficLevel: z.enum(["low", "medium", "high"]).optional(),
        databaseSizeGb: z.number().int().min(1).max(1_000_000).optional(),
        storageTb: z.number().min(0.5).max(10_000).optional(),
        developerCount: z.number().int().min(1).max(500).optional(),
        highAvailability: z.boolean().optional(),
    }),
});

const roleLabels: Record<ComponentRole, string> = {
    server: "Server(s)",
    memory: "Geheugen",
    storage: "Opslag",
    cpu: "Processors",
};

function selectionToComponents(
    selection: ConfiguratorSelection
): ConfiguratorComponent[] {
    const components: ConfiguratorComponent[] = [
        {
            role: "server",
            roleLabel: roleLabels.server,
            product: selection.server.product,
            quantity: selection.server.quantity,
            categoryName: "Servers",
            lineTotal:
                selection.server.product.price * selection.server.quantity,
        },
    ];

    for (const addon of selection.addons) {
        components.push({
            role: addon.role,
            roleLabel: roleLabels[addon.role],
            product: addon.product,
            quantity: addon.quantity,
            categoryName: addon.categoryName,
            lineTotal: addon.product.price * addon.quantity,
        });
    }

    return components;
}

/** Alleen servers uitsparen tussen tiers — RAM/CPU/opslag mogen per tier opschalen. */
function collectServerProductIds(components: ConfiguratorComponent[]): number[] {
    return components
        .filter((c) => c.role === "server")
        .map((c) => c.product.id);
}

async function buildOption(
    tier: ConfiguratorTier,
    input: ConfiguratorInput,
    catalog: Awaited<ReturnType<typeof loadConfiguratorCatalog>>["products"],
    excludeProductIds: ReadonlySet<number>
): Promise<ConfiguratorOption | null> {
    const meta = tierMeta[tier];
    const tierBudget = Math.floor(input.budgetMax * meta.budgetFactor);

    const selection = await selectConfiguration(
        input,
        tier,
        tierBudget,
        catalog,
        excludeProductIds
    );

    if (!selection) return null;

    const components = selectionToComponents(selection);
    const totalPrice = selection.totalPrice;
    const withinBudget = totalPrice <= input.budgetMax;
    const addonCount = selection.addons.length;
    const reqs = getWorkloadRequirements(input, tier);

    const highlights = [
        selection.method === "ai"
            ? "AI-advies uit ons aanbod"
            : `${meta.label} tier`,
        `${addonCount} upgrade${addonCount === 1 ? "" : "s"}`,
        `€${totalPrice.toLocaleString("nl-NL")} excl. BTW`,
        withinBudget ? "Binnen budget" : "Net boven budget",
        (() => {
            const t = getTierSpecTargets(input, tier);
            return `Doel ${tier}: ~${t.ramGb} GB RAM · ~${t.storageGb} GB opslag`;
        })(),
    ];

    if (selection.aiReasoning) {
        highlights.push(truncateText(selection.aiReasoning, 90));
    }

    return {
        tier,
        label: meta.label,
        description: meta.description,
        budgetUsedPercent: Math.round((totalPrice / input.budgetMax) * 100),
        totalPrice,
        withinBudget,
        components,
        configurationSummary: truncateText(
            selection.configurationSummary,
            160
        ),
        selectionMethod: selection.method,
        highlights,
    };
}

function buildRequirements(
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"]
): string[] {
    const reqs = getWorkloadRequirements(input, tier);
    const lines = [...reqs.summary];

    if (input.useCase === "virtualization" && input.details.vmCount) {
        lines.unshift(`${input.details.vmCount} virtuele machine(s) gepland`);
    }

    if (input.useCase === "webhosting" && input.details.siteCount) {
        lines.unshift(
            `Webhosting: ${input.details.siteCount} site(s), verkeer ${input.details.trafficLevel ?? "medium"}`
        );
    }

    if (input.customUseDescription) {
        lines.push(`Gebruik: ${truncateText(input.customUseDescription, 80)}`);
    }

    if (input.customRequest) {
        lines.push(`Wens: ${truncateText(input.customRequest, 80)}`);
    }

    return lines.length > 0
        ? lines
        : ["Standaard workload zonder extra eisen"];
}

export async function getConfiguratorRecommendations(
    rawInput: ConfiguratorInput
): Promise<ConfiguratorResult | null> {
    try {
        resetAiRateLimitRequestFlag();
        const parsed = configuratorInputSchema.parse(rawInput);
        const input = prepareConfiguratorInput(parsed);
        const { products: catalog } = await loadConfiguratorCatalog();

        if (catalog.filter((p) => p.role === "server").length === 0) {
            return null;
        }

        const usedProductIds = new Set<number>();
        const seenFingerprints = new Set<string>();
        const options: ConfiguratorOption[] = [];

        for (const tier of CONFIGURATOR_TIERS) {
            let option = await buildOption(
                tier,
                input,
                catalog,
                usedProductIds
            );

            if (option) {
                const fp = configFingerprint(option.components);
                if (seenFingerprints.has(fp) && tier === "duur") {
                    const strictExclude = new Set(usedProductIds);
                    for (const id of collectServerProductIds(option.components)) {
                        strictExclude.add(id);
                    }
                    option = await buildOption(
                        tier,
                        input,
                        catalog,
                        strictExclude
                    );
                }

                if (option) {
                    const fingerprint = configFingerprint(option.components);
                    if (!seenFingerprints.has(fingerprint)) {
                        seenFingerprints.add(fingerprint);
                        for (const id of collectServerProductIds(
                            option.components
                        )) {
                            usedProductIds.add(id);
                        }
                        options.push(option);
                    }
                }
            }
        }

        if (options.length === 0) {
            return null;
        }

        const aiAssisted = options.some((o) => o.selectionMethod === "ai");
        let summary = aiAssisted
            ? `Op basis van ${useCaseLabels[input.useCase]} en een budget tot €${input.budgetMax.toLocaleString("nl-NL")} heeft onze AI ${options.length} verschillende configuraties samengesteld: Budget, Normaal en Duur.`
            : `Op basis van ${useCaseLabels[input.useCase]} en een budget tot €${input.budgetMax.toLocaleString("nl-NL")} hebben we ${options.length} verschillende configuraties samengesteld (Budget, Normaal, Duur).`;

        if (input.customRequest && !aiAssisted) {
            summary +=
                " Uw aanvullende wensen zijn meegenomen bij de productselectie.";
        }
        if (input.customRequest && aiAssisted) {
            summary += " Uw vrije wensen zijn door de AI meegenomen.";
        }

        const aiRateLimited = wasAiRateLimitedThisRequest();

        return {
            useCase: input.useCase,
            summary,
            requirements: buildRequirements(input, "normaal"),
            options,
            aiAssisted,
            aiRateLimited: aiRateLimited || undefined,
            customUseDescription: input.customUseDescription,
            customRequest: input.customRequest,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Configurator validation error:", error.issues);
        } else {
            console.error("Configurator recommendations failed:", error);
        }
        return null;
    }
}
