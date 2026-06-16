import type { EuCountryCode } from "./regions";
import { getCountry } from "./regions";

export type CompanyFieldConfig = {
    /** Local name key for translations (e.g. "KvK-nummer") */
    registrationNameKey: string;
    registrationPlaceholder: string;
    registrationHintKey: string;
    /** Whether a company registration number is required when ordering as business */
    registrationRequired: boolean;
    registrationPattern: RegExp;
    normalizeRegistration: (value: string) => string;

    vatNameKey: string;
    vatPlaceholder: string;
    vatHintKey: string;
    vatRequired: boolean;
    /** ISO country code used by VIES (Greece = EL) */
    viesCountryCode: string;
    vatPattern: RegExp;
    normalizeVat: (value: string) => string;
};

/** Official EU VAT number patterns (incl. country prefix). Greece uses EL. */
const VAT_PATTERNS: Record<string, RegExp> = {
    AT: /^ATU\d{8}$/,
    BE: /^BE[01]\d{9}$/,
    BG: /^BG\d{9,10}$/,
    CY: /^CY\d{8}[A-Z]$/,
    CZ: /^CZ\d{8,10}$/,
    DE: /^DE\d{9}$/,
    DK: /^DK\d{8}$/,
    EE: /^EE\d{9}$/,
    EL: /^EL\d{9}$/,
    ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
    FI: /^FI\d{8}$/,
    FR: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/,
    HR: /^HR\d{11}$/,
    HU: /^HU\d{8}$/,
    IE: /^IE(\d{7}[A-W][A-I]?|\d[A-Z+*]\d{5}[A-W])$/,
    IT: /^IT\d{11}$/,
    LT: /^LT(\d{9}|\d{12})$/,
    LU: /^LU\d{8}$/,
    LV: /^LV\d{11}$/,
    MT: /^MT\d{8}$/,
    NL: /^NL\d{9}B\d{2}$/,
    PL: /^PL\d{10}$/,
    PT: /^PT\d{9}$/,
    RO: /^RO\d{2,10}$/,
    SE: /^SE\d{12}$/,
    SI: /^SI\d{8}$/,
    SK: /^SK\d{10}$/,
};

const stripNonAlphanumeric = (v: string) => v.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
const digitsOnly = (v: string) => v.replace(/\D/g, "");

function vatConfig(
    viesCode: string,
    placeholder: string,
    hintKey: string
): Pick<
    CompanyFieldConfig,
    | "vatPlaceholder"
    | "vatHintKey"
    | "viesCountryCode"
    | "vatPattern"
    | "normalizeVat"
    | "vatRequired"
    | "vatNameKey"
> {
    return {
        vatNameKey: "vatNumber",
        vatPlaceholder: placeholder,
        vatHintKey: hintKey,
        viesCountryCode: viesCode,
        vatPattern: VAT_PATTERNS[viesCode],
        vatRequired: true,
        normalizeVat: stripNonAlphanumeric,
    };
}

function regConfig(
    nameKey: string,
    placeholder: string,
    hintKey: string,
    pattern: RegExp,
    normalize: (v: string) => string,
    required = true
): Pick<
    CompanyFieldConfig,
    | "registrationNameKey"
    | "registrationPlaceholder"
    | "registrationHintKey"
    | "registrationRequired"
    | "registrationPattern"
    | "normalizeRegistration"
> {
    return {
        registrationNameKey: nameKey,
        registrationPlaceholder: placeholder,
        registrationHintKey: hintKey,
        registrationRequired: required,
        registrationPattern: pattern,
        normalizeRegistration: normalize,
    };
}

