import { NextRequest, NextResponse } from "next/server";
import {
    sendWhatsAppTextMessage,
    verifyWebhookChallenge,
    verifyWebhookSignature,
} from "@/lib/whatsapp";

type WhatsAppTextMessage = {
    from: string;
    id: string;
    timestamp: string;
    text?: {
        body?: string;
    };
    type?: string;
};

type WhatsAppWebhookBody = {
    entry?: Array<{
        changes?: Array<{
            value?: {
                metadata?: {
                    phone_number_id?: string;
                };
                messages?: WhatsAppTextMessage[];
            };
        }>;
    }>;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    try {
        const verifiedChallenge = verifyWebhookChallenge(mode, token, challenge);

        if (verifiedChallenge) {
            return new NextResponse(verifiedChallenge, { status: 200 });
        }

        return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Webhook verification failed",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const signature = request.headers.get("x-hub-signature-256");
    const rawBody = await request.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let body: WhatsAppWebhookBody;
    try {
        body = JSON.parse(rawBody) as WhatsAppWebhookBody;
    } catch {
        return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const autoReply = process.env.WHATSAPP_SUPPORT_AUTO_REPLY_MESSAGE;

    const messages =
        body.entry
            ?.flatMap((entry) => entry.changes ?? [])
            .flatMap((change) =>
                (change.value?.messages ?? []).map((message) => ({
                    phoneNumberId: change.value?.metadata?.phone_number_id,
                    message,
                }))
            ) ?? [];

    for (const item of messages) {
        const inboundText = item.message.text?.body ?? "";
        console.log("[WhatsApp webhook] inbound message", {
            from: item.message.from,
            id: item.message.id,
            type: item.message.type,
            text: inboundText,
        });

        if (autoReply && item.message.from && item.message.type === "text") {
            try {
                await sendWhatsAppTextMessage({
                    to: item.message.from,
                    body: autoReply,
                    phoneNumberId: item.phoneNumberId,
                });
            } catch (error) {
                console.error("[WhatsApp webhook] auto-reply failed", error);
            }
        }
    }

    return NextResponse.json({ received: true });
}
