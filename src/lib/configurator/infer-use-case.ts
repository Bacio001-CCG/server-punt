import type {
    ConfiguratorDetails,
    ConfiguratorInput,
    UseCase,
} from "@/lib/configurator-data";
import { normalizeDetailsForUseCase } from "./requirements";

/** Leidt een use-case af uit vrije tekst (Nederlands/Engels). */
export function inferUseCaseFromDescription(text: string): UseCase | null {
    const t = text.toLowerCase();
    if (!t.trim()) return null;

    if (
        /virtualisatie|virtualization|\bvm\b|hyper-?v|proxmox|esxi|xen|kvm/.test(
            t
        )
    ) {
        return "virtualization";
    }
    if (
        /webhost|website|wordpress|magento|api.?server|http|nginx|apache/.test(
            t
        )
    ) {
        return "webhosting";
    }
    if (
        /database|sql|postgres|mysql|mariadb|mongodb|oracle|analytics|data.?warehouse/.test(
            t
        )
    ) {
        return "database";
    }
    if (
        /opslag|storage|backup|nas|san|archief|file.?server|raid/.test(t)
    ) {
        return "storage";
    }
    if (
        /develop|devops|ci\/?cd|staging|test.?omgeving|docker|kubernetes|k8s/.test(
            t
        )
    ) {
        return "development";
    }

    return null;
}

export function resolveEffectiveUseCase(
    useCase: UseCase,
    customUseDescription?: string
): UseCase {
    if (!customUseDescription?.trim()) return useCase;

    const inferred = inferUseCaseFromDescription(customUseDescription);
    if (!inferred) return useCase;

    if (useCase === "general") return inferred;

    return useCase;
}

/** Bepaal finale use-case: expliciete knopkeuze wint altijd van tekst-inferentie. */
export function resolveConfiguratorUseCase(
    useCase: UseCase,
    selectedUseCase?: UseCase,
    customUseDescription?: string
): UseCase {
    if (selectedUseCase && selectedUseCase !== "general") {
        return selectedUseCase;
    }

    return resolveEffectiveUseCase(useCase, customUseDescription);
}

export function prepareConfiguratorInput(
    raw: ConfiguratorInput
): ConfiguratorInput {
    const useCase = resolveConfiguratorUseCase(
        raw.useCase,
        raw.selectedUseCase,
        raw.customUseDescription
    );
    const details = normalizeDetailsForUseCase(useCase, raw.details);
    const { selectedUseCase: _selected, ...rest } = raw;
    return { ...rest, useCase, details };
}
