import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassSurfaceProps = {
  children: ReactNode;
  className?: string;
  cornerRadius?: number;
  padding?: string;
  onClick?: () => void;
  /** "chrome" adapts to the light/dark theme (header, pills, modal chrome).
   *  "dark" stays a constant dark glass for use over photographic media,
   *  where legibility shouldn't depend on the site theme. */
  tone?: "chrome" | "dark";
};

/**
 * CSS-only glassmorphism surface (backdrop-blur + translucent border).
 * We previously used the `liquid-glass-react` package here, but its
 * displacement-filter DOM wrapper broke ancestor flex/absolute layout
 * (header collapsing to content width, hero overlay detaching from the
 * bottom edge, category pills overflowing the viewport) and left stray
 * unstyled elements in the tree. This keeps the same glass look reliably.
 */
export function GlassSurface({
  children,
  className,
  cornerRadius = 999,
  padding = "0",
  onClick,
  tone = "chrome",
}: GlassSurfaceProps) {
  const style: CSSProperties = { borderRadius: cornerRadius, padding };

  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "backdrop-blur-xl backdrop-saturate-150 shadow-lg",
        tone === "chrome"
          ? "border border-border bg-background/70 shadow-black/10 dark:shadow-black/30"
          : "border border-white/15 bg-white/10 shadow-black/30",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}
