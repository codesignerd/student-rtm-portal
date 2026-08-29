export type DatabaseRole = 'admin' | 'student';
export type DatabaseStatus = 'active' | 'inactive';
export type CourseType = 'Required' | 'Elective';
export type ResultGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type PublicUserRecord = {
  user_id: string;
  email: string;
  role: DatabaseRole;
  status: DatabaseStatus;
  created_at: string;
  updated_at: string;
};

export type StudentRecord = {
  student_id: string;
  user_id: string | null;
  matric_number: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  level_of_enrollment: string;
  status: DatabaseStatus;
  created_at: string;
  updated_at: string;
};

export type AcademicSessionRecord = {
  session_id: string;
  session_name: string;
  start_date?: string | null;
  end_date?: string | null;
  status: DatabaseStatus;
  created_at: string;
  updated_at: string;
};

export type SemesterRecord = {
  semester_id: string;
  session_id: string;
  semester_name: string;
  semester_order: number;
  start_date?: string | null;
  end_date?: string | null;
  status: DatabaseStatus;
  created_at: string;
  updated_at: string;
};

export type CourseRecord = {
  course_id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  course_type: CourseType;
  status: DatabaseStatus;
  created_at: string;
  updated_at: string;
};

export type ResultRecord = {
  result_id: string;
  student_id: string;
  course_id: string;
  semester_id: string;
  score: number;
  grade: ResultGrade;
  grade_point: number;
  remark?: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentResultItem = {
  result_id: string;
  score: number;
  grade: string;
  grade_point: number;
  remark: string | null;
  course_code: string;
  course_title: string;
  credit_unit: number;
  course_type: string;
  semester_name: string;
  semester_order: number;
  session_name: string;
};
