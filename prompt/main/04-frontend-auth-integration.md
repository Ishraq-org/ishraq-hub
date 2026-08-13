# Execution Prompt 04 — Frontend Auth Integration

Assumes Prompts 01–03 are complete (theme system, data models, backend auth
API all working). This is the client side: forms, route protection, and
wiring to the API built in Prompt 03.

## ⚠️ Correction to Prompt 03's cookie config — fix this first

`apps/web` (Netlify) and `apps/api` (Render) are **different origins** in
production. Prompt 03 specified `sameSite: 'lax'` on the session cookie —
that's wrong for this setup. `lax` cookies are not sent on cross-origin
fetch/XHR requests with credentials, only on top-level navigations. Left as
`lax`, login will appear to succeed but the cookie silently never attaches to
the next API call — the user looks logged out immediately, and it's a
confusing bug to track down after the fact.

**Corrected cookie config for production:** `sameSite: 'none'` + `secure:
true` (these two must be set together; requires https, which both Netlify
and Render provide by default). Backend CORS config must also explicitly set
`Access-Control-Allow-Origin` to the **exact** frontend URL (never a
wildcard) with `Access-Control-Allow-Credentials: true`.

**For local dev,** rather than dealing with `sameSite: 'none'` locally (which
needs https even in dev), configure Vite's dev server proxy
(`server.proxy` in `vite.config.ts`) so `/api/*` requests forward to the
local backend port. This makes frontend and backend appear same-origin during
development, so plain `sameSite: 'lax'` works fine locally with zero HTTPS
setup — dev and production each end up correct for their own context, without
conditional cookie logic scattered through the codebase.

Go back and fix `apps/api`'s cookie-setting code from Prompt 03 with this
before starting on the frontend below.

## Architecture note: TanStack Query owns auth state, not Zustand

Current user is **server-derived data** — it belongs to TanStack Query's
domain, not Zustand's. Don't build a separate Zustand auth store; that would
create two sources of truth for the same data that can drift out of sync (a
classic real bug). Instead:

- `useQuery(['me'], fetchMe)` is the single source of truth for "who's
  logged in" everywhere in the app
- Login/register/logout mutations call `queryClient.setQueryData(['me'],
  ...)` on success to update the cached user immediately, rather than waiting
  on a refetch
- Reserve Zustand for genuinely client-only UI state that has no server
  counterpart (mobile menu open/closed, the TOC bottom-sheet from Master
  Prompt §11, etc.) — not for this

## 1. API client

`apps/web/src/api/client.ts` — a thin fetch wrapper: `credentials: 'include'`
on every call (required for the cookie to be sent), JSON parsing, and
normalized error throwing so React Query's `onError` always receives a
consistent `Error` with a usable `.message`.

`apps/web/src/api/auth.ts` — one function per Prompt 03 endpoint:
`register`, `verifyEmail`, `resendVerification`, `login`, `logout`,
`forgotPassword`, `resetPassword`, `fetchMe`. Each typed with the shared Zod-
inferred types from `packages/shared-types` — don't hand-write parallel
interfaces here.

## 2. Icons to add

Extend `icons.jsx` (Prompt 01) with what these forms need: `eye`, `eye-off`
(password visibility toggle), `mail`, `lock`, `check-circle`, `alert-circle`.

## 3. Route protection

`apps/web/src/components/ProtectedRoute.tsx`:
- Reads `useQuery(['me'])`. While loading, show the loading indicator from
  Prompt 01 (not a spinner). If no user, redirect to `/login?redirect=<the
  path they were trying to reach>` so login can send them back afterward.

`apps/web/src/components/RoleGate.tsx`:
- `<RoleGate roles={['contributor', 'super_admin']}>` — same pattern, but
  checks `user.role` against the allowed list; redirect or show a plain "not
  authorized" state if it doesn't match. Every role-restricted page in future
  prompts (admin panel, contributor dashboard) wraps in this — build it
  generically now.

## 4. Forms

All under `apps/web/src/pages/auth/`. Use `react-hook-form` +
`@hookform/resolvers/zod`, validated against the **same Zod schemas** already
built in `packages/shared-types` for the backend (Prompt 02/03) — this is
the whole point of sharing them: one validation rule set, not two that can
drift apart.

**`Login.tsx`** — email, password (with the eye/eye-off visibility toggle).
On success, `setQueryData(['me'], ...)`, then redirect to the `?redirect=`
param if present, otherwise home. On failure, show the generic "invalid email
or password" error as a form-level banner (`--danger` token) — matches the
backend's deliberately non-specific error message, don't undermine that by
being more specific on the frontend.

**`Register.tsx`** — name, email, password. On success: user is already
logged in (Prompt 03 doesn't gate login on verification), so redirect to home
with a persistent but dismissible "verify your email" banner rather than a
blocking interstitial page.

**`VerifyEmail.tsx`** — reads `:token` from the URL, calls `verifyEmail` on
mount. Three states:
- Success → confirmation + link home
- Expired/invalid token, **and** `useQuery(['me'])` shows an authenticated
  session → offer a one-click resend using the known email from `/me`
- Expired/invalid token, **and no session** (e.g. they clicked the link on a
  different device than they registered on) → show an email input so they
  can request a fresh verification link manually

**`ForgotPassword.tsx`** — single email field. **Always show the same "if
that email exists, we've sent a reset link" message regardless of outcome** —
this has to match the backend's anti-enumeration behavior (Prompt 03,
Section 2). Don't have the frontend accidentally leak whether an email is
registered by showing different copy for different cases.

**`ResetPassword.tsx`** — reads `:token` from the URL, new password + confirm
password. Confirm-password matching is a client-only concern (the backend
schema doesn't need it) — extend the shared schema locally with a `.refine()`
checking the two fields match, don't modify the shared schema itself for a
frontend-only rule.

## 5. Routes

Register in the router from Prompt 01: `/login`, `/register`,
`/verify-email/:token`, `/forgot-password`, `/reset-password/:token`. None of
these are wrapped in `ProtectedRoute` — they're the entry points to get
authenticated in the first place.

## 6. Confirm & commit

- Full loop works end to end through the actual UI: register → verify-email
  banner visible → click link from the real email → verified → logout →
  login → protected-route redirect works (try hitting a `ProtectedRoute`-
  wrapped test route while logged out, confirm it bounces to `/login` and
  back after auth) → forgot-password → reset-password → login with new
  password
- Confirm in browser devtools that the session cookie is actually present
  after login (this is the check that would have caught the Prompt 03 bug)
- Commit message: `"Frontend auth: forms, route protection, TanStack Query
  auth state"`
- Push to `main`

## Out of scope for this prompt

No admin panel UI, no Contributor-specific dashboard, no bookmark UI, no real
homepage yet — just the auth flow and the route-protection primitives future
prompts will reuse.
