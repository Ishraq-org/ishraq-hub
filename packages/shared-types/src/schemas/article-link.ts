import { z } from 'zod';

export const ArticleLinkSchema = z.object({
  _id: z.string().optional(),
  sourceArticleId: z.string().min(1, 'Source article ID is required'),
  targetArticleId: z.string().min(1, 'Target article ID is required'),
  createdAt: z.coerce.date().optional(),
});

export type ArticleLink = z.infer<typeof ArticleLinkSchema>;
