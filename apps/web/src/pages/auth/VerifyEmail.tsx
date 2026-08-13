import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { verifyEmailApi, resendVerificationApi, fetchMeApi } from '../../api/auth';
import { Icon } from '../../components/icons';
import { ThemeToggle } from '../../context/ThemeContext';

export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [manualEmail, setManualEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
    retry: false,
  });

  const verifyMutation = useMutation({
    mutationFn: (tok: string) => verifyEmailApi(tok),
  });

  const resendMutation = useMutation({
    mutationFn: (emailStr: string) => resendVerificationApi(emailStr),
    onSuccess: (data) => {
      setResendStatus(data.message || 'Verification link has been sent to your email.');
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  const handleResend = (emailToSend: string) => {
    if (emailToSend) {
      resendMutation.mutate(emailToSend);
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

      <div className="w-full max-w-md p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md text-center space-y-6">
        {verifyMutation.isPending && (
          <div className="space-y-4 py-6">
            <div className="w-10 h-10 border-4 border-t-[var(--accent)] border-[var(--border)] rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-[var(--text-muted)]">Verifying your email address...</p>
          </div>
        )}

        {/* State 1: Verification Success */}
        {verifyMutation.isSuccess && (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--success)]">
              <Icon name="check-circle" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Email Verified!</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Your email address has been verified successfully. You now have full access to Ishraq Hub.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-block py-2.5 px-6 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* State 2 & 3: Verification Failed / Expired */}
        {verifyMutation.isError && (
          <div className="space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--danger)]">
              <Icon name="alert-circle" size={28} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Verification Link Expired</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {verifyMutation.error.message || 'This verification link is invalid or has expired.'}
              </p>
            </div>

            {resendStatus ? (
              <div className="p-3.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--accent)] text-sm">
                {resendStatus}
              </div>
            ) : (
              <>
                {/* State 2: Authenticated user -> One-click resend button */}
                {meData?.user ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-[var(--text-muted)]">
                      Resend a new verification email to <strong className="text-[var(--text-primary)]">{meData.user.email}</strong>
                    </p>
                    <button
                      type="button"
                      disabled={resendMutation.isPending}
                      onClick={() => handleResend(meData.user.email)}
                      className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                    >
                      {resendMutation.isPending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                ) : (
                  /* State 3: Unauthenticated user -> Manual email input */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResend(manualEmail);
                    }}
                    className="space-y-3 pt-2"
                  >
                    <p className="text-xs text-[var(--text-muted)] text-left">
                      Enter your account email to receive a new verification link:
                    </p>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors text-sm"
                    />
                    <button
                      type="submit"
                      disabled={resendMutation.isPending || !manualEmail}
                      className="w-full py-2.5 px-4 rounded font-semibold text-sm bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                    >
                      {resendMutation.isPending ? 'Sending...' : 'Request New Verification Link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
