import { ADMIN_THEMES, type ThemeId, useAdminTheme } from '@/context/AdminThemeContext';
import { CheckCircle, Palette, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { themeId, changeTheme, theme } = useAdminTheme();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Customize your admin experience</p>
      </div>

      {/* Sidebar Theme Picker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5" style={{ color: theme.accent }} />
          <h2 className="font-semibold text-slate-900 dark:text-white">Sidebar Theme</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(Object.entries(ADMIN_THEMES) as [ThemeId, any][]).map(([id, t]) => (
            <button
              key={id}
              onClick={() => changeTheme(id)}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${themeId === id ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-200 dark:border-slate-700'}`}
            >
              {/* Preview */}
              <div className="h-20 flex">
                {/* Sidebar color */}
                <div className="w-8 flex flex-col gap-1.5 p-1.5" style={{ backgroundColor: t.preview[0] }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-1.5 rounded-full" style={{ backgroundColor: t.preview[2], opacity: n === 1 ? 1 : 0.3 }} />
                  ))}
                </div>
                {/* Content color */}
                <div className="flex-1 p-2 space-y-1.5" style={{ backgroundColor: t.preview[1] }}>
                  <div className="h-2 rounded bg-slate-300/30 w-3/4" />
                  <div className="h-1.5 rounded bg-slate-300/20 w-1/2" />
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <div className="h-4 rounded" style={{ backgroundColor: t.preview[2], opacity: 0.7 }} />
                    <div className="h-4 rounded" style={{ backgroundColor: t.preview[2], opacity: 0.4 }} />
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.emoji} {t.name}</span>
                {themeId === id && <CheckCircle className="w-4 h-4 text-blue-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* App Dark/Light Mode */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          {appTheme === 'dark' ? <Moon className="w-5 h-5" style={{ color: theme.accent }} /> : <Sun className="w-5 h-5" style={{ color: theme.accent }} />}
          <h2 className="font-semibold text-slate-900 dark:text-white">App Appearance</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['light', 'dark', 'system'].map(m => (
            <button
              key={m}
              onClick={() => setAppTheme(m)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all capitalize text-sm font-medium ${appTheme === m ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              {m === 'dark' ? '🌑' : m === 'light' ? '☀️' : '💻'}
              {m}
              {appTheme === m && <CheckCircle className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Platform Information</h2>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Platform', value: 'Tha Buyer' },
            { label: 'Admin Panel', value: 'AIM Admin OS v1.0' },
            { label: 'Backend', value: 'Django REST Framework' },
            { label: 'Frontend', value: 'React + Vite + TailwindCSS' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
