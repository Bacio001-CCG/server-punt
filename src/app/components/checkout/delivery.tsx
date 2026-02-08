"use client";
import { useState } from "react";
import { MdLocationOn } from "react-icons/md";

export default function Delivery({
    setSendingMethod,
    sendingMethod,
}: {
    setSendingMethod: (method: "delivery" | "pickup") => void;
    sendingMethod: "delivery" | "pickup";
}) {
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
                    ServerPunt, Kraaivenstraat 36, 07 Tilburg
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
                    defaultValue={"netherlands"}
                >
                    <option value={"netherlands"}>Nederland</option>
                    {/* <option value={"belgium"}>België</option> */}
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
                        name="delivery.firstname"
                    />
                </div>
                <div>
                    <label htmlFor="delivery.lastname">Achternaam</label>
                    <input
                        type="text"
                        id="delivery.lastname"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Doe"
                        name="delivery.lastname"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="delivery.company">Bedrijf (optioneel)</label>
                <input
                    type="text"
                    id="delivery.company"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="ServerPunt"
                    name="delivery.company"
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
                <label htmlFor="invoice.cocNumber">
                    BTW nummer (Alleen als bedrijf is ingevuld)
                </label>
                <input
                    type="text"
                    id="invoice.vatNumber"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    name="invoice.vatNumber"
                />
            </div>
            <div>
                <label htmlFor="delivery.address">Adres</label>
                <input
                    type="text"
                    id="delivery.address"
                    className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Kraaivenstraat 36"
                    name="delivery.address"
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
                        name="delivery.postalcode"
                    />
                </div>
                <div>
                    <label htmlFor="delivery.city">Stad</label>
                    <input
                        type="text"
                        id="delivery.city"
                        className="block w-full border border-gray-300 rounded-md p-2 mt-1"
                        placeholder="Tilburg"
                        name="delivery.city"
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
                    name="delivery.phonenumber"
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
