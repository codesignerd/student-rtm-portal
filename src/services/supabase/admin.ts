import { supabase } from './client';
import type { StudentResultItem, StudentRecord } from '../../types';

export type AdminDashboardStats = {
  totalStudents: number;
  totalResults: number;
  totalActiveCourses: number;
  activeSessionName: string | null;
  activeSemesterName: string | null;
};

export type AdminStudentItem = StudentRecord & {
  user_email?: string | null;
};

export type GradeScaleMatch = {
  grade: string;
  grade_point: number;
  remark: string;
};

export function deriveGradeFromScore(score: number): GradeScaleMatch {
  const numScore = Number(score);
  if (isNaN(numScore) || numScore < 0) {
    return { grade: 'F', grade_point: 0.0, remark: 'Fail' };
  }
  if (numScore >= 75) return { grade: 'A', grade_point: 4.0, remark: 'Excellent' };
  if (numScore >= 70) return { grade: 'AB', grade_point: 3.5, remark: 'Very Good' };
  if (numScore >= 65) return { grade: 'B', grade_point: 3.25, remark: 'Good' };
  if (numScore >= 60) return { grade: 'BC', grade_point: 3.0, remark: 'Credit' };
  if (numScore >= 55) return { grade: 'C', grade_point: 2.75, remark: 'Lower Credit' };
  if (numScore >= 50) return { grade: 'CD', grade_point: 2.5, remark: 'Pass' };
  if (numScore >= 45) return { grade: 'D', grade_point: 2.25, remark: 'Pass' };
  if (numScore >= 40) return { grade: 'E', grade_point: 2.0, remark: 'Barely Pass' };
  return { grade: 'F', grade_point: 0.0, remark: 'Fail' };
}

// -------------------------------------------------------------
// 1. Dashboard Metrics
// -------------------------------------------------------------
export async function fetchAdminDashboardStats(): Promise<{
  data: AdminDashboardStats | null;
  error: string | null;
}> {
  try {
    const [studentsCount, resultsCount, coursesCount, activeSessionRes, activeSemesterRes] =
      await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }),
        supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('academic_sessions')
          .select('session_name')
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('semesters')
          .select('semester_name')
          .eq('status', 'active')
          .maybeSingle(),
      ]);

    if (studentsCount.error) throw new Error(studentsCount.error.message);
    if (resultsCount.error) throw new Error(resultsCount.error.message);
    if (coursesCount.error) throw new Error(coursesCount.error.message);

    return {
      data: {
        totalStudents: studentsCount.count ?? 0,
        totalResults: resultsCount.count ?? 0,
        totalActiveCourses: coursesCount.count ?? 0,
        activeSessionName: activeSessionRes.data?.session_name ?? null,
        activeSemesterName: activeSemesterRes.data?.semester_name ?? null,
      },
      error: null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
    return { data: null, error: msg };
  }
}

// -------------------------------------------------------------
// 2. Student Management
// -------------------------------------------------------------
export async function fetchAdminStudents(): Promise<{
  data: AdminStudentItem[] | null;
  error: string | null;
}> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) throw new Error(error.message);

    return { data: (students as AdminStudentItem[]) || [], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch students';
    return { data: null, error: msg };
  }
}

export type CreateStudentPayload = {
  matric_number: string;
  full_name: string;
  department?: string | null;
  level_of_enrollment: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
};

export async function createAdminStudent(payload: CreateStudentPayload): Promise<{
  data: StudentRecord | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        matric_number: payload.matric_number.trim(),
        full_name: payload.full_name.trim(),
        department: payload.department ? payload.department.trim() : null,
        level_of_enrollment: payload.level_of_enrollment.trim(),
        email: payload.email ? payload.email.trim() : null,
        phone: payload.phone ? payload.phone.trim() : null,
        gender: payload.gender ? payload.gender.trim() : null,
        date_of_birth: payload.date_of_birth || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { data: data as StudentRecord, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create student';
    return { data: null, error: msg };
  }
}

