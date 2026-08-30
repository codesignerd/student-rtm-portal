# Phase 4 Specification

## 1. Phase 4 Title

**Phase 4 — GPA / CGPA and Academic Calculations**

**Classification:** APPROVED / DOCUMENTED (current project context)  
**Note:** Older project documentation contains an earlier phase numbering sequence that conflicts with the completed implementation state. The current implemented progression indicates that the next logical phase is GPA / CGPA and academic calculations.

## 2. Purpose

**APPROVED / DOCUMENTED**

The project is a Student Results and Transcript Management Portal. The current project context explicitly identifies the next phase as academic calculations based on student results. This phase exists to calculate or present academic performance summaries derived from existing stored result data, rather than to redesign the platform or expand it into a broader school management system.

## 3. Current Project State

**APPROVED / DOCUMENTED**

The following phases are already complete and verified:

- Phase 3A — Student Results Retrieval
- Phase 3B — Student Academic Dashboard
- Phase 3C — Student Profile
- Phase 3D — Demonstration Seed Data, Authentication, Security and Integration Verification

The current system already includes:

- authenticated student login and role resolution from public.users
- protected student routes
- student dashboard shell and summary context
- results retrieval from the student-owned result set
- student profile retrieval
- demonstration seed data for a real student in academic session 2024/2025, second semester

## 4. Phase Numbering Clarification

**APPROVED / DOCUMENTED**

The older master specification includes a phase sequence that predates the completed implementation state. It lists Phase 4 as Authentication and Phase 5 as Student Functionality. However, the completed implementation and the current project context make the actual progression clear:

- Authentication is complete
- Student functionality is complete in scope for current student-facing phases
- The next logical phase is GPA / CGPA and academic calculations

**Therefore, for this project’s current state, Phase 4 is defined as GPA / CGPA and academic calculations.**

## 5. Approved / Existing Academic Data

**APPROVED / DOCUMENTED**

The locked schema already includes the data needed for this phase:

- public.students
- public.results
- public.courses
- public.semesters
- public.academic_sessions

The relevant fields already in the project schema are:

- public.results.grade_point
- public.results.score
- public.results.grade
- public.results.student_id
- public.results.semester_id
- public.results.course_id
- public.courses.credit_unit
- public.courses.course_code
- public.courses.course_title
- public.semesters.semester_name
- public.semesters.semester_order
- public.semesters.session_id
- public.academic_sessions.session_name

This means the calculation layer can be based entirely on existing records and relationships without a schema change.

## 6. GPA Requirements

**APPROVED / DOCUMENTED**

The project documentation does not currently define a final, institution-specific GPA formula. The database and seed data support academic calculation using existing result and course metadata, but the exact policy is not formally documented.

**Current findings:**

- GPA is logically based on student results.
- The data model supports semester-based GPA because results are tied to semesters.
- The data model supports weighted calculation because course credit units exist and grade_point exists.
- The schema allows GPA evaluation for a subset of results or for all available results depending on business rules.

**NOT SPECIFIED**

The project documentation does not currently define:

- whether GPA is semester-based only
- whether GPA is cumulative across all completed semesters
- whether failed courses are included in the GPA calculation
- whether repeated courses are counted once or multiple times
- whether incomplete results are excluded
- how a student with no results should be represented

**PROPOSED — REQUIRES APPROVAL**

A conventional weighted GPA formula is:

GPA = sum(grade_point × credit_unit) / sum(credit_unit)

This is a valid academic formula widely used, but it is a proposal only and requires project approval before implementation. It must not be treated as an approved requirement unless explicitly approved.

## 7. CGPA Requirements

**APPROVED / DOCUMENTED**

The project documentation references cumulative academic performance as a possible student-facing academic summary, but it does not define the exact official CGPA rule.

**EXISTING DATABASE BEHAVIOR**

The schema supports cumulative calculation across:

- many semesters
- many courses
- multiple academic sessions

The relationship chain is sufficient for a student's cumulative academic record.

**NOT SPECIFIED**

The project documentation does not currently define:

- whether CGPA is cumulative across all available academic sessions
- whether it is based on all completed courses or only current semester results
- whether failed courses remain included in the cumulative denominator
- whether repeated courses are counted differently
- how historical semesters are ordered and aggregated

**PROPOSED — REQUIRES APPROVAL**

A conventional cumulative policy is:

CGPA = total weighted grade points across all completed courses / total credit units across all completed courses

