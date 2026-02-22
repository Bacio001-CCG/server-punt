import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

export default function Card({
    name,
    image,
    href,
    price,
    stock,
    createdAt,
    refurbished,
}: {
    name: string;
    image: string;
    href: string;
    price?: string;
    stock?: number;
    createdAt?: Date;
    refurbished?: boolean;
}) {
    const priceExclVAT = parseFloat(price ?? "0").toFixed(2); // Use 1 decimal place
    const priceInclVAT = (parseFloat(price ?? "0") * 1.21).toFixed(2); // Use 1 decimal place
    const createdDate = createdAt ? new Date(createdAt) : null;
    const isNew =
        !!createdDate &&
        !Number.isNaN(createdDate.getTime()) &&
        Date.now() - createdDate.getTime() < 10 * 24 * 60 * 60 * 1000;

    if (isNew) {
        console.log(`Product ${name} is new! Created at: ${createdDate}`);
    }

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
                <div className="absolute left-2 top-2 flex flex-col gap-2">
                    {isNew && (
                        <span className="relative inline-flex group/badge">
                            <Badge
                                variant={"outline"}
                                className=" bg-green-200 w-fit border-green-600 text-green-600 font-semibold z-30 text-[10px] uppercase tracking-wide"
                            >
                                Net binnen
                            </Badge>
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/badge:opacity-100"
                            >
                                Nieuw op de site
                            </span>
                        </span>
                    )}
                    {!refurbished && (
                        <span className="relative inline-flex group/badge">
                            <Badge
                                variant={"outline"}
                                className=" bg-blue-200 border-blue-600 text-blue-600 font-semibold z-30 text-[10px] uppercase tracking-wide"
                            >
                                Gloednieuw
                            </Badge>
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/badge:opacity-100"
                            >
                                Niet refurbished
                            </span>
                        </span>
                    )}
                </div>

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
                    className={`${!price && "text-center"
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
                        <p className="text-green-700">{stock}x in vooraad</p>
                    </div>
                )}
            </div>
        </Link>
    );
}
