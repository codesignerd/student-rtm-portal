# Master Development Specification

## Student Result and Transcript Management Portal

**Academic Project Topic:** Deployment of a Web Application Using Docker
Containers\
**Application Case Study:** Student Result and Transcript Management
Portal

------------------------------------------------------------------------

## 1. Purpose

This document is the master development specification for the
application. It is the single source of truth for the implementation and
should be reviewed by GitHub Copilot, Antigravity, and other AI coding
agents before major changes are made.

The implementation must remain consistent with the approved project
scope and Chapters 1--3.

------------------------------------------------------------------------

## 2. Project Context

The academic project demonstrates the deployment of a web application
using Docker containers.

The selected case study is a Student Result and Transcript Management
Portal.

The portal is not intended to be a complete commercial school-management
platform. It should implement the core functionality required to
demonstrate a functional academic-record system and its containerized
deployment.

------------------------------------------------------------------------

## 3. Approved Technology Stack

-   **Frontend:** React + TypeScript + Vite
-   **Styling:** Tailwind CSS
-   **Backend/Application Services:** Supabase
-   **Database:** PostgreSQL through Supabase
-   **Containerization:** Docker
-   **Production web server:** Nginx
-   **Source control:** Git/GitHub
-   **Development:** VS Code, with GitHub Copilot and/or Antigravity
    where useful

Do not replace the approved stack with Next.js, Firebase, a custom
Express/NestJS backend, MongoDB, or another database without explicit
approval.

------------------------------------------------------------------------

## 4. System Architecture

### Application flow

**User → React + TypeScript → Supabase Services → PostgreSQL**

Supabase provides the authentication, database, and required
application/data services.

### Production deployment flow

**React source → Node build stage → Production build → Nginx stage →
Docker image → Docker container → Web application**

The React application communicates with Supabase over the network.
Supabase does not need to be placed inside the application's Docker
container.

The Docker container packages and serves the production frontend through
Nginx.

------------------------------------------------------------------------

## 5. User Roles

### 5.1 Student

Students should be able to:

-   Sign in securely.
-   Access their dashboard.
-   View their academic information.
-   View available results.
-   View academic performance information.
-   View transcript information.
-   Access their profile.
-   Use other student-facing functions explicitly approved during
    implementation.

Students must not access administrative result-entry or
student-management operations.

### 5.2 Administrator

Administrators should be able to:

-   Sign in securely.
-   Access the administrator dashboard.
-   Manage student records.
-   Manage required academic information.
-   Enter results.
-   Edit/update existing results.
-   View student records and results.
-   Generate or preview student transcripts.
-   Perform other explicitly approved administrative operations.

Administrative functions must be protected from ordinary student
accounts.

------------------------------------------------------------------------

## 6. Core Application Areas

### Authentication

-   Login.
-   Supabase authentication.
-   Session/authentication state handling.
-   Protected routes.
-   Role-based access control.
-   Logout.
-   Appropriate authentication error handling.

### Student Dashboard

Provide a concise academic overview, such as:

-   Student name and identification information.
-   Programme/department.
-   Academic session or level where applicable.
-   Recent or available results.
-   Relevant academic summary information.

Avoid turning the dashboard into an unnecessary analytics system.

### Student Results

Students should be able to:

-   View available results.
-   View courses and grades.
-   View relevant score/grade information.
-   View semester/session information.
-   View GPA/CGPA information where implemented.

### Student Transcript

The transcript area should:

-   Present the student's academic record.
-   Show relevant course and grade information.
-   Display academic summaries such as GPA/CGPA where applicable.
-   Provide a clean transcript preview.
-   Support a print-friendly or downloadable presentation where
    required.

### Student Profile

Display relevant information such as:

-   Name.
-   Student ID.
-   Department.
-   Programme.
-   Level/year of study.
-   Other necessary academic identity information.

Only appropriate fields should be editable by the student.

### Administrator Dashboard

Provide a concise overview of the system, such as:

-   Total student records.
-   Available academic records.
-   Result-management status/activity where useful.
-   Quick access to core administrative operations.

Avoid unnecessary analytics and decorative widgets.

### Student Management

Administrators should be able to:

-   View students.
-   Add students.
-   Edit student information.
-   View student details.
-   Search/filter students where useful.

### Result Management

Administrators should be able to:

-   Select a student.
-   Select the course/session/semester context.
-   Enter result information.
-   Validate information.
-   Save results.
-   Edit/update results.
-   View stored results.

### Transcript Management

Administrators should be able to:

-   Select a student.
-   Retrieve academic records.
-   Preview the transcript.
-   Verify displayed information.

Transcript data must come from stored academic records rather than
hard-coded mock content.

------------------------------------------------------------------------

## 7. Database Requirements

The database must use PostgreSQL through Supabase.

The conceptual model should support the actual portal functionality.
Core entities are expected to include appropriate representations of:

-   Users/authentication profiles.
-   Students.
-   Departments/programmes where required.
-   Courses.
-   Academic sessions/semesters.
-   Results.
-   Transcript-related academic records.

