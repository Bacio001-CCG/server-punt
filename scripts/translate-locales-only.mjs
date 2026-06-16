#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const LOCALES = process.argv.slice(2);
if (LOCALES.length === 0) {
  console.error("Usage: node translate-locales-only.mjs <locale>...");
  process.exit(1);
}

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
  /^https?:\/\//, /^info@/, /^ServerPunt,/, /^📍/, /^📧$/,
  /^Kraaivenstraat/, /^5048 AB/, /^Chamber of Commerce: 97831441$/,
  /^VAT( number)?: NL868250983B01$/, /^VAT: NL868250983B01$/,
];
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
      while (attempts < 4) {
        try {
          const res = await translate(protectedText, { from: "en", to, client: "gtx" });
          result = restorePlaceholders(res.text, tokens);
          break;
        } catch {
          attempts++;
          await sleep(800 * attempts);
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
    queue.shift()().finally(() => {
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
    const out = {};
    await Promise.all(
      Object.entries(value).map(async ([key, val]) => {
        const childPath = path ? `${path}.${key}` : key;
        out[key] = SKIP_KEYS.has(key) ? val : await translateValue(val, to, childPath);
      })
    );
    return out;
  }
  return value;
}

const MANUAL_FIXES = {
  lv: {
    "common.exclVat": "Bez PVN",
    "common.inclVat": "Ar PVN",
    "common.vat": "PVN",
    "common.refurbished": "Atjaunots",
    "common.brandNewTooltip": "Nav atjaunots",
    "nav.home": "Sākums",
    "hero.titleHighlight": "serverus",
    "cart.orderButton": "Pasūtīt ({price}) bez PVN",
    "checkout.priceExclVat": "Cena bez PVN",
    "footer.refurbishedNotice": "Atjaunotajiem produktiem var būt lietošanas pazīmes. Garantija tiek piemērota saskaņā ar mūsu <warrantyLink>garantijas politiku</warrantyLink>.",
    "configurator.savedSessionDescription": "Saglabāts {date} · budžets līdz €{budget} · {count, plural, zero {# variantu} one {# variants} other {# varianti}}",
    "configurator.trafficLow": "Zems",
    "configurator.trafficMedium": "Vidējs",
    "configurator.trafficHigh": "Augsts",
    "configurator.steps.budget": "Budžets",
    "companyFields.viesInvalid": "PVN numuru nevarēja verificēt, izmantojot VIES",
  },
  lt: {
    "common.exclVat": "Be PVM",
    "common.inclVat": "Su PVM",
    "common.vat": "PVM",
    "common.refurbished": "Atnaujintas",
    "common.brandNewTooltip": "Neatnaujintas",
    "nav.home": "Pradžia",
    "hero.titleHighlight": "serverius",
    "cart.orderButton": "Užsakyti ({price}) be PVM",
    "checkout.priceExclVat": "Kaina be PVM",
    "footer.refurbishedNotice": "Atnaujintuose produktuose gali būti naudojimo žymių. Garantija taikoma pagal mūsų <warrantyLink>garantijos politiką</warrantyLink>.",
    "configurator.savedSessionDescription": "Išsaugota {date} · biudžetas iki €{budget} · {count, plural, one {# variantas} few {# variantai} many {# variantų} other {# variantų}}",
    "configurator.trafficLow": "Žemas",
    "configurator.trafficMedium": "Vidutinis",
    "configurator.trafficHigh": "Aukštas",
    "configurator.steps.budget": "Biudžetas",
    "companyFields.viesInvalid": "PVM mokėtojo kodas negalėjo būti patvirtintas per VIES",
  },
};

function applyManualFixes(obj, locale, prefix = "") {
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      applyManualFixes(val, locale, path);
    } else if (typeof val === "string" && MANUAL_FIXES[locale]?.[path]) {
      obj[key] = MANUAL_FIXES[locale][path];
    }
  }
}

function reorderLike(source, translated) {
  if (Array.isArray(source)) {
    return source.map((_, i) => reorderLike(source[i], translated[i]));
  }
  if (source && typeof source === "object") {
    const out = {};
    for (const key of Object.keys(source)) {
      out[key] = reorderLike(source[key], translated[key]);
    }
    return out;
  }
  return translated;
}

async function translateFile(sourcePath, targetPath, locale) {
  const source = JSON.parse(readFileSync(sourcePath, "utf8"));
  console.log(`  → ${targetPath}`);
  const translated = await translateValue(source, locale);
  const ordered = reorderLike(source, translated);
  applyManualFixes(ordered, locale);
  if (ordered.localeSwitcher) {
    ordered.localeSwitcher = { label: LABEL[locale], ...LOCALE_NAMES };
  }
  writeFileSync(targetPath, `${JSON.stringify(ordered, null, 2)}\n`);
}

for (const locale of LOCALES) {
  console.log(`\n[${locale.toUpperCase()}] messages`);
  await translateFile(join(messagesDir, "en.json"), join(messagesDir, `${locale}.json`), locale);
  console.log(`[${locale.toUpperCase()}] legal`);
  await translateFile(join(legalDir, "en.json"), join(legalDir, `${locale}.json`), locale);
}
console.log("\nDone.");
