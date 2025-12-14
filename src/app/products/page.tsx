import { getProducts } from "@/lib/products";
import Card from "../components/card";
import { getCategories } from "@/lib/categories";
import { getBrands } from "@/lib/brands";

export default async function Products({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const categories = params.categories
        ? String(params.categories).split(",")
        : [];
    const brands = params.brands ? String(params.brands).split(",") : [];

    const { products = [] } = (await getProducts()) || { products: [] };
    const catResult = (await getCategories()) || { categories: [] };
    const brandResult = (await getBrands()) || { brands: [] };

    // Map category names to their corresponding IDs
    const categoryIds = catResult
        .filter((category) => categories.includes(category.name))
        .map((category) => category.id);

    // Map brand names to their corresponding IDs
    const brandIds = brandResult
        .filter((brand) => brands.includes(brand.name))
        .map((brand) => brand.id);

    // Filter products based on category IDs and brand IDs
    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            categoryIds.length === 0 ||
            categoryIds.includes(product.categoryId);
        const matchesBrand =
            brandIds.length === 0 || brandIds.includes(product.brandId || -1);
        return matchesCategory && matchesBrand;
    });

    return (
        <section
            className="
    py-12
    md:py-16
    flex flex-col items-center
  "
        >
            <div
                className="
      container mx-auto max-w-7xl px-4
      sm:px-6
      lg:px-8
    "
            >
                <div className="mb-8 flex flex-col items-center text-center">
                    <h2
                        className="
          font-display text-3xl leading-tight font-bold tracking-tight
          md:text-4xl
        "
                    >
                        Onze Producten
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        Vind het perfecte apparaat voor uw behoeften uit onze
                        zorgvuldig samengestelde collecties
                    </p>
                </div>
                <div
                    className="
        grid grid-cols-2 gap-4
        md:grid-cols-4 md:gap-6
      "
                >
                    {filteredProducts.map((product) => (
                        <Card
                            key={product.name}
                            name={product.name}
                            image={product.imageUrl || "/placeholder.png"}
                            href={`/product/${product.id}`}
                            price={(product.price / 100).toFixed(2)}
                            stock={product.quantityInStock}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
