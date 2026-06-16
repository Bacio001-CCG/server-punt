import { defineRouting } from "next-intl/routing";
import { locales, type LocaleCode } from "./locales";

export const routing = defineRouting({
    locales: [...locales],
    defaultLocale: "nl",
    localePrefix: "always",
});

export type Locale = LocaleCode;
