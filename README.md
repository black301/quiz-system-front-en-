# Quiz Management System

A comprehensive instructor-focused quiz and course management platform built with Next.js, React, and TypeScript. This system enables instructors to manage courses, create and edit quizzes, manage students, and track student progress with detailed analytics.

## 🚀 Features

### Authentication & Security

- **Instructor Login**: Secure login system with JWT token authentication
- **Password Recovery**: Multi-step password reset with OTP verification
- **Session Management**: Automatic token refresh and secure session handling
- **Theme Support**: Dark/Light mode toggle with system preference detection

### Course Management

- **Course Overview**: View all assigned courses with level-based categorization
- **Student Enrollment**: Track enrolled students per course
- **Progress Monitoring**: Real-time student progress tracking with quiz completion statistics
- **Level-Based Organization**: Courses categorized by difficulty levels (Beginner, Intermediate, Advanced, Expert)

### Quiz Management

- **Quiz Creation**: Create comprehensive quizzes with multiple question types
- **Quiz Editing**: Full CRUD operations for quizzes and questions
- **Question Types**: Support for multiple-choice, essay, true-false, and short-answer questions
- **Scheduling**: Set start and end times for quiz availability
- **Statistics & Analytics**: Detailed quiz performance analytics with question-level insights
- **Calendar Integration**: Visual calendar showing quiz schedules and deadlines

### Grading & Assessment

- **Submission Management**: View and manage all quiz submissions
- **Individual Grading**: Grade submissions question by question with detailed feedback
- **Automated Scoring**: Automatic scoring for multiple-choice and true/false questions
- **Manual Review**: Manual grading for essay and short-answer questions
- **Grade Release**: Batch release of grades to students
- **Recording Integration**: View student quiz recordings for proctoring
- **Feedback System**: Provide overall and question-specific feedback

### Student Management

- **Student Registration**: Create and manage student accounts
- **Profile Management**: Update student information and skill levels
- **Course Assignment**: Assign students to appropriate courses based on their level
- **Progress Tracking**: Monitor individual student progress across courses
- **Bulk Operations**: Efficient management of multiple students

### Analytics & Reporting

- **Quiz Statistics**: View most missed and most correct questions
- **Student Progress**: Track completed vs pending quizzes
- **Performance Metrics**: Success rates and detailed performance breakdowns
- **Visual Analytics**: Progress bars and performance indicators
- **Calendar Overview**: Monthly view of quiz schedules and deadlines

### User Interface

- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Accessible Components**: WCAG compliant interface elements
- **Interactive Dashboard**: Real-time data visualization and quick actions
- **Sidebar Navigation**: Intuitive navigation with collapsible menu

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React + Custom SVG Icons
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Custom `apiFetch` utility
- **Authentication**: JWT with refresh tokens
- **Theme Management**: next-themes for dark/light mode
- **Form Handling**: Custom form components with validation
- **Responsive Design**: Mobile-first approach with adaptive layouts

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/                         # Main authenticated routes
│   │   ├── courses/
│   │   │   └── page.tsx                # Course management interface
│   │   ├── grading/                    # Grading system
│   │   │   ├── grade-submission-page.tsx # Individual submission grading
│   │   │   ├── quiz-grading-management-page/ # Grading dashboard
│   │   │   ├── quiz-submissions-page.tsx # Quiz submissions list
│   │   │   └── submission-grading-form.tsx # Grading form component
│   │   ├── quizzes/
│   │   │   ├── createquiz/
│   │   │   │   └── page.tsx            # Quiz creation page
│   │   │   ├── editquiz/
│   │   │   │   └── EditQuizForm.tsx    # Quiz editing interface
│   │   │   └── viewquizzes/
│   │   │       └── page.tsx            # Quiz listing and details
│   │   ├── students/
│   │   │   ├── createstudent/
│   │   │   │   └── CreateStudentForm.tsx # Student creation form
│   │   │   ├── editstudent/
│   │   │   │   └── edit-student-form.tsx # Student editing form
│   │   │   └── viewstudents/
│   │   │       └── page.tsx            # Student management interface
│   │   ├── settings/
│   │   │   └── page.tsx                # User profile settings
│   │   ├── layout.tsx                  # Main layout with sidebar/header
│   │   └── providers.tsx               # Theme and context providers
│   └── auth/
│       ├── sign-in/                    # Login page
│       └── forgot-password/            # Password recovery
├── components/
│   ├── Auth/
│   │   ├── SigninWithPassword.tsx      # Login form component
│   │   ├── ForgotPasswordClient.tsx    # Password reset flow
│   │   └── theme-toggle.tsx            # Theme switcher
│   ├── Breadcrumbs/
│   │   └── Breadcrumb.tsx              # Navigation breadcrumbs
│   ├── CalenderBox/
│   │   └── index.tsx                   # Calendar widget with quiz dates
│   ├── Forms/
│   │   ├── test-creation-form.tsx      # Quiz creation form component
│   │   └── question-builder.tsx        # Question builder component
│   ├── Layouts/
│   │   ├── header/                     # Header with user info and theme toggle
│   │   ├── sidebar/                    # Navigation sidebar with menu items
│   │   └── showcase-section.tsx        # Reusable section wrapper
│   └── FormElements/                   # Reusable form components
└── lib/
    ├── api.ts                          # API utility functions
    └── utils.ts                        # General utility functions
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager
- Backend API server (endpoints detailed below)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quiz-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

   # Optional: Demo credentials for development
   NEXT_PUBLIC_DEMO_USER_MAIL=instructor@example.com
   NEXT_PUBLIC_DEMO_USER_PASS=password123
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔌 API Endpoints

