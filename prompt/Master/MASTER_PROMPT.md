# ISHRAQ HUB — MASTER PROMPT

**This document is the complete system context for building Ishraq Hub.** It is
compiled from a real, deliberated decisions log (`docs/roadmap/decisions-log.md`)
— every rule here was reasoned through, not assumed. Read this in full before
writing any code.

**This is a living document, not final.** Aymen and Claude continue to discuss
and refine the product. If a future instruction from Aymen conflicts with
something written here, the newer instruction wins — but flag the conflict so
it can be reconciled in the decisions log rather than silently drifting.

**If something isn't covered here:** don't guess and don't invent scope. Ask,
or build the smallest reasonable version and flag it clearly for review.

---

## 0. WHAT ISHRAQ HUB IS

Ishraq Hub is an Islamic knowledge and apologetics platform for the Ethiopian
Ummah and beyond — a Wikipedia-style research hub, not a blog. Its core idea:
**knowledge-centric, not page-centric.** Every technical term used in a
long-form argument article should be defined once, in its own article, and
linked to — not re-explained every time it comes up.

It is **one product** under the Ishraq organization (an Islamic digital
service provider building multiple independent products). It has its own
codebase, database, and infrastructure — it does not assume anything is
shared with a future Ishraq product.

**Team:** Aymen (developer) + Miqdad (design/video). Domain: `ishraqhub.com`.

---

## 1. NON-NEGOTIABLE ENGINEERING RULES

These apply to every file, every component, every commit. Not preferences —
rules.

### 1.1 No emoji, anywhere, ever
Any place an AI coder would instinctively reach for an emoji (✓, ⚠️, 📊, 🔥) or
an ad-hoc inline SVG — use the `<Icon name="..." />` component instead, no
exceptions. Build `icons.jsx` (or `.tsx`) first, before any feature work, as a
single source of truth wrapping Lucide icons with Ishraq's own customization
layer. Every icon used anywhere in the app is imported from this one file.

### 1.2 Comments explain *why*, never *what*
No `// increment counter` noise — clean naming should make "what" self-evident.
Comments exist only for: non-obvious business logic, a workaround for a
library quirk, a security-sensitive decision, or a "don't touch this, here's
why." If you can't articulate the *why*, don't write the comment.

### 1.3 Zero hardcoded colors — CSS variables only
No hex codes, no `rgb()`, no raw Tailwind color utilities (`bg-white`,
`text-gray-900`, `border-slate-200`, etc.) anywhere in the codebase. Every
color reference goes through the CSS custom properties defined in Section 4.
This is the actual mechanism that makes light/dark mode correct from day one
instead of retrofitted — it must be true from the very first component built,
not added later.

### 1.4 Git discipline
- Work directly on `main` — small team, no PR overhead needed yet.
- Commit after each coherent unit of work, with a real message (never "wip",
  "fix", "update").
- Push at the end of every session — nothing valuable should live only on one
  machine.
- **`.env` is never committed. Secrets are never hardcoded.** Not "just to get
  it working," not temporarily. Use environment variables from the first line
  of code that needs a credential.

---

## 2. TECH STACK

**Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Zustand
(client state) + TanStack Query (server state / caching — this is also how
Wikipedia-link hover previews get cached, see Section 6).

**Backend:** Node.js + Express + MongoDB Atlas + Mongoose. One Express process
serves both the REST API and the Telegram bot webhook (Section 9) — one
Render service, not two.

**Media:** Cloudinary for image storage/delivery.

**Auth:** JWT in HTTP-only cookies.

**Email:** Resend (free tier: 3,000/month, 100/day — covers v1 volume). React
Email–style component templates.

**Deployment:** Netlify (frontend) + Render (backend, single service) +
MongoDB Atlas + Cloudinary.

**Bot framework:** Telegraf (or equivalent), **webhook mode, not
long-polling** — see Section 9.

---

## 3. REPO & FOLDER STRUCTURE

Repo root = this folder (`products/ishraq-hub`), pushed to
`github.com/Ishraq/ishraq-hub` (private).

