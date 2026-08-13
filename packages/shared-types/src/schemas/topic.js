"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTopicInputSchema = exports.TopicSchema = exports.TopicSlugSchema = exports.MultiLangStringSchema = void 0;
const zod_1 = require("zod");
exports.MultiLangStringSchema = zod_1.z.object({
    en: zod_1.z.string().min(1, 'English text is required'),
    am: zod_1.z.string().min(1, 'Amharic text is required'),
});
exports.TopicSlugSchema = zod_1.z.object({
    en: zod_1.z
        .string()
        .min(1, 'English slug is required')
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'English slug must be lower-case and URL-safe'),
    am: zod_1.z
        .string()
        .min(1, 'Amharic slug is required')
        .toLowerCase()
        .regex(/^[a-z0-9\-]+$/, 'Amharic slug must be valid URL-safe identifier'),
});
exports.TopicSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: exports.MultiLangStringSchema,
    slug: exports.TopicSlugSchema,
    parentTopicId: zod_1.z.string().nullable().optional(),
    description: exports.MultiLangStringSchema.nullable().optional(),
    createdAt: zod_1.z.coerce.date().optional(),
    updatedAt: zod_1.z.coerce.date().optional(),
});
exports.CreateTopicInputSchema = zod_1.z.object({
    name: exports.MultiLangStringSchema,
    slug: exports.TopicSlugSchema.optional(), // Auto-generated if omitted
    parentTopicId: zod_1.z.string().nullable().optional(),
    description: exports.MultiLangStringSchema.nullable().optional(),
});
