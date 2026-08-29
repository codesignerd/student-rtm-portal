# AI PROJECT CONTEXT & DEVELOPMENT MASTER RECORD

## Student Results & Transcript Management Portal

**Project Type:** Academic Student Results & Transcript Management Portal
**Frontend:** React + TypeScript + Vite
**Styling:** Tailwind CSS
**Backend / Database / Authentication:** Supabase
**Routing:** React Router
**Deployment:** Docker / containerized deployment
**Primary User Roles:** Student and Admin
**Lecturer Role:** NOT PART OF THIS PROJECT

---

# 1. PURPOSE OF THIS DOCUMENT

This document is the persistent project context and development record for the AI coding agent working on this project.

Before making any implementation changes, the AI agent MUST read:

1. `docs/AI_PROJECT.md`
2. `docs/MASTER_DEVELOPMENT_SPECIFICATION.md`
3. `docs/DATABASE_SCHEMA.md`
4. The current project source code
5. Relevant migration/schema files when database behavior is involved

This document describes the project's architecture, scope, completed work, development phases, constraints, and current state.

The AI agent MUST NOT assume that a feature should be implemented simply because it is technically possible.

The approved project scope always takes priority.

---

# 2. PROJECT OBJECTIVE

The project is a web-based Student Results and Transcript Management Portal.

The primary objective is to allow authenticated students to securely access their academic information, particularly:

* Student profile information
* Academic results
* Semester/session information
* Transcript-related academic records

Administrators will eventually manage the relevant academic records according to the approved project specification.

The system is intentionally NOT a complete school management system.

---

# 3. TECHNOLOGY STACK

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

## Backend / Platform

Supabase is being used for:

* Authentication
* PostgreSQL database
* Row Level Security
* Database access from the frontend

There is currently no separate Node.js/Express backend.

## Deployment

Docker is part of the project architecture.

The project already contains:

* `Dockerfile`
* `docker-compose.yaml`

The Docker setup should remain intact unless a genuine configuration problem is discovered.

---

# 4. DATABASE IS LOCKED

The database schema is considered LOCKED.

The authoritative database documentation is:

`docs/DATABASE_SCHEMA.md`

The migration/schema implementation is:

`src/supabase/migration/001_initial_schema.sql`

AI agents MUST NOT modify the database schema casually.

Do NOT:

* create new tables without explicit approval
* rename existing tables
* rename columns
* remove columns
* change relationships
* modify constraints
* modify RLS policies
* add lecturer tables
* introduce speculative database structures

If a genuine database limitation is discovered, STOP and report it before making schema changes.

---

# 5. CURRENT DATABASE STRUCTURE

The important existing tables include:

## public.users

Application-level user identity and authorization.

Fields include:

* user_id
* email
* role
* status
* created_at
* updated_at

Allowed application roles:

* admin
* student

There is NO lecturer role.

---

## public.students

Student identity/profile information.

Fields include:

* student_id
* user_id
* matric_number
* full_name
* date_of_birth
* gender
* email
* phone
* department
* level_of_enrollment
* status
* created_at
* updated_at

`user_id` links the student record to `public.users`.

---

## public.results

Academic result records.

Fields include:

* result_id
* student_id
* course_id
* semester_id
* score
* grade
* grade_point
* remark
* created_at
* updated_at

---

## public.courses

Course reference information.

Fields include:

* course_id
* course_code
* course_title
* credit_unit
* course_type
* status
* created_at
* updated_at

---

## public.semesters

Semester information.

Fields include:

* semester_id
* session_id
* semester_name
* semester_order
* start_date
* end_date
* status
* created_at
* updated_at

---

## public.academic_sessions

Academic session information.

Fields include:

* session_id
* session_name
* start_date
* end_date
* status
* created_at
* updated_at

---

# 6. DATABASE RELATIONSHIP CHAIN

The core student academic-data relationship is:

`auth.users.id`

