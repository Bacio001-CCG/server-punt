"use client";
import Image from "next/image";
import React from "react";

export default function ProductImages({
    product,
}: {
    product: {
        imageUrl: string;
        noneMainImagesUrl: string | null;
    };
}) {
    const [selected, setSelected] = React.useState(product.imageUrl);
    const other = JSON.parse(String(product.noneMainImagesUrl)).map(
        (url: string) => {
            return url
                .replaceAll("\\", "")
                .replaceAll('"', "")
                .replaceAll("[", "")
                .replaceAll("]", "");
        }
    );
    return (
        <div className="w-full md:w-1/2 px-4 mb-8">
            <Image
                height={400}
                width={400}
                src={selected}
                alt="Product"
                className="w-full h-auto rounded-lg shadow-md mb-4"
                id="mainImage"
            />
            <div className="flex gap-4 py-4 justify-center overflow-x-auto">
                <Image
                    onClick={() => setSelected(product.imageUrl)}
                    height={400}
                    width={400}
                    src={product.imageUrl}
                    alt="Product"
                    className="w-full h-auto rounded-lg shadow-md mb-4"
                    id="mainImage"
                />
                {product.noneMainImagesUrl &&
                    other.map((url: string, index: number) => (
                        <Image
                            onClick={() => setSelected(url)}
                            key={index}
                            height={400}
                            width={400}
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                            // onClick={() => changeImage(url)}
                        />
                    ))}
            </div>
        </div>
    );
}