```
ishraq-hub/
├── apps/
│   ├── web/                    React + Vite frontend
│   │   └── src/
│   │       ├── components/
│   │       │   └── icons.jsx    ← build this first, Section 1.1
│   │       ├── pages/
│   │       ├── hooks/
│   │       └── styles/          ← CSS variable definitions, Section 4
│   └── api/                    Node + Express backend
│       └── src/
│           ├── routes/
│           ├── controllers/
│           ├── models/          ← Mongoose schemas, Section 5
│           ├── services/        ← email service, link-graph service, etc.
│           ├── middleware/      ← auth, rate limiting
│           ├── config/
│           └── bot/             ← Telegram bot logic, same process as API
├── packages/
│   ├── shared-types/            TypeScript types shared web ⇄ api
│   └── ui-kit/                  Shared design primitives
├── design/                      Brand assets, fonts, mockups
├── docs/                        Architecture, decisions log, policies
├── prompt/
│   ├── Master/                  This file — living, update as decisions evolve
│   └── main/                    Sequential execution prompts, generated JIT
└── scripts/
```

---

## 4. DESIGN TOKENS

### 4.1 Colors — Sandalwood Folio

```css
:root {
  --bg-primary: #F2EEE6;
  --bg-secondary: #FFFFFF;
  --text-primary: #543520;
  --text-secondary: #3D2516;
  --text-muted: #8A7B6C;
  --accent: #B5822E;
  --accent-hover: #D2A857;
  --border: #E5DDD0;
  --shadow: rgba(84, 53, 32, 0.1);
  --radius: 8px;

  --success: #6B7A4A;
  --danger: #B4452F;
  --warning: #F59E0B;
  --info: var(--accent);
  --focus-ring: rgba(181, 130, 46, 0.4); /* accent at reduced opacity */

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-amharic: 'Noto Sans Ethiopic', sans-serif;
  --font-arabic: 'Noto Naskh Arabic', 'Amiri', serif; /* Quran blocks only */
}

[data-theme="dark"] {
  --bg-primary: #221810;
  --bg-secondary: #2D1E12;
  --text-primary: #E5E5E5;
  --text-secondary: #C4B8A8;
  --text-muted: #8A7D6E;
  --accent: #D2A857;
  --accent-hover: #E7D5A5;
  --border: #3D2A1A;
  --shadow: rgba(0, 0, 0, 0.3);

  --success: #8FA36C;
  --danger: #D97155;
  --warning: #D97706;
}
```

### 4.2 Typography
- **Inter** — all UI chrome, body text, anything Latin-script.
- **Noto Sans Ethiopic** — Amharic body text.
- **Noto Naskh Arabic** (primary) / **Amiri** (fallback) — Quran verse blocks
  specifically, distinct from the UI font, `dir="rtl"` scoped locally to the
  Arabic text only, not the surrounding page.

### 4.3 No-default-chrome behaviors (build these before feature work)
- Custom accent-colored text selection (`::selection`)
- Thin custom scrollbars (not browser default)
- Custom loading animation — **not a generic spinner.** Logo doesn't exist yet
  (Miqdad hasn't designed it), so build a simple placeholder geometric mark in
  `--accent` for now; swap in the real logo animation once designed. Don't
  block frontend work on the logo.
- Toasts slide in from bottom-right
- Modals: centered, backdrop blur, branded buttons (never native `confirm()`/
  `alert()`)
- `--focus-ring` replaces any stripped default browser focus outline —
  accessibility requirement, not optional, since "no default chrome" includes
  removing default focus indicators.

---

## 5. DATA MODELS

### 5.1 User
```
User {
  _id
  name
  email
  passwordHash: string | null   // optional — null for Google-only accounts
  googleId: string | null       // unique, sparse — set for Google-authenticated users
  role: 'member' | 'contributor' | 'super_admin'
  emailVerified: boolean
  bookmarks: [ArticleId]        // members only
  createdAt
}
```
Invariant: a user must have **either** `passwordHash` **or** `googleId`,
never neither. Auth supports both **email/password and "Continue with
Google"** — this was in the original brand vision (`My Main Prompt.md`:
*"the 2 option is with email & continue with google"*) and the archive's
`Security.md` already specifies the flow: Redirect → Google → Callback → JWT,
via `passport-google-oauth20`. Account linking on Google callback: match by
`googleId` first, then by verified `email` (link to existing account rather
than duplicate), then create new if neither matches.

Only three roles exist in v1. No `admin` tier between `contributor` and
`super_admin`. Author/Reviewer/Moderator/Translator are future-only, not
built.

### 5.2 Article (shared shell — language-agnostic)
```
Article {
  _id
  topicId: ref Topic
  category
  tags: [string]
  authors: [{ userId, role }]
  coverImage: { url, alt }
  articleType: 'shubha' | 'term' | 'general'
  nextRelatedShubha: ArticleId | null   // shubha type only
  createdAt
  updatedAt
}
```

