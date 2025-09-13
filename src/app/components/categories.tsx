import { getCategories } from "@/lib/categories";
import Card from "./card";

const categories = (await getCategories()) || [];

export default function Categories() {
    return (
        <section
            id="categories"
            className="
            py-12
            md:py-16
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
                        Categorieën
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        Bekijk de product categorieën die wij aanbieden.
                    </p>
                </div>
                <div
                    className="
                grid grid-cols-2 gap-4
                md:grid-cols-4 md:gap-6
              "
                >
                    {categories.map((category) => (
                        <Card
                            key={category.name}
                            name={category.name}
                            image={category.imageUrl}
                            href={`/products?category=${category.id}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
