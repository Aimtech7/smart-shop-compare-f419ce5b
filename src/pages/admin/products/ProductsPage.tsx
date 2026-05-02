import { useState, useEffect } from 'react';
import { Search, Package, RefreshCw } from 'lucide-react';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function ProductsPage() {
  const { theme } = useAdminTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (DJANGO_CONFIG.enabled) {
          const res = await djangoAdmin.products();
          const data = res.results || res.data?.results || res.data || [];
          setProducts(Array.isArray(data) ? data : []);
        } else {
          setProducts(Array.from({ length: 10 }).map((_, i) => ({
            id: `prod-${i}`, name: `Product ${i + 1}`, sku: `SKU-${1000 + i}`,
            price: (Math.random() * 200 + 20).toFixed(2), stock_qty: Math.floor(Math.random() * 100),
            is_active: Math.random() > 0.2, category_name: ['Electronics', 'Fashion', 'Home'][i % 3],
            seller_name: `Seller ${(i % 3) + 1}`,
          })));
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter(p =>
    !search || [p.name, p.SKU || p.sku, p.seller_name].some(v =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} total products</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 flex gap-3 items-center shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, seller…"
            className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Product', 'SKU', 'Category', 'Seller', 'Price', 'Stock', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white truncate max-w-[160px]">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.SKU || p.sku || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.category_name || p.category?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.seller_name || p.seller?.user?.name || '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">${parseFloat(p.price || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-medium ${(p.stock_qty || 0) <= 5 ? 'text-red-500' : (p.stock_qty || 0) <= 20 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p.stock_qty ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">No products found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
