import { Star, ShoppingCart, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StoreListing } from '@/types';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

interface Props {
  listing: StoreListing;
  productName: string;
  productImage: string;
}

export function StoreListingCard({ listing, productName, productImage }: Props) {
  const addToCart = useStore(s => s.addToCart);

  const handleAdd = () => {
    addToCart({
      productId: listing.productId, listingId: listing.id, storeName: listing.storeName,
      productName, productImage, price: listing.price, quantity: 1, sellerId: listing.sellerId,
    });
    toast.success(`Added to cart from ${listing.storeName}`);
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition ${listing.isLowestPrice ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-secondary/50'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{listing.storeName}</span>
          {listing.isLowestPrice && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">Lowest Price</span>}
          <BadgeCheck className="w-4 h-4 text-info" />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 fill-star text-star" />
          <span>{listing.sellerRating}</span>
          <span className="mx-1">·</span>
          <span className={listing.stock > 0 ? 'text-success' : 'text-destructive'}>{listing.stock > 0 ? `${listing.stock} in stock` : 'Out of stock'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`font-display font-bold text-lg ${listing.isLowestPrice ? 'text-primary' : ''}`}>${listing.price.toLocaleString()}</p>
          {listing.originalPrice && <p className="text-xs text-muted-foreground line-through">${listing.originalPrice.toLocaleString()}</p>}
        </div>
        <Button size="sm" onClick={handleAdd} disabled={listing.stock === 0} className="shrink-0">
          <ShoppingCart className="w-4 h-4 mr-1" />Add
        </Button>
      </div>
    </div>
  );
}
