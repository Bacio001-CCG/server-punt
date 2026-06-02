import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp";

type SupportRequestBody = {
    name?: string;
    email?: string;
    message?: string;
    supportNumber?: string;
    pageUrl?: string;
};

function sanitizePhoneNumber(value: string) {
    return value.replace(/[^0-9]/g, "");
}

export async function POST(request: NextRequest) {
    let body: SupportRequestBody;

    try {
        body = (await request.json()) as SupportRequestBody;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const supportNumber = body.supportNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER;
    const message = body.message?.trim();

    if (!supportNumber) {
        return NextResponse.json(
            { error: "Missing WhatsApp support number" },
            { status: 400 }
        );
    }

    if (!message) {
        return NextResponse.json(
            { error: "Missing required field: message" },
            { status: 400 }
        );
    }

    const supportMessage = [
        "Nieuwe supportvraag vanaf de website:",
        body.name ? `Naam: ${body.name}` : null,
        body.email ? `E-mail: ${body.email}` : null,
        body.pageUrl ? `Pagina: ${body.pageUrl}` : null,
        `Bericht: ${message}`,
    ]
        .filter(Boolean)
        .join("\n");

    try {
        const result = await sendWhatsAppTextMessage({
            to: sanitizePhoneNumber(supportNumber),
            body: supportMessage,
        });

        return NextResponse.json({ ok: true, result });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to send support request",
            },
            { status: 500 }
        );
    }
}
