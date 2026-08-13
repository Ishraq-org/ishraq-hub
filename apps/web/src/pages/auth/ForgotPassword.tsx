import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordApi } from '../../api/auth';
import { Icon } from '../../components/icons';
import { ThemeToggle } from '../../context/ThemeContext';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (email: string) => forgotPasswordApi(email),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    mutation.mutate(data.email);
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reset your password</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <Icon name="mail" size={24} />
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              If an account exists for that email, a password reset link has been sent. Please check your inbox.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full px-3.5 py-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
              />
              {errors.email && (
                <p className="text-xs text-[var(--danger)] mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {mutation.isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!submitted && (
          <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