↓

`public.users.user_id`

↓

`public.students.user_id`

↓

`public.students.student_id`

↓

`public.results.student_id`

↓

`public.results.course_id`

↓

`public.courses.course_id`

And:

`public.results.semester_id`

↓

`public.semesters.semester_id`

↓

`public.academic_sessions.session_id`

This relationship chain is extremely important.

Student academic data must always be scoped to the authenticated student's identity.

---

# 7. AUTHENTICATION ARCHITECTURE

Supabase Auth manages authentication.

The application does NOT manually hash passwords.

The frontend uses Supabase authentication APIs such as:

`supabase.auth.signInWithPassword()`

Supabase Auth handles password storage and verification.

The application should NEVER:

* manually hash passwords
* store plaintext passwords
* create its own password comparison mechanism
* read password hashes
* store authentication passwords in `public.users`

The authenticated Supabase user's ID is used to locate the corresponding application user in:

`public.users`

The application role is obtained from `public.users.role`.

Do NOT use:

`auth.user.user_metadata.role`

as the authoritative application role source.

---

# 8. CURRENT AUTHENTICATION FLOW

The current authentication flow has already been implemented and tested.

Login:

1. User enters email and password.
2. Frontend validates that both fields are present.
3. Supabase Auth attempts authentication.
4. If credentials are invalid, an appropriate error is shown.
5. If authentication succeeds, the authenticated user ID is obtained.
6. The matching `public.users` record is retrieved.
7. The application role is resolved.
8. Student users are redirected to the student portal.
9. Admin users are redirected to the admin portal.

Current login route:

`/login`

---

# 9. ROUTE PROTECTION

Protected routes use the existing authentication system.

Important files:

* `src/hooks/useAuth.ts`
* `src/routes/ProtectedRoute.tsx`
* `src/routes/AppRoutes.tsx`

Current role restrictions:

### Student

Student routes require:

`student`

### Admin

Admin routes require:

`admin`

Unauthenticated users must not access protected routes.

Users with missing, invalid, or unresolved roles must not be granted protected access.

An admin must not access student-only routes.

A student must not access admin-only routes.

---

# 10. SUPABASE ENVIRONMENT CONFIGURATION

The project uses Vite environment variables.

Required variables:

`VITE_SUPABASE_URL`

`VITE_SUPABASE_ANON_KEY`

Runtime environment configuration is stored locally in:

`.env.local`

Template configuration is stored in:

`.env.example`

`.env.example` is only a template.

It must NOT contain real secrets.

Do NOT install the `dotenv` package simply to solve frontend Vite environment loading.

Vite already provides environment-variable loading through:

`import.meta.env`

The Supabase client is centralized in:

`src/services/supabase/client.ts`

---

# 11. TEST USERS

Development testing currently includes manually created Supabase Auth users.

The Auth user UUID must match:

`public.users.user_id`

and for student accounts:

`public.students.user_id`

This relationship is required for the application's role and student identity resolution.

When additional test data is required, use clearly identified development/test records.

Do not modify production-like data unnecessarily.

---

# 12. COMPLETED DEVELOPMENT PHASES

## PHASE 1 — FOUNDATION

STATUS: COMPLETED

Implemented:

* Supabase client
* environment configuration
* authentication types
* database types foundation
* React Router setup
* protected routes
* student layout shell
* admin layout shell
* login placeholder
* basic application structure
* Docker configuration fixes

Verification completed:

* `npm run build`
* `npm run lint`
* development server startup
* preview server startup

No database schema changes were made.

---

# 13. PHASE 1 AUTH FIX

STATUS: COMPLETED

An issue was discovered where the application role was initially being read from Supabase Auth metadata.

This was corrected.

The application now uses:

`public.users.role`

as the authoritative application role.

Protected route behavior was also corrected so that unresolved or missing roles cannot bypass route protection.

---

