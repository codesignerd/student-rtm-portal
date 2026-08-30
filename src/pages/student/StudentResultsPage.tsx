import { useCallback, useEffect, useMemo, useState } from 'react';

import { calculateSemesterGpa } from '../../services/academicCalculations';
import {
  fetchStudentResults,
  type FetchStudentResultsError,
  type StudentProfileSummary,
} from '../../services/supabase/studentResults';
import type { StudentResultItem } from '../../types';

type SemesterResultGroup = {
  semesterName: string;
  semesterOrder: number;
  results: StudentResultItem[];
  semesterGpa: number | null;
};

type GroupedResults = {
  sessionName: string;
  semesters: SemesterResultGroup[];
};

export function StudentResultsPage() {
  const [results, setResults] = useState<StudentResultItem[] | null>(null);
  const [student, setStudent] = useState<StudentProfileSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FetchStudentResultsError | null>(null);

  const loadData = useCallback(async () => {
    const response = await fetchStudentResults();
    if (response.error) {
      setError(response.error);
      setStudent(response.student);
      setResults(null);
    } else {
      setError(null);
      setStudent(response.student);
      setResults(response.data);
    }
    setLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    void loadData();
  }, [loadData]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const response = await fetchStudentResults();
      if (!isMounted) return;

      if (response.error) {
        setError(response.error);
        setStudent(response.student);
        setResults(null);
      } else {
        setError(null);
        setStudent(response.student);
        setResults(response.data);
      }
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Group results by academic session and semester
  const groupedResults = useMemo<GroupedResults[]>(() => {
    if (!results || results.length === 0) return [];

    const sessionMap = new Map<string, Map<string, SemesterResultGroup>>();

    for (const item of results) {
      const sessionKey = item.session_name;
      const semesterKey = item.semester_name;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, new Map());
      }
      const semesterMap = sessionMap.get(sessionKey)!;

      if (!semesterMap.has(semesterKey)) {
        semesterMap.set(semesterKey, {
          semesterName: item.semester_name,
          semesterOrder: item.semester_order,
          results: [],
          semesterGpa: null,
        });
      }

      semesterMap.get(semesterKey)!.results.push(item);
    }

    const grouped: GroupedResults[] = [];
    sessionMap.forEach((semestersMap, sessionName) => {
      const sortedSemesters = Array.from(semestersMap.values()).sort(
        (a, b) => a.semesterOrder - b.semesterOrder,
      );

      sortedSemesters.forEach((semester) => {
        semester.semesterGpa = calculateSemesterGpa(semester.results);
      });

      grouped.push({
        sessionName,
        semesters: sortedSemesters,
      });
    });

    return grouped;
  }, [results]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Academic records
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Student Results</h2>
            <p className="mt-1 text-sm text-slate-600">
              View your published academic course results and grade points.
            </p>
          </div>

          {student && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:text-right">
              <p className="text-sm font-semibold text-slate-900">{student.fullName}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{student.matricNumber}</p>
              {student.department && (
                <p className="text-xs text-slate-600 mt-1">
                  {student.department} • {student.levelOfEnrollment}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* State A: Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading your academic results...</p>
        </div>
      )}

      {/* State B: Unauthorized / Missing Student Record */}
      {!loading && error === 'STUDENT_NOT_FOUND' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-2 text-amber-800">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-amber-900">Student Profile Not Found</h3>
              <p className="mt-1 text-sm text-amber-800">
                Your authenticated account is not currently linked to an active student record.
                Please contact your institution&apos;s administrator to link your profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* State C: Unauthenticated */}
      {!loading && error === 'UNAUTHENTICATED' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-red-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-red-700">
            Please log in to view your academic results.
          </p>
        </div>
      )}

      {/* State D: Database / Fetch Error */}
      {!loading && error === 'FETCH_ERROR' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-red-900">Unable to load results</h3>
              <p className="mt-1 text-sm text-red-700">
                We encountered an issue communicating with the database. Please try again later.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* State E: Empty Results */}
      {!loading && !error && results && results.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No results available yet</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
            There are currently no published course results recorded for your account. Published semester grades will appear here.
          </p>
        </div>
      )}

      {/* State F: Successful Results Display */}
      {!loading && !error && results && results.length > 0 && (
        <div className="space-y-6">
          {groupedResults.map((sessionGroup) => (
            <div key={sessionGroup.sessionName} className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {sessionGroup.sessionName} Academic Session
                </h3>
              </div>

              {sessionGroup.semesters.map((semesterGroup) => (
                <div
                  key={`${sessionGroup.sessionName}-${semesterGroup.semesterName}`}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {semesterGroup.semesterName}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                        GPA: {semesterGroup.semesterGpa === null ? 'Unavailable' : semesterGroup.semesterGpa.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th scope="col" className="px-6 py-3">Course Code</th>
                          <th scope="col" className="px-6 py-3">Course Title</th>
                          <th scope="col" className="px-6 py-3 text-center">Credit Unit</th>
                          <th scope="col" className="px-6 py-3">Type</th>
                          <th scope="col" className="px-6 py-3 text-center">Score</th>
                          <th scope="col" className="px-6 py-3 text-center">Grade</th>
                          <th scope="col" className="px-6 py-3 text-center">Grade Point</th>
                          <th scope="col" className="px-6 py-3">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {semesterGroup.results.map((item) => (
                          <tr key={item.result_id} className="hover:bg-slate-50/70 transition">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900">
                              {item.course_code}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">
                              {item.course_title}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.credit_unit}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  item.course_type === 'Required'
                                    ? 'bg-slate-100 text-slate-800'
                                    : 'bg-sky-50 text-sky-700'
                                }`}
                              >
                                {item.course_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-900">
                              {item.score}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded ${
                                  item.grade === 'A'
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : item.grade === 'B'
                                      ? 'text-blue-700 bg-blue-50'
                                      : item.grade === 'C'
                                        ? 'text-indigo-700 bg-indigo-50'
                                        : item.grade === 'D'
                                          ? 'text-amber-700 bg-amber-50'
                                          : item.grade === 'E'
                                            ? 'text-orange-700 bg-orange-50'
                                            : 'text-red-700 bg-red-50'
                                }`}
                              >
                                {item.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono">
                              {item.grade_point.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {item.remark || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

