import { z } from 'zod';

export const ArticleTypeSchema = z.enum(['shubha', 'term', 'general']);
export type ArticleType = z.infer<typeof ArticleTypeSchema>;

export const ArticleAuthorSchema = z.object({
  userId: z.string().min(1, 'Author user ID is required'),
  role: z.string().default('author'),
});

export const ArticleCoverImageSchema = z.object({
  url: z.string().url('Cover image URL must be a valid URL'),
  alt: z.string().default(''),
});

export const ArticleSchema = z
  .object({
    _id: z.string().optional(),
    topicId: z.string().min(1, 'Topic ID is required'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    authors: z
      .array(ArticleAuthorSchema)
      .min(1, 'At least one author is required'),
    coverImage: ArticleCoverImageSchema.nullable().optional(),
    articleType: ArticleTypeSchema,
    nextRelatedShubha: z.string().nullable().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.articleType !== 'shubha' && data.nextRelatedShubha != null) {
        return false;
      }
      return true;
    },
    {
      message: 'nextRelatedShubha can only be set when articleType is "shubha"',
      path: ['nextRelatedShubha'],
    }
  );

export type Article = z.infer<typeof ArticleSchema>;

export const CreateArticleInputSchema = z
  .object({
    topicId: z.string().min(1, 'Topic ID is required'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    authors: z
      .array(ArticleAuthorSchema)
      .min(1, 'At least one author is required'),
    coverImage: ArticleCoverImageSchema.nullable().optional(),
    articleType: ArticleTypeSchema,
    nextRelatedShubha: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.articleType !== 'shubha' && data.nextRelatedShubha != null) {
        return false;
      }
      return true;
    },
    {
      message: 'nextRelatedShubha can only be set when articleType is "shubha"',
      path: ['nextRelatedShubha'],
    }
  );

export type CreateArticleInput = z.infer<typeof CreateArticleInputSchema>;
