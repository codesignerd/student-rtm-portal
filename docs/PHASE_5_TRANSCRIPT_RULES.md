# PHASE 5 — FINAL TRANSCRIPT RULES & SPECIFICATION LOCK

## 1. PURPOSE

This document defines the formal, locked requirements for **Phase 5 — Student Transcript Generation & Preview** of the Student Result and Transcript Management Portal. It establishes the authoritative source of truth for transcript data content, presentation ordering, score visibility, print behavior, institutional branding, safety handling, and security boundaries.

---

## 2. AUTHORITATIVE SOURCES

This specification strictly adheres to:

1. `docs/AI_PROJECT_CONTEXT.md` (System architecture, phase history, and future phase structure)
2. `docs/MASTER_DEVELOPMENT_SPECIFICATION.md` (Case study scope, user requirements, and transcript specifications)
3. `docs/DATABASE_SCHEMA.md` (Locked database structure and derived transcript entity definition)
4. `docs/PHASE_3D_SEED_DATA.md` & `docs/PHASE_3D_SEED_EXECUTION.md` (Live demonstration dataset)
5. `docs/PHASE_4_ACADEMIC_RULES.md` & `docs/PHASE_4_SPECIFICATION.md` (Locked GPA/CGPA calculation engine)
6. `docs/PHASE_5_DISCOVERY_AUDIT.md` (Phase 5 baseline audit and readiness assessment)

---

## 3. PHASE 5 SCOPE

Phase 5 is strictly limited to:

> **STUDENT TRANSCRIPT GENERATION & PREVIEW**

The primary user is the authenticated student accessing their own academic transcript via `/student/transcript`.

### Mandatory Scope Boundaries:
* The transcript is a **derived academic record** computed dynamically from stored result records.
* **No `transcripts` database table will be created.**
* **No database schema modifications, columns, or migration files will be created.**
* **No admin transcript workflows will be built in Phase 5** (reserved for Phase 6).
* **No external npm packages or PDF generation libraries will be installed.**

---

## 4. LOCKED PHASE 4 CALCULATION RULES

All academic performance metrics on the transcript must consume the certified calculation engine (`src/services/academicCalculations.ts`):

### Semester GPA:
* Computed per academic semester using $\text{GPA} = \frac{\sum (\text{grade\_point} \times \text{credit\_unit})}{\sum \text{credit\_unit}}$.
* Uses authoritative `results.grade_point` and `courses.credit_unit`.
* Quality Points for each course item are calculated as $\text{grade\_point} \times \text{credit\_unit}$.
* Zero-credit courses and records with invalid/missing grade points or credit units are excluded from calculations.
* Valid failed results participate normally according to their stored grade points and credit units.

### Cumulative CGPA:
* Computed across all applicable valid result records belonging to the authenticated student across all sessions and semesters.
* Aggregates total quality points and total valid credit units across the student's entire academic history:
  $$\text{CGPA} = \frac{\text{Total Quality Points Across All Semesters}}{\text{Total Credit Units Across All Semesters}}$$
* **Must NOT average individual semester GPAs.**
* **Must NOT restrict calculation to the latest semester.**

---

## 5. TRANSCRIPT DATA FIELDS

The transcript presentation is strictly composed of approved fields from the locked 6-table database schema (`users`, `students`, `academic_sessions`, `semesters`, `courses`, `results`).

### A. Student Identity Header (from `public.students` & `public.users`):
* **Full Name** (`students.full_name`) — *Required*
* **Matriculation Number** (`students.matric_number`) — *Required*
* **Department** (`students.department`) — *Required*
* **Level of Enrollment** (`students.level_of_enrollment`) — *Required*
* **Student Status** (`students.status`) — *Required*
* **Institutional Email** (`public.users.email` / `students.email`) — *Required*
* **Phone Number** (`students.phone`) — *Optional presentation field (display if present)*

