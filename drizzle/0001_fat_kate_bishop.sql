CREATE TYPE "public"."delivery_method" AS ENUM('delivery', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'paid', 'processing', 'shipped', 'cancelled');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"delivery_method" "delivery_method",
	"delivery_country" text,
	"delivery_firstname" text,
	"delivery_lastname" text,
	"delivery_company" text,
	"delivery_address" text,
	"delivery_postalcode" text,
	"delivery_city" text,
	"delivery_phonenumber" text,
	"invoice_country" text,
	"invoice_firstname" text,
	"invoice_lastname" text,
	"invoice_company" text,
	"invoice_coc_number" text,
	"invoice_address" text,
	"invoice_postalcode" text,
	"invoice_city" text,
	"invoice_phonenumber" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"invoice_id" integer,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"delivery_method" "delivery_method" NOT NULL,
	"delivery_country" text NOT NULL,
	"delivery_firstname" text NOT NULL,
	"delivery_lastname" text NOT NULL,
	"delivery_company" text,
	"delivery_address" text NOT NULL,
	"delivery_postalcode" text NOT NULL,
	"delivery_city" text NOT NULL,
	"delivery_phonenumber" text,
	"invoice_country" text NOT NULL,
	"invoice_firstname" text NOT NULL,
	"invoice_lastname" text NOT NULL,
	"invoice_company" text,
	"invoice_coc_number" text,
	"invoice_address" text NOT NULL,
	"invoice_postalcode" text NOT NULL,
	"invoice_city" text NOT NULL,
	"invoice_phonenumber" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "none_main_images_url" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;