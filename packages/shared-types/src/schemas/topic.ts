import { z } from 'zod';

export const MultiLangStringSchema = z.object({
  en: z.string().min(1, 'English text is required'),
  am: z.string().min(1, 'Amharic text is required'),
});
export type MultiLangString = z.infer<typeof MultiLangStringSchema>;

export const TopicSlugSchema = z.object({
  en: z
    .string()
    .min(1, 'English slug is required')
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'English slug must be lower-case and URL-safe'),
  am: z
    .string()
    .min(1, 'Amharic slug is required')
    .toLowerCase()
    .regex(/^[a-z0-9\-]+$/, 'Amharic slug must be valid URL-safe identifier'),
});
export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const TopicSchema = z.object({
  _id: z.string().optional(),
  name: MultiLangStringSchema,
  slug: TopicSlugSchema,
  parentTopicId: z.string().nullable().optional(),
  description: MultiLangStringSchema.nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Topic = z.infer<typeof TopicSchema>;

export const CreateTopicInputSchema = z.object({
  name: MultiLangStringSchema,
  slug: TopicSlugSchema.optional(), // Auto-generated if omitted
  parentTopicId: z.string().nullable().optional(),
  description: MultiLangStringSchema.nullable().optional(),
});

export type CreateTopicInput = z.infer<typeof CreateTopicInputSchema>;
