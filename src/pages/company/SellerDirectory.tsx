import { useState, useEffect } from 'react';
import { Star, ShieldCheck, Store } from 'lucide-react';
import { api } from '@/services/api';
import type { SellerProfile } from '@/types';

export default function SellerDirectory() {
  const [stores, setStores] = useState<SellerProfile[]>([]);
  useEffect(() => { api.getStores().then(setStores); }, []);

  return (
    <div className="container-main py-16">
      <h1 className="font-display text-3xl font-bold mb-8">Seller Directory</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="rounded-xl border bg-card p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Store className="w-6 h-6 text-primary" /></div>
              <div>
                <h3 className="font-display font-semibold">{store.businessName}</h3>
                {store.isVerified && <span className="text-xs text-info flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Verified</span>}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{store.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-star text-star" />{store.rating}</span>
              <span className="text-muted-foreground">{store.totalSales.toLocaleString()} sales</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