# 14. ENVIRONMENT CONFIGURATION FIX

STATUS: COMPLETED

The local environment configuration initially used the wrong variable name.

The application expects:

`VITE_SUPABASE_ANON_KEY`

The local environment file was corrected accordingly.

The application uses:

`.env.local`

for local runtime configuration.

No additional dotenv package is required.

---

# 15. PHASE 2A — AUTHENTICATION

STATUS: COMPLETED

Implemented:

* real Supabase email/password login
* login validation
* Supabase credential validation
* application user lookup
* role resolution
* student redirect
* admin redirect
* logout
* protected routes
* role enforcement
* authentication error states

Testing confirmed:

* empty email/password produces validation feedback
* invalid credentials produce an authentication error
* valid student credentials successfully log in
* student users reach the student dashboard
* unauthenticated users cannot access protected routes
* students cannot access admin routes

---

# 16. PHASE 2B — STUDENT PORTAL FOUNDATION

STATUS: COMPLETED

Implemented:

Student portal shell with:

* student branding/title area
* student navigation
* content region
* logout

Current student routes include:

`/student`

`/student/dashboard`

`/student/results`

`/student/transcript`

`/student/profile`

The `/student` route redirects to:

`/student/dashboard`

Placeholder pages were created for:

* Student Dashboard
* Student Results
* Student Transcript
* Student Profile

The current dashboard UI is intentionally minimal/placeholder-level.

This is acceptable because the early phases focused primarily on architecture, authentication, routing, security, and data flow.

Do NOT unnecessarily redesign the dashboard unless a UI implementation phase has been explicitly approved.

---

# 17. CURRENT PROJECT STATE

CURRENT DEVELOPMENT STAGE:

# PHASE 3A — STUDENT RESULT RETRIEVAL

The project is now ready to begin implementing student result retrieval.

The Phase 3A audit has already been completed.

The audit confirmed that the current database schema and RLS policies support secure student result retrieval.

---

# 18. PHASE 3A AUDIT FINDINGS

The database already supports the required result retrieval flow.

No database schema changes are required.

No migration changes are required.

No RLS changes are required.

The intended query relationship is:

Authenticated user

↓

public.users

↓

public.students

↓

public.results

↓

public.courses

and:

public.results

↓

public.semesters

↓

public.academic_sessions

---

# 19. PHASE 3A APPROVED SCOPE

Phase 3A should implement ONLY:

* student result data types
* student result data-access service
* authenticated student lookup
* secure result retrieval
* course information
* semester information
* academic session information
* loading state
* empty state
* database error state
* unauthorized/missing-student state
* successful result display

The results page should display real data retrieved from Supabase.

---

# 20. PHASE 3A EXCLUSIONS

DO NOT implement the following during Phase 3A:

* GPA calculation
* CGPA calculation
* transcript generation
* PDF generation
* transcript download
* result editing
* result creation
* result deletion
* admin result management
* lecturer functionality
* attendance
* fees
* library
* course registration
* unrelated school-management modules
* database schema changes

The goal is simply:

**Authenticated student → securely retrieve their own results → display them correctly.**

---

# 21. RESULT DATA TYPES

The existing TypeScript types are currently incomplete for result retrieval.

The result implementation will likely require types representing:

* StudentRecord
* CourseRecord
* SemesterRecord
* AcademicSessionRecord
* ResultRecord
* JoinedResultWithCourseAndSemester

Types must remain aligned with the actual database schema.

Do not invent database fields.

---

# 22. RESULT DATA ACCESS

A focused service should be created for student result retrieval.

Likely location:

`src/services/supabase/studentResults.ts`

The service should remain focused and simple.

Avoid creating a large generic data-access abstraction.

The service should retrieve only the authenticated student's academic records.

Student result access must never rely on a student ID supplied blindly by the URL or client.

The authenticated user's identity must anchor the access path.

---

# 23. RESULT PAGE STATES

