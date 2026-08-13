"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateArticleTranslationInputSchema = exports.ArticleTranslationSchema = exports.VersionHistoryItemSchema = exports.ArticleSeoSchema = exports.ArticleStatusSchema = exports.ArticleLanguageSchema = void 0;
const zod_1 = require("zod");
const tiptap_nodes_js_1 = require("./tiptap-nodes.js");
exports.ArticleLanguageSchema = zod_1.z.enum(['en', 'am']);
exports.ArticleStatusSchema = zod_1.z.enum([
    'draft',
    'in_review',
    'changes_requested',
    'published',
    'archived',
]);
exports.ArticleSeoSchema = zod_1.z.object({
    metaTitle: zod_1.z.string().default(''),
    metaDescription: zod_1.z.string().default(''),
});
exports.VersionHistoryItemSchema = zod_1.z.object({
    editorId: zod_1.z.string(),
    timestamp: zod_1.z.coerce.date(),
    summary: zod_1.z.string(),
});
exports.ArticleTranslationSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    articleId: zod_1.z.string().min(1, 'Article ID is required'),
    language: exports.ArticleLanguageSchema,
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
    slug: zod_1.z
        .string()
        .min(1, 'Slug is required')
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case and URL-safe'),
    content: tiptap_nodes_js_1.TipTapDocumentSchema,
    status: exports.ArticleStatusSchema.default('draft'),
    reviewNotes: zod_1.z.string().nullable().optional(),
    seo: exports.ArticleSeoSchema.nullable().optional(),
    publishedAt: zod_1.z.coerce.date().nullable().optional(),
    authorId: zod_1.z.string().min(1, 'Author ID is required'),
    versionHistory: zod_1.z.array(exports.VersionHistoryItemSchema).default([]),
    createdAt: zod_1.z.coerce.date().optional(),
    updatedAt: zod_1.z.coerce.date().optional(),
});
exports.CreateArticleTranslationInputSchema = zod_1.z.object({
    articleId: zod_1.z.string().min(1, 'Article ID is required'),
    language: exports.ArticleLanguageSchema,
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
    slug: zod_1.z.string().optional(), // Auto-generated if omitted
    content: tiptap_nodes_js_1.TipTapDocumentSchema,
    status: exports.ArticleStatusSchema.default('draft'),
    reviewNotes: zod_1.z.string().nullable().optional(),
    seo: exports.ArticleSeoSchema.nullable().optional(),
    authorId: zod_1.z.string().min(1, 'Author ID is required'),
});
