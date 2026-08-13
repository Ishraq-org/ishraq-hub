# Execution Prompt 01 — Project Foundation & Theme System

Read `prompt/Master/MASTER_PROMPT.md` in full before starting if you haven't
already — every convention below assumes it, and this prompt won't repeat
things already specified there.

## Goal

Stand up a working monorepo skeleton for both apps, with the light/dark theme
system fully functional end-to-end before any feature work begins (Master
Prompt §1.3 and §4 — this cannot be retrofitted later, it has to be true from
the first component).

## 1. Initialize `apps/web`

- Vite + React + TypeScript
- Install: Tailwind CSS, shadcn/ui, Zustand, TanStack Query, React Router
- Configure Tailwind so its default color palette is effectively unused —
  every color reference must go through the CSS custom properties in Master
  Prompt §4.1, never a raw Tailwind color utility
- Create `apps/web/src/styles/theme.css` with the full `:root` and
  `[data-theme="dark"]` variable blocks from Master Prompt §4.1, verbatim
- Build a `ThemeProvider` (React context):
  - Defaults to the system's `prefers-color-scheme` on first load
  - Persists a manual override in `localStorage` — this is a real deployed
    site, not a sandboxed artifact, so `localStorage` is the correct tool
    here
  - Sets/removes `data-theme="dark"` on `<html>`
  - Exposes a `useTheme()` hook and a toggle button component
- Wire `QueryClientProvider` (TanStack Query) at the app root — no real
  queries yet, just the provider in place
- Before calling this step done: search the codebase for `bg-white`,
  `text-gray-`, `border-slate-`, and similar raw Tailwind color classes.
  There should be zero matches outside `theme.css` itself.

## 2. Build `icons.jsx`

- `apps/web/src/components/icons.jsx` — wraps Lucide icons, exports a single
  `<Icon name="..." />` component
- Seed with what's needed immediately: sun/moon (theme toggle), menu, search,
  close, chevron-down, user, external-link
- No raw SVGs anywhere else in the codebase, no inline Lucide imports outside
  this one file

## 3. Initialize `apps/api`

- Node + Express + TypeScript + Mongoose
- `.env.example` with placeholders for: `MONGO_URI`, `JWT_SECRET`,
  `CLOUDINARY_URL`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `PORT`
- MongoDB Atlas connection module in `config/`
- One route: `GET /api/health` → `{ status: 'ok' }`
- Confirm `.env` is gitignored (should already be — verify, don't assume)

## 4. Folder scaffolding

Create the folder structure from Master Prompt §3 inside both `apps/web/src`
and `apps/api/src`. Empty folders with a `.gitkeep` where nothing exists yet
is fine — don't invent placeholder files or example code that isn't real.

## 5. Confirm & commit

- `apps/web` runs (`npm run dev`) and shows a blank page whose theme toggle
  correctly switches between light/dark, persists on reload, and respects
  system preference on first visit
- `apps/api` runs and `GET /api/health` responds correctly
- Commit message: `"Project foundation: monorepo scaffold, theme system,
  health check"`
- Push to `main`

## Out of scope for this prompt

No real pages, no components beyond the theme toggle, no data models yet, no
routes beyond health-check. Foundation only — the next prompt builds on this.
