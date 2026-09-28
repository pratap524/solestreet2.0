import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Please select at least 1 star").max(5, "Rating cannot exceed 5"),
  title: z.string().min(2, "Review headline is required").max(100, "Title is too long"),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review cannot exceed 1000 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
