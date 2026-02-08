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
            "invoice.vatNumber": z
                .string({
                    message: "BTW nummer is ongeldig",
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
                    return (
                        data["invoice.cocNumber"] && data["invoice.vatNumber"]
                    );
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
                    quantityInStock: productsTable.quantityInStock,
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
                        quantityInStock: productsTable.quantityInStock,
                    })
                    .from(productsTable)
                    .where(eq(productsTable.id, configItem.product.id))
                    .limit(1);

                if (configProduct.length === 0) {
                    throw new Error(
                        `Configuratie product ${configItem.product.name} niet gevonden`
                    );
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
                    invoiceVatNumber: result.data["invoice.vatNumber"] || null,
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

        // Only calculate shipping costs if delivery method is "delivery"
        if (result.data.delivery_method === "delivery") {
            const serversCount = products.filter(
                (item) => item.product.categoryId === 1
            ).length;
            const smallProductsCount = products.reduce(
                (acc, item) =>
                    item.product.categoryId !== 1 ? acc + item.quantity : acc,
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
        }

        let contactId: number | null = null;

        try {
            const res = await Axios.get(
                `https://moneybird.com/api/v2/${process.env.MONEYBIRD_ADMINISTRATION_ID}/contacts/customer_id/${customerId}.json`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.MONEYBIRD_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            contactId = res.data.id;
        } catch (error) {
            const res = await Axios.post(
                `https://moneybird.com/api/v2/${process.env.MONEYBIRD_ADMINISTRATION_ID}/contacts.json`,
                {
                    contact: {
                        company_name: result.data["invoice.company"] || null,
                        firstname: result.data["invoice.firstname"],
                        lastname: result.data["invoice.lastname"],
                        address1: result.data["invoice.address"],
                        zipcode: result.data["invoice.postalcode"],
                        city: result.data["invoice.city"],
                        country: result.data["invoice.country"],
                        email: result.data.email,
                        customer_id: customerId.toString(),
                        chamber_of_commerce:
                            result.data["invoice.cocNumber"] || null,
                        tax_number: result.data["invoice.vatNumber"] || null,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.MONEYBIRD_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            contactId = res.data.id;
        }

        const salesInvoice = await Axios.post(
            `https://moneybird.com/api/v2/${process.env.MONEYBIRD_ADMINISTRATION_ID}/sales_invoices.json`,
            {
                sales_invoice: {
                    contact_id: contactId,
                    reference: `${new Date().getUTCFullYear()}-${customerId}-${Date.now()}`,
                    invoice_date: new Date().toISOString().split("T")[0],
                    status: "open",
                    currency: "EUR",
                    details_attributes: [
                        ...products.flatMap((item) => {
                            const configuredItems =
                                item.product.configuredItems || [];
                            const configuredTotal = configuredItems.reduce(
                                (sum, sub) =>
                                    sum + sub.product.price * sub.quantity,
                                0
                            );

                            const unitPriceValue =
                                item.product.price + configuredTotal;

                            const baseDescription = configuredItems.length
                                ? `${item.product.name} (incl. ${configuredItems
                                      .map(
                                          (sub) =>
                                              `${sub.product.name} x ${sub.quantity}`
                                      )
                                      .join(", ")})`
                                : item.product.name;

                            const parts = splitDescription(
                                baseDescription,
                                100
                            );

                            return parts.map((part, idx) => ({
                                description: part,
                                amount:
                                    idx === 0 ? item.quantity.toString() : "1",
                                price: (idx === 0 ? unitPriceValue : 0).toFixed(
                                    2
                                ),
                            }));
                        }),
                        {
                            description: "Verzendkosten",
                            amount: "1",
                            price: verzendkosten.toFixed(2),
                        },
                    ],
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MONEYBIRD_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        await Axios.patch(
            `https://moneybird.com/api/v2/${process.env.MONEYBIRD_ADMINISTRATION_ID}/sales_invoices/${salesInvoice.data.id}/send_invoice.json`,
            {
                sales_invoice_sending: {
                    delivery_method: "Email",
                    deliver_ubl: true,
                    email_address: result.data.email,
                    email_message:
                        "Bedankt voor je bestelling! In de bijlage vind je de factuur. Neem gerust contact met ons op als je vragen hebt.",
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MONEYBIRD_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const order = await db
            .insert(ordersTable)
            .values({
                customerId: customerId,
                invoiceId: salesInvoice.data.id,
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

        const orderItems = await db
            .insert(orderItemsTable)
            .values(
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
            )
            .returning({ id: orderItemsTable.id });

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

        return [salesInvoice.data.payment_url, order[0].id] as [string, number];
    } catch (error: any) {
        console.error(
            (error as any)?.response?.data.details.delivery_method || error
        );
        throw new Error(
            (error as any)?.response?.data?.detail ||
                error.message ||
                "An error occurred"
        );
    }
}
