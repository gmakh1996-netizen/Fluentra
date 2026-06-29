import { z } from "zod";

/** Zod schemas for the vocabulary feature. Shared by API routes (validation)
 *  and the client (form types). One schema, one source of truth. */
export const createVocabularyItemSchema = z.object({
  term: z.string().min(1).max(200),
  translation: z.string().min(1).max(200),
  example: z.string().max(500).optional(),
  targetLanguageId: z.string().uuid(),
  category: z.string().max(60).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});
export type CreateVocabularyItem = z.infer<typeof createVocabularyItemSchema>;

/** SM-2 review grade: 0 (forgot) – 5 (perfect recall). */
export const reviewGradeSchema = z.object({
  itemId: z.string().uuid(),
  grade: z.number().int().min(0).max(5),
});
export type ReviewGrade = z.infer<typeof reviewGradeSchema>;
