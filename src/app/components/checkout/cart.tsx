"use client";
import useCart from "@/hooks/useCart";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

export default function Cart() {
    const { products, removeProduct, getTotalPrice, getGroupedProducts, getVatPrice, getShippingCost } =
        useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const groupedProducts = useMemo(
        () => getGroupedProducts(),
        [products, getGroupedProducts]
    );

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold mb-2">Producten</h2>

            <ul className="space-y-4 bg-white p-5 rounded-lg border border-border">
                {groupedProducts.length === 0 && (
                    <p className="text-center text-gray-500">
                        Je winkelwagen is leeg.
                    </p>
                )}
                {groupedProducts.map((item) => {
                    const configuredTotal = (item.product.configuredItems || []).reduce(
                        (sub, ci) => sub + ci.product.price * ci.quantity,
                        0
                    );
                    const unitTotal = item.product.price + configuredTotal;

                    return (
                        <li
                            key={`${item.product.id}-${item.product.configSignature ?? "base"}`}
                            className="flex items-start gap-4"
                        >
                            <Image
                                width={48}
                                height={48}
                                src={item.product.imageUrl || "/placeholder.png"}
                                alt={item.product.name}
                                className="size-16 rounded-sm object-cover"
                            />
                            <div className="flex justify-between w-full items-start">
                                <div className="space-y-1">
                                    <h3 className="text-sm text-gray-900">
                                        {item.product.name}
                                    </h3>
                                    {item.product.configuredItems &&
                                        item.product.configuredItems.length > 0 && (
                                            <ul className="ml-4 list-disc text-xs text-gray-600 space-y-0.5">
                                                {item.product.configuredItems.map((sub) => (
                                                    <li
                                                        key={`${sub.product.id}-${sub.quantity}`}
                                                    >
                                                        {sub.product.name} x {sub.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                    <dl className="mt-1 space-y-px text-[10px] text-gray-600">
                                        <div>
                                            <dt className="inline mr-1">Aantal:</dt>
                                            <dd className="inline">{item.quantity}x</dd>
                                        </div>
                                        <div>
                                            <dt className="inline mr-1">Prijs:</dt>
                                            <dd className="inline">
                                                {mounted ? (
                                                    <>
                                                        €
                                                        {String(
                                                            (unitTotal * item.quantity).toFixed(2)
                                                        ).replace(".", ",")}
                                                    </>
                                                ) : (
                                                    "€0,00"
                                                )} Excl. BTW
                                            </dd>

                                        </div>
                                    </dl>
                                </div>
                                <Trash
                                    onClick={() => {
                                        removeProduct(
                                            item.product.id,
                                            item.product.configSignature
                                        );
                                    }}
                                    className="text-red-500 scale-75 cursor-pointer hover:scale-90 transition-transform"
                                />
                            </div>
                        </li>
                    );
                })}
                <li className=" text-right w-fit float-end">
                    <span className="text-muted-foreground text-sm">
                        Prijs Excl. BTW: {mounted ? (
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
                    </span>
                    <br />
                    <span className="text-muted-foreground text-sm">
                        {mounted ? (
                            <>
                                BTW: €{" "}
                                {String(getVatPrice().toFixed(2)).replace(
                                    ".",
                                    ","
                                )}
                            </>
                        ) : (
                            "€ 0,00"
                        )}
                    </span>
                    <br />
                    <span className="text-muted-foreground text-sm">
                        {mounted ? (
                            <>
                                Shipping: €{" "}
                                {String(getShippingCost().toFixed(2)).replace(
                                    ".",
                                    ","
                                )}
                            </>
                        ) : (
                            "€ 0,00"
                        )}
                    </span>
                    <hr className="border border-border my-1" />

                    <span className="font-bold text-sm">
                        {mounted ? (
                            <>
                                Totaal: €{" "}
                                {String(
                                    (getTotalPrice() + getVatPrice() + getShippingCost()).toFixed(2)
                                ).replace(".", ",")}
                            </>
                        ) : (
                            "€ 0,00"
                        )}
                    </span>
                </li>

            </ul>
        </div>
    );
}
