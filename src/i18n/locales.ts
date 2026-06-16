export const localeConfig = [
    { code: "nl", flag: "🇳🇱", name: "Nederlands", intl: "nl-NL" },
    { code: "en", flag: "🇬🇧", name: "English", intl: "en-GB" },
    { code: "de", flag: "🇩🇪", name: "Deutsch", intl: "de-DE" },
    { code: "fr", flag: "🇫🇷", name: "Français", intl: "fr-FR" },
    { code: "es", flag: "🇪🇸", name: "Español", intl: "es-ES" },
    { code: "it", flag: "🇮🇹", name: "Italiano", intl: "it-IT" },
    { code: "pt", flag: "🇵🇹", name: "Português", intl: "pt-PT" },
    { code: "pl", flag: "🇵🇱", name: "Polski", intl: "pl-PL" },
    { code: "ro", flag: "🇷🇴", name: "Română", intl: "ro-RO" },
    { code: "cs", flag: "🇨🇿", name: "Čeština", intl: "cs-CZ" },
    { code: "hu", flag: "🇭🇺", name: "Magyar", intl: "hu-HU" },
    { code: "el", flag: "🇬🇷", name: "Ελληνικά", intl: "el-GR" },
    { code: "bg", flag: "🇧🇬", name: "Български", intl: "bg-BG" },
    { code: "hr", flag: "🇭🇷", name: "Hrvatski", intl: "hr-HR" },
    { code: "sk", flag: "🇸🇰", name: "Slovenčina", intl: "sk-SK" },
    { code: "sl", flag: "🇸🇮", name: "Slovenščina", intl: "sl-SI" },
    { code: "da", flag: "🇩🇰", name: "Dansk", intl: "da-DK" },
    { code: "sv", flag: "🇸🇪", name: "Svenska", intl: "sv-SE" },
    { code: "fi", flag: "🇫🇮", name: "Suomi", intl: "fi-FI" },
    { code: "et", flag: "🇪🇪", name: "Eesti", intl: "et-EE" },
    { code: "lv", flag: "🇱🇻", name: "Latviešu", intl: "lv-LV" },
    { code: "lt", flag: "🇱🇹", name: "Lietuvių", intl: "lt-LT" },
] as const;

export type LocaleCode = (typeof localeConfig)[number]["code"];

export const locales = localeConfig.map((l) => l.code);

export function getLocaleMeta(code: string) {
    return (
        localeConfig.find((l) => l.code === code) ?? localeConfig[0]
    );
}

export function getIntlLocale(code: string): string {
    return getLocaleMeta(code).intl;
}
