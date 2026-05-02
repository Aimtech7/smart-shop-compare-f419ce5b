import { useState, useEffect } from 'react';
import { Search, Users, RefreshCw } from 'lucide-react';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function CustomersPage() {
  const { theme } = useAdminTheme();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (DJANGO_CONFIG.enabled) {
          const res = await djangoAdmin.customers();
          const data = res.results || res.data || [];
          setCustomers(Array.isArray(data) ? data : []);
        } else {
          setCustomers(Array.from({ length: 12 }).map((_, i) => ({
            id: `u-${i}`, name: `Customer ${i + 1}`, email: `user${i + 1}@example.com`,
            phone: `+1555${1000 + i}`, is_active: i % 5 !== 0,
            date_joined: new Date(Date.now() - i * 7 * 86400000).toISOString(),
            total_orders: Math.floor(Math.random() * 20),
          })));
        }
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggle = async (id: string, currentlyActive: boolean) => {
    setActing(id);
    try {
      if (DJANGO_CONFIG.enabled) {
        if (currentlyActive) await djangoAdmin.suspendUser(id);
        else await djangoAdmin.activateUser(id);
      }
      setCustomers(cs => cs.map(c => c.id === id ? { ...c, is_active: !currentlyActive } : c));
      toast.success(`Customer ${currentlyActive ? 'suspended' : 'activated'}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const filtered = customers.filter(c =>
    !search || [c.name, c.email, c.phone].some(v =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} registered buyers</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…"
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Customer', 'Email', 'Phone', 'Joined', 'Orders', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c: any) => {
                  const active = c.is_active || c.isActive;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: theme.accent }}>
                            {(c.name || c.fullName || 'U')[0].toUpperCase()}
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white">{c.name || c.fullName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{c.email}</td>
                      <td className="px-5 py-3.5 text-slate-500">{c.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(c.date_joined || c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-slate-500">{c.total_orders ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggle(c.id, active)}
                          disabled={acting === c.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60 ${active ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'}`}
                        >
                          {acting === c.id ? '…' : active ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 text-sm">No customers found</div>}
          </div>
        )}
      </div>
    </div>
  );
}
