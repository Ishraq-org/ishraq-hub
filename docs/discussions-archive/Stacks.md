🚀 Ishraq Web System — Current Locked Stack
🎨 Frontend
✅ React + Vite
The main web application.
Responsible for:
Public pages
Article reading experience
Course interface
User dashboard
Admin dashboard
✅ TypeScript
For:
Type safety
Large codebase management
Better developer experience
✅ Tailwind CSS
For:
UI styling
Responsive design
Design consistency
✅ shadcn/ui
For reusable professional components:
Buttons
Forms
Dialogs
Tables
Cards
Dashboard components
✅ React Router
Navigation:
/articles
/articles/:slug

/courses
/courses/:id

/dashboard
/admin
🧠 Frontend State & Data
✅ Zustand
Client-side state:
Language selection
User preferences
UI state
App settings
✅ TanStack Query
Server/API state:
React
↓
TanStack Query
↓
Express API
↓
MongoDB
Handles:
Fetching
Caching
Loading states
Refetching
⚙️ Backend
✅ Node.js + Express
The brain of Ishraq.
Handles:
Authentication
Authorization
Course logic
Article management
Admin operations
User progress
APIs
Structure:
backend/

src/
├── routes
├── controllers
├── models
├── services
├── middleware
└── config
🗄️ Database
✅ MongoDB Atlas
Main database.
Stores:
Users

Articles

Categories

Courses

Lessons

Enrollments

Progress

Comments

Resources

Certificates
✅ Mongoose
MongoDB modeling layer.
Provides:
Schemas
Validation
Relationships
📁 Media
✅ Cloudinary
For:
Images
PDFs
Thumbnails
Course media
Attachments
MongoDB stores:
URL
metadata
file type
Not the actual files.
🔐 Security & Backend Tools
✅ JWT Authentication
For user sessions.
✅ bcrypt
For password hashing.
✅ Zod
For data validation.
Example:
User sends:
email: wrong format
API rejects it.
📚 Content System
✅ MDX
For research content:
Articles
Refutations
Academic writing
References
⚡ Future Scaling
🔜 Redis
Later for:
Caching
Rate limiting
Popular content
Performance
🛠️ Development
✅ Git
✅ GitHub
✅ ESLint
✅ Prettier
Final Architecture Diagram
User
|
↓

React + Vite + TypeScript
|
Tailwind + shadcn/ui
|
TanStack Query + Zustand
|
↓

Node.js + Express API
|
-----------------------
| |
MongoDB Atlas Cloudinary
|
↓
Redis (Future)