This is a reasonable academic formula but must be treated as a proposal requiring explicit project approval.

## 8. Grading Scale Findings

**EXISTING DATABASE BEHAVIOR**

The schema enforces the following result-grade constraints:

- grade must be one of: A, B, C, D, E, F
- grade_point must be between 0 and 5
- score must be between 0 and 100

The project data also shows the following grade-point mapping pattern in the demonstration data:

- A = 4.00
- B = 3.00 or 3.50 depending on data
- C / D / E / F are allowed by schema but not explicitly enumerated in the current seed data

**OBSERVED FROM SEED DATA**

The seed data demonstrates result rows with:

- score values from 69 to 82
- letter grades from A and B
- grade points such as 3.00, 3.50, 4.00

**NOT SPECIFIED**

The project documentation does not define the complete institutional grading policy or score-to-grade mapping beyond the database constraints.

**Therefore:**

- the database enforces data validity
- the seed data provides examples
- the academic calculation policy is still not formally defined by the project documentation

## 9. Academic Performance Summary Requirements

**NOT SPECIFIED**

The project documents do not currently define a required academic performance summary beyond the mention of GPA/CGPA and general academic summary information.

Examples that are possible but not clearly approved:

- total credit units completed
- courses completed count
- semester GPA
- cumulative GPA
- academic standing
- class of degree or honors
- performance remarks

These may be considered presentation aids, but they are not currently approved as mandatory requirements unless the project documents define them.

**Recommendation:** keep phase 4 limited to the smallest approved requirement: GPA / CGPA summary from existing results, without adding institutional classification features.

## 10. Calculation Rules

**APPROVED / DOCUMENTED**

The following are clearly supported by the current project data:

- each result belongs to a student
- each result is linked to a course
- each course has a credit unit
- each result has a grade_point
- results are linked to semesters and academic sessions

**NOT SPECIFIED**

The following rules are not yet defined by the project documentation:

- whether all courses, including failed courses, count in GPA
- whether repeated courses count separately or replace earlier values
- whether non-final or incomplete courses count
- whether GPA/CGPA is computed per semester or over all completed semesters
- which academic summary values are mandatory to display

**PROPOSED — REQUIRES APPROVAL**

A practical and widely accepted academic calculation rule is to compute weighted average using grade point × credit unit across all valid completed result rows. However, the project must explicitly approve that rule before implementation.

## 11. Rules That Are Not Yet Defined

**NOT SPECIFIED**

The following are still undefined and must be explicitly approved before implementation:

- exact GPA calculation formula
- exact CGPA calculation formula
- inclusion or exclusion of failed courses
- treatment of repeated courses
- treatment of incomplete records
- treatment of missing course metadata
- whether the dashboard shows semester-only or cumulative summary
- whether transcript or dashboard should display both GPA and CGPA
- whether summary performance labels are required

## 12. Proposed Rules Requiring Approval

**PROPOSED — REQUIRES APPROVAL**

The following should be treated as proposal-only until the project approves them:

1. GPA is calculated from all graded, completed courses in the current semester using grade_point × credit_unit / total credit units.
2. CGPA is calculated cumulatively across all completed semesters using the same weighted method.
3. Failed courses remain in the GPA/CGPA denominator unless a separate academic policy says otherwise.
4. Repeated courses are counted according to the official institutional repeat policy; the project does not currently define this.
5. The dashboard shows aggregate totals and academic summaries from the student-owned result set only.
6. Academic standing labels are optional and not required unless defined by the project.

## 13. Database Assessment

**APPROVED / DOCUMENTED**

The existing schema is sufficient for Phase 4. No schema change is required to calculate GPA/CGPA from the existing result data.

**Reason:**

- grade_point is stored in results
- credit_unit is stored in courses
- relationship between student results and course metadata already exists
- semester/session context already exists
- the result model supports student-specific aggregation

**NO DATABASE SCHEMA CHANGE REQUIRED**

This is the correct assessment unless a later approved requirement proves a distinct academic policy requires a separate data field.

## 14. Security Requirements

**APPROVED / DOCUMENTED**

Phase 4 must preserve the security model established in Phase 3D.

Required rules:

- begin with the authenticated Supabase user
- resolve the matching student profile from public.students by user_id
- use only that student’s results
- never accept a student identifier from arbitrary client input
- never accept a student ID from the URL as the authority
- never use a hard-coded student UUID
- never use a service-role key in frontend code
- never bypass RLS
- never expose another student’s GPA or CGPA
- never compute institution-wide analytics
- no lecturer role or new role should be introduced

