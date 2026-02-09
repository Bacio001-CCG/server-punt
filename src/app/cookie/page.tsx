import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getBrands } from "@/lib/brands";
import Body from "../components/products/body";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CookiePolicy() {
    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl mb-4">
                        Cookiebeleid
                    </h1>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Laatst gewijzigd: 9 februari 2026
                    </p>
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    <p>
                        Dit cookiebeleid is van toepassing op de website van{" "}
                        <strong>ServerPunt</strong>, gevestigd aan{" "}
                        <strong>Kraaivenstraat 36-07, 5048 AB Tilburg</strong>,
                        en bereikbaar via{" "}
                        <a
                            href="mailto:info@serverpunt.com"
                            className="text-primary hover:underline"
                        >
                            info@serverpunt.com
                        </a>
                        .
                    </p>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            1. Wat zijn cookies?
                        </h2>
                        <p>
                            Cookies zijn kleine tekstbestanden die bij een
                            bezoek aan een website op je computer, tablet of
                            smartphone worden opgeslagen. Cookies zorgen ervoor
                            dat een website goed functioneert en kunnen
                            informatie verzamelen over het gebruik van de
                            website.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            2. Welke cookies gebruikt ServerPunt?
                        </h2>
                        <p className="mb-4">
                            ServerPunt maakt gebruik van de volgende soorten
                            cookies:
                        </p>

                        <h3 className="text-xl font-semibold mb-3">
                            a. Functionele cookies (noodzakelijk)
                        </h3>
                        <p className="mb-2">
                            Deze cookies zijn nodig om de website goed te laten
                            werken. Zonder deze cookies kunnen bepaalde
                            onderdelen van de website niet correct functioneren.
                        </p>
                        <p className="mb-2">Voorbeelden:</p>
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                            <li>Het onthouden van cookievoorkeuren</li>
                            <li>Het correct laden van pagina's</li>
                            <li>Basisfunctionaliteit van de website</li>
                        </ul>
                        <p className="mb-4">
                            Voor deze cookies is geen toestemming vereist.
                        </p>

                        <h3 className="text-xl font-semibold mb-3">
                            b. Analytische cookies
                        </h3>
                        <p className="mb-2">
                            Met analytische cookies krijgen wij inzicht in het
                            gebruik van onze website. Hiermee kunnen wij de
                            website verbeteren en gebruiksvriendelijker maken.
                        </p>
                        <p className="mb-2">Voorbeelden:</p>
                        <ul className="list-disc pl-6 space-y-1 mb-4">
                            <li>Aantal bezoekers</li>
                            <li>Populaire pagina's</li>
                            <li>Hoe bezoekers door de website navigeren</li>
                        </ul>
                        <p className="mb-4">
                            Waar mogelijk worden deze gegevens geanonimiseerd en
                            kunnen ze niet worden herleid tot individuele
                            personen.
                        </p>

                        <h3 className="text-xl font-semibold mb-3">
                            c. Marketing- en trackingcookies (optioneel)
                        </h3>
                        <p className="mb-2">
                            Indien van toepassing kunnen marketingcookies worden
                            gebruikt om relevante content of advertenties te
                            tonen en om het effect van campagnes te meten.
                        </p>
                        <p>
                            Deze cookies worden{" "}
                            <strong>
                                alleen geplaatst na expliciete toestemming
                            </strong>
                            .
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            3. Cookies van derden
                        </h2>
                        <p>
                            Het kan voorkomen dat derde partijen (zoals
                            analytics- of marketingdiensten) cookies plaatsen
                            via onze website. ServerPunt heeft geen directe
                            invloed op het gebruik van cookies door deze
                            partijen. Wij adviseren om ook het cookie- en
                            privacybeleid van deze derden te raadplegen.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            4. Cookies beheren of verwijderen
                        </h2>
                        <p className="mb-4">
                            Je kunt cookies op elk moment zelf beheren of
                            verwijderen via de instellingen van je browser. Houd
                            er rekening mee dat het uitschakelen van cookies
                            invloed kan hebben op de werking van de website.
                        </p>
                        <p className="mb-2">Meer informatie per browser:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                <a
                                    href="https://support.google.com/chrome/answer/95647"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Google Chrome
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Mozilla Firefox
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Microsoft Edge
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Safari
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            5. Wijzigingen in dit cookiebeleid
                        </h2>
                        <p>
                            ServerPunt behoudt zich het recht voor om dit
                            cookiebeleid te wijzigen. Wij raden aan deze pagina
                            regelmatig te bekijken om op de hoogte te blijven
                            van eventuele aanpassingen.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Contact</h2>
                        <p className="mb-4">
                            Heb je vragen over ons cookiebeleid of de manier
                            waarop wij omgaan met gegevens? Neem dan gerust
                            contact met ons op:
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <p className="mb-2">
                            <strong>ServerPunt</strong>
                        </p>
                        <p>📍 Kraaivenstraat 36-07, 5048 AB Tilburg</p>
                        <p>
                            📧{" "}
                            <a
                                href="mailto:info@serverpunt.com"
                                className="text-primary hover:underline"
                            >
                                info@serverpunt.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}
