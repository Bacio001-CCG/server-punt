/**
 * Validates EU VAT numbers via the official VIES REST API.
 * @see https://ec.europa.eu/taxation_customs/vies/
 */
export async function verifyVatWithVies(
    countryCode: string,
    vatNumber: string
): Promise<{ valid: boolean; name?: string; unavailable?: boolean }> {
    try {
        const response = await fetch(
            "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    countryCode,
                    vatNumber,
                }),
                signal: AbortSignal.timeout(8000),
            }
        );

        if (!response.ok) {
            return { valid: false, unavailable: true };
        }

        const data = (await response.json()) as {
            valid?: boolean;
            userError?: string;
            name?: string;
        };

        if (data.userError === "MS_UNAVAILABLE" || data.userError === "TIMEOUT") {
            return { valid: false, unavailable: true };
        }

        return { valid: data.valid === true, name: data.name };
    } catch {
        return { valid: false, unavailable: true };
    }
}
