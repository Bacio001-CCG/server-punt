"use client";
import Image from "next/image";
import React from "react";

export default function ProductImages({
    imageUrl,
    noneMainImagesUrl,
}: {
    imageUrl: string;
    noneMainImagesUrl: string;
}) {
    const [selected, setSelected] = React.useState(imageUrl);
    const other = JSON.parse(String(noneMainImagesUrl)).map((url: string) => {
        return url
            .replaceAll("\\", "")
            .replaceAll('"', "")
            .replaceAll("[", "")
            .replaceAll("]", "");
    });

    return (
        <div className="w-full  px-4 mb-8">
            {/* Main Image */}
            <div className=" mx-auto">
                <Image
                    height={400}
                    width={400}
                    src={selected || "/placeholder.png"}
                    alt="Product"
                    className="w-full h-full object-contain rounded-lg shadow-md"
                    id="mainImage"
                />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 py-4 justify-center overflow-x-auto">
                <div className="w-[100px] h-[100px]">
                    <Image
                        onClick={() => setSelected(imageUrl)}
                        height={100}
                        width={100}
                        src={imageUrl || "/placeholder.png"}
                        alt="Product Thumbnail"
                        className="w-full h-full object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                    />
                </div>
                {noneMainImagesUrl &&
                    other
                        .filter((url: string) => url != "")
                        .map((url: string, index: number) => (
                            <div key={index} className="w-[100px] h-[100px]">
                                <Image
                                    onClick={() => setSelected(url)}
                                    height={100}
                                    width={100}
                                    src={url || "/placeholder.png"}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                />
                            </div>
                        ))}
            </div>
        </div>
    );
}
