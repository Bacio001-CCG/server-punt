import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const AI_RATE_LIMIT_PER_MINUTE = 20;
const AI_RATE_LIMIT_WINDOW_MS = 60_000;

let rateLimitedThisRequest = false;

export function resetAiRateLimitRequestFlag(): void {
    rateLimitedThisRequest = false;
}

export function wasAiRateLimitedThisRequest(): boolean {
    return rateLimitedThisRequest;
}

async function getClientIp(): Promise<string> {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }
    return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "unknown";
}

/**
 * Returns true if an OpenAI configurator call may proceed.
 * When false, callers should fall back to heuristic selection.
 */
export async function consumeAiRateLimitSlot(): Promise<boolean> {
    const ip = await getClientIp();
    const result = checkRateLimit(
        `configurator-ai:${ip}`,
        AI_RATE_LIMIT_PER_MINUTE,
        AI_RATE_LIMIT_WINDOW_MS
    );

    if (!result.allowed) {
        rateLimitedThisRequest = true;
        return false;
    }

    return true;
}
