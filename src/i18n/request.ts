import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import type { LocaleCode } from "./locales";

import nlMessages from "../../messages/nl.json";
import enMessages from "../../messages/en.json";
import deMessages from "../../messages/de.json";
import frMessages from "../../messages/fr.json";
import esMessages from "../../messages/es.json";
import itMessages from "../../messages/it.json";
import ptMessages from "../../messages/pt.json";
import plMessages from "../../messages/pl.json";
import roMessages from "../../messages/ro.json";
import csMessages from "../../messages/cs.json";
import huMessages from "../../messages/hu.json";
import elMessages from "../../messages/el.json";
import bgMessages from "../../messages/bg.json";
import hrMessages from "../../messages/hr.json";
import skMessages from "../../messages/sk.json";
import slMessages from "../../messages/sl.json";
import daMessages from "../../messages/da.json";
import svMessages from "../../messages/sv.json";
import fiMessages from "../../messages/fi.json";
import etMessages from "../../messages/et.json";
import lvMessages from "../../messages/lv.json";
import ltMessages from "../../messages/lt.json";

import nlLegal from "../../messages/legal/nl.json";
import enLegal from "../../messages/legal/en.json";
import deLegal from "../../messages/legal/de.json";
import frLegal from "../../messages/legal/fr.json";
import esLegal from "../../messages/legal/es.json";
import itLegal from "../../messages/legal/it.json";
import ptLegal from "../../messages/legal/pt.json";
import plLegal from "../../messages/legal/pl.json";
import roLegal from "../../messages/legal/ro.json";
import csLegal from "../../messages/legal/cs.json";
import huLegal from "../../messages/legal/hu.json";
import elLegal from "../../messages/legal/el.json";
import bgLegal from "../../messages/legal/bg.json";
import hrLegal from "../../messages/legal/hr.json";
import skLegal from "../../messages/legal/sk.json";
import slLegal from "../../messages/legal/sl.json";
import daLegal from "../../messages/legal/da.json";
import svLegal from "../../messages/legal/sv.json";
import fiLegal from "../../messages/legal/fi.json";
import etLegal from "../../messages/legal/et.json";
import lvLegal from "../../messages/legal/lv.json";
import ltLegal from "../../messages/legal/lt.json";

const messages: Record<LocaleCode, Record<string, unknown>> = {
    nl: nlMessages,
    en: enMessages,
    de: deMessages,
    fr: frMessages,
    es: esMessages,
    it: itMessages,
    pt: ptMessages,
    pl: plMessages,
    ro: roMessages,
    cs: csMessages,
    hu: huMessages,
    el: elMessages,
    bg: bgMessages,
    hr: hrMessages,
    sk: skMessages,
    sl: slMessages,
    da: daMessages,
    sv: svMessages,
    fi: fiMessages,
    et: etMessages,
    lv: lvMessages,
    lt: ltMessages,
};

const legal: Record<LocaleCode, Record<string, unknown>> = {
    nl: nlLegal,
    en: enLegal,
    de: deLegal,
    fr: frLegal,
    es: esLegal,
    it: itLegal,
    pt: ptLegal,
    pl: plLegal,
    ro: roLegal,
    cs: csLegal,
    hu: huLegal,
    el: elLegal,
    bg: bgLegal,
    hr: hrLegal,
    sk: skLegal,
    sl: slLegal,
    da: daLegal,
    sv: svLegal,
    fi: fiLegal,
    et: etLegal,
    lv: lvLegal,
    lt: ltLegal,
};

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? (requested as LocaleCode)
        : routing.defaultLocale;

    return {
        locale,
        messages: { ...messages[locale], ...legal[locale] },
    };
});