/** Per-country business identification rules for EU checkout. */
export const COMPANY_FIELD_CONFIG: Record<EuCountryCode, CompanyFieldConfig> = {
    nl: {
        ...regConfig("cocNumber", "12345678", "hintNlCoc", /^\d{8}$/, digitsOnly),
        ...vatConfig("NL", "NL123456789B01", "hintNlVat"),
    },
    be: {
        ...regConfig("bceNumber", "0123456789", "hintBeBce", /^\d{10}$/, digitsOnly),
        ...vatConfig("BE", "BE0123456789", "hintBeVat"),
    },
    de: {
        ...regConfig(
            "hrNumber",
            "HRB 12345",
            "hintDeHr",
            /^[A-Z]{0,3}\s?\d{1,8}(\s?[A-Z]{0,3})?$/i,
            (v) => v.trim().toUpperCase(),
            true
        ),
        ...vatConfig("DE", "DE123456789", "hintDeVat"),
    },
    fr: {
        ...regConfig("sirenNumber", "123456789", "hintFrSiren", /^\d{9}$/, digitsOnly),
        ...vatConfig("FR", "FR12345678901", "hintFrVat"),
    },
    at: {
        ...regConfig(
            "fnNumber",
            "123456a",
            "hintAtFn",
            /^FN\s?\d+[a-z]?$/i,
            (v) => v.trim().toUpperCase().replace(/\s+/g, " "),
            true
        ),
        ...vatConfig("AT", "ATU12345678", "hintAtVat"),
    },
    it: {
        ...regConfig(
            "reaNumber",
            "MI-123456",
            "hintItRea",
            /^[A-Z]{2}-?\d{1,7}$/i,
            (v) => v.trim().toUpperCase(),
            false
        ),
        ...vatConfig("IT", "IT12345678901", "hintItVat"),
    },
    es: {
        ...regConfig(
            "nifNumber",
            "B12345678",
            "hintEsNif",
            /^[A-Z]\d{7}[A-Z0-9]$/i,
            stripNonAlphanumeric
        ),
        ...vatConfig("ES", "ESB12345678", "hintEsVat"),
    },
    pl: {
        ...regConfig("nipNumber", "1234567890", "hintPlNip", /^\d{10}$/, digitsOnly),
        ...vatConfig("PL", "PL1234567890", "hintPlVat"),
    },
    pt: {
        ...regConfig("nipcNumber", "123456789", "hintPtNipc", /^\d{9}$/, digitsOnly),
        ...vatConfig("PT", "PT123456789", "hintPtVat"),
    },
    ie: {
        ...regConfig(
            "croNumber",
            "123456",
            "hintIeCro",
            /^\d{1,8}$/,
            digitsOnly
        ),
        ...vatConfig("IE", "IE1234567X", "hintIeVat"),
    },
    lu: {
        ...regConfig(
            "rcsNumber",
            "B123456",
            "hintLuRcs",
            /^[A-Z]\d{1,7}$/i,
            stripNonAlphanumeric
        ),
        ...vatConfig("LU", "LU12345678", "hintLuVat"),
    },
    dk: {
        ...regConfig(
            "cvrNumber",
            "12345678",
            "hintDkCvr",
            /^\d{8}$/,
            digitsOnly,
            false
        ),
        ...vatConfig("DK", "DK12345678", "hintDkVat"),
    },
    se: {
        ...regConfig(
            "orgNumber",
            "5561234567",
            "hintSeOrg",
            /^\d{10}$/,
            digitsOnly,
            false
        ),
        ...vatConfig("SE", "SE123456789012", "hintSeVat"),
    },
    fi: {
        ...regConfig(
            "ytunnus",
            "1234567-8",
            "hintFiYtunnus",
            /^\d{7}-\d$/,
            (v) => {
                const d = digitsOnly(v);
                return d.length === 8 ? `${d.slice(0, 7)}-${d.slice(7)}` : v.trim();
            }
        ),
        ...vatConfig("FI", "FI12345678", "hintFiVat"),
    },
    cz: {
        ...regConfig("icoNumber", "12345678", "hintCzIco", /^\d{8}$/, digitsOnly),
        ...vatConfig("CZ", "CZ12345678", "hintCzVat"),
    },
    sk: {
        ...regConfig("icoNumber", "12345678", "hintSkIco", /^\d{8}$/, digitsOnly),
        ...vatConfig("SK", "SK1234567890", "hintSkVat"),
    },
    hu: {
        ...regConfig(
            "companyRegNumber",
            "01-09-123456",
            "hintHuReg",
            /^\d{2}-\d{2}-\d{6}$/,
            (v) => {
                const d = digitsOnly(v);
                return d.length === 10
                    ? `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`
                    : v.trim();
            }
        ),
        ...vatConfig("HU", "HU12345678", "hintHuVat"),
    },
    ro: {
        ...regConfig(
            "cuiNumber",
            "12345678",
            "hintRoCui",
            /^\d{2,10}$/,
            digitsOnly
        ),
        ...vatConfig("RO", "RO1234567890", "hintRoVat"),
    },
    bg: {
        ...regConfig(
            "uicNumber",
            "123456789",
            "hintBgUic",
            /^\d{9,13}$/,
            digitsOnly
        ),
        ...vatConfig("BG", "BG123456789", "hintBgVat"),
    },
    hr: {
        ...regConfig(
            "oibNumber",
            "12345678901",
            "hintHrOib",
            /^\d{11}$/,
            digitsOnly,
            false
        ),
        ...vatConfig("HR", "HR12345678901", "hintHrVat"),
    },
    si: {
        ...regConfig(
            "maticnaNumber",
            "12345678",
            "hintSiMaticna",
            /^\d{8}$/,
            digitsOnly
        ),
        ...vatConfig("SI", "SI12345678", "hintSiVat"),
    },
    ee: {
        ...regConfig(
            "regCode",
            "12345678",
            "hintEeReg",
            /^\d{8}$/,
            digitsOnly
        ),
        ...vatConfig("EE", "EE123456789", "hintEeVat"),
    },
    lv: {
        ...regConfig(
            "regNumber",
            "12345678901",
            "hintLvReg",
            /^\d{11}$/,
            digitsOnly
        ),
        ...vatConfig("LV", "LV12345678901", "hintLvVat"),
    },
    lt: {
        ...regConfig(
            "companyCode",
            "123456789",
            "hintLtCode",
            /^\d{9}$/,
            digitsOnly
        ),
        ...vatConfig("LT", "LT123456789", "hintLtVat"),
    },
    mt: {
        ...regConfig(
            "companyNumber",
            "C12345",
            "hintMtCompany",
            /^C\d+$/i,
            stripNonAlphanumeric
        ),
        ...vatConfig("MT", "MT12345678", "hintMtVat"),
    },
    cy: {
        ...regConfig(
            "arcNumber",
            "HE123456",
            "hintCyArc",
            /^[A-Z]{2}\d{5,6}$/i,
            stripNonAlphanumeric
        ),
        ...vatConfig("CY", "CY12345678L", "hintCyVat"),
    },
    gr: {
        ...regConfig(
            "gemiNumber",
            "1234567890",
            "hintGrGemi",
            /^\d{9,12}$/,
            digitsOnly,
            false
        ),
        ...vatConfig("EL", "EL123456789", "hintGrVat"),
    },
};

