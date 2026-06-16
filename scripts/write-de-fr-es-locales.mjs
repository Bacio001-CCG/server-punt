#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { translate } from "bing-translate-api";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const LOCALES = ["de", "fr", "es"];
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const LOCALE_NAMES = {
  nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", it: "Italiano", pt: "Português", pl: "Polski",
  ro: "Română", cs: "Čeština", hu: "Magyar", el: "Ελληνικά",
  bg: "Български", hr: "Hrvatski", sk: "Slovenčina", sl: "Slovenščina",
  da: "Dansk", sv: "Svenska", fi: "Suomi", et: "Eesti",
  lv: "Latviešu", lt: "Lietuvių",
};
const LABEL = { de: "Sprache", fr: "Langue", es: "Idioma" };

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
];
const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const CONCURRENCY = 3;
const REQUEST_DELAY_MS = 250;

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
      while (attempts < 5) {
        try {
          await sleep(REQUEST_DELAY_MS);
          const res = await translate(protectedText, "en", to);
          result = restorePlaceholders(res.translation, tokens);
          break;
        } catch {
          attempts++;
          await sleep(1000 * attempts);
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
        if (SKIP_KEYS.has(key)) {
          out[key] = val;
        } else {
          out[key] = await translateValue(val, to, childPath);
        }
      })
    );
    return out;
  }
  return value;
}

const MANUAL_FIXES = {
  de: {
    "common.order": "Bestellen",
    "common.base": "Basis",
    "common.refurbished": "Refurbished",
    "common.brandNewTooltip": "Nicht refurbished",
    "nav.home": "Startseite",
    "hero.titleHighlight": "Server",
    "checkout.priceExclVat": "Preis zzgl. MwSt.",
    "companyFields.viesInvalid": "Umsatzsteuer-Identifikationsnummer konnte nicht über VIES verifiziert werden",
    "configurator.savedSessionDescription": "Gespeichert am {date} · Budget bis zu €{budget} · {count, plural, one {# Option} other {# Optionen}}",
    "configurator.steps.budget": "Budget",
    "configurator.trafficMedium": "Mittel",
    "configurator.trafficLow": "Niedrig",
    "configurator.trafficHigh": "Hoch",
  },
  fr: {
    "metadata.title": "ServerPunt - Serveurs et composants abordables | Matériel reconditionné Europe",
    "common.exclVat": "HT",
    "common.inclVat": "TTC",
    "common.vat": "TVA",
    "common.total": "Total",
    "nav.home": "Accueil",
    "hero.titleHighlight": "serveurs",
    "hero.title": "Votre partenaire unique pour les",
    "cart.orderButton": "Commander ({price}) HT",
    "checkout.priceExclVat": "Prix HT",
    "checkout.pickup": "Retrait",
    "configurator.savedSessionDescription": "Enregistré le {date} · budget jusqu'à €{budget} · {count, plural, one {# option} other {# options}}",
    "configurator.trafficMedium": "Moyen",
    "configurator.trafficLow": "Faible",
    "configurator.trafficHigh": "Élevé",
    "common.refurbished": "Reconditionné",
  },
  es: {
    "metadata.title": "ServerPunt - Servidores y componentes asequibles | Hardware reacondicionado Europa",
    "metadata.description": "Compre servidores reacondicionados, componentes de servidor y hardware informático en ServerPunt. Precios competitivos, máxima calidad. Servidores Dell, HP, IBM y más. Envío a toda la UE.",
    "metadata.ogTitle": "ServerPunt - Servidores reacondicionados y componentes a precios asequibles",
    "metadata.ogDescription": "Especialistas en servidores reacondicionados y hardware informático. Servidores y componentes Dell, HP, IBM a precios competitivos. Entrega fiable y rápida en toda la UE.",
    "common.exclVat": "Sin IVA",
    "common.inclVat": "IVA incl.",
    "common.vat": "IVA",
    "configurator.savedSessionDescription": "Guardado el {date} · presupuesto hasta €{budget} · {count, plural, one {# opción} other {# opciones}}",
    "configurator.trafficMedium": "Medio",
    "configurator.trafficLow": "Bajo",
    "configurator.trafficHigh": "Alto",
    "common.refurbished": "Reacondicionado",
    "footer.refurbishedNotice": "Los productos reacondicionados pueden mostrar signos de uso. La garantía se aplica de acuerdo con nuestra <warrantyLink>política de garantía</warrantyLink>.",
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

async function main() {
  for (const locale of LOCALES) {
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
