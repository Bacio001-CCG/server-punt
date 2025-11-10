import AddProduct from "@/app/components/addProduct";
import ProductImages from "@/app/components/productImages";
import { getProduct } from "@/lib/products";

export default async function Product({
    params,
}: {
    params: Promise<{ productId: string }>;
}) {
    const productId = (await params).productId;
    const product = await getProduct(parseInt(productId));

    if (!product) {
        return <div>Product niet gevonden.</div>;
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
                            <AddProduct product={product} />
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
