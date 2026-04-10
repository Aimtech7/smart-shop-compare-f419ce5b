import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import type { Product, StoreListing } from '@/types';

interface Props {
  product: Product & { listings: StoreListing[] };
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addToCart = useStore(s => s.addToCart);

  const lowest = product.listings.reduce((a, b) => a.price < b.price ? a : b);
  const discount = lowest.originalPrice
    ? Math.round(((lowest.originalPrice - lowest.price) / lowest.originalPrice) * 100)
    : 0;
  const avgRating = (product.listings.reduce((s, l) => s + l.sellerRating, 0) / product.listings.length).toFixed(1);
  const imgSrc = !imgError && product.images[0] ? product.images[0] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id, listingId: lowest.id, storeName: lowest.storeName,
      productName: product.name, productImage: product.images[0] || '', price: lowest.price,
      quantity: 1, sellerId: lowest.sellerId,
    });
    toast.success(`Added "${product.name}" to cart`);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (variant === 'horizontal') {
    return (
      <Link to={`/product/${product.id}`} className="flex gap-4 p-3 rounded-lg border bg-card hover:shadow-md transition group">
        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-secondary">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No Image</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-star text-star" />
            <span className="text-xs text-muted-foreground">{avgRating}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-display font-bold text-primary">${lowest.price}</span>
            {lowest.originalPrice && <span className="text-xs text-muted-foreground line-through">${lowest.originalPrice}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="block rounded-lg border bg-card overflow-hidden group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-secondary ${variant === 'compact' ? 'h-32' : 'h-44 sm:h-52'}`}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-sm">No Image</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">-{discount}%</span>}
          {product.listings.length > 2 && (
            <span className="bg-info text-info-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {product.listings.length} stores
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWish}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWished ? 'bg-destructive text-destructive-foreground' : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-card hover:text-destructive'
          } ${isHovered || isWished ? 'opacity-100' : 'opacity-0'}`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick actions overlay */}
        <div className={`absolute inset-x-0 bottom-0 p-2 flex gap-1 justify-center transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button size="sm" onClick={handleAddToCart} className="text-xs h-8 shadow-lg gap-1">
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
          </Button>
          <Button size="sm" variant="secondary" className="text-xs h-8 shadow-lg gap-1">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className={`${variant === 'compact' ? 'p-2.5' : 'p-3 sm:p-4'}`}>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{product.category}</p>
        <h3 className={`font-medium mt-0.5 line-clamp-2 ${variant === 'compact' ? 'text-xs min-h-[2rem]' : 'text-sm min-h-[2.5rem]'}`}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={`w-3 h-3 ${star <= Math.round(Number(avgRating)) ? 'fill-star text-star' : 'text-muted-foreground/30'}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({avgRating})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`font-display font-bold text-primary ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
            ${lowest.price.toLocaleString()}
          </span>
          {lowest.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">${lowest.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Store info */}
        <p className="text-[10px] text-muted-foreground mt-1.5">
          from <span className="font-medium text-foreground/70">{lowest.storeName}</span>
          {product.listings.length > 1 && <span> + {product.listings.length - 1} more</span>}
        </p>
      </div>
    </Link>
  );
}
