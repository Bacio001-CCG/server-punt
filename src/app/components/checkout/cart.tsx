"use client";
import useCart from "@/hooks/useCart";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

export default function Cart() {
    const { products, removeProduct, getTotalPrice } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const groupedProducts = useMemo(() => {
        const grouped = products.reduce((acc, product) => {
            const existingProduct = acc.find((item) => item.id === product.id);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                acc.push({ ...product, quantity: 1 });
            }

            return acc;
        }, [] as Array<(typeof products)[0] & { quantity: number }>);

        return grouped;
    }, [products]);

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">Producten</h2>

            <ul className="space-y-4 bg-white p-5 rounded-lg border border-border">
                {groupedProducts.length === 0 && (
                    <p className="text-center text-gray-500">
                        Je winkelwagen is leeg.
                    </p>
                )}
                {groupedProducts.map((item, index) => (
                    <li
                        key={item.id || index}
                        className="flex items-center gap-4"
                    >
                        <Image
                            width={48}
                            height={48}
                            src={item.imageUrl || "/placeholder.png"}
                            alt={item.name}
                            className="size-16 rounded-sm object-cover"
                        />
                        <div className="flex justify-between w-full items-center">
                            <div>
                                <h3 className="text-sm text-gray-900">
                                    {item.name}
                                </h3>

                                <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                    <div>
                                        <dt className="inline mr-1">Aantal:</dt>
                                        <dd className="inline">
                                            {item.quantity}x
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline mr-1">Prijs:</dt>
                                        <dd className="inline">
                                            {mounted ? (
                                                <>
                                                    €
                                                    {String(
                                                        (
                                                            item.price *
                                                            item.quantity
                                                        ).toFixed(2)
                                                    ).replace(".", ",")}
                                                </>
                                            ) : (
                                                "€0,00"
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <Trash
                                onClick={() => {
                                    removeProduct(item.id);
                                }}
                                className="text-red-500 scale-75 cursor-pointer hover:scale-90 transition-transform"
                            />
                        </div>
                    </li>
                ))}
                <li className="w-full text-right">
                    {mounted ? (
                        <>
                            €{" "}
                            {String(getTotalPrice().toFixed(2)).replace(
                                ".",
                                ","
                            )}
                        </>
                    ) : (
                        "€ 0,00"
                    )}
                </li>
            </ul>
        </div>
    );
}
