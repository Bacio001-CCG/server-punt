import {
    pgTable,
    integer,
    serial,
    text,
    timestamp,
    pgEnum,
    doublePrecision,
    boolean,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
    OrderStatus,
    NotificationProvider,
    NotificationAction,
    UserPermission,
} from "@/enums";

export const orderStatusEnum = pgEnum("status", OrderStatus);

export const notificationEnum = pgEnum(
    "notification_provider",
    NotificationProvider
);

export const notificationActionEnum = pgEnum(
    "notification_action",
    NotificationAction
);

export const userPermissionEnum = pgEnum("user_permission", UserPermission);

export const deliveryMethodEnum = pgEnum("delivery_method", [
    "delivery",
    "pickup",
]);

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
        .references(() => categoriesTable.id),
    brandId: integer("brand_id").references(() => brandsTable.id, {
        onDelete: "cascade",
    }),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    noneMainImagesUrl: text("none_main_images_url"),
    description: text("description").notNull(),
    configuration: text("configuration").notNull(),
    price: integer("price").notNull(),
    quantityInStock: integer("quantity_in_stock").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const linkedProductsTable = pgTable("linked_products", {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
        .notNull()
        .references(() => productsTable.id),
    linkedProductId: integer("linked_product_id")
        .notNull()
        .references(() => productsTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
    id: serial("id").primaryKey(),
    provider: notificationEnum("provider").notNull(),
    action: notificationActionEnum("action").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const brandsTable = pgTable("brands", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
        .references(() => customersTable.id),
    invoiceId: text("invoice_id"),
    status: orderStatusEnum("status").notNull().default(OrderStatus.Pending),
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

export const auditLogsTable = pgTable("audit_logs", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
        .notNull()
        .references(() => ordersTable.id),
    productId: integer("product_id")
        .notNull()
        .references(() => productsTable.id),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersTable = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    permissions: userPermissionEnum("permissions")
        .array()
        .notNull()
        .default([]),
    access: boolean("access").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const user = usersTable;

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
    },
    (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const userRelations = relations(usersTable, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(usersTable, {
        fields: [session.userId],
        references: [usersTable.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(usersTable, {
        fields: [account.userId],
        references: [usersTable.id],
    }),
}));

export const categoryRelations = relations(categoriesTable, ({ many }) => ({
    products: many(productsTable),
}));

export const productRelations = relations(productsTable, ({ one }) => ({
    category: one(categoriesTable, {
        fields: [productsTable.categoryId],
        references: [categoriesTable.id],
    }),
    brand: one(brandsTable, {
        fields: [productsTable.brandId],
        references: [brandsTable.id],
    }),
}));

export const brandRelations = relations(brandsTable, ({ many }) => ({
    products: many(productsTable),
}));

export const customerRelations = relations(customersTable, ({ many }) => ({
    orders: many(ordersTable),
}));

export const orderRelations = relations(ordersTable, ({ one, many }) => ({
    customer: one(customersTable, {
        fields: [ordersTable.customerId],
        references: [customersTable.id],
    }),
    items: many(orderItemsTable),
}));

export const orderItemRelations = relations(orderItemsTable, ({ one }) => ({
    order: one(ordersTable, {
        fields: [orderItemsTable.orderId],
        references: [ordersTable.id],
    }),
    product: one(productsTable, {
        fields: [orderItemsTable.productId],
        references: [productsTable.id],
    }),
}));

export type InsertLinkedProduct = typeof linkedProductsTable.$inferInsert;
export type SelectLinkedProduct = typeof linkedProductsTable.$inferSelect;

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

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertSession = typeof session.$inferInsert;
export type SelectSession = typeof session.$inferSelect;

export type InsertAccount = typeof account.$inferInsert;
export type SelectAccount = typeof account.$inferSelect;

export type InsertVerification = typeof verification.$inferInsert;
export type SelectVerification = typeof verification.$inferSelect;

export type InsertNotification = typeof notificationsTable.$inferInsert;
export type SelectNotification = typeof notificationsTable.$inferSelect;

export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
export type SelectAuditLog = typeof auditLogsTable.$inferSelect;

export type InsertBrand = typeof brandsTable.$inferInsert;
export type SelectBrand = typeof brandsTable.$inferSelect;
