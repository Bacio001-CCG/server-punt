#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const locale = process.argv[2];
if (!locale) {
  console.error("Usage: node batch-translate-legal.mjs <ro|cs|hu|el>");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = join(__dirname, "..", "messages", "legal");
const SKIP = /^(https?:\/\/|info@|ServerPunt|Kraaivenstraat|5048 AB|📍|📧|Google Chrome|Mozilla Firefox|Microsoft Edge|Safari$|97831441|NL868250983B01)/;
const SKIP_KEYS = new Set(["type", "id", "icon", "url"]);
const DELIM = "\n⟦⟦⟦\n";
const DELAY = 4000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function collectStrings(value, out = []) {
  if (typeof value === "string") {
    if (!SKIP.test(value)) out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
    return out;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (!SKIP_KEYS.has(k)) collectStrings(v, out);
    }
  }
  return out;
}

function applyMap(value, map) {
  if (typeof value === "string") {
    if (SKIP.test(value)) return value;
    return map.get(value) ?? value;
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

async function translateBatch(strings, to) {
  const map = new Map();
  const unique = [...new Set(strings)];
  const chunks = [];
  let chunk = [];
  let len = 0;

  for (const s of unique) {
    const part = s + DELIM;
    if (len + part.length > 4500 && chunk.length) {
      chunks.push(chunk);
      chunk = [];
      len = 0;
    }
    chunk.push(s);
    len += part.length;
  }
  if (chunk.length) chunks.push(chunk);

  console.log(`Translating ${unique.length} strings in ${chunks.length} batches...`);

  for (let ci = 0; ci < chunks.length; ci++) {
    const batch = chunks[ci];
    const payload = batch.join(DELIM);
    let translated = payload;
    for (let attempt = 0; attempt < 5; attempt++) {
      await sleep(DELAY);
      try {
        const res = await translate(payload, {
          from: "en",
          to,
          client: "gtx",
          forceBatch: false,
        });
        translated = res.text;
        break;
      } catch (err) {
        console.warn(`Batch ${ci + 1} attempt ${attempt + 1}: ${err.message}`);
        await sleep(8000 * (attempt + 1));
      }
    }
    const parts = translated.split(DELIM);
    if (parts.length !== batch.length) {
      console.warn(`Batch ${ci + 1} size mismatch: ${batch.length} -> ${parts.length}, falling back to per-string`);
      for (const s of batch) {
        await sleep(DELAY);
        try {
          const res = await translate(s, { from: "en", to, client: "gtx", forceBatch: false });
          map.set(s, res.text);
        } catch {
          map.set(s, s);
        }
      }
    } else {
      batch.forEach((s, i) => map.set(s, parts[i]));
    }
    console.log(`Batch ${ci + 1}/${chunks.length} done`);
  }

  return map;
}

const source = JSON.parse(readFileSync(join(legalDir, "en.json"), "utf8"));
const strings = collectStrings(source);
const map = await translateBatch(strings, locale);
const translated = applyMap(source, map);
writeFileSync(join(legalDir, `${locale}.json`), `${JSON.stringify(translated, null, 2)}\n`);
console.log(`Wrote legal/${locale}.json`);
