"use server";

import z from "zod";
import Axios from "axios";
import {
    customersTable,
    InsertOrder,
    orderItemsTable,
    orderItemsConfigurationTable,
    ordersTable,
    SelectProduct,
    productsTable,
} from "@/database/schema";
import { db } from "@/database/connect";
import { eq } from "drizzle-orm";

// 1 of 2 servers 40 euro
// 5 kleine producten 10 euro
// meer dan 5 kleine producten 15 euro

// meer dan 2 servers geen verzend kosten

type ConfiguredItem = { product: SelectProduct; quantity: number };
type CheckoutProduct = {
    product: SelectProduct & { configuredItems?: ConfiguredItem[] };
    quantity: number;
};

export async function processCheckout(
    formObject: {
        [k: string]: FormDataEntryValue;
    },
    products: CheckoutProduct[]
) {
    const splitDescription = (text: string, limit = 100) => {
        if (text.length <= limit) return [text];

        const parts: string[] = [];
        let remaining = text;

        while (remaining.length > limit) {
            let cut = remaining.lastIndexOf(" ", limit);
            if (cut === -1 || cut < limit / 2) {
                cut = limit;
            }
            parts.push(remaining.slice(0, cut).trim());
            remaining = remaining.slice(cut).trim();
        }

        if (remaining) parts.push(remaining);
        return parts;
    };
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
        // Check stock availability for all products
        for (const item of products) {
            // Check main product stock
            const mainProduct = await db
                .select({
                    id: productsTable.id,
                    name: productsTable.name,
                    quantityInStock: productsTable.quantityInStock
                })
                .from(productsTable)
                .where(eq(productsTable.id, item.product.id))
                .limit(1);

            if (mainProduct.length === 0) {
                throw new Error(`Product ${item.product.name} niet gevonden`);
            }

            if (mainProduct[0].quantityInStock < item.quantity) {
                throw new Error(
                    `Product ${item.product.name} heeft onvoldoende voorraad. Beschikbaar: ${mainProduct[0].quantityInStock}, Gevraagd: ${item.quantity}`
                );
            }

            // Check configured items stock
            const configuredItems = item.product.configuredItems || [];
            for (const configItem of configuredItems) {
                const configProduct = await db
                    .select({
                        id: productsTable.id,
                        name: productsTable.name,
                        quantityInStock: productsTable.quantityInStock
                    })
                    .from(productsTable)
                    .where(eq(productsTable.id, configItem.product.id))
                    .limit(1);

                if (configProduct.length === 0) {
                    throw new Error(`Configuratie product ${configItem.product.name} niet gevonden`);
                }

                const totalNeeded = configItem.quantity * item.quantity;
                if (configProduct[0].quantityInStock < totalNeeded) {
                    throw new Error(
                        `Configuratie product ${configItem.product.name} heeft onvoldoende voorraad. Beschikbaar: ${configProduct[0].quantityInStock}, Gevraagd: ${totalNeeded}`
                    );
                }
            }
        }

        // First, try to find existing customer
        let customerId: number;

        const existingCustomer = await db
            .select({ id: customersTable.id })
            .from(customersTable)
            .where(eq(customersTable.email, result.data.email))
            .limit(1);

        if (existingCustomer.length > 0) {
            // Customer exists, use existing ID
            customerId = existingCustomer[0].id;
        } else {
            // Customer doesn't exist, create new one
            const newCustomer = await db
                .insert(customersTable)
                .values({
                    email: result.data.email,
                    deliveryMethod: result.data.delivery_method,
                    deliveryCountry: result.data["delivery.country"] || null,
                    deliveryFirstname:
                        result.data["delivery.firstname"] || null,
                    deliveryLastname: result.data["delivery.lastname"] || null,
                    deliveryCompany: result.data["delivery.company"] || null,
                    deliveryAddress: result.data["delivery.address"] || null,
                    deliveryPostalcode:
                        result.data["delivery.postalcode"] || null,
                    deliveryCity: result.data["delivery.city"] || null,
                    deliveryPhonenumber:
                        result.data["delivery.phonenumber"] || null,
                    invoiceCountry: result.data["invoice.country"],
                    invoiceFirstname: result.data["invoice.firstname"],
                    invoiceLastname: result.data["invoice.lastname"],
                    invoiceCompany: result.data["invoice.company"] || null,
                    invoiceCOCNumber: result.data["invoice.cocNumber"] || null,
                    invoiceAddress: result.data["invoice.address"],
                    invoicePostalcode: result.data["invoice.postalcode"],
                    invoiceCity: result.data["invoice.city"],
                    invoicePhonenumber:
                        result.data["invoice.phonenumber"] || null,
                })
                .returning({ id: customersTable.id });

            customerId = newCustomer[0].id;
        }

        let verzendkosten = 0;
        const serversCount = products.filter(
            (item) => item.product.categoryId === 7
        ).length;
        const smallProductsCount = products.reduce(
            (acc, item) =>
                item.product.categoryId !== 7 ? acc + item.quantity : acc,
            0
        );

        if (smallProductsCount > 0 && smallProductsCount <= 5) {
            verzendkosten = 10;
        }

        if (smallProductsCount > 5) {
            verzendkosten = 15;
        }

        if (serversCount === 1 || serversCount === 2) {
            verzendkosten = 40;
        }

        if (serversCount > 2) {
            verzendkosten = 0;
        }

        const response = await Axios.post(
            "https://api.mollie.com/v2/sales-invoices",
            {
                testmode: process.env.TEST_MODE === "true",
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
                lines: products
                    .flatMap((item) => {
                        const configuredItems = item.product.configuredItems || [];
                        const configuredTotal = configuredItems.reduce(
                            (sum, sub) => sum + sub.product.price * sub.quantity,
                            0
                        );
                        const unitPriceValue = item.product.price + configuredTotal;

                        const baseDescription = configuredItems.length
                            ? `${item.product.name} (incl. ${configuredItems
                                .map(
                                    (sub) => `${sub.product.name} x ${sub.quantity}`
                                )
                                .join(", ")})`
                            : item.product.name;

                        const parts = splitDescription(baseDescription, 100);

                        return parts.map((part, idx) => ({
                            description: part,
                            quantity: idx === 0 ? item.quantity : 1,
                            unitPrice: {
                                currency: "EUR",
                                value: (idx === 0 ? unitPriceValue : 0).toFixed(2),
                            },
                            vatRate: "21",
                        }));
                    })
                    .concat([
                        {
                            description: "Verzendkosten",
                            quantity: 1,
                            unitPrice: {
                                currency: "EUR",
                                value: verzendkosten.toFixed(2),
                            },
                            vatRate: "21",
                        },
                    ]),
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
        const order = await db
            .insert(ordersTable)
            .values({
                customerId: customerId,
                invoiceId: response.data.id,
                status: "pending",
                deliveryMethod: result.data.delivery_method,
                deliveryCountry: result.data["delivery.country"] || null,
                deliveryFirstname: result.data["delivery.firstname"] || null,
                deliveryLastname: result.data["delivery.lastname"] || null,
                deliveryCompany: result.data["delivery.company"] || null,
                deliveryAddress: result.data["delivery.address"] || null,
                deliveryPostalcode: result.data["delivery.postalcode"] || null,
                deliveryCity: result.data["delivery.city"] || null,
                deliveryPhonenumber:
                    result.data["delivery.phonenumber"] || null,
                invoiceCountry: result.data["invoice.country"],
                invoiceFirstname: result.data["invoice.firstname"],
                invoiceLastname: result.data["invoice.lastname"],
                invoiceCompany: result.data["invoice.company"] || null,
                invoiceCOCNumber: result.data["invoice.cocNumber"] || null,
                invoiceAddress: result.data["invoice.address"],
                invoicePostalcode: result.data["invoice.postalcode"],
                invoiceCity: result.data["invoice.city"],
                invoicePhonenumber: result.data["invoice.phonenumber"] || null,
            } as InsertOrder)
            .returning({ id: ordersTable.id });

        const orderItems = await db.insert(orderItemsTable).values(
            products.map((item) => {
                const configuredItems = item.product.configuredItems || [];
                const configuredTotal = configuredItems.reduce(
                    (sum, sub) => sum + sub.product.price * sub.quantity,
                    0
                );

                return {
                    orderId: order[0].id,
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: parseFloat(
                        (item.product.price + configuredTotal).toFixed(2)
                    ),
                };
            })
        ).returning({ id: orderItemsTable.id });

        // Insert configured items into separate table
        for (let i = 0; i < products.length; i++) {
            const configuredItems = products[i].product.configuredItems || [];
            if (configuredItems.length > 0) {
                await db.insert(orderItemsConfigurationTable).values(
                    configuredItems.map((item) => ({
                        orderItemId: orderItems[i].id,
                        productId: item.product.id,
                        quantity: item.quantity,
                    }))
                );
            }
        }
        return response2.data._links.checkout.href;
    } catch (error: any) {
        console.error((error as any)?.response?.data || error);
        throw new Error(
            (error as any)?.response?.data?.detail || error.message || "An error occurred"
        );
    }
}
