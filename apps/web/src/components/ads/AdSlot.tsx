import React, { useEffect, useState } from 'react';
import { hasConsent } from '../../lib/consent';
import { Icon } from '../icons';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdSlotProps {
  slot: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slot }) => {
  const [canRenderAd, setCanRenderAd] = useState<boolean>(false);

  // Check consent state on mount and listen for updates
  useEffect(() => {
    const checkConsent = () => {
      setCanRenderAd(hasConsent('advertising'));
    };

    checkConsent();

    const handleConsentUpdate = () => {
      checkConsent();
    };

    window.addEventListener('cookie-consent-updated', handleConsentUpdate);
    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate);
    };
  }, []);

  const env = (import.meta as any).env || {};
  const clientId = env.VITE_ADSENSE_CLIENT_ID;
  const isDev = env.DEV;

  // 1. Consent Gate (Prompt 18 §18-21): Render nothing if advertising consent is denied
  if (!canRenderAd) {
    return null;
  }

  // 2. Real AdSense Rendering when both consent and VITE_ADSENSE_CLIENT_ID exist (Prompt 18 §26-28)
  if (clientId) {
    // Inject script tag into head conditionally (Prompt 18 §35-41)
    if (typeof document !== 'undefined' && !document.getElementById('adsense-script')) {
      const script = document.createElement('script');
      script.id = 'adsense-script';
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    return (
      <div className="my-8 text-center space-y-2">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <p className="text-[10px] text-[var(--text-muted)] italic">
          Ads help keep Ishraq Hub free — thank you for your support
        </p>
      </div>
    );
  }

  // 3. Fallback when consent exists but no client ID is configured (Prompt 18 §29-33)
  // Renders a clearly labeled placeholder in dev/staging ONLY, never in production.
  if (isDev) {
    return (
      <div className="my-8 p-5 border-2 border-dashed border-[var(--accent)]/50 rounded-xl bg-[var(--bg-secondary)] text-center space-y-2 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[var(--accent)]">
          <Icon name="tag" size={16} />
          <span>Ad Slot Placeholder: {slot}</span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] italic">
          Ads help keep Ishraq Hub free — thank you for your support
        </p>
      </div>
    );
  }

  // In production with no clientId configured, render nothing
  return null;
};

export default AdSlot;
