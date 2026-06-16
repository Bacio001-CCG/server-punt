#!/usr/bin/env python3
import json
import re
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "messages"
LEGAL = MESSAGES / "legal"

LOCALE_NAMES = {
    "nl": "Nederlands", "en": "English", "de": "Deutsch", "fr": "Français",
    "es": "Español", "it": "Italiano", "pt": "Português", "pl": "Polski",
    "ro": "Română", "cs": "Čeština", "hu": "Magyar", "el": "Ελληνικά",
    "bg": "Български", "hr": "Hrvatski", "sk": "Slovenčina", "sl": "Slovenščina",
    "da": "Dansk", "sv": "Svenska", "fi": "Suomi", "et": "Eesti",
    "lv": "Latviešu", "lt": "Lietuvių",
}
LABEL = {
    "bg": "Език", "hr": "Jezik", "sk": "Jazyk", "sl": "Jezik", "da": "Sprog",
    "sv": "Språk", "fi": "Kieli", "et": "Keel", "lv": "Valoda", "lt": "Kalba",
}
SKIP_KEYS = {"type", "id", "icon", "url"}
SKIP_PATTERNS = [
    re.compile(r"^https?://"),
    re.compile(r"^info@"),
    re.compile(r"^ServerPunt,"),
    re.compile(r"^📍"),
    re.compile(r"^📧$"),
    re.compile(r"^Kraaivenstraat"),
    re.compile(r"^5048 AB"),
    re.compile(r"^Chamber of Commerce: 97831441$"),
    re.compile(r"^VAT( number)?: NL868250983B01$"),
    re.compile(r"^VAT: NL868250983B01$"),
]
PROTECT = re.compile(r"(\{[^}]+\}|</?[a-zA-Z]+>)")

MANUAL_FIXES = {
    "lv": {
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
    "lt": {
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
}

cache = {}


def should_skip(text: str) -> bool:
    return any(p.search(text) for p in SKIP_PATTERNS)


def protect(text: str):
    tokens = []

    def repl(match):
        tokens.append(match.group(0))
        return f"⟦{len(tokens) - 1}⟧"

    return PROTECT.sub(repl, text), tokens


def restore(text: str, tokens):
    def repl(match):
        idx = int(match.group(1))
        return tokens[idx] if idx < len(tokens) else match.group(0)

    return re.sub(r"⟦(\d+)⟧", repl, text)


def translate_text(text: str, locale: str) -> str:
    if not text or should_skip(text):
        return text
    key = f"{locale}::{text}"
    if key in cache:
        return cache[key]

    protected, tokens = protect(text)
    translator = GoogleTranslator(source="en", target=locale)
    for attempt in range(5):
        try:
            result = restore(translator.translate(protected), tokens)
            cache[key] = result
            time.sleep(0.15)
            return result
        except Exception as exc:
            print(f"  retry {attempt + 1}: {exc}", flush=True)
            time.sleep(2 * (attempt + 1))
    cache[key] = text
    return text


def translate_value(value, locale, path=""):
    if isinstance(value, str):
        if path.startswith("localeSwitcher.") and path != "localeSwitcher.label":
            code = path.split(".")[1]
            return LOCALE_NAMES.get(code, value)
        return translate_text(value, locale)
    if isinstance(value, list):
        return [translate_value(item, locale, f"{path}[{i}]") for i, item in enumerate(value)]
    if isinstance(value, dict):
        out = {}
        for key, val in value.items():
            child = f"{path}.{key}" if path else key
            out[key] = val if key in SKIP_KEYS else translate_value(val, locale, child)
        return out
    return value


def apply_manual_fixes(obj, locale, prefix=""):
    if isinstance(obj, dict):
        for key, val in obj.items():
            path = f"{prefix}.{key}" if prefix else key
            if isinstance(val, dict):
                apply_manual_fixes(val, locale, path)
            elif isinstance(val, str) and path in MANUAL_FIXES.get(locale, {}):
                obj[key] = MANUAL_FIXES[locale][path]


def reorder_like(source, translated):
    if isinstance(source, list):
        return [reorder_like(source[i], translated[i]) for i in range(len(source))]
    if isinstance(source, dict):
        return {key: reorder_like(source[key], translated[key]) for key in source}
    return translated


def translate_file(source_path: Path, target_path: Path, locale: str):
    print(f"  → {target_path}", flush=True)
    source = json.loads(source_path.read_text())
    translated = translate_value(source, locale)
    ordered = reorder_like(source, translated)
    apply_manual_fixes(ordered, locale)
    if "localeSwitcher" in ordered:
        ordered["localeSwitcher"] = {"label": LABEL[locale], **LOCALE_NAMES}
    target_path.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n")


def main():
    locales = sys.argv[1:]
    if not locales:
        print("Usage: translate-locales-python.py <locale>...", file=sys.stderr)
        sys.exit(1)

    for locale in locales:
        print(f"\n[{locale.upper()}] messages", flush=True)
        translate_file(MESSAGES / "en.json", MESSAGES / f"{locale}.json", locale)
        print(f"[{locale.upper()}] legal", flush=True)
        translate_file(LEGAL / "en.json", LEGAL / f"{locale}.json", locale)
    print("\nDone.", flush=True)


if __name__ == "__main__":
    main()
