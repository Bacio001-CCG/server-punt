"use client";

import Link from "next/link";
import type {
    ConfiguratorComponent,
    ConfiguratorOption,
} from "@/lib/configurator-data";
import {
    buildServerProductHref,
    optionToCartPayload,
} from "@/lib/configurator-cart";
import { truncateText } from "@/lib/format-text";
import { AddConfigurationToCart } from "./add-configuration-to-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const MAX_HIGHLIGHTS = 4;
const HIGHLIGHT_MAX = 72;
const PRODUCT_NAME_MAX = 52;

function formatPrice(price: number, locale: string) {
    return price.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function OptionSchema({
    option,
    recommended,
}: {
    option: ConfiguratorOption;
    recommended?: boolean;
}) {
    const t = useTranslations("configurator");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const roleLabelsShort: Record<ConfiguratorComponent["role"], string> = {
        server: t("roles.server"),
        memory: t("roles.memory"),
        storage: t("roles.storage"),
        cpu: t("roles.cpu"),
    };
    const cartPayload = optionToCartPayload(option);
    const primaryServer = option.components.find((c) => c.role === "server");
    const highlights = option.highlights
        .slice(0, MAX_HIGHLIGHTS)
        .map((h) => truncateText(h, HIGHLIGHT_MAX));

    return (
        <article
            className={cn(
                "flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-shadow",
                recommended && "border-primary ring-2 ring-primary/20"
            )}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold">{option.label}</h3>
                        {recommended && (
                            <Badge className="bg-primary text-primary-foreground">
                                {t("recommended")}
                            </Badge>
                        )}
                        {option.selectionMethod === "ai" && (
                            <Badge
                                variant="outline"
                                className="border-violet-500 text-violet-700"
                            >
                                AI
                            </Badge>
                        )}
                        <Badge
                            variant="outline"
                            className={
                                option.withinBudget
                                    ? "border-green-600 text-green-700"
                                    : "border-amber-600 text-amber-700"
                            }
                        >
                            {t("budgetPercent", {
                                percent: option.budgetUsedPercent,
                            })}
                        </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {truncateText(option.description, 100)}
                    </p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-2xl font-bold">
                        €{formatPrice(option.totalPrice, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {tCommon("exclVat").toLowerCase()}
                    </p>
                </div>
            </div>

            {cartPayload && (
                <div className="mb-4 rounded-lg border bg-muted/30 p-3">
                    <table className="w-full text-sm">
                        <tbody>
                            {cartPayload.lineItems.map((line) => (
                                <tr
                                    key={`${line.role}-${line.product.id}`}
                                    className="border-b border-border/50 last:border-0"
                                >
                                    <td className="py-2 pr-2">
                                        <span
                                            className="font-medium"
                                            title={line.product.name}
                                        >
                                            {line.quantity > 1
                                                ? `${line.quantity}× `
                                                : ""}
                                            {truncateText(
                                                line.product.name,
                                                PRODUCT_NAME_MAX
                                            )}
                                        </span>
                                        <span className="ml-1.5 text-xs text-muted-foreground">
                                            {roleLabelsShort[line.role]}
                                        </span>
                                    </td>
                                    <td className="py-2 text-right tabular-nums whitespace-nowrap">
                                        €{formatPrice(line.lineTotal, locale)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="pt-2 text-right text-xs text-muted-foreground">
                                    {t("inclVat21")}
                                </td>
                                <td className="pt-2 text-right text-sm font-semibold tabular-nums">
                                    €
                                    {formatPrice(
                                        cartPayload.totalInclVat,
                                        locale
                                    )}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {highlights.length > 0 && (
                <ul className="mb-4 space-y-1 text-xs text-muted-foreground">
                    {highlights.map((h) => (
                        <li key={h} className="line-clamp-2">
                            · {h}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-auto flex flex-col gap-2">
                <AddConfigurationToCart option={option} />
                {primaryServer && (
                    <Button
                        asChild
                        className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
                    >
                        <Link
                            href={buildServerProductHref(
                                primaryServer.product.id,
                                option
                            )}
                        >
                            {t("viewServer")}
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                )}
            </div>
        </article>
    );
}
