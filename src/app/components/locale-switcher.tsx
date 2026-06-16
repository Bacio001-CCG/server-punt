"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeConfig, type LocaleCode } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export default function LocaleSwitcher() {
    const t = useTranslations("localeSwitcher");
    const locale = useLocale() as LocaleCode;
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const current = localeConfig.find((l) => l.code === locale) ?? localeConfig[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    function switchLocale(code: LocaleCode) {
        if (code === locale) {
            setOpen(false);
            return;
        }
        router.replace(pathname, { locale: code });
        router.refresh();
        setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-label={t("label")}
                aria-expanded={open}
                aria-haspopup="listbox"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-1 rounded-md border-0 bg-transparent px-1.5 py-1.5 text-sm transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
                <span className="text-lg leading-none" aria-hidden>
                    {current.flag}
                </span>
                <ChevronDown
                    className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-label={t("label")}
                    className="absolute right-0 z-50 mt-1 max-h-72 w-52 overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-lg"
                >
                    {localeConfig.map((loc) => {
                        const selected = loc.code === locale;

                        return (
                            <li key={loc.code} role="option" aria-selected={selected}>
                                <button
                                    type="button"
                                    onClick={() => switchLocale(loc.code)}
                                    className={cn(
                                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-muted",
                                        selected && "bg-primary/10 font-medium"
                                    )}
                                >
                                    <span className="text-lg leading-none" aria-hidden>
                                        {loc.flag}
                                    </span>
                                    <span className="truncate">
                                        {t(loc.code)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
