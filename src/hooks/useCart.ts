import { SelectProduct } from "@/database/schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
    products: SelectProduct[];
    removeProduct: (id: number) => void;
    addProduct: (product: SelectProduct, index: number) => void;
    getTotalPrice: () => number;
    clearProducts: () => void;
    getGroupedProducts: () => {
        product: SelectProduct;
        quantity: number;
    }[];
};

export default create<CartState>()(
    persist(
        (set, get) => ({
            products: [],
            removeProduct: (id) =>
                set(() => {
                    const currentProducts = get().products;
                    const newProducts = currentProducts.filter(
                        (product) => !(product.id === id)
                    );
                    return { products: newProducts };
                }),
            addProduct: (element, index) =>
                set(() => {
                    const currentProducts = get().products;
                    const newProducts = [...currentProducts];
                    newProducts.splice(index, 0, element);
                    return { products: newProducts };
                }),
            getTotalPrice: () => {
                const currentProducts = get().products;
                return currentProducts.reduce(
                    (total, product) => total + product.price,
                    0
                );
            },
            getGroupedProducts: () => {
                const currentProducts = get().products;
                const groupedProducts: {
                    [key: number]: { product: SelectProduct; quantity: number };
                } = {};

                currentProducts.forEach((product) => {
                    if (groupedProducts[product.id]) {
                        groupedProducts[product.id].quantity += 1;
                    } else {
                        groupedProducts[product.id] = { product, quantity: 1 };
                    }
                });

                return Object.values(groupedProducts);
            },
            clearProducts: () => set(() => ({ products: [] })),
        }),
        {
            name: "cart-storage", // unique name for localStorage key
        }
    )
);
