#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const locales = process.argv.slice(2);
if (!locales.length) {
  console.error("Usage: node fill-legal-missing.mjs <locale>...");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = join(__dirname, "..", "messages", "legal");
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const SKIP_PATTERNS = [/^https?:\/\//, /^info@/, /^ServerPunt,/];
const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const DELAY_MS = 3500;

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
  const { protectedText, tokens } = protectPlaceholders(text);
  for (let attempt = 0; attempt < 8; attempt++) {
    await sleep(DELAY_MS);
    try {
      const res = await translate(protectedText, {
        from: "en",
        to,
        client: "gtx",
        forceBatch: false,
      });
      return restorePlaceholders(res.text, tokens);
    } catch (err) {
      console.warn(`retry ${attempt + 1}: ${text.slice(0, 40)} (${err.message})`);
      await sleep(8000 * (attempt + 1));
    }
  }
  return text;
}

async function fillMissing(enVal, curVal, to, outPath, root) {
  if (typeof enVal === "string") {
    if (typeof curVal !== "string" || curVal !== enVal || shouldSkip(enVal)) return curVal;
    process.stdout.write(".");
    const translated = await translateText(enVal, to);
    writeFileSync(outPath, `${JSON.stringify(root, null, 2)}\n`);
    return translated;
  }
  if (Array.isArray(enVal)) {
    const out = [];
    for (let i = 0; i < enVal.length; i++) {
      out[i] = await fillMissing(enVal[i], curVal?.[i], to, outPath, root);
    }
    return out;
  }
  if (enVal && typeof enVal === "object") {
    const out = { ...curVal };
    for (const key of Object.keys(enVal)) {
      if (SKIP_KEYS.has(key)) {
        out[key] = enVal[key];
      } else {
        out[key] = await fillMissing(enVal[key], curVal?.[key], to, outPath, root);
        Object.assign(root, out);
      }
    }
    return out;
  }
  return curVal;
}

for (const locale of locales) {
  const enPath = join(legalDir, "en.json");
  const outPath = join(legalDir, `${locale}.json`);
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const cur = JSON.parse(readFileSync(outPath, "utf8"));
  console.log(`\nFilling legal/${locale}.json`);
  const root = { ...cur };
  const filled = await fillMissing(en, cur, locale, outPath, root);
  Object.assign(root, filled);
  writeFileSync(outPath, `${JSON.stringify(root, null, 2)}\n`);
}

console.log("\nDone.");
