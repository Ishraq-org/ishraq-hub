import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi } from '../../api/auth';
import { Icon } from '../../components/icons';
import { ThemeToggle } from '../../context/ThemeContext';

const ResetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordFormInput) =>
      resetPasswordApi(token || '', data.newPassword),
  });

  const onSubmit = (data: ResetPasswordFormInput) => {
    if (token) {
      mutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link to="/" className="text-xl font-bold text-[var(--accent)] tracking-tight">
          Ishraq Hub
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Set new password</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Choose a new strong password for your Ishraq Hub account.
          </p>
        </div>

        {mutation.isError && (
          <div className="p-3.5 rounded border border-[var(--danger)] bg-[var(--bg-primary)] text-[var(--danger)] text-sm flex items-center gap-2.5">
            <Icon name="alert-circle" size={18} className="shrink-0" />
            <span>{mutation.error.message || 'Failed to reset password. Token may be invalid or expired.'}</span>
          </div>
        )}

        {mutation.isSuccess ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--success)]">
              <Icon name="check-circle" size={28} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Password Reset Complete</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Sign In Now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('newPassword')}
                  className="w-full px-3.5 py-2.5 pr-10 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-[var(--danger)] mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full px-3.5 py-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[var(--danger)] mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !token}
              className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {mutation.isPending ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
