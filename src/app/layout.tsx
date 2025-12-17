import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/nav";
import Footer from "./components/footer";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Server Punt - Betaalbare Servers en Componenten | Refurbished Hardware Nederland",
    description:
        "Koop refurbished servers, servercomponenten en IT-hardware bij Server Punt. Scherpe prijzen, hoogste kwaliteit. Dell, HP, IBM servers en meer. Gratis verzending vanaf €50.",
    keywords:
        "refurbished servers, server componenten, dell servers, hp servers, ibm servers, serveronderdelen, it hardware, nederland, goedkope servers, enterprise hardware",
    authors: [{ name: "Server Punt" }],
    creator: "Server Punt",
    publisher: "Server Punt",
    robots: "index, follow",
    openGraph: {
        type: "website",
        locale: "nl_NL",
        url: "https://serverpunt.com",
        siteName: "Server Punt",
        title: "Server Punt - Betaalbare Refurbished Servers en Componenten",
        description:
            "Specialist in refurbished servers en IT-hardware. Dell, HP, IBM servers en componenten tegen scherpe prijzen. Betrouwbaar en snel geleverd.",
        images: [
            {
                url: "/logo.png",
                width: 1200,
                height: 630,
                alt: "Server Punt - Refurbished Servers en Componenten",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Server Punt - Betaalbare Refurbished Servers",
        description:
            "Specialist in refurbished servers en IT-hardware tegen scherpe prijzen.",
        images: ["/logo.png"],
    },
    alternates: {
        canonical: "https://serverpunt.com",
        languages: {
            "nl-NL": "https://serverpunt.com",
        },
    },
    category: "technology",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="nl" className="scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="geo.region" content="NL" />
                <meta name="geo.country" content="Netherlands" />
                <meta name="geo.placename" content="Nederland" />
                <meta name="language" content="Dutch" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Server Punt",
                            description:
                                "Specialist in refurbished servers en IT-hardware",
                            url: "https://serverpunt.com",
                            logo: "https://serverpunt.com/logo.png",
                            // contactPoint: {
                            //     "@type": "ContactPoint",
                            //     telephone: "+31-123-456-789",
                            //     contactType: "customer service",
                            //     availableLanguage: "Dutch",
                            // },
                            address: {
                                "@type": "Kraaivenstraat 36, 07 Tilburg",
                                addressCountry: "NL",
                                addressLocality: "Nederland",
                            },
                            sameAs: [
                                "https://www.linkedin.com/company/serverpunt",
                                "https://www.facebook.com/serverpunt",
                            ],
                        }),
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
            >
                <Nav />
                {children}
                <Footer />
                <ToastContainer theme="light" />
            </body>
        </html>
    );
}
