import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { mockAuth } from '@/services/mock/mockAuth';
import type { UserRole } from '@/types';

export function useAuth() {
  const { setUser, logout: storeLogout } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = mockAuth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
    setLoading(false);

    const unsubscribe = mockAuth.onAuthStateChange((user) => {
      if (user) {
        setUser(user);
      } else {
        storeLogout();
      }
    });

    return unsubscribe;
  }, [setUser, storeLogout]);

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    businessName?: string;
  }) => {
    return await mockAuth.signUp(data);
  };

  const signIn = async (email: string, password: string) => {
    const { user } = await mockAuth.signIn(email, password);
    setUser(user);
    return { user };
  };

  const signOut = async () => {
    await mockAuth.signOut();
    storeLogout();
  };

  const resetPassword = async (email: string) => {
    await mockAuth.resetPassword(email);
  };

  return { loading, signUp, signIn, signOut, resetPassword };
}
