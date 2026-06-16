"use client";

import { getCompanyFieldConfig } from "@/lib/company-fields";
import { useTranslations } from "next-intl";

export default function CompanyFields({
    countryCode,
    companyName,
    onCompanyChange,
    onVatChange,
}: {
    countryCode: string;
    companyName: string;
    onCompanyChange: (name: string) => void;
    onVatChange: (vat: string) => void;
}) {
    const t = useTranslations("checkout");
    const tFields = useTranslations("companyFields");
    const config = getCompanyFieldConfig(countryCode);
    const isBusiness = companyName.trim().length > 0;

    if (!config) return null;

    const regLabel = tFields(`names.${config.registrationNameKey}`);
    const vatLabel = tFields(`names.${config.vatNameKey}`);
    const regHint = tFields(config.registrationHintKey);
    const vatHint = tFields(config.vatHintKey);

    return (
        <>
            <div>
                <label htmlFor="invoice.company">{t("companyOptional")}</label>
                <input
                    type="text"
                    id="invoice.company"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="ServerPunt"
                    name="invoice.company"
                    onChange={(e) => onCompanyChange(e.target.value)}
                />
            </div>

            {isBusiness && (
                <>
                    <div>
                        <label htmlFor="invoice.cocNumber">
                            {regLabel}
                            {config.registrationRequired && (
                                <span className="text-red-600"> *</span>
                            )}
                            {!config.registrationRequired && (
                                <span className="text-gray-500 text-sm">
                                    {" "}
                                    ({tFields("optional")})
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            id="invoice.cocNumber"
                            className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                            placeholder={config.registrationPlaceholder}
                            name="invoice.cocNumber"
                            required={config.registrationRequired}
                        />
                        <p className="text-xs text-gray-500 mt-1">{regHint}</p>
                    </div>

                    <div>
                        <label htmlFor="invoice.vatNumber">
                            {vatLabel}
                            {config.vatRequired && (
                                <span className="text-red-600"> *</span>
                            )}
                        </label>
                        <input
                            type="text"
                            id="invoice.vatNumber"
                            className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                            placeholder={config.vatPlaceholder}
                            name="invoice.vatNumber"
                            required={config.vatRequired}
                            onChange={(e) => onVatChange(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">{vatHint}</p>
                        {countryCode !== "nl" && (
                            <p className="text-xs text-blue-600 mt-1">
                                {tFields("reverseChargeHint")}
                            </p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
