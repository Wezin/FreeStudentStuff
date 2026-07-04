"use client";

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TooltipButtonProps = {
  label: string;
  children: ReactNode;
};

/**
 * Wraps an icon-only trigger (button, link) with a hover tooltip label.
 *
 * The child must be a plain element (button, a, span) — not another Radix
 * primitive that sets its own `data-state` (Switch, Sheet/DialogTrigger,
 * etc). `asChild` merging lets this component's own data-state win over
 * the child's, silently breaking any styling keyed off the child's state.
 * If you need to wrap one, put a neutral `<span className="contents">`
 * between them to stop the prop merge at that boundary.
 */
export function TooltipButton({ label, children }: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
