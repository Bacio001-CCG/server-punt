import Image from "next/image";
import Link from "next/link";

export default function Card({
    name,
    image,
    href,
    price,
}: {
    name: string;
    image: string;
    href: string;
    price?: string;
}) {
    return (
        <Link
            className="
                    group relative flex flex-col space-y-4 overflow-hidden
                    rounded-2xl border bg-card shadow transition-all
                    duration-300
                    hover:shadow-lg
                  "
            href={href}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 border-b border-gray-100/50">
                <Image
                    height={400}
                    width={400}
                    alt={name}
                    src={image}
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
                    <p className="text-sm text-muted-foreground">
                        €{price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} excl. BTW
                    </p>
                )}
            </div>
        </Link>
    );
}