The exact tables, relationships, primary keys, foreign keys,
constraints, indexes, and Row Level Security policies will be finalized
during the database phase.

The implementation must remain consistent with the ERD in Chapter 3.

Do not create unnecessary tables merely to make the project appear more
complex.

------------------------------------------------------------------------

## 8. Supabase and Security

Supabase will provide the backend services required by the application.

Use it for:

-   Authentication.
-   PostgreSQL database access.
-   Required data/API services.
-   Row Level Security and access policies.

Requirements:

-   Students must only access permitted student information.
-   Administrators must have administrative access.
-   Protected routes must prevent unauthenticated access.
-   Database access must be protected with appropriate Row Level
    Security policies.
-   Sensitive credentials must not be hard-coded.
-   Environment variables must be used for configuration.
-   Never expose a Supabase service-role/privileged key in browser code.

------------------------------------------------------------------------

## 9. Frontend Architecture

Use a maintainable React + TypeScript structure.

Separate concerns such as:

-   Pages/routes.
-   Layouts.
-   Reusable UI components.
-   Authentication logic.
-   Supabase/database services.
-   Types/interfaces.
-   Utilities.
-   Application state where required.

Avoid excessive abstraction for a project of this scope.

------------------------------------------------------------------------

## 10. UI/UX Direction

The interface should be modern, minimal, professional, clean, and
appropriate for an educational institution.

### Visual direction

-   Clean and uncluttered.
-   Strong, consistent spacing.
-   Clear hierarchy.
-   Soft visual treatment.
-   Professional rather than flashy.

### Colour direction

Use a restrained palette based primarily on:

-   Ivory/off-white.
-   Charcoal/muted black.
-   Muted orange accent.

Orange may be used as an accent because it aligns with the school's
visual identity.

### Avoid

-   Heavy shadows.
-   Excessive gradients.
-   Excessive colours.
-   Unnecessary decoration.
-   Large visual effects.
-   Dense layouts.
-   Excessive border usage.

Where borders are necessary, use a very subtle light-gray treatment.

------------------------------------------------------------------------

## 11. Navigation

### Student navigation

Core areas:

-   Dashboard
-   Results
-   Transcript
-   Profile
-   Logout

### Administrator navigation

Core areas:

-   Dashboard
-   Students
-   Courses/academic setup where required
-   Results
-   Transcript management
-   Profile/settings where required
-   Logout

Menu labels may be refined during UI implementation without changing the
underlying scope.

------------------------------------------------------------------------

## 12. Docker Implementation

Docker is a central part of the academic project and must be implemented
as an actual deployment workflow.

### Required workflow

1.  Develop and test the React application normally.
2.  Create the production build.
3.  Create a multi-stage Dockerfile.
4.  Use a Node-based build stage to install dependencies and build the
    React application.
5.  Use an Nginx production stage.
6.  Copy the production build into the Nginx serving directory.
7.  Build the Docker image.
8.  Tag the image appropriately.
9.  Run the image as a Docker container.
10. Map the appropriate host/container port for local testing.
11. Verify that Nginx serves the application.
12. Verify that the containerized frontend can communicate with
    Supabase.
13. Push the image to a Docker registry such as Docker Hub where
    appropriate.
14. Pull and run the image on another machine to demonstrate
    portability.

### Docker goals

The implementation should demonstrate:

-   Application packaging.
-   Reproducible deployment.
-   Environment consistency.
-   Separation of build and production-serving stages.
-   Lightweight production serving through Nginx.
-   Portability of the resulting image.

### Dockerfile requirements

The Dockerfile should:

-   Use a multi-stage build.
-   Use a `.dockerignore`.
-   Avoid copying the host machine's `node_modules`.
-   Build the application inside the appropriate build stage.
-   Serve only the required production output in the Nginx stage.
-   Avoid unnecessary files in the final image.

------------------------------------------------------------------------

## 13. Development Workflow

### Phase 1 --- Planning

-   Review this specification.
-   Inspect the existing repository.
-   Inspect package configuration.
-   Confirm the current stack.
-   Create a plan before major changes.

### Phase 2 --- Database

-   Design the database schema.
-   Create SQL scripts.
-   Configure Supabase.
-   Configure Row Level Security.
-   Test database access.

### Phase 3 --- Application Foundation

-   Configure routing.
-   Create layouts.
-   Create reusable UI components.
-   Establish the visual design system.
-   Establish authentication structure.

### Phase 4 --- Authentication

-   Implement login.
-   Implement logout.
-   Implement session handling.
-   Implement protected routes.
-   Implement role-based access.

### Phase 5 --- Student Functionality

-   Dashboard.
-   Profile.
-   Results.
-   Transcript.

### Phase 6 --- Administrator Functionality

-   Dashboard.
-   Student management.
-   Result management.
-   Transcript management.

### Phase 7 --- Testing and Refinement

