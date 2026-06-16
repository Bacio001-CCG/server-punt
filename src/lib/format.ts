import { getIntlLocale } from "@/i18n/locales";

export { getIntlLocale };

export function formatPrice(amount: number, locale: string): string {
    return new Intl.NumberFormat(getIntlLocale(locale), {
        style: "currency",
        currency: "EUR",
    }).format(amount);
}

export function formatPricePlain(amount: number, locale: string): string {
    return new Intl.NumberFormat(getIntlLocale(locale), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
