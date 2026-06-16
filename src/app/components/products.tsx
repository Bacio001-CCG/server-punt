import { ArrowRight } from "lucide-react";
import Card from "./card";
import { Link } from "@/i18n/navigation";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getTranslations } from "next-intl/server";

export default async function HomeProducts() {
    const t = await getTranslations("homeProducts");
    const { products = [] } = (await getProducts()) || {};
    const categories = await getCategories();

    const filteredProducts = products.filter((product) => {
        return categories.some(
            (cat) => cat.id === product.categoryId && !cat.hidden
        );
    });

    return (
        <section
            id="products"
            className="flex flex-col items-center py-12 md:py-16"
        >
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col items-center text-center">
                    <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                        {t("title")}
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
                    {Array.isArray(filteredProducts) &&
                        filteredProducts
                            .slice(0, 18)
                            .map((product) => (
                                <Card
                                    key={product.name + product.id}
                                    name={product.name}
                                    image={
                                        product.imageUrl || "/placeholder.png"
                                    }
                                    href={`/product/${product.id}`}
                                    price={product.price.toFixed(2)}
                                    stock={product.quantityInStock}
                                    createdAt={product.createdAt}
                                    refurbished={product.refurbished}
                                />
                            ))}
                </div>
            </div>
            <Link
                href="/products"
                className="mx-auto mt-10 flex cursor-pointer items-center justify-center rounded-lg border bg-white p-2 px-3 text-sm transition-colors duration-300 hover:bg-gray-100 group"
            >
                {t("viewAll")}
                <ArrowRight className="ml-2 inline h-4 w-4 scale-80 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </section>
    );
}