The results page must handle:

## Loading

Display while Supabase data is being retrieved.

## Empty

Display when the authenticated student exists but has no result records.

This is NOT a database error.

## Error

Display when the Supabase request fails.

## Unauthorized / Missing Student

Handle defensively if authentication or student mapping is unavailable.

## Success

Display the student's real result records.

---

# 24. GPA / CGPA

GPA and CGPA are NOT currently part of Phase 3A.

The database contains:

* grade_point
* credit_unit
* semester relationships

However, the official academic calculation policy has not yet been formally locked in the project documentation.

Therefore:

DO NOT invent GPA/CGPA rules.

Before implementing GPA/CGPA, the exact academic calculation rules must be explicitly approved.

---

# 25. TRANSCRIPT

Transcript functionality is a later phase.

The transcript should eventually be derived from stored academic results.

Do NOT create a separate transcript table unless explicitly approved.

Do NOT implement transcript generation during Phase 3A.

---

# 26. ADMIN FUNCTIONALITY

Admin functionality exists structurally but is NOT the immediate development target.

Do not start building admin result management while implementing Phase 3A.

Student result retrieval comes first.

Admin features must follow their own approved phase.

---

# 27. LECTURER ROLE — STRICTLY FORBIDDEN

There is no lecturer role in the approved project.

Allowed roles:

* student
* admin

Never introduce:

* lecturer
* teacher
* staff role

unless the project owner explicitly changes the specification.

---

# 28. DEVELOPMENT RULES FOR AI AGENTS

Before modifying files:

1. Read the relevant project documentation.
2. Inspect the current implementation.
3. Confirm the proposed change belongs to the current approved phase.
4. Do not modify unrelated files.
5. Do not change the database schema unless explicitly approved.
6. Do not add speculative features.
7. Do not create unnecessary abstractions.
8. Keep dependencies minimal.
9. Preserve existing authentication and security architecture.
10. Run verification after implementation.

---

# 29. VERIFICATION REQUIREMENTS

After meaningful implementation changes, run:

`npm run build`

and:

`npm run lint`

If appropriate, also run:

`npm run dev`

or the project's relevant runtime verification.

The agent must report:

* files created
* files modified
* files intentionally untouched
* implementation completed
* build result
* lint result
* runtime/test result
* unresolved issues
* confirmation that database schema was not modified

Never claim successful testing without actually running the relevant verification.

---

# 30. DATABASE SAFETY RULE

Before any database modification:

STOP.

Explain:

1. Why the modification is necessary.
2. Why the current schema cannot support the feature.
3. Which exact schema object would change.
4. What alternatives were considered.
5. What impact the change would have.

Do not silently modify migrations or database schema.

---

# 31. SECURITY RULES

Never:

* expose Supabase secrets
* print secret environment values
* commit `.env.local`
* store passwords manually
* bypass RLS
* trust client-provided student IDs for authorization
* use auth metadata as the application role source
* weaken protected route checks
* bypass authentication for testing

Use the existing Supabase security model.

---

# 32. UI/UX RULE

The project is currently prioritizing:

1. Correct architecture
2. Authentication
3. Authorization
4. Database integration
5. Functional workflows
6. Data integrity
7. Security
8. UI polish

Do not spend development effort creating highly decorative interfaces before the underlying functionality is working.

However, once a feature's functionality is stable, a dedicated UI refinement phase can improve the visual quality.

---

# 33. CURRENT NEXT ACTION

The next approved implementation is:

# PHASE 3A — STUDENT RESULT RETRIEVAL

Before coding Phase 3A, the AI agent should:

1. Read this file.
2. Read `docs/MASTER_DEVELOPMENT_SPECIFICATION.md`.
3. Read `docs/DATABASE_SCHEMA.md`.
4. Inspect the current student result placeholder.
5. Inspect the current authentication implementation.
6. Inspect the Supabase migration/RLS policies.
7. Produce a concise implementation plan.
8. Wait for explicit approval before modifying files if approval has not already been given.

