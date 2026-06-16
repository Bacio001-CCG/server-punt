#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, "..", "messages");

const FIXES = {
  de: {
    "hero.viewProducts": "Unsere Produkte ansehen",
    "cookie.decline": "Ablehnen",
    "products.stock": "Lagerbestand",
    "featured.previous": "Zurück",
    "featured.next": "Weiter",
    "configurator.pageSubtitle":
      "Sagen Sie uns, wofür Sie den Server nutzen werden, wie viel Kapazität Sie benötigen und wie hoch Ihr Budget ist. Wir kombinieren Server, Arbeitsspeicher und Speicher aus unserem Bestand zu konkreten Optionen.",
    "configurator.budgetSubtitle":
      "Gesamtbetrag zzgl. MwSt. für Hardware – wir durchsuchen unseren aktuellen Bestand.",
    "configurator.budgetInclVat": "inkl. MwSt. ca. €{amount}",
    "configurator.composing": "Konfiguration wird erstellt…",
    "configurator.next": "Weiter",
    "configurator.startOver": "Neu beginnen",
    "companyFields.optional": "optional",
  },
  fr: {
    "common.backToHome": "Retour à l'accueil",
    "common.order": "Commander",
    "nav.aboutUs": "À propos",
    "footer.copyright": "© {year} ServerPunt VOF. Tous droits réservés.",
    "cookie.decline": "Refuser",
    "products.stock": "Stock",
    "featured.previous": "Précédent",
    "featured.next": "Suivant",
    "product.total": "Total :",
    "configurator.steps.details": "Spécifications",
    "configurator.detailsTitle": "Spécifications",
    "configurator.back": "Retour",
    "configurator.budgetSubtitle":
      "Montant total HT pour le matériel — nous parcourons notre inventaire actuel.",
    "configurator.composing": "Construction de la configuration…",
    "configurator.roles.server": "Serveur",
    "configurator.roles.memory": "RAM",
    "companyFields.optional": "facultatif",
    "companyFields.names.nipNumber": "Numéro NIP",
    "companyFields.hintDkVat": "DK + 8 chiffres, par ex. DK12345678",
    "companyFields.hintBgVat": "BG + 9-10 chiffres",
    "companyFields.hintLvVat": "LV + 11 chiffres",
  },
  es: {
    "common.backToHome": "Volver al inicio",
    "common.openCart": "Abrir carrito",
    "common.order": "Pedir",
    "common.brandNew": "Nuevo",
    "common.brandNewTooltip": "No reacondicionado",
    "common.addToCart": "Añadir al carrito",
    "common.viewAllResults": "Ver los {count} resultados",
    "nav.home": "Inicio",
    "nav.aboutUs": "Sobre nosotros",
    "hero.title": "Tu punto único para",
    "hero.titleHighlight": "servidores",
    "hero.contactUs": "Contáctenos",
    "cart.orderButton": "Pedir ({price}) sin IVA",
    "checkout.pickup": "Recoger",
    "checkout.firstname": "Nombre",
    "checkout.address": "Dirección",
    "checkout.priceExclVat": "Precio sin IVA",
    "footer.company": "Empresa",
    "footer.aboutUs": "Sobre nosotros",
    "cookie.title": "Usamos cookies",
    "products.featured": "Destacados",
    "featured.title": "Más vendidos",
    "featured.previous": "Anterior",
    "featured.next": "Siguiente",
    "featured.goToSlide": "Ir a la diapositiva {index}",
    "configurator.steps.details": "Especificaciones",
    "configurator.detailsTitle": "Especificaciones",
    "configurator.composing": "Montando configuración…",
    "configurator.next": "Siguiente",
    "configurator.recommended": "Recomendado",
    "configurator.roles.server": "Servidor",
    "whatsapp.supportLabel": "Soporte WhatsApp",
    "whatsapp.replyReturn": "Quiero devolver algo",
    "whatsapp.replyTechnical": "Tengo una pregunta técnica",
    "companyFields.hintHrVat": "HR + 11 dígitos",
    "companyFields.hintLvVat": "LV + 11 dígitos",
  },
};

const LEGAL_FIXES = {
  de: {
    "tos.sections[0].blocks[1].items[0].term": "ServerPunt / NetwerkPunt",
    "tos.sections[0].blocks[1].items[1].term": "Kunde",
    "tos.sections[0].blocks[1].items[2].term": "Verbraucher",
    "tos.sections[0].blocks[1].items[6].term": "Refurbished",
  },
  es: {
    "tos.sections[0].blocks[1].items[0].term": "ServerPunt / NetwerkPunt",
    "tos.sections[0].blocks[1].items[2].term": "Consumidor",
    "tos.sections[0].blocks[1].items[7].term": "Reacondicionado",
  },
};

function setPath(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function applyFixes(filePath, fixes) {
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  for (const [path, value] of Object.entries(fixes)) {
    setPath(data, path, value);
  }
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

for (const locale of ["de", "fr", "es"]) {
  applyFixes(join(messagesDir, `${locale}.json`), FIXES[locale]);
  if (LEGAL_FIXES[locale]) {
    applyFixes(join(messagesDir, "legal", `${locale}.json`), LEGAL_FIXES[locale]);
  }
}

console.log("Polish complete.");
