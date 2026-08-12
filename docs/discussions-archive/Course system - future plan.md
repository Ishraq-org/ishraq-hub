🎓 Ishraq Course System — Future-Ready Architecture

You're absolutely right to think ahead! We'll design the course system now so it's ready for v2, but keep it out of v1 implementation. This means:

· ✅ Database schemas ready
· ✅ API endpoints designed
· ✅ Frontend structure prepared
· ✅ Placeholder routes/components
· ❌ NOT implemented in v1 (no code)

───

📊 Course System Data Models

1. Course Model

typescript
// backend/models/Course.ts
interface ICourse {
  _id: ObjectId;
  
  // Basic Information
  title: {
    en: string;
    am: string;
  };
  slug: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  
  // Media
  coverImage: string; // Cloudinary URL
  trailerVideo?: string; // Cloudinary or YouTube URL
  
  // Course Structure
  lessons: ILesson[];
  
  // Metadata
  category: 'aqidah' | 'fiqh' | 'tafsir' | 'hadith' | 'history' | 'apologetics' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  prerequisites: ObjectId[]; // Other course IDs
  
  // Pricing
  price: number; // 0 = free
  currency: 'USD' | 'ETB';
  
  // Instructor
  instructor: {
    userId: ObjectId;
    name: string;
    bio: {
      en: string;
      am: string;
    };
    image: string;
  }[];
  
  // Stats
  enrolledCount: number;
  completedCount: number;
  rating: number; // 0-5
  totalReviews: number;
  totalDuration: number; // minutes
  
  // Status
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isPremium: boolean;
  
  // Dates
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

interface ILesson {
  _id: ObjectId;
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  
  // Content
  videoUrl: string; // Cloudinary or YouTube
  videoDuration: number; // seconds
  thumbnail: string;
  
  // Supporting materials
  supportingFiles: {
    title: {
      en: string;
      am: string;
    };
    fileUrl: string; // Cloudinary
    fileType: 'pdf' | 'document' | 'link' | 'image';
  }[];
  
  // References
  references: {
    title: string;
    url: string;
  }[];
  
  // Next/Previous
  order: number;
  isFree: boolean; // Can preview without enrollment
  
  // Quiz (future)
  quiz?: {
    questions: {
      question: {
        en: string;
        am: string;
      };
      options: {
        en: string[];
        am: string[];
      };
      correctAnswer: number; // index of correct option
      explanation: {
        en: string;
        am: string;
      };
    }[];
    passingScore: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}


1. Enrollment Model

typescript
// backend/models/Enrollment.ts
interface IEnrollment {
  _id: ObjectId;
  
  userId: ObjectId;
  courseId: ObjectId;
  
  // Progress
  progress: number; // 0-100
  completedLessons: ObjectId[];
  currentLesson: ObjectId;
  lastWatchedAt: Date;
  
  // Completion
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  
  // Certificate
  certificateIssued: boolean;
  certificateUrl?: string;
  certificateIssuedAt?: Date;
  
  // Analytics
  totalTimeSpent: number; // minutes
  lastActivity: Date;
  
  createdAt: Date;
  updatedAt: Date;
}


1. Lesson Progress Model

typescript
// backend/models/LessonProgress.ts
interface ILessonProgress {
  _id: ObjectId;
  
  userId: ObjectId;
  lessonId: ObjectId;
  enrollmentId: ObjectId;
  
  // Progress
  progress: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
  
  // Watch time
  watchTime: number; // minutes
  lastPosition: number; // seconds
  
  // Quiz results (future)
  quizAttempts: {
    score: number;
    answers: number[];
    attemptedAt: Date;
  }[];
  quizPassed: boolean;
  
  updatedAt: Date;
}


1. Review Model

typescript
// backend/models/Review.ts
interface IReview {
  _id: ObjectId;
  
  userId: ObjectId;
  courseId: ObjectId;
  enrollmentId: ObjectId;
  
  rating: number; // 1-5
  title: {
    en: string;
    am: string;
  };
  content: {
    en: string;
    am: string;
  };
  
  isVerified: boolean; // Only enrolled users can review
  isApproved: boolean; // Moderation
  
