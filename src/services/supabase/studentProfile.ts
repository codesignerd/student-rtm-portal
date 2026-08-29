import { supabase } from './client';
import type { StudentRecord } from '../../types';

export type FetchProfileError =
  | 'UNAUTHENTICATED'
  | 'STUDENT_NOT_FOUND'
  | 'FETCH_ERROR';

export type FetchProfileResponse = {
  data: StudentRecord | null;
  error: FetchProfileError | null;
  errorMessage?: string;
};

export async function fetchStudentProfile(): Promise<FetchProfileResponse> {
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

    // 2. Query student profile linked to this user_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (studentError) {
      console.error('Failed to fetch student profile from Supabase:', studentError.message);
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
        errorMessage: 'Your user account is not linked to an active student record.',
      };
    }

    return {
      data: student as StudentRecord,
      error: null,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
    console.error('Unexpected error in fetchStudentProfile:', errorMsg);
    return {
      data: null,
      error: 'FETCH_ERROR',
      errorMessage: errorMsg,
    };
  }
}

