import { useCallback, useEffect, useState } from 'react';

import {
  fetchStudentProfile,
  type FetchProfileError,
} from '../../services/supabase/studentProfile';
import type { StudentRecord } from '../../types';

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FetchProfileError | null>(null);

  const loadData = useCallback(async () => {
    const response = await fetchStudentProfile();
    if (response.error) {
      setError(response.error);
      setProfile(null);
    } else {
      setError(null);
      setProfile(response.data);
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
      const response = await fetchStudentProfile();
      if (!isMounted) return;

      if (response.error) {
        setError(response.error);
        setProfile(null);
      } else {
        setError(null);
        setProfile(response.data);
      }
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not provided';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* State A: Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading your profile details...</p>
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
          <p className="mt-1 text-sm text-red-700">Please log in to view your profile.</p>
        </div>
      )}

      {/* State D: Database / Fetch Error */}
      {!loading && error === 'FETCH_ERROR' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-red-900">Unable to load profile</h3>
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

      {/* State E: Successful Read-Only Profile */}
      {!loading && !error && profile && (
        <>
          {/* Header Banner */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Student profile
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{profile.full_name}</h2>
                <p className="mt-1 font-mono text-sm text-slate-600">
                  Matric No: <span className="font-semibold text-slate-900">{profile.matric_number}</span>
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    profile.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      profile.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}
                  />
                  {profile.status === 'active' ? 'Active Enrollment' : 'Inactive'}
                </span>
                <span className="text-xs text-slate-400">
                  Official Academic Record (Read-only)
                </span>
              </div>
            </div>
          </section>

          {/* Profile Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Academic Enrollment Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Academic details
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Program &amp; Enrolment</h3>
              </div>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Department / Program</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.department || 'Not provided'}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Level of Enrollment</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.level_of_enrollment}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Matriculation Number</dt>
                  <dd className="mt-1 font-mono font-medium text-slate-900">
                    {profile.matric_number}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Academic Status</dt>
                  <dd className="mt-1 capitalize font-medium text-slate-900">
                    {profile.status}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Personal Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Personal identity
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Student Identity</h3>
              </div>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Full Name</dt>
                  <dd className="mt-1 font-medium text-slate-900">{profile.full_name}</dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Gender</dt>
                  <dd className="mt-1 capitalize font-medium text-slate-900">
                    {profile.gender || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Date of Birth</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {formatDate(profile.date_of_birth)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Contact Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Communication
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Contact Details</h3>
              </div>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Email Address</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.email || 'Not provided'}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Phone Number</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.phone || 'Not provided'}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Institutional Record Metadata */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  System metadata
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Record History</h3>
              </div>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Registration Timestamp</dt>
                  <dd className="mt-1 text-slate-700">{formatDate(profile.created_at)}</dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Last Profile Update</dt>
                  <dd className="mt-1 text-slate-700">{formatDate(profile.updated_at)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Institutional Policy Notice */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Institutional Notice
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Student profile information is managed centrally by the institutional academic affairs and registry department. If any information displayed above requires amendment or correction, please submit an official request to the portal administrator.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
