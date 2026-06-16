#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const LOCALES = process.argv.slice(2).length ? process.argv.slice(2) : ["de", "fr"];
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
const SKIP_PATTERNS = [/^https?:\/\//, /^info@/, /^ServerPunt,/];
const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const NEVER_TRANSLATE = new Set([
  "Nederlands", "English", "Deutsch", "Français", "Español", "Italiano",
  "Português", "Polski", "Română", "Čeština", "Magyar", "Ελληνικά",
  "Български", "Hrvatski", "Slovenčina", "Slovenščina", "Dansk", "Svenska",
  "Suomi", "Eesti", "Latviešu", "Lietuvių", "Google Chrome", "Mozilla Firefox",
  "Microsoft Edge", "Safari", "ServerPunt", "WhatsApp", "Docker", "PostgreSQL",
  "Dell", "HP", "IBM", "NVMe", "RAID", "CI/CD", "NAS", "AD", "SQL", "NoSQL",
  "VMs", "RAM", "CPU", "VIES", "KBO/BCE", "SIREN", "NIF/CIF", "NIPC", "REA",
  "CVR", "NIP", "IČO", "CUI", "UIC", "OIB", "GEMI", "ARC", "Y-tunnus",
  "HRB", "HRA", "FN", "MI", "HE", "EL", "you@email.com",
]);

function shouldSkip(value, path) {
  if (!value || NEVER_TRANSLATE.has(value)) return true;
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
  const { protectedText, tokens } = protectPlaceholders(text);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await translate(protectedText, { from: "en", to, client: "gtx" });
      const out = restorePlaceholders(res.text, tokens);
      if (out && out !== text) return out;
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return text;
}

async function fillMissing(enVal, curVal, to, path = "") {
  if (typeof enVal === "string") {
    if (typeof curVal !== "string") return curVal;
    if (curVal !== enVal || shouldSkip(enVal, path)) return curVal;
    process.stdout.write(".");
    const translated = await translateText(enVal, to);
    await new Promise((r) => setTimeout(r, 200));
    return translated;
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

const OVERRIDES = {
  de: {
    "metadata.title": "ServerPunt – Erschwingliche Server und Komponenten | Refurbished Hardware Europa",
    "metadata.description": "Kaufen Sie refurbished Server, Serverkomponenten und IT-Hardware bei ServerPunt. Wettbewerbsfähige Preise, höchste Qualität. Dell-, HP-, IBM-Server und mehr. Versand in die gesamte EU.",
    "metadata.keywords": "refurbished server, serverkomponenten, dell server, hp server, ibm server, serverteile, it hardware, europa, günstige server, enterprise hardware",
    "metadata.ogTitle": "ServerPunt – Erschwingliche refurbished Server und Komponenten",
    "metadata.ogDescription": "Spezialist für refurbished Server und IT-Hardware. Dell-, HP-, IBM-Server und Komponenten zu wettbewerbsfähigen Preisen. Zuverlässige und schnelle Lieferung in der gesamten EU.",
    "common.exclVat": "zzgl. MwSt.",
    "common.inclVat": "inkl. MwSt.",
    "common.vat": "MwSt.",
    "common.loading": "Laden…",
    "common.backToHome": "Zurück zur Startseite",
    "common.refurbished": "Refurbished",
    "common.brandNewTooltip": "Nicht refurbished",
    "nav.home": "Startseite",
    "nav.products": "Produkte",
    "nav.configurator": "Konfigurator",
    "nav.categories": "Kategorien",
    "nav.brands": "Marken",
    "nav.aboutUs": "Über uns",
    "hero.title": "Ihr One-Stop-Shop für",
    "hero.titleHighlight": "Server",
    "cart.orderButton": "Bestellen ({price}) zzgl. MwSt.",
    "checkout.priceExclVat": "Preis zzgl. MwSt.",
    "companyFields.viesInvalid": "Umsatzsteuer-Identifikationsnummer konnte nicht über VIES verifiziert werden",
    "configurator.savedSessionDescription": "Gespeichert am {date} · Budget bis zu €{budget} · {count, plural, one {# Option} other {# Optionen}}",
    "configurator.steps.details": "Spezifikationen",
    "configurator.roles.storage": "Speicher",
  },
  fr: {
    "metadata.description": "Achetez des serveurs reconditionnés, des composants serveur et du matériel informatique chez ServerPunt. Prix compétitifs, qualité supérieure. Serveurs Dell, HP, IBM et plus. Expédition dans toute l'UE.",
    "metadata.keywords": "serveurs reconditionnés, composants serveur, serveurs dell, serveurs hp, serveurs ibm, pièces serveur, matériel informatique, europe, serveurs pas chers, matériel professionnel",
    "metadata.ogTitle": "ServerPunt - Serveurs reconditionnés et composants à prix abordable",
    "metadata.ogDescription": "Spécialiste des serveurs reconditionnés et du matériel informatique. Serveurs et composants Dell, HP, IBM à des prix compétitifs. Livraison fiable et rapide dans toute l'UE.",
    "common.loading": "Chargement…",
    "common.backToHome": "Retour à l'accueil",
    "common.backToHomepage": "Retour à la page d'accueil",
    "nav.products": "Produits",
    "nav.configurator": "Configurateur",
    "nav.categories": "Catégories",
    "nav.brands": "Marques",
    "nav.aboutUs": "À propos",
    "hero.subtitle": "Découvrez notre vaste sélection de serveurs de haute qualité, parfaitement adaptés aux besoins de votre entreprise. Fiabilité, performance et excellent service client",
    "configurator.savedSessionDescription": "Enregistré le {date} · budget jusqu'à €{budget} · {count, plural, one {# option} other {# options}}",
    "configurator.steps.details": "Spécifications",
    "legal/tos.contact.coc": "Chambre de commerce : 97831441",
  },
};

function applyOverrides(obj, locale, prefix = "", isLegal = false) {
  const key = isLegal ? `legal/${prefix}` : prefix;
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      applyOverrides(v, locale, path, isLegal);
    } else if (typeof v === "string") {
      const lookup = isLegal ? OVERRIDES[locale]?.[`legal/${path}`] : OVERRIDES[locale]?.[path];
      if (lookup) obj[k] = lookup;
    }
  }
}

async function processFile(enPath, curPath, outPath, locale, isLegal = false) {
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const cur = JSON.parse(readFileSync(curPath, "utf8"));
  console.log(`\nFilling ${outPath}`);
  const filled = await fillMissing(en, cur, locale);
  applyOverrides(filled, locale, "", isLegal);
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
