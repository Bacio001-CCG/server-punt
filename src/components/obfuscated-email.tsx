"use client";

type ObfuscatedEmailProps = {
    className?: string;
};

export function ObfuscatedEmail({ className }: ObfuscatedEmailProps) {
    const user = "info";
    const domain = "serverpunt.com";
    const address = `${user}@${domain}`;

    return (
        <a href={`mailto:${address}`} className={className}>
            {user}
            <span aria-hidden="true">&#64;</span>
            {domain}
        </a>
    );
}
