import type { ConfiguratorInput, ConfiguratorOption } from "@/lib/configurator-data";
import { useCaseLabels } from "@/lib/configurator-data";
import { tierMeta } from "./tiers";
import type { CatalogProduct } from "./catalog";
import { getProductsByRole } from "./catalog";
import { clampAddonQuantity } from "./addon-compat";
import {
    buildCategoryIdRoleMap,
    finalizeServerAddons,
    getLinkedAddonsForServer,
    hasAllRequiredAddonRoles,
    REQUIRED_ADDON_ROLES,
} from "./linked-addons";
import {
    formatAiUseCaseContext,
    getWorkloadRequirements,
} from "./requirements";
import { parseProductSpecs } from "./scoring";
import { consumeAiRateLimitSlot } from "./ai-rate-limit";
import type { ConfiguratorSelection } from "./select";
import {
    selectionToTotalPrice,
    selectConfigurationHeuristic,
} from "./select";
import type { ComponentRole } from "@/lib/configurator-data";
type AiSelectionResponse = {
    serverProductId: number;
    serverQuantity?: number;
    addons: {
        productId: number;
        role: "memory" | "storage" | "cpu";
        quantity?: number;
    }[];
    reasoning?: string;
};

function formatProductLine(p: CatalogProduct): string {
    const specs = parseProductSpecs(p);
    return JSON.stringify({
        id: p.id,
        role: p.role,
        name: p.name,
        price: p.price,
        stock: p.quantityInStock,
        category: p.categoryName,
        configuration: p.configuration,
        ramGb: specs.ramGb,
        storageGb: specs.storageGb,
        cpuCores: specs.cpuCores,
    });
}

function orderServersForAi(
    servers: CatalogProduct[],
    tier: ConfiguratorOption["tier"]
): CatalogProduct[] {
    const sorted = [...servers].filter((s) => s.price > 0);
    if (tier === "budget") return sorted.sort((a, b) => a.price - b.price);
    if (tier === "duur") return sorted.sort((a, b) => b.price - a.price);
    return sorted.sort((a, b) => b.price - a.price);
}

async function buildAiCatalogContext(
    catalog: CatalogProduct[],
    tier: ConfiguratorOption["tier"],
    tierBudget: number,
    excludeProductIds: ReadonlySet<number>
): Promise<{ snapshot: string; productIndex: Map<number, CatalogProduct> }> {
    const productIndex = new Map<number, CatalogProduct>();
    for (const p of catalog) {
        if (!excludeProductIds.has(p.id)) {
            productIndex.set(p.id, p);
        }
    }

    const categoryIdToRole = buildCategoryIdRoleMap(catalog);
    const lines: string[] = [];

    const servers = orderServersForAi(
        getProductsByRole(catalog, "server").filter(
            (s) => !excludeProductIds.has(s.id)
        ),
        tier
    )
        .filter((s) => s.price <= tierBudget * 0.55)
        .slice(0, 10);

    lines.push(
        "\n## SERVERS MET COMPATIBELE UPGRADES (kies serverProductId uit deze lijst; addons uit de bijbehorende upgrades)"
    );

    for (const server of servers) {
        const linked = await getLinkedAddonsForServer(
            server.id,
            catalog,
            categoryIdToRole
        );
        for (const p of linked) {
            if (!excludeProductIds.has(p.id)) {
                productIndex.set(p.id, p);
            }
        }

        const upgrades: Record<string, number[]> = {
            memory: [],
            storage: [],
            cpu: [],
        };
        for (const p of linked) {
            if (p.role === "memory" || p.role === "storage" || p.role === "cpu") {
                upgrades[p.role].push(p.id);
            }
        }

        lines.push(
            JSON.stringify({
                serverProductId: server.id,
                name: server.name,
                price: server.price,
                stock: server.quantityInStock,
                configuration: server.configuration,
                compatibleUpgradeProductIds: upgrades,
            })
        );
    }

    for (const role of REQUIRED_ADDON_ROLES) {
        const seen = new Set<number>();
        const items: CatalogProduct[] = [];
        for (const p of productIndex.values()) {
            if (p.role !== role || seen.has(p.id)) continue;
            seen.add(p.id);
            items.push(p);
        }
        items.sort((a, b) => a.price - b.price);

        lines.push(`\n## ${role.toUpperCase()} — alle beschikbare IDs (${items.length})`);
        for (const p of items.slice(0, 40)) {
            lines.push(formatProductLine(p));
        }
    }

    const globalServers = getProductsByRole(catalog, "server")
        .filter((p) => !excludeProductIds.has(p.id))
        .sort((a, b) => a.price - b.price)
        .slice(0, 15);

    lines.push(`\n## OVERIGE SERVERS (${globalServers.length})`);
    for (const p of globalServers) {
        lines.push(formatProductLine(p));
    }

    return { snapshot: lines.join("\n"), productIndex };
}

