type HomeSectionHeaderProps = {
    title: string;
    subtitle?: string;
    eyebrow?: string;
    align?: "left" | "center";
    className?: string;
};

export default function HomeSectionHeader({
    title,
    subtitle,
    eyebrow,
    align = "left",
    className = "",
}: HomeSectionHeaderProps) {
    const alignClass =
        align === "center"
            ? "mx-auto max-w-2xl text-center"
            : "max-w-2xl text-left";

    return (
        <header className={`mb-8 md:mb-10 ${alignClass} ${className}`}>
            {eyebrow ? (
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
                    {eyebrow}
                </p>
            ) : null}
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {title}
            </h2>
            {subtitle ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {subtitle}
                </p>
            ) : null}
        </header>
    );
}
