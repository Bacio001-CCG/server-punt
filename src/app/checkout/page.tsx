"use client";

import useCart from "@/hooks/useCart";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { MdLocationOn } from "react-icons/md";

export default function Checkout() {
    return (
        <section
            className="
    py-12
    md:py-16
    flex flex-col items-center
    "
        >
            <div
                className="
        container mx-auto max-w-7xl px-4
        sm:px-6
        lg:px-8
        flex gap-10 flex-col
        "
            >
                <Cart />
                <Account />
                <Delivery />
                <InvoiceAddress />
            </div>
        </section>
    );
}

function Cart() {
    const { products, removeProduct, getTotalPrice } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const groupedProducts = useMemo(() => {
        const grouped = products.reduce((acc, product) => {
            const existingProduct = acc.find((item) => item.id === product.id);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                acc.push({ ...product, quantity: 1 });
            }

            return acc;
        }, [] as Array<(typeof products)[0] & { quantity: number }>);

        return grouped;
    }, [products]);

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">Producten</h2>

            <ul className="space-y-4 bg-white p-5 rounded-lg border border-border">
                {groupedProducts.length === 0 && (
                    <p className="text-center text-gray-500">
                        Je winkelwagen is leeg.
                    </p>
                )}
                {groupedProducts.map((item, index) => (
                    <li
                        key={item.id || index}
                        className="flex items-center gap-4"
                    >
                        <Image
                            width={48}
                            height={48}
                            src={item.imageUrl}
                            alt={item.name}
                            className="size-16 rounded-sm object-cover"
                        />
                        <div className="flex justify-between w-full items-center">
                            <div>
                                <h3 className="text-sm text-gray-900">
                                    {item.name}
                                </h3>

                                <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                    <div>
                                        <dt className="inline mr-1">Aantal:</dt>
                                        <dd className="inline">
                                            {item.quantity}x
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline mr-1">Prijs:</dt>
                                        <dd className="inline">
                                            {mounted ? (
                                                <>
                                                    €
                                                    {String(
                                                        (
                                                            item.price *
                                                            item.quantity
                                                        ).toFixed(2)
                                                    ).replace(".", ",")}
                                                </>
                                            ) : (
                                                "€0,00"
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <Trash
                                onClick={() => {
                                    removeProduct(item.id);
                                }}
                                className="text-red-500 scale-75 cursor-pointer hover:scale-90 transition-transform"
                            />
                        </div>
                    </li>
                ))}
                <li className="w-full text-right">
                    {mounted ? (
                        <>
                            €{" "}
                            {String(getTotalPrice().toFixed(2)).replace(
                                ".",
                                ","
                            )}
                        </>
                    ) : (
                        "€ 0,00"
                    )}
                </li>
            </ul>
        </div>
    );
}

function Account() {
    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">Account</h2>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="example@gmail.com"
                    required
                />
            </div>
        </div>
    );
}

function Delivery() {
    const [sendingMethod, setSendingMethod] = useState("delivery");
    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">Bezorging</h2>
            <div className="grid grid-cols-2 w-full border-border border rounded-lg divide-x divide-x-border h-10">
                <button
                    onClick={() => setSendingMethod("delivery")}
                    className={`w-full ${
                        sendingMethod === "delivery" && "bg-accent"
                    }`}
                >
                    Bezorgen
                </button>
                <button
                    onClick={() => setSendingMethod("pickup")}
                    className={`w-full ${
                        sendingMethod === "pickup" && "bg-accent"
                    }`}
                >
                    Ophalen
                </button>
            </div>
            <input type="hidden" name="delivery_method" value={sendingMethod} />
            {sendingMethod === "delivery" ? (
                <DeliveryDelivery />
            ) : (
                <DeliveryPickup />
            )}
        </div>
    );
}

