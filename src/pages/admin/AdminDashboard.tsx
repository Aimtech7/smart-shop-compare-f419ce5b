import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, DollarSign, TrendingUp,
  TrendingDown, RefreshCw, ArrowRight, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';
import { api } from '@/services/api';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B', processing: '#3B82F6', shipped: '#8B5CF6',
  delivered: '#10B981', cancelled: '#EF4444',
};
const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

function KpiCard({ label, value, icon: Icon, color, border, trend }: any) {
  return (
    <div className={`rounded-2xl border ${border} bg-white dark:bg-slate-900 p-5 shadow-sm hover:-translate-y-0.5 transition-all duration-200 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-bold text-2xl text-slate-900 dark:text-white leading-none mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const { theme } = useAdminTheme();
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [charts, setCharts] = useState<any>({ orders_per_day: [], visitors: [], order_status_dist: [] });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      if (DJANGO_CONFIG.enabled) {
        const [statsRes, analyticsRes, ordersRes] = await Promise.all([
          djangoAdmin.stats(),
          djangoAdmin.analytics(),
          djangoAdmin.orders(),
        ]);

        const s = statsRes.data || statsRes;
        setMetrics({
          totalUsers: s.users?.total ?? 0,
          totalProducts: s.products?.total ?? 0,
          totalOrders: s.orders?.total ?? 0,
          totalRevenue: parseFloat(s.orders?.total_revenue ?? 0),
        });

        const perDay = (analyticsRes.data?.orders_per_day || analyticsRes.orders_per_day || [])
          .map((o: any) => ({
            day: new Date(o.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            revenue: parseFloat(o.revenue || 0),
            orders: o.count,
            visitors: (o.count * 14) + Math.floor(Math.random() * 60),
          }));

        const topProducts = analyticsRes.data?.top_products || analyticsRes.top_products || [];
        const statusDist = [
          { name: 'Delivered', value: 0 }, { name: 'Processing', value: 0 },
          { name: 'Shipped', value: 0 }, { name: 'Pending', value: 0 }, { name: 'Cancelled', value: 0 },
        ];

        setCharts({ orders_per_day: perDay, visitors: perDay, order_status_dist: statusDist, top_products: topProducts });

        const ordersData = ordersRes.results || ordersRes.data?.results || ordersRes.data || [];
        setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 8) : []);
      } else {
        // Mock fallback
        const [m] = await Promise.all([api.getAdminMetrics()]);
        setMetrics(m as any);
        const days = Array.from({ length: 14 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (13 - i));
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        });
        setCharts({
          orders_per_day: days.map(day => ({ day, revenue: Math.floor(Math.random() * 800) + 200, orders: Math.floor(Math.random() * 15) + 1 })),
          visitors: days.map(day => ({ day, visitors: Math.floor(Math.random() * 1200) + 300 })),
          order_status_dist: [
            { name: 'Delivered', value: 420 }, { name: 'Processing', value: 280 },
            { name: 'Shipped', value: 190 }, { name: 'Pending', value: 110 }, { name: 'Cancelled', value: 60 },
          ],
        });
        setRecentOrders([]);
      }
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + 30s auto-refresh
  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: theme.accent }} />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', trend: 12 },
    { label: 'Total Orders', value: metrics.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', border: 'border-blue-200 dark:border-blue-800', trend: 8 },
    { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), icon: Users, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', border: 'border-purple-200 dark:border-purple-800', trend: 5 },
    { label: 'Active Products', value: metrics.totalProducts.toLocaleString(), icon: Package, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', border: 'border-amber-200 dark:border-amber-800', trend: -2 },
  ];

  const ttConfig = { contentStyle: { borderRadius: '10px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 20px -4px rgba(0,0,0,.1)' } };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts Row */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Revenue Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 14 days</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              <TrendingUp className="w-3 h-3 mr-1" /> +12%
            </Badge>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.orders_per_day} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${v}`} />
                <RechartsTooltip {...ttConfig} formatter={(v: any) => [`$${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke={theme.accent} strokeWidth={2.5} fillOpacity={1} fill="url(#rev)" dot={false} activeDot={{ r: 4, fill: theme.accent }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 dark:text-white">Order Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Distribution</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.order_status_dist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {charts.order_status_dist.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip {...ttConfig} />
                <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders per day bar chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Daily Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Volume over last 14 days</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.orders_per_day} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <RechartsTooltip {...ttConfig} cursor={{ fill: 'rgba(148,163,184,.08)' }} />
              <Bar dataKey="orders" fill={theme.accent} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {DJANGO_CONFIG.enabled ? 'No orders yet' : 'Connect Django API to see live orders'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">#{String(order.id).slice(0, 8)}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{order.buyer_name || order.buyer?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-400">{order.buyer_email || order.buyer?.email || ''}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{order.items?.length || order.item_count || '—'}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-3 text-slate-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
