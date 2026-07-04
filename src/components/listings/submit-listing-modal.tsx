"use client";

import { useActionState, useState, type ReactNode } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitListingIdea, type SubmitListingState } from "@/features/submissions/actions";

const initialState: SubmitListingState = { status: "idle", error: null };

type SubmitListingModalProps = {
  trigger: ReactNode;
};

export function SubmitListingModal({ trigger }: SubmitListingModalProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, isPending] = useActionState(submitListingIdea, initialState);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setFormKey((k) => k + 1);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-border bg-popover sm:max-w-md">
        {state.status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle weight="fill" className="size-10 text-primary" />
            <p className="font-medium text-foreground">Thanks for the tip!</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll take a look and add it to the board if it&apos;s a fit.
            </p>
            <button
              type="button"
              onClick={() => setFormKey((k) => k + 1)}
              className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form key={formKey} action={formAction} className="space-y-4">
            <DialogHeader className="text-left">
              <DialogTitle>Submit a freebie/event</DialogTitle>
              <DialogDescription>
                Know about a free event, student deal, free food drop,
                scholarship, hackathon, club thing, or student opportunity?
                Drop the details here. Include a link if you have one.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="submission-description">Details</Label>
              <Textarea
                id="submission-description"
                name="description"
                required
                minLength={10}
                rows={4}
                placeholder="What's the deal, event, or opportunity?"
              />
              {state.fieldErrors?.description && (
                <p className="text-xs text-destructive">{state.fieldErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="submission-email">Email (optional)</Label>
              <Input id="submission-email" name="email" type="email" placeholder="you@example.com" />
              <p className="text-xs text-muted-foreground">
                Optional — only include this if you want us to follow up.
              </p>
              {state.fieldErrors?.email && (
                <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
              )}
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
