import type { Metadata } from "next";
import ConfiguratorWizard from "@/app/components/configurator/configurator-wizard";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("configurator");

    return {
        title: `${t("title")} | ServerPunt`,
        description: t("pageMetaDescription"),
    };
}

export default async function ConfiguratorPage() {
    const t = await getTranslations("configurator");

    return (
        <main className="min-h-[70vh] py-12 md:py-16">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                        {t("pageTitle")}
                    </h1>
                    <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-primary" />
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        {t("pageSubtitle")}
                    </p>
                </div>
                <ConfiguratorWizard />
            </div>
        </main>
    );
}
