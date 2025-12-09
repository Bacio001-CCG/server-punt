import Hero from "./components/hero";
import Products from "./components/products";
import Categories from "./components/categories";
import Featured from "./components/featured";
//relivator.com/
export default function Home() {
    return (
        <main className="flex flex-col gap-y-8">
            <div>
                <Hero />
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>
            {/* <Categories /> */}

            <Featured />
            <Products />
        </main>
    );
}
