"use server";

import { requireAdmin } from "@/features/admin/auth";
import { extractListingFromUrl, ImportUrlError, type ImportedListingDraft } from "@/lib/import/import-url";

export type { ImportedListingDraft };

export type ImportActionState = {
  status: "idle" | "success" | "error";
  error: string | null;
  result?: ImportedListingDraft;
};

export async function importListingFromUrl(
  _prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requireAdmin();

  const rawUrl = formData.get("import_url");
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return { status: "error", error: "Paste a URL to import." };
  }

  try {
    const result = await extractListingFromUrl(rawUrl);
    return { status: "success", error: null, result };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof ImportUrlError ? err.message : "Could not import that page.",
    };
  }
}
