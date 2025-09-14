import Hero from "./components/hero";
import Featured from "./components/featured";
import Products from "./components/products";
import Categories from "./components/categories";
//relivator.com/
export default function Home() {
    return (
        <main className="flex flex-col gap-y-16">
            <div>
                <Hero />
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>
            <Categories />

            {/* <Featured /> */}
            <Products />
        </main>
    );
}
