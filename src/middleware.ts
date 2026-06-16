import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getCanonicalHostname } from "./lib/seo";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const host = request.headers.get("host")?.split(":")[0] ?? "";
    const canonicalHost = getCanonicalHostname();

    if (host.startsWith("www.")) {
        const url = request.nextUrl.clone();
        url.protocol = "https:";
        url.host = canonicalHost;
        return NextResponse.redirect(url, 301);
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
