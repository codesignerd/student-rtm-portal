import { NavLink, Outlet, useNavigate } from 'react-router';

import { supabase } from '../services/supabase/client';

const navigationItems = [
  { to: '/student/dashboard', label: 'Dashboard', end: true },
  { to: '/student/results', label: 'Results' },
  { to: '/student/transcript', label: 'Transcript' },
  { to: '/student/profile', label: 'Profile' },
];

export function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:min-h-0">
      <div className="mx-auto flex max-w-8xl print:block print:max-w-none">
        <aside className="w-full max-w-xs border-r border-r-slate-200 bg-white p-5 shadow-sm print:hidden">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Student portal
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Academic workspace</h1>
          </div>

          <nav className="mt-6 space-y-2">
            {navigationItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
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
              Access
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Student-only academic view and profile access.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-6 print:p-0 print:m-0">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm print:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Academic records
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Student portal</h2>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
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
