"use client";
import { getVatRate } from "@/lib/company-fields";
import { calculateShippingCost } from "@/lib/regions";
import { SelectProduct } from "@/database/schema";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";

type ConfiguredItem = { product: SelectProduct; quantity: number };
type CartProduct = SelectProduct & {
    configuredItems?: ConfiguredItem[];
    configSignature?: string;
    bundleLabel?: string;
};

type CartState = {
    products: CartProduct[];
    removeProduct: (id: number, configSignature?: string) => void;
    addProduct: (
        product: SelectProduct,
        quantity?: number,
        configuredItems?: ConfiguredItem[],
        options?: { bundleLabel?: string }
    ) => void;
    getTotalPrice: () => number;
    getVatPrice: (
        delivery?: boolean,
        countryCode?: string,
        vatNumber?: string,
        hasCompany?: boolean
    ) => number;
    getShippingCost: (countryCode?: string) => number;
    clearProducts: () => void;
    getGroupedProducts: () => {
        product: CartProduct;
        quantity: number;
    }[];
};

const hasCookieConsent = () => {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("cookieConsent=true");
};

const storeConfig: StateCreator<
    CartState,
    [["zustand/persist", unknown]],
    []
> = (set, get) => {
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
        removeProduct: (id: number, configSignature?: string) =>
            set(() => {
                const currentProducts = get().products;
                const indexToRemove = currentProducts.findIndex(
                    (product: CartProduct) =>
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
        addProduct: (
            element: SelectProduct,
            quantity = 1,
            configuredItems?: ConfiguredItem[],
            options?: { bundleLabel?: string }
        ) =>
            set(() => {
                const currentProducts = get().products;
                const newProducts = [...currentProducts];
                const configSignature = buildSignature(configuredItems);

                for (let i = 0; i < quantity; i += 1) {
                    newProducts.push({
                        ...element,
                        configuredItems,
                        configSignature,
                        bundleLabel: options?.bundleLabel,
                    });
                }
                return { products: newProducts };
            }),
        getTotalPrice: () => {
            const currentProducts = get().products;
            return currentProducts.reduce(
                (total: number, product: CartProduct) => {
                    const configuredTotal = (
                        product.configuredItems || []
                    ).reduce(
                        (subTotal, item) =>
                            subTotal + item.product.price * item.quantity,
                        0
                    );
                    return total + product.price + configuredTotal;
                },
                0
            );
        },
        getVatPrice: (
            delivery?: boolean,
            countryCode = "nl",
            vatNumber?: string,
            hasCompany = false
        ) => {
            const currentProducts = get().products;
            const vatRate = getVatRate(countryCode, { vatNumber, hasCompany });

            const productVat = currentProducts.reduce(
                (total: number, product: CartProduct) => {
                    const configuredTotal = (
                        product.configuredItems || []
                    ).reduce(
                        (subTotal, item) =>
                            subTotal + item.product.price * item.quantity,
                        0
                    );
                    const lineTotal = product.price + configuredTotal;
                    return total + lineTotal * vatRate;
                },
                0
            );

            const shippingVat = delivery
                ? get().getShippingCost(countryCode) * vatRate
                : 0;

            return productVat + shippingVat;
        },
        getShippingCost: (countryCode = "nl") => {
            const currentProducts = get().products;
            const grouped = get().getGroupedProducts();

            return calculateShippingCost(
                grouped.map((item) => ({
                    categoryId: item.product.categoryId,
                    quantity: item.quantity,
                })),
                countryCode
            );
        },
        getGroupedProducts: () => {
            const currentProducts = get().products;
            const groupedProducts: {
                [key: string]: {
                    product: CartProduct;
                    quantity: number;
                };
            } = {};

            currentProducts.forEach((product: CartProduct) => {
                const key = `${product.id}-${
                    product.configSignature ?? "base"
                }`;
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
};

const useCart = hasCookieConsent()
    ? create<CartState>()(
          persist(storeConfig, {
              name: "cart-storage",
          })
      )
    : create<CartState>()(storeConfig as StateCreator<CartState, [], []>);

export default useCart;
