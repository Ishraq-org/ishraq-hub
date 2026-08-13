"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInputSchema = exports.RegisterInputSchema = exports.UserSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum(['member', 'contributor', 'super_admin']);
exports.UserSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    passwordHash: zod_1.z.string(),
    role: exports.UserRoleSchema.default('member'),
    emailVerified: zod_1.z.boolean().default(false),
    emailVerificationToken: zod_1.z.string().nullable().optional(),
    emailVerificationExpires: zod_1.z.coerce.date().nullable().optional(),
    passwordResetToken: zod_1.z.string().nullable().optional(),
    passwordResetExpires: zod_1.z.coerce.date().nullable().optional(),
    bookmarks: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.coerce.date().optional(),
    updatedAt: zod_1.z.coerce.date().optional(),
});
exports.RegisterInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
