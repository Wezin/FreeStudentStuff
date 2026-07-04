import { z } from "zod";

export const submissionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Tell us a bit more — at least 10 characters."),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) => v === null || z.string().email().safeParse(v).success,
      "Enter a valid email address",
    ),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const submissionStatusSchema = z.enum([
  "pending",
  "reviewed",
  "approved",
  "rejected",
]);
