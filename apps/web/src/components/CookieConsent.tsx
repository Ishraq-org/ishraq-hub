import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent } from '../lib/consent';
import { Icon } from './icons';

export const CookieConsent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  // Check existing consent on mount (Prompt 17 §42)
  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      setIsOpen(true);
    } else {
      setAnalytics(existing.analytics);
      setAdvertising(existing.advertising);
    }

    // Listen for custom event triggered from Footer or preferences link (Prompt 17 §47)
    const handleReopen = () => {
      const current = getConsent();
      if (current) {
        setAnalytics(current.analytics);
        setAdvertising(current.advertising);
      }
      setIsCustomizing(true);
      setIsOpen(true);
    };

    window.addEventListener('open-cookie-preferences', handleReopen);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleReopen);
    };
  }, []);

  if (!isOpen) return null;

  const handleAcceptAll = () => {
    setConsent({ analytics: true, advertising: true });
    setIsOpen(false);
    setIsCustomizing(false);
  };

  const handleNecessaryOnly = () => {
    setConsent({ analytics: false, advertising: false });
    setIsOpen(false);
    setIsCustomizing(false);
  };

  const handleSaveCustom = () => {
    setConsent({ analytics, advertising });
    setIsOpen(false);
    setIsCustomizing(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 pointer-events-auto text-xs text-[var(--text-primary)] animate-in slide-in-from-bottom-6 duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--accent)]">
              <Icon name="shield-check" size={18} />
              <span>We Value Your Privacy</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Ishraq Hub uses strictly necessary cookies to keep you signed in securely. We also offer optional analytics and performance cookies to help us improve scholarly content navigation.{' '}
              <Link to="/cookies" className="text-[var(--accent)] hover:underline font-semibold">
                Learn more in our Cookie Policy
              </Link>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            title="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Customization Accordion Panel (Prompt 17 §38-40) */}
        {isCustomizing && (
          <div className="pt-3 border-t border-[var(--border)] space-y-3 bg-[var(--bg-primary)]/50 p-4 rounded-xl">
            <h4 className="font-bold text-xs text-[var(--accent)] uppercase tracking-wider font-mono">
              Cookie Preference Categories
            </h4>

            {/* Necessary Cookies (Always On) */}
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--border)] bg-[var(--bg-secondary)] opacity-80">
              <div>
                <p className="font-bold text-[var(--text-primary)]">Strictly Necessary Cookies</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Essential for session security (`ishraq_session`), authentication, and basic site function. Cannot be disabled.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                Always Active
              </span>
            </div>

            {/* Analytics Toggles */}
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--border)] bg-[var(--bg-secondary)]">
              <div>
                <p className="font-bold text-[var(--text-primary)]">Analytics & Research Cookies</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Helps us understand article reading time and research topic traffic patterns to optimize translation priorities.
                </p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Advertising Toggles */}
            <div className="flex items-center justify-between p-2.5 rounded border border-[var(--border)] bg-[var(--bg-secondary)]">
              <div>
                <p className="font-bold text-[var(--text-primary)]">Advertising & AdSense Personalization</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Enables personalized sponsorship and AdSense ads foundation for supporting site operations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={advertising}
                onChange={(e) => setAdvertising(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-[var(--accent)] hover:underline font-semibold text-xs flex items-center gap-1"
          >
            <Icon name="sliders" size={14} />
            <span>{isCustomizing ? 'Hide Custom Options' : 'Customize Preferences'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isCustomizing ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-2 font-bold rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] hover:opacity-90 transition-opacity"
              >
                Save Selected Preferences
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleNecessaryOnly}
                  className="px-4 py-2 font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--border)] transition-colors text-[var(--text-primary)]"
                >
                  Necessary Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2 font-bold rounded-lg bg-[var(--accent)] text-[var(--bg-secondary)] hover:opacity-90 transition-opacity shadow-sm"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
