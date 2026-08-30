# PHASE 6 — ADMIN ACADEMIC MANAGEMENT SPECIFICATION

## 1. PHASE 6 OBJECTIVE

This document establishes the formal, locked requirements for **Phase 6 — Admin Academic Management** of the Student Result and Transcript Management Portal. Phase 6 extends the portal with comprehensive administrative capabilities, allowing authorized administrators to manage students, academic sessions, semesters, courses, student results, and transcript previews while preserving the locked database schema and all previous phase implementations.

---

## 2. AUTHORITATIVE SOURCE DOCUMENTS

1. **`docs/PHASE_6_DISCOVERY_AUDIT.md`**: Phase 6 discovery, scope analysis, and security audit.
2. **`docs/MASTER_DEVELOPMENT_SPECIFICATION.md`**: §5.2 (Admin Role), §6 (Admin Dashboard, Student Management, Result Management, Transcript Management).
3. **`docs/DATABASE_SCHEMA.md`**: §6 (Access & Security Model), §7 (Explicit Scope Exclusions).
4. **`docs/AI_PROJECT_CONTEXT.md`**: §11 (Role-Based Access Control), §16 (Portal Architecture), §34 (Future Phase Structure).
5. **`src/supabase/migration/001_initial_schema.sql`**: Baseline database schema, `public.is_admin()` SQL function, and administrative RLS policies.
6. **`docs/PHASE_4_ACADEMIC_RULES.md` & `docs/PHASE_5_TRANSCRIPT_RULES.md`**: Locked GPA/CGPA engine and transcript specifications.

---

## 3. ADMIN AUTHENTICATION RULES

* **Role Identification**: Administrator status is determined strictly via `public.users.role = 'admin'` and `status = 'active'` in the database. `LOCKED`
* **Security Function**: Admin privileges are checked on the server side via the `public.is_admin()` SQL function (`SECURITY DEFINER`). `LOCKED`
* **Route Protection**: All `/admin/*` routes must be wrapped in `<ProtectedRoute allowedRoles={['admin']}>`. `LOCKED`
* **Layout Shell**: Administrative pages render inside `<AdminLayout>` (`src/layouts/AdminLayout.tsx`). `LOCKED`
* **Unauthorized Access**: If an authenticated non-admin (e.g. a student) attempts to access `/admin/*`, `ProtectedRoute` immediately redirects them to `/login`. `LOCKED`
* **Session Expiry**: If an admin session expires or becomes invalid, all requests return an authentication error and redirect to `/login`. `LOCKED`
* **No Dual Auth**: Admin authentication uses standard Supabase Auth (`supabase.auth`). No secondary admin login mechanism is allowed. `LOCKED`

---

## 4. ADMIN DASHBOARD RULES

The administrative dashboard (`/admin` / `/admin/dashboard`) provides a high-level operational overview:

### Authorized Metrics:
1. **Total Students**: Dynamic count of registered students (`COUNT(*)` from `public.students`). `AUTHORIZED`
2. **Total Academic Results**: Dynamic count of published result records (`COUNT(*)` from `public.results`). `AUTHORIZED`
3. **Total Active Courses**: Dynamic count of active courses (`COUNT(*)` from `public.courses WHERE status = 'active'`). `AUTHORIZED`
4. **Active Session & Semester**: Current active session (`public.academic_sessions`) and active semester (`public.semesters`). `AUTHORIZED`
5. **Quick Navigation Actions**: Shortcuts to Student Management, Result Management, Course Management, and Session Management. `AUTHORIZED`

### Rules:
* All metrics are computed dynamically at runtime from database queries. `LOCKED`
* No dashboard metrics shall be stored as hardcoded or persisted summary fields in the database. `LOCKED`
* Revenue charts, financial widgets, and complex analytics are **STRICTLY PROHIBITED**. `NOT AUTHORIZED`

---

## 5. STUDENT MANAGEMENT RULES

Administrators are granted full management capabilities over student records via `/admin/students`:

