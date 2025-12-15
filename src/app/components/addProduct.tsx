"use client";
import { SelectProduct } from "@/database/schema";
import useCart from "@/hooks/useCart";

type ConfiguredProduct = {
    product: SelectProduct;
    quantity: number;
};

export default function AddProduct({
    product,
    configuredProducts,
}: {
    product: SelectProduct;
    configuredProducts?: ConfiguredProduct[];
}) {
    const { addProduct } = useCart();

    const handleAdd = () => {
        if (configuredProducts && configuredProducts.length > 0) {
            addProduct(product, 1, configuredProducts);
        } else {
            addProduct(product, 1);
        }
    };

    return (
        <div className="flex space-x-4 mb-6">
            <button
                onClick={handleAdd}
                className="bg-black cursor-pointer flex gap-2 items-center text-white px-6 py-2 rounded-md hover:opacity-60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
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
    );
}
