# Execution Prompt 03 — Authentication System

Assumes Prompts 01 and 02 are complete (theme system working, User model and
Zod schemas in place). Backend-focused — frontend login/register UI is the
next prompt, not this one.

## Goal

A complete, secure auth API: registration, email verification, login,
logout, password reset, and the middleware everything else will depend on for
role checks. Every detail below exists because leaving it unspecified is
exactly where AI-generated auth code tends to cut corners.

## 1. Token conventions — read this before writing any code

**Email verification tokens and password reset tokens are never stored raw.**
Generate the token with `crypto.randomBytes(32).toString('hex')`, email that
raw value to the user, but store only its **SHA-256 hash** in
`emailVerificationToken` / `passwordResetToken`. On lookup, hash the incoming
token from the URL and compare against the stored hash. Reason: if the
database ever leaks, raw stored tokens would let an attacker directly verify
or reset any account; hashed tokens don't have that exposure.

- Verification token expiry: **30 minutes**
- Password reset token expiry: **15 minutes** (shorter — this one's more
  security-sensitive)

**JWT payload:** `{ userId, role }` only — no email, no name. Keep it minimal;
anything else needed gets fetched via `/api/auth/me`.

**Cookie config:** name it `ishraq_session`. `httpOnly: true`, `secure: true`
in production (`false` in local dev unless you're running https locally),
`sameSite: 'lax'`, `maxAge` = 7 days. No refresh-token system for v1 — flat
7-day expiry, re-login required after. (Known limitation, not an oversight:
stateless JWT can't be revoked mid-session without a blocklist; acceptable
tradeoff at this stage given the short expiry and low stakes of a Member
account. Revisit if this ever actually matters in practice.)

## 2. Endpoints

All under `apps/api/src/routes/auth.ts`, validated via the Zod schemas from
Prompt 02's pattern (narrow input schemas, not the full User schema).

**`POST /api/auth/register`**
- Input: `{ name, email, password }` — validate via `RegisterInputSchema`
- **`role` is never accepted from the request body, under any circumstance.**
  Hardcode `role: 'member'` server-side. Accepting a client-supplied role
  field here is a privilege-escalation vulnerability — don't reuse a generic
  "create user" function that would allow it.
- Create the user, generate + hash verification token, send
  `VerificationEmail` (Section 4)
- Issue the JWT and set the cookie immediately — **don't gate login on email
  verification.** Member accounts are low-stakes (bookmarks only); block
  registration UX complexity isn't worth it for this risk level. Return
  `emailVerified: false` in the response so the frontend can show a "verify
  your email" prompt without blocking access.

**`GET /api/auth/verify-email/:token`**
- Hash the incoming token, look up by `emailVerificationToken`, check
  `emailVerificationExpires` hasn't passed
- On success: `emailVerified: true`, clear both token fields
- On expired/invalid token: clear error response the frontend can show a
  "resend verification" prompt for

**`POST /api/auth/resend-verification`**
- Input: `{ email }`. Regenerate token + expiry, resend. Rate-limited hard
  (Section 5) — this is an easy endpoint to abuse for email bombing

**`POST /api/auth/login`**
- Input: `{ email, password }`
- Query must explicitly `.select('+passwordHash')` since it's excluded by
  default (Prompt 02, `select: false`)
- `bcrypt.compare`, issue JWT + cookie on success
- Same generic error message ("invalid email or password") whether the email
  doesn't exist or the password is wrong — don't leak which one failed

**`POST /api/auth/logout`**
- Clears the `ishraq_session` cookie

**`POST /api/auth/forgot-password`**
- Input: `{ email }`. Generate + hash reset token, send `PasswordResetEmail`
- **Always return the same success response whether or not the email exists**
  in the database — don't let this endpoint be usable to enumerate
  registered emails

**`POST /api/auth/reset-password/:token`**
- Input: `{ newPassword }`. Hash-and-compare the token, check expiry, update
  `passwordHash` (triggers the `pre('save')` bcrypt hook from Prompt 02),
  clear reset token fields

**`GET /api/auth/me`**
- Returns the current user (from `requireAuth`, Section 3) minus
  `passwordHash` — this is what the frontend calls on app load to establish
  auth state

## 3. Middleware

`apps/api/src/middleware/auth.ts`:

- **`requireAuth`** — reads the `ishraq_session` cookie, verifies the JWT,
  attaches `req.user = { userId, role }`, or 401s
- **`requireRole(...roles)`** — e.g. `requireRole('super_admin')` or
  `requireRole('contributor', 'super_admin')`. Runs after `requireAuth`,
  403s if `req.user.role` isn't in the allowed list. Every protected route
  built in future prompts uses this — build it generically now so it's not
  rewritten later.

## 4. Email integration

`apps/api/src/services/email/`:
- `IshraqEmailLayout.tsx` — shared header/footer, built with
  `@react-email/components`, Sandalwood Folio branding (Master Prompt §4.1
  tokens — but note email clients have inconsistent CSS support, so use
  inline-style-safe values from the palette rather than assuming CSS
  variables render correctly in email; hardcoding the actual hex values here
  is the one place in the whole codebase where Master Prompt §1.3's
  "CSS-variables-only" rule doesn't apply, because email HTML can't reference
  a stylesheet reliably)
- `VerificationEmail.tsx`, `PasswordResetEmail.tsx` — built as components
  inside the layout, matching the structure from the archived ChatGPT email
  discussion (branded header, greeting, clear single CTA button, expiry
  notice, footer)
- `emailService.ts` — `sendVerificationEmail(user, rawToken)`,
  `sendPasswordResetEmail(user, rawToken)`. Renders the component to HTML via
  `@react-email/render`, sends through Resend. **Nothing outside this file
  calls Resend directly** — matches Master Prompt §10's "centralized, never
  scattered" rule.

## 5. Rate limiting — stricter than the general API baseline

Master Prompt §13 requires rate limiting on all public endpoints, but auth
routes are classic brute-force/abuse targets and need tighter limits than
general API traffic:

- `/login`, `/register`, `/forgot-password`, `/resend-verification`: **5
  requests per 15 minutes per IP**, using `express-rate-limit`, applied as
  middleware specifically on the auth router — not the same limiter instance
  used for general API routes.

## 6. Bootstrapping the first Super Admin

There's no user yet who can promote anyone to Super Admin — the system needs
one before the admin panel is useful. **Do not build an API endpoint for
this** — that would be a standing privilege-escalation surface. Instead:

`apps/api/src/scripts/seedSuperAdmin.ts` — a one-time script run manually
(`npm run seed:admin`), reading email/password from environment variables or
an interactive CLI prompt, creating a single `role: 'super_admin'` user
directly via the model. Not wired into any route. Aymen runs this once after
deployment, not something the running application ever exposes.

## 7. Confirm & commit

- Register a test user → verification email arrives (check Resend's log/
  dashboard, or a local email-catching tool in dev) → verify-email endpoint
  flips `emailVerified` → login works → `/me` returns the user → logout
  clears the cookie
- Forgot-password → reset email arrives → reset-password with the token
  changes the password → old password no longer works, new one does
- Confirm the rate limiter actually triggers on the 6th rapid login attempt
- Confirm attempting to pass `"role": "super_admin"` in a register request
  body has zero effect — the created user is still `role: 'member'`
- Commit message: `"Auth system: registration, verification, login, password
  reset, role middleware"`
- Push to `main`

## Out of scope for this prompt

No frontend login/register forms, no Zustand auth store, no protected route
components on the client — next prompt. No bookmark endpoints, no Contributor
promotion UI (that's Admin Panel work, later). No OAuth/social login — not
part of any decision made so far.
