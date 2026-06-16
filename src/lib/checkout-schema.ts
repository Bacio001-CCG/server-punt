import z from "zod";
import { EU_COUNTRY_CODES, normalizeCountryCode } from "./regions";
import {
    getCompanyFieldConfig,
    validateRegistrationNumber,
    validateVatNumberFormat,
} from "./company-fields";

const euCountrySchema = z
    .string()
    .transform((val) => normalizeCountryCode(val))
    .pipe(
        z.enum(EU_COUNTRY_CODES, {
            message: "invalidCountry",
        })
    );

const optionalEuCountrySchema = z.preprocess(
    (val) => {
        if (!val || val === "") return undefined;
        return normalizeCountryCode(String(val));
    },
    z.enum(EU_COUNTRY_CODES, { message: "invalidCountry" }).optional()
);

export type CheckoutSchemaMessages = {
    invalidCountry: string;
    invalidFirstname: string;
    invalidLastname: string;
    invalidCompany: string;
    invalidAddress: string;
    invalidPostalcode: string;
    invalidCity: string;
    invalidPhone: string;
    invalidSave: string;
    deliveryInvalid: string;
    companyFieldsRequired: string;
    invalidRegistration: string;
    invalidVat: string;
    vatCountryMismatch: string;
};

export function createCheckoutSchema(messages: CheckoutSchemaMessages) {
    return z
        .object({
            email: z.email(),
            delivery_method: z.enum(["delivery", "pickup"]),
            "delivery.country": optionalEuCountrySchema,
            "delivery.firstname": z
                .string({ message: messages.invalidFirstname })
                .optional(),
            "delivery.lastname": z
                .string({ message: messages.invalidLastname })
                .optional(),
            "delivery.company": z
                .string({ message: messages.invalidCompany })
                .optional(),
            "delivery.address": z
                .string({ message: messages.invalidAddress })
                .optional(),
            "delivery.postalcode": z
                .string({ message: messages.invalidPostalcode })
                .optional(),
            "delivery.city": z
                .string({ message: messages.invalidCity })
                .optional(),
            "delivery.phonenumber": z
                .string({ message: messages.invalidPhone })
                .optional(),
            "delivery.save": z
                .boolean({ message: messages.invalidSave })
                .optional(),
            "invoice.country": euCountrySchema,
            "invoice.firstname": z.string({
                message: messages.invalidFirstname,
            }),
            "invoice.lastname": z.string({
                message: messages.invalidLastname,
            }),
            "invoice.company": z
                .string({ message: messages.invalidCompany })
                .optional(),
            "invoice.address": z.string({
                message: messages.invalidAddress,
            }),
            "invoice.postalcode": z.string({
                message: messages.invalidPostalcode,
            }),
            "invoice.city": z.string({
                message: messages.invalidCity,
            }),
            "invoice.cocNumber": z.string().optional(),
            "invoice.vatNumber": z.string().optional(),
            "invoice.phonenumber": z
                .string({ message: messages.invalidPhone })
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
                message: messages.deliveryInvalid,
                path: ["delivery"],
            }
        )
        .superRefine((data, ctx) => {
            const company = data["invoice.company"]?.trim();
            if (!company) return;

            const countryCode = data["invoice.country"];
            const config = getCompanyFieldConfig(countryCode);
            if (!config) return;

            const registration = data["invoice.cocNumber"]?.trim() ?? "";
            const vatNumber = data["invoice.vatNumber"]?.trim() ?? "";

            if (config.registrationRequired && !registration) {
                ctx.addIssue({
                    code: "custom",
                    message: messages.companyFieldsRequired,
                    path: ["invoice.cocNumber"],
                });
            }

            if (config.vatRequired && !vatNumber) {
                ctx.addIssue({
                    code: "custom",
                    message: messages.companyFieldsRequired,
                    path: ["invoice.vatNumber"],
                });
            }

            if (registration) {
                const regResult = validateRegistrationNumber(
                    registration,
                    countryCode
                );
                if (!regResult.valid) {
                    ctx.addIssue({
                        code: "custom",
                        message: messages.invalidRegistration,
                        path: ["invoice.cocNumber"],
                    });
                }
            }

            if (vatNumber) {
                const vatResult = validateVatNumberFormat(
                    vatNumber,
                    countryCode
                );
                if (vatResult.error === "countryMismatch") {
                    ctx.addIssue({
                        code: "custom",
                        message: messages.vatCountryMismatch,
                        path: ["invoice.vatNumber"],
                    });
                } else if (!vatResult.valid) {
                    ctx.addIssue({
                        code: "custom",
                        message: messages.invalidVat,
                        path: ["invoice.vatNumber"],
                    });
                }
            }
        });
}
