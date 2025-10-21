"use client";

import { SelectCategory } from "@/database/schema";
import { createProduct } from "@/lib/products";

export default function CreateForm({
    categories,
}: {
    categories: SelectCategory[];
}) {
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const result = await createProduct(formData);

            if (result.success) {
                console.log("Product created successfully:", result.product);
                form.reset(); // Reset form on success
            } else {
                console.error("Failed to create product:", result.error);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    return (
        <div
            className="
                py-12
                md:py-16
                container mx-auto max-w-7xl px-4
                sm:px-6
                lg:px-8
            "
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="name">Naam</label>
                    <input
                        type="text"
                        name="name"
                        className="w-full bg-background border border-border rounded-lg p-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="description">Beschrijving</label>
                    <textarea
                        rows={5}
                        name="description"
                        className="w-full bg-background border border-border rounded-lg p-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="category">Categorie</label>
                    <select
                        name="category"
                        className="w-full bg-background border border-border rounded-lg p-2"
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="price">Prijs</label>
                    <input
                        type="number"
                        name="price"
                        className="w-full bg-background border border-border rounded-lg p-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="configuration">Configuratie</label>
                    <textarea
                        rows={5}
                        name="configuration"
                        className="w-full bg-background border border-border rounded-lg p-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="image_url">Hoofd Foto</label>
                    <input
                        type="file"
                        name="image_url"
                        className="w-full bg-background border border-border rounded-lg p-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="images_url">Extra Foto's</label>
                    <input
                        type="file"
                        name="images_url"
                        className="w-full bg-background border border-border rounded-lg p-2"
                        multiple
                    />
                </div>
                <button className="bg-primary text-white p-2 rounded-lg w-fit">
                    Product Aanmaken
                </button>
            </form>
        </div>
    );
}
