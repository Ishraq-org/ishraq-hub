# 🕌 Ishraq Hub

**إشراق — "Illumination"**

A digital Islamic knowledge platform: organizing, preserving, and interconnecting
authentic Islamic apologetics content for the Ethiopian Ummah and beyond, through
research articles, resources, courses, and a Wikipedia-style knowledge graph.

This is **one product** under the [Ishraq](../../README.md) organization — an
independent system with its own backend, database, and codebase. It does not
assume shared infrastructure with any future Ishraq product.

- **Domain:** ishraqhub.com
- **Tagline:** "Illuminating the Ummah"
- **Team:** Aymen (web dev, video editing) + Miqdad (video editing, graphic design)
- **Status:** 🟡 Design & planning phase — nothing below is final until logged in `docs/roadmap/decisions-log.md`

---

## ⚠️ Important — Read Before Building Anything

This repo is a **skeleton**, not a scaffolded app. No framework has been installed,
no `package.json` has been written, no code has been generated. Every folder here
exists to hold something we've *agreed on* — not something assumed.

Before writing code in any folder, check `docs/roadmap/decisions-log.md` to confirm
that area has actually been locked in during discussion.

---

## 📁 Folder Structure

```
Ishraq-Hub/
├── apps/
│   ├── web/              → React + Vite frontend (public site, dashboard, admin panel)
│   └── api/               → Node + Express backend (REST API + Telegram bot, one service)
│       └── src/
│           ├── routes/
│           ├── controllers/
│           ├── models/
│           ├── services/
│           ├── middleware/
│           ├── config/
│           └── bot/       → Telegraf bot logic, lives inside the same Express service
│
├── packages/
│   ├── shared-types/       → TypeScript types shared between web + api (Article, User, etc.)
│   └── ui-kit/             → Shared icon components, design tokens, reusable primitives
│
├── design/
│   ├── theme-explorer/     → Your interactive HTML palette tool (Sandalwood Folio, etc.)
│   ├── brand-assets/       → Logo, favicon, brand guideline files
│   ├── mockups/            → Screens, wireframes, reference images
│   └── fonts/              → Amiri, and any other typefaces in use
│
├── docs/
│   ├── discussions-archive/    → Your original ChatGPT planning docs (preserved, read-only reference)
│   ├── architecture/           → System architecture docs, once finalized with Claude
│   ├── data-models/            → MongoDB schema docs, once finalized
│   ├── roles-and-permissions/  → RBAC docs, once finalized
│   ├── security/                → Security decisions & threat model
│   ├── policies/                → Privacy, Terms, Disclaimer, Contributor Agreement drafts
│   └── roadmap/                 → decisions-log.md, phase plans, milestones
│
└── scripts/                → One-off setup/dev scripts (empty for now)
```

## 🗺️ How We're Working

1. **Nothing here is final.** The `discussions-archive/` reflects your conversations
   with ChatGPT — useful context, not commitments.
2. We review one system at a time (theme → architecture → article system → roles →
   admin → security → deployment...) and once we actually agree on something, it
   gets written into `docs/roadmap/decisions-log.md` and the relevant `docs/` subfolder.
3. Code only gets written into `apps/` once its design is locked.

**Bismillah. Let's build this properly.**
