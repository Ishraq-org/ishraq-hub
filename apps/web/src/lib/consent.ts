export interface ConsentCategories {
  analytics: boolean;
  advertising: boolean;
}

export interface ConsentState extends ConsentCategories {
  necessary: true;
  timestamp: number;
}

const COOKIE_NAME = 'ishraq_cookie_consent';
const SIX_MONTHS_SECONDS = 180 * 24 * 60 * 60; // 180 days in seconds per Prompt 17 §30

export function getConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, val] = cookie.trim().split('=');
    if (name === COOKIE_NAME && val) {
      try {
        const parsed: ConsentState = JSON.parse(decodeURIComponent(val));
        const now = Date.now();
        const maxAgeMs = SIX_MONTHS_SECONDS * 1000;

        // Verify consent is not older than 6 months
        if (parsed && parsed.timestamp && now - parsed.timestamp < maxAgeMs) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse cookie consent:', err);
      }
    }
  }

  return null;
}

export function setConsent(categories: ConsentCategories): ConsentState {
  const consentState: ConsentState = {
    necessary: true,
    analytics: Boolean(categories.analytics),
    advertising: Boolean(categories.advertising),
    timestamp: Date.now(),
  };

  const encodedVal = encodeURIComponent(JSON.stringify(consentState));
  document.cookie = `${COOKIE_NAME}=${encodedVal}; max-age=${SIX_MONTHS_SECONDS}; path=/; SameSite=Lax`;

  // Dispatch custom DOM event for immediate script listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cookie-consent-updated', { detail: consentState })
    );
  }

  return consentState;
}

export function hasConsent(category: 'analytics' | 'advertising'): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return Boolean(consent[category]);
}
