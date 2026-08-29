import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../services/supabase/client';
import type { UserRole } from '../types';

export async function fetchUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load user role from public.users:', error.message);
    return null;
  }

  if (!data?.role) {
    return null;
  }

  return data.role === 'admin' || data.role === 'student' ? data.role : null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      setSession(nextSession);

      if (!nextSession?.user?.id) {
        if (isMounted) {
          setUserRole(null);
          setLoading(false);
        }
        return;
      }

      const resolvedRole = await fetchUserRole(nextSession.user.id);

      if (!isMounted) {
        return;
      }

      setUserRole(resolvedRole);
      setLoading(false);
    };

    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      await syncSession(data.session);
    };

    void initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      void syncSession(currentSession);
    });

    return () => {
      isMounted = false;
      void authListener.subscription.unsubscribe();
    };
  }, []);

  return { session, userRole, loading };
}
