"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateArticleInputSchema = exports.ArticleSchema = exports.ArticleCoverImageSchema = exports.ArticleAuthorSchema = exports.ArticleTypeSchema = void 0;
const zod_1 = require("zod");
exports.ArticleTypeSchema = zod_1.z.enum(['shubha', 'term', 'general']);
exports.ArticleAuthorSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'Author user ID is required'),
    role: zod_1.z.string().default('author'),
});
exports.ArticleCoverImageSchema = zod_1.z.object({
    url: zod_1.z.string().url('Cover image URL must be a valid URL'),
    alt: zod_1.z.string().default(''),
});
exports.ArticleSchema = zod_1.z
    .object({
    _id: zod_1.z.string().optional(),
    topicId: zod_1.z.string().min(1, 'Topic ID is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    authors: zod_1.z
        .array(exports.ArticleAuthorSchema)
        .min(1, 'At least one author is required'),
    coverImage: exports.ArticleCoverImageSchema.nullable().optional(),
    articleType: exports.ArticleTypeSchema,
    nextRelatedShubha: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.coerce.date().optional(),
    updatedAt: zod_1.z.coerce.date().optional(),
})
    .refine((data) => {
    if (data.articleType !== 'shubha' && data.nextRelatedShubha != null) {
        return false;
    }
    return true;
}, {
    message: 'nextRelatedShubha can only be set when articleType is "shubha"',
    path: ['nextRelatedShubha'],
});
exports.CreateArticleInputSchema = zod_1.z
    .object({
    topicId: zod_1.z.string().min(1, 'Topic ID is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    authors: zod_1.z
        .array(exports.ArticleAuthorSchema)
        .min(1, 'At least one author is required'),
    coverImage: exports.ArticleCoverImageSchema.nullable().optional(),
    articleType: exports.ArticleTypeSchema,
    nextRelatedShubha: zod_1.z.string().nullable().optional(),
})
    .refine((data) => {
    if (data.articleType !== 'shubha' && data.nextRelatedShubha != null) {
        return false;
    }
    return true;
}, {
    message: 'nextRelatedShubha can only be set when articleType is "shubha"',
    path: ['nextRelatedShubha'],
});
