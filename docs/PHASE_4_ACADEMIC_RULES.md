# PHASE 4 — FINAL ACADEMIC RULES APPROVAL & SPECIFICATION LOCK

## ROLE
Act as the senior software architect and requirements analyst for the Student Results and Transcript Management Portal.

This document is the approved source of truth for the Phase 4 implementation. It supersedes any prior discovery notes or provisional proposals.

Do not implement Phase 4 from this document alone. This file defines the requirements only.

---

# 1. AUTHORITATIVE DECISIONS
The following decisions are now APPROVED for this project and must be treated as final.

## GPA
GPA is a semester-specific, credit-weighted academic performance calculation.

It must use:

- results.grade_point
- courses.credit_unit

The calculation considers the authenticated student's applicable result records for the selected semester.

Conceptually:

GPA = Total Quality Points ÷ Total Applicable Credit Units

where:

Quality Points = Grade Point × Credit Unit

Only valid records with usable grade-point and credit-unit values participate in the calculation.

---

## CGPA
CGPA is the student's cumulative credit-weighted academic performance across all available applicable completed results belonging to that authenticated student.

It must aggregate applicable results across academic sessions and semesters.

Conceptually:

CGPA = Total Quality Points Across Applicable Results ÷ Total Applicable Credit Units Across Applicable Results

Do not limit CGPA to the latest semester.
Do not calculate CGPA using hard-coded values.
Do not calculate CGPA from UI values.
It must be derived from authorized database records.

---

## GRADE POINT AUTHORITY
The existing:

results.grade_point

is the authoritative grade-point value for calculation.

Do NOT recalculate grade points from scores.
Do NOT create a new grade-to-point conversion table.
Do NOT invent a new grading scale.

The calculation layer consumes the stored grade-point value already associated with each result.

---

## CREDIT UNIT AUTHORITY
The existing:

courses.credit_unit

is the authoritative credit-unit value.

Quality points are derived from:

grade_point × credit_unit

Do not hard-code course credit units.

---

## FAILED RESULTS
Failed results remain part of the calculation according to their stored grade_point and credit_unit.

Do not create a separate failure-management system.
Do not introduce institutional policies for carryovers or probation.

If a failed result has a valid stored grade point and credit unit, it participates normally.

---

## REPEATED COURSES
The current database schema does not contain a dedicated attempt/repeat/replacement model.

Therefore:

Repeated-course replacement logic is NOT implemented.

Each valid stored result row is treated as an independent academic result record.

Do not attempt to infer that one result replaces another.
Do not create additional schema structures for repeated courses.
Do not modify the database schema.

---

## INVALID OR INCOMPLETE DATA
Invalid or incomplete records must be handled safely.

A result should not participate in the calculation if the required calculation values are unavailable or invalid.

At minimum:

- missing/invalid grade point → exclude
- missing/invalid credit unit → exclude
- zero credit unit → exclude from denominator

The calculation must never produce:

- NaN
- Infinity
- division-by-zero
- fabricated GPA/CGPA values

If no valid records remain after filtering, the calculation should return a safe empty/unavailable state rather than 0.00 unless the UI specification explicitly requires otherwise.

---

## ROUNDING AND DISPLAY
Use a consistent two-decimal display format for GPA and CGPA.

Internal calculations should retain sufficient precision and rounding should be applied consistently rather than prematurely rounding individual quality points.

The UI should display values such as:

3.75

rather than inconsistent floating-point representations.

---

## CGPA WITH ONLY ONE SEMESTER
The current demonstration student has results for:

2024/2025 — Second Semester

Only one semester currently exists for the demonstration student.

Therefore, it is expected that:

CGPA = GPA

for the current demonstration dataset.

Do NOT add artificial historical results merely to make CGPA different from GPA.

Future historical records, if legitimately added, should automatically participate according to the approved cumulative rule.

---

## ACADEMIC STANDING
Academic-standing classification is:

OUT OF SCOPE

Do not implement:

- Good Standing
- Probation
- Academic Warning
- Distinction classification
- Fail classification based on GPA
- Ranking
- Student comparison

unless a future approved requirement explicitly introduces such functionality.

---

## UI PLACEMENT
The approved Phase 4 presentation structure is:

### Student Results Page
Display the semester GPA within the appropriate academic session/semester grouping.

The GPA must correspond to the results displayed for that semester.

### Student Dashboard
Display the student's overall CGPA as an academic summary metric.

It may also display the latest semester GPA if useful and consistent with the existing dashboard design.

Do not introduce unrelated dashboard metrics.

