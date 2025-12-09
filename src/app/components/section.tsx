"use client";

import { motion } from "motion/react";

export default function Section({
    children,
    orientation = "left",
    title,
    id,
}: {
    children: React.ReactNode;
    title?: string;
    orientation?: "left" | "right" | "center";
    id?: string;
}) {
    return (
        <section className="px-10 w-full flex flex-col gap-8" id={id}>
            <div className={`flex flex-col w-full `}>
                {title && (
                    <div
                        className={`w-fit ${orientation === "left"
                            ? "items-start mr-auto"
                            : orientation === "right"
                                ? "items-end ml-auto"
                                : "items-center mx-auto"
                            }`}
                    >
                        <h2 className="text-[2.5rem] font-bold">{title}</h2>
                        <motion.hr
                            className={`w-2/3 border-black/40 border-[1.5px] rounded-4xl  ${orientation === "left"
                                ? "items-start mr-auto"
                                : orientation === "right"
                                    ? "items-end ml-auto"
                                    : "items-center mx-auto"
                                }`}
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            style={{
                                transformOrigin:
                                    orientation === "left"
                                        ? "left"
                                        : orientation === "right"
                                            ? "right"
                                            : "center",
                            }}
                        />
                    </div>
                )}
            </div>
            {children}
        </section>
    );
}
