"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleLinkSchema = void 0;
const zod_1 = require("zod");
exports.ArticleLinkSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    sourceArticleId: zod_1.z.string().min(1, 'Source article ID is required'),
    targetArticleId: zod_1.z.string().min(1, 'Target article ID is required'),
    createdAt: zod_1.z.coerce.date().optional(),
});