* **View Student List**: Paginated table displaying students from `public.students`. `AUTHORIZED`
* **Search & Filter**: Search by matriculation number or full name; filter by department or level of enrollment. `AUTHORIZED`
* **View Student Profile Details**: Detailed view showing personal identity, contact info, enrollment level, and system metadata. `AUTHORIZED`
* **Create Student**: Form to create new student records. `AUTHORIZED`
* **Edit Student Information**: Update full name, department, level of enrollment, email, phone, and status (`active`/`inactive`). `AUTHORIZED`
* **Matriculation Number Uniqueness**: `matric_number` must remain unique (`public.students.matric_number` unique constraint). `LOCKED`
* **Hard Deletion**: Hard deletion (`DELETE FROM public.students`) is **NOT AUTHORIZED**. Deactivation via setting `status = 'inactive'` must be used to preserve historical academic integrity. `NOT AUTHORIZED`

---

## 6. STUDENT AUTH ACCOUNT & PASSWORD RULES

To ensure security while linking student records to Supabase Auth:

* **Identity Chain**: Each `public.students` record must link to a `public.users` record, which references `auth.users(id)`. `LOCKED`
* **Auth Account Creation**:
  * During student creation by an admin, a corresponding Supabase Auth user must be created. `AUTHORIZED`
  * Frontend code must **NEVER** contain a Supabase `service_role` key. `LOCKED`
  * Student Auth user creation must use standard client sign-up (`supabase.auth.signUp()`) or an authorized Supabase Edge Function / RPC helper if direct client creation is restricted. `LOCKED`
* **Password Handling**:
  * Admin sets an initial temporary password during student creation, or the system generates one. `AUTHORIZED`
  * Passwords must **NEVER** be stored in `public.students`, `public.users`, or any application database table. All password hashes are managed exclusively by Supabase Auth (`auth.users`). `LOCKED`
* **User ID Association**: Upon creation of `auth.users`, the resulting UUID is populated into `public.users.user_id` and `public.students.user_id`. `LOCKED`

---

## 7. ACADEMIC SESSION MANAGEMENT RULES

Administrators manage academic session records (`public.academic_sessions`) via `/admin/sessions`:

* **View Sessions**: List all recorded academic sessions ordered by start date or name. `AUTHORIZED`
* **Create Session**: Insert session record with `session_name` (e.g. `2024/2025`), `start_date`, and `end_date`. `AUTHORIZED`
* **Edit Session**: Update session name, date boundaries, and status. `AUTHORIZED`
* **Session Name Uniqueness**: `session_name` must remain unique. `LOCKED`
* **Date Validation**: End date must be on or after start date (`CHECK (end_date >= start_date)`). `LOCKED`
* **Status**: Toggling session status between `active` and `inactive`. `AUTHORIZED`
* **Hard Deletion**: Deletion of sessions linked to active semester/result records is **NOT AUTHORIZED**. `NOT AUTHORIZED`

---

## 8. SEMESTER MANAGEMENT RULES

Administrators manage semester records (`public.semesters`) via `/admin/semesters`:

* **View Semesters**: List semesters grouped by or linked to their parent academic session. `AUTHORIZED`
* **Create Semester**: Insert semester record with `session_id`, `semester_name` (e.g. `First Semester`), `semester_order` (`1` or `2`), `start_date`, and `end_date`. `AUTHORIZED`
* **Semester Order Rules**: `semester_order` must be strictly `1` or `2` (`CHECK (semester_order IN (1, 2))`). `LOCKED`
* **Uniqueness Constraints**: Unique on `(session_id, semester_name)` and `(session_id, semester_order)`. `LOCKED`
* **Edit Semester**: Update semester name, order, date boundaries, and status. `AUTHORIZED`
* **Hard Deletion**: Deletion of semesters linked to active result records is **NOT AUTHORIZED**. `NOT AUTHORIZED`

---

## 9. COURSE MANAGEMENT RULES

Administrators manage course records (`public.courses`) via `/admin/courses`:

* **View Courses**: List all registered courses. `AUTHORIZED`
* **Create Course**: Insert course with `course_code` (e.g. `NCC 421`), `course_title`, `credit_unit`, and `course_type`. `AUTHORIZED`
* **Course Code Uniqueness**: `course_code` must remain unique. `LOCKED`
* **Credit Unit Validation**: Must satisfy `CHECK (credit_unit > 0 AND credit_unit <= 30)`. `LOCKED`
* **Course Type Allowed Values**: Must be strictly `'Required'` or `'Elective'`. `LOCKED`
* **Edit Course**: Update course title, credit unit, course type, and status (`active`/`inactive`). `AUTHORIZED`
* **Student Self-Registration**: Student course registration workflows are **STRICTLY PROHIBITED**. `NOT AUTHORIZED`

