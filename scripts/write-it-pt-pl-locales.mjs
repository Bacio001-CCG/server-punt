#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const LOCALES = ["it", "pt", "pl"];
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const LOCALE_NAMES = {
  nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", it: "Italiano", pt: "Português", pl: "Polski",
  ro: "Română", cs: "Čeština", hu: "Magyar", el: "Ελληνικά",
  bg: "Български", hr: "Hrvatski", sk: "Slovenčina", sl: "Slovenščina",
  da: "Dansk", sv: "Svenska", fi: "Suomi", et: "Eesti",
  lv: "Latviešu", lt: "Lietuvių",
};
const LABEL = { it: "Lingua", pt: "Idioma", pl: "Język" };

const SKIP_PATTERNS = [/^https?:\/\//, /^info@/, /^ServerPunt,/];
const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const CONCURRENCY = 3;

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
        } catch (err) {
          attempts++;
          if (attempts === 1) console.warn(`  retry ${to}: ${protectedText.slice(0, 60)}… (${err.message})`);
          await sleep(1200 * attempts);
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
  it: {
    "metadata.title": "ServerPunt - Server e componenti convenienti | Hardware ricondizionato Europa",
    "common.exclVat": "IVA escl.",
    "common.inclVat": "IVA incl.",
    "common.refurbished": "Ricondizionato",
    "common.brandNewTooltip": "Non ricondizionato",
    "nav.home": "Home",
    "hero.titleHighlight": "server",
    "cart.orderButton": "Ordina ({price}) IVA escl.",
    "checkout.priceExclVat": "Prezzo IVA escl.",
    "footer.refurbishedNotice": "I prodotti ricondizionati possono presentare segni di utilizzo. La garanzia si applica in conformità con la nostra <warrantyLink>politica di garanzia</warrantyLink>.",
    "configurator.savedSessionDescription": "Salvato il {date} · budget fino a €{budget} · {count, plural, one {# opzione} other {# opzioni}}",
    "configurator.trafficLow": "Basso",
    "configurator.trafficMedium": "Medio",
    "configurator.trafficHigh": "Alto",
    "configurator.steps.budget": "Budget",
    "companyFields.viesInvalid": "Il numero di partita IVA non è stato verificato tramite VIES",
  },
  pt: {
    "metadata.title": "ServerPunt - Servidores e componentes acessíveis | Hardware recondicionado Europa",
    "common.exclVat": "Sem IVA",
    "common.inclVat": "IVA incl.",
    "common.refurbished": "Recondicionado",
    "common.brandNewTooltip": "Não recondicionado",
    "nav.home": "Início",
    "hero.titleHighlight": "servidores",
    "cart.orderButton": "Encomendar ({price}) sem IVA",
    "checkout.priceExclVat": "Preço sem IVA",
    "footer.refurbishedNotice": "Os produtos recondicionados podem apresentar sinais de utilização. A garantia aplica-se de acordo com a nossa <warrantyLink>política de garantia</warrantyLink>.",
    "configurator.savedSessionDescription": "Guardado em {date} · orçamento até €{budget} · {count, plural, one {# opção} other {# opções}}",
    "configurator.trafficLow": "Baixo",
    "configurator.trafficMedium": "Médio",
    "configurator.trafficHigh": "Alto",
    "configurator.steps.budget": "Orçamento",
    "companyFields.viesInvalid": "O número de IVA não pôde ser verificado através do VIES",
  },
  pl: {
    "metadata.title": "ServerPunt - Tanie serwery i komponenty | Odnowiony sprzęt IT Europa",
    "common.exclVat": "Bez VAT",
    "common.inclVat": "Z VAT",
    "common.refurbished": "Odnowiony",
    "common.brandNewTooltip": "Nieodnowiony",
    "nav.home": "Strona główna",
    "hero.titleHighlight": "serwery",
    "cart.orderButton": "Zamów ({price}) bez VAT",
    "checkout.priceExclVat": "Cena bez VAT",
    "footer.refurbishedNotice": "Produkty odnowione mogą nosić ślady użytkowania. Gwarancja obowiązuje zgodnie z naszą <warrantyLink>polityką gwarancyjną</warrantyLink>.",
    "configurator.savedSessionDescription": "Zapisano {date} · budżet do €{budget} · {count, plural, one {# opcja} few {# opcje} many {# opcji} other {# opcji}}",
    "configurator.trafficLow": "Niski",
    "configurator.trafficMedium": "Średni",
    "configurator.trafficHigh": "Wysoki",
    "configurator.steps.budget": "Budżet",
    "companyFields.viesInvalid": "Numer VAT nie mógł zostać zweryfikowany przez VIES",
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
