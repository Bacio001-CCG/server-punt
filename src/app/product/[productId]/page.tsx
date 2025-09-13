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
                        <div className="w-full md:w-1/2 px-4 mb-8">
                            <Image
                                height={400}
                                width={400}
                                src={product.imageUrl}
                                alt="Product"
                                className="w-full h-auto rounded-lg shadow-md mb-4"
                                id="mainImage"
                            />
                            <div className="flex gap-4 py-4 justify-center overflow-x-auto">
                                <Image
                                    height={400}
                                    width={400}
                                    src="https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxMnx8aGVhZHBob25lfGVufDB8MHx8fDE3MjEzMDM2OTB8MA&ixlib=rb-4.0.3&q=80&w=1080"
                                    alt="Thumbnail 1"
                                    className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                />
                                <Image
                                    height={400}
                                    width={400}
                                    src="https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw0fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080"
                                    alt="Thumbnail 2"
                                    className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                />
                                <Image
                                    height={400}
                                    width={400}
                                    src="https://images.unsplash.com/photo-1496957961599-e35b69ef5d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw4fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080"
                                    alt="Thumbnail 3"
                                    className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                />
                                <Image
                                    height={400}
                                    width={400}
                                    src="https://images.unsplash.com/photo-1528148343865-51218c4a13e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwzfHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080"
                                    alt="Thumbnail 4"
                                    className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 px-4">
                            <h2 className="text-3xl font-bold mb-2">
                                {product.name}
                            </h2>
                            <div className="mb-4">
                                <span className="text-2xl font-bold mr-2">
                                    €{(product.price / 100).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-6">
                                {product.description}
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