### 5.3 ArticleTranslation (one per language, independent status)
```
ArticleTranslation {
  _id
  articleId: ref Article
  language: 'en' | 'am'
  title
  slug
  content: TipTapJSON            // sole source of truth — no MDX field, ever
  status: 'draft' | 'in_review' | 'changes_requested' | 'published' | 'archived'
  reviewNotes: string            // populated when status = changes_requested
  seo: { metaTitle, metaDescription }
  publishedAt
  authorId: ref User
  versionHistory: [{ editorId, timestamp, summary }]
}
```
**Why split from Article:** independent EN/AM publish timing (English can go
live while Amharic is still being translated, with a "translation coming
soon" fallback banner instead of a 404), a clean home for a future Translator
role, and painless addition of Oromo/Tigrinya/Somali later without schema
explosion on every field.

**Wikipedia-link marks target `Article._id`, never a translation ID** — so a
link inserted while writing in English resolves correctly when a reader is in
the Amharic version too.

### 5.4 ArticleLink (graph structure only — no preview content stored here)
```
ArticleLink {
  _id
  sourceArticleId
  targetArticleId
  createdAt
}
```
Used for: what-links-to-what, related-content surfacing, broken-link checks.
**Never store title/description/coverImage here** — hover previews fetch live
via `GET /articles/:id/preview`, cached client-side with TanStack Query. A
duplicated preview cache would drift stale the moment the target article's
title changes; this way it can't.

### 5.5 Topic
```
Topic {
  _id
  name: { en, am }
  slug: { en, am }
  parentTopicId: ref Topic | null   // nesting = "Topic is a folder"
  description
}
```

### 5.6 TipTap custom node/mark types

**Link mark** (extends TipTap's built-in `Link` mark, not a new node):
```
{ targetArticleId }
```
No relationship taxonomy (`explains`/`refutes`/etc. — deliberately dropped,
real UX friction for negligible v1 value). "Red links" (link to a
not-yet-created article) are v1.1+, not built now.

**Quran verse block:**
```
{ surah, ayah, arabicText, translation, translationSource }
```

**Hadith block:**
```
{ text, narrator, source, grade }
```

**Bible verse block:**
```
{ book, chapter, verse, translationVersion, text }
```
`translationVersion` (KJV/NIV/etc.) matters for apologetics accuracy — never
omit it.

**Evidence Image block** (distinct from a plain inline image — this one
carries a citation, like a footnote that happens to be a picture):
```
{
  primaryImage: { url, alt },
  secondaryImage: { url, alt } | null,   // e.g. book/volume cover beside a source page
  caption,
  citation: { sourceType, title, author, publisher, year, page?, url? }
}
```

**Inline image** (decorative/illustrative, no citation):
```
{ url, caption, altEn, altAm, alignment: 'left' | 'center' | 'right' | 'full' }
```

**Footnote** (inline node, carries its own citation — not a marker into a
separately maintained list):
```
{ citation: { sourceType, title, author, publisher, year, page?, url? } }
```
Numbering is **computed at render time from document order, never stored** —
avoids drift if a footnote gets inserted earlier in the article later. Renders
as superscript + hover popover (reuse the link-preview popover component) +
auto-collected numbered list at article end.

**Callout** (one generalized node, not one type per box):
```
{ variant: 'warning' | 'info' | 'answer' | 'summary' | 'claim', content }
```
`claim` variant renders neutral/grey (fair steelmanning of an opposing
argument — don't editorialize it with accent color). `answer` variant renders
accent-colored (the payoff, gets the visual weight).

**Standard nodes** (no custom work needed): heading (h1–h4), paragraph,
bullet/ordered list, blockquote, table.

### 5.7 Article types
`articleType: 'shubha' | 'term' | 'general'`

- **`term`** — plain explainer entries (e.g. "Trinity," "Tahrif"). The
  canonical definitions that `shubha` articles link out to instead of
  re-explaining terms inline every time.
- **`shubha`** — argument/refutation articles. **Auto-scaffold on creation**
  with this structure pre-filled as the initial TipTap document (as Callout
  and heading nodes, not just a blank page):
  1. Clear Shubha heading
  2. Hook + intro
  3. Central Claim (`callout variant="claim"`)
  4. Short Answer (`callout variant="answer"`)
  5. Explanation — simple language
  6. Analogy/example/image, when needed
  7. Evidence & Sources (Evidence Image blocks, visual + translation)
  8. Conclusion
  9. Summary (`callout variant="summary"` — text form for v1; an
     auto-generated visual mind-map is v1.1+, not built now)
  10. Next Related Shubha — uses the structured `nextRelatedShubha` field
      (Section 5.2), rendered as a distinct "Continue Reading" card at the
      article's end, not an inline link.
- **`general`** — everything else (e.g. a historical/research piece like a
  manuscripts article). No auto-scaffold.

---

## 6. EDITOR & LINKING SYSTEM

- **TipTap JSON is the sole source of truth.** No MDX field, anywhere, ever —
  MDX is executable JSX and a real injection risk the moment Contributor-
  authored content exists. Rich blocks are TipTap custom nodes (Section 5.6),
  which are inert data that can only render into predefined components.
- **Insertion UX:** slash command (`/`) as the primary way to insert any
  block, plus a lean selection toolbar for bold/italic/link. Notion-style, not
  a cluttered permanent toolbar.
- **Wikipedia-style linking:** extended `Link` mark carrying `targetArticleId`
  (Section 5.6). Hover triggers a live preview fetch, cached via TanStack
  Query — never a stored/cached preview on the link record itself.

---

## 7. WORKFLOW & ROLES

```
Contributor:  draft → in_review
Super Admin:  in_review → published   (or → changes_requested, with notes)
Super Admin's own writing: draft → published directly (self-publish, trusted —
                            no rank exists above Super Admin to enforce review)
published ⇄ archived   (Super Admin only, reversible)
```

- A **Contributor** can create/edit their own drafts, submit to review, and
  edit+resubmit from `changes_requested`.
- A **Contributor can never directly edit already-published content.**
  Fixes/improvements go through a new `in_review` cycle — protects published
  accuracy on an apologetics platform where correctness matters.
- **Super Admin** can approve/send-back reviews, archive/unarchive, and edit
  anyone's content directly.
- Cross-review between Super Admins (if there's more than one) stays
  **informal/optional, not system-enforced.**
- **No notification system, no email for status changes, in v1.** Super
  Admin's dashboard "Pending Review" count and filtered Articles view already
  serve as their notification. Contributors see status directly on their own
  "My Submissions" list — reuse the `status` field, don't build a separate
  notification data model.

---

## 8. ADMIN PANEL (v1)

```
Dashboard  — stats cards (users/articles/resources/pending-review count)
             + recent activity feed + quick actions. NO charts yet — no
             meaningful volume at launch to make them worth building.
Content
  ├── Topics     — tree view, add/edit/merge/delete
  ├── Articles   — All / Drafts / In Review / Changes Requested /
  │                Published / Archived
  └── Resources  — all / upload / categories
Users — all users, filter by role + banned, manual promote button
        (Member → Contributor) on a user's profile
```

**Explicitly cut from v1 — do not build these:**
- Debates (undesigned content type — needs its own dedicated session, not a
  placeholder tab)
- Courses (v2)
- Calendar, embedded Google Analytics, cache/maintenance-mode tools,
  error-log viewer
- **Custom DB backup/restore/clear-data tools in the web UI** — real
  operational risk for a 2-person team. Rely on MongoDB Atlas's native backup
  + manual `mongodump`/`mongorestore` run locally when actually needed. Never
  expose a "clear database" or "restore" button through a browser.
- A Notifications nav section (see Section 7)

**Policies pages** (Privacy/ToS/Cookie/Disclaimer/Advertising) are **static
code-based pages**, not admin-editable CMS content — they change rarely and
don't need a CMS section.

---

## 9. TELEGRAM BOT

- Runs in the **same Express process as the API** — one Render service, not
  two.
- **Webhook mode, not long-polling.** `POST /bot/webhook`. An idle bot costs
  nothing this way; long-polling would run a permanent loop burning resources
  even when nobody's using it — matters on a shared, resource-constrained
  instance.
- **Per-Telegram-user-ID rate limiting** on bot message handling, separate
  from the API's IP-based rate limiting (Telegram users don't have a
  meaningful IP on your side). Prevents one abusive user or a bot loop from
  monopolizing the shared Node process and slowing down the actual website.
- **v1 scope is intentionally minimal** — contact/inquiry-oriented, not the
  full search/quiz/reminder companion from early brainstorming. Exact feature
  list still needs its own dedicated session before building beyond the
  basics — don't over-build this without checking first.

---

## 10. EMAIL SYSTEM

- **Centralized service, never scattered.** No `sendEmail()` calls inline in
  route handlers — every email goes through a named function
  (`sendVerificationEmail(user)`, `sendPasswordResetEmail(user)`) living in
  one email service module.
- **Shared `IshraqEmailLayout` component** (header/footer/branding), built
  React-Email-style so templates are components, not raw HTML strings. Uses
  Sandalwood Folio branding — email is another branded UI surface, not an
  ugly default.
- **Only two templates for v1: `VerificationEmail` and `PasswordResetEmail`.**
  These are baseline auth requirements, not scope creep. Everything else from
  early brainstorming (course enrollment/reminder, new-article-published
  broadcast, security alerts) is deferred alongside the features they depend
  on — Courses don't exist until v2, and a "new article" broadcast email is
  exactly the notification system already cut in Section 7. Build the
  architecture to make adding templates cheap later; don't build the
  templates themselves yet.
- **Provider: Resend.** Sends from `no-reply@ishraqhub.com`.

---

## 11. ARTICLE PAGE ANATOMY (reader-facing)

Designed mobile-first — Ethiopia's internet usage skews heavily mobile, and
the Telegram bot exists specifically because people read on phones. Don't
design desktop-first and shrink down.

```
Breadcrumb: Topic › Subtopic
[Hero image, full-bleed]
H1 Title
Author · Date · Reading time · [EN/AM toggle]
──────────────────────────────
Body (max ~720px column — right for 18px/1.75 line-height body text,
      keeps line length in the readable 65–75 character range)
  font-size: 1.125rem, line-height: 1.75
  h1: 2.5rem/700, h2: 1.875rem/600, h3: 1.5rem/600, h4: 1.25rem/600
  → headings, paragraphs, quotes, images, Quran/Hadith/Bible blocks,
    tables, callouts, footnote markers, in document order
──────────────────────────────
References (auto-numbered)
FAQ accordion (if present — v1.1+ feature)
Related Concepts (linked tags)
Related Articles (same topic)
```

**Table of Contents:** a sticky **"Jump to section" button**, not a permanent
sidebar — opens a bottom-sheet list of headings on tap. Identical pattern on
mobile and desktop. This is a deliberate choice: a persistent sidebar reads as
a documentation site; Ishraq Hub is a premium editorial experience (video
intros, sponsor sections planned for the homepage), not a wiki-styled docs
tool. Desktop *may* optionally add a slim sticky sidebar version later, but
the mobile pattern is primary, not a fallback.

**Quran/Bible blocks:** `dir="rtl"` scoped locally to just the Arabic text
inside the block. Translation text below/beside in normal LTR flow. Rest of
the page is unaffected.

---

## 12. EXPLICITLY NOT IN SCOPE FOR THIS BUILD

Do not build these unless a future instruction says otherwise. They are
either designed-but-deferred, or genuinely undesigned:

- Debates content type (undesigned — different structure from Articles
  entirely, needs its own session)
- Course system (schema designed in the archive, but v2 — don't build)
- FAQ accordion, footnote-adjacent advanced citation formats beyond what's in
  Section 5.6
- Any notification center or transactional email beyond Verification/
  Password Reset
- Calendar, analytics dashboards, DB management UI, error-log viewer
- Payment processing of any kind
- Any role beyond Member/Contributor/Super Admin
- "Red links" (linking to a not-yet-created article)
- Auto-generated visual mind-map summaries

---

## 13. BASELINE SECURITY (adopt as default; deeper security review still pending)

These are standard, non-controversial practice — build them in from the
start, but treat this section as a floor, not a substitute for a dedicated
security review before real launch:

- JWT in HTTP-only cookies, never localStorage
- All input validated server-side (e.g. Zod schemas) before it touches the
  database, regardless of client-side validation
- Rate limiting on all public API endpoints, not just auth routes
- No user-submitted content ever renders as raw HTML — TipTap JSON only
  renders through predefined node components (this is also what Section 6
  guarantees structurally)
- Environment variables for all credentials, `.env` gitignored (Section 1.4)
- MongoDB Atlas network access is intentionally broad
  (`0.0.0.0/0`) as a calculated tradeoff — compensate with strong DB user
  credentials and zero direct DB exposure through the API layer

---

*End of Master Prompt. Update this document as new decisions get logged in
`docs/roadmap/decisions-log.md` — don't let it drift out of sync with reality.*
