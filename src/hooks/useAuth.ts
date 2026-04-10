import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import type { User as AppUser, UserRole } from '@/types';

export function useAuth() {
  const { setUser, logout: storeLogout } = useStore();
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email: string): Promise<AppUser | null> => {
    const [{ data: profile }, { data: roleData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId).single(),
    ]);

    if (!profile) return null;

    return {
      id: userId,
      fullName: profile.full_name || '',
      email,
      phone: profile.phone || '',
      role: (roleData?.role as UserRole) || 'buyer',
      businessName: profile.business_name || '',
      isVerified: true,
      isActive: profile.is_active ?? true,
      createdAt: profile.created_at,
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(async () => {
          const appUser = await fetchProfile(session.user.id, session.user.email || '');
          if (appUser) setUser(appUser);
          setLoading(false);
        }, 0);
      } else {
        storeLogout();
        setLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await fetchProfile(session.user.id, session.user.email || '');
        if (appUser) setUser(appUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, setUser, storeLogout]);

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    businessName?: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role,
          business_name: data.businessName || '',
        },
      },
    });
    if (error) throw error;
    return authData;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    storeLogout();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  return { loading, signUp, signIn, signOut, resetPassword };
}