export function getCompanyFieldConfig(
    countryCode: string
): CompanyFieldConfig | null {
    const country = getCountry(countryCode);
    if (!country) return null;
    return COMPANY_FIELD_CONFIG[country.code] ?? null;
}

export function normalizeVatNumber(value: string): string {
    return stripNonAlphanumeric(value);
}

export function validateVatNumberFormat(
    vatNumber: string,
    countryCode: string
): { valid: boolean; normalized: string; error?: "format" | "countryMismatch" } {
    const config = getCompanyFieldConfig(countryCode);
    if (!config) return { valid: false, normalized: "", error: "format" };

    const normalized = config.normalizeVat(vatNumber);
    if (!normalized) return { valid: false, normalized, error: "format" };

    const expectedPrefix = config.viesCountryCode;
    if (!normalized.startsWith(expectedPrefix)) {
        return { valid: false, normalized, error: "countryMismatch" };
    }

    if (!config.vatPattern.test(normalized)) {
        return { valid: false, normalized, error: "format" };
    }

    return { valid: true, normalized };
}

export function validateRegistrationNumber(
    registrationNumber: string,
    countryCode: string
): { valid: boolean; normalized: string } {
    const config = getCompanyFieldConfig(countryCode);
    if (!config) return { valid: false, normalized: "" };

    const normalized = config.normalizeRegistration(registrationNumber);
    if (!normalized) return { valid: false, normalized };

    return {
        valid: config.registrationPattern.test(normalized),
        normalized,
    };
}

/** Cross-border EU B2B reverse charge: valid VAT from buyer outside NL. */
export function qualifiesForReverseCharge(
    buyerCountryCode: string,
    vatNumber: string | undefined | null
): boolean {
    if (!vatNumber?.trim()) return false;

    const country = getCountry(buyerCountryCode);
    if (!country || country.code === "nl") return false;

    const result = validateVatNumberFormat(vatNumber, country.code);
    return result.valid;
}

export function getVatNumberForVies(
    vatNumber: string,
    countryCode: string
): { countryCode: string; vatNumber: string } | null {
    const config = getCompanyFieldConfig(countryCode);
    if (!config) return null;

    const normalized = config.normalizeVat(vatNumber);
    const prefix = config.viesCountryCode;
    if (!normalized.startsWith(prefix)) return null;

    return {
        countryCode: prefix,
        vatNumber: normalized.slice(prefix.length),
    };
}

export function getVatRate(
    countryCode: string,
    options?: { vatNumber?: string; hasCompany?: boolean }
): number {
    const country = getCountry(countryCode);
    if (!country) return 0.21;

    if (
        options?.hasCompany &&
        options?.vatNumber &&
        qualifiesForReverseCharge(countryCode, options.vatNumber)
    ) {
        return 0;
    }

    return country.vatRate;
}