The application expects the following API endpoints to be available:

### Authentication

- `POST /auth/instructor-login/` - Instructor login with email/password
- `POST /auth/request-password-reset/` - Request password reset OTP
- `POST /auth/verify-otp/` - Verify OTP for password reset
- `POST /auth/reset-password/` - Reset password with OTP

### Course Management

- `GET /instructor/courses/` - Fetch all courses for instructor
- `GET /instructor/courses/{courseId}/students/` - Get students enrolled in course
- `GET /instructor/statistics/student-progress/` - Get student progress statistics

### Quiz Management

- `GET /instructor/quizzes/` - Fetch all quizzes for instructor
- `GET /quiz/{quizId}/` - Get quiz details with questions
- `POST /instructor/quizzes/` - Create new quiz
- `PATCH /instructor/quizzes/{quizId}/edit/` - Update quiz
- `DELETE /instructor/quizzes/{quizId}/remove/` - Delete quiz
- `POST /instructor/quizzes/{quizId}/questions/create/` - Add question to quiz
- `PATCH /instructor/questions/{questionId}/edit/` - Update question
- `DELETE /instructor/questions/{questionId}/remove/` - Delete question
- `GET /instructor/statistics/question-stats/{quizId}/` - Get quiz statistics

### Student Management

- `GET /instructor/students/all` - Get all students
- `POST /instructor/create-student/` - Create new student
- `PATCH /instructor/students/{studentId}/update/` - Update student
- `DELETE /instructor/students/{studentId}/remove/` - Delete student
- `POST /instructor/students/{studentId}/assign-courses/` - Assign student to courses

## 🎨 Features in Detail

### Authentication System

- Multi-step password recovery with email OTP verification
- JWT token management with automatic refresh
- Secure session handling with HTTP-only cookies
- Remember me functionality for extended sessions

### Course Management Dashboard

- Grid view of all courses with level indicators
- Click-through to detailed course view
- Student enrollment statistics
- Progress tracking with refresh capabilities
- Level-based course categorization (Beginner to Expert)

### Quiz Builder

- Step-by-step quiz creation process
- Multiple question types with rich editing
- Automatic end time calculation based on duration
- Real-time validation and error handling
- Calendar integration for scheduling

### Grading System

- Comprehensive submission management dashboard
- Question-by-question grading with individual feedback
- Automated scoring for objective questions
- Manual review capabilities for subjective answers
- Batch grade release functionality
- Recording review for proctored quizzes

### Student Progress Analytics

- Individual student progress cards
- Completion vs pending quiz statistics
- Level-based student categorization
- Bulk operations for student management
- Real-time progress updates

### User Profile Management

- Editable instructor profile information
- Secure account settings
- Profile picture and contact details
- Preference management

### Calendar Integration

- Monthly calendar view with quiz schedules
- Visual indicators for quiz dates
- Navigation between months
- Event details on hover
- Automatic quiz data synchronization

### Responsive Design

- Mobile-first responsive design
- Adaptive layouts for tablets and desktops
- Touch-friendly interfaces
- Accessible form controls and navigation
- Dark/light theme support with smooth transitions

## 🔧 Configuration

### API Configuration

Update the API base URL in your environment variables or in the `apiFetch` utility:

```typescript
// lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
```

### Authentication Configuration

The app uses JWT tokens stored in HTTP-only cookies for security:

```typescript
// Token storage configuration
const maxAge = data.remember ? 60 * 60 * 24 * 7 : 60 * 60 * 2; // 7d or 2h
document.cookie = `access=${result.access}; path=/; max-age=${maxAge}; SameSite=Lax`;
```

### Theme Configuration

The application supports dark mode out of the box. Theme classes are handled via Tailwind's dark mode utilities and next-themes package.

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deployment Options

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site hosting with serverless functions
- **Docker**: Containerized deployment
- **Traditional hosting**: Build static files and serve

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode conventions
- Use meaningful component and variable names
- Implement proper error handling
- Add loading states for async operations
- Ensure responsive design compatibility
- Write clean, maintainable code

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Functional components with hooks
- **State Management**: Local state with useState/useEffect

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Verify the API base URL in environment variables
   - Check if the backend server is running
   - Ensure CORS is properly configured on the backend

2. **Build Errors**

   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Ensure environment variables are properly set

3. **Authentication Issues**

   - Verify JWT tokens are properly configured
   - Check if login endpoint returns correct token format
   - Ensure cookies are set with proper domain and path

4. **Theme/Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Ensure dark mode classes are applied correctly
   - Make sure next-themes is properly initialized

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
