import { getProducts } from "@/lib/products";
import Card from "../components/card";

const { products = [] } = (await getProducts()) || { products: [] };
export default async function Products({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const category = (await searchParams).category;

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
                    {products
                        .filter((p) =>
                            category
                                ? p.categoryId == parseInt(String(category))
                                : true
                        )
                        .map((product) => (
                            <Card
                                key={product.name}
                                name={product.name}
                                image={product.imageUrl}
                                href={`/product/${product.id}`}
                                price={(product.price / 100).toFixed(2)}
                            />
                        ))}
                </div>
            </div>
        </section>
    );
}
