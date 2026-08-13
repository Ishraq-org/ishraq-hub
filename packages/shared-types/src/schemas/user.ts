import { z } from 'zod';

export const UserRoleSchema = z.enum(['member', 'contributor', 'super_admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  passwordHash: z.string(),
  role: UserRoleSchema.default('member'),
  emailVerified: z.boolean().default(false),
  emailVerificationToken: z.string().nullable().optional(),
  emailVerificationExpires: z.coerce.date().nullable().optional(),
  passwordResetToken: z.string().nullable().optional(),
  passwordResetExpires: z.coerce.date().nullable().optional(),
  bookmarks: z.array(z.string()).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const RegisterInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
