import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../hooks/useT';

export const Footer: React.FC = () => {
  const { t } = useT();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors mt-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="text-center md:text-left space-y-1 max-w-md">
          <Link
            to="/"
            className="text-lg font-bold text-[var(--accent)] tracking-tight hover:opacity-90 transition-opacity"
          >
            Ishraq Hub
          </Link>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Policy Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--text-secondary)]">
          <Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">
            {t('footer.privacy')}
          </Link>
          <Link to="/terms" className="hover:text-[var(--accent)] transition-colors">
            {t('footer.terms')}
          </Link>
          <Link to="/cookies" className="hover:text-[var(--accent)] transition-colors">
            {t('footer.cookies')}
          </Link>
          <Link to="/disclaimer" className="hover:text-[var(--accent)] transition-colors">
            {t('footer.disclaimer')}
          </Link>
          <Link to="/advertising" className="hover:text-[var(--accent)] transition-colors">
            {t('footer.advertising')}
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))}
            className="hover:text-[var(--accent)] transition-colors font-semibold text-[var(--accent)]"
          >
            Cookie Preferences
          </button>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
        {t('footer.copyright')}
      </div>
    </footer>
  );
};

export default Footer;
