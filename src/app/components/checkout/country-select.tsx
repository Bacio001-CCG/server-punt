"use client";

import { EU_COUNTRIES } from "@/lib/regions";
import { useTranslations } from "next-intl";

export default function CountrySelect({
    name,
    id,
    defaultValue = "nl",
    required,
    value,
    onChange,
}: {
    name: string;
    id: string;
    defaultValue?: string;
    required?: boolean;
    value?: string;
    onChange?: (value: string) => void;
}) {
    const t = useTranslations("countries");

    return (
        <select
            id={id}
            className="block w-full border border-gray-300 rounded-md p-2 mt-1"
            name={name}
            required={required}
            defaultValue={value === undefined ? defaultValue : undefined}
            value={value}
            onChange={
                onChange
                    ? (e) => onChange(e.target.value)
                    : undefined
            }
        >
            {EU_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                    {t(country.code)}
                </option>
            ))}
        </select>
    );
}
