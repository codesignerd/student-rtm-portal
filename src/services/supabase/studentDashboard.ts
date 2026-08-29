import { supabase } from './client';
import type { StudentResultItem, StudentRecord } from '../../types';

export type FetchDashboardError =
  | 'UNAUTHENTICATED'
  | 'STUDENT_NOT_FOUND'
  | 'FETCH_ERROR';

export type DashboardStudentProfile = Pick<
  StudentRecord,
  | 'student_id'
  | 'full_name'
  | 'matric_number'
  | 'department'
  | 'level_of_enrollment'
  | 'status'
  | 'email'
  | 'phone'
>;

export type StudentDashboardStats = {
  totalCourses: number;
  totalCreditUnits: number;
  latestSession: string | null;
  latestSemester: string | null;
};

export type StudentDashboardData = {
  student: DashboardStudentProfile;
  stats: StudentDashboardStats;
  recentResults: StudentResultItem[];
};

export type FetchDashboardResponse = {
  data: StudentDashboardData | null;
  error: FetchDashboardError | null;
  errorMessage?: string;
};

type RawResultRow = {
  result_id: string;
  score: number;
  grade: string;
  grade_point: number;
  remark: string | null;
  created_at: string;
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

export async function fetchStudentDashboardData(): Promise<FetchDashboardResponse> {
  try {
    // 1. Get authenticated Supabase user
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      return {
        data: null,
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
      console.error('Failed to resolve student record for dashboard:', studentError.message);
      return {
        data: null,
        error: 'FETCH_ERROR',
        errorMessage: studentError.message,
      };
    }

    if (!student) {
      return {
        data: null,
        error: 'STUDENT_NOT_FOUND',
        errorMessage: 'Your user account is not linked to an active student profile.',
      };
    }

    // 3. Query results for statistics and recent results preview
    const { data: rawResults, error: resultsError } = await supabase
      .from('results')
      .select(`
        result_id,
        score,
        grade,
        grade_point,
        remark,
        created_at,
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
      .eq('student_id', student.student_id)
      .order('created_at', { ascending: false });

    if (resultsError) {
      console.error('Failed to fetch dashboard results from Supabase:', resultsError.message);
      return {
        data: null,
        error: 'FETCH_ERROR',
        errorMessage: resultsError.message,
      };
    }

    const rows = (rawResults as unknown as RawResultRow[]) || [];

    const mappedResults: StudentResultItem[] = rows.map((row) => {
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

    const totalCourses = mappedResults.length;
    const totalCreditUnits = mappedResults.reduce((sum, item) => sum + item.credit_unit, 0);
    const latestSession = mappedResults.length > 0 ? mappedResults[0].session_name : null;
    const latestSemester = mappedResults.length > 0 ? mappedResults[0].semester_name : null;
    const recentResults = mappedResults.slice(0, 5);

    return {
      data: {
        student: {
          student_id: student.student_id,
          full_name: student.full_name,
          matric_number: student.matric_number,
          department: student.department ?? null,
          level_of_enrollment: student.level_of_enrollment,
          status: student.status,
          email: student.email ?? null,
          phone: student.phone ?? null,
        },
        stats: {
          totalCourses,
          totalCreditUnits,
          latestSession,
          latestSemester,
        },
        recentResults,
      },
      error: null,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Unexpected error in fetchStudentDashboardData:', errorMsg);
    return {
      data: null,
      error: 'FETCH_ERROR',
      errorMessage: errorMsg,
    };
  }
}

