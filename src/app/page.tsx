import Hero from "./components/hero";
import Products from "./components/products";
import Featured from "./components/featured";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
    return (
        <main className="flex flex-col gap-y-8">
            <div>
                <Hero />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            </div>
            {/* <Categories /> */}

            <Featured />
            <Products />
        </main>
    );
}
