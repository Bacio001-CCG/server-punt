#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { translate } from "bing-translate-api";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const messagesDir = join(root, "messages");
const legalDir = join(messagesDir, "legal");

const LOCALES = ["bg", "hr", "sk", "sl", "da", "sv", "fi", "et", "lv", "lt"];
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
  bg: {
    "common.exclVat": "Без ДДС",
    "common.inclVat": "С ДДС",
    "common.vat": "ДДС",
    "common.refurbished": "Обновен",
    "common.brandNewTooltip": "Не е обновен",
    "hero.titleHighlight": "сървъри",
    "cart.orderButton": "Поръчай ({price}) без ДДС",
    "checkout.priceExclVat": "Цена без ДДС",
    "footer.refurbishedNotice": "Обновените продукти могат да имат следи от употреба. Гаранцията се прилага съгласно нашата <warrantyLink>гаранционна политика</warrantyLink>.",
    "configurator.savedSessionDescription": "Запазено на {date} · бюджет до €{budget} · {count, plural, one {# опция} other {# опции}}",
    "configurator.trafficLow": "Нисък",
    "configurator.trafficMedium": "Среден",
    "configurator.trafficHigh": "Висок",
    "configurator.steps.budget": "Бюджет",
    "companyFields.viesInvalid": "ДДС номерът не може да бъде потвърден чрез VIES",
  },
  hr: {
    "common.exclVat": "Bez PDV-a",
    "common.inclVat": "S PDV-om",
    "common.vat": "PDV",
    "common.refurbished": "Obnovljeno",
    "common.brandNewTooltip": "Nije obnovljeno",
    "nav.home": "Početna",
    "hero.titleHighlight": "poslužitelje",
    "cart.orderButton": "Naruči ({price}) bez PDV-a",
    "checkout.priceExclVat": "Cijena bez PDV-a",
    "footer.refurbishedNotice": "Obnovljeni proizvodi mogu imati tragove korištenja. Jamstvo se primjenjuje u skladu s našom <warrantyLink>politikom jamstva</warrantyLink>.",
    "configurator.savedSessionDescription": "Spremljeno {date} · proračun do €{budget} · {count, plural, one {# opcija} few {# opcije} other {# opcija}}",
    "configurator.trafficLow": "Nizak",
    "configurator.trafficMedium": "Srednji",
    "configurator.trafficHigh": "Visok",
    "configurator.steps.budget": "Proračun",
    "companyFields.viesInvalid": "PDV broj nije moguće potvrditi putem VIES-a",
  },
  sk: {
    "common.exclVat": "Bez DPH",
    "common.inclVat": "S DPH",
    "common.vat": "DPH",
    "common.refurbished": "Repasované",
    "common.brandNewTooltip": "Nie je repasované",
    "nav.home": "Domov",
    "hero.titleHighlight": "servery",
    "cart.orderButton": "Objednať ({price}) bez DPH",
    "checkout.priceExclVat": "Cena bez DPH",
    "footer.refurbishedNotice": "Repasované produkty môžu vykazovať známky používania. Záruka sa uplatňuje v súlade s našou <warrantyLink>záručnou politikou</warrantyLink>.",
    "configurator.savedSessionDescription": "Uložené {date} · rozpočet do €{budget} · {count, plural, one {# možnosť} few {# možnosti} many {# možností} other {# možností}}",
    "configurator.trafficLow": "Nízka",
    "configurator.trafficMedium": "Stredná",
    "configurator.trafficHigh": "Vysoká",
    "configurator.steps.budget": "Rozpočet",
    "companyFields.viesInvalid": "IČ DPH sa nepodarilo overiť cez VIES",
  },
  sl: {
    "common.exclVat": "Brez DDV",
    "common.inclVat": "Z DDV",
    "common.vat": "DDV",
    "common.refurbished": "Prenovljeno",
    "common.brandNewTooltip": "Ni prenovljeno",
    "nav.home": "Domov",
    "hero.titleHighlight": "strežnike",
    "cart.orderButton": "Naroči ({price}) brez DDV",
    "checkout.priceExclVat": "Cena brez DDV",
    "footer.refurbishedNotice": "Prenovljeni izdelki lahko kažejo znake uporabe. Garancija velja v skladu z našo <warrantyLink>garancijsko politiko</warrantyLink>.",
    "configurator.savedSessionDescription": "Shranjeno {date} · proračun do €{budget} · {count, plural, one {# možnost} two {# možnosti} few {# možnosti} other {# možnosti}}",
    "configurator.trafficLow": "Nizka",
    "configurator.trafficMedium": "Srednja",
    "configurator.trafficHigh": "Visoka",
    "configurator.steps.budget": "Proračun",
    "companyFields.viesInvalid": "ID za DDV ni bilo mogoče preveriti prek VIES",
  },
  da: {
    "common.exclVat": "Ekskl. moms",
    "common.inclVat": "Inkl. moms",
    "common.vat": "Moms",
    "common.refurbished": "Renoveret",
    "common.brandNewTooltip": "Ikke renoveret",
    "nav.home": "Forside",
    "hero.titleHighlight": "servere",
    "cart.orderButton": "Bestil ({price}) ekskl. moms",
    "checkout.priceExclVat": "Pris ekskl. moms",
    "footer.refurbishedNotice": "Renoverede produkter kan have tegn på brug. Garantien gælder i overensstemmelse med vores <warrantyLink>garantipolitik</warrantyLink>.",
    "configurator.savedSessionDescription": "Gemt den {date} · budget op til €{budget} · {count, plural, one {# mulighed} other {# muligheder}}",
    "configurator.trafficLow": "Lav",
    "configurator.trafficMedium": "Mellem",
    "configurator.trafficHigh": "Høj",
    "configurator.steps.budget": "Budget",
    "companyFields.viesInvalid": "Momsnummeret kunne ikke verificeres via VIES",
  },
  sv: {
    "common.exclVat": "Exkl. moms",
    "common.inclVat": "Inkl. moms",
    "common.vat": "Moms",
    "common.refurbished": "Renoverad",
    "common.brandNewTooltip": "Inte renoverad",
    "nav.home": "Hem",
    "hero.titleHighlight": "servrar",
    "cart.orderButton": "Beställ ({price}) exkl. moms",
    "checkout.priceExclVat": "Pris exkl. moms",
    "footer.refurbishedNotice": "Renoverade produkter kan ha tecken på användning. Garantin gäller i enlighet med vår <warrantyLink>garantipolicy</warrantyLink>.",
    "configurator.savedSessionDescription": "Sparad {date} · budget upp till €{budget} · {count, plural, one {# alternativ} other {# alternativ}}",
    "configurator.trafficLow": "Låg",
    "configurator.trafficMedium": "Medel",
    "configurator.trafficHigh": "Hög",
    "configurator.steps.budget": "Budget",
    "companyFields.viesInvalid": "Momsnumret kunde inte verifieras via VIES",
  },
  fi: {
    "common.exclVat": "Veroton",
    "common.inclVat": "Sis. ALV",
    "common.vat": "ALV",
    "common.refurbished": "Kunnostettu",
    "common.brandNewTooltip": "Ei kunnostettu",
    "nav.home": "Etusivu",
    "hero.titleHighlight": "palvelimet",
    "cart.orderButton": "Tilaa ({price}) veroton",
    "checkout.priceExclVat": "Hinta veroton",
    "footer.refurbishedNotice": "Kunnostetuissa tuotteissa voi olla käytön jälkiä. Takuu soveltuu <warrantyLink>takuukäytäntömme</warrantyLink> mukaisesti.",
    "configurator.savedSessionDescription": "Tallennettu {date} · budjetti enintään €{budget} · {count, plural, one {# vaihtoehto} other {# vaihtoehtoa}}",
    "configurator.trafficLow": "Matala",
    "configurator.trafficMedium": "Keskitaso",
    "configurator.trafficHigh": "Korkea",
    "configurator.steps.budget": "Budjetti",
    "companyFields.viesInvalid": "ALV-numeroa ei voitu vahvistaa VIES-järjestelmän kautta",
  },
  et: {
    "common.exclVat": "Ilma käibemaksuta",
    "common.inclVat": "Käibemaksuga",
    "common.vat": "Käibemaks",
    "common.refurbished": "Uuendatud",
    "common.brandNewTooltip": "Pole uuendatud",
    "nav.home": "Avaleht",
    "hero.titleHighlight": "serverid",
    "cart.orderButton": "Telli ({price}) ilma käibemaksuta",
    "checkout.priceExclVat": "Hind ilma käibemaksuta",
    "footer.refurbishedNotice": "Uuendatud toodetel võivad olla kasutusjäljed. Garantii kehtib vastavalt meie <warrantyLink>garantiipoliitikale</warrantyLink>.",
    "configurator.savedSessionDescription": "Salvestatud {date} · eelarve kuni €{budget} · {count, plural, one {# valik} other {# valikut}}",
    "configurator.trafficLow": "Madal",
    "configurator.trafficMedium": "Keskmine",
    "configurator.trafficHigh": "Kõrge",
    "configurator.steps.budget": "Eelarve",
    "companyFields.viesInvalid": "Käibemaksukohustuslase numbrit ei saanud VIES-i kaudu kinnitada",
  },
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
