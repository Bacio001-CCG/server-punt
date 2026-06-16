"use server";

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
import { createCheckoutSchema } from "./checkout-schema";
import {
    calculateShippingCost,
    toMoneybirdCountry,
} from "./regions";
import {
    getVatNumberForVies,
    validateRegistrationNumber,
    validateVatNumberFormat,
} from "./company-fields";
import { verifyVatWithVies } from "./vies";
import { getTranslations } from "next-intl/server";

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
    const t = await getTranslations("validation");
    const tErrors = await getTranslations("errors");
    const tEmail = await getTranslations("email");
    const tCheckout = await getTranslations("checkout");
    const tFields = await getTranslations("companyFields");

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

    const formCheck = createCheckoutSchema({
        invalidCountry: t("invalidCountry"),
        invalidFirstname: t("invalidFirstname"),
        invalidLastname: t("invalidLastname"),
        invalidCompany: t("invalidCompany"),
        invalidAddress: t("invalidAddress"),
        invalidPostalcode: t("invalidPostalcode"),
        invalidCity: t("invalidCity"),
        invalidPhone: t("invalidPhone"),
        invalidSave: t("invalidSave"),
        deliveryInvalid: t("deliveryInvalid"),
        companyFieldsRequired: t("companyFieldsRequired"),
        invalidRegistration: tFields("invalidRegistration"),
        invalidVat: tFields("invalidVat"),
        vatCountryMismatch: tFields("vatCountryMismatch", {
            country: String(formObject["invoice.country"] ?? "NL").toUpperCase(),
        }),
    });

    const result = formCheck.safeParse(formObject);

    if (!result.success) {
        console.error(result);
        const firstIssue = result.error.issues[0];
        throw new Error(firstIssue?.message ?? t("formFailed"));
    }

    const company = result.data["invoice.company"]?.trim();
    const vatNumber = result.data["invoice.vatNumber"]?.trim();
    const invoiceCountry = result.data["invoice.country"];

    if (company && vatNumber) {
        const viesPayload = getVatNumberForVies(vatNumber, invoiceCountry);
        if (viesPayload) {
            const viesResult = await verifyVatWithVies(
                viesPayload.countryCode,
                viesPayload.vatNumber
            );
            if (!viesResult.unavailable && !viesResult.valid) {
                throw new Error(tFields("viesInvalid"));
            }
        }
    }

    // Normalize company identifiers before storage
    if (result.data["invoice.cocNumber"]) {
        const regResult = validateRegistrationNumber(
            result.data["invoice.cocNumber"],
            invoiceCountry
        );
        if (regResult.valid) {
            result.data["invoice.cocNumber"] = regResult.normalized;
        }
    }
    if (vatNumber) {
        const vatResult = validateVatNumberFormat(vatNumber, invoiceCountry);
        if (vatResult.valid) {
            result.data["invoice.vatNumber"] = vatResult.normalized;
        }
    }

    const deliveryCountry =
        result.data["delivery.country"] ?? result.data["invoice.country"];

    try {
        for (const item of products) {
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
                throw new Error(
                    tErrors("productNotFound", { name: item.product.name })
                );
            }

            if (mainProduct[0].quantityInStock < item.quantity) {
                throw new Error(
                    tErrors("insufficientStock", {
                        name: item.product.name,
                        available: mainProduct[0].quantityInStock,
                        requested: item.quantity,
                    })
                );
            }

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
                        tErrors("configProductNotFound", {
                            name: configItem.product.name,
                        })
                    );
                }

                const totalNeeded = configItem.quantity * item.quantity;
                if (configProduct[0].quantityInStock < totalNeeded) {
                    throw new Error(
                        tErrors("configInsufficientStock", {
                            name: configItem.product.name,
                            available: configProduct[0].quantityInStock,
                            requested: totalNeeded,
                        })
                    );
                }
            }
        }

        let customerId: number;

        const existingCustomer = await db
            .select({ id: customersTable.id })
            .from(customersTable)
            .where(eq(customersTable.email, result.data.email))
            .limit(1);

        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
        } else {
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

        if (result.data.delivery_method === "delivery") {
            verzendkosten = calculateShippingCost(
                products.map((item) => ({
                    categoryId: item.product.categoryId,
                    quantity: item.quantity,
                })),
                deliveryCountry
            );
        }

        const moneybirdCountry = toMoneybirdCountry(
            result.data["invoice.country"]
        );

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
        } catch {
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
                        country: moneybirdCountry,
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
                            description: tCheckout("shippingCosts"),
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
                    email_message: tEmail("invoiceMessage"),
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
    } catch (error: unknown) {
        console.error(error);
        throw new Error(
            error instanceof Error ? error.message : t("generalError")
        );
    }
}
