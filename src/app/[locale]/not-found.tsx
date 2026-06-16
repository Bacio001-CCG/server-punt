import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

const copy: Record<
    string,
    { title: string; description: string; products: string; configurator: string }
> = {
    nl: {
        title: "Pagina niet gevonden",
        description:
            "De pagina die u zoekt bestaat niet of is verplaatst. Bekijk ons aanbod of gebruik de configurator.",
        products: "Alle producten",
        configurator: "Server configurator",
    },
    en: {
        title: "Page not found",
        description:
            "The page you are looking for does not exist or has moved. Browse our catalog or use the configurator.",
        products: "All products",
        configurator: "Server configurator",
    },
};

export default async function NotFound() {
    const locale = await getLocale();
    const t = await getTranslations("common");
    const strings = copy[locale] ?? copy.en;

    return (
        <main className="container mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                404
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {strings.title}
            </h1>
            <p className="mt-4 text-muted-foreground">{strings.description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                    href="/"
                    className="inline-flex h-11 items-center rounded-md bg-brand-orange px-6 text-sm font-medium text-white hover:bg-brand-orange/90"
                >
                    {t("backToHomepage")}
                </Link>
                <Link
                    href="/products"
                    className="inline-flex h-11 items-center rounded-md border bg-background px-6 text-sm font-medium hover:bg-accent"
                >
                    {strings.products}
                </Link>
                <Link
                    href="/configurator"
                    className="inline-flex h-11 items-center rounded-md border bg-background px-6 text-sm font-medium hover:bg-accent"
                >
                    {strings.configurator}
                </Link>
            </div>
        </main>
    );
}
