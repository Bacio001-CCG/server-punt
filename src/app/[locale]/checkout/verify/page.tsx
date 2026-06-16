"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderStatus } from "@/lib/orders";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VerifyContent() {
    const t = useTranslations("verify");
    const tCommon = useTranslations("common");
    const [status, setStatus] = useState<
        "loading" | "success" | "error" | "cancelled"
    >("loading");
    const [message, setMessage] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        setMessage(t("verifying"));
    }, [t]);

    useEffect(() => {
        const orderId = searchParams.get("order");

        if (!orderId) {
            setStatus("error");
            setMessage(t("noOrder"));
            return;
        }

        const checkPaymentStatus = async () => {
            try {
                const orderStatus = await getOrderStatus(parseInt(orderId));

                if (orderStatus === "paid" || orderStatus === "finished") {
                    router.push("/checkout/success");
                } else if (orderStatus === "cancelled") {
                    setStatus("cancelled");
                    setMessage(t("cancelled"));
                }
            } catch (error) {
                console.error("Error checking order status:", error);
                setStatus("error");
                setMessage(t("error"));
            }
        };

        checkPaymentStatus();
        const interval = setInterval(checkPaymentStatus, 1000);
        return () => clearInterval(interval);
    }, [searchParams, router, t]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center gap-3 min-h-[600px]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <h1 className="text-2xl font-bold text-center">{message}</h1>
                <p className="text-lg text-gray-500 text-center max-w-md px-4">
                    {t("loadingHint")}
                </p>
            </div>
        );
    }

    if (status === "cancelled") {
        return (
            <div className="flex flex-col gap-5 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-yellow-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold">
                        {t("cancelledTitle")}
                    </h1>
                </div>
                <p className="text-base sm:text-lg text-gray-500">{message}</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
                >
                    {tCommon("backToHome")}
                </button>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col gap-5 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold">
                        {t("errorTitle")}
                    </h1>
                </div>
                <p className="text-base sm:text-lg text-gray-500">{message}</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
                >
                    {tCommon("backToHome")}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold">
                    {t("successTitle")}
                </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-500">
                {t("successMessage")}
            </p>
            <button
                onClick={() => router.push("/")}
                className="mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
            >
                {tCommon("backToHome")}
            </button>
        </div>
    );
}

function VerifyFallback() {
    const t = useTranslations("verify");

    return (
        <div className="flex flex-col items-center justify-center gap-3 min-h-[600px]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <h1 className="text-2xl font-bold text-center">{t("verifying")}</h1>
        </div>
    );
}

export default function Verify() {
    return (
        <Suspense fallback={<VerifyFallback />}>
            <VerifyContent />
        </Suspense>
    );
}
