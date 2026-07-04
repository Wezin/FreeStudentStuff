"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submissionSchema, submissionStatusSchema } from "./schema";
import type { SubmissionStatus } from "./types";

export type SubmitListingState = {
  status: "idle" | "success" | "error";
  error: string | null;
  fieldErrors?: Record<string, string>;
};

export async function submitListingIdea(
  _prevState: SubmitListingState,
  formData: FormData,
): Promise<SubmitListingState> {
  const parsed = submissionSchema.safeParse({
    description: formData.get("description"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", error: "Please fix the highlighted fields.", fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("submissions").insert(parsed.data);

  if (error) {
    return { status: "error", error: "Something went wrong. Please try again." };
  }

  return { status: "success", error: null };
}

export async function setSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
  await requireAdmin();
  submissionStatusSchema.parse(status);

  const supabase = createAdminClient();
  const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteSubmission(id: string): Promise<void> {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from("submissions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
