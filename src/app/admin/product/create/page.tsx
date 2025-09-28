"use client";

import { useState } from "react";

export default function Product() {
    const [files, setFiles] = useState<FileList | null>(null);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const fileInput = form.elements.namedItem("file") as HTMLInputElement;
        setFiles((prev) => (prev ? new DataTransfer().files : fileInput.files));
    }

    return (
        <div
            className="
    container mx-auto max-w-7xl px-4
    sm:px-6
    lg:px-8
    "
        >
            <form className="flex gap-5" onSubmit={handleSubmit}>
                <input type="file" />
                <button type="submit">add</button>
            </form>
        </div>
    );
}
