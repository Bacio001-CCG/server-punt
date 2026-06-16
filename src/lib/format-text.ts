/** Korte weergave met ellipsis voor UI. */
export function truncateText(
    text: string | undefined | null,
    maxLength: number
): string {
    if (!text) return "";
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}
