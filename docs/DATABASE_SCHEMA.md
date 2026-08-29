# Database Schema Specification
## Student Result and Transcript Management Portal

**Status:** Implementation-ready draft  
**Database:** PostgreSQL via Supabase  
**Frontend:** React + TypeScript  
**Scope:** Administrator and Student users only

---

## 1. Purpose

This document defines the database structure for the Student Result and Transcript Management Portal.

The schema is intentionally limited to the core academic-record functions defined in the project scope. It does not introduce lecturer accounts, department-management modules, class-management modules, fees, attendance, library management, or other institutional-management features.

The database contains six core entities:

1. `users`
2. `students`
3. `academic_sessions`
4. `semesters`
5. `courses`
6. `results`

A transcript is treated as a **derived academic record** generated from a student's results across semesters and academic sessions. A separate `transcripts` table is therefore not required for the initial implementation.

---

## 2. User Model

The system has two categories of users:

- **Administrator:** manages student and academic records.
- **Student:** views their own profile, results, academic performance, and transcript information.

Supabase Authentication is responsible for authentication credentials. The application database stores the user's role and account status and links student accounts to their student profile.

### Important security decision

The application must **not store plaintext passwords or manually managed password hashes in the public application tables**. Password authentication is handled by Supabase Auth.

---

## 3. Entity Definitions

### 3.1 `users`

Stores application-level user information and role information.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `user_id` | UUID | PK, FK to `auth.users(id)` | Authenticated user identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User email |
| `role` | TEXT | NOT NULL | `admin` or `student` |
| `status` | TEXT | NOT NULL | `active` or `inactive` |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### 3.2 `students`

Stores the student's personal and academic profile information.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `student_id` | UUID | PK | Internal student record identifier |
| `user_id` | UUID | UNIQUE, FK | Linked application user |
| `matric_number` | TEXT | UNIQUE, NOT NULL | Student matriculation number |
| `full_name` | TEXT | NOT NULL | Student's full name |
| `date_of_birth` | DATE | Optional | Date of birth |
| `gender` | TEXT | Optional | Gender |
| `email` | TEXT | Optional | Student contact email |
| `phone` | TEXT | Optional | Student phone number |
| `department` | TEXT | Optional | Student's department as profile information |
| `level_of_enrollment` | TEXT | NOT NULL | Current academic level |
| `status` | TEXT | NOT NULL | `active` or `inactive` |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Scope note:** `department` is kept as a student attribute because it is useful profile information. There is no separate `departments` table because department management is outside the approved scope.

### 3.3 `academic_sessions`

Stores academic sessions.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `session_id` | UUID | PK | Academic session identifier |
| `session_name` | TEXT | UNIQUE, NOT NULL | Example: `2025/2026` |
| `start_date` | DATE | Optional | Session start date |
| `end_date` | DATE | Optional | Session end date |
| `status` | TEXT | NOT NULL | `active` or `inactive` |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### 3.4 `semesters`

Stores semesters belonging to an academic session.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `semester_id` | UUID | PK | Semester identifier |
| `session_id` | UUID | FK | Parent academic session |
| `semester_name` | TEXT | NOT NULL | Example: `First Semester` |
| `semester_order` | INTEGER | NOT NULL | Ordering value such as 1 or 2 |
| `start_date` | DATE | Optional | Semester start date |
| `end_date` | DATE | Optional | Semester end date |
| `status` | TEXT | NOT NULL | `active` or `inactive` |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### 3.5 `courses`

Stores courses that can appear in student academic records.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `course_id` | UUID | PK | Course identifier |
| `course_code` | TEXT | UNIQUE, NOT NULL | Example: `CSC401` |
| `course_title` | TEXT | NOT NULL | Course name |
| `credit_unit` | INTEGER | NOT NULL | Course credit unit |
| `course_type` | TEXT | NOT NULL | `Required` or `Elective` |
| `status` | TEXT | NOT NULL | `active` or `inactive` |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### 3.6 `results`

Stores the academic result of a student for a course in a particular semester.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `result_id` | UUID | PK | Result identifier |
| `student_id` | UUID | FK | Student receiving the result |
| `course_id` | UUID | FK | Course associated with the result |
| `semester_id` | UUID | FK | Semester in which the result was recorded |
| `score` | NUMERIC(5,2) | NOT NULL | Score from 0 to 100 |
| `grade` | TEXT | NOT NULL | Letter grade |
| `grade_point` | NUMERIC(3,2) | NOT NULL | Grade point |
| `remark` | TEXT | Optional | Academic remark |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

---

## 4. Relationships

### Users → Students
One application user can be associated with one student profile, while each student profile belongs to one student user account.

### Students → Results
One student can have many result records.

### Courses → Results
One course can appear in many result records.

### Academic Sessions → Semesters
One academic session contains many semesters.

### Semesters → Results
One semester can contain many student result records.

### Transcript
A student's transcript is generated from the student's result records, joined with course, semester, and academic-session information. It is not stored as a separate core entity.

---

## 5. Simplified Relationship Map

```text
USERS
  1
  │
  │
  1
STUDENTS
  │
  │ 1 : M
  ▼
RESULTS
  ▲       ▲
  │       │
M : 1   M : 1
  │       │
COURSES  SEMESTERS
            │
            │ M : 1
            ▼
     ACADEMIC_SESSIONS
```

---

## 6. Access and Security

Supabase Auth handles authentication.

Row Level Security (RLS) should enforce the following:

- Students can read only their own student profile.
- Students can read only their own result records.
- Students cannot insert, update, or delete official result records.
- Administrators can manage the academic records required by the application.
- Inactive accounts should not be permitted to access protected application functions.

The SQL initialization file enables RLS and provides the baseline policies needed for the portal.

---

## 7. Scope Control

The following are intentionally excluded from the database:

- Lecturer accounts
- Lecturer dashboards
- Department management
- Class management
- Course registration workflows
- Fees/payment management
- Attendance management
- Library management
- Hostel management
- Payroll/staff management
- Advanced institutional management modules

These exclusions prevent the implementation from expanding beyond the approved Student Result and Transcript Management Portal.

---

## 8. Synchronization Rule

The database must remain consistent with:

**Chapter 3 → ERD → DATABASE_SCHEMA.md → Supabase migration SQL → React/Supabase implementation → Chapter 4**

Any future database change must first be checked against the project scope and ERD.
