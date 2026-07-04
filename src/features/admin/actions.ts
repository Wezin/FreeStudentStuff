"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { adminLoginSchema } from "./schema";
import { clearAdminSession, createAdminSession } from "./auth";

export type AdminLoginState = {
  error: string | null;
};

/**
 * Keyed hash (HMAC) rather than a raw string compare so that verification
 * never leaks timing information about the password, and rather than a
 * plain digest so the comparison is bound to a server-only secret.
 */
function hashPassword(value: string, secret: string): Buffer {
  return crypto.createHmac("sha256", secret).update(value).digest();
}

export async function loginAdmin(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: "Password is required." };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_PASSWORD_SECRET;
  if (!adminPassword || !secret) {
    return { error: "Admin login is not configured yet." };
  }

  const inputHash = hashPassword(parsed.data.password, secret);
  const expectedHash = hashPassword(adminPassword, secret);

  const isValid =
    inputHash.length === expectedHash.length &&
    crypto.timingSafeEqual(inputHash, expectedHash);

  if (!isValid) {
    return { error: "Incorrect password." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
