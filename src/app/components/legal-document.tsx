"use client";

import { useTranslations } from "next-intl";

type ListItem = string | { text: string; sublist?: string[] };

type Block =
    | { type: "p"; text: string; emphasis?: boolean }
    | { type: "ol"; items: ListItem[] }
    | { type: "ul"; items: string[] }
    | { type: "links"; items: { label: string; url: string }[] }
    | { type: "definitions"; items: { term: string; text: string }[] };

type Section = {
    id?: string;
    title: string;
    blocks: Block[];
};

type ContactInfo = {
    title: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    coc?: string;
    vat?: string;
    emailLabel: string;
    websiteLabel: string;
};

function renderListItem(item: ListItem, index: number) {
    if (typeof item === "string") {
        return <li key={index}>{item}</li>;
    }

    return (
        <li key={index}>
            {item.text}
            {item.sublist && item.sublist.length > 0 && (
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    {item.sublist.map((sub, subIndex) => (
                        <li key={subIndex}>{sub}</li>
                    ))}
                </ul>
            )}
        </li>
    );
}

function renderBlock(block: Block, index: number) {
    switch (block.type) {
        case "p":
            return block.emphasis ? (
                <p key={index} className="text-xl font-semibold mb-3">
                    {block.text}
                </p>
            ) : (
                <p key={index} className={index > 0 ? "mt-2" : "mb-2"}>
                    {block.text}
                </p>
            );
        case "links":
            return (
                <ul key={index} className="list-disc pl-6 space-y-1">
                    {block.items.map((item) => (
                        <li key={item.url}>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            );
        case "ol":
            return (
                <ol
                    key={index}
                    className="list-decimal pl-6 space-y-2"
                >
                    {block.items.map(renderListItem)}
                </ol>
            );
        case "ul":
            return (
                <ul key={index} className="list-disc pl-6 space-y-1">
                    {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
        case "definitions":
            return (
                <ul key={index} className="list-decimal pl-6 space-y-2">
                    {block.items.map((item, i) => (
                        <li key={i}>
                            <strong>{item.term}:</strong> {item.text}
                        </li>
                    ))}
                </ul>
            );
        default:
            return null;
    }
}

export function LegalDocument({ namespace }: { namespace: string }) {
    const t = useTranslations(namespace);
    const sections = t.raw("sections") as Section[];
    const contact = t.has("contact")
        ? (t.raw("contact") as ContactInfo)
        : null;

    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl mb-4">
                        {t("title")}
                    </h1>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary mx-auto" />
                    {t.has("lastModified") && (
                        <p className="mt-4 text-muted-foreground">
                            {t("lastModified")}
                        </p>
                    )}
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    {t.has("intro") && <p>{t("intro")}</p>}

                    {sections.map((section) => (
                        <section key={section.id ?? section.title} id={section.id}>
                            <h2 className="text-2xl font-bold mb-4">
                                {section.title}
                            </h2>
                            {section.blocks.map(renderBlock)}
                        </section>
                    ))}

                    {contact && (
                        <section className="mt-12 p-6 bg-gray-50 rounded-lg">
                            {contact.title ? (
                                <h3 className="text-xl font-bold mb-4">
                                    {contact.title}
                                </h3>
                            ) : null}
                            <p className="mb-2">
                                <strong>{contact.company}</strong>
                            </p>
                            <p>{contact.addressLine1}</p>
                            <p>{contact.addressLine2}</p>
                            {contact.coc && (
                                <p className="mt-2">{contact.coc}</p>
                            )}
                            {contact.vat && <p>{contact.vat}</p>}
                            <p>
                                {contact.emailLabel}{" "}
                                <a
                                    href="mailto:info@serverpunt.com"
                                    className="text-primary hover:underline"
                                >
                                    info@serverpunt.com
                                </a>
                            </p>
                            {contact.websiteLabel && (
                                <p>
                                    {contact.websiteLabel}{" "}
                                    <a
                                        href="https://serverpunt.com/"
                                        className="text-primary hover:underline"
                                    >
                                        https://serverpunt.com/
                                    </a>
                                </p>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </section>
    );
}