function DeliveryPickup() {
    return (
        <a
            href="https://www.google.com/maps/dir//ServerPunt,+Kraaivenstraat+36,+07+Tilburg/@51.579652,5.0627759,651m/data=!3m1!1e3!4m17!1m7!3m6!1s0x47c6950071838207:0xe86114d2bfc5f69a!2sServerPunt!8m2!3d51.579652!4d5.0653508!16s%2Fg%2F11mlgqbr3k!4m8!1m0!1m5!1m1!1s0x47c6950071838207:0xe86114d2bfc5f69a!2m2!1d5.0653508!2d51.579652!3e0?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            className="p-3 rounded-lg border border-border bg-white flex justify-between hover:bg-accent duration-300 transition-all"
        >
            <div>
                <h3 className="text-lg font-semibold">
                    Server Punt, Kraaivenstraat 36, 07 Tilburg
                </h3>
                <p className="text-gray-500">
                    Wij zullen contact met u zoeken via email, voor verder
                    informatie zoals ophaal tijdstip.
                </p>
            </div>
            <MdLocationOn size={40} className="my-auto" />
        </a>
    );
}

function DeliveryDelivery() {
    return (
        <>
            <div>
                <label htmlFor="country">Land</label>
                <select
                    id="country"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    name="delivery.country"
                    required
                    defaultValue={"netherlands"}
                >
                    <option value={"netherlands"}>Nederland</option>
                    <option value={"belgium"}>België</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-5 w-full">
                <div>
                    <label htmlFor="delivery.firstname">Voornaam</label>
                    <input
                        type="text"
                        id="delivery.firstname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="John"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="delivery.lastname">Achternaam</label>
                    <input
                        type="text"
                        id="delivery.lastname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Doe"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="delivery.company">Bedrijf (optioneel)</label>
                <input
                    type="text"
                    id="delivery.company"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Server Punt"
                />
            </div>
            <div>
                <label htmlFor="delivery.address">Adres</label>
                <input
                    type="text"
                    id="delivery.address"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Kraaivenstraat 36"
                />
            </div>
            <div className="grid grid-cols-2 gap-5 w-full">
                <div>
                    <label htmlFor="delivery.postalcode">Postcode</label>
                    <input
                        type="text"
                        id="delivery.postalcode"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="5048AB"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="delivery.city">Stad</label>
                    <input
                        type="text"
                        id="delivery.city"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Tilburg"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="delivery.phonenumber">Telefoon</label>
                <input
                    type="tel"
                    id="delivery.phonenumber"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="0612345678"
                    required
                />
            </div>
            <div className="flex gap-2">
                <input type="checkbox" name="delivery.save" />
                <label htmlFor="delivery.save">
                    Adres opslaan voor later gebruik.
                </label>
            </div>
        </>
    );
}

function InvoiceAddress() {
    const { getTotalPrice } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">Factuur</h2>

            <div>
                <label htmlFor="country">Land</label>
                <select
                    id="country"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    name="invoice.country"
                    required
                    defaultValue={"netherlands"}
                >
                    <option value={"netherlands"}>Nederland</option>
                    <option value={"belgium"}>België</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-5 w-full">
                <div>
                    <label htmlFor="invoice.firstname">Voornaam</label>
                    <input
                        type="text"
                        id="invoice.firstname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="John"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="invoice.lastname">Achternaam</label>
                    <input
                        type="text"
                        id="invoice.lastname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Doe"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="invoice.company">Bedrijf (optioneel)</label>
                <input
                    type="text"
                    id="invoice.company"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Server Punt"
                />
            </div>
            <div>
                <label htmlFor="invoice.address">Adres</label>
                <input
                    type="text"
                    id="invoice.address"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Kraaivenstraat 36"
                />
            </div>
            <div className="grid grid-cols-2 gap-5 w-full">
                <div>
                    <label htmlFor="invoice.postalcode">Postcode</label>
                    <input
                        type="text"
                        id="invoice.postalcode"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="5048AB"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="invoice.city">Stad</label>
                    <input
                        type="text"
                        id="invoice.city"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Tilburg"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="invoice.phonenumber">
                    Telefoon (optioneel)
                </label>
                <input
                    type="tel"
                    id="invoice.phonenumber"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="0612345678"
                />
            </div>
            <button
                className="
                    bg-black text-white font-semibold rounded-lg w-fit py-1.5 px-3 duration-300 hover:opacity-70 transition-all cursor-pointer
                "
                type="submit"
            >
                Betalen (
                {mounted ? (
                    <>€{String(getTotalPrice().toFixed(2)).replace(".", ",")}</>
                ) : (
                    "€0,00"
                )}
                )
            </button>
        </div>
    );
}
