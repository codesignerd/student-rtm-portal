# Database Setup

This directory contains the database specification and Supabase initialization migration for the Student Result and Transcript Management Portal.

## Files

- `DATABASE_SCHEMA.md` — human-readable database specification.
- `001_initial_schema.sql` — PostgreSQL/Supabase initialization migration.
- `ERD Diagram.png` - Entity Relationship Diagram Image

## Source of Truth

The database structure must remain consistent with:

1. Approved project scope
2. Chapter 3 system design
3. ERD `ERD Diagram.png`
4. `DATABASE_SCHEMA.md`
5. `001_initial_schema.sql`
6. React + TypeScript application code

## Core Tables

- `users`
- `students`
- `academic_sessions`
- `semesters`
- `courses`
- `results`

## Authentication

Supabase Auth owns authentication credentials. The public `users` table stores application-level role and status information and references `auth.users(id)`.

## Transcript Handling

The initial implementation does not store a separate transcript record. Transcript information is generated from the student's results, courses, semesters, and academic sessions.

## Scope Protection

Do not add lecturers, departments as a management module, classes, fees, attendance, library, hostel, payroll, or other institutional modules unless the approved project scope is formally changed.

## Before Running the Migration

1. Create/configure the Supabase project.
2. Confirm the database schema against the approved ERD.
3. Run `001_initial_schema.sql` in the Supabase SQL Editor.
4. Create test accounts through Supabase Auth.
5. Create corresponding records in `public.users`.
6. Create student profiles linked to student user accounts.
7. Test Row Level Security with both student and administrator accounts.

## Important

The migration is designed for the current project scope. Any future change to the ERD should be reflected in both the Markdown specification and SQL migration before implementation continues.
