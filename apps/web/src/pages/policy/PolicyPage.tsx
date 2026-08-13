import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useT } from '../../hooks/useT';
import { Icon } from '../../components/icons';

const policyTitles: Record<string, string> = {
  '/privacy': 'footer.privacy',
  '/terms': 'footer.terms',
  '/cookies': 'footer.cookies',
  '/disclaimer': 'footer.disclaimer',
  '/advertising': 'footer.advertising',
};

export const PolicyPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useT();

  const titleKey = policyTitles[pathname] || 'footer.privacy';
  const titleText = t(titleKey as any);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <div className="max-w-2xl w-full p-8 sm:p-10 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-md space-y-6">
        {/* Title */}
        <div className="border-b border-[var(--border)] pb-4">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {titleText}
          </h1>
        </div>

        {/* Draft Notice Banner (Prompt 06 §3) */}
        <div className="p-4 rounded-lg border border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg-secondary)] flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <Icon name="alert-circle" size={20} />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider">
              {t('policy.draftNotice')}
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {t('policy.draftDesc')}
            </p>
          </div>
        </div>

        {/* Placeholder Policy Content */}
        <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          <p>
            Ishraq Hub is committed to transparency, user privacy, and educational research integrity. This policy page outlines the preliminary standards and guidelines governing user data, site usage, cookies, and content disclaimers.
          </p>
          <p>
            Once our formal legal review is completed, the full unabridged legal agreement for <strong>{titleText}</strong> will be published here.
          </p>
        </div>

        {/* Return Button */}
        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            to="/"
            className="inline-block text-xs font-semibold px-4 py-2 rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
