import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    poweredByHeader: false,

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
