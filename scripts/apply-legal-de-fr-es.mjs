#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = join(__dirname, "..", "messages", "legal");
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const SKIP_EXACT = new Set(["ServerPunt", "ServerPunt / NetwerkPunt", ""]);
const SKIP = /^(https?:\/\/|info@|📍|📧|Google Chrome|Mozilla Firefox|Microsoft Edge|Safari$|97831441|NL868250983B01)/;
const SKIP_ADDR = /^ServerPunt, Kraaivenstraat/;

function shouldSkip(value) {
  return SKIP.test(value) || SKIP_ADDR.test(value) || SKIP_EXACT.has(value);
}

function applyMap(value, map) {
  if (typeof value === "string") {
    return shouldSkip(value) ? value : (map[value] ?? value);
  }
  if (Array.isArray(value)) return value.map((v) => applyMap(v, map));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SKIP_KEYS.has(k) ? v : applyMap(v, map);
    }
    return out;
  }
  return value;
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

const source = JSON.parse(readFileSync(join(legalDir, "en.json"), "utf8"));

for (const locale of ["de", "fr", "es"]) {
  const map = JSON.parse(
    readFileSync(join(__dirname, "translations", `legal-${locale}-map.json`), "utf8")
  );
  const translated = applyMap(source, map);
  const ordered = reorderLike(source, translated);
  writeFileSync(join(legalDir, `${locale}.json`), `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`Wrote legal/${locale}.json`);
}
