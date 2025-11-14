import {
    pgTable,
    integer,
    serial,
    text,
    timestamp,
    pgEnum,
    doublePrecision,
} from "drizzle-orm/pg-core";
import { email } from "zod";
import { id } from "zod/v4/locales";

export const categoriesTable = pgTable("categories", {
    id: serial("id").primaryKey(),
    imageUrl: text("image_url").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productsTable = pgTable("products", {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
        .notNull()
        .references(() => categoriesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    noneMainImagesUrl: text("none_main_images_url"),
    description: text("description").notNull(),
    configuration: text("configuration").notNull(),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderStatusEnum = pgEnum("status", [
    "pending",
    "paid",
    "processing",
    "shipped",
    "cancelled",
]);

export const deliveryMethodEnum = pgEnum("delivery_method", [
    "delivery",
    "pickup",
]);

export const customersTable = pgTable("customers", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    deliveryMethod: deliveryMethodEnum("delivery_method"),
    deliveryCountry: text("delivery_country"),
    deliveryFirstname: text("delivery_firstname"),
    deliveryLastname: text("delivery_lastname"),
    deliveryCompany: text("delivery_company"),
    deliveryAddress: text("delivery_address"),
    deliveryPostalcode: text("delivery_postalcode"),
    deliveryCity: text("delivery_city"),
    deliveryPhonenumber: text("delivery_phonenumber"),
    invoiceCountry: text("invoice_country"),
    invoiceFirstname: text("invoice_firstname"),
    invoiceLastname: text("invoice_lastname"),
    invoiceCompany: text("invoice_company"),
    invoiceCOCNumber: text("invoice_coc_number"),
    invoiceAddress: text("invoice_address"),
    invoicePostalcode: text("invoice_postalcode"),
    invoiceCity: text("invoice_city"),
    invoicePhonenumber: text("invoice_phonenumber"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
        .notNull()
        .references(() => customersTable.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id"),
    status: orderStatusEnum("status").notNull().default("pending"),
    deliveryMethod: deliveryMethodEnum("delivery_method"),
    deliveryCountry: text("delivery_country"),
    deliveryFirstname: text("delivery_firstname"),
    deliveryLastname: text("delivery_lastname"),
    deliveryCompany: text("delivery_company"),
    deliveryAddress: text("delivery_address"),
    deliveryPostalcode: text("delivery_postalcode"),
    deliveryCity: text("delivery_city"),
    deliveryPhonenumber: text("delivery_phonenumber"),
    invoiceCountry: text("invoice_country").notNull(),
    invoiceFirstname: text("invoice_firstname").notNull(),
    invoiceLastname: text("invoice_lastname").notNull(),
    invoiceCompany: text("invoice_company"),
    invoiceCOCNumber: text("invoice_coc_number"),
    invoiceAddress: text("invoice_address").notNull(),
    invoicePostalcode: text("invoice_postalcode").notNull(),
    invoiceCity: text("invoice_city").notNull(),
    invoicePhonenumber: text("invoice_phonenumber"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
        .notNull()
        .references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
        .notNull()
        .references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type SelectProduct = typeof productsTable.$inferSelect;

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;

export type InsertOrder = typeof ordersTable.$inferInsert;
export type SelectOrder = typeof ordersTable.$inferSelect;

export type InsertOrderItem = typeof orderItemsTable.$inferInsert;
export type SelectOrderItem = typeof orderItemsTable.$inferSelect;

export type InsertCustomer = typeof customersTable.$inferInsert;
export type SelectCustomer = typeof customersTable.$inferSelect;
