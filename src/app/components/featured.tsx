"use client";
import { useEffect, useState } from "react";
import { getFeatured } from "@/lib/products";
import Card from "./card";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SelectProduct } from "@/database/schema";

function NextArrow(props: any) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} text-accent-foreground slick-arrow slick-next`}
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                right: "-40px",
                zIndex: 10,
                cursor: "pointer",
                color: "black", // Changed to black
            }}
        ></div>
    );
}

function PrevArrow(props: any) {
    const { className, onClick } = props;
    return (
        <div
            className={`${className} slick-arrow slick-prev`}
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                left: "-40px",
                zIndex: 10,
                cursor: "pointer",
                color: "black",
            }}
        ></div>
    );
}

export default function Featured() {
    const [products, setProducts] = useState<SelectProduct[]>([]);

    useEffect(() => {
        async function fetchProducts() {
            const { products = [] } = (await getFeatured(12)) || {};
            setProducts(products);
        }
        fetchProducts();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <section
            id="featured"
            className="
            py-12
            md:py-16
          "
        >
            <div
                className="
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
            >
                <div className="mb-8 flex flex-col items-center text-center">
                    <h2
                        className="
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                "
                    >
                        Meest Verkocht
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        Onze best verkochte servers, gekozen door onze klanten
                        vanwege hun betrouwbaarheid en prestaties.
                    </p>
                </div>
                <Slider className="h-[335px]" {...settings}>
                    {products.map((product: SelectProduct) => (
                        <div key={product.name + product.id} className="px-4">
                            <Card
                                name={product.name}
                                image={product.imageUrl || "/placeholder.png"}
                                href={`/product/${product.id}`}
                                price={product.price.toFixed(2)}
                                stock={product.quantityInStock}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
}
