import { supabase } from './client';
import type { StudentResultItem } from '../../types';

export type FetchTranscriptError =
  | 'UNAUTHENTICATED'
  | 'STUDENT_NOT_FOUND'
  | 'FETCH_ERROR';

export type StudentTranscriptProfile = {
  studentId: string;
  fullName: string;
  matricNumber: string;
  department: string | null;
  levelOfEnrollment: string;
  status: string;
  email: string | null;
  phone: string | null;
};

export type FetchTranscriptResponse = {
  data: StudentResultItem[] | null;
  student: StudentTranscriptProfile | null;
  error: FetchTranscriptError | null;
  errorMessage?: string;
};

type RawResultRow = {
  result_id: string;
  score: number;
  grade: string;
  grade_point: number;
  remark: string | null;
  courses: {
    course_code: string;
    course_title: string;
    credit_unit: number;
    course_type: string;
  } | {
    course_code: string;
    course_title: string;
    credit_unit: number;
    course_type: string;
  }[] | null;
  semesters: {
    semester_name: string;
    semester_order: number;
    academic_sessions: {
      session_name: string;
    } | {
      session_name: string;
    }[] | null;
  } | {
    semester_name: string;
    semester_order: number;
    academic_sessions: {
      session_name: string;
    } | {
      session_name: string;
    }[] | null;
  }[] | null;
};

export async function fetchStudentTranscriptData(): Promise<FetchTranscriptResponse> {
  try {
    // 1. Get authenticated Supabase user
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return {
        data: null,
        student: null,
        error: 'UNAUTHENTICATED',
        errorMessage: authError?.message || 'No active authenticated session found.',
      };
    }

    // 2. Resolve matching student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id, full_name, matric_number, department, level_of_enrollment, status, email, phone')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (studentError) {
      console.error('Failed to resolve student record for transcript:', studentError.message);
      return {
        data: null,
        student: null,
        error: 'FETCH_ERROR',
        errorMessage: studentError.message,
      };
    }

    if (!student) {
      return {
        data: null,
        student: null,
        error: 'STUDENT_NOT_FOUND',
        errorMessage: 'Your user account is not linked to an active student profile.',
      };
    }

    const studentProfile: StudentTranscriptProfile = {
      studentId: student.student_id,
      fullName: student.full_name,
      matricNumber: student.matric_number,
      department: student.department ?? null,
      levelOfEnrollment: student.level_of_enrollment,
      status: student.status,
      email: student.email ?? userData.user.email ?? null,
      phone: student.phone ?? null,
    };

    // 3. Query results for this student with course, semester, and academic session details
    const { data: rawResults, error: resultsError } = await supabase
      .from('results')
      .select(`
        result_id,
        score,
        grade,
        grade_point,
        remark,
        courses (
          course_code,
          course_title,
          credit_unit,
          course_type
        ),
        semesters (
          semester_name,
          semester_order,
          academic_sessions (
            session_name
          )
        )
      `)
      .eq('student_id', student.student_id);

    if (resultsError) {
      console.error('Failed to fetch transcript results from Supabase:', resultsError.message);
      return {
        data: null,
        student: studentProfile,
        error: 'FETCH_ERROR',
        errorMessage: resultsError.message,
      };
    }

    if (!rawResults || rawResults.length === 0) {
      return {
        data: [],
        student: studentProfile,
        error: null,
      };
    }

    // 4. Flatten and map the relational rows
    const items: StudentResultItem[] = (rawResults as unknown as RawResultRow[]).map((row) => {
      const courseObj = Array.isArray(row.courses) ? row.courses[0] : row.courses;
      const semesterObj = Array.isArray(row.semesters) ? row.semesters[0] : row.semesters;
      const sessionObj = semesterObj
        ? Array.isArray(semesterObj.academic_sessions)
          ? semesterObj.academic_sessions[0]
          : semesterObj.academic_sessions
        : null;

      return {
        result_id: row.result_id,
        score: Number(row.score),
        grade: row.grade,
        grade_point: Number(row.grade_point),
        remark: row.remark ?? null,
        course_code: courseObj?.course_code ?? 'N/A',
        course_title: courseObj?.course_title ?? 'Untitled Course',
        credit_unit: courseObj?.credit_unit ?? 0,
        course_type: courseObj?.course_type ?? 'Required',
        semester_name: semesterObj?.semester_name ?? 'Unknown Semester',
        semester_order: semesterObj?.semester_order ?? 1,
        session_name: sessionObj?.session_name ?? 'Unknown Session',
      };
    });

    return {
      data: items,
      student: studentProfile,
      error: null,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Unexpected error in fetchStudentTranscriptData:', errorMsg);
    return {
      data: null,
      student: null,
      error: 'FETCH_ERROR',
      errorMessage: errorMsg,
    };
  }
}