### Student Profile
No GPA/CGPA calculation is required on the profile page.

### Student Transcript
Do NOT implement transcript generation, PDF export, or transcript calculation in this phase.

The existing transcript page remains outside the Phase 4 implementation scope unless a later approved phase explicitly activates it.

---

## AUTHENTICATION AND SECURITY
All GPA/CGPA calculations must preserve the security architecture already verified in Phase 3D.

The calculation flow must begin from the authenticated Supabase user.

Expected identity chain:

Supabase Auth user.id

→ public.students.user_id

→ authenticated student's student_id

→ authorized result records.

The calculation layer must NEVER:

- accept a student ID from the URL
- accept a student ID from a query string
- accept a student ID from arbitrary client input
- use a hard-coded student UUID
- use another student's ID
- use service-role credentials
- bypass RLS
- calculate institution-wide GPA/CGPA

The calculation must only operate on the authenticated student's authorized data.

---

## DATABASE DECISION
The existing schema is sufficient for the Phase 4 calculation layer.

The following existing relationships provide the required data:

students → results → courses

and:

results → semesters → academic_sessions

Therefore:

NO DATABASE SCHEMA CHANGE IS REQUIRED FOR PHASE 4.

Do not modify:

src/supabase/migration/001_initial_schema.sql

Do not create additional GPA/CGPA tables.
Do not add GPA/CGPA columns.
Do not add calculation triggers.
Do not modify RLS policies unless a separate security audit later proves a necessary change.

---

## CURRENT DEMONSTRATION DATA
The current demonstration student has:

Course | Credit Unit | Grade Point
NCC 421 | 3 | 4.00
NCC 422 | 4 | 4.00
NCC 423 | 2 | 3.50
NCC 424 | 3 | 4.00
EED 423 | 2 | 3.00

Total credit units: 14

The current demonstration data represents:

2024/2025 — Second Semester

This dataset is sufficient to demonstrate the semester GPA and the current cumulative CGPA behavior.

Do not modify the seed data during this specification-lock task.

---

## REQUIRED TEST CASES
The eventual implementation must be designed to support these tests:

### Test 1 — Normal semester
Multiple courses with different credit units and grade points.

### Test 2 — Single course
A semester containing one valid result.

### Test 3 — No results
The student has no applicable results.

The UI must show an appropriate unavailable/empty state.

### Test 4 — Different credit units
Verify that credit units correctly weight the grade points.

### Test 5 — Failed result
A valid failed result participates using its stored grade point and credit unit.

### Test 6 — Multiple semesters
CGPA aggregates applicable valid records across all available semesters.

### Test 7 — Invalid record
Invalid/missing grade point or credit unit does not corrupt the calculation.

### Test 8 — Zero-credit result
Zero-credit records do not contribute to the denominator.

### Test 9 — Cross-student isolation
One authenticated student must never receive another student's GPA or CGPA.

### Test 10 — Route manipulation
Changing URL parameters or query strings must not allow access to another student's academic calculations.

---

## IMPLEMENTATION STATUS
This document locks the approved rules for the next implementation phase.

The following are now fully finalized for implementation:

- GPA rules are finalized.
- CGPA rules are finalized.
- Failed-result handling is finalized.
- Repeated-course handling is finalized.
- Invalid-data handling is finalized.
- Rounding/display behavior is finalized.
- UI placement is finalized.
- Security requirements are finalized.
- No database schema change is required.
- Academic-standing classification remains out of scope.
- Transcript generation/export remains out of scope.

---

## PHASE 4 IMPLEMENTATION STATUS
READY FOR IMPLEMENTATION

This is a specification-lock task only.

The next stage may begin implementation only upon a separate, explicit Phase 4 implementation prompt.

---

## FILE SAFETY
During this task:

### MAY MODIFY
Only:

docs/PHASE_4_ACADEMIC_RULES.md

### MUST NOT MODIFY

- React components
- Supabase services
- TypeScript types
- Routes
- Authentication code
- RLS policies
- Migration files
- Seed files
- Docker files
- Nginx configuration
- package configuration
- Any other application source file

---

## VALIDATION
The requested validation commands are verification only and must be run without making unrelated code changes.

- npm run lint
- npm run build

If either command fails due to a pre-existing issue, report the exact failure rather than modifying unrelated code.

---

## STOP CONDITION
This is a specification lock task only.

After updating this document and running the required validation checks, stop.

Do not:

- create GPA utilities
- create CGPA utilities
- modify dashboard code
- modify results code
- modify services
- modify routes
- modify database schema
- modify seed data
- start Phase 4 implementation

