import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    poweredByHeader: false,

    async redirects() {
        return [
            {
                source: "/:path*",
                has: [{ type: "host", value: "www.serverpunt.com" }],
                destination: "https://serverpunt.com/:path*",
                permanent: true,
            },
        ];
    },

    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                ],
            },
        ];
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: "10mb", // Increase for server actions if needed
        },
    },
};

export default withNextIntl(nextConfig);
