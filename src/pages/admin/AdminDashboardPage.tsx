import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';

import {
  fetchAdminDashboardStats,
  type AdminDashboardStats,
} from '../../services/supabase/admin';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetchAdminDashboardStats();
    if (res.error) {
      setError(res.error);
      setStats(null);
    } else {
      setError(null);
      setStats(res.data);
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
      const res = await fetchAdminDashboardStats();
      if (!isMounted) return;

      if (res.error) {
        setError(res.error);
        setStats(null);
      } else {
        setError(null);
        setStats(res.data);
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
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            System overview
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Administrator Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage student accounts, academic sessions, course offerings, and semester results.
          </p>
        </div>
      </section>

      {/* State A: Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading admin metrics...</p>
        </div>
      )}

      {/* State B: Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-red-900">Unable to load dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
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

      {/* State C: Success */}
      {!loading && !error && stats && (
        <>
          {/* Overview Cards Grid */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
              <p className="mt-1 text-xs text-slate-500">Registered profiles</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Academic Results
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalResults}</p>
              <p className="mt-1 text-xs text-slate-500">Published records</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Active Courses
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalActiveCourses}</p>
              <p className="mt-1 text-xs text-slate-500">Available offerings</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Active Session
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 truncate">
                {stats.activeSessionName ?? 'None Active'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Academic session</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Active Semester
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900 truncate">
                {stats.activeSemesterName ?? 'None Active'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Academic term</p>
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Quick Administrative Operations</h3>
            <p className="mt-1 text-sm text-slate-600">
              Access core student, course, and result management workflows.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/admin/students"
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                  Manage Students &rarr;
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Register new student records, edit profiles, or search student records.
                </p>
              </Link>

              <Link
                to="/admin/results"
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                  Enter & Update Results &rarr;
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Input course scores, auto-derive letter grades, or edit stored grade points.
                </p>
              </Link>

              <Link
                to="/admin/courses"
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                  Manage Courses &rarr;
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Add new course offerings, assign credit units, and toggle active status.
                </p>
              </Link>

              <Link
                to="/admin/sessions"
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                  Academic Sessions &rarr;
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Configure academic session terms, start/end dates, and status.
                </p>
              </Link>

              <Link
                to="/admin/semesters"
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                  Semester Management &rarr;
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Configure semester orders (First / Second) and assign to academic sessions.
                </p>
              </Link>

              <Link
                to="/admin/transcripts"
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                  Preview Transcripts &rarr;
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Select any student to view, verify, or print their unofficial academic transcript.
                </p>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
