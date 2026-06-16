import type { SelectProduct } from "@/database/schema";

export const useCases = [
    "virtualization",
    "webhosting",
    "database",
    "storage",
    "development",
    "general",
] as const;

export type UseCase = (typeof useCases)[number];

export const useCaseLabels: Record<UseCase, string> = {
    virtualization: "Virtualisatie (VM's)",
    webhosting: "Webhosting & applicaties",
    database: "Database & analytics",
    storage: "Opslag & backup",
    development: "Development & test",
    general: "Algemene bedrijfs-IT",
};

export const useCaseDescriptions: Record<UseCase, string> = {
    virtualization:
        "Hypervisors, containers en meerdere virtuele machines op één of meerdere hosts.",
    webhosting:
        "Websites, API's en line-of-business applicaties met voorspelbaar verkeer.",
    database:
        "SQL/NoSQL workloads, reporting en data-intensieve processen.",
    storage:
        "NAS, backups, archief en gedeelde bestandsopslag.",
    development:
        "CI/CD, staging omgevingen en interne tooling.",
    general:
        "Mix van workloads — file server, AD, monitoring en meer.",
};

export type ComponentRole = "server" | "memory" | "storage" | "cpu";

export interface ConfiguratorDetails {
    vmCount?: number;
    siteCount?: number;
    trafficLevel?: "low" | "medium" | "high";
    databaseSizeGb?: number;
    storageTb?: number;
    developerCount?: number;
    highAvailability?: boolean;
}

export interface ConfiguratorInput {
    useCase: UseCase;
    budgetMax: number;
    details: ConfiguratorDetails;
    /**
     * Categorie expliciet gekozen via een knop in de wizard.
     * Gaat boven inferentie uit vrije tekst.
     */
    selectedUseCase?: UseCase;
    /** Vrije omschrijving van het gebruik (stap 1) */
    customUseDescription?: string;
    /** Vrije hardware-wensen (budgetstap): merk, specs, constraints */
    customRequest?: string;
}

export interface ConfiguratorComponent {
    role: ComponentRole;
    roleLabel: string;
    product: SelectProduct;
    quantity: number;
    categoryName: string;
    lineTotal: number;
}

export interface ConfiguratorOption {
    tier: "budget" | "normaal" | "duur";
    label: string;
    description: string;
    budgetUsedPercent: number;
    totalPrice: number;
    withinBudget: boolean;
    components: ConfiguratorComponent[];
    configurationSummary: string;
    selectionMethod: "heuristic" | "ai";
    highlights: string[];
}

export interface ConfiguratorResult {
    useCase: UseCase;
    summary: string;
    requirements: string[];
    options: ConfiguratorOption[];
    aiAssisted?: boolean;
    /** True when OpenAI was skipped due to the per-minute rate limit. */
    aiRateLimited?: boolean;
    customUseDescription?: string;
    customRequest?: string;
}
