/** Env vars required for the site WhatsApp support bubble. */
export const WHATSAPP_WIDGET_REQUIRED_ENV = [
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER",
] as const;

function isEnvPresent(name: string): boolean {
    const value = process.env[name];
    return typeof value === "string" && value.trim().length > 0;
}

/** True when every required WhatsApp env var is set (non-empty). */
export function isWhatsAppWidgetConfigured(): boolean {
    return WHATSAPP_WIDGET_REQUIRED_ENV.every(isEnvPresent);
}
