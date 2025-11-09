"use client";
import Link from "next/link";
import { useState } from "react";
import Cart from "./cart";
import useCart from "@/hooks/useCart";

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const { products } = useCart();

    return (
        <nav className="sticky top-0 z-40 w-full border-b h-[65px] bg-white">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link className="flex items-center gap-2" href="/">
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text tracking-tight text-transparent">
                                ServerPunt
                            </span>
                        </Link>
                        <div className="hidden md:flex">
                            <ul className="flex items-center gap-6">
                                <li>
                                    <Link
                                        className="text-sm transition-colors hover:text-primary font-semibold text-primary"
                                        href="/"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                                        href="/products"
                                    >
                                        Products
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out outline-none focus:shadow-lg focus-visible:border-ring active:shadow disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 size-9 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 relative h-9 w-9 rounded-full"
                                    data-slot="sheet-trigger"
                                    aria-label="Open cart"
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded="false"
                                    aria-controls="radix-«r2»"
                                    data-state="closed"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-shopping-cart h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <circle cx="8" cy="21" r="1"></circle>
                                        <circle cx="19" cy="21" r="1"></circle>
                                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                                    </svg>
                                    <span
                                        className="inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden border font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;&gt;svg]:pointer-events-none [&amp;&gt;svg]:size-3 border-transparent bg-primary text-primary-foreground [a&amp;]:hover:bg-primary/90 absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
                                        data-slot="badge"
                                    >
                                        {products.length}
                                    </span>
                                </button>
                            </div>
                            <Cart isOpen={isOpen} setIsOpen={setIsOpen} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
