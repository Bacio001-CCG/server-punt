/** EU member states with standard VAT rates (B2C, destination country). */
export const EU_COUNTRIES = [
    { code: "at", iso: "AT", vatRate: 0.2, zone: "near" },
    { code: "be", iso: "BE", vatRate: 0.21, zone: "benelux" },
    { code: "bg", iso: "BG", vatRate: 0.2, zone: "eu_rest" },
    { code: "hr", iso: "HR", vatRate: 0.25, zone: "eu_rest" },
    { code: "cy", iso: "CY", vatRate: 0.19, zone: "eu_rest" },
    { code: "cz", iso: "CZ", vatRate: 0.21, zone: "near" },
    { code: "dk", iso: "DK", vatRate: 0.25, zone: "near" },
    { code: "ee", iso: "EE", vatRate: 0.22, zone: "near" },
    { code: "fi", iso: "FI", vatRate: 0.24, zone: "eu_rest" },
    { code: "fr", iso: "FR", vatRate: 0.2, zone: "near" },
    { code: "de", iso: "DE", vatRate: 0.19, zone: "near" },
    { code: "gr", iso: "GR", vatRate: 0.24, zone: "eu_rest" },
    { code: "hu", iso: "HU", vatRate: 0.27, zone: "eu_rest" },
    { code: "ie", iso: "IE", vatRate: 0.23, zone: "eu_rest" },
    { code: "it", iso: "IT", vatRate: 0.22, zone: "eu_rest" },
    { code: "lv", iso: "LV", vatRate: 0.21, zone: "near" },
    { code: "lt", iso: "LT", vatRate: 0.21, zone: "near" },
    { code: "lu", iso: "LU", vatRate: 0.17, zone: "benelux" },
    { code: "mt", iso: "MT", vatRate: 0.18, zone: "eu_rest" },
    { code: "nl", iso: "NL", vatRate: 0.21, zone: "benelux" },
    { code: "pl", iso: "PL", vatRate: 0.23, zone: "near" },
    { code: "pt", iso: "PT", vatRate: 0.23, zone: "eu_rest" },
    { code: "ro", iso: "RO", vatRate: 0.19, zone: "eu_rest" },
    { code: "sk", iso: "SK", vatRate: 0.2, zone: "near" },
    { code: "si", iso: "SI", vatRate: 0.22, zone: "eu_rest" },
    { code: "es", iso: "ES", vatRate: 0.21, zone: "eu_rest" },
    { code: "se", iso: "SE", vatRate: 0.25, zone: "eu_rest" },
] as const;

export type EuCountryCode = (typeof EU_COUNTRIES)[number]["code"];
export type ShippingZone = "benelux" | "near" | "eu_rest";

export const EU_COUNTRY_CODES = EU_COUNTRIES.map((c) => c.code) as [
    EuCountryCode,
    ...EuCountryCode[],
];

const LEGACY_COUNTRY_MAP: Record<string, EuCountryCode> = {
    netherlands: "nl",
    belgium: "be",
};

export function normalizeCountryCode(value: string): EuCountryCode | null {
    const lower = value.toLowerCase();
    if (LEGACY_COUNTRY_MAP[lower]) return LEGACY_COUNTRY_MAP[lower];
    if (EU_COUNTRY_CODES.includes(lower as EuCountryCode)) {
        return lower as EuCountryCode;
    }
    return null;
}

export function getCountry(code: string) {
    const normalized = normalizeCountryCode(code);
    if (!normalized) return null;
    return EU_COUNTRIES.find((c) => c.code === normalized) ?? null;
}

const SHIPPING_ZONE_MULTIPLIER: Record<ShippingZone, number> = {
    benelux: 1,
    near: 1.5,
    eu_rest: 2,
};

export function calculateBaseShippingCost(products: {
    categoryId: number | null;
    quantity: number;
}[]): number {
    const serversCount = products.reduce(
        (acc, item) => (item.categoryId === 1 ? acc + item.quantity : acc),
        0
    );
    const smallProductsCount = products.reduce(
        (acc, item) => (item.categoryId !== 1 ? acc + item.quantity : acc),
        0
    );

    let shipping = 0;

    if (smallProductsCount > 0 && smallProductsCount <= 5) {
        shipping = 10;
    }
    if (smallProductsCount > 5) {
        shipping = 15;
    }
    if (serversCount === 1 || serversCount === 2) {
        shipping = 40;
    }
    if (serversCount > 2) {
        shipping = 0;
    }

    return shipping;
}

export function calculateShippingCost(
    products: { categoryId: number | null; quantity: number }[],
    countryCode: string
): number {
    const country = getCountry(countryCode);
    if (!country) return calculateBaseShippingCost(products);

    const base = calculateBaseShippingCost(products);
    const multiplier = SHIPPING_ZONE_MULTIPLIER[country.zone];
    return Math.round(base * multiplier * 100) / 100;
}

export function toMoneybirdCountry(code: string): string {
    const country = getCountry(code);
    return country?.iso ?? code.toUpperCase();
}
