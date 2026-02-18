import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getBrands } from "@/lib/brands";
import Body from "../components/products/body";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TOS() {
    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl mb-4">
                        Algemene Voorwaarden
                    </h1>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Laatst gewijzigd: 22 december 2025
                    </p>
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    {/* Artikel 1 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 1. Definities
                        </h2>
                        <p className="mb-2">
                            In deze algemene voorwaarden wordt verstaan onder:
                        </p>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                <strong>ServerPunt / NetwerkPunt:</strong> de
                                vennootschap onder firma NetwerkPunt, handelend
                                onder de naam ServerPunt, gevestigd aan de
                                Kraaivenstraat 36-07, 5048 AB Tilburg,
                                ingeschreven bij de Kamer van Koophandel onder
                                nummer 97831441.
                            </li>
                            <li>
                                <strong>Klant:</strong> iedere natuurlijke
                                persoon of rechtspersoon die een Overeenkomst
                                aangaat of wil aangaan met ServerPunt.
                            </li>
                            <li>
                                <strong>Consument:</strong> de Klant die een
                                natuurlijke persoon is en handelt voor
                                doeleinden die buiten zijn bedrijfs- of
                                beroepsactiviteit vallen.
                            </li>
                            <li>
                                <strong>Zakelijke klant:</strong> de Klant die
                                handelt in de uitoefening van een beroep of
                                bedrijf.
                            </li>
                            <li>
                                <strong>Overeenkomst:</strong> iedere
                                overeenkomst die tussen ServerPunt en Klant tot
                                stand komt, waaronder begrepen koop op afstand
                                via de Website, en alle daaruit voortvloeiende
                                verbintenissen.
                            </li>
                            <li>
                                <strong>Website:</strong> de website van
                                ServerPunt via welke producten worden aangeboden
                                en bestellingen kunnen worden geplaatst, te
                                weten{" "}
                                <a
                                    href="https://serverpunt.com/"
                                    className="text-primary hover:underline"
                                >
                                    https://serverpunt.com/
                                </a>
                                .
                            </li>
                            <li>
                                <strong>Product(en):</strong> alle door
                                ServerPunt aangeboden zaken, waaronder begrepen
                                refurbished IT-hardware, servers,
                                serveronderdelen en accessoires.
                            </li>
                            <li>
                                <strong>Refurbished:</strong> gebruikte hardware
                                die door ServerPunt is gecontroleerd, getest en
                                waar nodig gereinigd en/of hersteld, en
                                vervolgens opnieuw wordt aangeboden. Refurbished
                                producten kunnen gebruikssporen vertonen en
                                afwijken van nieuwstaat.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 2 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 2. Toepasselijkheid
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Deze algemene voorwaarden zijn van toepassing op
                                elk aanbod van ServerPunt en op elke tot stand
                                gekomen Overeenkomst tussen ServerPunt en de
                                Klant.
                            </li>
                            <li>
                                Afwijkingen van deze algemene voorwaarden zijn
                                alleen geldig indien deze uitdrukkelijk en
                                schriftelijk (waaronder per e-mail) door
                                ServerPunt zijn bevestigd.
                            </li>
                            <li>
                                De toepasselijkheid van (inkoop)voorwaarden van
                                de Klant wordt uitdrukkelijk uitgesloten, tenzij
                                deze door ServerPunt uitdrukkelijk en
                                schriftelijk zijn aanvaard.
                            </li>
                            <li>
                                Indien enige bepaling uit deze algemene
                                voorwaarden geheel of gedeeltelijk nietig is of
                                vernietigd wordt, blijven de overige bepalingen
                                volledig van kracht. In dat geval zullen
                                partijen de betreffende bepaling vervangen door
                                een bepaling die zoveel mogelijk aansluit bij
                                doel en strekking van de oorspronkelijke
                                bepaling.
                            </li>
                            <li>
                                In geval van strijdigheid tussen de inhoud van
                                de Website en deze algemene voorwaarden,
                                prevaleren deze algemene voorwaarden, tenzij
                                uitdrukkelijk anders is aangegeven.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 3 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 3. Het aanbod
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Alle aanbiedingen en productomschrijvingen op de
                                Website van ServerPunt zijn vrijblijvend, tenzij
                                uitdrukkelijk anders vermeld.
                            </li>
                            <li>
                                ServerPunt stelt de informatie op de Website met
                                de grootst mogelijke zorg samen. Desondanks
                                kunnen kennelijke vergissingen of fouten
                                voorkomen, zoals typefouten, prijsfouten,
                                onjuiste specificaties of onjuiste afbeeldingen.
                                Aan dergelijke fouten kunnen geen rechten worden
                                ontleend.
                            </li>
                            <li>
                                Afbeeldingen van Producten dienen ter
                                illustratie en kunnen afwijken van het
                                daadwerkelijk geleverde Product, mede gezien het
                                refurbished karakter van de aangeboden hardware.
                            </li>
                            <li>
                                ServerPunt is gerechtigd een bestelling te
                                annuleren of aan te passen indien sprake is van
                                een kennelijke fout in het aanbod, zoals een
                                evidente prijsfout of een onjuist weergegeven
                                producteigenschap.
                            </li>
                            <li>
                                Het aanbod geldt zolang de voorraad strekt.
                                Indien een Product niet (meer) leverbaar is, zal
                                ServerPunt de Klant hierover zo spoedig mogelijk
                                informeren.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 4 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 4. Totstandkoming van de overeenkomst
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                De Overeenkomst komt tot stand op het moment dat
                                de Klant het aanbod van ServerPunt aanvaardt
                                door het plaatsen van een bestelling via de
                                Website en deze bestelling door ServerPunt per
                                e-mail is bevestigd.
                            </li>
                            <li>
                                ServerPunt is gerechtigd een bestelling te
                                weigeren of aanvullende voorwaarden te stellen,
                                onder meer indien:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>
                                        de Klant onjuiste of onvolledige
                                        gegevens heeft verstrekt;
                                    </li>
                                    <li>
                                        eerdere betalingsverplichtingen niet
                                        zijn nagekomen;
                                    </li>
                                    <li>
                                        er gegronde redenen bestaan om aan de
                                        betalingscapaciteit van de Klant te
                                        twijfelen.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Na het plaatsen van een bestelling ontvangt de
                                Klant een orderbevestiging per e-mail. Deze
                                bevestiging vormt geen factuur.
                            </li>
                            <li>
                                Kennelijke vergissingen of fouten in de
                                orderbevestiging binden ServerPunt niet.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 5 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 5. Wijzigingen en annulering door ServerPunt
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Indien na het sluiten van de Overeenkomst blijkt
                                dat het bestelde Product niet (meer) beschikbaar
                                is of niet geleverd kan worden, is ServerPunt
                                gerechtigd de Overeenkomst te ontbinden.
                            </li>
                            <li>
                                In geval van ontbinding zoals bedoeld in dit
                                artikel zal ServerPunt eventueel reeds door de
                                Klant betaalde bedragen zo spoedig mogelijk,
                                doch uiterlijk binnen 14 dagen, terugbetalen.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 6 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 6. Prijzen
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Alle op de Website vermelde prijzen zijn in
                                euro's en inclusief btw, tenzij uitdrukkelijk
                                anders vermeld.
                            </li>
                            <li>
                                Voor zakelijke klanten kunnen prijzen exclusief
                                btw worden weergegeven. In dat geval wordt dit
                                duidelijk bij het aanbod vermeld.
                            </li>
                            <li>
                                Eventuele verzendkosten, administratiekosten of
                                andere bijkomende kosten worden vóór het sluiten
                                van de Overeenkomst duidelijk aan de Klant
                                gecommuniceerd.
                            </li>
                            <li>
                                ServerPunt behoudt zich het recht voor om
                                prijzen te wijzigen. Prijswijzigingen hebben
                                geen invloed op reeds tot stand gekomen
                                Overeenkomsten.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 7 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 7. Betaling
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Betaling dient te geschieden via de op de
                                Website aangeboden betaalmethoden, tenzij
                                schriftelijk anders overeengekomen.
                            </li>
                            <li>
                                ServerPunt is gerechtigd een bestelling pas in
                                behandeling te nemen nadat de volledige betaling
                                is ontvangen, tenzij uitdrukkelijk anders
                                overeengekomen.
                            </li>
                            <li>
                                In geval van betaling achteraf of betaling op
                                factuur (uitsluitend voor zakelijke klanten)
                                geldt de op de factuur vermelde
                                betalingstermijn.
                            </li>
                            <li>
                                Indien de Klant niet tijdig aan zijn
                                betalingsverplichting voldoet, is de Klant van
                                rechtswege in verzuim. Vanaf dat moment is
                                ServerPunt gerechtigd wettelijke (handels)rente
                                in rekening te brengen.
                            </li>
                            <li>
                                Alle redelijke kosten ter verkrijging van
                                voldoening buiten rechte komen voor rekening van
                                de Klant.
                            </li>
                            <li>
                                Voor zakelijke klanten geldt een
                                betalingstermijn van 14 dagen na factuurdatum,
                                tenzij schriftelijk anders overeengekomen.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 8 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 8. Facturatie
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Facturen worden elektronisch verstrekt, tenzij
                                anders overeengekomen.
                            </li>
                            <li>
                                Bezwaren tegen een factuur dienen binnen 7 dagen
                                na factuurdatum schriftelijk aan ServerPunt te
                                worden gemeld.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 9 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 9. Levering
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Levering van Producten vindt plaats op het door
                                de Klant bij de bestelling opgegeven
                                afleveradres, tenzij schriftelijk anders
                                overeengekomen.
                            </li>
                            <li>
                                ServerPunt zal bestellingen met de grootst
                                mogelijke zorg verwerken en verzenden.
                            </li>
                            <li>
                                Indien levering op een afgesproken adres niet
                                mogelijk blijkt, is ServerPunt gerechtigd het
                                Product op een andere wijze aan de Klant ter
                                beschikking te stellen of de Overeenkomst te
                                ontbinden.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 10 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 10. Levertijden
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Door ServerPunt opgegeven levertijden zijn
                                indicatief en vormen geen fatale termijnen,
                                tenzij uitdrukkelijk schriftelijk anders
                                overeengekomen.
                            </li>
                            <li>
                                Overschrijding van een levertijd geeft de Klant
                                geen recht op schadevergoeding of ontbinding van
                                de Overeenkomst, tenzij sprake is van opzet of
                                grove nalatigheid van ServerPunt.
                            </li>
                            <li>
                                Indien levering vertraagd is of een bestelling
                                niet of slechts gedeeltelijk kan worden
                                uitgevoerd, zal ServerPunt de Klant hierover zo
                                spoedig mogelijk informeren.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 11 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 11. Risico-overgang en transportschade
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Het risico van verlies of beschadiging van
                                Producten gaat over op de Consument op het
                                moment van feitelijke ontvangst van het Product.
                            </li>
                            <li>
                                Voor zakelijke klanten gaat het risico over op
                                het moment van verzending van het Product.
                            </li>
                            <li>
                                De Klant dient het Product direct na ontvangst
                                te controleren op transportschade en zichtbare
                                gebreken. Eventuele schade of gebreken dienen
                                binnen 48 uur na ontvangst schriftelijk aan
                                ServerPunt te worden gemeld, onder bijvoeging
                                van foto's van het Product en de verpakking.
                            </li>
                            <li>
                                Indien transportschade tijdig en correct is
                                gemeld, zal ServerPunt naar eigen keuze
                                zorgdragen voor herstel, vervanging of
                                terugbetaling.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 12 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 12. Afhalen
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Indien afhalen is overeengekomen, dient de Klant
                                het Product op het afgesproken tijdstip en adres
                                af te halen.
                            </li>
                            <li>
                                Bij afhalen gaat het risico over op de Klant op
                                het moment van overdracht van het Product.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 13 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 13. Herroepingsrecht
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                De Consument heeft het recht de Overeenkomst met
                                betrekking tot de aankoop van een Product binnen
                                14 dagen na ontvangst zonder opgave van redenen
                                te ontbinden.
                            </li>
                            <li>
                                De herroepingstermijn verstrijkt 14 dagen na de
                                dag waarop de Consument, of een door hem
                                aangewezen derde, het Product heeft ontvangen.
                            </li>
                            <li>
                                Om gebruik te maken van het herroepingsrecht
                                dient de Consument ServerPunt binnen de
                                herroepingstermijn via e-mail of een andere
                                ondubbelzinnige verklaring op de hoogte te
                                stellen van de beslissing de Overeenkomst te
                                ontbinden.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 14 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 14. Gevolgen van herroeping
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Indien de Consument de Overeenkomst herroept,
                                ontvangt hij alle betalingen die tot dan toe
                                zijn gedaan, inclusief eventuele standaard
                                verzendkosten, uiterlijk binnen 14 dagen na de
                                dag waarop ServerPunt van de herroeping op de
                                hoogte is gesteld, terug.
                            </li>
                            <li>
                                ServerPunt mag wachten met terugbetalen tot het
                                Product is ontvangen, of totdat de Consument
                                heeft aangetoond dat het Product is
                                teruggezonden, afhankelijk van welk tijdstip
                                eerst valt.
                            </li>
                            <li>
                                Terugbetaling geschiedt via hetzelfde
                                betaalmiddel als waarmee de oorspronkelijke
                                transactie is verricht, tenzij anders
                                overeengekomen.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 15 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 15. Retourvoorwaarden
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Tijdens de herroepingstermijn dient de Consument
                                zorgvuldig om te gaan met het Product en de
                                verpakking. Het Product mag slechts worden
                                uitgepakt en gebruikt voor zover dat nodig is om
                                de aard, kenmerken en werking vast te stellen.
                            </li>
                            <li>
                                Indien het Product meer is gebruikt dan
                                toegestaan, is de Consument aansprakelijk voor
                                de waardevermindering van het Product.
                            </li>
                            <li>
                                De Consument is verantwoordelijk voor een
                                correcte en deugdelijke retourverzending van het
                                Product.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 16 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 16. Retourkosten
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                De kosten voor retourzending zijn voor rekening
                                van de Consument, tenzij anders overeengekomen.
                            </li>
                            <li>
                                Indien ServerPunt het Product bij de Consument
                                heeft opgehaald, worden de kosten hiervan aan de
                                Consument doorberekend.
                            </li>
                            <li>
                                Retourzendingen dienen te worden verzonden naar
                                het vestigingsadres van ServerPunt aan de
                                Kraaivenstraat 36-07, 5048 AB Tilburg, tenzij
                                schriftelijk anders overeengekomen.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 17 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 17. Uitsluiting herroepingsrecht
                        </h2>
                        <p className="mb-2">
                            Het herroepingsrecht is uitgesloten voor:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>zakelijke klanten;</li>
                            <li>
                                Producten die naar aard niet kunnen worden
                                teruggezonden;
                            </li>
                            <li>
                                Producten die duidelijk persoonlijk of op maat
                                zijn samengesteld;
                            </li>
                            <li>
                                Producten waarvan de verzegeling is verbroken om
                                redenen van hygiëne of veiligheid, indien van
                                toepassing.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 18 */}
                    <section id="warranty">
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 18. Garantie & conformiteit
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                ServerPunt staat ervoor in dat de geleverde
                                Producten voldoen aan de Overeenkomst, de in het
                                aanbod vermelde specificaties en de redelijke
                                eisen van deugdelijkheid en bruikbaarheid,
                                rekening houdend met het refurbished karakter
                                van de Producten.
                            </li>
                            <li>
                                Refurbished Producten zijn gebruikte goederen en
                                kunnen gebruikssporen vertonen. Afwijkingen ten
                                opzichte van nieuwstaat, zoals lichte
                                cosmetische beschadigingen, vormen geen gebrek
                                en geven geen recht op vervanging, herstel of
                                ontbinding.
                            </li>
                            <li>
                                Voor Consumenten geldt de wettelijke garantie.
                                Dit betekent dat een Product datgene moet doen
                                wat de Consument er in redelijkheid van mag
                                verwachten. ServerPunt kan deze wettelijke
                                garantie niet uitsluiten of beperken.
                            </li>
                            <li>
                                Eventuele aanvullende garantie die door
                                ServerPunt wordt verstrekt, wordt uitdrukkelijk
                                en schriftelijk vermeld bij het Product en laat
                                de wettelijke garantie onverlet.
                            </li>
                            <li>
                                Voor zakelijke klanten geldt uitsluitend de door
                                ServerPunt uitdrukkelijk verstrekte garantie.
                                Bij gebreke daarvan geldt geen aanvullende
                                garantie.
                            </li>
                            <li>
                                Indien bij een Product geen aanvullende
                                garantieperiode wordt vermeld, geldt uitsluitend
                                de wettelijke garantie voor Consumenten en geen
                                aanvullende garantie voor zakelijke klanten.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 19 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 19. Melding van gebreken
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                De Klant is verplicht het Product zo spoedig
                                mogelijk na ontvangst te controleren op
                                gebreken.
                            </li>
                            <li>
                                Gebreken die niet zichtbaar waren bij ontvangst
                                dienen door de Consument binnen bekwame tijd na
                                ontdekking te worden gemeld.
                            </li>
                            <li>
                                Zakelijke klanten dienen gebreken binnen 7 dagen
                                na ontvangst schriftelijk te melden. Bij gebreke
                                hiervan vervalt het recht op herstel, vervanging
                                of enige andere compensatie.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 20 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 20. Herstel en vervanging
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Indien een Product niet conform de Overeenkomst
                                blijkt te zijn, zal ServerPunt het Product naar
                                eigen keuze herstellen of vervangen, tenzij dit
                                onmogelijk is of onevenredige kosten met zich
                                meebrengt.
                            </li>
                            <li>
                                Indien herstel of vervanging niet mogelijk is,
                                kan ServerPunt overgaan tot (gedeeltelijke)
                                terugbetaling of ontbinding van de Overeenkomst.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 21 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 21. Aansprakelijkheid
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                De aansprakelijkheid van ServerPunt is beperkt
                                tot het bedrag dat voor het betreffende Product
                                door de Klant is betaald, met een absoluut
                                maximum van het factuurbedrag.
                            </li>
                            <li>
                                ServerPunt is nimmer aansprakelijk voor
                                indirecte schade, waaronder begrepen maar niet
                                beperkt tot:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>gevolgschade;</li>
                                    <li>gederfde winst;</li>
                                    <li>gemiste besparingen;</li>
                                    <li>dataverlies;</li>
                                    <li>bedrijfsschade;</li>
                                    <li>schade door bedrijfsstilstand.</li>
                                </ul>
                            </li>
                            <li>
                                ServerPunt is niet aansprakelijk voor schade die
                                is ontstaan door:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>
                                        onoordeelkundig of onjuist gebruik van
                                        het Product;
                                    </li>
                                    <li>
                                        gebruik buiten de door ServerPunt
                                        opgegeven specificaties;
                                    </li>
                                    <li>
                                        zelf uitgevoerde reparaties of
                                        aanpassingen;
                                    </li>
                                    <li>
                                        gebruik in combinatie met ondeugdelijke
                                        of ongeschikte randapparatuur.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                De in dit artikel opgenomen beperkingen van
                                aansprakelijkheid gelden niet indien de schade
                                het gevolg is van opzet of grove nalatigheid van
                                ServerPunt, of voor zover aansprakelijkheid niet
                                kan worden uitgesloten op grond van dwingend
                                recht.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 22 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 22. Vrijwaring
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                De Klant vrijwaart ServerPunt tegen alle
                                aanspraken van derden die verband houden met het
                                gebruik van de geleverde Producten.
                            </li>
                            <li>
                                De Klant is verantwoordelijk voor het maken van
                                adequate back-ups van data. ServerPunt is niet
                                aansprakelijk voor verlies of beschadiging van
                                data, ongeacht de oorzaak.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 23 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 23. Overmacht
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                ServerPunt is niet gehouden tot het nakomen van
                                enige verplichting jegens de Klant indien zij
                                daartoe gehinderd wordt als gevolg van
                                overmacht.
                            </li>
                            <li>
                                Onder overmacht wordt in ieder geval verstaan
                                elke van de wil van ServerPunt onafhankelijke
                                omstandigheid die de nakoming van verplichtingen
                                tijdelijk of blijvend verhindert, waaronder mede
                                begrepen:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>
                                        storingen bij vervoerders of
                                        leveranciers;
                                    </li>
                                    <li>
                                        vertragingen of uitval in transport;
                                    </li>
                                    <li>
                                        inkoopproblemen of voorraadtekorten;
                                    </li>
                                    <li>stroomstoringen;</li>
                                    <li>internet- of netwerkstoringen;</li>
                                    <li>
                                        brand, waterschade of andere
                                        calamiteiten;
                                    </li>
                                    <li>overheidsmaatregelen;</li>
                                    <li>
                                        epidemieën, pandemieën en daarmee
                                        samenhangende beperkingen.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Indien de overmachtssituatie langer dan 30 dagen
                                voortduurt, zijn zowel ServerPunt als de Klant
                                gerechtigd de Overeenkomst schriftelijk te
                                ontbinden, zonder dat er in dat geval een
                                verplichting tot schadevergoeding bestaat.
                            </li>
                            <li>
                                Indien ServerPunt bij het intreden van de
                                overmacht al gedeeltelijk aan haar
                                verplichtingen heeft voldaan, of deze kan
                                nakomen, is ServerPunt gerechtigd dat deel
                                afzonderlijk te factureren of te verrekenen.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 24 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 24. Klachten
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Klachten over de uitvoering van de Overeenkomst
                                dienen binnen bekwame tijd nadat de Klant het
                                gebrek heeft geconstateerd, volledig en
                                duidelijk omschreven schriftelijk te worden
                                ingediend bij ServerPunt.
                            </li>
                            <li>
                                Klachten kunnen worden ingediend via:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>
                                        e-mail:{" "}
                                        <a
                                            href="mailto:info@serverpunt.com"
                                            className="text-primary hover:underline"
                                        >
                                            info@serverpunt.com
                                        </a>
                                    </li>
                                    <li>
                                        of schriftelijk per post naar het
                                        vestigingsadres van ServerPunt.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                ServerPunt zal ingediende klachten binnen 14
                                dagen na ontvangst beantwoorden. Indien een
                                klacht een voorzienbaar langere verwerkingstijd
                                vereist, zal ServerPunt de Klant hiervan binnen
                                deze termijn op de hoogte stellen.
                            </li>
                            <li>
                                Indien een klacht niet in onderling overleg kan
                                worden opgelost, ontstaat een geschil dat kan
                                worden voorgelegd aan de bevoegde rechter, zoals
                                bepaald in deze algemene voorwaarden.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 25 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 25. Toepasselijk recht
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                Op alle Overeenkomsten tussen ServerPunt en de
                                Klant waarop deze algemene voorwaarden van
                                toepassing zijn, is uitsluitend Nederlands recht
                                van toepassing.
                            </li>
                            <li>
                                Geschillen die voortvloeien uit of verband
                                houden met de Overeenkomst zullen uitsluitend
                                worden voorgelegd aan de bevoegde rechter in het
                                arrondissement waar ServerPunt is gevestigd,
                                tenzij dwingend recht anders voorschrijft.
                            </li>
                        </ul>
                    </section>

                    {/* Artikel 26 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">
                            Artikel 26. Slotbepalingen
                        </h2>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>
                                ServerPunt is gerechtigd deze algemene
                                voorwaarden te wijzigen of aan te vullen.
                                Gewijzigde voorwaarden worden tijdig via de
                                Website bekendgemaakt en zijn van toepassing op
                                toekomstige Overeenkomsten.
                            </li>
                            <li>
                                Indien bepalingen uit deze algemene voorwaarden
                                nietig blijken te zijn of worden vernietigd,
                                tast dit niet de geldigheid van de overige
                                bepalingen aan.
                            </li>
                            <li>
                                Deze algemene voorwaarden zijn voor het laatst
                                gewijzigd op 22 december 2025.
                            </li>
                        </ul>
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
                        <p>BTW: NL868250983B01</p>
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
