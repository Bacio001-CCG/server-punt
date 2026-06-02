import crypto from "node:crypto";

type SendTextMessageParams = {
    to: string;
    body: string;
    phoneNumberId?: string;
};

type TemplateParameter = {
    type: "text";
    text: string;
};

type SendTemplateMessageParams = {
    to: string;
    templateName: string;
    languageCode: string;
    parameters: TemplateParameter[];
    phoneNumberId?: string;
};

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function getWhatsAppGraphVersion() {
    return process.env.WHATSAPP_GRAPH_VERSION ?? "v25.0";
}

export function verifyWebhookChallenge(
    mode: string | null,
    token: string | null,
    challenge: string | null
) {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (!verifyToken) {
        throw new Error(
            "Missing required environment variable: WHATSAPP_WEBHOOK_VERIFY_TOKEN"
        );
    }

    if (mode === "subscribe" && token === verifyToken && challenge) {
        return challenge;
    }

    return null;
}

export function verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null
) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (!appSecret) {
        return true;
    }

    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex");
    const provided = signatureHeader.slice("sha256=".length);

    try {
        return crypto.timingSafeEqual(
            Buffer.from(provided, "hex"),
            Buffer.from(expected, "hex")
        );
    } catch {
        return false;
    }
}

export async function sendWhatsAppTextMessage({
    to,
    body,
    phoneNumberId,
}: SendTextMessageParams) {
    const token = getRequiredEnv("WHATSAPP_ACCESS_TOKEN");
    const senderPhoneNumberId =
        phoneNumberId ?? getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");

    const response = await fetch(
        `https://graph.facebook.com/${getWhatsAppGraphVersion()}/${senderPhoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: {
                    preview_url: false,
                    body,
                },
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            `WhatsApp API request failed (${response.status}): ${JSON.stringify(
                result
            )}`
        );
    }

    return result;
}

export async function sendWhatsAppTemplateMessage({
    to,
    templateName,
    languageCode,
    parameters,
    phoneNumberId,
}: SendTemplateMessageParams) {
    const token = getRequiredEnv("WHATSAPP_ACCESS_TOKEN");
    const senderPhoneNumberId =
        phoneNumberId ?? getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");

    const response = await fetch(
        `https://graph.facebook.com/${getWhatsAppGraphVersion()}/${senderPhoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: languageCode,
                    },
                    components: [
                        {
                            type: "body",
                            parameters,
                        },
                    ],
                },
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            `WhatsApp API request failed (${response.status}): ${JSON.stringify(
                result
            )}`
        );
    }

    return result;
}
