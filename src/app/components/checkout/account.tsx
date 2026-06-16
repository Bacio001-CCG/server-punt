"use client";

import { useTranslations } from "next-intl";

export default function Account() {
    const t = useTranslations("checkout");

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">{t("account")}</h2>
            <div>
                <label htmlFor="email">{t("email")}</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="example@gmail.com"
                    required
                />
            </div>
        </div>
    );
}
