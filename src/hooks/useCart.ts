import { SelectProduct } from "@/database/schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConfiguredItem = { product: SelectProduct; quantity: number };
type CartProduct = SelectProduct & {
    configuredItems?: ConfiguredItem[];
    configSignature?: string;
};

type CartState = {
    products: CartProduct[];
    removeProduct: (id: number, configSignature?: string) => void;
    addProduct: (
        product: SelectProduct,
        quantity?: number,
        configuredItems?: ConfiguredItem[]
    ) => void;
    getTotalPrice: () => number;
    getVatPrice: () => number;
    getShippingCost: () => number;
    clearProducts: () => void;
    getGroupedProducts: () => {
        product: CartProduct;
        quantity: number;
    }[];
};

export default create<CartState>()(
    persist(
        (set, get) => {
            const buildSignature = (items?: ConfiguredItem[]) => {
                if (!items || items.length === 0) return "base";
                return JSON.stringify(
                    items.map((item) => ({
                        id: item.product.id,
                        quantity: item.quantity,
                    }))
                );
            };

            return {
                products: [],
                removeProduct: (id, configSignature) =>
                    set(() => {
                        const currentProducts = get().products;
                        const indexToRemove = currentProducts.findIndex(
                            (product) =>
                                product.id === id &&
                                (configSignature
                                    ? product.configSignature === configSignature
                                    : true)
                        );

                        if (indexToRemove === -1) return { products: currentProducts };

                        const newProducts = [...currentProducts];
                        newProducts.splice(indexToRemove, 1);
                        return { products: newProducts };
                    }),
                addProduct: (element, quantity = 1, configuredItems) =>
                    set(() => {
                        const currentProducts = get().products;
                        const newProducts = [...currentProducts];
                        const configSignature = buildSignature(configuredItems);

                        for (let i = 0; i < quantity; i += 1) {
                            newProducts.push({
                                ...element,
                                configuredItems,
                                configSignature,
                            });
                        }
                        return { products: newProducts };
                    }),
                getTotalPrice: () => {
                    const currentProducts = get().products;
                    return currentProducts.reduce((total, product) => {
                        const configuredTotal = (product.configuredItems || []).reduce(
                            (subTotal, item) =>
                                subTotal + item.product.price * item.quantity,
                            0
                        );
                        return total + product.price + configuredTotal;
                    }, 0);
                },
                getVatPrice: () => {
                    const currentProducts = get().products;
                    const VAT_RATE = 0.21;

                    return currentProducts.reduce((total, product) => {
                        const configuredTotal = (product.configuredItems || []).reduce(
                            (subTotal, item) =>
                                subTotal + item.product.price * item.quantity,
                            0
                        );
                        const lineTotal = product.price + configuredTotal;
                        return (total + lineTotal * VAT_RATE) + get().getShippingCost() * VAT_RATE;
                    }, 0);
                },
                getShippingCost: () => {
                    const currentProducts = get().products;

                    const serversCount = currentProducts.filter(
                        (item) => item.categoryId === 7
                    ).length;
                    const smallProductsCount = currentProducts.reduce(
                        (acc, item) => (item.categoryId !== 7 ? acc + 1 : acc),
                        0
                    );

                    let shipping = 0;

                    if (smallProductsCount > 0 && smallProductsCount <= 5) {
                        shipping = 10;
                    }

                    if (smallProductsCount > 5) {
                        shipping = 15;
                    }

                    if (serversCount === 1 || serversCount === 2) {
                        shipping = 40;
                    }

                    if (serversCount > 2) {
                        shipping = 0;
                    }

                    return shipping;
                },
                getGroupedProducts: () => {
                    const currentProducts = get().products;
                    const groupedProducts: {
                        [key: string]: { product: CartProduct; quantity: number };
                    } = {};

                    currentProducts.forEach((product) => {
                        const key = `${product.id}-${product.configSignature ?? "base"}`;
                        if (groupedProducts[key]) {
                            groupedProducts[key].quantity += 1;
                        } else {
                            groupedProducts[key] = { product, quantity: 1 };
                        }
                    });

                    return Object.values(groupedProducts);
                },
                clearProducts: () => set(() => ({ products: [] })),
            };
        },
        {
            name: "cart-storage",
        }
    )
);
