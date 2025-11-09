import { SelectProduct } from "@/database/schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
    products: SelectProduct[];
    removeProduct: (id: number) => void;
    addProduct: (product: SelectProduct, index: number) => void;
    getTotalPrice: () => number;
    clearProducts: () => void;
};

export default create<CartState>()(
    persist(
        (set, get) => ({
            products: [],
            removeProduct: (id) =>
                set(() => {
                    const currentProducts = get().products;
                    const newProducts = currentProducts.filter(
                        (product, i) => !(product.id === id)
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
            clearProducts: () => set(() => ({ products: [] })),
        }),
        {
            name: "cart-storage", // unique name for localStorage key
        }
    )
);
