import type {
    ConfiguratorResult,
    UseCase,
} from "@/lib/configurator-data";

const STORAGE_KEY = "serverpunt-configurator-session";
const DISMISS_KEY = "serverpunt-configurator-restore-dismissed";
const SESSION_VERSION = 1;
/** Opgeslagen sessies ouder dan dit worden genegeerd. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type ConfiguratorFormSnapshot = {
    useCase: UseCase | null;
    vmCount: number;
    siteCount: number;
    trafficLevel: "low" | "medium" | "high";
    databaseSizeGb: number;
    storageTb: number;
    developerCount: number;
    highAvailability: boolean;
    budgetMax: number;
    customUseDescription: string;
    customRequest: string;
};

export type ConfiguratorSavedSession = {
    version: typeof SESSION_VERSION;
    savedAt: string;
    form: ConfiguratorFormSnapshot;
    result: ConfiguratorResult;
};

function isUseCase(value: unknown): value is UseCase {
    return (
        typeof value === "string" &&
        [
            "virtualization",
            "webhosting",
            "database",
            "storage",
            "development",
            "general",
        ].includes(value)
    );
}

function isValidSession(data: unknown): data is ConfiguratorSavedSession {
    if (!data || typeof data !== "object") return false;
    const s = data as ConfiguratorSavedSession;
    if (s.version !== SESSION_VERSION) return false;
    if (typeof s.savedAt !== "string") return false;
    if (!s.form || typeof s.form !== "object") return false;
    if (s.form.useCase !== null && !isUseCase(s.form.useCase)) return false;
    if (!s.result || typeof s.result !== "object") return false;
    if (!Array.isArray(s.result.options) || s.result.options.length === 0) {
        return false;
    }
    return true;
}

export function saveConfiguratorSession(
    form: ConfiguratorFormSnapshot,
    result: ConfiguratorResult
): void {
    if (typeof window === "undefined") return;

    const session: ConfiguratorSavedSession = {
        version: SESSION_VERSION,
        savedAt: new Date().toISOString(),
        form,
        result,
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        sessionStorage.removeItem(DISMISS_KEY);
    } catch (error) {
        console.error("Configurator session save failed:", error);
    }
}

export function loadConfiguratorSession(): ConfiguratorSavedSession | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed: unknown = JSON.parse(raw);
        if (!isValidSession(parsed)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        const age = Date.now() - new Date(parsed.savedAt).getTime();
        if (Number.isNaN(age) || age > MAX_AGE_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return parsed;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function clearConfiguratorSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(DISMISS_KEY);
}

export function isRestoreBannerDismissed(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
}

export function dismissRestoreBanner(): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(DISMISS_KEY, "1");
}

export function formatConfiguratorSavedAt(iso: string): string {
    try {
        return new Intl.DateTimeFormat("nl-NL", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}
