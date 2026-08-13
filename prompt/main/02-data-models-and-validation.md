# Execution Prompt 02 — Data Models & Validation Layer

Assumes Prompt 01 is complete (monorepo running, theme system working, health
check responding). References Master Prompt §5 throughout — read that section
again before starting; this prompt fills in the implementation-level detail
Master Prompt intentionally left as schema-level, not field-by-field.

## Goal

Build every Mongoose model, its matching Zod validation schema, and its
shared TypeScript type — with nothing invented or guessed. If a field's
validation rule isn't specified below, that's a gap to flag, not a gap to
fill in silently.

## 0. Pattern to follow for every model

For each model, build three things, in this order:

1. **Zod schema** in `packages/shared-types/src/schemas/<model>.ts` — this is
   the single source of truth for shape + validation rules.
2. **TypeScript type** inferred from the Zod schema (`z.infer<typeof
   ArticleSchema>`) — exported from the same file. Never hand-write a
   duplicate interface that can drift out of sync with the Zod schema.
3. **Mongoose model** in `apps/api/src/models/<Model>.ts` — imports the
   inferred type for the document interface, defines the actual Mongoose
   schema (indexes, refs, defaults, hooks) separately, since Mongoose schema
   syntax and Zod schema syntax aren't interchangeable, but both must agree
   on shape.

This gives request validation (Zod, at the API boundary, per Master Prompt
§13 "server-side validation regardless of client-side validation") and
database-level structure (Mongoose) from one shared definition, and gives
`apps/web` the same types via `packages/shared-types` with zero duplication.

Add a `validation/` folder under `apps/api/src/` (not in the original Master
Prompt §3 folder list — this is a necessary addition, not a contradiction) for
Express middleware that runs each request body through the relevant Zod
schema before it reaches a controller.

## 1. User

```
User {
  name: string                          required, min 2 chars
  email: string                         required, unique, lowercase,
                                         valid email format
  passwordHash: string                  required, never exposed in any
                                         API response — exclude at the
                                         Mongoose schema level (select: false)
  role: 'member' | 'contributor' | 'super_admin'
                                         required, default 'member'
  emailVerified: boolean                default false
  emailVerificationToken: string | null token for the verify-email flow
  emailVerificationExpires: Date | null
  passwordResetToken: string | null     token for the reset-password flow
  passwordResetExpires: Date | null
  bookmarks: ObjectId[]                 ref Article, default []
  createdAt: Date                       timestamps
  updatedAt: Date
}
```

**Notes:**
- Verification/reset token fields aren't in the Master Prompt's short schema
  sketch — they're a necessary addition, since Master Prompt §10 requires a
  working Verification and Password Reset email flow, and that flow needs
  somewhere to store the token and its expiry. Flagging this explicitly as an
  implementation-necessary extension, not a scope addition.
- Hash passwords with **bcrypt** (cost factor 12) in a Mongoose `pre('save')`
  hook, only when `passwordHash` is modified — never hash an already-hashed
  value on unrelated updates.
- Index: unique index on `email`.
- Zod schema for registration input is a *subset* of this (name, email,
  password — not passwordHash, not role, not tokens). Don't reuse the full
  User schema for request validation; write a narrower `RegisterInputSchema`.

## 2. Article (shared shell)

```
Article {
  topicId: ObjectId              ref Topic, required
  category: string                required
  tags: string[]                  default []
  authors: [{ userId: ObjectId, role: string }]   ref User, required, min 1
  coverImage: { url: string, alt: string } | null
  articleType: 'shubha' | 'term' | 'general'      required
  nextRelatedShubha: ObjectId | null              ref Article
  createdAt: Date
  updatedAt: Date
}
```

**Notes:**
- Validate at the application layer: `nextRelatedShubha` should only be
  settable when `articleType === 'shubha'` — enforce this in the Zod schema
  with a `.refine()`, not just at the UI layer.
- Index: `topicId`, `articleType`.

## 3. ArticleTranslation

```
ArticleTranslation {
  articleId: ObjectId             ref Article, required
  language: 'en' | 'am'           required
  title: string                   required, min 3 chars
  slug: string                    required, lowercase, URL-safe
                                   (auto-generated from title on create,
                                   editable after — see slug utility below)
  content: TipTapDocument          required — see Section 4 for the node
                                   schemas that validate this
  status: 'draft' | 'in_review' | 'changes_requested' | 'published' | 'archived'
                                   required, default 'draft'
  reviewNotes: string | null       only meaningful when status = 'changes_requested'
  seo: { metaTitle: string, metaDescription: string } | null
  publishedAt: Date | null
  authorId: ObjectId               ref User, required
  versionHistory: [{ editorId: ObjectId, timestamp: Date, summary: string }]
                                   default []
}
```

**Notes:**
- Compound unique index: `{ articleId: 1, language: 1 }` — one translation
  per language per article, enforced at the database level, not just
  application logic.
