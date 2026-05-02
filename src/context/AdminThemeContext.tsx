import { createContext, useContext, useState, type ReactNode } from 'react';

// ── Theme Definitions ─────────────────────────────────────────────────────────
export const ADMIN_THEMES = {
  dark: {
    id: 'dark', name: 'Dark', emoji: '🌑',
    sidebar: 'bg-slate-900',
    sidebarBorder: '',
    sidebarLogo: 'text-white',
    sidebarText: 'text-slate-400',
    sidebarActive: 'bg-white/10 text-white font-medium',
    sidebarHover: 'hover:bg-white/8 hover:text-slate-200',
    sidebarSection: 'text-slate-600',
    accent: '#3B82F6',
    preview: ['#0F172A', '#1E293B', '#3B82F6'],
  },
  light: {
    id: 'light', name: 'Light', emoji: '☀️',
    sidebar: 'bg-white',
    sidebarBorder: 'border-r border-slate-200',
    sidebarLogo: 'text-slate-900',
    sidebarText: 'text-slate-500',
    sidebarActive: 'bg-blue-50 text-blue-700 font-semibold',
    sidebarHover: 'hover:bg-slate-100 hover:text-slate-900',
    sidebarSection: 'text-slate-400',
    accent: '#3B82F6',
    preview: ['#FFFFFF', '#F1F5F9', '#3B82F6'],
  },
  ocean: {
    id: 'ocean', name: 'Ocean', emoji: '🌊',
    sidebar: 'bg-[#0C1E3C]',
    sidebarBorder: '',
    sidebarLogo: 'text-white',
    sidebarText: 'text-blue-300',
    sidebarActive: 'bg-blue-500/20 text-white font-medium',
    sidebarHover: 'hover:bg-blue-500/10 hover:text-blue-100',
    sidebarSection: 'text-blue-800',
    accent: '#06B6D4',
    preview: ['#0C1E3C', '#163354', '#06B6D4'],
  },
  forest: {
    id: 'forest', name: 'Forest', emoji: '🌲',
    sidebar: 'bg-[#0D2018]',
    sidebarBorder: '',
    sidebarLogo: 'text-white',
    sidebarText: 'text-green-300',
    sidebarActive: 'bg-green-500/20 text-white font-medium',
    sidebarHover: 'hover:bg-green-500/10 hover:text-green-100',
    sidebarSection: 'text-green-900',
    accent: '#10B981',
    preview: ['#0D2018', '#16341F', '#10B981'],
  },
  midnight: {
    id: 'midnight', name: 'Midnight', emoji: '🔮',
    sidebar: 'bg-[#160C28]',
    sidebarBorder: '',
    sidebarLogo: 'text-white',
    sidebarText: 'text-purple-300',
    sidebarActive: 'bg-purple-500/20 text-white font-medium',
    sidebarHover: 'hover:bg-purple-500/10 hover:text-purple-100',
    sidebarSection: 'text-purple-900',
    accent: '#A855F7',
    preview: ['#160C28', '#1E1040', '#A855F7'],
  },
  rose: {
    id: 'rose', name: 'Rose', emoji: '🌹',
    sidebar: 'bg-[#2D0A1E]',
    sidebarBorder: '',
    sidebarLogo: 'text-white',
    sidebarText: 'text-pink-300',
    sidebarActive: 'bg-pink-500/20 text-white font-medium',
    sidebarHover: 'hover:bg-pink-500/10 hover:text-pink-100',
    sidebarSection: 'text-pink-900',
    accent: '#EC4899',
    preview: ['#2D0A1E', '#3D1030', '#EC4899'],
  },
} as const;

export type ThemeId = keyof typeof ADMIN_THEMES;
export type AdminTheme = (typeof ADMIN_THEMES)[ThemeId];

interface AdminThemeContextValue {
  themeId: ThemeId;
  theme: AdminTheme;
  changeTheme: (id: ThemeId) => void;
  themes: typeof ADMIN_THEMES;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

const STORAGE_KEY = 'aim_admin_theme';

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as ThemeId) in ADMIN_THEMES ? (saved as ThemeId) : 'dark';
  });

  const changeTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <AdminThemeContext.Provider
      value={{ themeId, theme: ADMIN_THEMES[themeId], changeTheme, themes: ADMIN_THEMES }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme(): AdminThemeContextValue {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used inside AdminThemeProvider');
  return ctx;
}
