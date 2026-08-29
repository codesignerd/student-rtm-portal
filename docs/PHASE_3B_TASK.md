# Phase 3B — Student Academic Dashboard

## Objective

Implement the Student Academic Dashboard for the Student Result Transcript Portal.

Phase 3A (Student Results Retrieval) is already complete and must not be rebuilt, duplicated, or broken.

The implementation must remain strictly aligned with:

- docs/AI_PROJECT.md
- docs/AI_PROJECT_CONTEXT.md
- docs/MASTER_DEVELOPMENT_SPECIFICATION.md
- docs/DATABASE_SCHEMA.md
- Existing Supabase database schema
- Existing authentication architecture
- Existing Phase 3A implementation

## Scope

Build the authenticated student's academic dashboard using the existing database schema and existing Supabase integration.

The dashboard should provide an academic overview and navigation into existing student functionality.

## Required Behaviour

1. Resolve the authenticated Supabase user using the existing authentication approach.

2. Resolve the corresponding student record using the existing database relationship.

3. Display available student information using only fields that exist in the current database schema.

4. Display available academic session and semester information using the existing tables.

5. Provide a useful summary of the student's available academic result records.

6. Provide navigation to the existing Student Results page.

7. Reuse existing services, types, components, layouts, and UI patterns wherever appropriate.

8. Implement appropriate:
   - Loading state
   - Unauthorized/missing student state
   - Empty academic-data state
   - Database/query error state
   - Successful state

## Database Rules

DO NOT:

- Create new tables.
- Modify the existing schema.
- Add columns.
- Create a lecturer role.
- Create lecturer accounts.
- Introduce a new academic entity that does not exist in the current schema.
- Bypass Row Level Security.
- Use a Supabase service-role key in client-side code.
- Hard-code student academic information that should come from Supabase.

Use the existing database schema exactly as documented in docs/DATABASE_SCHEMA.md.

## Phase Boundaries

Do NOT implement:

- GPA calculation
- CGPA calculation
- Transcript generation
- PDF export
- Administrator result entry
- Course management
- Lecturer functionality
- New database migrations

These belong to later phases or are outside the approved scope.

## Course Data

When realistic course information is required for testing or display, use the supplied Federal Polytechnic Offa Networking and Cloud Computing course allocation as the reference.

Do not invent unrelated course codes or titles.

The course allocation is reference data only and does not authorize database schema changes.

## Code Quality

Before completing the phase:

1. Inspect the existing project structure.
2. Inspect the current Phase 3A implementation.
3. Reuse existing patterns instead of duplicating functionality.
4. Keep TypeScript types accurate.
5. Keep Supabase queries scoped to the authenticated student.
6. Preserve existing RLS/security boundaries.
7. Run:

npm run lint

8. Run:

npm run build

Fix all errors before reporting completion.

## Final Report

When finished, provide:

1. Files created.
2. Files modified.
3. Features implemented.
4. Supabase queries used.
5. Security/access-control considerations.
6. UI states implemented.
7. Lint result.
8. Build result.
9. Confirmation that no database schema was modified.
10. Confirmation that Phase 3A remains functional.
11. Any issues or decisions that require review before Phase 3C.