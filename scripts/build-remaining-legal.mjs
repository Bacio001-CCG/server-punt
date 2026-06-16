#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = join(__dirname, "..", "messages", "legal");
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const SKIP = /^(https?:\/\/|info@|Kraaivenstraat|5048 AB|Chamber of Commerce|VAT:|📍|📧|Google Chrome|Mozilla Firefox|Microsoft Edge|Safari$)/;

function walkReplace(value, map) {
  if (typeof value === "string") {
    if (SKIP.test(value)) return value;
    return map[value] ?? value;
  }
  if (Array.isArray(value)) return value.map((v) => walkReplace(v, map));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SKIP_KEYS.has(k) ? v : walkReplace(v, map);
    }
    return out;
  }
  return value;
}

function reorderLike(source, translated) {
  if (Array.isArray(source)) return source.map((_, i) => reorderLike(source[i], translated[i]));
  if (source && typeof source === "object") {
    const out = {};
    for (const key of Object.keys(source)) out[key] = reorderLike(source[key], translated[key]);
    return out;
  }
  return translated;
}

function build(locale, sourceLocale, mapPath) {
  const en = JSON.parse(readFileSync(join(legalDir, "en.json"), "utf8"));
  const source = JSON.parse(readFileSync(join(legalDir, `${sourceLocale}.json`), "utf8"));
  const { map } = JSON.parse(readFileSync(mapPath, "utf8"));
  const translated = walkReplace(source, map);
  const ordered = reorderLike(en, translated);
  writeFileSync(join(legalDir, `${locale}.json`), `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`Wrote legal/${locale}.json (${Object.keys(map).length} map entries)`);
}

const locale = process.argv[2];
if (!locale) {
  console.error("Usage: node build-remaining-legal.mjs <fi|et|lt>");
  process.exit(1);
}

const configs = {
  fi: ["da", join(__dirname, "translation-data/legal-map-da-fi.json")],
  et: ["lv", join(__dirname, "translation-data/legal-map-lv-et.json")],
  lt: ["pl", join(__dirname, "translation-data/legal-map-pl-lt.json")],
};

const [sourceLocale, mapPath] = configs[locale];
build(locale, sourceLocale, mapPath);