---

## 10. RESULT MANAGEMENT RULES

Administrators manage student results (`public.results`) via `/admin/results`:

### Result Entry & Editing:
* **Context Selection**: Admin selects target Student (`student_id`), Course (`course_id`), and Semester (`semester_id`). `AUTHORIZED`
* **Data Fields**: Score (`score`), Letter Grade (`grade`), Grade Point (`grade_point`), and Remark (`remark`). `AUTHORIZED`
* **Uniqueness Constraint**: Unique on `(student_id, course_id, semester_id)` to prevent duplicate result records. `LOCKED`
* **Duplicate Result Handling**: Encountering an existing result for the same student/course/semester triggers an update confirmation rather than inserting a duplicate row. `LOCKED`

### Score & Grade Derivation:
* **Authoritative Calculation Fields**: `results.grade_point` and `courses.credit_unit` remain the authoritative values for all GPA/CGPA calculations. `LOCKED`
* **Score-to-Grade Auto-Derivation**: Upon entering a numerical score ($0.00$ to $100.00$), the UI automatically derives the suggested letter grade, grade point, and remark based on the Polytechnic standard scale:
  * $75.00 - 100.00 \rightarrow$ Grade: `A`, Grade Point: `4.00`, Remark: `Excellent`
  * $70.00 - 74.99 \rightarrow$ Grade: `AB`, Grade Point: `3.50`, Remark: `Very Good`
  * $65.00 - 69.99 \rightarrow$ Grade: `B`, Grade Point: `3.25`, Remark: `Good`
  * $60.00 - 64.99 \rightarrow$ Grade: `BC`, Grade Point: `3.00`, Remark: `Credit`
  * $55.00 - 59.99 \rightarrow$ Grade: `C`, Grade Point: `2.75`, Remark: `Lower Credit`
  * $50.00 - 54.99 \rightarrow$ Grade: `CD`, Grade Point: `2.50`, Remark: `Pass`
  * $45.00 - 49.99 \rightarrow$ Grade: `D`, Grade Point: `2.25`, Remark: `Pass`
  * $40.00 - 44.99 \rightarrow$ Grade: `E`, Grade Point: `2.00`, Remark: `Barely Pass`
  * $0.00 - 39.99 \rightarrow$ Grade: `F`, Grade Point: `0.00`, Remark: `Fail`
  *(Note: Admin may manually adjust grade/point if required by institutional override rules).* `AUTHORIZED`
* **Immediate System Impact**: Saving or editing a result immediately updates all dynamic GPA, CGPA, dashboard, and transcript displays. `LOCKED`

---

## 11. GPA / CGPA ADMIN RULES

* **Calculation Engine**: Admin views of GPA and CGPA must consume the certified calculation engine (`src/services/academicCalculations.ts`). `LOCKED`
* **No Database Storage**: GPA and CGPA shall **NEVER** be stored as columns in database tables. `LOCKED`
* **ReadOnly Calculated View**: Admin views of GPA/CGPA on student detail cards or transcripts are strictly read-only derived metrics. `LOCKED`
* **Academic Standing Classifications**: Probation, Warning, Distinction badges, or class rankings remain **STRICTLY PROHIBITED**. `NOT AUTHORIZED`

---

## 12. ADMIN TRANSCRIPT PREVIEW RULES

* **Student Transcript Preview**: Admins can select any student from `/admin/students` or `/admin/transcripts` and preview their full academic transcript using the Phase 5 transcript component. `AUTHORIZED`
* **Print / Export**: Admins may print or save the transcript preview as PDF via browser-native printing (`window.print()`). `AUTHORIZED`
* **Disclaimer**: The unofficial transcript disclaimer remains mandatory on all admin transcript previews. `LOCKED`
* **Prohibited Workflows**: Transcript ordering, payment processing, fee collection, registrar digital signatures, and QR verification servers are **STRICTLY PROHIBITED**. `NOT AUTHORIZED`

---

## 13. SECURITY & RLS RULES

