import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Star, Heart, ShoppingBag, Truck, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';
import { toast } from 'sonner';
import type { Order } from '@/types';

const mockWishlist = [
  { id: '2', name: 'MacBook Pro 16" M3 Max', price: 3399, store: 'AppleZone', category: 'Electronics' },
  { id: '6', name: 'iPad Air M2', price: 599, store: 'AppleZone', category: 'Electronics' },
  { id: '4', name: 'Nike Air Max 270', price: 150, store: 'SneakerSpot', category: 'Fashion' },
];

const mockReviews = [
  { id: 'r1', productName: 'Samsung Galaxy S24 Ultra', rating: 5, comment: 'Amazing phone!', date: '2024-03-01' },
  { id: 'r2', productName: 'Sony WH-1000XM5', rating: 4, comment: 'Excellent noise cancellation.', date: '2024-02-20' },
];

const statusConfig = {
  pending: { icon: ShoppingBag, label: 'Pending', color: 'text-warning' },
  confirmed: { icon: CheckCircle, label: 'Confirmed', color: 'text-info' },
  shipped: { icon: Truck, label: 'Shipped', color: 'text-primary' },
  delivered: { icon: CheckCircle, label: 'Delivered', color: 'text-success' },
  cancelled: { icon: Package, label: 'Cancelled', color: 'text-destructive' },
};

export default function BuyerDashboard() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getOrders(user?.id)
      .then(setOrders)
      .catch(err => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="container-main py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user?.fullName || 'My Account'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email || 'buyer@example.com'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: 'Orders', value: orders.length, color: 'text-primary' },
          { icon: Star, label: 'Reviews', value: mockReviews.length, color: 'text-star' },
          { icon: Heart, label: 'Wishlist', value: mockWishlist.length, color: 'text-destructive' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <p className="font-display text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading orders...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start shopping to see your orders here!</p>
              <Link to="/search"><Button size="sm" className="mt-4">Browse Products</Button></Link>
            </div>
          ) : (
            orders.map(order => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              return (
                <div key={order.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                        {config.label}
                      </Badge>
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleCancelOrder(order.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-t text-sm">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div>
                          <Link to={`/product/${item.productId}`} className="font-medium hover:text-primary transition">{item.productName}</Link>
                          <p className="text-xs text-muted-foreground">from {item.storeName} · Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold">${item.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t mt-2">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-display font-bold">${order.totalAmount}</span>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-3">
          {mockReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">Purchase and review products to see them here.</p>
            </div>
          ) : (
            mockReviews.map(review => (
              <div key={review.id} className="rounded-xl border bg-card p-5">
                <p className="font-medium text-sm mb-1">{review.productName}</p>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-star text-star' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-3">
          {mockWishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="font-medium">Wishlist is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Save items you love to find them easily later.</p>
            </div>
          ) : (
            mockWishlist.map(item => (
              <Link key={item.id} to={`/product/${item.id}`} className="rounded-xl border bg-card p-4 flex items-center justify-between card-hover block">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · {item.store}</p>
                </div>
                <span className="font-display font-bold text-primary">${item.price}</span>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
