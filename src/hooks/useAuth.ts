import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { mockAuth } from '@/services/mock/mockAuth';
import { djangoAuth, DJANGO_CONFIG, ApiError } from '@/services/django';
import type { UserRole } from '@/types';

const useDjango = DJANGO_CONFIG.enabled;

export function useAuth() {
  const { setUser, logout: storeLogout } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      if (useDjango) {
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
      } else {
        const session = mockAuth.getSession();
        if (session?.user) setUser(session.user);
        unsubscribe = mockAuth.onAuthStateChange((user) => {
          if (user) setUser(user);
          else storeLogout();
        });
      }
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
    if (useDjango) {
      const { user } = await djangoAuth.register({
        email: data.email,
        password: data.password,
        password_confirm: data.password,
        name: data.fullName,
        phone: data.phone,
        role: data.role,
        business_name: data.businessName,
      });
      setUser(user);
      return { user };
    }
    return await mockAuth.signUp(data);
  };

  const signIn = async (email: string, password: string) => {
    if (useDjango) {
      const { user } = await djangoAuth.login({ email, password });
      setUser(user);
      return { user };
    }
    const { user } = await mockAuth.signIn(email, password);
    setUser(user);
    return { user };
  };

  const signOut = async () => {
    if (useDjango) {
      try { await djangoAuth.logout(); } catch (e) {
        if (!(e instanceof ApiError) || e.status !== 401) throw e;
      }
      storeLogout();
      return;
    }
    await mockAuth.signOut();
    storeLogout();
  };

  const resetPassword = async (email: string) => {
    if (useDjango) {
      // Implement when Django endpoint is ready: POST /auth/password-reset/
      throw new Error('Password reset not yet wired to Django backend');
    }
    await mockAuth.resetPassword(email);
  };

  return { loading, signUp, signIn, signOut, resetPassword };
}
