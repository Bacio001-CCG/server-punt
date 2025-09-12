import Image from "next/image";
import { MdArrowDownward } from "react-icons/md";

export default function Hero() {
    return (
        <section className="relative overflow-hidden py-24 md:py-32">
            <div className="bg-grid-black/[0.02] absolute inset-0 bg-[length:20px_20px]"></div>
            <div
                className="
              relative z-10 container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
            >
                <div
                    className="
                grid items-center gap-10
                lg:grid-cols-2 lg:gap-12
              "
                >
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="space-y-4">
                            <h1
                                className="
                      font-display text-4xl leading-tight font-bold
                      tracking-tight text-foreground
                      sm:text-5xl
                      md:text-6xl
                      lg:leading-[1.1]
                    "
                            >
                                Uw one-stop shop voor{" "}
                                <span
                                    className="
                        bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                        text-transparent
                      "
                                >
                                    servers
                                </span>
                            </h1>
                            <p
                                className="
                      max-w-[700px] text-lg text-muted-foreground
                      md:text-xl
                    "
                            >
                                Ontdek onze uitgebreide selectie van
                                hoogwaardige servers, perfect afgestemd op uw
                                zakelijke behoeften. Betrouwbaarheid, prestaties
                                en uitstekende klantenservice
                            </p>
                        </div>
                        <div
                            className="
                    flex flex-col gap-3
                    sm:flex-row
                  "
                        >
                            <a href="/products">
                                <button
                                    className="inline-flex shrink-0 items-center justify-center text-sm font-medium whitespace-nowrap ease-in-out outline-none focus:shadow-lg focus-visible:border-ring active:shadow disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 rounded-md has-[&gt;svg]:px-4 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/60 h-12 gap-1.5 px-8 transition-colors duration-200"
                                    data-slot="button"
                                >
                                    Bekijk ons aanbod <MdArrowDownward />
                                </button>
                            </a>
                            <a href="/contact">
                                <button
                                    className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap ease-in-out outline-none focus:shadow-lg focus-visible:border-ring active:shadow disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 rounded-md has-[&gt;svg]:px-4 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-12 px-8 transition-colors duration-200"
                                    data-slot="button"
                                >
                                    Contacteer ons
                                </button>
                            </a>
                        </div>
                        <div
                            className="
                    flex flex-wrap gap-5 text-sm text-muted-foreground
                  "
                        >
                            <div className="flex items-center gap-1.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-truck h-5 w-5 text-primary/70"
                                    aria-hidden="true"
                                >
                                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
                                    <path d="M15 18H9"></path>
                                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
                                    <circle cx="17" cy="18" r="2"></circle>
                                    <circle cx="7" cy="18" r="2"></circle>
                                </svg>
                                <span>Gratis verzending vanaf €50</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-clock h-5 w-5 text-primary/70"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>24/7 Klanten Service</span>
                            </div>
                        </div>
                    </div>
                    <div
                        className="
                  relative mx-auto hidden aspect-square w-full max-w-md
                  overflow-hidden rounded-xl border shadow-lg
                  lg:block
                "
                    >
                        <div
                            className="
                    absolute inset-0 z-10 bg-gradient-to-tr from-primary/20
                    via-transparent to-transparent
                  "
                        ></div>
                        <Image
                            alt="Shopping experience"
                            decoding="async"
                            data-nimg="fill"
                            className="object-cover"
                            width={400}
                            height={400}
                            style={{
                                position: "absolute",
                                height: "100%",
                                width: "100%",
                                left: 0,
                                top: 0,
                                right: 0,
                                bottom: 0,
                                color: "transparent",
                            }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            src="/hero.jpg"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
