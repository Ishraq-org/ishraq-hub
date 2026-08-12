📜 Ishraq Digital Knowledge Platform — Complete System Discussion Document

───

1. 🎯 Vision & Philosophy

What is Ishraq?

Ishraq (إشراق — "Illumination") is a digital Islamic Knowledge Platform designed to organize, preserve, teach, and interconnect authentic Islamic apologetics knowledge through research articles, educational courses, structured resources, and modern learning experiences.

Core Philosophy

"One Brain, Two Experiences" — The website serves as the deep knowledge hub, while the Telegram Bot acts as the fast companion. Both share the same backend, database, and user data, but each is optimized for its own strengths.

Why This Matters

· Current Islamic apologetics content in Ethiopia is scattered across Telegram in unstructured formats
· Videos are delivered via Telegram video chats (traditional approach)
· No organized knowledge base exists for systematic learning
· The Ummah needs a modern, interconnected, and beautiful platform for authentic Islamic knowledge

Our Unique Approach

· Knowledge-centric — Not page-centric. Topics, articles, courses, resources, and debates all orbit around knowledge.
· Interconnected — Wikipedia‑style linking creates a knowledge graph, not isolated pages.
· User‑first — Personalisation, bookmarks, progress tracking, and notifications.
· Customised UI — No default browser styles; every visual detail is intentional.
· Scalable & Maintainable — Modular monorepo, TypeScript, clear separation of concerns.
· Engagement — The Telegram bot drives daily interaction without replacing the website.

───

1. 🏗️ System Architecture

Monorepo Structure

We will maintain a single repository with clear separation between frontend, backend, and shared utilities. This allows:

· Code sharing between projects
· Consistent tooling
· Simplified dependency management
· Easier CI/CD setup

Architecture Flow

User
  │
  ▼
┌─────────────────────────────────────────────┐
│         React + Vite (Frontend)             │
│         ─────────────────────               │
│    ┌──────────────────────────────────┐     │
│    │   Custom UI Components           │     │
│    │   shadcn/ui + Tailwind CSS       │     │
│    └──────────────────────────────────┘     │
│    ┌──────────────────────────────────┐     │
│    │   Zustand (UI State)             │     │
│    │   TanStack Query (API State)     │     │
│    └──────────────────────────────────┘     │
└─────────────────┬───────────────────────────┘
                    │ REST API
                    ▼
┌─────────────────────────────────────────────┐
│         Node.js + Express (Backend)         │
│         ─────────────────────               │
│    ┌──────────────────────────────────┐     │
│    │   Authentication (JWT)           │     │
│    │   Authorization (RBAC)           │     │
│    │   Validation (Zod)               │     │
│    └──────────────────────────────────┘     │
│    ┌──────────────────────────────────┐     │
│    │   Routes → Controllers           │     │
│    │   Services → Models              │     │
│    └──────────────────────────────────┘     │
└─────────────────┬───────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            MongoDB Atlas (Database)          │
│            ───────────────────               │
│       Users | Articles | Topics              │
│       Courses | Resources | Debates          │
│       Enrollments | Progress | Bookmarks     │
│       Notifications | Calendar Events        │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  Cloudinary   │       │    Redis      │
│  (Media)      │       │  (Caching)    │
└───────────────┘       └───────────────┘

┌─────────────────────────────────────────────┐
│         Telegram Bot (Telegraf)              │
│         ─────────────────────               │
│    ┌──────────────────────────────────┐     │
│    │   Search | Resources | Reminders │     │
│    │   Notifications | Progress       │     │
│    └──────────────────────────────────┘     │
└─────────────────────────────────────────────┘


Key Design Decisions

· Monorepo: Single codebase for all components
· RESTful API: Clear, predictable endpoints
· MongoDB Atlas: Flexible schema, scalability
· JWT Authentication: Secure, stateless sessions
· Cloudinary: Optimized media delivery
· Telegraf: Robust Telegram bot framework

───

1. 🗄️ Data Models (Conceptual)

Core Collections

Users

· Profile information (name, email, preferences)
· Role-based access (member → contributor → reviewer → author → moderator → admin → super_admin)
· Telegram integration (ID, username)
· Notification preferences
· Learning streak and activity tracking

Topics (Folders)

· Hierarchical structure (parent-child relationships)
· Title, description, and background image
· Status management (draft/published)
· Custom ordering

Articles (Files)

