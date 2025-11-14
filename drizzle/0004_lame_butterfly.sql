ALTER TABLE "orders" ALTER COLUMN "delivery_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_firstname" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_lastname" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_postalcode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "delivery_city" DROP NOT NULL;