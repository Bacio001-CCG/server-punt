import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getBrands } from "@/lib/brands";
import Body from "../components/products/body";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AboutUs() {
    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl mb-4">
                        Over ServerPunt
                    </h1>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary mx-auto"></div>
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    {/* Introductie */}
                    <section>
                        <p className="text-lg leading-relaxed">
                            ServerPunt is gespecialiseerd in de inkoop en
                            verkoop van refurbished hardware voor particulieren
                            en bedrijven. Wij geloven dat professionele hardware
                            niet nieuw hoeft te zijn om betrouwbaar, krachtig en
                            toekomstbestendig te presteren.
                        </p>
                        <p className="mt-4 leading-relaxed">
                            Van monitoren en laptops tot complete servers en
                            serveronderdelen: alle producten die wij aanbieden
                            worden zorgvuldig getest, gecontroleerd en waar
                            nodig opgeknapt. Zo geven wij hoogwaardige hardware
                            een tweede leven, tegen een scherpe prijs en met
                            minimale impact op het milieu.
                        </p>
                    </section>

                    {/* Gespecialiseerd in serveroplossingen */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Gespecialiseerd in serveroplossingen
                        </h2>
                        <p className="leading-relaxed">
                            Onze kracht ligt in maatwerk. Wij leveren niet
                            alleen losse servers en onderdelen, maar denken
                            actief mee over de juiste configuraties voor
                            specifieke workloads, schaalbaarheid en groei.
                            Dankzij onze technische kennis en praktische
                            ervaring kunnen wij snel schakelen en doelgericht
                            adviseren.
                        </p>
                        <p className="mt-4 leading-relaxed">
                            Bij ServerPunt staan transparantie en kwaliteit
                            altijd voorop. Refurbished hardware betekent bij
                            ons:
                        </p>
                        <ul className="list-disc pl-6 mt-3 space-y-2">
                            <li>
                                <strong>Betaalbare kwaliteit</strong> zonder in
                                te leveren op prestaties
                            </li>
                            <li>
                                <strong>Een duurzame keuze</strong> door
                                hergebruik
                            </li>
                            <li>
                                <strong>Snelle levering</strong> met persoonlijk
                                contact
                            </li>
                        </ul>
                        <p className="mt-4 leading-relaxed">
                            Dankzij onze technische kennis van servers en
                            onderdelen kunnen we meedenken, adviseren en snel
                            schakelen wanneer dat nodig is.
                        </p>
                    </section>

                    {/* Voor wie wij werken */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Voor wie wij werken
                        </h2>
                        <p className="leading-relaxed">
                            We werken voor particulieren die op zoek zijn naar
                            professionele hardware voor een scherpe prijs, maar
                            ook voor bedrijven die hun systemen willen
                            uitbreiden of vernieuwen. Of het nu gaat om een
                            enkele aankoop of een grotere uitbreiding, we kijken
                            samen naar wat het beste past.
                        </p>
                        <p className="mt-4 leading-relaxed">
                            ServerPunt is meer dan alleen een leverancier. We
                            zijn een technische partner die meedenkt, adviseert
                            en levert, afgestemd op de eisen van vandaag en de
                            groei van morgen.
                        </p>
                    </section>

                    {/* Onze waarden */}
                    <section className="mt-12 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">
                            Waarom ServerPunt?
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">
                                    🔧 Technische expertise
                                </h4>
                                <p className="text-sm">
                                    Gedegen kennis van servers en infrastructuur
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">
                                    ✅ Kwaliteitscontrole
                                </h4>
                                <p className="text-sm">
                                    Elk product wordt grondig getest en
                                    gecontroleerd
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">
                                    🌱 Duurzaam
                                </h4>
                                <p className="text-sm">
                                    Hergebruik van hardware met minimale impact
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">
                                    💰 Scherp geprijsd
                                </h4>
                                <p className="text-sm">
                                    Professionele kwaliteit tegen betaalbare
                                    prijzen
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mt-12 text-center" id="contact">
                        <h3 className="text-xl font-bold mb-4">
                            Vragen of advies nodig?
                        </h3>
                        <p className="mb-4">
                            Neem gerust contact met ons op. We denken graag met
                            je mee over de beste oplossing voor jouw situatie.
                        </p>
                        <div className="space-y-2">
                            <p>
                                <strong>E-mail:</strong>{" "}
                                <a
                                    href="mailto:info@serverpunt.com"
                                    className="text-primary hover:underline"
                                >
                                    info@serverpunt.com
                                </a>
                            </p>
                            <Link
                                href={
                                    "https://www.google.com/maps/place/Kraaivenstraat+36-07,+5048+AB+Tilburg/@51.5796486,5.0626722,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x47c695f37fcf8407:0xbedb945330efcde3!8m2!3d51.5796453!4d5.0652471!16s%2Fg%2F11mcfvxcp2?entry=ttu&g_ep=EgoyMDI2MDEyNi4wIKXMDSoASAFQAw%3D%3D"
                                }
                                className="text-primary hover:underline"
                            >
                                <strong>Adres:</strong> Kraaivenstraat 36-07,
                                5048 AB Tilburg
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