· Multilingual support (English and Amharic)
· Rich content (MDX format)
· Wikipedia‑style internal linking
· Author attribution and responsibility disclaimers
· Status workflow (draft → review → published → archived)
· Analytics tracking (views, bookmarks, shares)
· SEO metadata

Article Links

· Source and target article references
· Anchor text and position tracking
· Relationship types (explains, refutes, supports, defines)
· Preview context for hover interactions

Resources

· Books, PDFs, videos, audio files
· Cloudinary storage for all media
· Download tracking with ad interstitial
· Topic association and tags

Courses (Future)

· Structured learning paths
· Video lessons with supporting materials
· Enrollment and progress tracking
· Quizzes and certificates (future)
· Instructor attribution

Debates

· YouTube video integration
· Claim/response cards
· Timeline linking to video timestamps
· Evidence and resource references

Calendar

· Content scheduling and publishing
· Event management (webinars, meetings, deadlines)
· Reminders and notifications
· Integration with content publishing

Analytics

· Google Analytics integration
· Custom platform metrics
· User engagement tracking
· Content performance analysis

───

1. 🎨 User Interface Philosophy

Customization is Everything

"No default Chrome" — Every visual element is intentional.

What We Customize

· Text Selection: Custom accent color instead of default blue
· Scrollbars: Branded, subtle design
· Loading States: Branded animations, not generic spinners
· Toasts/Notifications: Slide-in, branded notifications
· Modals/Popups: Custom overlays with branded styling
· Icons: Central component system, no emojis

What We Keep

· Standard browser shortcuts (Ctrl+C, Ctrl+F)
· Natural scrolling behavior
· Keyboard navigation patterns

Theme System

Sandalwood Folio Palette

Element Day Mode Night Mode
Background #F2EEE6 #221810
Primary #543520 #E7D5A5
Accent #B5822E #D2A857
Text #543520 #E5E5E5

Implementation approach:

· CSS custom properties (variables)
· Single data-theme attribute toggle
· No context-based theme switching
· Perfect dark/light consistency

The Homepage Strategy

The homepage must answer one question: "What is Ishraq?"

· 3D animations support the message, not replace it
· Intro video explains the platform
· Sponsor section for contributors
· Clear navigation to content

───

1. 📚 Article System

Core Philosophy

"Topic = Folder, Article = File"

But expanded: A topic can contain articles, resources, courses, debates, and references.

Article Structure

Knowledge Space

     |
   Topic (Category)

     |
     ├── Articles (Research)
     ├── Resources (Books, PDFs, Videos)
     ├── Courses (Structured Learning)
     ├── Debates (Claim/Response)
     └── References (External Links)


Key Features

Wikipedia‑Style Linking

· Hover on linked terms shows preview
· Preview includes definition, summary, and related content
· Direct navigation to linked article
· Creates a knowledge graph

Multilingual Support

· English and Amharic versions
· Language switcher component
· Translation progress tracking
· Fallback to English when Amharic unavailable
· Language-specific slugs and URLs

Rich Content

· MDX formatting with custom components
· Quran verse insertion with Arabic and translation
· Hadith insertion with grade and reference
· Citations and footnotes
· Images with caption and alignment
· Video embeds (YouTube, Cloudinary)
· Tables with sorting
· FAQ accordion
· Timeline with video linking
· Warning/Info boxes

Academic Features

· Footnotes system with auto-numbering
· Citation management (APA, MLA, Chicago)
· Automatic reference list generation
· Author attribution and bio
· Content disclaimer and responsibility notice

Workflow

· Draft → Review → Published → Archived
· Review comments and revisions
· Scheduled publishing
· Version history

Content Responsibility

Articles are published under the author's responsibility. The platform provides a disclaimer and legal framework protecting both the platform and the authors.

───

1. 🎓 Course System (Future)

Approach

We will design and prepare the course system now but not implement it in v1. This ensures:

· Database schemas are ready
· API endpoints are designed
· Frontend structure is prepared
· Easy migration path for v2

Core Features (Planned)

· Structured learning paths
· Video lessons with transcripts
· Supporting materials (PDFs, links)
· Enrollment system
· Progress tracking
· Quizzes and assessments (future)
· Certificate generation (future)
· Course reviews and ratings

Integration Points

· Existing RBAC system for course creators
· Notification system for course updates
· Telegram bot for course reminders
· Article linking to courses

───

1. 🤖 Telegram Bot

Philosophy

