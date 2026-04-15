import type { User, UserRole } from '@/types';

const STORAGE_KEY = 'tha_buyer_session';

interface MockSession {
  user: User;
  token: string;
}

// Pre-seeded demo accounts
const mockUsers: (User & { password: string })[] = [
  { id: 'u-buyer-1', fullName: 'Demo Buyer', email: 'buyer@demo.com', phone: '+19524861934', role: 'buyer', isVerified: true, isActive: true, createdAt: '2024-01-01', password: 'password123' },
  { id: 'u-seller-1', fullName: 'Demo Seller', email: 'seller@demo.com', phone: '+19524861935', role: 'seller', businessName: 'Demo Store', isVerified: true, isActive: true, createdAt: '2024-01-01', password: 'password123' },
  { id: 'u-admin-1', fullName: 'Demo Admin', email: 'admin@demo.com', phone: '+19524861936', role: 'admin', isVerified: true, isActive: true, createdAt: '2024-01-01', password: 'password123' },
];

function generateToken(): string {
  return 'mock-jwt-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const mockAuth = {
  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    await new Promise(r => setTimeout(r, 500));
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...user } = found;
    const session: MockSession = { user, token: generateToken() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  async signUp(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    businessName?: string;
  }): Promise<{ user: User }> {
    await new Promise(r => setTimeout(r, 500));
    if (mockUsers.some(u => u.email === data.email)) {
      throw new Error('An account with this email already exists');
    }
    const newUser: User & { password: string } = {
      id: `u-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      businessName: data.businessName,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      password: data.password,
    };
    mockUsers.push(newUser);
    const { password: _, ...user } = newUser;
    return { user };
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },

  async resetPassword(email: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
    const found = mockUsers.find(u => u.email === email);
    if (!found) throw new Error('No account found with this email');
    // In mock mode, just simulate success
  },

  getSession(): MockSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as MockSession;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Check current session immediately
    const session = this.getSession();
    callback(session?.user ?? null);

    // Listen for storage changes (cross-tab sync)
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const s = this.getSession();
        callback(s?.user ?? null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};
