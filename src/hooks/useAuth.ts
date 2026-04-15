import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { mockAuth } from '@/services/mock/mockAuth';
import type { UserRole } from '@/types';

export function useAuth() {
  const { setUser, logout: storeLogout } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = mockAuth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
    setLoading(false);

    // Listen for cross-tab auth changes
    const unsubscribe = mockAuth.onAuthStateChange((user) => {
      if (user) {
        setUser(user);
      } else {
        storeLogout();
      }
    });

    return unsubscribe;
  }, [setUser, storeLogout]);

  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    businessName?: string;
  }) => {
    const result = await mockAuth.signUp(data);
    return result;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user } = await mockAuth.signIn(email, password);
    setUser(user);
    return { user };
  }, [setUser]);

  const signOut = useCallback(async () => {
    await mockAuth.signOut();
    storeLogout();
  }, [storeLogout]);

  const resetPassword = useCallback(async (email: string) => {
    await mockAuth.resetPassword(email);
  }, []);

  return { loading, signUp, signIn, signOut, resetPassword };
}