### B. Academic Result Rows (per course):
* **Course Code** (`courses.course_code`) — *Required*
* **Course Title** (`courses.course_title`) — *Required*
* **Credit Units** (`courses.credit_unit`) — *Required*
* **Numerical Score** (`results.score`) — *Required*
* **Letter Grade** (`results.grade`) — *Required*
* **Grade Point** (`results.grade_point`) — *Required*
* **Quality Points** ($\text{results.grade\_point} \times \text{courses.credit\_unit}$) — *Required*
* **Remark** (`results.remark`) — *Optional presentation field (display if present)*

### C. Academic Session & Semester Grouping:
* **Session Name** (`academic_sessions.session_name`) — *Required*
* **Semester Name** (`semesters.semester_name`) — *Required*
* **Semester GPA** (Computed via `calculateSemesterGpa()`) — *Required*
* **Semester Earned Credit Units** (Sum of `credit_unit` for semester) — *Required*

### D. Cumulative Academic Summary:
* **Total Registered Courses** — *Required*
* **Total Earned Credit Units** — *Required*
* **Total Quality Points** — *Required*
* **Overall CGPA** (Computed via `calculateCgpa()`) — *Required*

### Prohibited Fields:
* Fields not present in the approved schema (e.g. class rank, transcript serial numbers, passport photograph, conduct notes, billing history).

---

## 6. TRANSCRIPT ORGANIZATION & ORDERING

1. **Hierarchy**:
   ```text
   Institution Header & Branding
     ↓
   Student Identity Block
     ↓
   Academic History (Grouped by Session → Semester)
     ↓
   [For each Semester]:
     - Course Results Table
     - Semester Summary (Semester Credits, Quality Points, Semester GPA)
     ↓
   Cumulative Academic Performance Summary (Total Credits, Total Quality Points, Overall CGPA)
     ↓
   Document Disclaimer & Signature Block Placeholder
   ```
2. **Ordering Criteria**:
   * **Academic Sessions**: Ordered chronologically by academic session start date or session structure.
   * **Semesters**: Ordered by `semesters.semester_order` (e.g., 1 for First Semester, 2 for Second Semester).
   * **Courses**: Ordered alphabetically by `courses.course_code`.

---

## 7. SCORE VISIBILITY DECISION

* **Decision**: **Score + Grade + Grade Point + Credit Unit + Quality Points** will be displayed in the transcript course table.
* **Rationale**: This is consistent with `src/types/database.ts` (`ResultRecord` / `StudentResultItem`), `StudentResultsPage.tsx`, and standard Nigerian tertiary institution transcript formats (such as Federal Polytechnic Offa), where raw numerical scores are recorded alongside letter grades and grade points for complete transparency.

---

## 8. TRANSCRIPT TYPE & DISCLAIMER

* **Classification**: **Student-Facing Unofficial Academic Record Preview**.
* **Disclaimer Requirement**: Every transcript preview and printout must explicitly include a bottom disclaimer note:
  > *"This document is an unofficial academic transcript preview generated from the Student Portal. It is issued for informational purposes only and does not constitute an official registrar-certified transcript."*

---

## 9. PRINT / EXPORT BEHAVIOR DECISION

* **Decision**: **Browser-Native Print (`window.print()`) with Tailwind CSS `@media print` utilities.**
* **Rationale**: Eliminates external PDF library dependencies, guarantees 100% vector text sharpness, ensures immediate compatibility across all modern browsers, and keeps bundle size minimal.
* **Print Specification Rules**:
  * **Print Action**: Prominent "Print / Save as PDF" button at the top of the transcript page calling `window.print()`.
  * **Hidden Elements During Print**: Portal navbar, sidebar navigation, footer, breadcrumbs, page headers, action buttons (`display: none` via `print:hidden`).
  * **Print Styling**:
    * Clean, high-contrast black and white / grayscale palette.
    * Page margins set to A4 standard (`@page { size: A4 portrait; margin: 15mm; }`).
    * Tables use explicit borders (`border-collapse`, `border-slate-300`).
    * Page-break safety (`break-inside: avoid` / `page-break-inside: avoid`) on semester blocks to prevent orphaned headers or broken table rows.

---

## 10. INSTITUTIONAL BRANDING & HEADER

