-- ============================================================
-- Student Result and Transcript Management Portal
-- Phase 3D: Demonstration Student Seed Data Script
-- ============================================================
-- 
-- PREREQUISITE:
--   Create the demonstration student account in Supabase Auth FIRST:
--     Email: demo.student@fedpoffa.edu.ng
--     Password: DemoStudent2025! (or your chosen test password)
--
--   Then copy the newly created Auth UUID (from auth.users) and paste
--   it into the placeholder below (replacing '00000000-0000-0000-0000-000000000000').
--
-- TARGET ENVIRONMENT: Supabase SQL Editor / PostgreSQL
-- ============================================================

DO $$
DECLARE
    -- ========================================================
    -- 1. PASTE AUTH USER UUID HERE
    -- ========================================================
    v_auth_user_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;

    -- Variables to hold resolved IDs
    v_session_id uuid;
    v_semester_id uuid;
    v_student_id uuid;

    v_course_ncc421_id uuid;
    v_course_ncc422_id uuid;
    v_course_ncc423_id uuid;
    v_course_ncc424_id uuid;
    v_course_eed423_id uuid;
BEGIN
    -- Guard check: Ensure placeholder was replaced
    IF v_auth_user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        RAISE EXCEPTION 'Please replace the placeholder v_auth_user_id with the actual Auth UUID from Supabase Auth before running this script.';
    END IF;

    -- Verify that the auth user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_auth_user_id) THEN
        RAISE EXCEPTION 'Auth user with ID % does not exist in auth.users. Please create the user in Supabase Auth first.', v_auth_user_id;
    END IF;

    -- ========================================================
    -- 2. ACADEMIC SESSION (2024/2025)
    -- ========================================================
    INSERT INTO public.academic_sessions (session_name, start_date, end_date, status)
    VALUES ('2024/2025', '2024-11-01', '2025-08-31', 'active')
    ON CONFLICT (session_name) DO UPDATE 
        SET status = 'active', updated_at = now()
    RETURNING session_id INTO v_session_id;

    -- ========================================================
    -- 3. SEMESTER (Second Semester)
    -- ========================================================
    INSERT INTO public.semesters (session_id, semester_name, semester_order, start_date, end_date, status)
    VALUES (v_session_id, 'Second Semester', 2, '2025-04-01', '2025-08-31', 'active')
    ON CONFLICT (session_id, semester_name) DO UPDATE 
        SET status = 'active', updated_at = now()
    RETURNING semester_id INTO v_semester_id;

    -- ========================================================
    -- 4. COURSES (HND 2 NCC Second Semester)
    -- Verified from docs/New Second Sem 2024 2025 Course Allocation-1.docx
    -- ========================================================
    
    -- NCC 421: Cloud Computing II (3 Credit Units)
    INSERT INTO public.courses (course_code, course_title, credit_unit, course_type, status)
    VALUES ('NCC 421', 'Cloud Computing II', 3, 'Required', 'active')
    ON CONFLICT (course_code) DO UPDATE 
        SET course_title = EXCLUDED.course_title, credit_unit = EXCLUDED.credit_unit, updated_at = now()
    RETURNING course_id INTO v_course_ncc421_id;

    -- NCC 422: Enterprise Networking, Security and Automation (4 Credit Units)
    INSERT INTO public.courses (course_code, course_title, credit_unit, course_type, status)
    VALUES ('NCC 422', 'Enterprise Networking, Security and Automation', 4, 'Required', 'active')
    ON CONFLICT (course_code) DO UPDATE 
        SET course_title = EXCLUDED.course_title, credit_unit = EXCLUDED.credit_unit, updated_at = now()
    RETURNING course_id INTO v_course_ncc422_id;

    -- NCC 423: Ethical and Professional Practice in Networking and Cloud Computing (2 Credit Units)
    INSERT INTO public.courses (course_code, course_title, credit_unit, course_type, status)
    VALUES ('NCC 423', 'Ethical and Professional Practice in Networking and Cloud Computing', 2, 'Required', 'active')
    ON CONFLICT (course_code) DO UPDATE 
        SET course_title = EXCLUDED.course_title, credit_unit = EXCLUDED.credit_unit, updated_at = now()
    RETURNING course_id INTO v_course_ncc423_id;

    -- NCC 424: Internet of Things (3 Credit Units)
    INSERT INTO public.courses (course_code, course_title, credit_unit, course_type, status)
    VALUES ('NCC 424', 'Internet of Things', 3, 'Required', 'active')
    ON CONFLICT (course_code) DO UPDATE 
        SET course_title = EXCLUDED.course_title, credit_unit = EXCLUDED.credit_unit, updated_at = now()
    RETURNING course_id INTO v_course_ncc424_id;

    -- EED 423: Entrepreneurship Practical (2 Credit Units)
    INSERT INTO public.courses (course_code, course_title, credit_unit, course_type, status)
    VALUES ('EED 423', 'Entrepreneurship Practical', 2, 'Required', 'active')
    ON CONFLICT (course_code) DO UPDATE 
        SET course_title = EXCLUDED.course_title, credit_unit = EXCLUDED.credit_unit, updated_at = now()
    RETURNING course_id INTO v_course_eed423_id;

    -- ========================================================
    -- 5. APPLICATION USER (public.users)
    -- ========================================================
    INSERT INTO public.users (user_id, email, role, status)
    VALUES (v_auth_user_id, 'demo.student@fedpoffa.edu.ng', 'student', 'active')
    ON CONFLICT (user_id) DO UPDATE 
        SET role = 'student', status = 'active', updated_at = now();

    -- ========================================================
    -- 6. STUDENT PROFILE (public.students)
    -- ========================================================
    INSERT INTO public.students (
        user_id,
        matric_number,
        full_name,
        date_of_birth,
        gender,
        email,
        phone,
        department,
        level_of_enrollment,
        status
    )
    VALUES (
        v_auth_user_id,
        'FPO/HND/NCC/23/0042',
        'Adewale Emmanuel Johnson',
        '2001-05-14',
        'Male',
        'demo.student@fedpoffa.edu.ng',
        '08031234567',
        'Networking and Cloud Computing',
        'HND 2',
        'active'
    )
    ON CONFLICT (matric_number) DO UPDATE 
        SET user_id = EXCLUDED.user_id,
            full_name = EXCLUDED.full_name,
            department = EXCLUDED.department,
            level_of_enrollment = EXCLUDED.level_of_enrollment,
            status = 'active',
            updated_at = now()
    RETURNING student_id INTO v_student_id;

    -- ========================================================
    -- 7. RESULTS (public.results)
    -- 5 Course Results for HND 2 Second Semester
    -- ========================================================

    -- Result 1: NCC 421 (Score: 76.50, Grade: A, Grade Point: 4.00)
    INSERT INTO public.results (student_id, course_id, semester_id, score, grade, grade_point, remark)
    VALUES (v_student_id, v_course_ncc421_id, v_semester_id, 76.50, 'A', 4.00, 'Excellent')
    ON CONFLICT (student_id, course_id, semester_id) DO UPDATE 
        SET score = EXCLUDED.score, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point, remark = EXCLUDED.remark, updated_at = now();

    -- Result 2: NCC 422 (Score: 82.00, Grade: A, Grade Point: 4.00)
    INSERT INTO public.results (student_id, course_id, semester_id, score, grade, grade_point, remark)
    VALUES (v_student_id, v_course_ncc422_id, v_semester_id, 82.00, 'A', 4.00, 'Distinction')
    ON CONFLICT (student_id, course_id, semester_id) DO UPDATE 
        SET score = EXCLUDED.score, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point, remark = EXCLUDED.remark, updated_at = now();

    -- Result 3: NCC 423 (Score: 71.00, Grade: B, Grade Point: 3.50)
    INSERT INTO public.results (student_id, course_id, semester_id, score, grade, grade_point, remark)
    VALUES (v_student_id, v_course_ncc423_id, v_semester_id, 71.00, 'B', 3.50, 'Very Good')
    ON CONFLICT (student_id, course_id, semester_id) DO UPDATE 
        SET score = EXCLUDED.score, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point, remark = EXCLUDED.remark, updated_at = now();

    -- Result 4: NCC 424 (Score: 78.50, Grade: A, Grade Point: 4.00)
    INSERT INTO public.results (student_id, course_id, semester_id, score, grade, grade_point, remark)
    VALUES (v_student_id, v_course_ncc424_id, v_semester_id, 78.50, 'A', 4.00, 'Excellent')
    ON CONFLICT (student_id, course_id, semester_id) DO UPDATE 
        SET score = EXCLUDED.score, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point, remark = EXCLUDED.remark, updated_at = now();

    -- Result 5: EED 423 (Score: 69.00, Grade: B, Grade Point: 3.00)
    INSERT INTO public.results (student_id, course_id, semester_id, score, grade, grade_point, remark)
    VALUES (v_student_id, v_course_eed423_id, v_semester_id, 69.00, 'B', 3.00, 'Good')
    ON CONFLICT (student_id, course_id, semester_id) DO UPDATE 
        SET score = EXCLUDED.score, grade = EXCLUDED.grade, grade_point = EXCLUDED.grade_point, remark = EXCLUDED.remark, updated_at = now();

    RAISE NOTICE 'Demo student seed data created successfully for student: % (%)', 'Adewale Emmanuel Johnson', 'FPO/HND/NCC/23/0042';
END $$;

