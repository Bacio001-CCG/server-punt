import type { Metadata } from "next";
import Hero from "../components/hero";
import Products from "../components/products";
import Featured from "../components/featured";
import { getTranslations } from "next-intl/server";
import {
    buildAbsoluteLocaleUrl,
    buildAlternateLanguages,
    openGraphLocale,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    const url = buildAbsoluteLocaleUrl(locale, "");

    return {
        title: t("title"),
        description: t("description"),
        alternates: buildAlternateLanguages(locale, ""),
        openGraph: {
            title: t("ogTitle"),
            description: t("ogDescription"),
            url,
            locale: openGraphLocale(locale),
        },
    };
}

export default function Home() {
    return (
        <main className="flex flex-col gap-y-8">
            <div>
                <Hero />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            </div>

            <Featured />
            <Products />
        </main>
    );
}
