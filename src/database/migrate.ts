// src/migrate.ts

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env" });

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

const main = async () => {
    try {
        await migrate(db, { migrationsFolder: "drizzle" });
        await client.end();
    } catch (error) {
        console.error("Error during migration:", error);
        await client.end();
        process.exit(1);
    }
};

main();
