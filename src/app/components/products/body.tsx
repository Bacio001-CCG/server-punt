"use client";
import { Checkbox } from "@/components/ui/checkbox";
import Card from "../card";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

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
    }>;
    categories: Array<{
        id: number;
        name: string;
    }>;
    brands: Array<{
        id: number;
        name: string;
    }>;
}) {
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [stockRange, setStockRange] = useState<[number, number]>([0, 100]);

    const toggleCategory = (categoryId: number) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleBrand = (brandId: number) => {
        setSelectedBrands((prev) =>
            prev.includes(brandId)
                ? prev.filter((id) => id !== brandId)
                : [...prev, brandId]
        );
    };

    const handlePriceInputChange = (index: 0 | 1, value: string) => {
        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(5000, numValue));
        const newRange: [number, number] = [...priceRange] as [number, number];
        newRange[index] = clampedValue;

        // Ensure min doesn't exceed max and vice versa
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

        // Ensure min doesn't exceed max and vice versa
        if (index === 0 && clampedValue > stockRange[1]) {
            newRange[1] = clampedValue;
        } else if (index === 1 && clampedValue < stockRange[0]) {
            newRange[0] = clampedValue;
        }

        setStockRange(newRange);
    };

    const displayedProducts = filteredProducts.filter((product) => {
        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(product.categoryId);
        const matchesBrand =
            selectedBrands.length === 0 ||
            selectedBrands.includes(product.brandId);
        const matchesPrice =
            product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesStock =
            product.quantityInStock >= stockRange[0] &&
            product.quantityInStock <= stockRange[1];
        return matchesCategory && matchesBrand && matchesPrice && matchesStock;
    });

    return (
        <section className="py-12 md:py-16 flex flex-col items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex">
                {/* Sidebar Filter */}
                <aside className="w-fit pr-6 flex flex-col gap-6">
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
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="flex gap-3"
                                    onClick={() => toggleCategory(category.id)}
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
                            Onze Producten
                        </h2>
                        <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                        <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                            Vind het perfecte apparaat voor uw behoeften uit
                            onze zorgvuldig samengestelde collecties
                        </p>
                    </div>
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
                                image={product.imageUrl || "/placeholder.png"}
                                href={`/product/${product.id}`}
                                price={String(product.price)}
                                stock={product.quantityInStock}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