"Not a miniature website" — It's a companion that complements the website.

Core Features

Account Linking

· Connect Telegram ID with Ishraq account
· Personalized experience based on user preferences
· Secure OAuth-like flow

Quick Knowledge Search

· /search Trinity returns articles, resources, courses
· Snippets and direct links to website
· Fast access to content

Resource Finder

· /resource Quran Manuscripts finds downloadable materials
· Direct deep-links to resources

Personalized Notifications

· User-controlled preferences
· New articles and courses
· Course reminders
· Daily knowledge
· Reading reminders for bookmarked articles

Course Companion

· New lesson notifications
· Progress reminders
· Course announcements

Daily Knowledge

· Scheduled content delivery (opt-in)
· Today's article, Quran reflection, Hadith
· Always links back to website for deeper study

User Dashboard Summary

· /profile shows bookmarks, course progress
· Quick overview without opening website

Architecture

· Shared Database: Bot never accesses MongoDB directly
· API Communication: All requests through Express API
· Event-Driven: Notifications triggered by backend events
· Scheduler: Cron jobs for daily knowledge
· Queue System: Future Redis implementation

───

1. 🛡️ Role-Based Access Control (RBAC)

Role Hierarchy

MEMBER (Default)
    │
    ├── CONTRIBUTOR (Writer)
    │       │
    │       ├── AUTHOR (Published Writer)
    │       │
    │       └── REVIEWER (Editor)
    │
    ├── MODERATOR (Content Manager)
    │
    ├── ADMIN (Platform Manager)
    │
    └── SUPER ADMIN (Full System Access)


Role Capabilities

MEMBER

· Read all public content
· Bookmark content
· Enroll in free courses
· Track personal progress
· Update own profile

CONTRIBUTOR

· All Member capabilities
· Create and edit draft articles
· Upload draft resources
· Submit drafts for review

AUTHOR

· All Contributor capabilities
· Publish directly (no review)
· Edit own published articles
· Create courses

REVIEWER

· All Contributor capabilities
· Review pending submissions
· Approve/reject with comments
· Publish approved content

MODERATOR

· All Reviewer capabilities
· Manage all content (edit, delete, unpublish)
· Manage topics and tags
· Moderate discussions

ADMIN

· All Moderator capabilities
· Manage all users (roles, suspension)
· View analytics
· Manage system settings
· Access database tools

SUPER ADMIN

· All Admin capabilities
· Manage admins
· Full database access
· System configuration
· Role management

Implementation Approach

· Role-based middleware on all endpoints
· Frontend conditional rendering
· JWT includes role information
· Permission hierarchy enforced on backend

───

1. 👑 Admin Panel

Philosophy

"Everything organized. Everything structured. Everything accessible."

Core Features

Dashboard

· Key metrics (users, articles, resources, pending reviews)
· User growth charts
· Content performance analytics
· Recent activity feed
· System status

Content Management

· Topics: CRUD, hierarchy management
· Articles: Full CRUD with editor
· Resources: Upload and management
· Debates: Creation and management
· Review queue: Approve/reject submissions

User Management

· All users list with search/filter
· Role assignment
· Suspend/ban functionality
· Contributor management
· Admin management

Calendar System

· Content publishing schedule
· Event management (webinars, meetings)
· Deadline tracking
· Reminder system
· Integration with content publishing

Analytics

· Google Analytics integration
· Custom platform metrics
· User engagement tracking
· Content performance analysis
· Growth reports

Database Management

· Collection viewer
· Data backup and restore
· Development data clearing
· Production safeguards
· Data seeding tools

Security

· All admin routes require authentication
· Role-based access control
· Admin login rate limiting
· Session timeout
· Activity logging
· Environment-based tool availability
· Super admin protections

───

1. 🌐 Multilingual System

Approach

"One Knowledge Item — Multiple Language Versions"

English is the primary language, Amharic is secondary. Both versions share the same base metadata (topic, tags, images, authors).

Implementation

· Separate translation documents linked to base article
· Language-specific slugs and URLs
· Translation progress tracking
· Fallback to English when Amharic incomplete
· hreflang tags for SEO
· Language switcher component

URL Structure

/en/articles/trinity-explained
/am/articles/ሥላሴ-ተብራርቷል


Translation Workflow

1. Author writes in English (primary)
2. Translator adds Amharic version
3. Progress tracked as percentage
4. Review process for both versions
5. Publication when both ready (or one with notice)

