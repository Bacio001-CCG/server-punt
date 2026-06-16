import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Nav from "../components/nav";
import Footer from "../components/footer";
import { ToastContainer } from "react-toastify";
import { CookieConsent } from "@/components/cookie-consent";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { isWhatsAppWidgetConfigured } from "@/lib/whatsapp-config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: t("title"),
        description: t("description"),
        keywords: t("keywords"),
        authors: [{ name: "ServerPunt" }],
        creator: "ServerPunt",
        publisher: "ServerPunt",
        robots: "index, follow",
        openGraph: {
            type: "website",
            locale: locale === "nl" ? "nl_NL" : "en_GB",
            url: "https://serverpunt.com",
            siteName: "ServerPunt",
            title: t("ogTitle"),
            description: t("ogDescription"),
            images: [
                {
                    url: "/logo.png",
                    width: 1200,
                    height: 630,
                    alt: "ServerPunt",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: t("ogTitle"),
            description: t("ogDescription"),
            images: ["/logo.png"],
        },
        alternates: {
            canonical: "https://serverpunt.com",
            languages: {
                "nl-NL": "https://serverpunt.com/nl",
                "en-GB": "https://serverpunt.com/en",
            },
        },
        category: "technology",
    };
}

export default async function LocaleLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html lang={locale} className="scroll-smooth">
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
                <meta name="geo.region" content="EU" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "ServerPunt",
                            description:
                                "Specialist in refurbished servers en IT-hardware",
                            url: "https://serverpunt.com",
                            logo: "https://serverpunt.com/logo.png",
                            address: {
                                "@type": "PostalAddress",
                                streetAddress: "Kraaivenstraat 36-07",
                                addressLocality: "Tilburg",
                                postalCode: "5048 AB",
                                addressCountry: "NL",
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextIntlClientProvider messages={messages}>
                    <Nav />
                    <div className="pt-[65px]">
                        {children}
                        <Footer />
                    </div>
                    <ToastContainer theme="light" />
                    <CookieConsent />
                    {isWhatsAppWidgetConfigured() ? (
                        <WhatsAppSupportButton />
                    ) : null}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
