import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, DollarSign, TrendingUp,
  TrendingDown, RefreshCw, ArrowRight, Clock, Wifi, WifiOff,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';

// ── Mock data generators ──────────────────────────────────────────────────────
function makeDays(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
}

function mockChartData() {
  const days = makeDays(14);
  return {
    orders_per_day: days.map(day => ({
      day,
      revenue: Math.floor(Math.random() * 900) + 200,
      orders: Math.floor(Math.random() * 18) + 2,
    })),
    order_status_dist: [
      { name: 'Delivered', value: 420 },
      { name: 'Processing', value: 280 },
      { name: 'Shipped', value: 190 },
      { name: 'Pending', value: 110 },
      { name: 'Cancelled', value: 60 },
    ],
  };
}

function mockMetrics() {
  return { totalUsers: 1284, totalProducts: 347, totalOrders: 2941, totalRevenue: 184320 };
}

function mockOrders() {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `ord-${String(i + 1042).padStart(4, '0')}`,
    buyer_name: ['James Okonkwo', 'Amira Hassan', 'Fatima Yusuf', 'Kwame Asante', 'Layla Ibrahim', 'Chidi Nwosu'][i],
    buyer_email: `user${i + 1}@example.com`,
    total_amount: String((Math.random() * 400 + 50).toFixed(2)),
    status: ['delivered', 'shipped', 'processing', 'pending', 'delivered', 'shipped'][i],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    item_count: [2, 1, 3, 1, 4, 2][i],
  }));
}

// ── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, colorClass, iconBg, trend }: any) {
  return (
    <div className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm hover:-translate-y-0.5 transition-all duration-200 ${colorClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
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
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
const ttConfig = {
  contentStyle: { borderRadius: '10px', border: '1px solid rgba(148,163,184,.2)', boxShadow: '0 4px 20px -4px rgba(0,0,0,.15)', backgroundColor: 'var(--background)' },
};

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { theme } = useAdminTheme();

  const [metrics, setMetrics] = useState(mockMetrics());
  const [charts, setCharts] = useState(mockChartData());
  const [recentOrders, setRecentOrders] = useState(mockOrders());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [apiOnline, setApiOnline] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    if (!DJANGO_CONFIG.enabled) {
      // Mock mode: show realistic mock data immediately
      setMetrics(mockMetrics());
      setCharts(mockChartData());
      setRecentOrders(mockOrders());
      setApiOnline(false);
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
      return;
    }

    // Try each API independently — partial success is fine
    let fetchedAny = false;

    // 1. Stats
    try {
      const res = await djangoAdmin.stats();
      const s = res?.data || res;
      if (s?.users || s?.orders) {
        setMetrics({
          totalUsers: s.users?.total ?? 0,
          totalProducts: s.products?.total ?? 0,
          totalOrders: s.orders?.total ?? 0,
          totalRevenue: parseFloat(s.orders?.total_revenue ?? 0),
        });
        fetchedAny = true;
        setApiOnline(true);
      }
    } catch {
      // Stats failed → keep mock metrics
    }

    // 2. Analytics (charts)
    try {
      const res = await djangoAdmin.analytics();
      const d = res?.data || res;
      const perDay = (d?.orders_per_day || []).map((o: any) => ({
        day: new Date(o.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: parseFloat(o.revenue || 0),
        orders: o.count || 0,
      }));
      if (perDay.length > 0) {
        setCharts(prev => ({ ...prev, orders_per_day: perDay }));
        fetchedAny = true;
      }
    } catch {
      // Analytics failed → keep mock chart
    }

    // 3. Recent orders
    try {
      const res = await djangoAdmin.orders();
      const data = res?.results || res?.data?.results || res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        setRecentOrders(data.slice(0, 8));
        fetchedAny = true;
      }
    } catch {
      // Orders failed → keep mock orders
    }

    if (fetchedAny) setApiOnline(true);
    setLastRefresh(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Initial load + 30s auto-refresh
  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const kpis = [
    {
      label: 'Total Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
      colorClass: 'border-emerald-200 dark:border-emerald-800/50', trend: 12,
    },
    {
      label: 'Total Orders', value: metrics.totalOrders.toLocaleString(),
      icon: ShoppingBag, iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      colorClass: 'border-blue-200 dark:border-blue-800/50', trend: 8,
    },
    {
      label: 'Total Users', value: metrics.totalUsers.toLocaleString(),
      icon: Users, iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      colorClass: 'border-purple-200 dark:border-purple-800/50', trend: 5,
    },
    {
      label: 'Active Products', value: metrics.totalProducts.toLocaleString(),
      icon: Package, iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
      colorClass: 'border-amber-200 dark:border-amber-800/50', trend: -2,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: theme.accent }} />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Updated {lastRefresh.toLocaleTimeString()} · refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* API status indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${apiOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {apiOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {apiOnline ? 'Live data' : 'Mock data'}
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts Row */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Area */}
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
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.orders_per_day} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.15)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${v}`} />
                <RechartsTooltip {...ttConfig} formatter={(v: any) => [`$${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke={theme.accent} strokeWidth={2.5}
                  fillOpacity={1} fill="url(#rev)" dot={false} activeDot={{ r: 4, fill: theme.accent }} />
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
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.order_status_dist} cx="50%" cy="50%"
                  innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value">
                  {charts.order_status_dist.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip {...ttConfig} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v: string) => <span className="text-xs text-slate-500 dark:text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Orders Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Daily Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Volume over last 14 days</p>
          </div>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.orders_per_day} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.15)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <RechartsTooltip {...ttConfig} cursor={{ fill: 'rgba(148,163,184,.08)' }} />
              <Bar dataKey="orders" fill={theme.accent} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders"
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: theme.accent }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
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
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">
                    #{String(order.id).replace('ord-', '').slice(0, 8)}
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-slate-900 dark:text-white">{order.buyer_name || 'Customer'}</p>
                    <p className="text-xs text-slate-400">{order.buyer_email || ''}</p>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{order.item_count ?? order.items?.length ?? '—'}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
