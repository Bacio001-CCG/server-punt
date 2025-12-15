import Body from "@/app/components/product/body";
import { getCategories } from "@/lib/categories";
import { getProduct, getProductLinkedItems } from "@/lib/products";

export default async function Product({
    params,
}: {
    params: Promise<{ productId: string }>;
}) {
    const productId = (await params).productId;
    const product = await getProduct(parseInt(productId));
    const linkedProducts = await getProductLinkedItems(parseInt(productId));
    const categories = await getCategories();

    if (!product) {
        return <div>Product niet gevonden.</div>;
    }

    return (
        <Body
            product={product}
            categories={categories}
            linkedProducts={linkedProducts}
        />
    );
}