export async function updateAdminStudent(
  studentId: string,
  payload: Partial<CreateStudentPayload> & { status?: string },
): Promise<{ data: StudentRecord | null; error: string | null }> {
  try {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.matric_number !== undefined) updates.matric_number = payload.matric_number.trim();
    if (payload.full_name !== undefined) updates.full_name = payload.full_name.trim();
    if (payload.department !== undefined) updates.department = payload.department ? payload.department.trim() : null;
    if (payload.level_of_enrollment !== undefined) updates.level_of_enrollment = payload.level_of_enrollment.trim();
    if (payload.email !== undefined) updates.email = payload.email ? payload.email.trim() : null;
    if (payload.phone !== undefined) updates.phone = payload.phone ? payload.phone.trim() : null;
    if (payload.gender !== undefined) updates.gender = payload.gender ? payload.gender.trim() : null;
    if (payload.date_of_birth !== undefined) updates.date_of_birth = payload.date_of_birth || null;
    if (payload.status !== undefined) updates.status = payload.status;

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { data: data as StudentRecord, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update student';
    return { data: null, error: msg };
  }
}

// -------------------------------------------------------------
// 3. Academic Sessions Management
// -------------------------------------------------------------
export type AcademicSessionRow = {
  session_id: string;
  session_name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
};

