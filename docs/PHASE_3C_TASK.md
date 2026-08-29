# Phase 3C — Student Profile

## Objective

Implement the Student Profile page for the Student Result Transcript Portal.

Phase 3A (Student Results Retrieval) and Phase 3B (Student Academic Dashboard) are already complete and verified.

Phase 3C must build on those implementations without breaking or duplicating existing functionality.

The implementation must remain strictly aligned with:

- docs/AI_PROJECT.md
- docs/AI_PROJECT_CONTEXT.md
- docs/MASTER_DEVELOPMENT_SPECIFICATION.md
- docs/DATABASE_SCHEMA.md
- Existing Supabase database schema
- Existing authentication architecture
- Existing Phase 3A implementation
- Existing Phase 3B implementation

---

## Scope

Implement a read-only Student Profile page for the authenticated student.

The page must retrieve the currently authenticated student's record through the existing Supabase authentication relationship and display the student's available profile and academic-enrollment information.

---

## Required Data

Use ONLY fields that already exist in the current `public.students` table and are documented in:

docs/DATABASE_SCHEMA.md

Do not assume or invent additional fields.

Where available in the existing schema, display appropriate student information such as:

- Full name
- Matriculation number
- Email
- Phone
- Department
- Level of enrollment
- Student status

The exact fields must be determined by inspecting the existing schema rather than creating new ones.

---

## Authentication & Identity

Use the existing authentication architecture.

Resolve the authenticated Supabase user using the established approach.

Resolve the corresponding student record through:

auth.users.id
        ↓
public.students.user_id
        ↓
student_id

Do not use hard-coded student IDs.

Do not expose another student's information.

---

## Security

Preserve the existing Row Level Security implementation.

Do NOT:

- Disable RLS.
- Modify existing RLS policies.
- Use a Supabase service-role key.
- Put privileged credentials in client-side code.
- Allow a student to access another student's profile.

---

## UI States

Implement all appropriate states:

1. Loading state
   - Clearly communicate that the profile is being loaded.

2. Unauthenticated state
   - Inform the user that authentication is required.

3. Missing student record
   - Inform the authenticated user that their account is not linked to a student record.
   - Direct them to contact the administrator.

4. Database/fetch error
   - Display a clear error message.
   - Provide a Retry action.

5. Successful state
   - Display the student's profile information in a clean, responsive and professional layout.

---

## UI & Architecture

Reuse existing:

- StudentLayout
- Authentication patterns
- Supabase client
- TypeScript database types
- Service-layer architecture
- Existing UI components
- Existing design system
- Existing navigation patterns

Do not unnecessarily duplicate existing code.

If an appropriate reusable student-profile data service already exists, reuse it.

Otherwise create a focused service under:

src/services/supabase/

Keep database access separate from presentation logic.

---

## Read-Only Requirement

The profile page is strictly read-only.

DO NOT implement:

- Edit profile
- Update profile
- Change password
- Change email
- Change phone
- Change department
- Change level
- Change matriculation number
- Avatar upload
- Profile image management

These are outside Phase 3C.

---

## Explicitly Out of Scope

Do NOT implement:

- GPA calculation
- CGPA calculation
- Transcript generation
- PDF export
- Administrator functionality
- Result entry
- Course management
- Lecturer functionality
- New roles
- New tables
- New columns
- Database migrations
- Database schema modifications

---

## Database Rules

The existing Supabase schema is considered locked.

Before making changes:

1. Inspect docs/DATABASE_SCHEMA.md.
2. Inspect the existing Phase 3A implementation.
3. Inspect the existing Phase 3B implementation.
4. Inspect the existing Student Profile page if one already exists.
5. Confirm which fields actually exist in public.students.

Do not modify the schema to satisfy the UI.

If a desired piece of information does not exist in the current schema, do not invent it. Report it instead.

---

## Testing & Verification

After implementation, run:

npm run lint

Then run:

npm run build

Both must complete successfully.

Confirm that:

- Phase 3A still works.
- Phase 3B still works.
- Student Profile works for the authenticated student.
- Unauthorized/missing/error states work appropriately.
- No database schema was modified.
- No privileged credentials were introduced.

---

## Final Implementation Report

After completing the implementation, provide a report containing:

1. Files created.
2. Files modified.
3. Features implemented.
4. Database fields used.
5. Supabase queries/services used.
6. Authentication and identity resolution.
7. Security/RLS considerations.
8. UI states implemented.
9. Lint result.
10. Build result.
11. Confirmation that no database schema was modified.
12. Confirmation that Phase 3A and Phase 3B remain functional.
13. Any issues or decisions requiring review before Phase 3D.

Do not proceed to Phase 3D automatically.