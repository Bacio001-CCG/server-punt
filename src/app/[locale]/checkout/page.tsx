"use client";
import Cart from "../../components/checkout/cart";
import Account from "../../components/checkout/account";
import Delivery from "../../components/checkout/delivery";
import InvoiceAddress from "../../components/checkout/invoice";
import { FormEvent, useState } from "react";
import { processCheckout } from "@/lib/checkout";
import useCart from "@/hooks/useCart";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createCheckoutSchema } from "@/lib/checkout-schema";
import { getCompanyFieldConfig } from "@/lib/company-fields";

export default function Checkout() {
    const t = useTranslations("validation");
    const tFields = useTranslations("companyFields");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { getGroupedProducts } = useCart();
    const router = useRouter();
    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
        "delivery"
    );
    const [countryCode, setCountryCode] = useState("nl");
    const [companyName, setCompanyName] = useState("");
    const [vatNumber, setVatNumber] = useState("");

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

        const fieldConfig = getCompanyFieldConfig(countryCode);
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
                country: fieldConfig?.viesCountryCode ?? countryCode.toUpperCase(),
            }),
        });

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
        } catch (error: unknown) {
            console.error(error);
            setErrors({
                general:
                    error instanceof Error
                        ? error.message
                        : t("generalError"),
            });
        }
    }

    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <form
                onSubmit={onSubmit}
                className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-10 flex-col"
            >
                <Cart
                    deliveryMethod={deliveryMethod}
                    countryCode={countryCode}
                    companyName={companyName}
                    vatNumber={vatNumber}
                />
                <Account />
                <Delivery
                    sendingMethod={deliveryMethod}
                    setSendingMethod={setDeliveryMethod}
                    countryCode={countryCode}
                    onCountryChange={setCountryCode}
                />
                <InvoiceAddress
                    deliveryMethod={deliveryMethod}
                    countryCode={countryCode}
                    companyName={companyName}
                    vatNumber={vatNumber}
                    onCountryChange={setCountryCode}
                    onCompanyChange={setCompanyName}
                    onVatChange={setVatNumber}
                />

                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-200 text-red-700 p-3 rounded-lg border border-red-400">
                        <ul className="list-disc list-inside">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field}>{message}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </form>
        </section>
    );
}