───

1. 🔒 Security Considerations

API Security

· JWT in HTTP-only cookies
· HTTPS enforcement
· Rate limiting on auth endpoints
· Input validation with Zod
· NoSQL injection prevention
· XSS prevention with DOMPurify

Authentication

· Email/password with bcrypt hashing
· Google OAuth option
· Session management
· Password reset flow

Authorization

· Role-based middleware
· Permission checking on all endpoints
· Row-level security in API
· Admin route protection

Data Protection

· Sensitive data encrypted at rest
· HTTP-only cookies
· Secure headers with Helmet
· CORS restricted to our domain

Development Safety

· Database clearing only in development
· Environment-based tool availability
· Super admin protection
· Activity logging

───

1. 🔗 Integration Points

Article ↔ Course

· Articles can reference courses
· Courses can reference articles as resources

Article ↔ Resource

· Articles can embed resources
· Resources can be linked from articles

Article ↔ Debate

· Articles can reference debates
· Debates can reference articles

Telegram Bot ↔ Platform

· Shared database (through API)
· Notifications from platform events
· User preferences synchronized

Analytics ↔ Platform

· Google Analytics tracking
· Custom platform metrics
· User engagement tracking

───

1. 🚀 Development Phases

Phase 0: Foundation (v1)

· Project setup (React + Vite + Express + MongoDB)
· Authentication system
· Theme system (dark/light)
· Custom components (icons, loading, toast, modal)
· Global CSS customization
· RBAC system

Phase 1: Core Content (v1)

· Topic CRUD
· Article CRUD with multilingual support
· TipTap editor with academic features
· Wikipedia‑style linking
· Resource upload (Cloudinary)
· Article styling and components
· SEO metadata

Phase 2: User Features (v1)

· User dashboard
· Bookmark system
· Reading history
· Profile management
· Notification preferences
· Content search

Phase 3: Admin Panel (v1)

· Admin dashboard
· Content management
· User management
· Calendar system
· Analytics integration
· Database management tools

Phase 4: Telegram Bot (v1)

· Account linking
· Search command
· Resource finder
· Notification system
· Daily knowledge scheduler
· Deep links

Phase 5: Course System (Future v2)

· Course CRUD
· Lesson management
· Enrollment system
· Progress tracking
· Video integration

Phase 6: Polish & Launch

· Testing
· Documentation
· Deployment
· Monitoring

───

1. 🎯 Success Metrics

Platform Success

· User registration and engagement
· Content creation and consumption
· Article views and bookmarks
· Course enrollments (future)
· Telegram bot interactions

Community Success

· Number of contributors
· Quality of content
· User feedback and ratings
· Content sharing and reach

Technical Success

· Performance and load times
· Uptime and reliability
· Error rates
· Security compliance

───

1. 🔮 Future Vision

Phase 2 (v2)

· Course system implementation
· Quizzes and assessments
· Certificate generation
· Advanced search (ElasticSearch)
· Mobile app

Phase 3 (v3)

· Community features (comments, discussions)
· Live webinars
· Study groups
· Peer mentoring

Phase 4 (v4)

· AI-powered content suggestions
· Smart search
· Content summarization
· Translation assistance

───

1. 💬 Discussion Points

Open Questions

Content

· What is the initial content strategy?
· How will we attract contributors?
· What topics should be prioritized?

Community

· How will we engage the Ethiopian Ummah?
· What is the outreach strategy?
· How will we handle content moderation?

Technical

· What is the hosting budget?
· What are the performance requirements?
· What is the backup and recovery strategy?

Legal

· How will we handle copyright claims?
· What is the data privacy policy?
· How will we comply with local/international regulations?

───

1. 🎬 Next Steps

Immediate Action Items

1. Finalize database schema design
2. Set up development environment
3. Begin authentication system
4. Start theme implementation
5. Begin article system

Collaboration Approach

· All decisions documented here
· Regular sync with Miqdad
· Incremental development
· Continuous feedback loop

Success Definition

· Platform that serves the Ummah
· Modern, organized content delivery
· Sustainable contributor ecosystem
· Positive community impact

───

🕌 Final Note

This document represents our shared vision for Ishraq — a platform that will serve the Ummah for years to come. Every decision here is made with intention, guided by Islamic principles and modern technology.

Bismillah. Let's build something legendary.

───

Document prepared for discussion between the Ishraq development team. All decisions are open for review and refinement.