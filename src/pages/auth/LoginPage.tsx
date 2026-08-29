import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { supabase } from '../../services/supabase/client';
import { fetchUserRole, useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, userRole, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!loading && session && userRole) {
      navigate(userRole === 'student' ? '/student' : '/admin', { replace: true });
    }
  }, [loading, navigate, session, userRole]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setErrorMessage('Invalid credentials. Please check your email and password.');
      setIsSubmitting(false);
      return;
    }

    const resolvedRole = await fetchUserRole(data.user.id);

    if (!resolvedRole) {
      await supabase.auth.signOut();
      setErrorMessage('This account is not linked to a valid student or administrator record.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigate(resolvedRole === 'student' ? '/student' : '/admin', { replace: true });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Authentication</p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">Login</h2>
      <p className="mt-2 text-sm text-slate-600">
        Please fill in your email and password to sign in and continue
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            placeholder="john@example.com"
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </div>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