* **Admin Access Enforcement**: Admin operations execute under Supabase Row-Level Security policies gated by `public.is_admin()`. `LOCKED`
* **Table Permissions**:
  * `public.users`: Admin SELECT, INSERT, UPDATE, DELETE allowed by `users_admin_manage`. `LOCKED`
  * `public.students`: Admin SELECT, INSERT, UPDATE, DELETE allowed by `students_admin_...`. `LOCKED`
  * `public.academic_sessions`: Admin ALL operations allowed by `sessions_admin_manage`. `LOCKED`
  * `public.semesters`: Admin ALL operations allowed by `semesters_admin_manage`. `LOCKED`
  * `public.courses`: Admin ALL operations allowed by `courses_admin_manage`. `LOCKED`
  * `public.results`: Admin ALL operations allowed by `results_admin_manage`. `LOCKED`
* **Student Data Isolation**: RLS policies for student roles remain completely unchanged. Students cannot access admin routes or view/modify other students' records. `LOCKED`
* **Frontend Credentials**: Frontend code must use only `VITE_SUPABASE_ANON_KEY`. Service-role keys in client code are **STRICTLY PROHIBITED**. `LOCKED`

---

## 14. DATABASE PROTECTION RULES

* **Immutable Migration File**: `src/supabase/migration/001_initial_schema.sql` is **LOCKED** and must not be altered. `LOCKED`
* **Zero Schema Modifications**: No new tables, columns, indexes, triggers, or migrations will be created for Phase 6. `LOCKED`
* **Schema Sufficiency**: The approved 6-table schema (`users`, `students`, `academic_sessions`, `semesters`, `courses`, `results`) contains 100% of the structure required for Phase 6. `LOCKED`

---

## 15. UI / UX RULES

* **Design System Integration**: Admin interfaces render inside `<AdminLayout>` using existing Tailwind CSS styling conventions. `LOCKED`
* **Component Architecture**: Reusable administrative components (data tables, filter bars, edit modals, confirmation dialogs, status badges). `LOCKED`
* **User Feedback**: Include explicit loading spinners, empty table states, error alert banners, and success toasts/alerts upon creation or update actions. `LOCKED`
* **No Extra UI Libraries**: Do not install third-party component libraries or complex chart plugins. `LOCKED`

---

## 16. PHASE 3–5 REGRESSION RULES

Phase 6 development must preserve:
1. Student login and authentication state listener (`useAuth`).
2. Student navigation routes (`/student/dashboard`, `/student/results`, `/student/profile`, `/student/transcript`).
3. Student data isolation and RLS boundaries.
4. Phase 4 GPA and CGPA calculation engine (`academicCalculations.ts`).
5. Demonstration seed data (`demo_student_seed.sql`). `LOCKED`

---

## 17. EXPLICITLY PROHIBITED FEATURES

The following features remain **STRICTLY PROHIBITED**:

* ❌ Lecturer accounts, roles, or dashboards.
* ❌ Student course registration workflows.
* ❌ Department / Class management tables.
* ❌ Fees, billing, or payment gateway integration.
* ❌ Attendance tracking.
* ❌ Hostel, Library, Payroll, or Staff management modules.
* ❌ External transcript verification APIs, QR codes, or digital signatures.
* ❌ Academic standing (Probation, Warning, Distinction) badges.
* ❌ Financial analytics or unapproved reporting widgets.

---

## 18. UNRESOLVED QUESTIONS / REQUIRED DECISION LOCKS

All core operational rules are now resolved:
1. **Student Deactivation**: Deactivation (`status = 'inactive'`) is locked in place of hard deletion.
2. **Score-to-Grade Scale**: Standard Polytechnic grading scale (75+ A, 70-74 AB, 65-69 B, etc.) is locked for auto-derivation with admin manual override support.
3. **Password Storage**: Passwords remain exclusively managed by Supabase Auth; no plain-text or hashed passwords in database tables.

---

## 19. IMPLEMENTATION CONSTRAINTS

* All code changes must pass `npm run lint` with **0 errors and 0 warnings**.
* Production build `npm run build` must succeed with **0 errors**.
* Zero schema migrations or seed file changes.

---

## 20. FINAL SPECIFICATION STATUS

```text
PHASE 6 READY FOR IMPLEMENTATION
```

All Phase 6 administrative requirements, dashboard metrics, student management rules, session/semester/course workflows, result entry grading scales, security RLS boundaries, and UI placement rules are fully locked. Implementation may proceed upon receiving explicit authorization.

