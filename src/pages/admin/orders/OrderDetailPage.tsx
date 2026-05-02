import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Truck, XCircle, Package, MapPin, CreditCard, User } from 'lucide-react';
import { djangoAdmin } from '@/services/django/admin';
import { DJANGO_CONFIG } from '@/services/django';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';

const STATUS_MAP: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAdminTheme();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (DJANGO_CONFIG.enabled) {
          const res = await djangoAdmin.order(id!);
          setOrder(res.data || res);
        } else {
          // Mock order
          setOrder({
            id, status: 'processing', total_amount: '247.99', created_at: new Date().toISOString(),
            buyer_name: 'John Doe', buyer_email: 'john@example.com', buyer_phone: '+1 (555) 123-4567',
            shipping_address: { street1: '123 Main St', city: 'San Francisco', state: 'CA', zip_code: '94105', country: 'US' },
            payment_method: 'stripe', stripe_payment_intent: 'pi_mock_123',
            items: [
              { id: '1', product_name: 'Wireless Headphones', quantity: 1, unit_price: '149.99' },
              { id: '2', product_name: 'USB-C Cable', quantity: 2, unit_price: '19.99' },
              { id: '3', product_name: 'Phone Stand', quantity: 1, unit_price: '58.02' },
            ],
          });
        }
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAction = async (action: string) => {
    setActing(action);
    try {
      if (DJANGO_CONFIG.enabled) {
        await djangoAdmin.orderAction(id!, action);
      }
      const newStatus = { mark_paid: 'processing', mark_shipped: 'shipped', mark_delivered: 'delivered', cancel: 'cancelled' }[action];
      setOrder((o: any) => ({ ...o, status: newStatus }));
      toast.success(`Order updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-400">Loading order…</div>;
  if (!order) return <div className="p-6 text-center text-red-400">Order not found</div>;

  const actions = [
    { key: 'mark_paid', label: 'Mark Paid', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-500', show: order.status === 'pending' },
    { key: 'mark_shipped', label: 'Mark Shipped', icon: Truck, color: 'bg-purple-600 hover:bg-purple-500', show: order.status === 'processing' },
    { key: 'mark_delivered', label: 'Mark Delivered', icon: Package, color: 'bg-emerald-600 hover:bg-emerald-500', show: order.status === 'shipped' },
    { key: 'cancel', label: 'Cancel Order', icon: XCircle, color: 'bg-red-600 hover:bg-red-500', show: !['delivered', 'cancelled'].includes(order.status) },
  ].filter(a => a.show);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Order #{String(order.id).slice(0, 8)}</h1>
          <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_MAP[order.status] || 'bg-slate-100 text-slate-600'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT — Order Items */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {actions.map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => handleAction(key)}
                    disabled={acting !== null}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white font-medium transition-all disabled:opacity-60 ${color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {acting === key ? 'Updating…' : label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Customer, Shipping, Payment */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4" style={{ color: theme.accent }} />
              <h3 className="font-semibold text-slate-900 dark:text-white">Customer</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900 dark:text-white">{order.buyer_name}</p>
              <p className="text-slate-500">{order.buyer_email}</p>
              {order.buyer_phone && <p className="text-slate-500">{order.buyer_phone}</p>}
            </div>
          </div>

          {/* Shipping */}
          {order.shipping_address && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                <h3 className="font-semibold text-slate-900 dark:text-white">Shipping Address</h3>
              </div>
              <div className="text-sm text-slate-500 space-y-1">
                <p>{order.shipping_address.street1}</p>
                {order.shipping_address.street2 && <p>{order.shipping_address.street2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4" style={{ color: theme.accent }} />
              <h3 className="font-semibold text-slate-900 dark:text-white">Payment</h3>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">{order.payment_method || 'Stripe'}</span>
              </div>
              {order.stripe_payment_intent && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref</span>
                  <span className="font-mono text-xs text-slate-400 truncate max-w-[130px]">{order.stripe_payment_intent}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">Total Charged</span>
                <span className="font-bold text-slate-900 dark:text-white">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
