"use client";
import { useState } from "react";
import ProductImages from "../productImages";
import {
    SelectLinkedProduct,
    SelectProduct,
    SelectCategory,
} from "@/database/schema";
import AddProduct from "../addProduct";
import { Checkbox } from "@/components/ui/checkbox";
import { ca } from "zod/v4/locales";
import { ProductWithLinkedItems } from "@/lib/products";

export default function Body({
    product,
    linkedProducts,
    categories,
}: {
    product: SelectProduct;
    linkedProducts: ProductWithLinkedItems[];
    categories: SelectCategory[];
}) {
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    const toggleProductSelection = (productId: number) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

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
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-wrap -mx-4">
                        <ProductImages
                            imageUrl={product.imageUrl || "/placeholder.png"}
                            noneMainImagesUrl={product.noneMainImagesUrl || ""}
                        />

                        <div className="w-full md:w-1/2 px-4">
                            <h2 className="text-3xl font-bold mb-2">
                                {product.name}
                            </h2>
                            <p className="text-gray-700 mb-6">
                                {product.description}
                            </p>
                            <p className="text-gray-700 mb-6">
                                {product.configuration}
                            </p>

                            {categories.map((c) => {
                                if (
                                    linkedProducts.filter(
                                        (lp) => lp.product?.categoryId === c.id
                                    ).length !== 0
                                ) {
                                    return (
                                        <div className="flex  flex-col gap-2">
                                            <p
                                                key={c.id}
                                                className="text-gray-700 mb-6"
                                            >
                                                {c.name}
                                            </p>
                                            <ul className="space-y-2">
                                                {linkedProducts
                                                    .filter(
                                                        (l) =>
                                                            l.product
                                                                ?.categoryId ===
                                                            c.id
                                                    )
                                                    .map((l) => (
                                                        <li
                                                            key={l.id}
                                                            className="flex gap-3 cursor-pointer"
                                                            onClick={() =>
                                                                toggleProductSelection(
                                                                    l.id
                                                                )
                                                            }
                                                        >
                                                            <Checkbox
                                                                checked={selectedProducts.includes(
                                                                    l.id
                                                                )}
                                                                onChange={() => {}}
                                                            />
                                                            <button
                                                                className={`text-sm ${
                                                                    selectedProducts.includes(
                                                                        l.id
                                                                    )
                                                                        ? "text-primary font-bold"
                                                                        : "text-muted-foreground"
                                                                }`}
                                                            >
                                                                {
                                                                    l.product
                                                                        ?.name
                                                                }
                                                            </button>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    );
                                }
                            })}

                            <AddProduct product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
