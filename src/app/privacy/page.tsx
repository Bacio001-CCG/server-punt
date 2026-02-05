export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Privacy() {
    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl mb-4">
                        Privacyverklaring
                    </h1>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Laatst gewijzigd: 5 februari 2026
                    </p>
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    {/* Artikel 1 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            1. Verantwoordelijke
                        </h2>
                        <p className="mb-2">
                            ServerPunt (NetwerkPunt V.O.F.), gevestigd aan de
                            Kraaivenstraat 36-07, 5048 AB Tilburg, ingeschreven
                            bij de Kamer van Koophandel onder nummer 97831441,
                            is verantwoordelijk voor de verwerking van
                            persoonsgegevens zoals beschreven in deze
                            privacyverklaring.
                        </p>
                        <p>
                            Contact:{" "}
                            <a
                                href="mailto:info@serverpunt.com"
                                className="text-primary hover:underline"
                            >
                                info@serverpunt.com
                            </a>
                        </p>
                    </section>

                    {/* Artikel 2 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            2. Persoonsgegevens die wij verwerken
                        </h2>
                        <p className="mb-2">
                            ServerPunt verwerkt persoonsgegevens doordat je
                            gebruik maakt van onze website en diensten, en/of
                            omdat je deze zelf aan ons verstrekt. Het betreft
                            onder meer:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>voor- en achternaam</li>
                            <li>adresgegevens</li>
                            <li>e-mailadres</li>
                            <li>telefoonnummer</li>
                            <li>betaal- en factuurgegevens</li>
                            <li>IP-adres</li>
                            <li>bestelgeschiedenis</li>
                            <li>correspondentiegegevens</li>
                        </ul>
                    </section>

                    {/* Artikel 3 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            3. Doeleinden en rechtsgronden van verwerking
                        </h2>
                        <p className="mb-2">
                            ServerPunt verwerkt persoonsgegevens uitsluitend
                            voor de volgende doeleinden en op basis van de
                            daarbij behorende rechtsgronden:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Uitvoering van de overeenkomst:</strong>{" "}
                                verwerken van bestellingen, levering van
                                producten, communicatie over de overeenkomst
                            </li>
                            <li>
                                <strong>Wettelijke verplichting:</strong>{" "}
                                facturatie, boekhouding, fiscale verplichtingen
                            </li>
                            <li>
                                <strong>Gerechtvaardigd belang:</strong>{" "}
                                klantenservice, verbetering van dienstverlening,
                                fraudepreventie
                            </li>
                            <li>
                                <strong>Toestemming:</strong> nieuwsbrieven en
                                marketingcommunicatie (indien van toepassing)
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 4 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            4. Bewaartermijnen
                        </h2>
                        <p className="mb-2">
                            ServerPunt bewaart persoonsgegevens niet langer dan
                            noodzakelijk is voor de doeleinden waarvoor deze
                            zijn verzameld, met inachtneming van wettelijke
                            bewaartermijnen:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                <strong>Bestel- en factuurgegevens:</strong> 7
                                jaar (fiscale bewaarplicht)
                            </li>
                            <li>
                                <strong>Klantcommunicatie:</strong> maximaal 2
                                jaar
                            </li>
                            <li>
                                <strong>Account- en contactgegevens:</strong>{" "}
                                zolang de klantrelatie actief is
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 5 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            5. Delen van persoonsgegevens met derden
                        </h2>
                        <p className="mb-2">
                            ServerPunt verstrekt persoonsgegevens uitsluitend
                            aan derden indien dit noodzakelijk is voor de
                            uitvoering van de overeenkomst of om te voldoen aan
                            een wettelijke verplichting.
                        </p>
                        <p className="mb-2">Dit betreft onder meer:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>betaalproviders</li>
                            <li>vervoerders</li>
                            <li>boekhoudsoftware</li>
                            <li>hosting- en IT-dienstverleners</li>
                        </ul>
                        <p className="mt-2">
                            Met deze partijen zijn, waar wettelijk vereist,
                            verwerkersovereenkomsten gesloten.
                        </p>
                    </section>

                    {/* Artikel 6 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
                        <p className="mb-2">
                            ServerPunt maakt gebruik van functionele en
                            analytische cookies die geen of geringe inbreuk
                            maken op de privacy van bezoekers.
                        </p>
                        <p className="mb-2">Deze cookies worden gebruikt om:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                de website technisch goed te laten functioneren;
                            </li>
                            <li>
                                inzicht te krijgen in het gebruik van de website
                                en deze te verbeteren.
                            </li>
                        </ul>
                        <p className="mt-2">
                            Er worden geen trackingcookies geplaatst zonder
                            voorafgaande toestemming.
                        </p>
                    </section>

                    {/* Artikel 7 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            7. Beveiliging van persoonsgegevens
                        </h2>
                        <p>
                            ServerPunt neemt passende technische en
                            organisatorische maatregelen om persoonsgegevens te
                            beveiligen tegen verlies, misbruik, onbevoegde
                            toegang en ongewenste openbaarmaking.
                        </p>
                    </section>

                    {/* Artikel 8 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            8. Rechten van betrokkenen
                        </h2>
                        <p className="mb-2">Je hebt het recht om:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>je persoonsgegevens in te zien;</li>
                            <li>
                                je gegevens te laten corrigeren of verwijderen;
                            </li>
                            <li>bezwaar te maken tegen verwerking;</li>
                            <li>beperking van verwerking te verzoeken;</li>
                            <li>
                                je gegevens over te laten dragen
                                (dataportabiliteit).
                            </li>
                        </ul>
                        <p className="mt-2">
                            Verzoeken kunnen worden ingediend via{" "}
                            <a
                                href="mailto:info@serverpunt.com"
                                className="text-primary hover:underline"
                            >
                                info@serverpunt.com
                            </a>
                            . Daarnaast heb je het recht een klacht in te dienen
                            bij de Autoriteit Persoonsgegevens.
                        </p>
                    </section>

                    {/* Artikel 9 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            9. Wijzigingen
                        </h2>
                        <p>
                            ServerPunt behoudt zich het recht voor deze
                            privacyverklaring te wijzigen. De meest actuele
                            versie is altijd beschikbaar op de website.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section className="mt-12 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">Contact</h3>
                        <p className="mb-2">
                            <strong>ServerPunt / NetwerkPunt</strong>
                        </p>
                        <p>Kraaivenstraat 36-07</p>
                        <p>5048 AB Tilburg</p>
                        <p className="mt-2">KvK: 97831441</p>
                        <p>
                            E-mail:{" "}
                            <a
                                href="mailto:info@serverpunt.com"
                                className="text-primary hover:underline"
                            >
                                info@serverpunt.com
                            </a>
                        </p>
                        <p>
                            Website:{" "}
                            <a
                                href="https://serverpunt.com/"
                                className="text-primary hover:underline"
                            >
                                https://serverpunt.com/
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}
