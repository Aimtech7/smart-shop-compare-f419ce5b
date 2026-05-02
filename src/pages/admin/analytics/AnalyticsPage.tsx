import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function AnalyticsPage() {
  const { theme } = useAdminTheme();
  const [data, setData] = useState<any>({ orders_per_day: [], top_products: [], top_sellers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (DJANGO_CONFIG.enabled) {
          const res = await djangoAdmin.analytics();
          const d = res.data || res;
          setData({
            orders_per_day: (d.orders_per_day || []).map((o: any) => ({
              day: new Date(o.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              revenue: parseFloat(o.revenue || 0), orders: o.count,
            })),
            top_products: d.top_products || [],
            top_sellers: d.top_sellers || [],
          });
        } else {
          const days = Array.from({ length: 30 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          });
          setData({
            orders_per_day: days.map(day => ({ day, revenue: Math.floor(Math.random() * 1000) + 100, orders: Math.floor(Math.random() * 20) + 1 })),
            top_products: Array.from({ length: 5 }).map((_, i) => ({ name: `Product ${i + 1}`, total_qty: Math.floor(Math.random() * 100) + 10 })),
            top_sellers: Array.from({ length: 5 }).map((_, i) => ({ seller_name: `Seller ${i + 1}`, avg_rating: (4 + Math.random()).toFixed(1) })),
          });
        }
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const ttConfig = { contentStyle: { borderRadius: '10px', border: '1px solid hsl(var(--border))' } };
  const pieData = data.top_products.map((p: any) => ({ name: p.product__name || p.name, value: p.total_qty || p.value || 0 }));

  if (loading) {
    return <div className="flex items-center justify-center h-full py-20"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform performance overview</p>
      </div>

      {/* Revenue trend — 30 days */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5" style={{ color: theme.accent }} />
          <h2 className="font-semibold text-slate-900 dark:text-white">Revenue — Last 30 Days</h2>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.orders_per_day} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} interval={4} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${v}`} />
              <RechartsTooltip {...ttConfig} formatter={(v: any) => [`$${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke={theme.accent} strokeWidth={2} fill="url(#analyticsRev)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders per day — bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5" style={{ color: theme.accent }} />
            <h2 className="font-semibold text-slate-900 dark:text-white">Daily Order Volume</h2>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.orders_per_day.slice(-14)} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <RechartsTooltip {...ttConfig} cursor={{ fill: 'rgba(148,163,184,.08)' }} />
                <Bar dataKey="orders" fill={theme.accent} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top products donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-6">Top Products by Units Sold</h2>
          {pieData.length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  <RechartsTooltip {...ttConfig} />
                  <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-slate-500 dark:text-slate-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">No product data yet</div>
          )}
        </div>
      </div>

      {/* Top sellers table */}
      {data.top_sellers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Top Sellers by Rating</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Rank</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Seller</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.top_sellers.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-bold text-slate-400">#{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.seller_name || s.user__name || `Seller ${i + 1}`}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${(parseFloat(s.avg_rating) / 5) * 100}%` }} />
                        </div>
                        <span className="text-amber-500 font-semibold">⭐ {parseFloat(s.avg_rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
