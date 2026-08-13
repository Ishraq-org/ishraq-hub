import { z } from 'zod';

export const LinkMarkSchema = z.object({
  type: z.literal('link'),
  targetArticleId: z.string().min(1, 'Target article ID is required'),
});
export type LinkMark = z.infer<typeof LinkMarkSchema>;

export const GenericMarkSchema = z.object({
  type: z.string(),
}).passthrough();

export const MarkSchema = z.union([LinkMarkSchema, GenericMarkSchema]);

export const TextNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(MarkSchema).optional(),
});
export type TextNode = z.infer<typeof TextNodeSchema>;

export const QuranVerseNodeSchema = z.object({
  type: z.literal('quranVerse'),
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1),
  arabicText: z.string().min(1),
  translation: z.string().min(1),
  translationSource: z.string().min(1),
});
export type QuranVerseNode = z.infer<typeof QuranVerseNodeSchema>;

export const HadithNodeSchema = z.object({
  type: z.literal('hadith'),
  text: z.string().min(1),
  narrator: z.string().min(1),
  source: z.string().min(1),
  grade: z.string().min(1),
});
export type HadithNode = z.infer<typeof HadithNodeSchema>;

export const BibleVerseNodeSchema = z.object({
  type: z.literal('bibleVerse'),
  book: z.string().min(1),
  chapter: z.number().int().min(1),
  verse: z.string().min(1),
  translationVersion: z.string().min(1),
  text: z.string().min(1),
});
export type BibleVerseNode = z.infer<typeof BibleVerseNodeSchema>;

export const CitationSchema = z.object({
  sourceType: z.enum(['book', 'journal', 'website', 'other']),
  title: z.string().min(1),
  author: z.string().min(1),
  publisher: z.string().min(1),
  year: z.number().int(),
  page: z.number().int().nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal('')),
});
export type Citation = z.infer<typeof CitationSchema>;

export const ImageAssetSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
});

export const EvidenceImageNodeSchema = z.object({
  type: z.literal('evidenceImage'),
  primaryImage: ImageAssetSchema,
  secondaryImage: ImageAssetSchema.nullable().optional(),
  caption: z.string(),
  citation: CitationSchema,
});
export type EvidenceImageNode = z.infer<typeof EvidenceImageNodeSchema>;

export const InlineImageNodeSchema = z.object({
  type: z.literal('inlineImage'),
  url: z.string().url(),
  caption: z.string(),
  altEn: z.string(),
  altAm: z.string(),
  alignment: z.enum(['left', 'center', 'right', 'full']),
});
export type InlineImageNode = z.infer<typeof InlineImageNodeSchema>;

export const FootnoteNodeSchema = z.object({
  type: z.literal('footnote'),
  citation: CitationSchema,
});
export type FootnoteNode = z.infer<typeof FootnoteNodeSchema>;

export const CalloutVariantSchema = z.enum(['warning', 'info', 'answer', 'summary', 'claim']);
export type CalloutVariant = z.infer<typeof CalloutVariantSchema>;

// Recursive node definition using z.lazy
export const TipTapNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    TextNodeSchema,
    QuranVerseNodeSchema,
    HadithNodeSchema,
    BibleVerseNodeSchema,
    EvidenceImageNodeSchema,
    InlineImageNodeSchema,
    FootnoteNodeSchema,
    // Callout node
    z.object({
      type: z.literal('callout'),
      variant: CalloutVariantSchema,
      content: TipTapDocumentSchema,
    }),
    // Standard Heading node
    z.object({
      type: z.literal('heading'),
      attrs: z.object({ level: z.number().int().min(1).max(6) }).optional(),
      content: z.array(TipTapNodeSchema).optional(),
    }),
    // Standard Paragraph node
    z.object({
      type: z.literal('paragraph'),
      content: z.array(TipTapNodeSchema).optional(),
    }),
    // Standard List & Item nodes
    z.object({
      type: z.enum(['bulletList', 'orderedList']),
      content: z.array(TipTapNodeSchema).optional(),
    }),
    z.object({
      type: z.literal('listItem'),
      content: z.array(TipTapNodeSchema).optional(),
    }),
    // Standard Blockquote node
    z.object({
      type: z.literal('blockquote'),
      content: z.array(TipTapNodeSchema).optional(),
    }),
    // Standard Table nodes
    z.object({
      type: z.enum(['table', 'tableRow', 'tableHeader', 'tableCell']),
      content: z.array(TipTapNodeSchema).optional(),
      attrs: z.record(z.any()).optional(),
    }),
  ])
);

export const TipTapDocumentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(TipTapNodeSchema).optional().default([]),
});

export type TipTapDocument = z.infer<typeof TipTapDocumentSchema>;
