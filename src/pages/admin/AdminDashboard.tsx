import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { toast } from 'sonner';
import type { User } from '@/types';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, activeStores: 0, pendingReviews: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminMetrics(), api.getAdminUsers()]).then(([m, u]) => {
      setMetrics(m);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const toggleUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    toast.success('User status updated');
  };

  return (
    <div className="container-main py-8">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), icon: Users, color: 'text-primary' },
          { label: 'Products', value: metrics.totalProducts.toLocaleString(), icon: Package, color: 'text-info' },
          { label: 'Orders', value: metrics.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-warning' },
          { label: 'Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <Icon className={`w-6 h-6 ${color} mb-2`} />
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-display font-semibold">User Management</h2>
          <Badge variant="outline">{users.length} users</Badge>
        </div>
        {loading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-secondary/30"><th className="text-left p-3 font-medium">Name</th><th className="text-left p-3 font-medium">Email</th><th className="text-left p-3 font-medium">Role</th><th className="text-left p-3 font-medium">Status</th><th className="text-right p-3 font-medium">Actions</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-secondary/20">
                    <td className="p-3 font-medium">{user.fullName}</td>
                    <td className="p-3 text-muted-foreground">{user.email}</td>
                    <td className="p-3"><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></td>
                    <td className="p-3"><Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleUser(user.id)}>
                        {user.isActive ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                      </Button>
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
