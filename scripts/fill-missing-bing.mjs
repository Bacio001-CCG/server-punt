#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { translate } from "bing-translate-api";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const LOCALES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["bg", "hr", "sk", "sl", "da", "sv", "fi", "et", "lv", "lt"];

const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const LOCALE_NAMES = {
  nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", it: "Italiano", pt: "Português", pl: "Polski",
  ro: "Română", cs: "Čeština", hu: "Magyar", el: "Ελληνικά",
  bg: "Български", hr: "Hrvatski", sk: "Slovenčina", sl: "Slovenščina",
  da: "Dansk", sv: "Svenska", fi: "Suomi", et: "Eesti",
  lv: "Latviešu", lt: "Lietuvių",
};
const LABEL = {
  bg: "Език", hr: "Jezik", sk: "Jazyk", sl: "Jezik", da: "Sprog",
  sv: "Språk", fi: "Kieli", et: "Keel", lv: "Valoda", lt: "Kalba",
};

const SKIP_PATTERNS = [
  /^https?:\/\//,
  /^info@/,
  /^ServerPunt,/,
  /^📍/,
  /^📧$/,
  /^Kraaivenstraat/,
  /^5048 AB/,
  /^Chamber of Commerce: 97831441$/,
  /^VAT( number)?: NL868250983B01$/,
  /^VAT: NL868250983B01$/,
  /^you@email\.com$/,
  /^Google Chrome$/,
  /^Mozilla Firefox$/,
  /^Microsoft Edge$/,
  /^Safari$/,
];

const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const REQUEST_DELAY_MS = 200;
const cache = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function shouldSkip(value, path) {
  if (!value) return true;
  if (path.startsWith("localeSwitcher.") && path !== "localeSwitcher.label") return true;
  if (SKIP_PATTERNS.some((p) => p.test(value))) return true;
  return false;
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
  const cacheKey = `${to}::${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { protectedText, tokens } = protectPlaceholders(text);
  let result = text;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await sleep(REQUEST_DELAY_MS);
      const res = await translate(protectedText, "en", to);
      result = restorePlaceholders(res.translation, tokens);
      break;
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }
  cache.set(cacheKey, result);
  return result;
}

async function fillMissing(enVal, curVal, to, path = "") {
  if (typeof enVal === "string") {
    if (typeof curVal !== "string") return curVal;
    if (curVal !== enVal || shouldSkip(enVal, path)) return curVal;
    process.stdout.write(".");
    return translateText(enVal, to);
  }
  if (Array.isArray(enVal)) {
    const out = [];
    for (let i = 0; i < enVal.length; i++) {
      out[i] = await fillMissing(enVal[i], curVal?.[i], to, `${path}[${i}]`);
    }
    return out;
  }
  if (enVal && typeof enVal === "object") {
    const out = { ...curVal };
    for (const key of Object.keys(enVal)) {
      const childPath = path ? `${path}.${key}` : key;
      if (SKIP_KEYS.has(key)) {
        out[key] = enVal[key];
      } else {
        out[key] = await fillMissing(enVal[key], curVal?.[key], to, childPath);
      }
    }
    return out;
  }
  return curVal;
}

async function processFile(enPath, curPath, outPath, locale, isLegal = false) {
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const cur = JSON.parse(readFileSync(curPath, "utf8"));
  console.log(`\nFilling ${outPath}`);
  const filled = await fillMissing(en, cur, locale);
  if (!isLegal && filled.localeSwitcher) {
    filled.localeSwitcher = { label: LABEL[locale], ...LOCALE_NAMES };
  }
  writeFileSync(outPath, `${JSON.stringify(filled, null, 2)}\n`);
}

async function main() {
  for (const locale of LOCALES) {
    await processFile(
      join(messagesDir, "en.json"),
      join(messagesDir, `${locale}.json`),
      join(messagesDir, `${locale}.json`),
      locale
    );
    await processFile(
      join(legalDir, "en.json"),
      join(legalDir, `${locale}.json`),
      join(legalDir, `${locale}.json`),
      locale,
      true
    );
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
