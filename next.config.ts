import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