function resolveAddonFromAi(
    addon: AiSelectionResponse["addons"][number],
    productIndex: Map<number, CatalogProduct>
): ConfiguratorSelection["addons"][number] | null {
    const product = productIndex.get(addon.productId);
    if (!product) return null;

    const role: ComponentRole =
        product.role === "memory" ||
        product.role === "storage" ||
        product.role === "cpu"
            ? product.role
            : addon.role;

    if (role !== "memory" && role !== "storage" && role !== "cpu") {
        return null;
    }

    return {
        product,
        quantity: clampAddonQuantity(product, addon.quantity ?? 1),
        role,
        categoryName: product.categoryName,
    };
}

export async function selectConfigurationWithAi(
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"],
    tierBudget: number,
    catalog: CatalogProduct[],
    excludeProductIds: ReadonlySet<number> = new Set()
): Promise<ConfiguratorSelection | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    if (!(await consumeAiRateLimitSlot())) {
        return null;
    }

    const reqs = getWorkloadRequirements(input, tier);
    const meta = tierMeta[tier];
    const filteredCatalog = catalog.filter(
        (p) => !excludeProductIds.has(p.id)
    );
    const { snapshot: catalogSnapshot, productIndex } =
        await buildAiCatalogContext(
            filteredCatalog,
            tier,
            tierBudget,
            excludeProductIds
        );

    const memoryCount = [...productIndex.values()].filter(
        (p) => p.role === "memory"
    ).length;
    if (memoryCount === 0) {
        console.warn(
            "AI configurator: geen geheugen in catalogus/linked — skip AI"
        );
        return null;
    }

    const excludedNote =
        excludeProductIds.size > 0
            ? `VERBODEN server-IDs (andere tier): ${[...excludeProductIds].join(", ")} — addons mogen groter/krachtiger zijn in deze tier.`
            : "";

    const tierGuidance =
        tier === "budget"
            ? "Kies de goedkoopste geschikte combinatie die nog aan de minima voldoet."
            : tier === "duur"
              ? "Kies de krachtigste/duurste geschikte combinatie binnen het tier-budget — andere producten dan budget/normaal."
              : "Kies een duidelijk andere middenklasse configuratie dan het budget-tier.";

    const useCaseContext = formatAiUseCaseContext(input, reqs, tier);

    const prompt = `Je bent een server-hardware adviseur voor ServerPunt (refurbished enterprise hardware).
Stel een VOLLEDIG pakket samen: 1 server + VERPLICHT geheugen (memory) + opslag (storage) + processor (cpu).
Upgrades staan vaak onder "compatibleUpgradeProductIds" bij een server — gebruik die IDs voor addons.

${useCaseContext}

${input.customUseDescription
            ? `AANVULLENDE SITUATIE KLANT (binnen bovenstaande categorie):
