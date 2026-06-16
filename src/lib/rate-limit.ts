export type RateLimitResult = {
    allowed: boolean;
    /** Ms until the oldest request in the window expires (when not allowed). */
    retryAfterMs?: number;
    remaining: number;
};

const buckets = new Map<string, number[]>();

/**
 * In-memory sliding-window rate limit. Works per Node process; use Redis for
 * strict limits across multiple instances.
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = buckets.get(key) ?? [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
        const oldest = timestamps[0] ?? now;
        buckets.set(key, timestamps);
        return {
            allowed: false,
            retryAfterMs: Math.max(0, oldest + windowMs - now),
            remaining: 0,
        };
    }

    timestamps.push(now);
    buckets.set(key, timestamps);

    return {
        allowed: true,
        remaining: limit - timestamps.length,
    };
}
