"use client";
import { useState } from "react";
import ProductImages from "../productImages";
import { SelectProduct, SelectCategory } from "@/database/schema";
import AddProduct from "../addProduct";
import { Checkbox } from "@/components/ui/checkbox";
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
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

    const toggleProductSelection = (productId: number) => {
        setSelectedProducts((prev) => {
            if (prev.includes(productId)) {
                const newQuantities = { ...quantities };
                delete newQuantities[productId];
                setQuantities(newQuantities);
                return prev.filter((id) => id !== productId);
            } else {
                setQuantities({ ...quantities, [productId]: 1 });
                return [...prev, productId];
            }
        });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity > 0) {
            setQuantities({ ...quantities, [productId]: quantity });
        }
    };

    const getSelectedProductsDetails = () => {
        return selectedProducts.map((id) => {
            const linkedProduct = linkedProducts.find((lp) => lp.id === id);
            return {
                id,
                name: linkedProduct?.product?.name || "",
                price: parseFloat(String(linkedProduct?.product?.price) ?? "0"),
                quantity: quantities[id] || 1,
            };
        });
    };

    const calculateTotal = () => {
        return (
            getSelectedProductsDetails().reduce(
                (total, item) => total + item.price * item.quantity,
                0
            ) + product.price
        );
    };

    const getConfiguredProducts = () => {
        return getSelectedProductsDetails()
            .map((item) => {
                const linkedProduct = linkedProducts.find(
                    (lp) => lp.id === item.id
                )?.product;
                if (!linkedProduct) return null;
                return { product: linkedProduct, quantity: item.quantity };
            })
            .filter(
                (item): item is { product: SelectProduct; quantity: number } =>
                    !!item
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
                            <div className="flex flex-col gap-5 mb-5">
                                {categories.map((c) => {
                                    if (
                                        linkedProducts.filter(
                                            (lp) =>
                                                lp.product?.categoryId === c.id
                                        ).length !== 0
                                    ) {
                                        return (
                                            <div
                                                className="flex  flex-col gap-2"
                                                key={c.id}
                                            >
                                                <p className="text-accent-foreground">
                                                    {c.name}
                                                </p>
                                                <ul className="space-y-2">
                                                    {linkedProducts
                                                        .filter(
                                                            (l) =>
                                                                l.product
                                                                    ?.categoryId ===
                                                                    c.id &&
                                                                l.product
                                                                    .quantityInStock >
                                                                    0
                                                        )
                                                        .map((l) => (
                                                            <li
                                                                key={l.id}
                                                                className="flex flex-col gap-3"
                                                            >
                                                                <div
                                                                    className="flex gap-3 cursor-pointer items-center flex-1"
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
                                                                            l
                                                                                .product
                                                                                ?.name
                                                                        }{" "}
                                                                        - $
                                                                        {parseFloat(
                                                                            String(
                                                                                l
                                                                                    .product
                                                                                    ?.price
                                                                            ) ??
                                                                                "0"
                                                                        ).toFixed(
                                                                            2
                                                                        )}{" "}
                                                                        e.a.
                                                                    </button>
                                                                </div>
                                                                {selectedProducts.includes(
                                                                    l.id
                                                                ) && (
                                                                    <div className="flex gap-2 items-center">
                                                                        <button
                                                                            onClick={() =>
                                                                                updateQuantity(
                                                                                    l.id,
                                                                                    (quantities[
                                                                                        l
                                                                                            .id
                                                                                    ] ||
                                                                                        1) -
                                                                                        1
                                                                                )
                                                                            }
                                                                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={
                                                                                l
                                                                                    .product
                                                                                    ?.quantityInStock ||
                                                                                1
                                                                            }
                                                                            value={
                                                                                quantities[
                                                                                    l
                                                                                        .id
                                                                                ] ||
                                                                                1
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateQuantity(
                                                                                    l.id,
                                                                                    parseInt(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    ) ||
                                                                                        1
                                                                                )
                                                                            }
                                                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        />
                                                                        <button
                                                                            disabled={
                                                                                quantities[
                                                                                    l
                                                                                        .id
                                                                                ] ===
                                                                                parseInt(
                                                                                    String(
                                                                                        l
                                                                                            .product
                                                                                            ?.quantityInStock
                                                                                    ) ||
                                                                                        "1"
                                                                                )
                                                                            }
                                                                            onClick={() =>
                                                                                updateQuantity(
                                                                                    l.id,
                                                                                    (quantities[
                                                                                        l
                                                                                            .id
                                                                                    ] ||
                                                                                        1) +
                                                                                        1
                                                                                )
                                                                            }
                                                                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                })}
                            </div>

                            <div className="mt-20 mb-6">
                                <ul className="space-y-2 mb-4">
                                    <li className="flex justify-between text-sm">
                                        <span>{product.name}</span>
                                        <span className="font-semibold">
                                            $
                                            {product.price
                                                .toFixed(2)
                                                .replace(".", ",")}{" "}
                                            Excl. BTW
                                        </span>
                                    </li>{" "}
                                    {getSelectedProductsDetails().map(
                                        (item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between text-sm"
                                            >
                                                <span>
                                                    {item.name} x{" "}
                                                    {item.quantity}
                                                </span>
                                                <span className="font-semibold">
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    )
                                                        .toFixed(2)
                                                        .replace(".", ",")}{" "}
                                                    Excl. BTW
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ul>
                                <div className="pt-4 border-t border-gray-300 flex justify-between">
                                    <span className="text-lg font-bold">
                                        Total:
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        $
                                        {calculateTotal()
                                            .toFixed(2)
                                            .replace(".", ",")}{" "}
                                        Excl. BTW
                                    </span>
                                </div>
                            </div>

                            <AddProduct
                                product={product}
                                configuredProducts={getConfiguredProducts()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
