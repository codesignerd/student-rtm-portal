import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
}
