"use client";
import Cart from "../components/checkout/cart";
import Account from "../components/checkout/account";
import Delivery from "../components/checkout/delivery";
import InvoiceAddress from "../components/checkout/invoice";
import { FormEvent, useState } from "react";
import z from "zod";
import { processCheckout } from "@/lib/checkout";
import useCart from "@/hooks/useCart";
import { useRouter } from "next/navigation";

export default function Checkout() {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { getGroupedProducts } = useCart();
    const router = useRouter();
    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
        "delivery"
    );

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        setErrors({});
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const formObject = Object.fromEntries(formData.entries());

        if (formObject["delivery.save"]) {
            formObject["delivery.save"] = (
                formObject["delivery.save"] === "on"
            ).toString();
        }

        const formCheck = z
            .object({
                email: z.email(),
                delivery_method: z.enum(["delivery", "pickup"]),
                "delivery.country": z
                    .enum(["netherlands", "belgium"], {
                        message: "Gekozen land is ongeldig",
                    })
                    .optional(),
                "delivery.firstname": z
                    .string({
                        message: "Voornaam is ongeldig",
                    })
                    .optional(),
                "delivery.lastname": z
                    .string({
                        message: "Achternaam is ongeldig",
                    })
                    .optional(),
                "delivery.company": z
                    .string({
                        message: "Bedrijfsnaam is ongeldig",
                    })
                    .optional(),
                "delivery.address": z
                    .string({
                        message: "Adres is ongeldig",
                    })
                    .optional(),
                "delivery.postalcode": z
                    .string({
                        message: "Postcode is ongeldig",
                    })
                    .optional(),
                "delivery.city": z
                    .string({
                        message: "Stad is ongeldig",
                    })
                    .optional(),
                "delivery.phonenumber": z
                    .string({
                        message: "Telefoonnummer is ongeldig",
                    })
                    .optional(),
                "delivery.save": z
                    .boolean({
                        message: "Opslaan is ongeldig",
                    })
                    .optional(),
                "invoice.country": z.string({
                    message: "Stad is ongeldig",
                }),
                "invoice.firstname": z.string({
                    message: "Voornaam is ongeldig",
                }),
                "invoice.lastname": z.string({
                    message: "Achternaam is ongeldig",
                }),
                "invoice.company": z
                    .string({
                        message: "Bedrijf is ongeldig",
                    })
                    .optional(),
                "invoice.address": z.string({
                    message: "Adres is ongeldig",
                }),
                "invoice.postalcode": z.string({
                    message: "Postcode is ongeldig",
                }),
                "invoice.city": z.string({
                    message: "Stad is ongeldig",
                }),
                "invoice.cocNumber": z
                    .string({
                        message: "KvK nummer is ongeldig",
                    })
                    .optional(),
            })
            .refine(
                (data) => {
                    if (data.delivery_method === "delivery") {
                        return (
                            data["delivery.country"] &&
                            data["delivery.firstname"] &&
                            data["delivery.lastname"] &&
                            data["delivery.address"] &&
                            data["delivery.postalcode"] &&
                            data["delivery.city"] &&
                            data["delivery.phonenumber"]
                        );
                    }
                    return true;
                },
                {
                    message: "Bezorg gegevens kloppen niet",
                    path: ["delivery"],
                }
            )
            .refine(
                (data) => {
                    if (data["invoice.company"]) {
                        return data["invoice.cocNumber"];
                    }
                    return true;
                },
                {
                    message: "KvK nummer is verplicht voor bedrijven",
                    path: ["invoice.cocNumber"],
                }
            );

        const result = formCheck.safeParse(formObject);

        if (!result.success) {
            setErrors(
                result.error.issues.reduce((acc, issue) => {
                    acc[issue.path.join(".")] = issue.message;
                    return acc;
                }, {} as { [key: string]: string })
            );
            return;
        }

        try {
            const res = await processCheckout(formObject, getGroupedProducts());
            router.push("/checkout/verify?order=" + res[1]);
            window.open(res[0], "_blank");
        } catch (error: any) {
            console.error(error);
            setErrors({
                general: error.message || "Er is een fout opgetreden",
            });
        }
    }

    return (
        <section
            className="
    py-12
    md:py-16
    flex flex-col items-center
    "
        >
            <form
                onSubmit={onSubmit}
                className="
        container mx-auto max-w-7xl px-4
        sm:px-6
        lg:px-8
        flex gap-10 flex-col
        "
            >
                <Cart deliveryMethod={deliveryMethod} />
                <Account />
                <Delivery
                    sendingMethod={deliveryMethod}
                    setSendingMethod={setDeliveryMethod}
                />
                <InvoiceAddress />

                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-200 text-red-700 p-3 rounded-lg border border-red-400">
                        {Object.keys(errors).length > 0 && (
                            <ul className="list-disc list-inside">
                                {Object.entries(errors).map(
                                    ([field, message]) => (
                                        <li key={field}>{message}</li>
                                    )
                                )}
                            </ul>
                        )}
                    </div>
                )}
            </form>
        </section>
    );
}
