import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categoriesTable, productsTable } from "./schema";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// Random image generator
const getRandomImage = (width: number = 400, height: number = 400) => {
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(
        Math.random() * 10000
    )}`;
};

// Random price generator (in cents)
const getRandomPrice = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Product data generators
const storageProducts = [
    "SSD 1TB NVMe",
    "HDD 4TB Enterprise",
    "SSD 512GB SATA",
    "NVMe 2TB PCIe",
    "HDD 8TB WD Gold",
    "SSD 256GB M.2",
    "External SSD 1TB",
    "NAS Drive 6TB",
    "Enterprise SSD 4TB",
    "Gaming SSD 2TB",
    "Portable HDD 2TB",
    "Server SSD 8TB",
];

const memoryProducts = [
    "DDR4 32GB Kit",
    "DDR5 64GB Kit",
    "DDR4 16GB Single",
    "DDR5 128GB Kit",
    "ECC RAM 32GB",
    "Gaming RAM 16GB RGB",
    "Server RAM 64GB",
    "Laptop RAM 8GB",
    "DDR4 8GB Budget",
    "DDR5 32GB High Speed",
    "Workstation RAM 128GB",
    "Mini PC RAM 4GB",
];

const serverProducts = [
    "Dell PowerEdge R740",
    "HP ProLiant DL380",
    "Supermicro SuperServer",
    "IBM Power9",
    "Dell PowerEdge R640",
    "HPE Apollo 4200",
    "Lenovo ThinkSystem SR650",
    "Cisco UCS C220",
    "Fujitsu PRIMERGY RX2540",
    "ASUS RS520-E9",
    "Dell PowerEdge T640",
    "HP ProLiant ML350",
];

const cpuProducts = [
    "Intel Xeon Gold 6248R",
    "AMD EPYC 7742",
    "Intel Core i9-13900K",
    "AMD Ryzen 9 7950X",
    "Intel Xeon Platinum 8280",
    "AMD EPYC 7663",
    "Intel Core i7-13700K",
    "AMD Ryzen 7 7700X",
    "Intel Xeon Silver 4314",
    "AMD EPYC 7443P",
    "Intel Core i5-13600K",
    "AMD Ryzen 5 7600X",
];

const generateProducts = (
    categoryId: number,
    productNames: string[],
    priceRange: [number, number],
    count: number = 50
) => {
    const products = [];

    const configurations = [
        "16GB RAM, 512GB SSD",
        "32GB RAM, 1TB SSD",
        "8GB RAM, 256GB SSD",
        "64GB RAM, 2TB SSD",
        "Standard Configuration",
        "Enterprise Configuration",
    ];

    for (let i = 0; i < count; i++) {
        const baseName =
            productNames[Math.floor(Math.random() * productNames.length)];
        const variant = Math.floor(Math.random() * 1000);
        const randomConfig =
            configurations[Math.floor(Math.random() * configurations.length)];

        products.push({
            categoryId,
            name: `${baseName} ${variant}`,
            imageUrl: getRandomImage(),
            description: `High-quality ${baseName.toLowerCase()} with premium features and reliable performance`,
            configuration: randomConfig,
            price: getRandomPrice(priceRange[0], priceRange[1]),
        });
    }

    return products;
};

async function seed() {
    console.log("🌱 Starting database seeding...");

    try {
        // Clear existing data
        console.log("Clearing existing data...");
        await db.delete(productsTable);
        await db.delete(categoriesTable);

        // Seed categories
        console.log("Seeding categories...");
        const categories = await db
            .insert(categoriesTable)
            .values([
                {
                    name: "Storage",
                    imageUrl: getRandomImage(),
                },
                {
                    name: "Memory",
                    imageUrl: getRandomImage(),
                },
                {
                    name: "Servers",
                    imageUrl: getRandomImage(),
                },
                {
                    name: "CPU",
                    imageUrl: getRandomImage(),
                },
            ])
            .returning();

        console.log(`✅ Created ${categories.length} categories`);

        // Seed products
        console.log("Seeding products...");

        const allProducts = [
            ...generateProducts(
                categories[0].id,
                storageProducts,
                [5000, 50000],
                50
            ), // Storage: $50-500
            ...generateProducts(
                categories[1].id,
                memoryProducts,
                [10000, 100000],
                50
            ), // Memory: $100-1000
            ...generateProducts(
                categories[2].id,
                serverProducts,
                [200000, 1000000],
                50
            ), // Servers: $2000-10000
            ...generateProducts(
                categories[3].id,
                cpuProducts,
                [15000, 800000],
                50
            ), // CPU: $150-8000
        ];

        // Insert products in batches to avoid overwhelming the database
        const batchSize = 50;
        let totalInserted = 0;

        for (let i = 0; i < allProducts.length; i += batchSize) {
            const batch = allProducts.slice(i, i + batchSize);
            await db.insert(productsTable).values(batch);
            totalInserted += batch.length;
            console.log(
                `📦 Inserted ${totalInserted}/${allProducts.length} products`
            );
        }

        console.log(`✅ Created ${totalInserted} products total`);
        console.log("🎉 Database seeding completed successfully!");
    } catch (error) {
        console.error("❌ Error during seeding:", error);
        throw error;
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    seed().catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });
}

export default seed;
