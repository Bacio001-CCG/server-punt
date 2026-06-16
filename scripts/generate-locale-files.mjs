#!/usr/bin/env node
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const localeNames = {
    nl: "Nederlands",
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    pt: "Português",
    pl: "Polski",
    ro: "Română",
    cs: "Čeština",
    hu: "Magyar",
    el: "Ελληνικά",
    bg: "Български",
    hr: "Hrvatski",
    sk: "Slovenčina",
    sl: "Slovenščina",
    da: "Dansk",
    sv: "Svenska",
    fi: "Suomi",
    et: "Eesti",
    lv: "Latviešu",
    lt: "Lietuvių",
};

const labelTranslations = {
    nl: "Taal",
    en: "Language",
    de: "Sprache",
    fr: "Langue",
    es: "Idioma",
    it: "Lingua",
    pt: "Idioma",
    pl: "Język",
    ro: "Limbă",
    cs: "Jazyk",
    hu: "Nyelv",
    el: "Γλώσσα",
    bg: "Език",
    hr: "Jezik",
    sk: "Jazyk",
    sl: "Jezik",
    da: "Sprog",
    sv: "Språk",
    fi: "Kieli",
    et: "Keel",
    lv: "Valoda",
    lt: "Kalba",
};

const locales = Object.keys(localeNames);
const enMessages = JSON.parse(
    readFileSync(join(messagesDir, "en.json"), "utf8")
);
const enLegal = JSON.parse(readFileSync(join(legalDir, "en.json"), "utf8"));

function buildLocaleSwitcher(label) {
    return {
        label,
        ...localeNames,
    };
}

for (const locale of locales) {
    if (locale === "nl") {
        const nl = JSON.parse(readFileSync(join(messagesDir, "nl.json"), "utf8"));
        nl.localeSwitcher = buildLocaleSwitcher(labelTranslations.nl);
        writeFileSync(
            join(messagesDir, "nl.json"),
            `${JSON.stringify(nl, null, 2)}\n`
        );
        continue;
    }

    const messages = structuredClone(enMessages);
    messages.localeSwitcher = buildLocaleSwitcher(labelTranslations[locale]);
    writeFileSync(
        join(messagesDir, `${locale}.json`),
        `${JSON.stringify(messages, null, 2)}\n`
    );

    const legalPath = join(legalDir, `${locale}.json`);
    if (locale !== "nl" && !existsSync(legalPath)) {
        writeFileSync(legalPath, `${JSON.stringify(enLegal, null, 2)}\n`);
    }
}

console.log(`Generated/updated ${locales.length} locale message files.`);
