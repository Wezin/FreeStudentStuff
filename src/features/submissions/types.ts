export type SubmissionStatus = "pending" | "reviewed" | "approved" | "rejected";

export type Submission = {
  id: string;
  email: string | null;
  description: string;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
};
