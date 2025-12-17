import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getBrands } from "@/lib/brands";
import Body from "../components/products/body";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Products({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const categories = params.categories
        ? String(params.categories).split(",")
        : [];
    const brands = params.brands ? String(params.brands).split(",") : [];

    const { products = [] } = (await getProducts()) || { products: [] };
    const catResult = (await getCategories()) || { categories: [] };
    const brandResult = (await getBrands()) || { brands: [] };

    const categoryIds = catResult
        .filter((category) => categories.includes(category.name))
        .map((category) => category.id);

    const brandIds = brandResult
        .filter((brand) => brands.includes(brand.name))
        .map((brand) => brand.id);

    const filteredProducts = products
        .filter((product) => {
            const matchesCategory =
                categoryIds.length === 0 ||
                categoryIds.includes(product.categoryId);
            const matchesBrand =
                brandIds.length === 0 || brandIds.includes(product.brandId!);
            return matchesCategory && matchesBrand;
        })
        .map((product) => ({
            ...product,
            brandId: product.brandId!,
        }));

    return (
        <Body
            filteredProducts={filteredProducts}
            brands={brandResult}
            categories={catResult}
        />
    );
}
