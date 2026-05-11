import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { djangoAuth, DJANGO_CONFIG, ApiError } from '@/services/django';
import type { UserRole } from '@/types';

const useDjango = DJANGO_CONFIG.enabled;

export function useAuth() {
  const { setUser, logout: storeLogout } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const user = await djangoAuth.me();
        if (user) setUser(user);
      } catch {
        // not authenticated — fine
      }
      // Global 401 handler — log the user out cleanly
      const onUnauth = () => storeLogout();
      window.addEventListener('auth:unauthorized', onUnauth);
      unsubscribe = () => window.removeEventListener('auth:unauthorized', onUnauth);
      setLoading(false);
    };

    init();
    return () => unsubscribe?.();
  }, [setUser, storeLogout]);

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    businessName?: string;
  }) => {
    const res = await djangoAuth.register({
      email: data.email,
      password: data.password,
      password_confirm: data.password,
      name: data.fullName,
      phone: data.phone,
      role: data.role,
      business_name: data.businessName,
    });
    if (res.user && res.access) {
      setUser(res.user);
    }
    return res;
  };

  const signIn = async (email: string, password: string) => {
    const { user } = await djangoAuth.login({ email, password });
    setUser(user);
    return { user };
  };

  const signOut = async () => {
    try { await djangoAuth.logout(); } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 401) throw e;
    }
    storeLogout();
  };

  const resetPassword = async (email: string) => {
    return await djangoAuth.requestPasswordReset(email);
  };

  const confirmPasswordReset = async (payload: any) => {
    return await djangoAuth.confirmPasswordReset(payload);
  };

  const verifyEmail = async (key: string) => {
    return await djangoAuth.verifyEmail(key);
  };

  return { loading, signUp, signIn, signOut, resetPassword, confirmPasswordReset, verifyEmail };
}
