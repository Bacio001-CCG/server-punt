"use server";
import { db } from "@/database/connect";
import { brandsTable, SelectBrand } from "@/database/schema";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { AuditLogAction, UserPermission } from "@/enums";

export async function getBrands(): Promise<SelectBrand[]> {
    const brands = await db.select().from(brandsTable);
    return brands;
}