  helpfulCount: number;
  reported: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}


───

🛣️ API Endpoints (Designed, Not Implemented)

Course Management

typescript
// Public endpoints (v1 ready)
GET    /api/courses                  // List all published courses
GET    /api/courses/:slug            // Get course details
GET    /api/courses/:slug/lessons    // Get lessons (free preview)
GET    /api/courses/categories       // Get categories

// Authenticated endpoints (v1 ready)
POST   /api/courses/:slug/enroll     // Enroll in course
GET    /api/courses/:slug/progress   // Get user progress
GET    /api/courses/:slug/lessons/:lessonId/watch // Track watching

// Admin endpoints (future)
POST   /api/admin/courses            // Create course
PUT    /api/admin/courses/:id        // Update course
DELETE /api/admin/courses/:id        // Delete course
POST   /api/admin/courses/:id/lessons // Add lesson
PUT    /api/admin/courses/:id/lessons/:lessonId // Update lesson
DELETE /api/admin/courses/:id/lessons/:lessonId // Delete lesson

// Reviews
GET    /api/courses/:slug/reviews    // Get course reviews
POST   /api/courses/:slug/reviews    // Submit review


───

🖥️ Frontend Structure (Placeholder Only)

1. Routes (v2 when implemented)

typescript
// frontend/src/routes.tsx
const routes = [
  // Course routes - placeholder for v2
  {
    path: '/courses',
    element: <CourseCatalog />, // Skeleton/Coming Soon
  },
  {
    path: '/courses/:slug',
    element: <CourseView />, // Skeleton/Coming Soon
  },
  {
    path: '/courses/:slug/learn',
    element: <CoursePlayer />, // Skeleton/Coming Soon
    private: true,
  },
  {
    path: '/dashboard/courses',
    element: <MyCourses />, // Skeleton/Coming Soon
    private: true,
  },
];


1. Component Architecture (Ready for v2)

typescript
// frontend/src/components/course/
├── CourseCatalog.tsx        // Course listing page
├── CourseCard.tsx          // Individual course card
├── CourseView.tsx          // Course detail page
├── CoursePlayer.tsx        // Video player with lessons
├── CourseSidebar.tsx       // Lesson navigation
├── CourseProgress.tsx      // Progress indicator
├── CourseReviews.tsx       // Reviews section
├── LessonContent.tsx       // Lesson content renderer
└── Certificate.tsx         // Certificate component


1. Placeholder Components (v1)

tsx
// frontend/src/components/CourseComingSoon.tsx
export const CourseComingSoon = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <Icon name="graduationCap" size={64} className="text-[var(--accent)] mx-auto" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
        Courses Coming Soon
      </h1>
      <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
        We're building structured Islamic apologetics courses to help you learn
        systematically. Stay tuned for updates!
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={() => subscribe()}>
          Notify Me When Ready
        </Button>
        <Button onClick={() => navigate('/articles')}>
          Explore Articles
        </Button>
      </div>
    </div>
  );
};


───

📊 Database Indexes (Ready for v2)

typescript
// backend/models/indexes.ts

// Course indexes
CourseSchema.index({ 'slug.en': 1 }, { unique: true });
CourseSchema.index({ 'slug.am': 1 }, { unique: true });
CourseSchema.index({ category: 1, level: 1, status: 1 });
CourseSchema.index({ status: 1, isFeatured: 1 });
CourseSchema.index({ enrolledCount: -1 });

// Enrollment indexes
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ userId: 1, isCompleted: 1 });
EnrollmentSchema.index({ courseId: 1, progress: 1 });

// Lesson Progress indexes
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ enrollmentId: 1, isCompleted: 1 });

// Reviews indexes
ReviewSchema.index({ courseId: 1, isApproved: 1 });
ReviewSchema.index({ courseId: 1, rating: 1 });
ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });


───

🔄 Integration with Existing Systems

1. RBAC Integration

typescript
// Roles that can create courses
const COURSE_CREATOR_ROLES = ['author', 'admin', 'super_admin'];

// Permission check for course creation
app.post('/api/admin/courses', 
  authenticate, 
  requireRole('author', 'admin', 'super_admin'),
  courseController.create
);

// User dashboard shows enrolled courses
// Will use existing user.progress tracking


1. Notification Integration

typescript
// Course-related notifications (future)
const COURSE_NOTIFICATIONS = {
  NEW_COURSE: 'New course published',
  COURSE_ENROLLMENT: 'You enrolled in a course',
  LESSON_COMPLETED: 'Lesson completed',
  COURSE_COMPLETED: 'Course completed!',
  CERTIFICATE_ISSUED: 'Certificate issued',
  REVIEW_REQUEST: 'Please review this course',
};

// Integrate with existing notification system
// Uses same user.notifications preferences


1. Telegram Bot Integration

typescript
// Course-related bot commands (future)
BOT_COMMANDS = {
  '/courses': 'List my enrolled courses',
  '/enroll': 'Enroll in a course',
  '/progress': 'Show my course progress',
  '/remind': 'Set course reminders',
};

// Bot sends course notifications
// Example: "New lesson added: Lesson 5 - Trinity in Early Christianity"


1. Article Integration

typescript
// Articles can link to courses
// Courses can reference articles as resources

// Article schema will have:
interface IArticle {
  // ... existing fields
  relatedCourses: ObjectId[]; // Course IDs
}

// Course schema will have:
interface ICourse {
  // ... existing fields
  relatedArticles: ObjectId[]; // Article IDs
}


───

🎨 Course UI Design Preview (Future)

Course Catalog Page

tsx
// frontend/src/pages/CourseCatalog.tsx (v2 design)
export const CourseCatalog = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text-primary)]">
          Islamic Apologetics Courses
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 max-w-2xl mx-auto">
          Structured learning paths to deepen your understanding
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aqidah">Aqidah</SelectItem>
            <SelectItem value="fiqh">Fiqh</SelectItem>
            <SelectItem value="tafsir">Tafsir</SelectItem>
            <SelectItem value="hadith">Hadith</SelectItem>
            <SelectItem value="apologetics">Apologetics</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1">
          <Input placeholder="Search courses..." />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};


