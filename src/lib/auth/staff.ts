import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";

export async function getStaffByEmail(email: string) {
  const rows = await db
    .select({
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      expertSlug: staff.expertSlug,
    })
    .from(staff)
    .where(eq(staff.email, email.toLowerCase()));
  return rows[0] ?? null;
}

export async function isStaffEmail(email: string): Promise<boolean> {
  return (await getStaffByEmail(email)) !== null;
}
