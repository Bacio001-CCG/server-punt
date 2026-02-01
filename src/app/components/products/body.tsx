"use client";
import { Checkbox } from "@/components/ui/checkbox";
import Card from "../card";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SelectBrand, SelectCategory } from "@/database/schema";

export default function Body({
    filteredProducts,
    categories,
    brands,
}: {
    filteredProducts: Array<{
        id: number;
        name: string;
        imageUrl: string | null;
        price: number;
        quantityInStock: number;
        categoryId: number;
        brandId: number;
        description: string | null;
        configuration: string | null;
    }>;
    categories: SelectCategory[];
    brands: SelectBrand[];
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchQuery = searchParams.get("search") || "";

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [stockRange, setStockRange] = useState<[number, number]>([0, 100]);

    // Initialize filters from URL params only once
    useEffect(() => {
        const categoriesParam = searchParams.get("categories");
        const brandsParam = searchParams.get("brands");

        if (categoriesParam) {
            const categoryNames = categoriesParam.split(",");
            const categoryIds = categories
                .filter((c) => categoryNames.includes(c.name))
                .map((c) => c.id);
            setSelectedCategories(categoryIds);
        }

        if (brandsParam) {
            const brandNames = brandsParam.split(",");
            const brandIds = brands
                .filter((b) => brandNames.includes(b.name))
                .map((b) => b.id);
            setSelectedBrands(brandIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const updateURL = (categoryIds: number[], brandIds: number[]) => {
        const params = new URLSearchParams(searchParams.toString());

        if (categoryIds.length > 0) {
            const categoryNames = categories
                .filter((c) => categoryIds.includes(c.id))
                .map((c) => c.name)
                .join(",");
            params.set("categories", categoryNames);
        } else {
            params.delete("categories");
        }

        if (brandIds.length > 0) {
            const brandNames = brands
                .filter((b) => brandIds.includes(b.id))
                .map((b) => b.name)
                .join(",");
            params.set("brands", brandNames);
        } else {
            params.delete("brands");
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const toggleCategory = (categoryId: number) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(newCategories);
        updateURL(newCategories, selectedBrands);
    };

    const toggleBrand = (brandId: number) => {
        const newBrands = selectedBrands.includes(brandId)
            ? selectedBrands.filter((id) => id !== brandId)
            : [...selectedBrands, brandId];

        setSelectedBrands(newBrands);
        updateURL(selectedCategories, newBrands);
    };

    const handlePriceInputChange = (index: 0 | 1, value: string) => {
        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(5000, numValue));
        const newRange: [number, number] = [...priceRange] as [number, number];
        newRange[index] = clampedValue;

        if (index === 0 && clampedValue > priceRange[1]) {
            newRange[1] = clampedValue;
        } else if (index === 1 && clampedValue < priceRange[0]) {
            newRange[0] = clampedValue;
        }

        setPriceRange(newRange);
    };

    const handleStockInputChange = (index: 0 | 1, value: string) => {
        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(100, numValue));
        const newRange: [number, number] = [...stockRange] as [number, number];
        newRange[index] = clampedValue;

        if (index === 0 && clampedValue > stockRange[1]) {
            newRange[1] = clampedValue;
        } else if (index === 1 && clampedValue < stockRange[0]) {
            newRange[0] = clampedValue;
        }

        setStockRange(newRange);
    };

    const displayedProducts = filteredProducts
        .filter((product) => {
            const matchesCategory =
                selectedCategories.length === 0 ||
                selectedCategories.includes(product.categoryId);
            const matchesBrand =
                selectedBrands.length === 0 ||
                selectedBrands.includes(product.brandId);
            const matchesPrice =
                product.price >= priceRange[0] &&
                product.price <= priceRange[1];
            const matchesStock =
                product.quantityInStock >= stockRange[0] &&
                product.quantityInStock <= stockRange[1];

            // Search filter - check name, description, and configuration
            const matchesSearch =
                !searchQuery ||
                product.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (product.description &&
                    product.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())) ||
                (product.configuration &&
                    product.configuration
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()));

            return (
                matchesCategory &&
                matchesBrand &&
                matchesPrice &&
                matchesStock &&
                matchesSearch
            );
        })
        .sort((a, b) => {
            if (a.categoryId !== b.categoryId) {
                return a.categoryId - b.categoryId;
            }
            return a.name.localeCompare(b.name);
        });

    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex">
                {/* Sidebar Filter */}
                <aside className="w-fit pr-6 flex flex-col gap-6">
                    {/* Search Query Display */}
                    {searchQuery && (
                        <div className="flex flex-col gap-2 p-3 bg-primary/10 rounded-lg">
                            <h4 className="text-sm font-semibold">
                                Zoekresultaten voor:
                            </h4>
                            <p className="text-sm text-primary font-medium">
                                "{searchQuery}"
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {displayedProducts.length} product(en) gevonden
                            </p>
                        </div>
                    )}

                    {/* Price Slider */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-md font-semibold mb-2 relative w-fit">
                            Prijs
                            <hr className="w-2/3 border border-black" />
                        </h4>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) =>
                                        handlePriceInputChange(
                                            0,
                                            e.target.value
                                        )
                                    }
                                    min={0}
                                    max={5000}
                                    className="w-20 text-sm"
                                    placeholder="Min"
                                />
                                <span className="text-sm">-</span>
                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) =>
                                        handlePriceInputChange(
                                            1,
                                            e.target.value
                                        )
                                    }
                                    min={0}
                                    max={5000}
                                    className="w-20 text-sm"
                                    placeholder="Max"
                                />
                            </div>
                            <Slider
                                value={priceRange}
                                onValueChange={(values) =>
                                    setPriceRange([values[0], values[1]])
                                }
                                min={0}
                                max={5000}
                                step={10}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Stock Slider */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-md font-semibold mb-2 relative w-fit">
                            Voorraad
                            <hr className="w-2/3 border border-black" />
                        </h4>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={stockRange[0]}
                                    onChange={(e) =>
                                        handleStockInputChange(
                                            0,
                                            e.target.value
                                        )
                                    }
                                    min={0}
                                    max={100}
                                    className="w-20 text-sm"
                                    placeholder="Min"
                                />
                                <span className="text-sm">-</span>
                                <Input
                                    type="number"
                                    value={stockRange[1]}
                                    onChange={(e) =>
                                        handleStockInputChange(
                                            1,
                                            e.target.value
                                        )
                                    }
                                    min={0}
                                    max={100}
                                    className="w-20 text-sm"
                                    placeholder="Max"
                                />
                            </div>
                            <Slider
                                value={stockRange}
                                onValueChange={(values) =>
                                    setStockRange([values[0], values[1]])
                                }
                                min={0}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-md font-semibold mb-2 relative w-fit">
                            Categorieën
                            <hr className="w-2/3 border border-black" />
                        </h4>
                        <ul className="space-y-2">
                            {categories
                                .filter((c) => c.hidden === false)
                                .map((category) => (
                                    <li
                                        key={category.id}
                                        className="flex gap-3"
                                        onClick={() =>
                                            toggleCategory(category.id)
                                        }
                                    >
                                        <Checkbox
                                            checked={selectedCategories.includes(
                                                category.id
                                            )}
                                        />{" "}
                                        <button
                                            className={`text-sm ${
                                                selectedCategories.includes(
                                                    category.id
                                                )
                                                    ? "text-primary font-bold"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* Brands */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-md font-semibold mb-2 relative w-fit">
                            Merken <hr className="w-2/3 border border-black" />
                        </h4>
                        <ul className="space-y-2">
                            {brands.map((brand) => (
                                <li
                                    key={brand.id}
                                    className="flex gap-3"
                                    onClick={() => toggleBrand(brand.id)}
                                >
                                    <Checkbox
                                        checked={selectedBrands.includes(
                                            brand.id
                                        )}
                                    />
                                    <button
                                        className={`text-sm ${
                                            selectedBrands.includes(brand.id)
                                                ? "text-primary font-bold"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {brand.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="w-3/4">
                    <div className="mb-8 flex-col items-center text-center hidden md:flex">
                        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                            {searchQuery ? `Zoekresultaten` : "Onze Producten"}
                        </h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                        <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                            {searchQuery
                                ? `${displayedProducts.length} product(en) gevonden voor "${searchQuery}"`
                                : "Vind het perfecte apparaat voor uw behoeften uit onze zorgvuldig samengestelde collecties"}
                        </p>
                    </div>
                    {displayedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground">
                                Geen producten gevonden.
                            </p>
                            {searchQuery && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Probeer een andere zoekterm of pas de
                                    filters aan.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div
                            className="
                            grid grid-cols-1 gap-4
                            md:grid-cols-4 md:gap-6
                        "
                        >
                            {displayedProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    name={product.name}
                                    image={
                                        product.imageUrl || "/placeholder.png"
                                    }
                                    href={`/product/${product.id}`}
                                    price={String(product.price)}
                                    stock={product.quantityInStock}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
