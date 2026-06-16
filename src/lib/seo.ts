import type { Metadata } from "next";
import { localeConfig, getIntlLocale } from "@/i18n/locales";

export function getSiteUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://serverpunt.com";
    const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
    return withProtocol.replace(/\/$/, "");
}

export function getCanonicalHostname(): string {
    return new URL(getSiteUrl()).hostname;
}

export function buildLocalePath(locale: string, path = ""): string {
    const segment = path.replace(/^\//, "");
    return segment ? `/${locale}/${segment}` : `/${locale}`;
}

export function buildAbsoluteLocaleUrl(locale: string, path = ""): string {
    return `${getSiteUrl()}${buildLocalePath(locale, path)}`;
}

export function buildAlternateLanguages(
    locale: string,
    path = ""
): NonNullable<Metadata["alternates"]> {
    const languages: Record<string, string> = {};

    for (const { code, intl } of localeConfig) {
        languages[intl] = buildAbsoluteLocaleUrl(code, path);
    }
    languages["x-default"] = buildAbsoluteLocaleUrl("nl", path);

    return {
        canonical: buildAbsoluteLocaleUrl(locale, path),
        languages,
    };
}

export function openGraphLocale(locale: string): string {
    return getIntlLocale(locale).replace("-", "_");
}