* **Institutional Title**: **FEDERAL POLYTECHNIC OFFA**
* **Portal Subtitle**: *Student Result & Transcript Management Portal*
* **Document Name**: **UNOFFICIAL ACADEMIC TRANSCRIPT**
* **Identity Details**: Displays Department Name and Level of Enrollment as recorded in `public.students`.
* **Asset Handling**: Uses a clean, CSS/SVG styled text-based institutional header. No unapproved logo files or fabricated signature images will be created.

---

## 11. EMPTY, PARTIAL, AND ERROR DATA STATES

1. **Loading State**: Displays standard loading indicator while fetching authentication and student records.
2. **Unauthenticated**: Displays access warning and redirects to `/login`.
3. **Student Profile Not Found**: Displays warning banner explaining that the user account is not linked to a student profile.
4. **Empty Academic History (0 Results)**: Renders the student identity header cleanly, followed by an empty state message: *"No published course results recorded for this student."* GPA/CGPA summary card displays `"Unavailable"` or `"N/A"` rather than `0.00`.
5. **Partial / Null Data Safety**: Missing course titles fall back to `'Untitled Course'`; missing credit units fall back to `0` and are excluded from calculations via `academicCalculations.ts`.
6. **Fetch Error**: Displays error alert with retry button.

---

## 12. AUTHENTICATION & SECURITY RULES

* **Identity Anchoring**: Transcript generation begins with `supabase.auth.getUser()`.
* **Data Resolution Chain**:
  $$\text{Supabase Auth user.id} \longrightarrow \text{public.students.user\_id} \longrightarrow \text{student\_id} \longrightarrow \text{public.results}$$
* **URL Parameter Guard**: The route `/student/transcript` accepts NO query parameters (`?student_id=...`) or route parameters (`/:studentId`).
* **RLS Protection**: All database queries execute against active Supabase Row-Level Security policies (`results_select_own_or_admin`). Non-owner students cannot query other students' results.
* **Credentials**: Uses only `VITE_SUPABASE_ANON_KEY`. No service-role keys permitted.

---

## 13. UI & ROUTE PLACEMENT

* **Route**: `/student/transcript`
* **Layout**: Wrapped in `<StudentLayout>` and `<ProtectedRoute allowedRoles={['student']}>` in `src/routes/AppRoutes.tsx`.
* **Page Component**: `src/pages/student/StudentTranscriptPage.tsx`.

---

## 14. PROHIBITED FEATURES

The following are strictly **OUT OF SCOPE**:

* ❌ Creating a `transcripts` table or any database schema modification.
* ❌ Creating database migration files or altering seed data.
* ❌ Transcript ordering, fee payments, or cart workflows.
* ❌ Admin transcript management (belongs to Phase 6).
* ❌ External QR verification, digital signatures, or seal generation.
* ❌ Academic standing (Probation / Distinction) classifications.
* ❌ Installing third-party PDF generation libraries.

---

## 15. IMPLEMENTATION CONSTRAINTS

* All code changes in Phase 5 must pass `npm run lint` with **0 errors and 0 warnings**.
* Production build `npm run build` must succeed with **0 errors**.
* Existing Phase 3A–3D and Phase 4 functionality must remain 100% functional (no regression).

---

## 16. ACCEPTANCE CRITERIA

1. `/student/transcript` renders a complete academic transcript derived from live database records for the logged-in student.
2. Displays student identity details, session/semester grouped results, scores, grades, grade points, quality points, credit units, semester GPAs, and overall CGPA.
3. Clicking "Print / Save as PDF" opens the browser print dialog with all UI chrome hidden and a clean A4 printable document.
4. Unauthenticated users and users without linked student profiles are handled gracefully.
5. Zero database changes, zero hard-coded values, zero extra dependencies, and zero lint/build errors.

---

## 17. FINAL IMPLEMENTATION-READINESS DECISION

```text
PHASE 5 READY FOR IMPLEMENTATION
```

All Phase 5 requirements, calculation rules, security boundaries, score visibility decisions, and print behaviors are fully locked. Implementation may proceed upon receiving explicit authorization.

