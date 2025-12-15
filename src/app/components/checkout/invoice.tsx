"use client";
import useCart from "@/hooks/useCart";
import { useEffect, useState } from "react";

export default function InvoiceAddress() {
    const { getTotalPrice, getVatPrice, getShippingCost } = useCart();
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
                        name="invoice.firstname"
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
                        name="invoice.lastname"
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
                    name="invoice.company"
                />
            </div>
            <div>
                <label htmlFor="invoice.cocNumber">
                    KVK nummer (Alleen als bedrijf is ingevuld)
                </label>
                <input
                    type="text"
                    id="invoice.cocNumber"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    name="invoice.cocNumber"
                />
            </div>
            <div>
                <label htmlFor="invoice.address">Adres</label>
                <input
                    type="text"
                    id="invoice.address"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Kraaivenstraat 36"
                    name="invoice.address"
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
                        name="invoice.postalcode"
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
                        name="invoice.city"
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
                    name="invoice.phonenumber"
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
                    <>€{String((getTotalPrice() + getVatPrice() + getShippingCost()).toFixed(2)).replace(".", ",")}</>
                ) : (
                    "€0,00"
                )}
                )
            </button>
        </div>
    );
}
