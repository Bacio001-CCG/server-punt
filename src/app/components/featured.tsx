import Card from "./card";

const products = [
    {
        name: "Server 1",
        image: "/server_1.png",
        href: "/product/1",
    },
    {
        name: "Server 2",
        image: "/server_2.png",
        href: "/product/1",
    },
    {
        name: "Server 3",
        image: "/server_3.png",
        href: "/product/1",
    },
    {
        name: "Server 4",
        image: "/server_4.png",
        href: "/product/1",
    },
];

export default function Featured() {
    return (
        <section
            id="featured"
            className="
            py-12
            md:py-16
          "
        >
            <div
                className="
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            "
            >
                <div className="mb-8 flex flex-col items-center text-center">
                    <h2
                        className="
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                "
                    >
                        Meest Verkocht
                    </h2>
                    <div className="mt-2 h-1 w-12 rounded-full bg-primary"></div>
                    <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                        Onze best verkochte servers, gekozen door onze klanten
                        vanwege hun betrouwbaarheid en prestaties.
                    </p>
                </div>
                <div
                    className="
                grid grid-cols-3 gap-4
                md:grid-cols-5 md:gap-6
              "
                >
                    {products.map((product) => (
                        <Card
                            key={product.name}
                            name={product.name}
                            image={product.image}
                            href={product.href}
                            price={"80,00"}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
