import { NavLink, Outlet, useNavigate } from 'react-router';

import { supabase } from '../services/supabase/client';

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/sessions', label: 'Academic Sessions' },
  { to: '/admin/semesters', label: 'Semesters' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/results', label: 'Results' },
  { to: '/admin/transcripts', label: 'Transcript Preview' },
];

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:min-h-0">
      <div className="mx-auto flex max-w-8xl print:block print:max-w-none">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full max-w-xs border-r border-r-slate-200 bg-white p-5 shadow-sm print:hidden">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Administrator portal
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Workspace</h1>
          </div>

          <nav className="mt-6 space-y-2">
            {adminNavItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Role Access
            </p>
            <p className="mt-2 text-xs text-slate-700">
              Authorized administrator mode. All academic management operations are logged and protected by RLS.
            </p>
          </div>
        </aside>

        {/* Main Admin Content Area */}
        <div className="min-w-0 flex-1 p-6 print:p-0 print:m-0">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm print:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Academic Management System
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Administrator Console</h2>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="mt-6 print:mt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
