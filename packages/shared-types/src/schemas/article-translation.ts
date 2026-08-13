import { z } from 'zod';
import { TipTapDocumentSchema } from './tiptap-nodes.js';

export const ArticleLanguageSchema = z.enum(['en', 'am']);
export type ArticleLanguage = z.infer<typeof ArticleLanguageSchema>;

export const ArticleStatusSchema = z.enum([
  'draft',
  'in_review',
  'changes_requested',
  'published',
  'archived',
]);
export type ArticleStatus = z.infer<typeof ArticleStatusSchema>;

export const ArticleSeoSchema = z.object({
  metaTitle: z.string().default(''),
  metaDescription: z.string().default(''),
});
export type ArticleSeo = z.infer<typeof ArticleSeoSchema>;

export const VersionHistoryItemSchema = z.object({
  editorId: z.string(),
  timestamp: z.coerce.date(),
  summary: z.string(),
});
export type VersionHistoryItem = z.infer<typeof VersionHistoryItemSchema>;

export const ArticleTranslationSchema = z.object({
  _id: z.string().optional(),
  articleId: z.string().min(1, 'Article ID is required'),
  language: ArticleLanguageSchema,
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case and URL-safe'),
  content: TipTapDocumentSchema,
  status: ArticleStatusSchema.default('draft'),
  reviewNotes: z.string().nullable().optional(),
  seo: ArticleSeoSchema.nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  authorId: z.string().min(1, 'Author ID is required'),
  versionHistory: z.array(VersionHistoryItemSchema).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type ArticleTranslation = z.infer<typeof ArticleTranslationSchema>;

export const CreateArticleTranslationInputSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
  language: ArticleLanguageSchema,
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(), // Auto-generated if omitted
  content: TipTapDocumentSchema,
  status: ArticleStatusSchema.default('draft'),
  reviewNotes: z.string().nullable().optional(),
  seo: ArticleSeoSchema.nullable().optional(),
  authorId: z.string().min(1, 'Author ID is required'),
});

export type CreateArticleTranslationInput = z.infer<
  typeof CreateArticleTranslationInputSchema
>;
