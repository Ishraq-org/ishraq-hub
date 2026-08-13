import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginApi } from '../../api/auth';
import { LoginInputSchema, LoginInput } from '@ishraq/shared-types';
import { Icon } from '../../components/icons';
import { ThemeToggle } from '../../context/ThemeContext';

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const redirectUrl = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect')!)
    : '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], { user: data.user });
      navigate(redirectUrl, { replace: true });
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      {/* Header bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link to="/" className="text-xl font-bold text-[var(--accent)] tracking-tight">
          Ishraq Hub
        </Link>
        <ThemeToggle />
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sign in to access your bookmarks and contributor account
          </p>
        </div>

        {/* Global Error Banner */}
        {mutation.isError && (
          <div className="p-3.5 rounded border border-[var(--danger)] bg-[var(--bg-primary)] text-[var(--danger)] text-sm flex items-center gap-2.5">
            <Icon name="alert-circle" size={18} className="shrink-0" />
            <span>{mutation.error.message || 'Invalid email or password'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full px-3.5 py-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-3.5 py-2.5 pr-10 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
