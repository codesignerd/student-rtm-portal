import { supabase } from './client';
import type { StudentResultItem } from '../../types';

export type FetchStudentResultsError =
  | 'UNAUTHENTICATED'
  | 'STUDENT_NOT_FOUND'
  | 'FETCH_ERROR';

export type StudentProfileSummary = {
  studentId: string;
  fullName: string;
  matricNumber: string;
  department: string | null;
  levelOfEnrollment: string;
};

export type FetchStudentResultsResponse = {
  data: StudentResultItem[] | null;
  student: StudentProfileSummary | null;
  error: FetchStudentResultsError | null;
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

export async function fetchStudentResults(): Promise<FetchStudentResultsResponse> {
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
      .select('student_id, full_name, matric_number, department, level_of_enrollment')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (studentError) {
      console.error('Failed to resolve student record:', studentError.message);
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

    const studentProfile: StudentProfileSummary = {
      studentId: student.student_id,
      fullName: student.full_name,
      matricNumber: student.matric_number,
      department: student.department ?? null,
      levelOfEnrollment: student.level_of_enrollment,
    };

    // 3. Query results for this student with joined course, semester, and academic session data
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
      console.error('Failed to fetch student results from Supabase:', resultsError.message);
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
    console.error('Unexpected error in fetchStudentResults:', errorMsg);
    return {
      data: null,
      student: null,
      error: 'FETCH_ERROR',
      errorMessage: errorMsg,
    };
  }
}