Once approved, implement the result retrieval feature only.

---

# 34. FUTURE HIGH-LEVEL PHASE STRUCTURE

The project is expected to progress approximately as follows:

## Phase 1

Foundation

STATUS: COMPLETED

## Phase 2A

Authentication

STATUS: COMPLETED

## Phase 2B

Student Portal Foundation

STATUS: COMPLETED

## Phase 3A

Student Result Retrieval

STATUS: NEXT

## Phase 3B

Result Presentation / Academic Organization

STATUS: FUTURE

## Phase 4

GPA / CGPA and academic calculations

STATUS: FUTURE — requires approved academic calculation rules

## Phase 5

Transcript generation

STATUS: FUTURE

## Phase 6

Admin academic management

STATUS: FUTURE

## Phase 7

UI/UX refinement and production hardening

STATUS: FUTURE

## Phase 8

Docker deployment / final production deployment

STATUS: FUTURE

These phases are directional.

The AI agent must always follow the latest approved project specification and explicit instructions rather than assuming every future phase should be implemented immediately.

---

# 35. IMPORTANT CURRENT TESTING STATE

At the current development stage:

* Supabase project is configured.
* Test authentication users have been created.
* Student Auth UUID has been linked to `public.users`.
* Student Auth UUID has been linked to `public.students`.
* Student login has been successfully tested.
* Student dashboard access has been successfully tested.
* Student results route has been confirmed.
* Student transcript route has been confirmed.
* Student profile route has been confirmed.
* Unauthorized access to the admin route has been tested.
* Role-based redirection is working.

The student result dataset itself is the next major functional area to wire into the UI.

---

# 36. DO NOT CONFUSE PLACEHOLDERS WITH COMPLETED FEATURES

Some pages currently exist only as route/page shells.

For example:

`/student/results`

currently establishes the location for the results feature.

It does NOT mean result retrieval has been implemented.

Similarly:

`/student/transcript`

does NOT mean transcript generation exists.

The AI agent must distinguish:

* route exists
* UI shell exists
* feature exists
* backend/data integration exists

These are different development states.

---

# 37. PROJECT PHILOSOPHY

Build the system incrementally.

Do not attempt to build the entire portal at once.

Each phase should:

1. solve one clearly defined problem
2. use the existing architecture
3. preserve security
4. preserve the locked database contract
5. be tested
6. be reviewed
7. only then move to the next phase

The priority is a reliable working academic portal, not a large collection of unfinished features.

---

# 38. FINAL INSTRUCTION TO FUTURE AI AGENTS

You are working on an existing project, not starting a new project.

Before writing code:

**UNDERSTAND FIRST.**

Before changing architecture:

**VERIFY FIRST.**

Before changing the database:

**ASK FIRST.**

Before adding a feature:

**CONFIRM IT BELONGS TO THE CURRENT PHASE.**

Before declaring completion:

**BUILD, LINT, AND TEST.**

Never assume.

Never invent schema fields.

Never introduce lecturer functionality.

Never bypass Supabase RLS.

Never expose secrets.

Never expand the scope without approval.

The project should remain clean, incremental, secure, and aligned with the approved specification.

---

# CURRENT STATUS

**Project:** Student Results & Transcript Management Portal

**Current Phase:** Phase 3A — Student Result Retrieval

**Completed:** Phases 1, 2A, 2B

**Next Action:** Implement secure authenticated student result retrieval.

**Database Schema:** LOCKED

**Allowed Roles:** student, admin

**Lecturer:** NOT ALLOWED

**Authentication:** Supabase Auth

**Database:** Supabase PostgreSQL

**Frontend:** React + TypeScript + Vite

**Styling:** Tailwind CSS

**Current Priority:** Functional student result retrieval before GPA/CGPA, transcript generation, or admin workflows.
