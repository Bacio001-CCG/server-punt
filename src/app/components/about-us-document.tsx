"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

type ValueItem = {
    icon: string;
    title: string;
    description: string;
};

export function AboutUsDocument() {
    const t = useTranslations("aboutUs");

    const values = t.raw("values.items") as ValueItem[];

    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl mb-4">
                        {t("title")}
                    </h1>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary mx-auto" />
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    <section>
                        <p className="text-lg leading-relaxed">{t("intro1")}</p>
                        <p className="mt-4 leading-relaxed">{t("intro2")}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            {t("servers.title")}
                        </h2>
                        <p className="leading-relaxed">{t("servers.p1")}</p>
                        <p className="mt-4 leading-relaxed">{t("servers.p2")}</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>
                                <strong>{t("servers.bullet1Title")}</strong>{" "}
                                {t("servers.bullet1Text")}
                            </li>
                            <li>
                                <strong>{t("servers.bullet2Title")}</strong>{" "}
                                {t("servers.bullet2Text")}
                            </li>
                            <li>
                                <strong>{t("servers.bullet3Title")}</strong>{" "}
                                {t("servers.bullet3Text")}
                            </li>
                        </ul>
                        <p className="mt-4 leading-relaxed">{t("servers.p3")}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            {t("audience.title")}
                        </h2>
                        <p className="leading-relaxed">{t("audience.p1")}</p>
                        <p className="mt-4 leading-relaxed">{t("audience.p2")}</p>
                    </section>

                    <section className="mt-12 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">
                            {t("values.title")}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {values.map((item) => (
                                <div key={item.title}>
                                    <h4 className="font-semibold mb-2">
                                        {item.icon} {item.title}
                                    </h4>
                                    <p className="text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-12 text-center" id="contact">
                        <h3 className="text-xl font-bold mb-4">
                            {t("contact.title")}
                        </h3>
                        <p className="mb-4">{t("contact.description")}</p>
                        <div className="space-y-2">
                            <p>
                                <strong>{t("contact.emailLabel")}</strong>{" "}
                                <a
                                    href="mailto:info@serverpunt.com"
                                    className="text-primary hover:underline"
                                >
                                    info@serverpunt.com
                                </a>
                            </p>
                            <Link
                                href="https://www.google.com/maps/place/Kraaivenstraat+36-07,+5048+AB+Tilburg/@51.5796486,5.0626722,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x47c695f37fcf8407:0xbedb945330efcde3!8m2!3d51.5796453!4d5.0652471!16s%2Fg%2F11mcfvxcp2?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoASAFQAw%3D%3D"
                                className="text-primary hover:underline"
                            >
                                <strong>{t("contact.addressLabel")}</strong>{" "}
                                {t("contact.address")}
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
