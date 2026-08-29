import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';

import {
  fetchStudentDashboardData,
  type FetchDashboardError,
  type StudentDashboardData,
} from '../../services/supabase/studentDashboard';

export function StudentDashboardPage() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FetchDashboardError | null>(null);

  const loadData = useCallback(async () => {
    const response = await fetchStudentDashboardData();
    if (response.error) {
      setError(response.error);
      setDashboardData(null);
    } else {
      setError(null);
      setDashboardData(response.data);
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
      const response = await fetchStudentDashboardData();
      if (!isMounted) return;

      if (response.error) {
        setError(response.error);
        setDashboardData(null);
      } else {
        setError(null);
        setDashboardData(response.data);
      }
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* State A: Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading your academic dashboard...</p>
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
          <p className="mt-1 text-sm text-red-700">Please log in to access your dashboard.</p>
        </div>
      )}

      {/* State D: Database / Fetch Error */}
      {!loading && error === 'FETCH_ERROR' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-red-900">Unable to load dashboard</h3>
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

      {/* State E: Successful Dashboard */}
      {!loading && !error && dashboardData && (
        <>
          {/* Welcome & Profile Summary Banner */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Welcome back
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {dashboardData.student.full_name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span className="font-mono text-slate-700">
                    Matric: {dashboardData.student.matric_number}
                  </span>
                  {dashboardData.student.department && (
                    <span>• {dashboardData.student.department}</span>
                  )}
                  <span>• {dashboardData.student.level_of_enrollment}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    dashboardData.student.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      dashboardData.student.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}
                  />
                  Status: {dashboardData.student.status === 'active' ? 'Active Student' : 'Inactive'}
                </span>
              </div>
            </div>
          </section>

          {/* Academic Overview Statistics Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Courses Recorded
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardData.stats.totalCourses}
              </p>
              <p className="mt-1 text-xs text-slate-500">Total published results</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Credit Units
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardData.stats.totalCreditUnits}
              </p>
              <p className="mt-1 text-xs text-slate-500">Earned course units</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Academic Session
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 truncate">
                {dashboardData.stats.latestSession || '—'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Latest recorded session</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current Semester
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 truncate">
                {dashboardData.stats.latestSemester || '—'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Latest recorded semester</p>
            </div>
          </section>

          {/* Recent Results Preview */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Course Results</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest published results from your academic record
                </p>
              </div>

              <Link
                to="/student/results"
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition inline-flex items-center gap-1"
              >
                View all results &rarr;
              </Link>
            </div>

            {dashboardData.recentResults.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-600">No published course results recorded yet.</p>
                <Link
                  to="/student/results"
                  className="mt-3 inline-block rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                >
                  Check Results Page
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th scope="col" className="px-6 py-3">Course Code</th>
                      <th scope="col" className="px-6 py-3">Course Title</th>
                      <th scope="col" className="px-6 py-3 text-center">Credits</th>
                      <th scope="col" className="px-6 py-3 text-center">Score</th>
                      <th scope="col" className="px-6 py-3 text-center">Grade</th>
                      <th scope="col" className="px-6 py-3 text-center">Grade Point</th>
                      <th scope="col" className="px-6 py-3">Session &amp; Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.recentResults.map((item) => (
                      <tr key={item.result_id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 font-mono font-medium text-slate-900">
                          {item.course_code}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {item.course_title}
                        </td>
                        <td className="px-6 py-4 text-center">{item.credit_unit}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-900">
                          {item.score}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs ${
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
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {item.session_name} • {item.semester_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick Navigation Cards */}
          <section className="grid gap-4 md:grid-cols-3">
            <Link
              to="/student/results"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Academic Results
                </p>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-slate-900">Course Grades</h4>
              <p className="mt-1 text-sm text-slate-600">
                View all published course scores, grades, and remarks organized by semester.
              </p>
            </Link>

            <Link
              to="/student/transcript"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Transcript
                </p>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-slate-900">Academic Record</h4>
              <p className="mt-1 text-sm text-slate-600">
                Preview your cumulative academic record across all attended sessions.
              </p>
            </Link>

            <Link
              to="/student/profile"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Student Profile
                </p>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-slate-900">Personal Details</h4>
              <p className="mt-1 text-sm text-slate-600">
                Check your department, matric number, enrollment level, and contact details.
              </p>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
