"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cart from "./cart";
import useCart from "@/hooks/useCart";
import { SelectBrand, SelectCategory, SelectProduct } from "@/database/schema";
import { getCategories } from "@/lib/categories";
import { getBrands } from "@/lib/brands";
import { searchProducts } from "@/lib/products";
import Image from "next/image";
import { Search } from "lucide-react";

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const { products } = useCart();
    const [categories, setCategories] = useState<SelectCategory[]>([]);
    const [brands, setBrands] = useState<SelectBrand[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SelectProduct[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const pathname = usePathname();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchCategories() {
            const result = await getCategories();
            setCategories(result || []);
        }

        async function fetchBrands() {
            const result = await getBrands();
            setBrands(result || []);
        }

        fetchCategories();
        fetchBrands();
    }, []);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search as user types
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                const results = await searchProducts(searchQuery.trim());
                setSearchResults(results.slice(0, 3));
                setTotalResults(results.length);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300); // Debounce search

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(
                `/products?search=${encodeURIComponent(searchQuery.trim())}`
            );
            setShowResults(false);
            setSearchQuery("");
        }
    };

    const handleResultClick = () => {
        setShowResults(false);
        setSearchQuery("");
    };

    return (
        <nav className="sticky top-0 z-40 w-full border-b h-[65px] bg-white">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link className="flex items-center" href="/">
                            <Image
                                src="/logo.png"
                                width={60}
                                height={60}
                                alt="Logo"
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text tracking-tight text-transparent">
                                ServerPunt
                            </span>
                        </Link>
                        <div className="hidden md:flex">
                            <ul className="flex items-center gap-6">
                                <li>
                                    <Link
                                        className={`text-sm font-medium transition-colors ${
                                            pathname === "/"
                                                ? "font-bold text-primary"
                                                : "text-muted-foreground hover:text-primary"
                                        }`}
                                        href="/"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className={`text-sm font-medium transition-colors ${
                                            pathname === "/products"
                                                ? "font-bold text-primary"
                                                : "text-muted-foreground hover:text-primary"
                                        }`}
                                        href="/products"
                                    >
                                        Producten
                                    </Link>
                                </li>
                                <li className="relative group">
                                    <span className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground cursor-pointer">
                                        Categorieën
                                    </span>
                                    <ul
                                        className="absolute left-0 hidden mt-0 w-48 overflow-hidden max-h-[75vh] overflow-y-auto bg-white border rounded-lg shadow-lg group-hover:block group-hover:pointer-events-auto z-10"
                                        style={{ top: "100%" }}
                                    >
                                        {categories
                                            .filter((c) => c.hidden === false)
                                            .map((category) => (
                                                <li key={category.id}>
                                                    <Link
                                                        href={`/products?categories=${encodeURIComponent(
                                                            category.name
                                                        )}`}
                                                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        {category.name}
                                                    </Link>
                                                </li>
                                            ))}
                                    </ul>
                                </li>
                                <li className="relative group">
                                    <span className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground cursor-pointer">
                                        Merken
                                    </span>
                                    <ul
                                        className="absolute left-0 hidden mt-0 w-48 overflow-hidden max-h-[75vh] overflow-y-auto bg-white border rounded-lg shadow-lg group-hover:block group-hover:pointer-events-auto z-10"
                                        style={{ top: "100%" }}
                                    >
                                        {brands.map((brand) => (
                                            <li key={brand.id}>
                                                <Link
                                                    href={`/products?brands=${encodeURIComponent(
                                                        brand.name
                                                    )}`}
                                                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                                                >
                                                    {brand.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                                <li>
                                    <Link
                                        className={`text-sm font-medium transition-colors ${
                                            pathname === "/about-us"
                                                ? "font-bold text-primary"
                                                : "text-muted-foreground hover:text-primary"
                                        }`}
                                        href="/about-us"
                                    >
                                        Over ons
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Search Bar - Only visible on desktop */}
                    <div
                        ref={searchRef}
                        className="hidden lg:flex flex-1 max-w-md relative"
                    >
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Zoek producten..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onFocus={() =>
                                        searchQuery && setShowResults(true)
                                    }
                                    className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    aria-label="Search"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
                                <div className="p-2">
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            onClick={handleResultClick}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                                        >
                                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                <Image
                                                    src={
                                                        product.imageUrl ||
                                                        "/placeholder.png"
                                                    }
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-primary font-semibold">
                                                    €
                                                    {product.price
                                                        .toFixed(2)
                                                        .replace(".", ",")}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {totalResults > 3 && (
                                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                                        <Link
                                            href={`/products?search=${encodeURIComponent(
                                                searchQuery
                                            )}`}
                                            onClick={handleResultClick}
                                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-between"
                                        >
                                            <span>
                                                Bekijk alle {totalResults}{" "}
                                                resultaten
                                            </span>
                                            <Search size={16} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Results */}
                        {showResults &&
                            searchQuery &&
                            searchResults.length === 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                                    <p className="text-sm text-gray-500 text-center">
                                        Geen producten gevonden voor "
                                        {searchQuery}"
                                    </p>
                                </div>
                            )}
                    </div>

                    <div>
                        <div className="relative">
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out outline-none focus:shadow-lg focus-visible:border-ring active:shadow disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 size-9 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 relative h-9 w-9 rounded-full"
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
                                        className="inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden border font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3 border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
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
