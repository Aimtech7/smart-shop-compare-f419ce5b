import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2,
  Settings, Bell, Search, LogOut, Sun, Moon, Menu, X,
  ChevronRight, Store, Palette, CheckCircle,
} from 'lucide-react';
import { AdminThemeProvider, useAdminTheme, ADMIN_THEMES, type ThemeId } from '@/context/AdminThemeContext';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

// ── Inner layout (has access to theme context) ────────────────────────────────
function AdminLayoutInner() {
  const { theme, themeId, changeTheme, themes } = useAdminTheme();
  const { user } = useStore();
  const { signOut } = useAuth();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${theme.sidebar} ${theme.sidebarBorder}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.accent }}
        >
          <Store className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className={`font-bold text-sm leading-none ${theme.sidebarLogo}`}>AIM Admin OS</p>
          <p className={`text-xs mt-0.5 ${theme.sidebarText}`}>Management Console</p>
        </div>
      </div>

      <div className="w-full h-px bg-white/5 mb-3" />

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-2 ${theme.sidebarSection}`}>
          Main Menu
        </p>
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive ? theme.sidebarActive : `${theme.sidebarText} ${theme.sidebarHover}`
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="w-full h-px bg-white/5 my-3" />
        <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-2 ${theme.sidebarSection}`}>
          System
        </p>
        {NAV_ITEMS.slice(5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive ? theme.sidebarActive : `${theme.sidebarText} ${theme.sidebarHover}`
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="w-full h-px bg-white/5 mt-2" />

      {/* Bottom: Theme picker trigger */}
      <div className="px-3 py-3 space-y-1">
        <button
          onClick={() => setThemePickerOpen(v => !v)}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${theme.sidebarText} ${theme.sidebarHover}`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Sidebar Theme</span>
          <span className="text-xs opacity-60 capitalize">{themeId}</span>
        </button>

        {/* Theme picker dropdown */}
        {themePickerOpen && (
          <div className="rounded-xl overflow-hidden border border-white/10 p-2 space-y-1">
            {(Object.keys(themes) as ThemeId[]).map((id) => {
              const t = themes[id];
              return (
                <button
                  key={id}
                  onClick={() => { changeTheme(id); setThemePickerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all ${theme.sidebarText} ${theme.sidebarHover}`}
                >
                  <div className="flex gap-1">
                    {t.preview.map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="flex-1 text-left">{t.emoji} {t.name}</span>
                  {themeId === id && <CheckCircle className="w-3.5 h-3.5" style={{ color: theme.accent }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* User info + logout */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${theme.sidebarText}`}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: theme.accent }}
          >
            {(user?.fullName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${theme.sidebarLogo}`}>
              {user?.fullName || 'Admin'}
            </p>
            <p className="text-[10px] truncate opacity-60">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="opacity-60 hover:opacity-100 transition-opacity">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 shrink-0 flex flex-col z-10">
            <SidebarContent />
          </aside>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center gap-4 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              placeholder="Search orders, products…"
              className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Dark/light toggle */}
            <button
              onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle dark mode"
            >
              {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-4">
                  <p className="font-semibold text-sm mb-3 text-slate-900 dark:text-white">Notifications</p>
                  {[
                    { msg: 'New order #1042 placed', time: '2m ago', color: 'bg-blue-500' },
                    { msg: 'Low stock: Running Shoes (3 left)', time: '15m ago', color: 'bg-amber-500' },
                    { msg: 'Payment confirmed for #1039', time: '1h ago', color: 'bg-emerald-500' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-0 border-slate-100 dark:border-slate-800">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color}`} />
                      <div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{n.msg}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: theme.accent }}
            >
              {(user?.fullName || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ── Public export: wraps provider ─────────────────────────────────────────────
export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner />
    </AdminThemeProvider>
  );
}
