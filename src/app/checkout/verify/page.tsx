"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrderStatus } from "@/lib/orders";

export default function Verify() {
    const [status, setStatus] = useState<
        "loading" | "success" | "error" | "cancelled"
    >("loading");
    const [message, setMessage] = useState("Betaling wordt geverifieerd...");
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const orderId = searchParams.get("order");

        if (!orderId) {
            setStatus("error");
            setMessage("Geen bestellingsinformatie gevonden.");
            return;
        }

        const checkPaymentStatus = async () => {
            try {
                const orderStatus = await getOrderStatus(parseInt(orderId));

                if (orderStatus === "paid" || orderStatus === "finished") {
                    router.push("/checkout/success");
                } else if (orderStatus === "cancelled") {
                    setStatus("cancelled");
                    setMessage("De betaling is geannuleerd.");
                }
                // If status is "pending" or "open", continue polling
            } catch (error) {
                console.error("Error checking order status:", error);
                setStatus("error");
                setMessage(
                    "Er is een fout opgetreden bij het verifiëren van de betaling."
                );
            }
        };

        // Initial check
        checkPaymentStatus();

        // Poll every second
        const interval = setInterval(checkPaymentStatus, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [searchParams, router]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center gap-3 min-h-[600px]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <h1 className="text-2xl font-bold text-center">{message}</h1>
                <p className="text-lg text-gray-500 text-center max-w-1/3">
                    Ga verder in het geopende betalingsvenster om uw betaling te
                    voltooien, of bekijk uw email voor uw factuur.
                </p>
            </div>
        );
    }

    if (status === "cancelled") {
        return (
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-yellow-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold">Betaling geannuleerd</h1>
                </div>
                <p className="text-lg text-gray-500">{message}</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
                >
                    Terug naar home
                </button>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold">Fout opgetreden</h1>
                </div>
                <p className="text-lg text-gray-500">{message}</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
                >
                    Terug naar home
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-4xl font-bold">Bestelling ontvangen!</h1>
            </div>
            <p className="text-lg text-gray-500">
                Bedankt voor uw bestelling! We hebben uw bestelling succesvol
                ontvangen en zullen deze zo snel mogelijk verwerken.
            </p>
            <button
                onClick={() => router.push("/")}
                className="mt-4 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors w-fit"
            >
                Terug naar home
            </button>
        </div>
    );
}
