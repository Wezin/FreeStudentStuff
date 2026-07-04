import { createAdminClient } from "@/lib/supabase/admin";
import type { Submission } from "./types";

export async function getAdminSubmissions(): Promise<Submission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Submission[];
}

export async function getPendingSubmissionCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}
