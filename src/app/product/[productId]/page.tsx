import ProductImages from "@/app/components/productImages";
import { getProduct } from "@/lib/products";
import Image from "next/image";

export default async function Product({
    params,
}: {
    params: Promise<{ productId: string }>;
}) {
    const productId = (await params).productId;
    const product = await getProduct(parseInt(productId));

    if (!product) {
        return <div>Product not found</div>;
    }
    return (
        <section
            className="
            py-12
            md:py-16
            flex flex-col items-center
            "
        >
            <div
                className="
                container mx-auto max-w-7xl px-4
                sm:px-6
                lg:px-8
                "
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-wrap -mx-4">
                        <ProductImages product={product} />

                        <div className="w-full md:w-1/2 px-4">
                            <h2 className="text-3xl font-bold mb-2">
                                {product.name}
                            </h2>
                            <div className="mb-4">
                                <span className="text-2xl font-bold mr-2">
                                    €
                                    {product.price.toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-6">
                                {product.description}
                            </p>
                            <p className="text-gray-700 mb-6">
                                {product.configuration}
                            </p>
                            <div className="flex space-x-4 mb-6">
                                <button className="bg-black cursor-pointer flex gap-2 items-center text-white px-6 py-2 rounded-md hover:opacity-60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="size-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                        />
                                    </svg>
                                    Toevoegen
                                </button>
                            </div>

                            {/* <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Key Features:
                                </h3>
                                <ul className="list-disc list-inside text-gray-700">
                                    <li>Industry-leading noise cancellation</li>
                                    <li>30-hour battery life</li>
                                    <li>Touch sensor controls</li>
                                    <li>Speak-to-chat technology</li>
                                </ul>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// function changeImage(src: any) {
//     const mainImage = document.getElementById("mainImage");
//     if (mainImage) {
//         (mainImage as HTMLImageElement).src = src;
//     }
// }
