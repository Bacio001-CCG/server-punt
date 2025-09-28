import { pgTable, integer, serial, text, timestamp } from "drizzle-orm/pg-core";

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
    description: text("description").notNull(),
    configuration: text("configuration").notNull(),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type SelectProduct = typeof productsTable.$inferSelect;

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;