export async function fetchAdminSessions(): Promise<{
  data: AcademicSessionRow[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('academic_sessions')
      .select('*')
      .order('session_name', { ascending: false });

    if (error) throw new Error(error.message);

    return { data: (data as AcademicSessionRow[]) || [], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch sessions';
    return { data: null, error: msg };
  }
}

export async function saveAdminSession(payload: {
  session_id?: string;
  session_name: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
}): Promise<{ data: AcademicSessionRow | null; error: string | null }> {
  try {
    const record = {
      session_name: payload.session_name.trim(),
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      status: payload.status || 'active',
      updated_at: new Date().toISOString(),
    };

    if (payload.session_id) {
      const { data, error } = await supabase
        .from('academic_sessions')
        .update(record)
        .eq('session_id', payload.session_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { data: data as AcademicSessionRow, error: null };
    }

    const { data, error } = await supabase
      .from('academic_sessions')
      .insert(record)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data: data as AcademicSessionRow, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save session';
    return { data: null, error: msg };
  }
}

// -------------------------------------------------------------
// 4. Semester Management
// -------------------------------------------------------------
export type SemesterRow = {
  semester_id: string;
  session_id: string;
  semester_name: string;
  semester_order: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  academic_sessions?: {
    session_name: string;
  } | null;
};

export async function fetchAdminSemesters(): Promise<{
  data: SemesterRow[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('semesters')
      .select(`
        semester_id,
        session_id,
        semester_name,
        semester_order,
        start_date,
        end_date,
        status,
        academic_sessions (
          session_name
        )
      `)
      .order('semester_order', { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data as unknown as SemesterRow[]) || [];
    return { data: rows, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch semesters';
    return { data: null, error: msg };
  }
}

export async function saveAdminSemester(payload: {
  semester_id?: string;
  session_id: string;
  semester_name: string;
  semester_order: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
}): Promise<{ data: SemesterRow | null; error: string | null }> {
  try {
    const record = {
      session_id: payload.session_id,
      semester_name: payload.semester_name.trim(),
      semester_order: Number(payload.semester_order),
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      status: payload.status || 'active',
      updated_at: new Date().toISOString(),
    };

    if (payload.semester_id) {
      const { data, error } = await supabase
        .from('semesters')
        .update(record)
        .eq('semester_id', payload.semester_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { data: data as unknown as SemesterRow, error: null };
    }

    const { data, error } = await supabase
      .from('semesters')
      .insert(record)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data: data as unknown as SemesterRow, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save semester';
    return { data: null, error: msg };
  }
}

// -------------------------------------------------------------
// 5. Course Management
// -------------------------------------------------------------
export type CourseRow = {
  course_id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  course_type: string;
  status: string;
};

export async function fetchAdminCourses(): Promise<{
  data: CourseRow[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('course_code', { ascending: true });

    if (error) throw new Error(error.message);

    return { data: (data as CourseRow[]) || [], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch courses';
    return { data: null, error: msg };
  }
}

export async function saveAdminCourse(payload: {
  course_id?: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  course_type: string;
  status?: string;
}): Promise<{ data: CourseRow | null; error: string | null }> {
  try {
    const record = {
      course_code: payload.course_code.trim().toUpperCase(),
      course_title: payload.course_title.trim(),
      credit_unit: Number(payload.credit_unit),
      course_type: payload.course_type,
      status: payload.status || 'active',
      updated_at: new Date().toISOString(),
    };

    if (payload.course_id) {
      const { data, error } = await supabase
        .from('courses')
        .update(record)
        .eq('course_id', payload.course_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { data: data as CourseRow, error: null };
    }

    const { data, error } = await supabase
      .from('courses')
      .insert(record)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data: data as CourseRow, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save course';
    return { data: null, error: msg };
  }
}

// -------------------------------------------------------------
// 6. Result Management
// -------------------------------------------------------------
export type AdminResultViewRow = {
  result_id: string;
  student_id: string;
  course_id: string;
  semester_id: string;
  score: number;
  grade: string;
  grade_point: number;
  remark: string | null;
  created_at: string;
  students?: {
    full_name: string;
    matric_number: string;
  } | null;
  courses?: {
    course_code: string;
    course_title: string;
    credit_unit: number;
  } | null;
  semesters?: {
    semester_name: string;
    academic_sessions?: {
      session_name: string;
    } | null;
  } | null;
};

export async function fetchAdminResults(): Promise<{
  data: AdminResultViewRow[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('results')
      .select(`
        result_id,
        student_id,
        course_id,
        semester_id,
        score,
        grade,
        grade_point,
        remark,
        created_at,
        students (
          full_name,
          matric_number
        ),
        courses (
          course_code,
          course_title,
          credit_unit
        ),
        semesters (
          semester_name,
          academic_sessions (
            session_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data as unknown as AdminResultViewRow[]) || [];
    return { data: rows, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch admin results';
    return { data: null, error: msg };
  }
}

export type SaveResultPayload = {
  result_id?: string;
  student_id: string;
  course_id: string;
  semester_id: string;
  score: number;
  grade: string;
  grade_point: number;
  remark?: string | null;
};

export async function saveAdminResult(payload: SaveResultPayload): Promise<{
  data: AdminResultViewRow | null;
  error: string | null;
}> {
  try {
    const record = {
      student_id: payload.student_id,
      course_id: payload.course_id,
      semester_id: payload.semester_id,
      score: Number(payload.score),
      grade: payload.grade.trim().toUpperCase(),
      grade_point: Number(payload.grade_point),
      remark: payload.remark ? payload.remark.trim() : null,
      updated_at: new Date().toISOString(),
    };

    // Check if result already exists for student + course + semester
    if (!payload.result_id) {
      const { data: existing } = await supabase
        .from('results')
        .select('result_id')
        .eq('student_id', payload.student_id)
        .eq('course_id', payload.course_id)
        .eq('semester_id', payload.semester_id)
        .maybeSingle();

      if (existing) {
        // Update existing record rather than inserting duplicate
        const { data: updated, error: updateErr } = await supabase
          .from('results')
          .update(record)
          .eq('result_id', existing.result_id)
          .select()
          .single();

        if (updateErr) throw new Error(updateErr.message);
        return { data: updated as unknown as AdminResultViewRow, error: null };
      }
    }

    if (payload.result_id) {
      const { data, error } = await supabase
        .from('results')
        .update(record)
        .eq('result_id', payload.result_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { data: data as unknown as AdminResultViewRow, error: null };
    }

    const { data, error } = await supabase
      .from('results')
      .insert(record)
      .select()
      .single();
    if (error) throw new Error(error.message);

    return { data: data as unknown as AdminResultViewRow, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save result record';
    return { data: null, error: msg };
  }
}

// -------------------------------------------------------------
// 7. Admin Transcript Preview Fetcher
// -------------------------------------------------------------
export async function fetchStudentTranscriptForAdmin(studentId: string): Promise<{
  student: StudentRecord | null;
  results: StudentResultItem[] | null;
  error: string | null;
}> {
  try {
    // 1. Query student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (studentError) throw new Error(studentError.message);
    if (!student) throw new Error('Student profile not found.');

    // 2. Query student results with joined course and semester details
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
      .eq('student_id', studentId);

    if (resultsError) throw new Error(resultsError.message);

    type RawRow = {
      result_id: string;
      score: number;
      grade: string;
      grade_point: number;
      remark: string | null;
      courses: { course_code: string; course_title: string; credit_unit: number; course_type: string } | null;
      semesters: {
        semester_name: string;
        semester_order: number;
        academic_sessions: { session_name: string } | null;
      } | null;
    };

    const items: StudentResultItem[] = ((rawResults as unknown as RawRow[]) || []).map((row) => {
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
      student: student as StudentRecord,
      results: items,
      error: null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch transcript';
    return { student: null, results: null, error: msg };
  }
}
