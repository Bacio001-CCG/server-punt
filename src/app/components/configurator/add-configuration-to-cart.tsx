"use client";

import useCart from "@/hooks/useCart";
import { optionToCartPayload } from "@/lib/configurator-cart";
import type { ConfiguratorOption } from "@/lib/configurator-data";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

const cartButtonClassName =
    "bg-black cursor-pointer flex w-full justify-center gap-2 items-center text-white px-6 py-2 rounded-md hover:opacity-60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export function AddConfigurationToCart({
    option,
    className,
}: {
    option: ConfiguratorOption;
    className?: string;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const { addProduct } = useCart();
    const t = useTranslations("configurator");

    const serverInBundle = option.components.some((c) => c.role === "server");

    function handleAdd() {
        const payload = optionToCartPayload(option);
        if (!payload) {
            toast.error(t("cannotAddToCart"));
            return;
        }

        if (
            payload.configuredItems.length === 0 &&
            option.components.some((c) => c.role !== "server")
        ) {
            toast.error(t("missingParts"));
            return;
        }

        setIsLoading(true);
        try {
            if (payload.configuredItems.length > 0) {
                addProduct(
                    payload.mainProduct,
                    payload.mainQuantity,
                    payload.configuredItems,
                    { bundleLabel: payload.bundleLabel }
                );
            } else {
                addProduct(
                    payload.mainProduct,
                    payload.mainQuantity,
                    undefined,
                    { bundleLabel: payload.bundleLabel }
                );
            }

            toast.success(t("addedToCart"));
        } catch {
            toast.error(t("addToCartFailed"));
        } finally {
            setIsLoading(false);
        }
    }

    if (!serverInBundle) {
        return (
            <button
                type="button"
                disabled
                className={cn(cartButtonClassName, className)}
            >
                {t("addToCart")}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleAdd}
            disabled={isLoading}
            className={cn(cartButtonClassName, className)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
            </svg>
            {isLoading ? t("adding") : t("addToCart")}
        </button>
    );
}
