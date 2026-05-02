import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, RefreshCw } from 'lucide-react';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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

export default function OrdersPage() {
  const { theme } = useAdminTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        if (DJANGO_CONFIG.enabled) {
          const res = await djangoAdmin.orders();
          const data = res.results || res.data?.results || res.data || [];
          setOrders(Array.isArray(data) ? data : []);
        } else {
          // Mock orders
          setOrders(Array.from({ length: 12 }).map((_, i) => ({
            id: `ord-${i + 1}`, buyer_name: `Customer ${i + 1}`, buyer_email: `user${i + 1}@demo.com`,
            total_amount: (Math.random() * 500 + 50).toFixed(2),
            status: STATUS_OPTIONS[Math.floor(Math.random() * (STATUS_OPTIONS.length - 1)) + 1],
            created_at: new Date(Date.now() - i * 86400000).toISOString(),
            item_count: Math.floor(Math.random() * 5) + 1,
          })));
        }
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search || [o.buyer_name, o.buyer_email, o.id].some(v =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, customer…"
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={statusFilter === s ? { backgroundColor: theme.accent } : {}}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{String(order.id).slice(0, 8)}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{order.buyer_name || 'Customer'}</p>
                      <p className="text-xs text-slate-400">{order.buyer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{order.item_count || order.items?.length || '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: theme.accent }}
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
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