Course Card Component (Future)

tsx
// frontend/src/components/course/CourseCard.tsx
export const CourseCard = ({ course }) => {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-[var(--border)]">
      {/* Cover Image */}
      <div className="relative aspect-video">
        <img 
          src={course.coverImage} 
          alt={course.title.en}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={course.isFree ? 'success' : 'default'}>
            {course.isFree ? 'Free' : `$`{course.price}`}
          </Badge>
        </div>
        {course.level && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-black/50 text-white border-none">
              {course.level}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">
          {course.title.en}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
          {course.description.en}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Icon name="user" size={16} />
            <span>{course.enrolledCount} enrolled</span>
            {course.rating > 0 && (
              <>
                <Icon name="star" size={16} className="text-[var(--accent)]" />
                <span>{course.rating.toFixed(1)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
            <Icon name="clock" size={16} />
            <span>{Math.floor(course.totalDuration / 60)}h</span>
          </div>
        </div>
        <Button 
          className="w-full mt-4"
          onClick={() => navigate(`/courses/`${course.slug.en}`)}
        >
          View Course
        </Button>
      </div>
    </div>
  );
};


───

🔧 Technical Preparation for v1

1. Placeholder Database Models

We'll create the models but NOT use them in v1 code:

typescript
// backend/models/Course.ts (created but unused)
export const CourseSchema = new Schema({
  // ... full schema as defined above
}, { timestamps: true });

export const Course = mongoose.model('Course', CourseSchema);
// BUT we don't import this anywhere in v1


1. Placeholder Routes (Commented Out)

typescript
// backend/routes/index.ts
// import courseRoutes from './course.routes'; // Future
// app.use('/api/courses', courseRoutes); // Future

// Instead, show coming soon endpoint
app.get('/api/courses', (req, res) => {
  res.json({ 
    message: 'Courses coming soon!', 
    status: 'planned'
  });
});


1. Frontend Coming Soon Page

tsx
// frontend/src/pages/Courses.tsx
export const Courses = () => {
  return <CourseComingSoon />;
};

// In router
<Route path="/courses" element={<Courses />} />


───

📋 Course System Implementation Phases (Future)

Phase 0: Foundation (v1 — NOW)

· ✅ Design database schemas
· ✅ Design API endpoints
· ✅ Create placeholder components
· ✅ Add course models to codebase (not used)
· ✅ Add coming soon page

Phase 1: Core Course Features (v2)

· Course CRUD (admin)
· Lesson management
· Video upload (Cloudinary)
· Basic course player
· User enrollment
· Progress tracking
· Course catalog

Phase 2: Advanced Features (v3)

· Quizzes and assessments
· Certificate generation
· Course reviews and ratings
· Course recommendations
· Course discussions

Phase 3: Community Features (v4)

· Live sessions (Zoom/YouTube integration)
· Study groups
· Peer mentoring
· Course Q&A
· Instructor interaction

───

🎯 Key Takeaways

What's Ready for v1

· ✅ Complete database schema design
· ✅ Full API endpoint design
· ✅ Component architecture
· ✅ Integration points with existing systems
· ✅ Coming soon page

What's NOT in v1

· ❌ Course CRUD operations
· ❌ Video player
· ❌ Enrollment system
· ❌ Progress tracking
· ❌ Certificate generation
· ❌ Course catalog (real data)

Future Integration Points

· 🔗 Existing user system (authentication)
· 🔗 Notification system
· 🔗 Telegram bot
· 🔗 Article linking
· 🔗 RBAC system
· 🔗 Search system

───

🚀 Migration Path (v1 → v2)

When we're ready to launch courses:

1. Enable models: Import Course, Enrollment models
2. Enable routes: Uncomment course routes
3. Seed data: Create initial courses/lessons
4. Update UI: Replace coming soon page with real catalog
5. Add navigation: Add courses link to navbar
6. Database migrations: Add course-related fields to users

───

📝 Updated Roadmap with Course System

Phase 0: Foundation (Now - v1)
├── Article System (Complete)
├── Resource System (Complete)
├── User System (Complete)
├── Telegram Bot (Complete)
└── 🎓 Course Placeholders (Design Only)

Phase 4: Course System (v2 - Future)
├── Course CRUD
├── Lesson Management
├── Video Integration
├── Enrollment System
├── Progress Tracking
├── Course Catalog
└── Certificate Generation

Phase 5: Advanced Learning (v3 - Future)
├── Quizzes & Assessments
├── Course Reviews
├── Recommendations
└── Learning Analytics


───

Summary: The course system is fully designed, architected, and ready for future implementation. All schemas, API endpoints, components, and integration points are defined. The v1 release will have placeholder components and coming soon pages, making it easy to enable courses when the time comes without disrupting existing functionality. 🚀