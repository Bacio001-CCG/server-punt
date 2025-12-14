import useCart from "@/hooks/useCart";
import { Trash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useMemo } from "react";

export default function Cart({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) {
    const { products, removeProduct, getTotalPrice } = useCart();

    const cartRef = useRef<HTMLDivElement>(null);

    // Group products by ID and calculate quantities
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cartRef.current &&
                !cartRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Cart content */}
                    <motion.div
                        ref={cartRef}
                        className="top-10 right-0 w-screen max-w-sm absolute border border-gray-300 rounded-lg bg-white px-4 py-8 sm:px-6 lg:px-8 z-50"
                        aria-modal="true"
                        role="dialog"
                        tabIndex={-1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute end-4 top-4 text-gray-600 transition hover:scale-110"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="sr-only">Close cart</span>

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <div className="mt-4 space-y-6 max-h-[50vh] overflow-y-auto">
                            <ul className="space-y-4">
                                {groupedProducts.length === 0 && (
                                    <p className="text-center text-gray-500">
                                        Je winkelwagen is leeg.
                                    </p>
                                )}
                                {groupedProducts.map((item, index) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-4"
                                    >
                                        <Image
                                            width={48}
                                            height={48}
                                            src={
                                                item.imageUrl ||
                                                "/placeholder.png"
                                            }
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
                                                        <dt className="inline mr-1">
                                                            Aantal:
                                                        </dt>
                                                        <dd className="inline">
                                                            {item.quantity}x
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="inline mr-1">
                                                            Prijs:
                                                        </dt>
                                                        <dd className="inline">
                                                            €
                                                            {String(
                                                                (
                                                                    item.price *
                                                                    item.quantity
                                                                ).toFixed(2)
                                                            ).replace(".", ",")}
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
                            </ul>

                            <div className="space-y-4 text-center">
                                <Link
                                    href="/checkout"
                                    className="block rounded-sm bg-black px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
                                >
                                    Bestellen (€
                                    {String(getTotalPrice().toFixed(2)).replace(
                                        ".",
                                        ","
                                    )}
                                    )
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
