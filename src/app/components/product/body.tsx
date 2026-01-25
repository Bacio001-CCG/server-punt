"use client";
import { useState, useEffect } from "react";
import ProductImages from "../productImages";
import { SelectProduct, SelectCategory } from "@/database/schema";
import AddProduct from "../addProduct";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductWithLinkedItems } from "@/lib/products";
import {
    CheckCircle2Icon,
    ChevronDown,
    Info,
    InfoIcon,
    List,
    ListIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MdDangerous, MdOutlineDangerous, MdWarning } from "react-icons/md";
import Link from "next/link";

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
    const [isSpecsOpen, setIsSpecsOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleProductSelection = (productId: number, categoryId: number) => {
        setSelectedProducts((prev) => {
            // Find if there's already a selected product from the same category
            const selectedInCategory = prev.find((id) => {
                const linkedProduct = linkedProducts.find((lp) => lp.id === id);
                return linkedProduct?.product?.categoryId === categoryId;
            });

            if (selectedInCategory === productId) {
                // If clicking the same product, deselect it
                const newQuantities = { ...quantities };
                delete newQuantities[productId];
                setQuantities(newQuantities);
                return prev.filter((id) => id !== productId);
            } else if (selectedInCategory) {
                // If there's a different product selected in this category, replace it
                const newQuantities = { ...quantities };
                delete newQuantities[selectedInCategory];
                newQuantities[productId] = 1;
                setQuantities(newQuantities);
                return [
                    ...prev.filter((id) => id !== selectedInCategory),
                    productId,
                ];
            } else {
                // No product selected in this category, add it
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

    const calculateTotalWithVAT = (subtotal: number) => {
        return subtotal * 1.21; // 21% VAT
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
                    <div className="flex gap-10">
                        <div className="flex flex-col w-2/3">
                            <ProductImages
                                imageUrl={
                                    product.imageUrl || "/placeholder.png"
                                }
                                noneMainImagesUrl={
                                    product.noneMainImagesUrl || ""
                                }
                            />

                            <div className="px-4">
                                <h2 className="text-3xl font-bold mb-4">
                                    {product.name}
                                </h2>
                                <p className="text-gray-700 mb-6 whitespace-pre-wrap">
                                    {product.description}
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div
                                        className="border-b-2 w-full border-border pb-2 flex justify-between cursor-pointer"
                                        onClick={() =>
                                            setIsSpecsOpen(!isSpecsOpen)
                                        }
                                    >
                                        <h2 className="font-display flex gap-2 text-xl leading-tight font-bold tracking-tight">
                                            <ListIcon
                                                size={20}
                                                className="my-auto"
                                            />
                                            Product Specificaties
                                        </h2>
                                        <motion.div
                                            animate={{
                                                rotate: isSpecsOpen ? 180 : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown size={24} />
                                        </motion.div>
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {isSpecsOpen && (
                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <p className="text-gray-700 whitespace-pre-wrap">
                                                    {product.configuration}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 w-1/3">
                            <h2 className="text-3xl font-bold mb-4">
                                {product.name}
                            </h2>
                            {linkedProducts.length != 0 && (
                                <div className="flex flex-col gap-5 mb-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="font-display flex gap-2 text-2xl leading-tight font-bold tracking-tight">
                                            Product Configureren
                                        </h2>
                                        <p>
                                            Kies hieronder de extra onderdellen
                                            die u aan het basisproduct wilt
                                            toevoegen.
                                        </p>
                                    </div>
                                    {categories.map((c) => {
                                        if (
                                            linkedProducts.filter(
                                                (lp) =>
                                                    lp.product?.categoryId ===
                                                    c.id
                                            ).length !== 0
                                        ) {
                                            return (
                                                <div
                                                    className="flex  flex-col gap-2"
                                                    key={c.id}
                                                >
                                                    <p className="text-accent-foreground  font-semibold">
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
                                                                                l.id,
                                                                                c.id
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
                                                                            className={`text-sm text-left ${
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
                                                                            - €
                                                                            {parseFloat(
                                                                                String(
                                                                                    l
                                                                                        .product
                                                                                        ?.price
                                                                                ) ??
                                                                                    "0"
                                                                            )
                                                                                .toFixed(
                                                                                    2
                                                                                )
                                                                                .replace(
                                                                                    ".",
                                                                                    ","
                                                                                )}{" "}
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
                            )}

                            <div className="mb-6">
                                <ul className="space-y-2 mb-4">
                                    <li className="flex justify-between text-sm">
                                        <span>{product.name}</span>
                                        <div className="text-right">
                                            <div className="font-semibold">
                                                €
                                                {product.price
                                                    .toFixed(2)
                                                    .replace(".", ",")}{" "}
                                                Excl. BTW
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                €
                                                {calculateTotalWithVAT(
                                                    product.price
                                                )
                                                    .toFixed(2)
                                                    .replace(".", ",")}{" "}
                                                Incl. BTW
                                            </div>
                                        </div>
                                    </li>
                                    {getSelectedProductsDetails().map(
                                        (item) => {
                                            const subtotal =
                                                item.price * item.quantity;
                                            return (
                                                <li
                                                    key={item.id}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span>
                                                        {item.name} x{" "}
                                                        {item.quantity}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className="font-semibold">
                                                            €
                                                            {subtotal
                                                                .toFixed(2)
                                                                .replace(
                                                                    ".",
                                                                    ","
                                                                )}{" "}
                                                            Excl. BTW
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            €
                                                            {calculateTotalWithVAT(
                                                                subtotal
                                                            )
                                                                .toFixed(2)
                                                                .replace(
                                                                    ".",
                                                                    ","
                                                                )}{" "}
                                                            Incl. BTW
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        }
                                    )}
                                </ul>
                                <div className="pt-4 border-t border-gray-300 flex justify-between">
                                    <span className="text-lg font-bold">
                                        Total:
                                    </span>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary">
                                            €
                                            {calculateTotal()
                                                .toFixed(2)
                                                .replace(".", ",")}{" "}
                                            Excl. BTW
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            €
                                            {calculateTotalWithVAT(
                                                calculateTotal()
                                            )
                                                .toFixed(2)
                                                .replace(".", ",")}{" "}
                                            Incl. BTW
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <AddProduct
                                product={product}
                                configuredProducts={getConfiguredProducts()}
                            />

                            <Link href="/tos" className="w-full">
                                <Alert className="">
                                    <Info className="h-5 w-5 " />
                                    <AlertTitle className="font-semibold">
                                        Voorwaarden van toepassing
                                    </AlertTitle>
                                    <AlertDescription className="">
                                        Let op: Zodra u iets vanaf onze website
                                        bestelt, zijn onze Algemene Voorwaarden
                                        van toepassing.
                                    </AlertDescription>
                                </Alert>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
