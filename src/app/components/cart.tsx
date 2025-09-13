import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Cart({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) {
    const cartRef = useRef<HTMLDivElement>(null);

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

                        <div className="mt-4 space-y-6">
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4">
                                    <Image
                                        width={48}
                                        height={48}
                                        src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=830&q=80"
                                        alt=""
                                        className="size-16 rounded-sm object-cover"
                                    />

                                    <div>
                                        <h3 className="text-sm text-gray-900">
                                            Basic Tee 6-Pack
                                        </h3>

                                        <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                            <div>
                                                <dt className="inline mr-1">
                                                    Aantal:
                                                </dt>
                                                <dd className="inline">5x</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </li>

                                <li className="flex items-center gap-4">
                                    <Image
                                        width={48}
                                        height={48}
                                        src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=830&q=80"
                                        alt=""
                                        className="size-16 rounded-sm object-cover"
                                    />

                                    <div>
                                        <h3 className="text-sm text-gray-900">
                                            Basic Tee 6-Pack
                                        </h3>

                                        <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                            <div>
                                                <dt className="inline mr-1">
                                                    Aantal:
                                                </dt>
                                                <dd className="inline">5x</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </li>

                                <li className="flex items-center gap-4">
                                    <Image
                                        width={48}
                                        height={48}
                                        src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=830&q=80"
                                        alt=""
                                        className="size-16 rounded-sm object-cover"
                                    />

                                    <div>
                                        <h3 className="text-sm text-gray-900">
                                            Basic Tee 6-Pack
                                        </h3>

                                        <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                                            <div>
                                                <dt className="inline mr-1">
                                                    Aantal:
                                                </dt>
                                                <dd className="inline">5x</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </li>
                            </ul>

                            <div className="space-y-4 text-center">
                                <Link
                                    href="#"
                                    className="block rounded-sm bg-gray-700 px-5 py-3 text-sm text-gray-100 transition hover:bg-gray-600"
                                >
                                    Checkout
                                </Link>

                                <Link
                                    href="#"
                                    className="inline-block text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-600"
                                >
                                    Continue shopping
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
