#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { translate } from "bing-translate-api";

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = join(dirname(__dirname), "messages", "legal");
const sourcePath = join(legalDir, "en.json");
const locales = ["ro", "cs", "hu", "el"];
const skipKeys = new Set(["type", "id", "icon", "url"]);

const protectedRegexes = [
  /\{[^}]+\}/g,
  /<\/?[a-zA-Z]+>/g,
  /https?:\/\/[^\s)]+/g,
  /info@serverpunt\.com/g,
  /Kraaivenstraat 36-07, 5048 AB Tilburg/g,
  /97831441/g,
  /NL868250983B01/g,
  /Google Chrome/g,
  /Mozilla Firefox/g,
  /Microsoft Edge/g,
  /Safari/g,
  /📍/g,
  /📧/g,
];

const cache = new Map();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function protectText(text) {
  let protectedText = text;
  const tokens = [];
  for (const regex of protectedRegexes) {
    protectedText = protectedText.replace(regex, (match) => {
      const token = `⟦${tokens.length}⟧`;
      tokens.push(match);
      return token;
    });
  }
  return { protectedText, tokens };
}

function restoreText(text, tokens) {
  return text.replace(/⟦(\d+)⟧/g, (_, i) => tokens[Number(i)] ?? "");
}

async function withRetries(fn, retries = 5) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await delay(500 * (attempt + 1));
    }
  }
  throw lastError;
}

async function translateText(text, locale) {
  if (!text) return text;
  if (/^https?:\/\//.test(text)) return text;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return text;

  const key = `${locale}::${text}`;
  if (cache.has(key)) return cache.get(key);

  const { protectedText, tokens } = protectText(text);
  const result = await withRetries(() => translate(protectedText, "en", locale));
  const restored = restoreText(result.translation, tokens);
  cache.set(key, restored);
  return restored;
}

async function translateValue(value, locale) {
  if (typeof value === "string") return translateText(value, locale);

  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await translateValue(item, locale));
    return out;
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = skipKeys.has(key) ? child : await translateValue(child, locale);
    }
    return out;
  }

  return value;
}

function assertSameStructure(source, candidate, path = "$") {
  if (Array.isArray(source)) {
    if (!Array.isArray(candidate) || source.length !== candidate.length) {
      throw new Error(`Array mismatch at ${path}`);
    }
    source.forEach((entry, i) => assertSameStructure(entry, candidate[i], `${path}[${i}]`));
    return;
  }

  if (source && typeof source === "object") {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error(`Object mismatch at ${path}`);
    }
    const sourceKeys = Object.keys(source);
    const candidateKeys = Object.keys(candidate);
    if (sourceKeys.length !== candidateKeys.length) {
      throw new Error(`Key count mismatch at ${path}`);
    }
    for (const key of sourceKeys) {
      if (!Object.prototype.hasOwnProperty.call(candidate, key)) {
        throw new Error(`Missing key ${path}.${key}`);
      }
      assertSameStructure(source[key], candidate[key], `${path}.${key}`);
    }
    return;
  }

  if (typeof source !== typeof candidate) {
    throw new Error(`Type mismatch at ${path}`);
  }
}

function assertProtectedLiteralsPreserved(source, candidate, path = "$") {
  if (typeof source === "string" && typeof candidate === "string") {
    const literals = [
      "info@serverpunt.com",
      "Kraaivenstraat 36-07, 5048 AB Tilburg",
      "97831441",
      "NL868250983B01",
      "Google Chrome",
      "Mozilla Firefox",
      "Microsoft Edge",
      "Safari",
      "📍",
      "📧",
    ];
    for (const literal of literals) {
      if (source.includes(literal) && !candidate.includes(literal)) {
        throw new Error(`Protected literal missing at ${path}: ${literal}`);
      }
    }
    return;
  }

  if (Array.isArray(source) && Array.isArray(candidate)) {
    source.forEach((entry, i) =>
      assertProtectedLiteralsPreserved(entry, candidate[i], `${path}[${i}]`)
    );
    return;
  }

  if (source && typeof source === "object" && candidate && typeof candidate === "object") {
    for (const key of Object.keys(source)) {
      assertProtectedLiteralsPreserved(source[key], candidate[key], `${path}.${key}`);
    }
  }
}

async function main() {
  const source = JSON.parse(readFileSync(sourcePath, "utf8"));
  for (const locale of locales) {
    console.log(`Translating legal/${locale}.json`);
    const translated = await translateValue(source, locale);
    assertSameStructure(source, translated);
    assertProtectedLiteralsPreserved(source, translated);
    const outPath = join(legalDir, `${locale}.json`);
    writeFileSync(outPath, `${JSON.stringify(translated, null, 2)}\n`);
    JSON.parse(readFileSync(outPath, "utf8"));
    console.log(`Wrote ${outPath}`);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
