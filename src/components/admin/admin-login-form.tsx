"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { loginAdmin, type AdminLoginState } from "@/features/admin/actions";

const initialState: AdminLoginState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Admin password</Label>
        <Input id="password" name="password" type="password" required autoFocus />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
