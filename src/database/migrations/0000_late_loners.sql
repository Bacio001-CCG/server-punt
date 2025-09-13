CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_categories_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;