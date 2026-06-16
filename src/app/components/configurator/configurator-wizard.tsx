"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { getConfiguratorRecommendations } from "@/lib/configurator";
import { inferUseCaseFromDescription } from "@/lib/configurator/infer-use-case";
import { truncateText } from "@/lib/format-text";
import type { ConfiguratorDetails } from "@/lib/configurator-data";
import {
    clearConfiguratorSession,
    dismissRestoreBanner,
    formatConfiguratorSavedAt,
    isRestoreBannerDismissed,
    loadConfiguratorSession,
    saveConfiguratorSession,
    type ConfiguratorFormSnapshot,
    type ConfiguratorSavedSession,
} from "@/lib/configurator-storage";
import {
    useCases,
    type ConfiguratorResult,
    type UseCase,
} from "@/lib/configurator-data";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { OptionSchema } from "./option-schema";

const textareaClassName =
    "placeholder:text-muted-foreground border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm resize-y min-h-[100px]";

const MIN_USE_DESCRIPTION_LENGTH = 15;
import {
    ArrowLeft,
    ArrowRight,
    Check,
    History,
    Loader2,
    Sparkles,
} from "lucide-react";

const STEP_IDS = ["use-case", "details", "budget", "results"] as const;
type StepId = (typeof STEP_IDS)[number];

