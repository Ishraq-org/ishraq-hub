import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerApi } from '../../api/auth';
import { RegisterInputSchema, RegisterInput } from '@ishraq/shared-types';
import { Icon } from '../../components/icons';
import { ThemeToggle } from '../../context/ThemeContext';
import { GoogleButton } from '../../components/GoogleButton';

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], { user: data.user });
      navigate('/?verified=false', { replace: true });
    },
  });

  const onSubmit = (data: RegisterInput) => {
    mutation.mutate(data);
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create an Account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Join Ishraq Hub to save bookmarks and join our research community
          </p>
        </div>

        {mutation.isError && (
          <div className="p-3.5 rounded border border-[var(--danger)] bg-[var(--bg-primary)] text-[var(--danger)] text-sm flex items-center gap-2.5">
            <Icon name="alert-circle" size={18} className="shrink-0" />
            <span>{mutation.error.message || 'Registration failed. Please try again.'}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <GoogleButton text="Sign up with Google" />

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[var(--border)] w-full" />
          <span className="bg-[var(--bg-secondary)] px-3 text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold absolute">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Aymen Ahmed"
              {...register('name')}
              className="w-full px-3.5 py-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
            />
            {errors.name && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
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

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Password (min 8 characters)
            </label>
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

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {mutation.isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
