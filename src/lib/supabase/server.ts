import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * SSR-safe Supabase client scoped to the anon key. Use for public reads and
 * the submissions insert. Cookie writes are best-effort and silently ignored
 * when called from a Server Component (no session refresh is needed for the
 * anon-only flows this app uses).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render — no-op.
          }
        },
      },
    },
  );
}
