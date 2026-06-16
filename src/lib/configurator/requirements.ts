import type {
    ConfiguratorDetails,
    ConfiguratorInput,
    ConfiguratorOption,
    UseCase,
} from "@/lib/configurator-data";
import {
    useCaseDescriptions,
    useCaseLabels,
} from "@/lib/configurator-data";
import { tierMeta } from "./tiers";

export interface WorkloadRequirements {
    minRamGb: number;
    minStorageGb: number;
    minCpuCores: number;
    preferEcc: boolean;
    serversNeeded: number;
    summary: string[];
}

/** Doel-specs per tier — duur > normaal > budget. */
export type TierSpecTargets = {
    ramGb: number;
    storageGb: number;
    cpuCores: number;
};

const tierSpecMultipliers: Record<
    ConfiguratorOption["tier"],
    { ram: number; storage: number; cpu: number }
> = {
    budget: { ram: 1, storage: 1, cpu: 1 },
    normaal: { ram: 1.35, storage: 1.3, cpu: 1.25 },
    duur: { ram: 1.85, storage: 1.65, cpu: 1.55 },
};

export function getTierSpecTargets(
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"]
): TierSpecTargets {
    const reqs = getWorkloadRequirements(input, tier);
    const mult = tierSpecMultipliers[tier];
    return {
        ramGb: Math.round(reqs.minRamGb * mult.ram),
        storageGb: Math.round(reqs.minStorageGb * mult.storage),
        cpuCores: Math.round(reqs.minCpuCores * mult.cpu),
    };
}

const tierScale = {
    budget: 0.65,
    normaal: 1,
    duur: 1.45,
} as const;

const useCaseAiGuidance: Record<UseCase, string> = {
    virtualization:
        "Kies een server met voldoende cores/RAM voor meerdere VM's; geheugen en CPU-upgrades zijn cruciaal; opslag voor VM-disks (SSD bij voorkeur).",
    webhosting:
        "Kies een general-purpose server; RAM schaalt met aantal sites (klein aantal sites = vaak 8–16 GB totaal, niet 64 GB tenzij expliciet gevraagd). Snelle SSD, CPU passend bij verkeer.",
    database:
        "Prioriteit RAM en snelle/redundante opslag; ECC-geheugen heeft voorkeur; CPU met voldoende cores voor queries.",
    storage:
        "Prioriteit maximale opslagcapaciteit; server en HDD/SSD-upgrades met hoge TB; RAM secundair.",
    development:
        "Balans RAM en CPU voor build/CI en containers; voldoende opslag voor repo's en images.",
    general:
        "Allround bedrijfsserver: evenwicht RAM, opslag en CPU zonder extreme specialisatie.",
};

export function normalizeDetailsForUseCase(
    useCase: UseCase,
    details: ConfiguratorDetails
): ConfiguratorDetails {
    const d = { ...details };

    switch (useCase) {
        case "virtualization":
            d.vmCount ??= 4;
            break;
        case "webhosting":
            d.siteCount ??= 5;
            d.trafficLevel ??= "medium";
            break;
        case "database":
            d.databaseSizeGb ??= 200;
            break;
        case "storage":
            d.storageTb ??= 4;
            break;
        case "development":
            d.developerCount ??= 3;
            break;
        default:
            break;
    }

    return d;
}

export function getUseCaseAiGuidance(useCase: UseCase): string {
    return useCaseAiGuidance[useCase];
}

export function formatAiUseCaseContext(
    input: ConfiguratorInput,
    reqs: WorkloadRequirements,
    tier?: ConfiguratorOption["tier"]
): string {
    const lines = [
        `PRIMAIRE WORKLOAD-CATEGORIE (VERPLICHT — configuratie moet hierop zijn afgestemd): ${useCaseLabels[input.useCase]}`,
        useCaseDescriptions[input.useCase],
        "",
        "Sizing voor deze categorie:",
        ...reqs.summary.map((s) => `- ${s}`),
        `- Minimaal ${reqs.minRamGb} GB RAM, ${reqs.minStorageGb} GB opslag, ${reqs.minCpuCores} CPU-cores`,
    ];

    if (tier) {
        const t = getTierSpecTargets(input, tier);
        lines.push(
            `- Tier-doel (${tierMeta[tier].label}): ~${t.ramGb} GB RAM, ~${t.storageGb} GB opslag, ~${t.cpuCores} CPU-cores`
        );
    }

    if (reqs.serversNeeded > 1) {
        const reason = input.details.highAvailability
            ? "hoge beschikbaarheid (HA)"
            : "schaal van de workload";
        lines.push(`- ${reqs.serversNeeded} fysieke server(s) (${reason})`);
    } else if (input.useCase === "webhosting") {
        lines.push("- 1 server (standaard voor deze schaal)");
    }
    if (reqs.preferEcc) {
        lines.push("- Voorkeur ECC-geheugen waar beschikbaar");
    }

    lines.push(
        "",
        "Productkeuze-advies:",
        getUseCaseAiGuidance(input.useCase),
        "",
        "Vrije tekst van de klant verfijnt alleen binnen deze categorie — wijzig het workload-type niet."
    );

    return lines.join("\n");
}