- Compound unique index: `{ language: 1, slug: 1 }` — slugs only need to be
  unique within a language, not globally.
- **Slug generation utility** (`apps/api/src/services/slugify.ts`): generate
  from `title` on creation (lowercase, spaces→hyphens, strip non-URL-safe
  characters). On collision, append `-2`, `-3`, etc. — check against the
  compound index, don't just assume uniqueness.
- `content` is `Schema.Types.Mixed` at the Mongoose level (TipTap JSON has no
  fixed shape Mongoose can express), but **must** be validated by the Zod
  `TipTapDocumentSchema` (Section 4) before ever reaching `.save()` — this is
  the concrete implementation of Master Prompt §13's "no user-submitted
  content ever renders as raw HTML" requirement; validation is what makes
  that true.

## 4. TipTap node validation (Zod only — not separate Mongoose models)

These aren't collections. They're the shapes allowed inside
`ArticleTranslation.content`. Build one Zod schema per node type in
`packages/shared-types/src/schemas/tiptap-nodes.ts`, then a discriminated
union `TipTapNodeSchema` covering all of them, and a recursive
`TipTapDocumentSchema` that validates a full document tree.

```
QuranVerseNode    { type: 'quranVerse', surah: number, ayah: number,
                     arabicText: string, translation: string,
                     translationSource: string }

HadithNode        { type: 'hadith', text: string, narrator: string,
                     source: string, grade: string }

BibleVerseNode     { type: 'bibleVerse', book: string, chapter: number,
                     verse: string, translationVersion: string, text: string }

EvidenceImageNode  { type: 'evidenceImage',
                     primaryImage: { url: string, alt: string },
                     secondaryImage: { url: string, alt: string } | null,
                     caption: string,
                     citation: {
                       sourceType: 'book' | 'journal' | 'website' | 'other',
                       title: string, author: string, publisher: string,
                       year: number, page: number | null, url: string | null
                     } }

InlineImageNode    { type: 'inlineImage', url: string, caption: string,
                     altEn: string, altAm: string,
                     alignment: 'left' | 'center' | 'right' | 'full' }

FootnoteNode       { type: 'footnote',
                     citation: { same shape as EvidenceImageNode.citation } }

CalloutNode        { type: 'callout',
                     variant: 'warning' | 'info' | 'answer' | 'summary' | 'claim',
                     content: TipTapDocument }   // recursive — a callout
                                                  // contains nested content

LinkMark           { type: 'link', targetArticleId: string }
                     // this is a MARK applied to text, not a node —
                     // validate it as part of text-node marks, not as a
                     // top-level node type
```

Reject any node `type` not in this list at validation time — don't silently
pass through unknown node shapes.

## 5. ArticleLink

```
ArticleLink {
  sourceArticleId: ObjectId       ref Article, required
  targetArticleId: ObjectId       ref Article, required
  createdAt: Date
}
```

- Index both `sourceArticleId` and `targetArticleId` — queries go both
  directions ("what does this link to" and "what links to this").
- No preview content on this model. Reminder from Master Prompt §5.4: this is
  graph structure only.
- Build a service function `syncArticleLinks(articleTranslationId)` that
  parses a saved `content` tree, extracts every `link` mark's
  `targetArticleId`, and upserts/removes `ArticleLink` rows to match — called
  after every successful `ArticleTranslation` save. Don't maintain this by
  hand in multiple places; one function owns it.

## 6. Topic

```
Topic {
  name: { en: string, am: string }          required
  slug: { en: string, am: string }          required
  parentTopicId: ObjectId | null            ref Topic — self-reference for
                                             the folder-style nesting
  description: { en: string, am: string } | null
}
```

- Index: unique on `slug.en`, unique on `slug.am`, index on `parentTopicId`.
- `parentTopicId` must not create a cycle (a topic can't be its own ancestor)
  — validate this in the service layer when a topic's parent is changed, not
  just on creation.

## 7. Confirm & commit

- Every model has its Zod schema, inferred type, and Mongoose model in place
- Write a small script or test (your choice which) that: creates a User,
  creates a Topic, creates an Article, creates an ArticleTranslation with a
  minimal valid `content` tree containing at least one `quranVerse` node and
  one `link` mark, and confirms `syncArticleLinks` produces the expected
  `ArticleLink` row. Delete the test data after — this is a smoke test, not
  seed data.
- Confirm an invalid `content` tree (e.g. an unknown node `type`, or a
  `quranVerse` missing `ayah`) is rejected before it reaches the database.
- Commit message: `"Data models: User, Article, ArticleTranslation,
  ArticleLink, Topic, TipTap node validation"`
- Push to `main`

## Out of scope for this prompt

No routes, no controllers, no auth logic, no actual API endpoints yet — this
prompt is the data layer only. No seed/fixture data beyond the throwaway
smoke test above. Auth flow (registration, login, JWT, verification email
sending) is the next prompt, building on the User model defined here.
