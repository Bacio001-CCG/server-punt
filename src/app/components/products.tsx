import { ArrowRight } from "lucide-react";
import Card from "./card";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export default async function Featured() {
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
                        Producten
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        Bekijk onze populairste producten, zorgvuldig
                        geselecteerd voor jou.
                    </p>
                </div>
                <div
                    className="
                grid grid-cols-2 gap-4
                md:grid-cols-6 md:gap-6
              "
                >
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
                                />
                            ))}
                </div>
            </div>
            <Link
                href={"/products"}
                className="mx-auto mt-10 cursor-pointer hover:bg-gray-100 transition-colors duration-300 bg-white border p-2 group rounded-lg px-3 text-sm flex items-center justify-center"
            >
                Bekijk alle producten{" "}
                <ArrowRight
                    className="inline scale-80 ml-2 h-4 w-4 transition-transform duration-300
                        group-hover:translate-x-1"
                />
            </Link>
        </section>
    );
}