export function estimateServersNeeded(
    useCase: UseCase,
    details: ConfiguratorInput["details"],
    tier: ConfiguratorOption["tier"]
): number {
    const haMultiplier = details.highAvailability ? 2 : 1;
    const tierCapacity = { budget: 4, normaal: 8, duur: 16 }[tier];

    if (useCase === "virtualization" && details.vmCount) {
        return Math.max(
            1,
            Math.ceil(details.vmCount / tierCapacity) * haMultiplier
        );
    }

    if (useCase === "webhosting") {
        const sites = details.siteCount ?? 1;
        const traffic = details.trafficLevel ?? "medium";
        // Eén server is normaal voor kleine/middelgrote hosting; tweede pas bij echte schaal
        let base = 1;
        if (sites > 50) {
            base = 2;
        } else if (sites > 25 && traffic === "high") {
            base = 2;
        }
        return base * haMultiplier;
    }

    if (useCase === "database") {
        const size = details.databaseSizeGb ?? 50;
        const base = size > 2000 ? 2 : size > 500 ? 1 : 1;
        return base * haMultiplier;
    }

    if (useCase === "development") {
        const devs = details.developerCount ?? 1;
        return Math.max(1, Math.ceil(devs / (tierCapacity / 2)));
    }

    return haMultiplier;
}

export function getWorkloadRequirements(
    input: ConfiguratorInput,
    tier: ConfiguratorOption["tier"]
): WorkloadRequirements {
    const scale = tierScale[tier];
    const d = input.details;
    let minRamGb = 16;
    let minStorageGb = 256;
    let minCpuCores = 4;
    const summary: string[] = [];

    switch (input.useCase) {
        case "virtualization": {
            const vms = d.vmCount ?? 4;
            minRamGb = Math.max(16, Math.round(vms * 4 * scale));
            minStorageGb = Math.max(256, Math.round(vms * 50 * scale));
            minCpuCores = Math.max(4, Math.round((vms / 2) * scale));
            summary.push(`≥${minRamGb} GB RAM voor ${vms} VM's`);
            summary.push(`≥${minStorageGb} GB opslag`);
            break;
        }
        case "webhosting": {
            const sites = d.siteCount ?? 5;
            const traffic = d.trafficLevel ?? "medium";
            const ramPerSite =
                traffic === "high" ? 2 : traffic === "medium" ? 1.25 : 0.75;
            const rawRam = sites * ramPerSite * scale;
            const maxRamForSites =
                sites <= 5 ? 24 : sites <= 20 ? 48 : sites <= 50 ? 96 : 128;
            minRamGb = Math.round(
                Math.max(8, Math.min(maxRamForSites, rawRam))
            );
            minStorageGb = Math.round(
                Math.max(64, Math.min(2048, sites * 12 * scale))
            );
            minCpuCores = Math.round(
                Math.max(
                    2,
                    Math.min(16, Math.ceil(sites / 8) * scale * (traffic === "high" ? 1.5 : 1))
                )
            );
            summary.push(
                `Webhosting: ${sites} sites, ${traffic} verkeer — richt ~${minRamGb} GB RAM`
            );
            break;
        }
        case "database": {
            const dbGb = d.databaseSizeGb ?? 200;
            minRamGb = Math.round(Math.max(32, dbGb * 0.15 * scale));
            minStorageGb = Math.round(Math.max(dbGb * 1.5, 500 * scale));
            minCpuCores = Math.round(Math.max(4, dbGb / 200 * scale));
            summary.push(`Database-werkset ~${dbGb} GB`);
            break;
        }
        case "storage": {
            const tb = d.storageTb ?? 4;
            minRamGb = Math.round(Math.max(8, 8 * scale));
            minStorageGb = Math.round(tb * 1024 * 0.8);
            minCpuCores = Math.round(Math.max(2, 2 * scale));
            summary.push(`Opslagdoel ~${tb} TB`);
            break;
        }
        case "development": {
            const devs = d.developerCount ?? 3;
            minRamGb = Math.round(Math.max(16, devs * 8 * scale));
            minStorageGb = Math.round(Math.max(256, devs * 80 * scale));
            minCpuCores = Math.round(Math.max(4, devs * 2 * scale));
            summary.push(`${devs} dev-omgeving(en)`);
            break;
        }
        default:
            minRamGb = Math.round(32 * scale);
            minStorageGb = Math.round(512 * scale);
            minCpuCores = Math.round(6 * scale);
    }

    const preferEcc =
        input.useCase === "database" ||
        input.useCase === "virtualization" ||
        input.useCase === "general";

    const serversNeeded = estimateServersNeeded(
        input.useCase,
        d,
        tier
    );

    if (d.highAvailability) {
        summary.push("Redundante server-capaciteit (HA)");
    }

    return {
        minRamGb,
        minStorageGb,
        minCpuCores,
        preferEcc,
        serversNeeded,
        summary,
    };
}
