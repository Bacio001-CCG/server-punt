import { NextRequest, NextResponse } from "next/server";
import {
    sendWhatsAppTemplateMessage,
    sendWhatsAppTextMessage,
} from "@/lib/whatsapp";

type TemplateParameter = {
    type: "text";
    text: string;
};

type SendMessageRequest = {
    to?: string;
    message?: string;
    templateName?: string;
    languageCode?: string;
    parameters?: TemplateParameter[];
};

export async function POST(request: NextRequest) {
    const expectedApiKey = process.env.WHATSAPP_INTERNAL_API_KEY;
    const providedApiKey = request.headers.get("x-api-key");

    if (expectedApiKey && providedApiKey !== expectedApiKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: SendMessageRequest;
    try {
        payload = (await request.json()) as SendMessageRequest;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!payload.to) {
        return NextResponse.json(
            { error: "Missing required field: to" },
            { status: 400 }
        );
    }

    try {
        const isTemplateMessage =
            Boolean(payload.templateName) || Boolean(payload.languageCode) ||
            Boolean(payload.parameters);

        if (isTemplateMessage) {
            if (!payload.templateName || !payload.languageCode) {
                return NextResponse.json(
                    {
                        error:
                            "Missing required fields for template message: templateName, languageCode",
                    },
                    { status: 400 }
                );
            }

            if (!payload.parameters || payload.parameters.length === 0) {
                return NextResponse.json(
                    {
                        error:
                            "Missing required field for template message: parameters",
                    },
                    { status: 400 }
                );
            }

            const result = await sendWhatsAppTemplateMessage({
                to: payload.to,
                templateName: payload.templateName,
                languageCode: payload.languageCode,
                parameters: payload.parameters,
            });

            return NextResponse.json({ ok: true, result });
        }

        if (!payload.message) {
            return NextResponse.json(
                { error: "Missing required field for text message: message" },
                { status: 400 }
            );
        }

        const result = await sendWhatsAppTextMessage({
            to: payload.to,
            body: payload.message,
        });

        return NextResponse.json({ ok: true, result });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to send message",
            },
            { status: 500 }
        );
    }
}
