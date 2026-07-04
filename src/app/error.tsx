"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong.</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load Free Plug right now. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