-   Functional testing.
-   Authentication/access testing.
-   Database testing.
-   Responsive testing.
-   Error-state testing.
-   UI consistency review.

### Phase 8 --- Docker Deployment

-   Create `.dockerignore`.
-   Create multi-stage Dockerfile.
-   Build the image.
-   Run the container.
-   Test Nginx serving.
-   Test Supabase communication.
-   Tag and optionally push the image.
-   Pull and run the image on another machine.

------------------------------------------------------------------------

## 14. AI Coding Agent Rules

GitHub Copilot, Antigravity, or another AI agent must follow these
rules.

### Before implementation

-   Inspect the repository first.
-   Read this specification.
-   Read relevant existing source files.
-   Do not assume files are empty or unnecessary.
-   Do not replace working configuration without justification.

### Planning

For significant tasks:

1.  Explain the intended approach.
2.  Identify files to be created or modified.
3.  Identify packages that may be required.
4.  Explain database or architectural changes.
5.  Request approval when the change is architectural or outside the
    defined scope.

### Implementation

-   Prefer simple, maintainable solutions.
-   Reuse existing components and utilities.
-   Avoid unnecessary dependencies.
-   Keep TypeScript types meaningful.
-   Avoid unnecessary duplication.
-   Do not introduce another backend framework.
-   Do not introduce another database.
-   Do not switch away from Supabase.
-   Do not switch away from React + TypeScript + Vite.
-   Do not switch away from Tailwind CSS.

### Scope control

Do not independently add:

-   Payment systems.
-   Messaging/chat.
-   Push-notification infrastructure.
-   Multi-school tenancy.
-   Complex staff hierarchies.
-   Complex analytics.
-   AI features.
-   Enterprise-scale audit infrastructure.
-   Other features outside the approved scope.

Any such feature requires explicit approval.

------------------------------------------------------------------------

## 15. Testing Expectations

Every major feature should be tested after implementation.

Testing should cover:

-   Successful flows.
-   Empty states.
-   Invalid input.
-   Authentication failures.
-   Unauthorized access.
-   Database errors.
-   Loading states.
-   Responsive layout.
-   Navigation.
-   Browser refresh on protected routes where relevant.

Before Docker implementation, the application must work correctly
outside the container.

After Docker implementation, the same application must be tested from
inside the container.

------------------------------------------------------------------------

## 16. Academic Consistency

The implementation must remain consistent with Chapters 1--3.

In particular:

-   Implemented features should correspond to the approved system scope.
-   Database implementation should correspond to the ERD.
-   User interactions should correspond to the use-case, activity, and
    sequence designs.
-   Technology architecture should correspond to the actual
    implementation.
-   Docker implementation must be demonstrable.

Chapter 4 must be written from the actual implementation and real
screenshots/evidence.

Do not fabricate implementation results, screenshots, performance
values, or deployment outcomes.

------------------------------------------------------------------------

## 17. Definition of Done

The implementation is ready for Chapter 4 documentation when:

-   [ ] Student authentication works.
-   [ ] Administrator authentication works.
-   [ ] Protected routes work.
-   [ ] Student dashboard works.
-   [ ] Student profile works.
-   [ ] Student results can be retrieved from Supabase.
-   [ ] Administrator can manage required student records.
-   [ ] Administrator can enter/update results.
-   [ ] Transcript data is generated from stored records.
-   [ ] Supabase Row Level Security is configured appropriately.
-   [ ] The application works locally.
-   [ ] A production build succeeds.
-   [ ] A multi-stage Docker image builds successfully.
-   [ ] Nginx serves the production React application inside the
    container.
-   [ ] The container can communicate with Supabase.
-   [ ] The container can be run on another machine.
-   [ ] Major application flows have been tested.
-   [ ] Screenshots have been captured for Chapter 4.
-   [ ] Docker build/run/deployment evidence has been captured for
    Chapter 4.

------------------------------------------------------------------------

## 18. Out of Scope for the Initial Academic Implementation

The following are not required unless explicitly approved:

-   Payment processing.
-   Online course registration.
-   Attendance management.
-   Library management.
-   Hostel management.
-   Messaging/chat.
-   Push notifications.
-   Complex reporting/analytics.
-   Multi-institution support.
-   Mobile application.
-   AI-powered features.
-   Advanced staff permission hierarchies.
-   Enterprise audit infrastructure.
-   Unnecessary third-party integrations.

The objective is a focused, functional portal that demonstrates the
required academic functionality and, most importantly, deployment of a
web application using Docker containers.

------------------------------------------------------------------------

## 19. Final Principle

**Build only what is required, make it functional, keep the architecture
understandable, and make the Docker deployment demonstrable.**

The application is the case study used to demonstrate:

> **Deployment of a Web Application Using Docker Containers**

The implementation should therefore give equal attention to:

1.  A functional Student Result and Transcript Management Portal.
2.  A clear and understandable Docker-based deployment workflow.
3.  The ability to explain every major implementation decision during
    project defense.
