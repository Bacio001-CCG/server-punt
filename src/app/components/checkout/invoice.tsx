"use client";
import useCart from "@/hooks/useCart";
import { formatPricePlain } from "@/lib/format";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CountrySelect from "./country-select";
import CompanyFields from "./company-fields";

export default function InvoiceAddress({
    deliveryMethod,
    countryCode = "nl",
    companyName = "",
    vatNumber = "",
    onCountryChange,
    onCompanyChange,
    onVatChange,
}: {
    deliveryMethod?: "delivery" | "pickup";
    countryCode?: string;
    companyName?: string;
    vatNumber?: string;
    onCountryChange?: (code: string) => void;
    onCompanyChange?: (name: string) => void;
    onVatChange?: (vat: string) => void;
}) {
    const t = useTranslations("checkout");
    const locale = useLocale();
    const { getTotalPrice, getVatPrice, getShippingCost } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const hasCompany = companyName.trim().length > 0;
    const shippingCost =
        deliveryMethod === "pickup" ? 0 : getShippingCost(countryCode);
    const vatPrice = getVatPrice(
        deliveryMethod === "delivery",
        countryCode,
        vatNumber,
        hasCompany
    );
    const total = getTotalPrice() + vatPrice + shippingCost;

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">{t("invoice")}</h2>

            <div>
                <label htmlFor="invoice.country">{t("country")}</label>
                <CountrySelect
                    id="invoice.country"
                    name="invoice.country"
                    value={countryCode}
                    onChange={onCountryChange}
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <div>
                    <label htmlFor="invoice.firstname">{t("firstname")}</label>
                    <input
                        type="text"
                        id="invoice.firstname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Jan"
                        name="invoice.firstname"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="invoice.lastname">{t("lastname")}</label>
                    <input
                        type="text"
                        id="invoice.lastname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Jansen"
                        name="invoice.lastname"
                        required
                    />
                </div>
            </div>

            <CompanyFields
                countryCode={countryCode}
                companyName={companyName}
                onCompanyChange={onCompanyChange ?? (() => {})}
                onVatChange={onVatChange ?? (() => {})}
            />

            <div>
                <label htmlFor="invoice.address">{t("address")}</label>
                <input
                    type="text"
                    id="invoice.address"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Kraaivenstraat 36-07"
                    name="invoice.address"
                    required
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <div>
                    <label htmlFor="invoice.postalcode">{t("postalcode")}</label>
                    <input
                        type="text"
                        id="invoice.postalcode"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="5048AB"
                        required
                        name="invoice.postalcode"
                    />
                </div>
                <div>
                    <label htmlFor="invoice.city">{t("city")}</label>
                    <input
                        type="text"
                        id="invoice.city"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Tilburg"
                        required
                        name="invoice.city"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="invoice.phonenumber">{t("phoneOptional")}</label>
                <input
                    type="tel"
                    id="invoice.phonenumber"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="06 12345678"
                    name="invoice.phonenumber"
                />
            </div>
            <button
                className="bg-black text-white font-semibold rounded-lg w-fit py-1.5 px-3 duration-300 hover:opacity-70 transition-all cursor-pointer"
                type="submit"
            >
                {t("payButton", {
                    price: mounted
                        ? `€${formatPricePlain(total, locale)}`
                        : "€0,00",
                })}
            </button>
        </div>
    );
}
