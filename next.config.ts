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
    api: {
        bodyParser: {
            sizeLimit: "10mb", // Adjust this based on your needs
        },
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb", // Increase for server actions if needed
        },
    },
};

export default nextConfig;
