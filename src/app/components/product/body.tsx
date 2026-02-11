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
import { productAnalyticsRegistration } from "@/lib/analytics";

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
    const [mainProductQuantity, setMainProductQuantity] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0);

        const sessionKey = `product-view-${product.id}`;
        const hasViewed = sessionStorage.getItem(sessionKey);

        if (!hasViewed) {
            trackProductView(product.id);
            sessionStorage.setItem(sessionKey, "true");
        }
    }, [product.id]);

    const trackProductView = async (productId: number) => {
        try {
            await productAnalyticsRegistration(productId);
        } catch (error) {
            console.error("Failed to track product view:", error);
        }
    };

    const toggleProductSelection = (productId: number, categoryId: number) => {
        setSelectedProducts((prev) => {
            const selectedInCategory = prev.find((id) => {
                const linkedProduct = linkedProducts.find((lp) => lp.id === id);
                return linkedProduct?.product?.categoryId === categoryId;
            });

            if (selectedInCategory === productId) {
                const newQuantities = { ...quantities };
                delete newQuantities[productId];
                setQuantities(newQuantities);
                return prev.filter((id) => id !== productId);
            } else if (selectedInCategory) {
                const newQuantities = { ...quantities };
                delete newQuantities[selectedInCategory];
                newQuantities[productId] = 1;
                setQuantities(newQuantities);
                return [
                    ...prev.filter((id) => id !== selectedInCategory),
                    productId,
                ];
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

    const updateMainProductQuantity = (quantity: number) => {
        if (quantity > 0 && quantity <= product.quantityInStock) {
            setMainProductQuantity(quantity);
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
            ) +
            product.price * mainProductQuantity
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
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                        <div className="flex flex-col w-full lg:w-2/3">
                            <ProductImages
                                imageUrl={
                                    product.imageUrl || "/placeholder.png"
                                }
                                noneMainImagesUrl={
                                    product.noneMainImagesUrl || ""
                                }
                            />

                            <div className="px-0 sm:px-4 mt-6">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                                    {product.name}
                                </h2>
                                <p className="text-gray-700 mb-6 whitespace-pre-wrap text-sm sm:text-base">
                                    {product.description}
                                </p>
                                <div className="flex flex-col gap-4">
                                    <div
                                        className="border-b-2 w-full border-border pb-2 flex justify-between cursor-pointer"
                                        onClick={() =>
                                            setIsSpecsOpen(!isSpecsOpen)
                                        }
                                    >
                                        <h2 className="font-display flex gap-2 text-lg sm:text-xl leading-tight font-bold tracking-tight">
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
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
                                                    {product.configuration}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 sm:gap-5 w-full lg:w-1/3">
                            <div className="flex flex-col gap-3 lg:hidden">
                                <h2 className="text-2xl sm:text-3xl font-bold">
                                    {product.name}
                                </h2>
                            </div>

                            {linkedProducts.length != 0 && (
                                <div className="flex flex-col gap-4 sm:gap-5 mb-4 sm:mb-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="font-display flex gap-2 text-xl sm:text-2xl leading-tight font-bold tracking-tight">
                                            Product Configureren
                                        </h2>
                                        <p className="text-sm sm:text-base">
                                            Kies hieronder de extra onderdelen
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
                                                    className="flex flex-col gap-2"
                                                    key={c.id}
                                                >
                                                    <p className="text-accent-foreground font-semibold text-sm sm:text-base">
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
                                                            .sort((a, b) => {
                                                                const nameA =
                                                                    a.product
                                                                        ?.name ||
                                                                    "";
                                                                const nameB =
                                                                    b.product
                                                                        ?.name ||
                                                                    "";
                                                                const nameComparison =
                                                                    nameA.localeCompare(
                                                                        nameB
                                                                    );

                                                                if (
                                                                    nameComparison !==
                                                                    0
                                                                ) {
                                                                    return nameComparison;
                                                                }

                                                                const priceA =
                                                                    parseFloat(
                                                                        String(
                                                                            a
                                                                                .product
                                                                                ?.price
                                                                        ) ?? "0"
                                                                    );
                                                                const priceB =
                                                                    parseFloat(
                                                                        String(
                                                                            b
                                                                                .product
                                                                                ?.price
                                                                        ) ?? "0"
                                                                    );
                                                                return (
                                                                    priceA -
                                                                    priceB
                                                                );
                                                            })
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
                                                                            className={`text-xs sm:text-sm text-left break-words ${
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
                                                                                )}
                                                                            {
                                                                                " - "
                                                                            }
                                                                            {
                                                                                l
                                                                                    .product
                                                                                    ?.quantityInStock
                                                                            }{" "}
                                                                            in
                                                                            voorraad
                                                                        </button>
                                                                    </div>
                                                                    {selectedProducts.includes(
                                                                        l.id
                                                                    ) && (
                                                                        <div className="flex gap-2 items-center ml-8">
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
                                                                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
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
                                                                                className="w-12 sm:w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
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
                                                                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-xs sm:text-sm">
                                        Aantal basisproduct:
                                    </span>
                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() =>
                                                updateMainProductQuantity(
                                                    mainProductQuantity - 1
                                                )
                                            }
                                            disabled={mainProductQuantity === 1}
                                            className="px-2 sm:px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={product.quantityInStock}
                                            value={mainProductQuantity}
                                            onChange={(e) =>
                                                updateMainProductQuantity(
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            }
                                            className="w-12 sm:w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                        />
                                        <button
                                            onClick={() =>
                                                updateMainProductQuantity(
                                                    mainProductQuantity + 1
                                                )
                                            }
                                            disabled={
                                                mainProductQuantity >=
                                                product.quantityInStock
                                            }
                                            className="px-2 sm:px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-600">
                                    {product.quantityInStock} stuks beschikbaar
                                </span>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <ul className="space-y-2 mb-4">
                                    <li className="flex justify-between text-xs sm:text-sm gap-2">
                                        <span className="break-words">
                                            {product.name} x{" "}
                                            {mainProductQuantity}
                                        </span>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-semibold">
                                                €
                                                {(
                                                    product.price *
                                                    mainProductQuantity
                                                )
                                                    .toFixed(2)
                                                    .replace(".", ",")}{" "}
                                                Excl. BTW
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                €
                                                {calculateTotalWithVAT(
                                                    product.price *
                                                        mainProductQuantity
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
                                                    className="flex justify-between text-xs sm:text-sm gap-2"
                                                >
                                                    <span className="break-words">
                                                        {item.name} x{" "}
                                                        {item.quantity}
                                                    </span>
                                                    <div className="text-right flex-shrink-0">
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
                                <div className="pt-4 border-t border-gray-300 flex justify-between gap-2">
                                    <span className="text-base sm:text-lg font-bold">
                                        Totaal:
                                    </span>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-base sm:text-lg font-bold text-primary">
                                            €
                                            {calculateTotal()
                                                .toFixed(2)
                                                .replace(".", ",")}{" "}
                                            Excl. BTW
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600">
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
                                mainProductQuantity={mainProductQuantity}
                            />

                            <Link href="/tos" className="w-full">
                                <Alert className="">
                                    <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <AlertTitle className="font-semibold text-sm sm:text-base">
                                        Voorwaarden van toepassing
                                    </AlertTitle>
                                    <AlertDescription className="text-xs sm:text-sm">
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
