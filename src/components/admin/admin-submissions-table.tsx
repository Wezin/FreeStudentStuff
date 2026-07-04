"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, Eye, TrashSimple, XCircle } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { SortableTableHead, type SortDirection } from "./sortable-table-head";
import { deleteSubmission, setSubmissionStatus } from "@/features/submissions/actions";
import { formatListingDate } from "@/features/listings/utils";
import type { Submission, SubmissionStatus } from "@/features/submissions/types";
import { cn } from "@/lib/utils";

type AdminSubmissionsTableProps = {
  submissions: Submission[];
};

const STATUS_VARIANT: Record<SubmissionStatus, string> = {
  pending: "bg-white/10 text-muted-foreground",
  reviewed: "bg-blue-500/20 text-blue-400",
  approved: "bg-primary/20 text-primary",
  rejected: "bg-destructive/20 text-destructive",
};

type SortKey = "email" | "status" | "created_at";

export function AdminSubmissionsTable({ submissions }: AdminSubmissionsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedSubmissions = useMemo(() => {
    if (!sortKey) return submissions;
    const sorted = [...submissions].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "email":
          cmp = (a.email ?? "").localeCompare(b.email ?? "");
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [submissions, sortKey, sortDir]);

  function handleStatus(id: string, status: SubmissionStatus) {
    startTransition(async () => {
      try {
        await setSubmissionStatus(id, status);
        toast.success(`Marked as ${status}.`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update submission.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this submission?")) return;
    startTransition(async () => {
      try {
        await deleteSubmission(id);
        toast.success("Submission deleted.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete submission.");
      }
    });
  }

  if (submissions.length === 0) {
    return <p className="text-sm text-muted-foreground">No submissions yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Description</TableHead>
            <SortableTableHead
              label="Email"
              sortKey="email"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Status"
              sortKey="status"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Submitted"
              sortKey="created_at"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSubmissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="max-w-xs text-sm">{submission.description}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {submission.email ?? "—"}
              </TableCell>
              <TableCell>
                <Badge className={cn("border-none", STATUS_VARIANT[submission.status])}>
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatListingDate(submission.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <TooltipButton label="Mark reviewed">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatus(submission.id, "reviewed")}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                      aria-label="Mark reviewed"
                    >
                      <Eye className="size-4" />
                    </button>
                  </TooltipButton>
                  <TooltipButton label="Approve">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatus(submission.id, "approved")}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                      aria-label="Approve"
                    >
                      <CheckCircle className="size-4" />
                    </button>
                  </TooltipButton>
                  <TooltipButton label="Reject">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatus(submission.id, "rejected")}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Reject"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </TooltipButton>
                  <TooltipButton label="Delete submission">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(submission.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete submission"
                    >
                      <TrashSimple className="size-4" />
                    </button>
                  </TooltipButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