**EXISTING DATABASE BEHAVIOR**

The RLS model already enforces student-owned result access and protects against cross-student retrieval.

## 15. UI / Route Recommendation

**APPROVED / DOCUMENTED**

The current student routes already exist:

- /student
- /student/dashboard
- /student/results
- /student/transcript
- /student/profile

**Recommended minimal UI placement:**

- keep academic calculation summary on the student dashboard as a concise summary card or metric block
- keep detailed result data on the results page
- keep transcript page as the likely place for cumulative academic summary presentation, if approved

**NOT SPECIFIED**

The project documentation does not specify a dedicated GPA/CGPA screen or a new route. Therefore, the smallest appropriate approach is to extend existing student pages rather than create a separate route.

## 16. Demonstration Data Assessment

**OBSERVED FROM SEED DATA**

The demonstration seed data contains five course records for the current student:

- NCC 421 — 3 CU
- NCC 422 — 4 CU
- NCC 423 — 2 CU
- NCC 424 — 3 CU
- EED 423 — 2 CU

Total credit units: 14

This dataset is sufficient to demonstrate a current semester GPA if the academic rule is approved.

**NOT SPECIFIED**

The current seed data does not provide enough historical multi-semester data to demonstrate a real CGPA unless additional historical data is created. That would require additional seed records and therefore would need project approval.

**Current assessment:**

- the current dataset supports a semester-level demonstration of weighted average calculation
- the current dataset does not demonstrate cumulative multi-semester CGPA unless additional approved historical records are added

## 17. Test Cases

**PROPOSED — REQUIRES APPROVAL**

The calculation layer should be validated with the following cases:

### Test Case 1 — Normal semester
Student has multiple courses with different credit units and grade points.

### Test Case 2 — One course
Student has exactly one result record.

### Test Case 3 — No results
Student has no academic results.

### Test Case 4 — Different credit loads
Courses have different credit units.

### Test Case 5 — Failed course
**REQUIRES POLICY DECISION**

The project does not define whether failed courses remain included in GPA/CGPA calculations.

### Test Case 6 — Multiple semesters
**REQUIRES POLICY DECISION**

The project does not define whether a cumulative CGPA is required or how historical semesters are aggregated.

### Test Case 7 — Missing metadata
A result references missing course or semester metadata.

### Test Case 8 — Cross-student isolation
Verify that only the authenticated student’s results are used in the calculation.

## 18. Out-of-Scope Features

**APPROVED / DOCUMENTED**

The following remain out of scope for Phase 4:

- Lecturer accounts
- Lecturer dashboard
- Lecturer result entry
- Administrator result entry
- Course registration
- Department management
- Fees/payment management
- Attendance management
- Hostel management
- Library management
- Payroll
- Student admission management
- Institution-wide analytics
- Ranking students against each other
- New user roles
- Transcript PDF generation
- Transcript export
- Unrelated school-management modules
- New database tables unless explicitly approved later

## 19. Implementation Dependencies

**APPROVED / DOCUMENTED**

Phase 4 depends on the following already-completed work:

- authentication
- student role resolution
- student route guard
- student result retrieval
- student dashboard shell
- student profile retrieval
- secure student-owned data access

**READY**

- student authentication and role check
- result retrieval foundation
- data relationship chain
- student portal navigation

**PARTIALLY READY**

- transcript presentation is only placeholder-level architecture, not a final academic summary implementation

**BLOCKED**

- final GPA/CGPA academic policy is not yet approved

## 20. Open Questions

**NOT SPECIFIED**

The following questions require project review before implementation:

1. Is GPA calculated only for the current semester or cumulatively?
2. Is CGPA cumulative across all semesters or only current session data?
3. Are failed courses included in the weighted calculation?
4. Are repeated courses counted once or each time they appear?
5. Is a transcript-style summary required, or only dashboard metrics?
6. Should academic standing labels be included?
7. Is the dashboard summary expected to display both GPA and CGPA or only one metric?
8. Are historical result rows required to demonstrate CGPA?

## 21. Final Recommendation

**REQUIRES APPROVAL**

The existing project data and schema are sufficient to support Phase 4, but the academic rule set is not yet formally approved. A GPA/CGPA implementation would require assumptions unless the project explicitly approves the calculation policy.

The current status is therefore:

### REQUIRES APPROVAL

This is the correct status because the academic calculation rules themselves are the missing prerequisite for implementation.
