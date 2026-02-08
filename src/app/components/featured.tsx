"use client";
import { useEffect, useState, useCallback } from "react";
import { getFeatured } from "@/lib/products";
import Card from "./card";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SelectProduct } from "@/database/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Featured() {
    const [products, setProducts] = useState<SelectProduct[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "start",
            slidesToScroll: 1,
            breakpoints: {
                "(min-width: 640px)": { slidesToScroll: 1 },
                "(min-width: 1024px)": { slidesToScroll: 1 },
                "(min-width: 1280px)": { slidesToScroll: 1 },
                "(min-width: 1536px)": { slidesToScroll: 1 },
            },
        },
        [Autoplay({ delay: 3000, stopOnInteraction: false })]
    );

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        async function fetchProducts() {
            const { products = [] } = (await getFeatured(12)) || {};
            setProducts(products);
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!emblaApi || products.length === 0) return;
        emblaApi.reInit();
    }, [emblaApi, products]);

    return (
        <section id="featured" className="py-12 md:py-16">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col items-center text-center">
                    <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                        Meest Verkocht
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        Onze best verkochte producten, gekozen door onze klanten
                        vanwege hun kwaliteit en betrouwbaarheid.
                    </p>
                </div>
                <div className="relative mx-auto max-w-6xl">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-4">
                            {products.map((product: SelectProduct) => (
                                <div
                                    key={product.name + product.id}
                                    className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] 2xl:flex-[0_0_20%]"
                                >
                                    <div className="mx-auto max-w-[280px] px-2">
                                        <Card
                                            name={product.name}
                                            image={
                                                product.imageUrl ||
                                                "/placeholder.png"
                                            }
                                            href={`/product/${product.id}`}
                                            price={product.price.toFixed(2)}
                                            stock={product.quantityInStock}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 hidden lg:block"
                        onClick={scrollPrev}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        className="absolute right-0 top-1/2 translate-x-12 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 hidden lg:block"
                        onClick={scrollNext}
                        aria-label="Next"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
                {scrollSnaps.length > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 w-2 rounded-full transition-all ${
                                    index === selectedIndex
                                        ? "bg-primary w-8"
                                        : "bg-gray-300 hover:bg-gray-400"
                                }`}
                                onClick={() => scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
