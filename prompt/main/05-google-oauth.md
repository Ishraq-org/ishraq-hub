# Execution Prompt 05 — Google OAuth ("Continue with Google")

Assumes Prompts 01–04 are complete. This extends the auth system built in
Prompt 03/04 — it doesn't replace the email/password flow, it sits alongside
it. This was in the original archive (`My Main Prompt.md`, `Security.md`) and
should have been part of Prompt 03 — treat this as completing that prompt,
not as new scope.

## 1. User model update

`passwordHash` becomes **optional** — a Google-authenticated user never sets
one. Add:

```
User {
  ...(everything from Prompt 02)...
  passwordHash: string | null      now optional, was required
  googleId: string | null          unique, sparse index (most users won't
                                    have one, so it can't be a plain unique
                                    index — sparse skips null values)
}
```

**Invariant to enforce** (Zod `.refine()` at the schema level, not just a
comment): a user must have **either** `passwordHash` **or** `googleId` —
never neither. Update the `pre('save')` bcrypt hook from Prompt 02 to skip
hashing when `passwordHash` is null/undefined.

## 2. Backend OAuth flow

Matches the flow already specified in the archive: **Redirect → Google →
Callback → JWT.** Use `passport-google-oauth20` (standard, well-tested for
Express) rather than hand-rolling the OAuth exchange.

**`GET /api/auth/google`** — redirects to Google's consent screen, requesting
`profile` and `email` scopes.

**`GET /api/auth/google/callback`** — Google redirects back here with an
auth code. On success:

1. Look up by `googleId` first.
2. Not found? Look up by `email` (Google-verified emails are trustworthy —
   this is the standard, safe basis for account linking). If found, **link**
   the `googleId` to that existing user record and set `emailVerified: true`
   if it wasn't already — don't create a duplicate account for the same
   person.
3. Neither found? Create a new user: `role: 'member'` (same rule as Prompt
   03 — never settable by anything other than this hardcoded value),
   `emailVerified: true` (Google already verified it), no `passwordHash`.
4. Issue the JWT + cookie exactly as in Prompt 03's login, then redirect to
   the frontend (not a JSON response — this is a browser redirect flow, not
   an API call the frontend awaits directly).

**Env vars** (add to `.env.example`): `GOOGLE_CLIENT_ID` (safe to be public-
facing per the archive's own security note), `GOOGLE_CLIENT_SECRET`
(backend-only, never exposed to the frontend), `GOOGLE_CALLBACK_URL`.

**No brute-force-style rate limiting needed on these two routes** — unlike
`/login`, they don't accept credentials directly; Google handles that side.
General API rate limiting still applies.

## 3. Frontend — "Continue with Google" button

One exception to Master Prompt §1.3's "everything custom, no default chrome"
principle, and it's worth stating explicitly rather than silently
contradicting it: **Google's own brand guidelines require their sign-in
button to follow their specified styling** — it can't be arbitrarily
recolored or restyled the way the rest of the UI is. Use Google's official
button asset/component as-is for this one element. Everything else on the
login/register pages (layout, surrounding cards, the email/password form)
stays fully Sandalwood Folio-styled — this exception is scoped to the Google
button itself, nothing else.

Add to `Login.tsx` and `Register.tsx`: the Google button above or below the
email form, with a plain "or" divider between them. Clicking it navigates
(full browser navigation, not a fetch call) to `GET /api/auth/google`.

## 4. Confirm & commit

- Click "Continue with Google" → consent screen → callback → logged in,
  session cookie present, `/me` returns the new user with `emailVerified:
  true` and no `passwordHash`
- Register an account manually with email X, log out, then "Continue with
  Google" using a Google account whose email is also X → confirm it links to
  the *same* user record rather than creating a duplicate (check the
  database directly, not just the UI)
- Confirm a Google-only user (no `passwordHash`) can't log in through the
  regular email/password form with a blank/guessed password — the "either
  passwordHash or googleId" invariant should mean there's nothing to compare
  against, not a silent bypass
- Commit message: `"Google OAuth: passport strategy, account linking,
  frontend button"`
- Push to `main`

## Out of scope for this prompt

No other social providers (Facebook, Apple, etc.) — not part of any decision
made. No "add a password to your Google-only account" settings flow — v1.1+
if it turns out to matter.
