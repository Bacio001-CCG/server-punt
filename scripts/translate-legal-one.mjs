#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const locale = process.argv[2];
if (!locale) {
  console.error("Usage: node translate-legal-one.mjs <locale>");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const legalDir = join(root, "messages", "legal");
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const PROTECT_REGEX = /(\{[^}]+\}|<\/?[a-zA-Z]+>)/g;
const SKIP_PATTERNS = [/^https?:\/\//, /^info@/, /^ServerPunt,/];
const DELAY_MS = 2500;

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

const cache = new Map();

async function translateText(text, to) {
  if (!text || shouldSkip(text)) return text;
  const cacheKey = `${to}::${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { protectedText, tokens } = protectPlaceholders(text);
  let result = text;

  for (let attempt = 0; attempt < 6; attempt++) {
    await sleep(DELAY_MS);
    try {
      const res = await translate(protectedText, {
        from: "en",
        to,
        client: "gtx",
        forceBatch: false,
      });
      result = restorePlaceholders(res.text, tokens);
      if (result !== text) break;
    } catch (err) {
      console.warn(`retry ${attempt + 1}: ${text.slice(0, 50)} (${err.message})`);
      await sleep(5000 * (attempt + 1));
    }
  }

  if (result === text && text.length > 3 && !shouldSkip(text)) {
    console.error(`FAILED: ${text.slice(0, 80)}`);
  }

  cache.set(cacheKey, result);
  return result;
}

async function translateValue(value, to) {
  if (typeof value === "string") return translateText(value, to);
  if (Array.isArray(value)) {
    const out = [];
    for (const v of value) out.push(await translateValue(v, to));
    return out;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SKIP_KEYS.has(key) ? val : await translateValue(val, to);
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
console.log(`Translating legal/${locale}.json...`);
const translated = await translateValue(source, locale);
const ordered = reorderLike(source, translated);
writeFileSync(join(legalDir, `${locale}.json`), `${JSON.stringify(ordered, null, 2)}\n`);
console.log("Done.");
