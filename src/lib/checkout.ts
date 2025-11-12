"use server";

import z from "zod";
import Axios from "axios";
import { SelectProduct } from "@/database/schema";

export async function processCheckout(
    formObject: {
        [k: string]: FormDataEntryValue;
    },
    products: {
        product: SelectProduct;
        quantity: number;
    }[]
) {
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
                message: "Land is ongeldig",
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
            "invoice.cocNumber": z
                .string({
                    message: "KvK nummer is ongeldig",
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
            "invoice.phonenumber": z
                .string({
                    message: "Telefoonnummer is ongeldig",
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
        console.error(result);
        throw new Error("Formulier validatie mislukt");
    }

    try {
        const response = await Axios.post(
            "https://api.mollie.com/v2/sales-invoices",
            {
                testmode: true,
                profileId: process.env.MOLLIE_PROFILE_ID,
                status: "issued",
                recipientIdentifier: result.data.email,
                recipient: {
                    type: result.data["invoice.company"]
                        ? "business"
                        : "consumer",
                    givenName: result.data["invoice.firstname"],
                    familyName: result.data["invoice.lastname"],
                    organizationName: result.data["invoice.company"] || null,
                    email: result.data.email,
                    phone: result.data["invoice.phonenumber"] || null,
                    streetAndNumber: result.data["invoice.address"],
                    postalCode: result.data["invoice.postalcode"],
                    city: result.data["invoice.city"],
                    country:
                        result.data["invoice.country"] === "netherlands"
                            ? "NL"
                            : "BE",
                    locale: "nl-NL",
                    organizationNumber:
                        result.data["invoice.cocNumber"] || null,
                },
                lines: products.map((item) => ({
                    description: item.product.name,
                    quantity: item.quantity,
                    unitPrice: {
                        currency: "EUR",
                        value: item.product.price.toFixed(2),
                    },
                    vatRate: "21",
                })),
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const response2 = await Axios.post(
            "https://api.mollie.com/v2/payments",
            {
                description: `Factuur #${response.data.invoiceNumber} - Server Punt`,
                amount: {
                    value: response.data.amountDue.value,
                    currency: "EUR",
                },
                redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
                cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
                webhookUrl: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/api/mollie/webhook`,
                billingAddress: {
                    givenName: result.data["invoice.firstname"],
                    familyName: result.data["invoice.lastname"],
                    organizationName: result.data["invoice.company"] || null,
                    email: result.data.email,
                    phone: result.data["invoice.phonenumber"] || null,
                    streetAndNumber: result.data["invoice.address"],
                    postalCode: result.data["invoice.postalcode"],
                    city: result.data["invoice.city"],
                    country:
                        result.data["invoice.country"] === "netherlands"
                            ? "NL"
                            : "BE",
                },
                locale: "nl_NL",
                metadata: {
                    salesInvoiceId: response.data.id,
                    invoiceNumber: response.data.invoiceNumber,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        //TODO: Save the delivery info and other info regarding order into DB
        return response2.data._links.checkout.href;
    } catch (error: any) {
        console.error((error as any)?.response?.data || error);
        throw new Error(
            (error as any)?.response?.data?.detail || "An error occurred"
        );
    }
}