export default function ConfiguratorWizard() {
    const t = useTranslations("configurator");
    const locale = useLocale();
    const STEPS: { id: StepId; label: string }[] = [
        { id: "use-case", label: t("steps.useCase") },
        { id: "details", label: t("steps.details") },
        { id: "budget", label: t("steps.budget") },
        { id: "results", label: t("steps.results") },
    ];
    const useCaseLabels = Object.fromEntries(
        useCases.map((id) => [id, t(`useCases.${id}.label`)])
    ) as Record<UseCase, string>;
    const useCaseDescriptions = Object.fromEntries(
        useCases.map((id) => [id, t(`useCases.${id}.description`)])
    ) as Record<UseCase, string>;
    const [step, setStep] = useState<StepId>("use-case");
    const [useCase, setUseCase] = useState<UseCase | null>(null);
    const [vmCount, setVmCount] = useState(4);
    const [siteCount, setSiteCount] = useState(5);
    const [trafficLevel, setTrafficLevel] = useState<
        "low" | "medium" | "high"
    >("medium");
    const [databaseSizeGb, setDatabaseSizeGb] = useState(200);
    const [storageTb, setStorageTb] = useState(4);
    const [developerCount, setDeveloperCount] = useState(3);
    const [highAvailability, setHighAvailability] = useState(false);
    const [budgetMax, setBudgetMax] = useState(5000);
    const [customUseDescription, setCustomUseDescription] = useState("");
    const [customRequest, setCustomRequest] = useState("");
    const [result, setResult] = useState<ConfiguratorResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [savedSession, setSavedSession] =
        useState<ConfiguratorSavedSession | null>(null);

    useEffect(() => {
        if (isRestoreBannerDismissed()) return;
        setSavedSession(loadConfiguratorSession());
    }, []);

    const stepIndex = STEPS.findIndex((s) => s.id === step);

    function getFormSnapshot(): ConfiguratorFormSnapshot {
        return {
            useCase,
            vmCount,
            siteCount,
            trafficLevel,
            databaseSizeGb,
            storageTb,
            developerCount,
            highAvailability,
            budgetMax,
            customUseDescription,
            customRequest,
        };
    }

    function applySavedSession(session: ConfiguratorSavedSession) {
        const { form, result: savedResult } = session;
        setUseCase(form.useCase);
        setVmCount(form.vmCount);
        setSiteCount(form.siteCount);
        setTrafficLevel(form.trafficLevel);
        setDatabaseSizeGb(form.databaseSizeGb);
        setStorageTb(form.storageTb);
        setDeveloperCount(form.developerCount);
        setHighAvailability(form.highAvailability);
        setBudgetMax(form.budgetMax);
        setCustomUseDescription(form.customUseDescription);
        setCustomRequest(form.customRequest);
        setResult(savedResult);
        setError(null);
        setStep("results");
        setSavedSession(null);
    }

    function dismissSavedSessionOffer() {
        dismissRestoreBanner();
        setSavedSession(null);
    }

    function resolveCategoryForSubmit(): UseCase {
        return (
            useCase ??
            inferUseCaseFromDescription(customUseDescription) ??
            "general"
        );
    }

    function buildDetailsPayload(category: UseCase): ConfiguratorDetails {
        return {
            vmCount: category === "virtualization" ? vmCount : undefined,
            siteCount: category === "webhosting" ? siteCount : undefined,
            trafficLevel: category === "webhosting" ? trafficLevel : undefined,
            databaseSizeGb: category === "database" ? databaseSizeGb : undefined,
            storageTb: category === "storage" ? storageTb : undefined,
            developerCount:
                category === "development" ? developerCount : undefined,
            highAvailability:
                category === "virtualization" || category === "webhosting"
                    ? highAvailability
                    : undefined,
        };
    }

    function goNext() {
        if (step === "use-case") {
            const hasUseText =
                customUseDescription.trim().length >=
                MIN_USE_DESCRIPTION_LENGTH;
            if (!useCase && !hasUseText) return;
            if (!useCase) {
                setUseCase(
                    inferUseCaseFromDescription(customUseDescription) ??
                        "general"
                );
            }
            setStep("details");
        } else if (step === "details") setStep("budget");
        else if (step === "budget") fetchRecommendations();
    }

    function goBack() {
        if (step === "details") setStep("use-case");
        else if (step === "budget") setStep("details");
        else if (step === "results") setStep("budget");
    }

    function fetchRecommendations() {
        const category = resolveCategoryForSubmit();
        setError(null);
        startTransition(async () => {
            const data = await getConfiguratorRecommendations({
                useCase: category,
                selectedUseCase: useCase ?? undefined,
                customUseDescription:
                    customUseDescription.trim() || undefined,
                budgetMax,
                details: buildDetailsPayload(category),
                customRequest: customRequest.trim() || undefined,
            });

            if (!data) {
                setError(
                    t("noResults")
                );
                return;
            }

            setResult(data);
            setStep("results");
            saveConfiguratorSession(getFormSnapshot(), data);
        });
    }

    function reset() {
        clearConfiguratorSession();
        setStep("use-case");
        setUseCase(null);
        setResult(null);
        setError(null);
        setCustomUseDescription("");
        setCustomRequest("");
        setSavedSession(null);
    }

    const hasValidUseDescription =
        customUseDescription.trim().length >= MIN_USE_DESCRIPTION_LENGTH;

    const canProceed =
        (step === "use-case" && (useCase !== null || hasValidUseDescription)) ||
        step === "details" ||
        (step === "budget" && budgetMax > 0);

    return (
        <div className="mx-auto max-w-5xl">
            <nav
                aria-label={t("stepsAriaLabel")}
                className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4"
            >
                {STEPS.map((s, i) => {
                    const done = i < stepIndex;
                    const active = s.id === step;
                    return (
                        <div key={s.id} className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                    done && "bg-primary text-primary-foreground",
                                    active &&
                                        !done &&
                                        "bg-primary/15 text-primary ring-2 ring-primary",
                                    !done &&
                                        !active &&
                                        "bg-muted text-muted-foreground"
                                )}
                            >
                                {done ? (
                                    <Check className="size-4" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            <span
                                className={cn(
                                    "hidden text-sm sm:inline",
                                    active
                                        ? "font-medium text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {s.label}
                            </span>
                            {i < STEPS.length - 1 && (
                                <div className="mx-1 hidden h-px w-8 bg-border sm:block" />
                            )}
                        </div>
                    );
                })}
            </nav>

            {step === "use-case" && savedSession && (
                <div
                    role="region"
                    aria-label={t("savedSessionAriaLabel")}
                    className="mb-8 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                            <History
                                className="mt-0.5 size-5 shrink-0 text-primary"
                                aria-hidden
                            />
                            <div>
                                <p className="font-semibold">
                                    {t("savedSessionTitle")}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("savedSessionDescription", {
                                        date: formatConfiguratorSavedAt(
                                            savedSession.savedAt
                                        ),
                                        budget: savedSession.form.budgetMax.toLocaleString(
                                            locale
                                        ),
                                        count: savedSession.result.options
                                            .length,
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:shrink-0">
                            <Button
                                type="button"
                                onClick={() =>
                                    applySavedSession(savedSession)
                                }
                            >
                                {t("loadSaved")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={dismissSavedSessionOffer}
                            >
                                {t("newConfiguration")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {step === "use-case" && (
                <section className="space-y-6">
                    <header className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {t("useCaseTitle")}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {t("useCaseSubtitle")}
                        </p>
                    </header>

                    <div className="mx-auto max-w-2xl">
                        <Field label={t("describeUse")}>
                            <textarea
                                className={cn(
                                    textareaClassName,
                                    "min-h-[120px]"
                                )}
                                rows={5}
                                maxLength={2000}
                                value={customUseDescription}
                                onChange={(e) =>
                                    setCustomUseDescription(e.target.value)
                                }
                                placeholder={t("describeUsePlaceholder")}
                                aria-describedby="use-description-hint"
                            />
                            <p
                                id="use-description-hint"
                                className="text-xs text-muted-foreground"
                            >
                                {t("describeUseHint", {
                                    min: MIN_USE_DESCRIPTION_LENGTH,
                                })}
                                {customUseDescription.length > 0 && (
                                    <span className="ml-1 tabular-nums">
                                        ({customUseDescription.length}/2000)
                                    </span>
                                )}
                            </p>
                        </Field>
                    </div>

                    <div className="relative flex items-center gap-4 py-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t("orChooseCategory")}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {useCases.map((id) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setUseCase(id)}
                                className={cn(
                                    "rounded-xl border p-4 text-left transition-all hover:border-primary/50",
                                    useCase === id
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                                        : "bg-card"
                                )}
                            >
                                <p className="font-semibold">
                                    {useCaseLabels[id]}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {useCaseDescriptions[id]}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {step === "details" && useCase && (
                <section className="mx-auto max-w-lg space-y-6">
                    <header className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {t("detailsTitle")}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {t("detailsSubtitle", {
                                useCase: useCaseLabels[useCase],
                            })}
                        </p>
                        {customUseDescription.trim() && (
                            <p className="mx-auto mt-3 max-w-md rounded-lg border bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {t("yourDescription")}{" "}
                                </span>
                                {customUseDescription.trim().length > 200
                                    ? `${customUseDescription.trim().slice(0, 197)}…`
                                    : customUseDescription.trim()}
                            </p>
                        )}
                    </header>

                    {useCase === "virtualization" && (
                        <Field label={t("vmCount")}>
                            <Input
                                type="number"
                                min={1}
                                max={500}
                                value={vmCount}
                                onChange={(e) =>
                                    setVmCount(
                                        Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1
                                        )
                                    )
                                }
                            />
                        </Field>
                    )}

                    {useCase === "webhosting" && (
                        <>
                            <Field label={t("siteCount")}>
                                <Input
                                    type="number"
                                    min={1}
                                    value={siteCount}
                                    onChange={(e) =>
                                        setSiteCount(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value, 10) ||
                                                    1
                                            )
                                        )
                                    }
                                />
                            </Field>
                            <Field label={t("trafficLevel")}>
                                <div className="flex flex-wrap gap-2">
                                    {(
                                        [
                                            ["low", t("trafficLow")],
                                            ["medium", t("trafficMedium")],
                                            ["high", t("trafficHigh")],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            variant={
                                                trafficLevel === value
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setTrafficLevel(value)
                                            }
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </Field>
                        </>
                    )}

                    {useCase === "database" && (
                        <Field label={t("databaseSize")}>
                            <Input
                                type="number"
                                min={1}
                                value={databaseSizeGb}
                                onChange={(e) =>
                                    setDatabaseSizeGb(
                                        Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1
                                        )
                                    )
                                }
                            />
                        </Field>
                    )}

                    {useCase === "storage" && (
                        <Field label={t("storageSize")}>
                            <Input
                                type="number"
                                min={0.5}
                                step={0.5}
                                value={storageTb}
                                onChange={(e) =>
                                    setStorageTb(
                                        Math.max(
                                            0.5,
                                            parseFloat(e.target.value) || 0.5
                                        )
                                    )
                                }
                            />
                        </Field>
                    )}

                    {useCase === "development" && (
                        <Field label={t("developerCount")}>
                            <Input
                                type="number"
                                min={1}
                                value={developerCount}
                                onChange={(e) =>
                                    setDeveloperCount(
                                        Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1
                                        )
                                    )
                                }
                            />
                        </Field>
                    )}

                    {useCase === "general" && (
                        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                            {t("generalHint")}
                        </p>
                    )}

                    {(useCase === "virtualization" ||
                        useCase === "webhosting") && (
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                            <Checkbox
                                checked={highAvailability}
                                onCheckedChange={(v) =>
                                    setHighAvailability(v === true)
                                }
                            />
                            <span className="text-sm">
                                {t("highAvailability")}
                            </span>
                        </label>
                    )}
                </section>
            )}

            {step === "budget" && (
                <section className="mx-auto max-w-lg space-y-6">
                    <header className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {t("budgetTitle")}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {t("budgetSubtitle")}
                        </p>
                    </header>
                    <Field label={t("maxBudget")}>
                        <Input
                            type="number"
                            min={500}
                            step={100}
                            value={budgetMax}
                            onChange={(e) =>
                                setBudgetMax(
                                    Math.max(
                                        500,
                                        parseInt(e.target.value, 10) || 500
                                    )
                                )
                            }
                        />
                    </Field>
                    <p className="text-center text-sm text-muted-foreground">
                        {t("budgetInclVat", {
                            amount: (budgetMax * 1.21).toLocaleString(locale, {
                                maximumFractionDigits: 0,
                            }),
                        })}
                    </p>

                    <Field label={t("customRequest")}>
                        <textarea
                            className={textareaClassName}
                            rows={4}
                            maxLength={1500}
                            value={customRequest}
                            onChange={(e) => setCustomRequest(e.target.value)}
                            placeholder={t("customRequestPlaceholder")}
                            aria-describedby="custom-request-hint"
                        />
                        <p
                            id="custom-request-hint"
                            className="text-xs text-muted-foreground"
                        >
                            {t("customRequestHint")}
                            {customRequest.length > 0 && (
                                <span className="ml-1 tabular-nums">
                                    ({customRequest.length}/1500)
                                </span>
                            )}
                        </p>
                    </Field>

                    {error && (
                        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </section>
            )}

            {step === "results" && result && (
                <section className="space-y-8">
                    <header className="text-center">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Sparkles className="size-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {t("resultsTitle")}
                        </h2>
                        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground line-clamp-3">
                            {truncateText(result.summary, 220)}
                        </p>
                        <ul className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
                            {result.requirements
                                .slice(0, 6)
                                .map((req) => (
                                    <li
                                        key={req}
                                        className={cn(
                                            "max-w-[14rem] truncate rounded-full border bg-muted/50 px-3 py-1 text-xs",
                                            (req.startsWith("Gebruik:") ||
                                                req.startsWith("Wens:")) &&
                                                "border-violet-300 bg-violet-50 text-violet-900"
                                        )}
                                        title={req}
                                    >
                                        {truncateText(req, 56)}
                                    </li>
                                ))}
                        </ul>
                        {(result.customUseDescription ||
                            result.customRequest) && (
                            <p className="mx-auto mt-3 max-w-xl text-center text-xs text-muted-foreground line-clamp-2">
                                {result.customUseDescription &&
                                    truncateText(
                                        result.customUseDescription,
                                        100
                                    )}
                                {result.customUseDescription &&
                                    result.customRequest &&
                                    " · "}
                                {result.customRequest &&
                                    truncateText(result.customRequest, 80)}
                            </p>
                        )}
                    </header>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "ItemList",
                                name: t("schemaName"),
                                description: result.summary,
                                numberOfItems: result.options.length,
                                itemListElement: result.options.map(
                                    (opt, i) => ({
                                        "@type": "ListItem",
                                        position: i + 1,
                                        name: opt.label,
                                        description: opt.description,
                                        url: opt.components[0]
                                            ? `https://serverpunt.com/product/${opt.components[0].product.id}`
                                            : undefined,
                                    })
                                ),
                            }),
                        }}
                    />

                    <div className="grid gap-6 lg:grid-cols-3">
                        {result.options.map((option) => (
                            <OptionSchema
                                key={option.tier}
                                option={option}
                                recommended={option.tier === "normaal"}
                            />
                        ))}
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {t("resultsFooter")}
                    </p>
                </section>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                {step !== "use-case" ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={step === "results" ? reset : goBack}
                        disabled={isPending}
                    >
                        <ArrowLeft className="size-4" />
                        {step === "results" ? t("startOver") : t("back")}
                    </Button>
                ) : (
                    <div />
                )}

                {step !== "results" && (
                    <Button
                        type="button"
                        onClick={goNext}
                        disabled={!canProceed || isPending}
                        className="bg-brand-orange hover:bg-brand-orange/90"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                {t("composing")}
                            </>
                        ) : step === "budget" ? (
                            <>
                                {t("showOptions")}
                                <Sparkles className="size-4" />
                            </>
                        ) : (
                            <>
                                {t("next")}
                                <ArrowRight className="size-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium">{label}</span>
            {children}
        </label>
    );
}
