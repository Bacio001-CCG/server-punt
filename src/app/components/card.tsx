"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { getVatRate } from "@/lib/company-fields";

import { truncateText } from "@/lib/format-text";

export default function Card({
    name,
    image,
    href,
    price,
    stock,
    createdAt,
    refurbished,
    countryCode = "nl",
}: {
    name: string;
    image: string;
    href: string;
    price?: string;
    stock?: number;
    createdAt?: Date;
    refurbished?: boolean;
    countryCode?: string;
}) {
    const t = useTranslations("common");
    const vatRate = getVatRate(countryCode);
    const priceExclVAT = parseFloat(price ?? "0").toFixed(2);
    const priceInclVAT = (parseFloat(price ?? "0") * (1 + vatRate)).toFixed(2);
    const createdDate = createdAt ? new Date(createdAt) : null;
    const isNew =
        !!createdDate &&
        !Number.isNaN(createdDate.getTime()) &&
        Date.now() - createdDate.getTime() < 10 * 24 * 60 * 60 * 1000;

    const linkLabel = truncateText(name, 48);

    return (
        <Link
            className="group relative flex flex-col space-y-4 overflow-hidden rounded-2xl transition-all duration-300"
            href={href}
            aria-label={t("viewProductAria", { name })}
            title={name}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-2">
                    {isNew && (
                        <span className="relative inline-flex group/badge">
                            <Badge
                                variant={"outline"}
                                className=" bg-green-200 w-fit border-green-600 text-green-600 font-semibold z-30 text-[10px] uppercase tracking-wide"
                            >
                                {t("newArrival")}
                            </Badge>
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/badge:opacity-100"
                            >
                                {t("newArrivalTooltip")}
                            </span>
                        </span>
                    )}
                    {!refurbished && (
                        <span className="relative inline-flex group/badge">
                            <Badge
                                variant={"outline"}
                                className=" bg-blue-200 border-blue-600 text-blue-600 font-semibold z-30 text-[10px] uppercase tracking-wide"
                            >
                                {t("brandNew")}
                            </Badge>
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/badge:opacity-100"
                            >
                                {t("brandNewTooltip")}
                            </span>
                        </span>
                    )}
                </div>

                <Image
                    height={200}
                    width={200}
                    alt={name}
                    src={image ?? "/placeholder.png"}
                    loading="lazy"
                    decoding="async"
                    className="object-contain p-2 transition duration-300 group-hover:scale-105"
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        color: "transparent",
                    }}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <span className="absolute bottom-2.5 right-2.5 z-10 flex size-8 items-center justify-center rounded-lg bg-white/95 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="size-4" />
                </span>
            </div>
            <div className="relative z-20 -mt-6 p-4">
                <div
                    className={`${
                        !price && "text-center"
                    } mb-1 text-lg font-medium`}
                >
                    <span aria-hidden="true">{linkLabel}</span>
                </div>
                {price && (
                    <div className="text-sm text-muted-foreground">
                        <p className="text-base text-black">
                            €{priceExclVAT.replace(".", ",")} {t("exclVat")}
                        </p>
                        <p>
                            €{priceInclVAT.replace(".", ",")} {t("inclVat")}
                        </p>
                        {stock !== undefined && (
                            <p className="text-green-700">
                                {t("inStock", { count: stock })}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
