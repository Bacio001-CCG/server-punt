#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const TARGET_LOCALES = process.argv.slice(2).length
    ? process.argv.slice(2)
    : ["de", "fr", "es", "it", "pt", "pl", "ro", "cs", "hu", "el", "bg", "hr", "sk", "sl", "da", "sv", "fi", "et", "lv", "lt"];

const LOCALE_NAMES = {
    nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français",
    es: "Español", it: "Italiano", pt: "Português", pl: "Polski",
    ro: "Română", cs: "Čeština", hu: "Magyar", el: "Ελληνικά",
    bg: "Български", hr: "Hrvatski", sk: "Slovenčina", sl: "Slovenščina",
    da: "Dansk", sv: "Svenska", fi: "Suomi", et: "Eesti",
    lv: "Latviešu", lt: "Lietuvių",
};

const LABEL_TRANSLATIONS = {
    de: "Sprache", fr: "Langue", es: "Idioma", it: "Lingua", pt: "Idioma",
    pl: "Język", ro: "Limbă", cs: "Jazyk", hu: "Nyelv", el: "Γλώσσα",
    bg: "Език", hr: "Jezik", sk: "Jazyk", sl: "Jezik", da: "Sprog",
    sv: "Språk", fi: "Kieli", et: "Keel", lv: "Valoda", lt: "Kalba",
};

const SKIP_PATTERNS = [/^https?:\/\//, /^info@/, /^ServerPunt,/];
const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const CONCURRENCY = 8;

const cache = new Map();
let inFlight = 0;
const queue = [];

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function shouldSkip(value) {
    return SKIP_PATTERNS.some((p) => p.test(value));
}

function protectPlaceholders(text) {
    const tokens = [];
    const protectedText = text.replace(PROTECT_REGEX, (match) => {
        const token = `⟦${tokens.length}⟧`;
        tokens.push(match);
        return token;
    });
    return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
    return text.replace(/⟦(\d+)⟧/g, (_, index) => tokens[Number(index)] ?? "");
}

async function translateText(text, to) {
    if (!text || shouldSkip(text)) return text;

    const cacheKey = `${to}::${text}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const { protectedText, tokens } = protectPlaceholders(text);

    return new Promise((resolve) => {
        queue.push(async () => {
            let attempts = 0;
            let result = text;
            while (attempts < 3) {
                try {
                    const res = await translate(protectedText, { from: "en", to, client: "gtx" });
                    result = restorePlaceholders(res.text, tokens);
                    break;
                } catch {
                    attempts++;
                    await sleep(500 * attempts);
                }
            }
            cache.set(cacheKey, result);
            resolve(result);
        });
        drainQueue();
    });
}

function drainQueue() {
    while (inFlight < CONCURRENCY && queue.length > 0) {
        inFlight++;
        const job = queue.shift();
        job().finally(() => {
            inFlight--;
            drainQueue();
        });
    }
}

async function translateValue(value, to, path = "") {
    if (typeof value === "string") {
        if (path.startsWith("localeSwitcher.") && path !== "localeSwitcher.label") {
            return LOCALE_NAMES[path.split(".")[1]] ?? value;
        }
        return translateText(value, to);
    }
    if (Array.isArray(value)) {
        return Promise.all(value.map((v, i) => translateValue(v, to, `${path}[${i}]`)));
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value);
        const out = {};
        await Promise.all(
            entries.map(async ([key, val]) => {
                out[key] = await translateValue(val, to, path ? `${path}.${key}` : key);
            })
        );
        return out;
    }
    return value;
}

async function translateFile(sourcePath, targetPath, locale) {
    const source = JSON.parse(readFileSync(sourcePath, "utf8"));
    console.log(`  → ${targetPath}`);
    const translated = await translateValue(source, locale);
    if (translated.localeSwitcher) {
        translated.localeSwitcher.label = LABEL_TRANSLATIONS[locale] ?? "Language";
        Object.assign(translated.localeSwitcher, LOCALE_NAMES);
    }
    writeFileSync(targetPath, `${JSON.stringify(translated, null, 2)}\n`);
}

async function main() {
    console.log(`Translating: ${TARGET_LOCALES.join(", ")}`);
    for (const locale of TARGET_LOCALES) {
        console.log(`\n[${locale.toUpperCase()}] messages`);
        await translateFile(join(messagesDir, "en.json"), join(messagesDir, `${locale}.json`), locale);
        console.log(`[${locale.toUpperCase()}] legal`);
        await translateFile(join(legalDir, "en.json"), join(legalDir, `${locale}.json`), locale);
    }
    console.log("\nDone.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
