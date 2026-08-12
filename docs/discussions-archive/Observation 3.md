🏛️ Ishraq Digital Knowledge Platform — Complete System Design Document

───

📖 Table of Contents

1. Vision & Philosophy
2. Core Architecture
3. Data Models (MongoDB)
4. Feature Breakdown
· Website
· Telegram Bot
5. UI/UX Customization
6. Development Roadmap
7. Technical Stack Details
8. Security & Compliance
9. Deployment Strategy
10. Next Steps

───

1️⃣ Vision & Philosophy {#vision}

1.1 What is Ishraq?

Ishraq (إشراق — "Illumination") is a digital Islamic Knowledge Platform designed to organize, preserve, teach, and interconnect authentic Islamic apologetics knowledge through research articles, educational courses, structured resources, and modern learning experiences.

"One Brain, Two Experiences" — The website is the deep knowledge hub; the Telegram bot is the fast companion. They share the same backend, database, and user data.

1.2 Core Principles

· Knowledge‑centric — Not page‑centric. Topics, articles, courses, resources, debates all orbit around knowledge.
· Interconnected — Wikipedia‑style linking creates a knowledge graph, not isolated pages.
· User‑first — Personalisation, bookmarks, progress tracking, and notifications.
· Customised UI — No default browser styles; every visual detail is intentional.
· Scalable & Maintainable — Modular monorepo, TypeScript, clear separation of concerns.
· Engagement — The Telegram bot drives daily interaction without replacing the website.

───

2️⃣ Core Architecture {#architecture}

2.1 Monorepo Structure

We use a single repository with clear separation:

ishraq/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # UI building blocks
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities, API clients
│   │   ├── store/          # Zustand stores
│   │   ├── styles/         # Tailwind + global CSS
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── backend/                # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, logging
│   │   ├── config/         # Environment configs
│   │   └── utils/          # Helpers
│   └── package.json
├── telegram-bot/           # Telegraf bot (can be separate service)
│   ├── src/
│   │   ├── commands/       # Bot command handlers
│   │   ├── services/       # API calls, notification logic
│   │   └── index.ts
│   └── package.json
├── shared/                 # Shared types, constants, validation schemas
│   └── types/
├── docker-compose.yml      # For local development
└── README.md


2.2 Architecture Diagram

┌─────────────────────────────────────┐
                     │            End Users                │
                     └──────────┬──────────────┬───────────┘
                                │              │
                    ┌───────────▼──────────┐   │
                    │   React + Vite (FE)  │   │
                    └───────────┬──────────┘   │
                                │ REST API     │ Telegram Bot
                                │              │ (Telegraf)
                     ┌──────────▼──────────┐   │
                     │   Express API       │◄──┘
                     │   (Backend)        │
                     └──────────┬──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │ MongoDB   │   │ Cloudinary│   │  Redis    │
        │  Atlas    │   │ (Media)   │   │ (Future)  │
        └───────────┘   └───────────┘   └───────────┘


2.3 Data Flow

· All data is stored in MongoDB Atlas.
· Media (images, PDFs, videos) are stored in Cloudinary; only URLs in DB.
· The Telegram bot never accesses MongoDB directly; it calls the Express API.
· The frontend communicates via RESTful API (TanStack Query for caching).
· Authentication: JWT tokens (stored in HTTP‑only cookies for security).
· Validation: Zod on both frontend and backend.

───

3️⃣ Data Models (MongoDB) {#datamodels}

All models are defined using Mongoose with TypeScript interfaces.

3.1 User

typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;                 // unique
  password: string;              // bcrypt hashed
  telegramId?: string;           // optional, linked on connection
  telegramUsername?: string;
  role: 'member' | 'contributor' | 'reviewer' | 'editor' | 'admin';
  preferences: {
    theme: 'light' | 'dark';
    language: 'en' | 'am';       // future multilingual
  };
  notifications: {
    dailyKnowledge: boolean;
    newArticles: boolean;
    newCourses: boolean;
    courseReminders: boolean;
    resourceUpdates: boolean;
  };
  reminderTime: string;          // e.g., "08:00"
  learningStreak: number;        // consecutive days of activity
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}


3.2 Topic (Folder)

typescript
interface ITopic {
  _id: ObjectId;
  title: string;
  slug: string;                 // unique, URL‑friendly
  description: string;
  backgroundImage?: string;     // Cloudinary URL
  parentTopic?: ObjectId;       // self‑reference for subtopics
  order: number;                // manual sorting
  status: 'draft' | 'published';
  createdBy: ObjectId;          // user reference
  createdAt: Date;
  updatedAt: Date;
}


3.3 Article (File)

typescript
interface IArticle {
  _id: ObjectId;
  title: string;
  slug: string;                 // unique
  topicId: ObjectId;            // belongs to a topic
  description: string;          // short summary (for previews)
  coverImage?: string;          // Cloudinary URL
  content: string;              // MDX formatted
  tags: string[];
  authors: ObjectId[];          // user references
  references: string[];         // external URLs
  relatedArticles: ObjectId[];  // article IDs
  status: 'draft' | 'review' | 'published' | 'archived';
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


3.4 ArticleLink (Wikipedia‑style linking)

typescript
interface IArticleLink {
  _id: ObjectId;
  sourceArticleId: ObjectId;
  targetArticleId: ObjectId;
  anchorText: string;           // the word(s) linked
  startPosition: number;        // character position in content
  endPosition: number;
  context: string;              // surrounding sentence for preview
  relationship: 'explains' | 'refutes' | 'supports' | 'defines' | 'see_also';
  createdAt: Date;
}


3.5 Resource (Books, PDFs, Videos)

typescript
interface IResource {
  _id: ObjectId;
  title: string;
  description: string;
  fileUrl: string;              // Cloudinary URL
  fileType: 'pdf' | 'video' | 'audio' | 'document' | 'image';
  fileSize: number;             // bytes
  thumbnail?: string;           // Cloudinary URL
  topicId?: ObjectId;           // optional association
  tags: string[];
  downloads: number;
  uploadedBy: ObjectId;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}


3.6 Course

typescript
interface ICourse {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  instructor: ObjectId;         // user reference
  lessons: {
    _id: ObjectId;
    title: string;
    description: string;
    videoUrl: string;           // YouTube or Cloudinary
    videoDuration: number;      // seconds
    supportingFiles: {
      title: string;
      fileUrl: string;          // Cloudinary
    }[];
    order: number;
  }[];
  prerequisites: ObjectId[];    // course IDs
  price: number;                // 0 = free
  status: 'draft' | 'published' | 'archived';
  enrolledCount: number;
  completedCount: number;
  createdAt: Date;
  updatedAt: Date;
}


3.7 UserProgress

typescript
interface IUserProgress {
  _id: ObjectId;
  userId: ObjectId;
  courseId: ObjectId;
  completedLessons: ObjectId[];
  lastWatched: ObjectId;
  progress: number;             // 0–100
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}


3.8 Debate

typescript
interface IDebate {
  _id: ObjectId;
  title: string;
  slug: string;
  videoUrl: string;             // YouTube
  topicId: ObjectId;
  introduction: string;
  claims: {
    _id: ObjectId;
    timestamp: number;          // seconds (e.g., 21:20 → 1280)
    claim: string;
    response: string;
    evidence: ObjectId[];       // resource IDs
    responseType: 'refutation' | 'explanation' | 'context';
  }[];
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


3.9 Bookmark

typescript
interface IBookmark {
  _id: ObjectId;
  userId: ObjectId;
  contentId: ObjectId;          // ID of article/course/resource/debate
  contentType: 'article' | 'course' | 'resource' | 'debate';
  note: string;
  createdAt: Date;
}


3.10 Notification

typescript
interface INotification {
  _id: ObjectId;
  userId: ObjectId;
  type: 'new_article' | 'new_course' | 'course_reminder' | 'daily_knowledge' | 'comment_reply';
  title: string;
  body: string;
  data: {
    link: string;               // full URL
    contentId: ObjectId;
    contentType: string;
  };
  read: boolean;
  createdAt: Date;
}


3.11 Indexing Strategy (Performance)

· slug fields → unique indexes
· topicId on articles → for fast filtering
· userId on progress/bookmarks
· telegramId on users for bot lookups
· createdAt for sorting and daily knowledge queries

───

4️⃣ Feature Breakdown {#features}

4.1 Website Features

Public Pages

· Homepage — 3D animated hero (Three.js), intro video, sponsor section, featured content.
· Topics — Browse by category; each topic page lists subtopics, articles, resources, courses.
· Article View — Full‑screen reading with:
· Wikipedia‑style hover previews for linked terms.
· Table of contents (auto‑generated from headings).
· Related articles/courses/resources at the bottom.
· Bookmark button, share options.
· Course Catalog — Browse courses, view details, enroll.
· Course Player — Video + supporting files, track progress.
· Debate View — YouTube video + interactive claim/response cards; click on timestamps to jump.
· Resource Library — Search and filter by type/tags; download with ad interstitial.
· Search — Unified search across articles, topics, courses, resources, debates.
· Policies — Privacy, Terms, Disclaimer, Cookies, Ad Policy, Copyright.

Authenticated Pages

· Dashboard — Summary of bookmarks, course progress, reading history.
· Profile Settings — Update name, email, password, notification preferences, theme.
· Bookmarks Manager — Organise saved content.
· Reading Reminders — Show articles you’ve bookmarked but not finished.

Admin & Contributor Pages

· Admin Dashboard — Overview of users, content stats, reports.
· Content Management — CRUD for topics, articles, courses, resources, debates.
· User Management — List, role assignment, ban/unban.
· Review Queue — Contributors submit articles → reviewers approve/request changes.
· Analytics — Views, downloads, enrollments, user growth.

───

4.2 Telegram Bot Features

Account Linking

· /start → Welcome message with a link to website for OAuth‑like connection.
· After linking, bot knows the user’s preferences and progress.

Knowledge Search

· /search <query> → Returns articles, resources, courses, debates with snippets and deep‑links.
· The bot uses the same API as the website, ensuring consistent results.

Resource Finder

· /resource <query> → Lists downloadable materials; each with a "Open in Ishraq" button.

Personalized Notifications (User‑controlled)

Users opt‑in/out via bot settings:

· New articles in their favourite topics
· New courses
· Course reminders (e.g., "You haven't continued Lesson 3")
· Daily knowledge (curated content every morning)
· Resource updates

Reading Companion

· If a user bookmarks an article but doesn't read it in 3 days, the bot sends a gentle reminder.

Course Companion

· After each lesson, ask: "Do you want to continue to the next lesson?" with a deep‑link.

Daily Knowledge

· Optional daily message: "Today’s Knowledge: [Title]" with a short summary and "Read full article" button.

User Dashboard Summary

· /profile → Returns: bookmarks count, courses in progress, completed lessons, saved resources.

Deep Links Everywhere

Every message includes buttons that link directly to specific content on the website (e.g., /articles/sanaa-manuscripts).

Architectural Note:

· The bot runs as a separate process (or serverless function) that listens for webhooks or polling.
· It never reads from MongoDB; all data comes from the Express API.
· Notifications are triggered by backend events (e.g., article published) or scheduled cron jobs (e.g., daily knowledge).
· Rate limiting and queueing (via Redis later) ensure we don't hit Telegram's limits.

───

5️⃣ UI/UX Customization {#uiux}

5.1 Theme System (Bulletproof Dark/Light)

We use CSS Variables and a single data-theme attribute on <html>.

css
:root {
  --bg-primary: #F2EEE6;
  --bg-secondary: #FFFFFF;
  --text-primary: #543520;
  --text-secondary: #3D2516;
  --accent: #B5822E;
  --accent-hover: #D2A857;
  --border: #E5DDD0;
  --shadow: rgba(84, 53, 32, 0.1);
  --radius: 8px;
  --font-sans: 'Inter', system-ui, sans-serif;
}

[data-theme="dark"] {
  --bg-primary: #221810;
  --bg-secondary: #2D1E12;
  --text-primary: #E5E5E5;
  --text-secondary: #C4B8A8;
  --accent: #D2A857;
  --accent-hover: #E7D5A5;
  --border: #3D2A1A;
  --shadow: rgba(0, 0, 0, 0.3);
}


· Toggle is a simple button that sets document.documentElement.dataset.theme.
· All components use these variables, so no context/prop drilling needed.
· Tailwind config extends these variables for utility classes.

5.2 No Default Chrome

We override:

· Text selection → ::selection { background: var(--accent); color: #fff; }
· Scrollbars → custom thin scrollbars with our colors.
· Loading → a custom animated logo (pulsing Ishraq emblem) – no generic spinner.
· Toasts/Notifications → slide‑in from bottom‑right with our styling.
· Modals → custom overlay with backdrop blur, centred, with branded buttons.
· Icons → central <Icon name="..." size="..." /> component wrapping Lucide icons.

We never use emojis – all icons are SVGs from Lucide (or custom). The <Icon> component can be extended with custom paths.

5.3 Rich Text Editor (TipTap)

We'll use TipTap (headless WYSIWYG) because it's:

· Highly customisable (extensions for mentions, links, images, tables, code blocks).
· Provides a clean, structured JSON output that we can render as MDX or HTML.
· Built for React.

Custom extensions we'll build:

· Insert Quran – opens a modal to search and insert a verse (with Arabic, translation, tafsir).
· Insert Hadith – similar.
· Insert Citation – reference a book/author with footnote styling.
· Insert Timeline – for debates (timestamps).
· Insert Warning Box – callout boxes.
· Insert Related Article – link to another article with preview.
· Insert Arabic / Insert Translation – toggles between scripts.

5.4 MDX for Articles

We store article content as MDX – Markdown with JSX components. This allows us to embed rich interactive components (e.g., Quran verses, charts) inside articles. The frontend will use @mdx-js/react to render.

5.5 Custom Components Library

We'll build a set of reusable components using shadcn/ui as a foundation, then customise:

· Buttons – primary (accent), secondary, outline, ghost.
· Cards – with hover effects and image overlays.
· Tables – for data grids.
· Forms – with validation and custom styling.
· Badges – for tags, statuses.

───

6️⃣ Development Roadmap {#roadmap}

Phase 0: Foundation (Week 1–2)

· Monorepo setup with pnpm/npm workspaces.
· Environment configs (.env).
· Express server with basic health endpoint.
· MongoDB connection (Mongoose).
· User authentication (JWT, bcrypt, Google OAuth).
· Tailwind + shadcn/ui installed in frontend.
· Global CSS with theme variables.
· Base routing (React Router).
· Custom Icon component, Loading, Toast, Modal.

Phase 1: Core Content Management (Week 3–5)

· Topic CRUD API + frontend pages.
· Article CRUD API + frontend pages (including TipTap editor).
· MDX rendering on article view.
· Wikipedia‑style linking: store ArticleLink entries; create preview popover.
· Resource upload (Cloudinary) + CRUD.
· Search basic (MongoDB text search).

Phase 2: User Features (Week 6–8)

· User dashboard (bookmarks, progress, profile).
· Bookmark system.
· Reading history / reminders.
· Notification preferences (frontend + API).

Phase 3: Course System (Week 9–11)

· Course model + API.
· Lesson management.
· Video embedding (YouTube/Cloudinary).
· Enrollment and progress tracking.
· Course player page.

Phase 4: Debates & Advanced (Week 12–14)

· Debate model + API.
· Debate view with timestamp linking.
· Advanced search (maybe ElasticSearch or MeiliSearch).
· Related content recommendations.
· Admin dashboard (analytics, user management).

Phase 5: Telegram Bot (Week 15–17)

· Bot setup (Telegraf, webhook/polling).
· Account linking flow.
· Search command.
· Resource command.
· Profile command.
· Notification system (event‑driven + cron).
· Daily knowledge scheduler.
· Deep‑link buttons.

Phase 6: Polish & Launch (Week 18–20)

· SEO (React Helmet, sitemap, meta tags).
· Performance optimisation (lazy loading, code splitting).
· Accessibility audit.
· Legal pages (Privacy, Terms, Cookies).
· Cookie consent banner.
· AdSense integration (non‑intrusive).
· Testing (unit, integration, e2e).
· Deployment to Netlify (frontend) & Render (backend + bot).
· Monitoring (Sentry, logs).

───

7️⃣ Technical Stack Details {#stack}

Layer Technology Purpose
Frontend React 18 + Vite + TypeScript App building
UI Tailwind CSS + shadcn/ui Styling & components
State Zustand (UI), TanStack Query (API) Client state
Routing React Router v6 Navigation
Editor TipTap (headless) Rich text editing
Content MDX Article format
Backend Node.js + Express + TypeScript API server
Database MongoDB Atlas + Mongoose Data persistence
Validation Zod Schema validation
Auth JWT + bcrypt + Google OAuth User authentication
Media Cloudinary Images, PDFs, video storage
Bot Telegraf (TypeScript) Telegram bot
Email Nodemailer / Resend Transactional emails
Search MongoDB text (then ElasticSearch later) Search
Queue BullMQ + Redis (future) Background jobs
Caching Redis (future) Performance
Deployment Netlify (FE), Render (BE + Bot) Hosting
Domain Ishraqhub.com Custom domain

───

8️⃣ Security & Compliance {#security}

Authentication & Authorization

· JWT stored in http‑only cookies (secure, same‑site strict) to prevent XSS.
· Google OAuth for social login.
· Role‑based access control (RBAC) – middleware checks roles on protected endpoints.
· Password hashing with bcrypt (salt rounds = 12).

Data Protection

· All sensitive data (email, password) encrypted at rest in MongoDB Atlas.
· API requests over HTTPS only.
· Input validation with Zod to prevent injection.
· Rate limiting on endpoints (express‑rate‑limit) to prevent brute force.

Privacy & Cookies

· Cookie consent banner (sliding from footer) – user must accept before storing non‑essential cookies.
· Cookie policy page explains usage.
· User can delete account and associated data.

Legal Pages

We will create:

· Privacy Policy
· Terms of Service
· Disclaimer (for academic content)
· Cookie Policy
· Advertising Policy
· Copyright/DMCA Takedown

Content Moderation

· Articles and resources go through a review process before publication.
· Contributors submit; editors/reviewers approve or request changes.

AdSense Compliance

· Ads only on non‑critical pages (resource download interstitial, sidebar, footer).
· No ads on article reading or course player (clean experience).
· Clearly labelled as "Sponsored" or "Advertisement".

───

9️⃣ Deployment Strategy {#deployment}

Frontend (Netlify)

· Build command: npm run build (Vite)
· Environment variables for API URL, Cloudinary config, etc.
· Automatic deployments from main branch.
· Custom domain: ishraqhub.com (or www.ishraqhub.com).

Backend (Render)

· Node.js service with environment variables.
· Automatic deployment from GitHub.
· Health check endpoint for uptime monitoring.
· Use Render's free tier (or paid if scaling).

Telegram Bot (Render or separate)

· Can be deployed as a separate service (or same as backend).
· Use webhook mode (preferred) or long polling.
· Webhook URL must be public (Render provides).

MongoDB Atlas (Free tier M0)

· 512 MB storage – enough for early stage.
· Shared cluster, no backup (but we can enable backup later).
· Network access: allow Render/Netlify IPs.

Monitoring

· Sentry for error tracking (both frontend and backend).
· Logs – use winston or pino for structured logging.
· Uptime – UptimeRobot or Render built‑in.

───

🔟 Next Steps {#nextsteps}

We are now fully aligned on the vision, architecture, data models, features, and plan. Here’s what we do next:

Immediate Actions (Week 1)

1. Set up monorepo – create folders, install dependencies, configure TypeScript, ESLint, Prettier.
2. Environment variables – create .env.example for both frontend and backend.
3. Initialize Express – basic server with /health route.
4. Connect to MongoDB – test with a simple User model.
5. Implement JWT auth – register, login, Google OAuth (start with email/password first).
6. Frontend base – add Tailwind, shadcn/ui, theme toggle, global CSS overrides.
7. Create the <Icon /> component – wrap Lucide icons.