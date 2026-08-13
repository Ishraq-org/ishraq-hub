# Execution Prompt 06 — Base Layout, Navigation & Language Routing

Assumes Prompts 01–05 are complete (theme, data models, full auth including
Google). This builds the persistent site shell everything else will live
inside, and settles a routing-structure question that's been implicit until
now.

## A real architectural call this prompt makes: language-prefixed URLs for content, not for everything

For proper multilingual SEO (Master Prompt notes hreflang/SEO specifics were
still open — this settles the URL-structure half of that), search engines
need distinct, crawlable URLs per language for actual content. So:

- **Content routes are language-prefixed:** `/en/articles/:slug`,
  `/am/articles/:slug`, `/en/topics/:slug`, `/am/topics/:slug`
- **Account/utility routes are not:** `/login`, `/register`, `/dashboard`,
  `/admin/...` stay as-is — they're not content to be indexed per-language,
  they just render their chrome text in whatever the site-chrome language
  preference (below) currently is

This is a real structural decision, not filler — flagging it clearly rather
than letting it default silently, since changing URL structure later is
disruptive.

## 1. Site-chrome language state — scoped narrowly, read this before building

This prompt's language toggle controls **UI chrome strings only** (nav
labels, buttons, footer text) — **not** which language of an article is
being read. Switching an article's language requires resolving that
specific article's sibling-translation slug and handling the "translation
not ready" fallback from Master Prompt §5.3 — that's contextual to the
article page itself and belongs in the future article-reading prompt, not
here. Keep this prompt's scope to the shell.

- `apps/web/src/store/languageStore.ts` — Zustand, holds `language: 'en' |
  'am'`, persisted to `localStorage` (genuinely client-only preference, no
  server counterpart — correct use of Zustand per the boundary set in Prompt
  04)
- `apps/web/src/strings/en.ts` and `apps/web/src/strings/am.ts` — simple
  key→string dictionaries for chrome text (nav items, buttons, footer
  labels). A lightweight custom `useT()` hook reading the current language
  from the store is enough for this vocabulary size — don't pull in a full
  i18n library (react-i18next etc.) for what's currently a small, fixed set
  of UI strings. Revisit if the chrome vocabulary grows substantially.

## 2. Header

`apps/web/src/components/Header.tsx`:
- Logo/wordmark — text-based placeholder ("Ishraq Hub" in `--accent`,
  Inter, weight 700) since the real logo doesn't exist yet (Master Prompt
  §4.3) — don't block this on Miqdad's design
- Primary nav: Home, Topics — keep it to what's actually been decided;
  don't invent additional nav items for undesigned features
- Search icon (from `icons.jsx`) — visible but **non-functional placeholder**
  for now (opens nothing, or a "coming soon" state). Search itself hasn't
  been designed yet — don't build real search as a side effect of building
  navigation
- Language toggle (EN/AM) — uses `languageStore`
- Theme toggle (built in Prompt 01) — lives here now
- Auth area, driven by `useQuery(['me'])` (Prompt 04's pattern):
  - Logged out: "Log in" / "Sign up" buttons
  - Logged in: avatar/name with a dropdown — Dashboard, Bookmarks, Logout
- Mobile: collapses nav + auth area behind a hamburger (`menu` icon, already
  in `icons.jsx`) into a slide-out panel — mobile-first per Master Prompt
  §11, build and test this breakpoint first, not as an afterthought

## 3. Footer

`apps/web/src/components/Footer.tsx`:
- Ishraq Hub name + tagline ("Illuminating the Ummah")
- Links to policy pages: Privacy, Terms, Cookie Policy, Disclaimer,
  Advertising Policy (Master Prompt §8 — these are static code-based pages)
- Copyright line

**Build the routes as placeholders only** — `/privacy`, `/terms`,
`/cookies`, `/disclaimer`, `/advertising`, each rendering a simple "This
policy is being finalized" page. **Do not write actual legal policy text** —
that's real legal content requiring deliberate drafting, not something to
generate as filler while building navigation. Flag these placeholders clearly
in the UI (e.g. a visible "Draft — not yet finalized" note) so nothing that
looks like a real policy accidentally goes live.

## 4. Layout wrapper

`apps/web/src/components/Layout.tsx` — wraps all routes via React Router's
`<Outlet />`: `Header` + page content + `Footer`. Auth pages from Prompt 04
(`/login`, `/register`, etc.) — decide whether they use this same layout or
a stripped-down variant (no main nav, just the logo) — a stripped variant is
more standard practice for auth flows and reduces distraction on those pages;
build it that way unless there's a reason not to.

## 5. Confirm & commit

- Header and footer render correctly on both a real mobile viewport (test
  actual responsive breakpoints, not just a resized desktop browser window)
  and desktop
- Language toggle switches all chrome text between EN/AM and persists across
  a page reload
- Theme toggle still works correctly from within the header (regression-
  check Prompt 01's toggle now that it's moved into a new component)
- Auth area correctly reflects logged-in vs logged-out state, and the
  dropdown/logout flow works
- Policy placeholder routes exist and are clearly marked as drafts
- Commit message: `"Base layout: header, footer, mobile nav, language-
  prefixed routing structure"`
- Push to `main`

## Out of scope for this prompt

No real search, no actual article/topic pages (those routes exist in the
URL structure now but render nothing meaningful yet), no admin panel UI, no
real policy content, no article-level language switching (see Section 1).
