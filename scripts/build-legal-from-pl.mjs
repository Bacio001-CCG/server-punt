#!/usr/bin/env node
/**
 * Builds legal locale files by applying string maps to the Polish legal template.
 * Polish file is structurally identical to en; maps translate PL strings to target locale.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = join(__dirname, "..", "messages", "legal");

const SKIP = /^(https?:\/\/|info@|ServerPunt \/ NetwerkPunt|ServerPunt$|Kraaivenstraat|5048 AB Tilburg|📍|📧|Google Chrome|Mozilla Firefox|Microsoft Edge|Safari$|97831441|NL868250983B01)/;

function walkReplace(value, map) {
  if (typeof value === "string") {
    if (SKIP.test(value)) return value;
    return map[value] ?? value;
  }
  if (Array.isArray(value)) return value.map((v) => walkReplace(v, map));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = ["type", "id", "icon", "url"].includes(k) ? v : walkReplace(v, map);
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

async function build(locale, mapModule) {
  const en = JSON.parse(readFileSync(join(legalDir, "en.json"), "utf8"));
  const { map } = await mapModule;
  const translated = walkReplace(en, map);
  writeFileSync(join(legalDir, `${locale}.json`), `${JSON.stringify(translated, null, 2)}\n`);
  console.log(`Wrote legal/${locale}.json`);
}

const locale = process.argv[2];
if (!locale) {
  console.error("Usage: node build-legal-from-pl.mjs <ro|cs|hu|el>");
  process.exit(1);
}

const mod = await import(`./translation-data/legal-${locale}.mjs`);
await build(locale, mod);
