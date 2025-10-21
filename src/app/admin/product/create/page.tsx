import CreateForm from "@/app/components/createForm";
import { getCategories } from "@/lib/categories";

export default async function Create() {
    const categories = (await getCategories()) || [];

    return <CreateForm categories={categories} />;
}
