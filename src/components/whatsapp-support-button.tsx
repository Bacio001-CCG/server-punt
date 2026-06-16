"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type ChatMessage = {
    id: string;
    role: "support" | "user";
    text: string;
    timestamp: string;
};

type FormState = {
    name: string;
    email: string;
};

const initialFormState: FormState = {
    name: "",
    email: "",
};

export function WhatsAppSupportButton() {
    const t = useTranslations("whatsapp");
    const supportNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER;
    const suggestedMessage =
        process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_MESSAGE ??
        t("defaultMessage");

    const introMessages = useMemo<ChatMessage[]>(
        () => [
            {
                id: "intro-1",
                role: "support",
                text: t("intro1"),
                timestamp: t("now"),
            },
            {
                id: "intro-2",
                role: "support",
                text: t("intro2"),
                timestamp: t("now"),
            },
        ],
        [t]
    );

    const suggestedReplies = useMemo(
        () => [t("replyOrder"), t("replyReturn"), t("replyTechnical")],
        [t]
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(introMessages);
    const [draft, setDraft] = useState(suggestedMessage);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const supportLabel = useMemo(() => {
        if (!supportNumber) {
            return t("supportLabel");
        }

        return `${t("supportLabel")} · ${supportNumber}`;
    }, [supportNumber, t]);

    useEffect(() => {
        setMessages(introMessages);
    }, [introMessages]);

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            window.addEventListener("keydown", handleEscape);
        }

        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, statusMessage]);

    if (!supportNumber && process.env.NODE_ENV !== "production") {
        return (
            <div className="fixed bottom-6 right-6 z-[9999] rounded-full bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900 shadow">
                Set NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER
            </div>
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supportNumber) {
            setStatusMessage(t("missingNumber"));
            return;
        }

        const trimmedDraft = draft.trim();

        if (!trimmedDraft) {
            setStatusMessage(t("typeMessage"));
            return;
        }

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            text: trimmedDraft,
            timestamp: t("now"),
        };

        setMessages((current) => [...current, userMessage]);
        setDraft("");
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const response = await fetch("/api/whatsapp/support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formState,
                    message: trimmedDraft,
                    supportNumber,
                    pageUrl:
                        typeof window !== "undefined"
                            ? window.location.href
                            : undefined,
                }),
            });

            const result = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(result.error ?? "Failed to send support request");
            }

            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "support",
                    text: t("successReply"),
                    timestamp: t("now"),
                },
            ]);
            setStatusMessage(t("sent"));
            setFormState(initialFormState);
        } catch (error) {
            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "support",
                    text:
                        error instanceof Error
                            ? error.message
                            : t("sendError"),
                    timestamp: t("now"),
                },
            ]);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleQuickReply(reply: string) {
        setDraft(reply);
        setStatusMessage(null);
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
            <div
                className={cn(
                    "w-[min(92vw,24rem)] overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-2xl transition-all duration-200",
                    isOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0"
                )}
            >
                <div className="border-b border-border bg-gradient-to-r from-green-600 to-green-500 px-4 py-4 text-white">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-inner">
                                <FaWhatsapp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    {t("title")}
                                </p>
                                <p className="text-xs text-white/80">
                                    {t("subtitle")}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-full px-2 py-1 text-lg leading-none text-white/80 transition hover:bg-white/10 hover:text-white"
                            aria-label={t("closeLabel")}
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="max-h-[26rem] space-y-3 overflow-y-auto px-4 py-4"
                >
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex",
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                                    message.role === "user"
                                        ? "rounded-br-md bg-green-600 text-white"
                                        : "rounded-bl-md bg-muted text-foreground"
                                )}
                            >
                                <p>{message.text}</p>
                                <p
                                    className={cn(
                                        "mt-1 text-[10px]",
                                        message.role === "user"
                                            ? "text-white/70"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {message.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}

                    {statusMessage ? (
                        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            {statusMessage}
                        </div>
                    ) : null}
                </div>

                <div className="space-y-3 border-t border-border bg-background px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                        {suggestedReplies.map((reply) => (
                            <button
                                key={reply}
                                type="button"
                                onClick={() => handleQuickReply(reply)}
                                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-green-500 hover:text-green-700"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="rounded-2xl border border-border bg-muted/30 p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDetails((current) => !current)
                                    }
                                    className="text-left text-xs font-medium text-muted-foreground transition hover:text-foreground"
                                >
                                    {t("optionalDetails")}
                                </button>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    {t("details")}
                                </span>
                            </div>

                            {showDetails ? (
                                <div className="space-y-3">
                                    <Input
                                        value={formState.name}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                        placeholder={t("namePlaceholder")}
                                        autoComplete="name"
                                    />
                                    <Input
                                        type="email"
                                        value={formState.email}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                email: event.target.value,
                                            }))
                                        }
                                        placeholder={t("emailPlaceholder")}
                                        autoComplete="email"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-end gap-2 rounded-full border border-border bg-background px-3 py-2 shadow-sm">
                            <textarea
                                value={draft}
                                onChange={(event) =>
                                    setDraft(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                placeholder={suggestedMessage}
                                rows={1}
                                className="max-h-28 min-h-10 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                size="icon"
                                className="h-10 w-10 rounded-full bg-green-600 text-white hover:bg-green-700"
                            >
                                {isSubmitting ? "…" : "→"}
                            </Button>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            {t("sendHint")}
                        </p>
                    </form>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-label={supportLabel}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
                <FaWhatsapp className="h-7 w-7" />
            </button>
        </div>
    );
}
