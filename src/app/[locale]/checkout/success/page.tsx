"use client";
import useCart from "@/hooks/useCart";
import { CheckCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function CheckoutSuccessPage() {
    const { clearProducts } = useCart();
    const router = useRouter();
    const t = useTranslations("success");
    const tCommon = useTranslations("common");

    useEffect(() => {
        clearProducts();
    }, [clearProducts]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md w-full space-y-8">
                <div className="text-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        {t("title")}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">{t("subtitle")}</p>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="text-left">
                            <h3 className="text-lg font-medium text-gray-900">
                                {t("whatNext")}
                            </h3>
                            <div className="mt-4 space-y-4 text-sm text-gray-600">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                                    </div>
                                    <p>{t("step1")}</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                                    </div>
                                    <p>{t("step2")}</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                                    </div>
                                    <p>{t("step3")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black duration-300 transition-all hover:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => router.push("/")}
                                >
                                    {tCommon("backToHomepage")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
