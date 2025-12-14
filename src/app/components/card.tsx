import Image from "next/image";
import Link from "next/link";

export default function Card({
    name,
    image,
    href,
    price,
    stock,
}: {
    name: string;
    image: string;
    href: string;
    price?: string;
    stock?: number;
}) {
    const priceExclVAT = parseFloat(price ?? "0").toFixed(2); // Use 1 decimal place
    const priceInclVAT = (parseFloat(price ?? "0") * 1.21).toFixed(2); // Use 1 decimal place

    return (
        <Link
            className="
                    group relative flex flex-col space-y-4 overflow-hidden
                    rounded-2xl transition-all
                    duration-300
                  "
            href={href}
        >
            <div className="relative aspect-[4/3] overflow-hidden ">
                <Image
                    height={200}
                    width={200}
                    alt={name}
                    src={image ?? "/placeholder.png"}
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    className="
                        object-cover transition duration-300
                        group-hover:scale-105
                      "
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        color: "transparent",
                    }}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
            </div>
            <div className="relative z-20 -mt-6 p-4">
                <div
                    className={`${
                        !price && "text-center"
                    } mb-1 text-lg font-medium`}
                >
                    {name}
                </div>
                {price && (
                    <div className="text-sm text-muted-foreground">
                        <p className="text-base text-black">
                            €{priceExclVAT.replace(".", ",")} Excl. BTW
                        </p>
                        <p>€{priceInclVAT.replace(".", ",")} Incl. BTW</p>
                        <p>{stock}x in vooraad</p>
                    </div>
                )}
            </div>
        </Link>
    );
}
