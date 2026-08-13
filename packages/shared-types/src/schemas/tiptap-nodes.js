"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipTapDocumentSchema = exports.TipTapNodeSchema = exports.CalloutVariantSchema = exports.FootnoteNodeSchema = exports.InlineImageNodeSchema = exports.EvidenceImageNodeSchema = exports.ImageAssetSchema = exports.CitationSchema = exports.BibleVerseNodeSchema = exports.HadithNodeSchema = exports.QuranVerseNodeSchema = exports.TextNodeSchema = exports.MarkSchema = exports.GenericMarkSchema = exports.LinkMarkSchema = void 0;
const zod_1 = require("zod");
exports.LinkMarkSchema = zod_1.z.object({
    type: zod_1.z.literal('link'),
    targetArticleId: zod_1.z.string().min(1, 'Target article ID is required'),
});
exports.GenericMarkSchema = zod_1.z.object({
    type: zod_1.z.string(),
}).passthrough();
exports.MarkSchema = zod_1.z.union([exports.LinkMarkSchema, exports.GenericMarkSchema]);
exports.TextNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('text'),
    text: zod_1.z.string(),
    marks: zod_1.z.array(exports.MarkSchema).optional(),
});
exports.QuranVerseNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('quranVerse'),
    surah: zod_1.z.number().int().min(1).max(114),
    ayah: zod_1.z.number().int().min(1),
    arabicText: zod_1.z.string().min(1),
    translation: zod_1.z.string().min(1),
    translationSource: zod_1.z.string().min(1),
});
exports.HadithNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('hadith'),
    text: zod_1.z.string().min(1),
    narrator: zod_1.z.string().min(1),
    source: zod_1.z.string().min(1),
    grade: zod_1.z.string().min(1),
});
exports.BibleVerseNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('bibleVerse'),
    book: zod_1.z.string().min(1),
    chapter: zod_1.z.number().int().min(1),
    verse: zod_1.z.string().min(1),
    translationVersion: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1),
});
exports.CitationSchema = zod_1.z.object({
    sourceType: zod_1.z.enum(['book', 'journal', 'website', 'other']),
    title: zod_1.z.string().min(1),
    author: zod_1.z.string().min(1),
    publisher: zod_1.z.string().min(1),
    year: zod_1.z.number().int(),
    page: zod_1.z.number().int().nullable().optional(),
    url: zod_1.z.string().url().nullable().optional().or(zod_1.z.literal('')),
});
exports.ImageAssetSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    alt: zod_1.z.string(),
});
exports.EvidenceImageNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('evidenceImage'),
    primaryImage: exports.ImageAssetSchema,
    secondaryImage: exports.ImageAssetSchema.nullable().optional(),
    caption: zod_1.z.string(),
    citation: exports.CitationSchema,
});
exports.InlineImageNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('inlineImage'),
    url: zod_1.z.string().url(),
    caption: zod_1.z.string(),
    altEn: zod_1.z.string(),
    altAm: zod_1.z.string(),
    alignment: zod_1.z.enum(['left', 'center', 'right', 'full']),
});
exports.FootnoteNodeSchema = zod_1.z.object({
    type: zod_1.z.literal('footnote'),
    citation: exports.CitationSchema,
});
exports.CalloutVariantSchema = zod_1.z.enum(['warning', 'info', 'answer', 'summary', 'claim']);
// Recursive node definition using z.lazy
exports.TipTapNodeSchema = zod_1.z.lazy(() => zod_1.z.union([
    exports.TextNodeSchema,
    exports.QuranVerseNodeSchema,
    exports.HadithNodeSchema,
    exports.BibleVerseNodeSchema,
    exports.EvidenceImageNodeSchema,
    exports.InlineImageNodeSchema,
    exports.FootnoteNodeSchema,
    // Callout node
    zod_1.z.object({
        type: zod_1.z.literal('callout'),
        variant: exports.CalloutVariantSchema,
        content: exports.TipTapDocumentSchema,
    }),
    // Standard Heading node
    zod_1.z.object({
        type: zod_1.z.literal('heading'),
        attrs: zod_1.z.object({ level: zod_1.z.number().int().min(1).max(6) }).optional(),
        content: zod_1.z.array(exports.TipTapNodeSchema).optional(),
    }),
    // Standard Paragraph node
    zod_1.z.object({
        type: zod_1.z.literal('paragraph'),
        content: zod_1.z.array(exports.TipTapNodeSchema).optional(),
    }),
    // Standard List & Item nodes
    zod_1.z.object({
        type: zod_1.z.enum(['bulletList', 'orderedList']),
        content: zod_1.z.array(exports.TipTapNodeSchema).optional(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('listItem'),
        content: zod_1.z.array(exports.TipTapNodeSchema).optional(),
    }),
    // Standard Blockquote node
    zod_1.z.object({
        type: zod_1.z.literal('blockquote'),
        content: zod_1.z.array(exports.TipTapNodeSchema).optional(),
    }),
    // Standard Table nodes
    zod_1.z.object({
        type: zod_1.z.enum(['table', 'tableRow', 'tableHeader', 'tableCell']),
        content: zod_1.z.array(exports.TipTapNodeSchema).optional(),
        attrs: zod_1.z.record(zod_1.z.any()).optional(),
    }),
]));
exports.TipTapDocumentSchema = zod_1.z.object({
    type: zod_1.z.literal('doc'),
    content: zod_1.z.array(exports.TipTapNodeSchema).optional().default([]),
});
