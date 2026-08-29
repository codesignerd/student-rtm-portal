You are now working on an existing Student Results & Transcript Management Portal project.

Before making ANY changes, thoroughly inspect the entire project, including:

* docs/
* src/
* src/supabase/
* package.json
* Dockerfile
* docker-compose.yaml
* .env.example
* existing authentication and routing files
* all existing TypeScript types
* all existing student/admin pages
* database migration files
* DATABASE_SCHEMA.md
* MASTER_DEVELOPMENT_SPECIFICATION.md
* README.md
* any .github/ prompt/instruction files

The project has already gone through several planning, design, database, authentication, Docker, and foundation phases.

Your job is NOT to redesign the project or reinterpret its scope.

Treat the following project decisions as LOCKED unless I explicitly instruct you otherwise.

# PROJECT PURPOSE

This is a Student Results & Transcript Management Portal.

The project is intentionally NOT a complete school management system.

The primary focus is:

* Student authentication
* Student academic information
* Student result viewing
* Student transcript access/generation
* Administrator access for administrative operations required by the approved project scope

There is NO lecturer role in the approved application.

Do not introduce:

* lecturer accounts
* lecturer dashboards
* lecturer result-entry workflows
* attendance management
* fees/payment management
* library management
* hostel management
* timetable management
* unrelated school-management modules

# TECHNOLOGY STACK

Frontend:

* React
* TypeScript
* Vite
* Tailwind CSS

Backend/data platform:

* Supabase
* Supabase Authentication
* Supabase PostgreSQL
* Supabase Row Level Security

Routing:

* React Router

Containerization:

* Docker
* Docker Compose
* Multi-stage Docker build
* Nginx for production static-file serving

Do NOT migrate the project to:

* Next.js
* Firebase
* another backend platform
* another database
* another frontend framework

unless explicitly instructed.

# DATABASE STATUS

The Supabase database has already been created and verified.

The migration:

src/supabase/migration/001_initial_schema.sql

has already been executed successfully in Supabase.

The database schema is LOCKED.

Do NOT modify the schema, migration, tables, columns, relationships, indexes, constraints, or RLS policies unless I explicitly approve a schema change.

The verified core tables are:

* public.users
* public.students
* public.results
* public.courses
* public.semesters
* public.academic_sessions

The relationship chain is:

auth.users.id
→ public.users.user_id
→ public.students.user_id
→ public.students.student_id
→ public.results.student_id
→ public.results.course_id
→ public.courses.course_id

and:

public.results.semester_id
→ public.semesters.semester_id
→ public.academic_sessions.session_id

The database schema has already been compared against the project's ERD and DATABASE_SCHEMA.md and was verified as matching.

# USER ROLES

There are ONLY two application roles:

* student
* admin

There is NO lecturer role.

The application role is stored in:

public.users.role

The authenticated Supabase account is linked using:

auth.users.id = public.users.user_id

The student's application record is linked using:

public.users.user_id = public.students.user_id

Never use auth.user.user_metadata.role as the authoritative application role.

The database record in public.users is the source of truth.

# SECURITY

Supabase RLS is already enabled and configured.

Students must only be able to access their own student information and results.

A student must NEVER be able to retrieve another student's results.

Administrators have the appropriate administrative access defined by the existing RLS policies.

Do NOT bypass RLS.

Do NOT introduce service-role keys into the frontend.

Do NOT hard-code Supabase credentials.

# ENVIRONMENT

Vite handles environment variables.

The application expects:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

The runtime file is:

.env.local

The template file is:

.env.example

Do NOT install dotenv merely to load frontend environment variables.

Do NOT expose secret/service-role credentials in client-side code.

# AUTHENTICATION FOUNDATION

The authentication foundation has already been implemented and tested.

Existing important files include:

* src/services/supabase/client.ts
* src/hooks/useAuth.ts
* src/routes/ProtectedRoute.tsx
* src/routes/AppRoutes.tsx
* src/pages/auth/LoginPage.tsx

The application uses Supabase email/password authentication.

The authentication flow has already been tested successfully.

The following behavior is confirmed:

* Empty email/password fields produce validation feedback.
* Invalid credentials produce an appropriate error.
* Valid student credentials successfully authenticate.
* Student users are redirected to the student dashboard.
* Unauthenticated users cannot access protected student/admin routes.
* Students cannot access admin routes.
* Role resolution comes from public.users.
* Logout works.

Do not redesign this authentication architecture unless a genuine defect is discovered.

# STUDENT PORTAL

Phase 2B has already been implemented.

The student portal currently contains:

* /student
* /student/dashboard
* /student/results
* /student/transcript
* /student/profile

The student layout already contains navigation for:

* Dashboard
* Results
* Transcript
* Profile
* Logout

The current dashboard/results/transcript areas are intentionally placeholder shells.

That is expected.

Do NOT interpret the placeholder UI as unfinished architecture.

The project intentionally implemented functionality and architecture progressively.

# CURRENT DATABASE TEST DATA

At least one real test student has already been created manually in Supabase Authentication.

The authenticated user's UUID was matched correctly with:

public.users.user_id

and:

public.students.user_id

The student was successfully tested through the login page.

Therefore, the authentication/database relationship is working.

