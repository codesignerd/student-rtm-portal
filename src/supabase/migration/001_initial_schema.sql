-- ============================================================
-- Student Result and Transcript Management Portal
-- Supabase / PostgreSQL Database Initialization
-- ============================================================
--
-- SCOPE:
--   Administrator + Student
--
-- CORE ENTITIES:
--   users
--   students
--   academic_sessions
--   semesters
--   courses
--   results
--
-- IMPORTANT:
--   Supabase Auth manages passwords. Do NOT store passwords or
--   password hashes in public.users.
--
--   Transcript information is generated from result records;
--   there is no separate transcripts table in this initial scope.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. USERS
-- ============================================================

create table if not exists public.users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    role text not null default 'student'
        check (role in ('admin', 'student')),
    status text not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. STUDENTS
-- ============================================================

create table if not exists public.students (
    student_id uuid primary key default gen_random_uuid(),
    user_id uuid unique references public.users(user_id) on delete set null,
    matric_number text not null unique,
    full_name text not null,
    date_of_birth date,
    gender text,
    email text,
    phone text,
    department text,
    level_of_enrollment text not null,
    status text not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. ACADEMIC SESSIONS
-- ============================================================

create table if not exists public.academic_sessions (
    session_id uuid primary key default gen_random_uuid(),
    session_name text not null unique,
    start_date date,
    end_date date,
    status text not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (
        end_date is null
        or start_date is null
        or end_date >= start_date
    )
);

-- ============================================================
-- 4. SEMESTERS
-- ============================================================

create table if not exists public.semesters (
    semester_id uuid primary key default gen_random_uuid(),
    session_id uuid not null
        references public.academic_sessions(session_id)
        on delete restrict,
    semester_name text not null,
    semester_order integer not null
        check (semester_order in (1, 2)),
    start_date date,
    end_date date,
    status text not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (session_id, semester_name),
    unique (session_id, semester_order),

    check (
        end_date is null
        or start_date is null
        or end_date >= start_date
    )
);

-- ============================================================
-- 5. COURSES
-- ============================================================

create table if not exists public.courses (
    course_id uuid primary key default gen_random_uuid(),
    course_code text not null unique,
    course_title text not null,
    credit_unit integer not null
        check (credit_unit > 0 and credit_unit <= 30),
    course_type text not null default 'Required'
        check (course_type in ('Required', 'Elective')),
    status text not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. RESULTS
-- ============================================================

create table if not exists public.results (
    result_id uuid primary key default gen_random_uuid(),
    student_id uuid not null
        references public.students(student_id)
        on delete cascade,
    course_id uuid not null
        references public.courses(course_id)
        on delete restrict,
    semester_id uuid not null
        references public.semesters(semester_id)
        on delete restrict,
    score numeric(5,2) not null
        check (score >= 0 and score <= 100),
    grade text not null
        check (grade in ('A', 'B', 'C', 'D', 'E', 'F')),
    grade_point numeric(3,2) not null
        check (grade_point >= 0 and grade_point <= 5),
    remark text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Prevent duplicate result entries for the same
    -- student, course, and semester.
    unique (student_id, course_id, semester_id)
);

-- ============================================================
-- 7. INDEXES
-- ============================================================

create index if not exists idx_students_user_id
    on public.students(user_id);

create index if not exists idx_students_matric_number
    on public.students(matric_number);

create index if not exists idx_semesters_session_id
    on public.semesters(session_id);

create index if not exists idx_results_student_id
    on public.results(student_id);

create index if not exists idx_results_course_id
    on public.results(course_id);

create index if not exists idx_results_semester_id
    on public.results(semester_id);

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.academic_sessions enable row level security;
alter table public.semesters enable row level security;
alter table public.courses enable row level security;
alter table public.results enable row level security;

-- ============================================================
-- 9. HELPER FUNCTION
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.users
        where user_id = auth.uid()
          and role = 'admin'
          and status = 'active'
    );
$$;

-- ============================================================
-- 10. USERS POLICIES
-- ============================================================

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "users_admin_manage" on public.users;
create policy "users_admin_manage"
on public.users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- 11. STUDENTS POLICIES
-- ============================================================

drop policy if exists "students_select_own_or_admin" on public.students;
create policy "students_select_own_or_admin"
on public.students
for select
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin()
);

drop policy if exists "students_admin_insert" on public.students;
create policy "students_admin_insert"
on public.students
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "students_admin_update" on public.students;
create policy "students_admin_update"
on public.students
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "students_admin_delete" on public.students;
create policy "students_admin_delete"
on public.students
for delete
to authenticated
using (public.is_admin());

-- ============================================================
-- 12. ACADEMIC SESSIONS POLICIES
-- ============================================================

drop policy if exists "sessions_authenticated_read" on public.academic_sessions;
create policy "sessions_authenticated_read"
on public.academic_sessions
for select
to authenticated
using (true);

drop policy if exists "sessions_admin_manage" on public.academic_sessions;
create policy "sessions_admin_manage"
on public.academic_sessions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- 13. SEMESTERS POLICIES
-- ============================================================

drop policy if exists "semesters_authenticated_read" on public.semesters;
create policy "semesters_authenticated_read"
on public.semesters
for select
to authenticated
using (true);

drop policy if exists "semesters_admin_manage" on public.semesters;
create policy "semesters_admin_manage"
on public.semesters
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- 14. COURSES POLICIES
-- ============================================================

drop policy if exists "courses_authenticated_read" on public.courses;
create policy "courses_authenticated_read"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "courses_admin_manage" on public.courses;
create policy "courses_admin_manage"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- 15. RESULTS POLICIES
-- ============================================================

drop policy if exists "results_select_own_or_admin" on public.results;
create policy "results_select_own_or_admin"
on public.results
for select
to authenticated
using (
    exists (
        select 1
        from public.students s
        where s.student_id = results.student_id
          and s.user_id = auth.uid()
    )
    or public.is_admin()
);

drop policy if exists "results_admin_insert" on public.results;
create policy "results_admin_insert"
on public.results
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "results_admin_update" on public.results;
create policy "results_admin_update"
on public.results
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "results_admin_delete" on public.results;
create policy "results_admin_delete"
on public.results
for delete
to authenticated
using (public.is_admin());

-- ============================================================
-- END OF INITIAL DATABASE SCHEMA
-- ============================================================
