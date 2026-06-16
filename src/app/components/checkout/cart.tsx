"use client";
import useCart from "@/hooks/useCart";
import { formatPricePlain } from "@/lib/format";
import { Trash } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useMemo, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function Cart({
    deliveryMethod,
    countryCode = "nl",
    companyName = "",
    vatNumber = "",
}: {
    deliveryMethod?: "delivery" | "pickup";
    countryCode?: string;
    companyName?: string;
    vatNumber?: string;
}) {
    const t = useTranslations("checkout");
    const tCommon = useTranslations("common");
    const tCart = useTranslations("cart");
    const locale = useLocale();
    const {
        products,
        removeProduct,
        getTotalPrice,
        getGroupedProducts,
        getVatPrice,
        getShippingCost,
    } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const groupedProducts = useMemo(
        () => getGroupedProducts(),
        [products, getGroupedProducts]
    );

    const hasCompany = companyName.trim().length > 0;
    const shippingCost =
        deliveryMethod === "pickup" ? 0 : getShippingCost(countryCode);
    const vatPrice = getVatPrice(
        deliveryMethod === "delivery",
        countryCode,
        vatNumber,
        hasCompany
    );

    if (!mounted) {
        return (
            <div className="flex flex-col gap-5">
                <h2 className="text-3xl font-bold mb-2">{t("products")}</h2>
                <ul className="space-y-4 bg-white p-5 rounded-lg border border-border">
                    <p className="text-center text-gray-500">
                        {tCommon("loading")}
                    </p>
                </ul>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">{t("products")}</h2>

            <ul className="space-y-4 bg-white p-5 rounded-lg border border-border">
                {groupedProducts.length === 0 && (
                    <p className="text-center text-gray-500">
                        {tCart("empty")}
                    </p>
                )}
                {groupedProducts.map((item) => {
                    const configuredTotal = (
                        item.product.configuredItems || []
                    ).reduce(
                        (sub, ci) => sub + ci.product.price * ci.quantity,
                        0
                    );
                    const unitTotal = item.product.price + configuredTotal;

                    return (
                        <Link
                            href={`/product/${item.product.id}`}
                            key={`${item.product.id}-${
                                item.product.configSignature ?? "base"
                            }`}
                            className="flex items-start gap-4"
                        >
                            <Image
                                width={128}
                                height={128}
                                src={
                                    item.product.imageUrl || "/placeholder.png"
                                }
                                alt={item.product.name}
                                className=" rounded-sm object-cover"
                            />
                            <div className="flex justify-between w-full items-start">
                                <div className="space-y-1">
                                    <h3 className=" text-sm md:text-md text-gray-900">
                                        {item.product.bundleLabel ??
                                            item.product.name}
                                    </h3>
                                    {item.product.bundleLabel && (
                                        <p className="text-xs text-gray-500">
                                            {tCommon("base")}:{" "}
                                            {item.product.name}
                                        </p>
                                    )}
                                    {item.product.configuredItems &&
                                        item.product.configuredItems.length >
                                            0 && (
                                            <ul className="ml-4 list-disc text-xs sm:text-sm text-gray-600 space-y-0.5">
                                                {item.product.configuredItems.map(
                                                    (sub) => (
                                                        <li
                                                            key={`${sub.product.id}-${sub.quantity}`}
                                                        >
                                                            {sub.product.name} x{" "}
                                                            {sub.quantity}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}

                                    <dl className="mt-1 space-y-px text-xs sm:text-sm text-gray-600">
                                        <div>
                                            <dt className="inline mr-1">
                                                {tCommon("quantity")}:
                                            </dt>
                                            <dd className="inline">
                                                {item.quantity}x
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline mr-1">
                                                {tCommon("price")}:
                                            </dt>
                                            <dd className="inline">
                                                €
                                                {formatPricePlain(
                                                    unitTotal * item.quantity,
                                                    locale
                                                )}{" "}
                                                {tCommon("exclVat")}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <Trash
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeProduct(
                                            item.product.id,
                                            item.product.configSignature
                                        );
                                    }}
                                    className="text-red-500 scale-75 cursor-pointer hover:scale-90 transition-transform"
                                />
                            </div>
                        </Link>
                    );
                })}
                <li className=" text-right w-fit float-end">
                    <span className="text-muted-foreground text-sm">
                        {t("priceExclVat")}: €
                        {formatPricePlain(getTotalPrice(), locale)}
                    </span>
                    <br />
                    <span className="text-muted-foreground text-sm">
                        {tCommon("vat")}: €
                        {formatPricePlain(vatPrice, locale)}
                    </span>
                    <br />
                    {deliveryMethod !== "pickup" && (
                        <>
                            <span className="text-muted-foreground text-sm">
                                {t("shippingCosts")}: €
                                {formatPricePlain(shippingCost, locale)}
                            </span>
                            <br />
                        </>
                    )}
                    <hr className="border border-border my-1" />

                    <span className="font-bold text-sm">
                        {tCommon("total")}: €
                        {formatPricePlain(
                            getTotalPrice() + vatPrice + shippingCost,
                            locale
                        )}
                    </span>
                </li>
            </ul>
        </div>
    );
}
