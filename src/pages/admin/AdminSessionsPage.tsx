import { useCallback, useEffect, useState } from 'react';

import {
  fetchAdminSessions,
  saveAdminSession,
  type AcademicSessionRow,
} from '../../services/supabase/admin';

export function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSessionRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<AcademicSessionRow | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetchAdminSessions();
    if (res.error) {
      setError(res.error);
      setSessions(null);
    } else {
      setError(null);
      setSessions(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const res = await fetchAdminSessions();
      if (!isMounted) return;

      if (res.error) {
        setError(res.error);
        setSessions(null);
      } else {
        setError(null);
        setSessions(res.data);
      }
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingSession(null);
    setSessionName('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (session: AcademicSessionRow) => {
    setEditingSession(session);
    setSessionName(session.session_name);
    setStartDate(session.start_date || '');
    setEndDate(session.end_date || '');
    setStatus(session.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      setFormError('Session Name (e.g. 2024/2025) is required.');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setFormError('End Date must be on or after Start Date.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const res = await saveAdminSession({
      session_id: editingSession?.session_id,
      session_name: sessionName,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
    });

    setFormSubmitting(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setActionSuccess(
        `Academic session "${sessionName}" ${editingSession ? 'updated' : 'created'} successfully.`,
      );
      closeModal();
      void loadData();
    }
  };

  const handleToggleStatus = async (session: AcademicSessionRow) => {
    const newStatus = session.status === 'active' ? 'inactive' : 'active';
    const res = await saveAdminSession({
      session_id: session.session_id,
      session_name: session.session_name,
      start_date: session.start_date,
      end_date: session.end_date,
      status: newStatus,
    });

    if (res.error) {
      setError(res.error);
    } else {
      setActionSuccess(
        `Session "${session.session_name}" is now ${newStatus === 'active' ? 'Active' : 'Inactive'}.`,
      );
      void loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Session Configuration
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Academic Sessions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure academic sessions, start/end date boundaries, and active status.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none"
        >
          + Add New Session
        </button>
      </div>

      {/* Notification Toast */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex justify-between items-center shadow-sm">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading academic sessions...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-red-900">Failed to load sessions</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main Table */}
      {!loading && !error && sessions && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Session Name</th>
                  <th scope="col" className="px-6 py-3.5">Start Date</th>
                  <th scope="col" className="px-6 py-3.5">End Date</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No academic sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((item) => (
                    <tr key={item.session_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {item.session_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                          }`}
                        >
                          {item.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            item.status === 'active'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {item.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">
              {editingSession ? 'Edit Academic Session' : 'Add Academic Session'}
            </h3>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="sessionName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Session Name * (e.g. 2024/2025)
                </label>
                <input
                  id="sessionName"
                  type="text"
                  required
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="2024/2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sessionStatus" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Status
                </label>
                <select
                  id="sessionStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