"${input.customUseDescription}"
`
            : ""
        }

Budget (excl. BTW): €${tierBudget}
Tier: ${meta.label} (${tier}) — ${tierGuidance}
${excludedNote}
Technische parameters: ${JSON.stringify(input.details)}
${reqs.serversNeeded === 1 ? `BELANGRIJK: serverQuantity = 1 (één fysieke server voor deze webhosting-schaal).` : `serverQuantity maximaal ${reqs.serversNeeded} (alleen meer bij HA of grote schaal).`}
${input.customRequest
            ? `VRIJE HARDWARE-WENSEN (binnen categorie ${useCaseLabels[input.useCase]}): "${input.customRequest}"`
            : ""
        }

CATALOGUS:
${catalogSnapshot}

Antwoord met JSON (geen markdown):
{
  "serverProductId": <id uit SERVERS MET COMPATIBELE UPGRADES>,
  "serverQuantity": <1 of meer, max voorraad>,
  "addons": [
    { "productId": <id>, "role": "memory", "quantity": <aantal kits/sticks, ≥1> },
    { "productId": <id>, "role": "storage", "quantity": <aantal schijven, ≥1> },
    { "productId": <id>, "role": "cpu", "quantity": <aantal processors, ≥1> }
  ],
  "reasoning": "2-4 zinnen Nederlands: leg uit waarom dit past bij ${useCaseLabels[input.useCase]} en de klantparameters"
}

Regels:
- De configuratie MOET passen bij workload-categorie "${useCaseLabels[input.useCase]}" — geen andere categorie.
- addons bevat PRECIES 3 items met roles memory, storage en cpu (verschillende productIds).
- ALLEEN addon productIds uit compatibleUpgradeProductIds van de gekozen server (compatibel met chassis).
- quantity per addon: minimaal 1, maximaal voorraad; meerdere sticks/schijven/CPU's toegestaan om RAM/opslag/cores te halen.
- Som (serverprijs × serverQuantity + Σ addonprijs × quantity) ≤ ${tierBudget}.`;

    try {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                    temperature: 0.35,
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: `Je bent een Nederlandse server-adviseur. Antwoord alleen met geldig JSON. Elke configuratie heeft exact 3 addons: memory, storage, cpu. De klant heeft workload-categorie "${useCaseLabels[input.useCase]}" gekozen — alle productkeuzes moeten daarbij passen.`,
                        },
                        { role: "user", content: prompt },
                    ],
                }),
            }
        );

        if (!response.ok) {
            console.error("OpenAI configurator error:", await response.text());
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content) as AiSelectionResponse;
        const serverProduct = productIndex.get(parsed.serverProductId);
        if (!serverProduct || serverProduct.role !== "server") {
            console.warn("AI configurator: ongeldige serverProductId");
            return null;
        }

        const requestedQty = Math.max(
            1,
            parsed.serverQuantity ?? reqs.serversNeeded
        );
        const serverQty = Math.min(
            requestedQty,
            reqs.serversNeeded,
            serverProduct.quantityInStock
        );

        const parsedAddons = (parsed.addons ?? [])
            .map((a) => resolveAddonFromAi(a, productIndex))
            .filter((a): a is NonNullable<typeof a> => a !== null);

        const missingBeforeFill = REQUIRED_ADDON_ROLES.filter(
            (role) => !parsedAddons.some((a) => a.role === role)
        );

        let addons = await finalizeServerAddons(
            serverProduct,
            serverQty,
            parsedAddons,
            input,
            tier,
            tierBudget,
            catalog,
            excludeProductIds
        );

        if (!hasAllRequiredAddonRoles(addons)) {
            console.warn(
                "AI configurator: onvolledige configuratie na aanvulling"
            );
            return null;
        }

        let reasoning = parsed.reasoning?.trim() ?? "";
        if (missingBeforeFill.length > 0) {
            const filled = missingBeforeFill.join(", ");
            reasoning += reasoning
                ? ` Ontbrekende of niet-compatibele onderdelen (${filled}) zijn aangevuld met server-compatibele upgrades.`
                : `Ontbrekende of niet-compatibele onderdelen (${filled}) zijn aangevuld met server-compatibele upgrades.`;
        }

        const multiQty = addons.filter((a) => a.quantity > 1);
        if (multiQty.length > 0) {
            const parts = multiQty.map(
                (a) => `${a.quantity}× ${a.role}`
            );
            reasoning += reasoning
                ? ` Aantallen: ${parts.join(", ")}.`
                : `Aantallen: ${parts.join(", ")}.`;
        }

        const selection: ConfiguratorSelection = {
            server: { product: serverProduct, quantity: serverQty },
            addons,
            totalPrice: 0,
            configurationSummary: "",
            method: "ai",
            aiReasoning: reasoning || undefined,
        };
        selection.totalPrice = selectionToTotalPrice(selection);

        if (selection.totalPrice > tierBudget) {
            console.warn(
                "AI selection over budget, falling back to heuristic"
            );
            return null;
        }

        const parts: string[] = [
            `${serverQty}× ${serverProduct.name}: ${serverProduct.configuration}`,
        ];
        for (const a of addons) {
            parts.push(
                `${a.quantity}× ${a.product.name} (${a.product.configuration})`
            );
        }
        selection.configurationSummary = parts.join(" · ");

        return selection;
    } catch (error) {
        console.error("AI configurator selection failed:", error);
        return null;
    }
}

export async function selectConfiguration(
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"],
    tierBudget: number,
    catalog: CatalogProduct[],
    excludeProductIds: ReadonlySet<number> = new Set()
): Promise<ConfiguratorSelection | null> {
    const aiSelection = await selectConfigurationWithAi(
        input,
        tier,
        tierBudget,
        catalog,
        excludeProductIds
    );
    if (aiSelection) return aiSelection;

    return selectConfigurationHeuristic(
        input,
        tier,
        tierBudget,
        catalog,
        excludeProductIds
    );
}