# PROJECT PHASE HISTORY

The project has progressed through these major phases:

PHASE 1 — PROJECT FOUNDATION

Completed:

* project structure
* environment configuration
* Supabase client
* authentication architecture
* routing foundation
* protected routes
* student/admin role handling
* Docker foundation
* multi-stage Docker architecture
* Nginx production configuration

Verification:

* npm run build passed
* npm run lint passed
* Vite dev server started successfully
* Vite preview started successfully

PHASE 2A — AUTHENTICATION

Completed:

* Supabase email/password login
* authentication state
* application-role lookup from public.users
* student/admin route protection
* logout
* authentication error handling
* role-based redirects

PHASE 2B — STUDENT PORTAL FOUNDATION

Completed:

* StudentLayout
* student navigation
* student dashboard route
* student results route
* student transcript route
* student profile route
* student-only route protection

The current UI is intentionally basic because this phase focused on architecture and functionality foundations.

# CURRENT PHASE

We are now entering:

PHASE 3A — STUDENT RESULTS RETRIEVAL

The current approved objective is:

Implement actual student result retrieval and display.

This phase MUST remain focused on student result viewing.

# PHASE 3A DATABASE CONTRACT

The correct student-result retrieval chain is:

1. Get authenticated Supabase user.
2. Resolve auth user ID to public.users.
3. Resolve public.users.user_id to public.students.user_id.
4. Obtain the student's student_id.
5. Query public.results for that student_id.
6. Join related course information.
7. Join related semester information.
8. Join academic session information.

The result dataset should contain only fields supported by the database:

* course_code
* course_title
* credit_unit
* score
* grade
* grade_point
* remark
* semester_name
* semester_order
* session_name

Do not invent additional database fields.

# PHASE 3A UI STATES

The results page must properly support:

1. Loading state
2. Empty state
3. Database/query error state
4. Unauthorized/missing student state
5. Successful result display

The student should see only their own results.

Do not fabricate result records.

Do not hard-code academic results.

# PHASE 3A TYPES

The current TypeScript database types are incomplete for result retrieval.

The implementation may add properly aligned types for:

* StudentRecord
* CourseRecord
* SemesterRecord
* AcademicSessionRecord
* ResultRecord
* JoinedResultWithCourseAndSemester

Only add types that are actually needed.

Keep them aligned exactly with DATABASE_SCHEMA.md.

# PHASE 3A DATA ACCESS

Create a focused student-results data-access service.

A reasonable location is:

src/services/supabase/studentResults.ts

Keep the service simple.

Do not create a massive abstraction layer.

Do not introduce unnecessary repository/factory patterns.

Use the existing centralized Supabase client.

# GPA / CGPA

DO NOT implement GPA or CGPA calculations in Phase 3A.

The database contains grade_point and credit_unit, but the official academic calculation rules are not sufficiently defined in the approved project documentation.

Therefore:

* retrieve/display the stored grade_point
* retrieve/display credit_unit
* do NOT calculate GPA
* do NOT calculate CGPA

These will be handled in a later approved phase once the business rules are explicitly defined.

# TRANSCRIPT

Do NOT implement transcript generation in Phase 3A.

The transcript route may remain a placeholder.

Do NOT create:

* PDF generation
* transcript export
* transcript calculations
* fabricated transcript records

# ADMIN

Do NOT implement admin result management in Phase 3A.

No:

* result entry
* result editing
* result deletion UI
* course management
* semester management
* academic-session management

unless explicitly approved later.

# DATABASE CHANGES

Phase 3A requires:

NO database schema changes.

Do NOT modify:

src/supabase/migration/001_initial_schema.sql

Do NOT modify:

docs/DATABASE_SCHEMA.md

Do NOT modify RLS policies.

The existing schema already supports result retrieval.

# DESIGN/ARCHITECTURE PRINCIPLE

Build progressively.

Prefer:

simple → understandable → testable → maintainable

over:

complex → abstract → over-engineered

Reuse existing architecture whenever possible.

Do not duplicate authentication systems.

Do not create multiple Supabase clients.

Do not create unnecessary services.

Do not introduce libraries when the existing stack already provides the required functionality.

# IMPLEMENTATION SAFETY RULE

Before implementing any phase:

1. Read MASTER_DEVELOPMENT_SPECIFICATION.md.
2. Read DATABASE_SCHEMA.md.
3. Inspect the existing implementation.
4. Verify the requested feature against the locked scope.
5. State the implementation plan.
6. Implement only the approved scope.
7. Run:

   * npm run build
   * npm run lint
8. Report:

   * files created
   * files modified
   * functionality implemented
   * verification results
   * unresolved issues
   * scope confirmation

Never silently expand scope.

# IMPORTANT

Before implementing any new phase, the AI agent must first identify the current phase, read the master specification and database schema, review the current implementation, state the intended scope and files affected, and wait for explicit implementation authorization if approval has not already been given.

If you discover something that appears to conflict with this specification:

DO NOT automatically change it.

First report the conflict and explain why it matters.

If a database/schema change appears necessary:

STOP and request explicit approval.

If a requirement is ambiguous:

STOP and ask for clarification rather than inventing a requirement.

This document is the continuity record for the AI agents working on this project.
