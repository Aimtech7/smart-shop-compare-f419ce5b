import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';
import { StoreListingCard } from '@/components/StoreListingCard';
import { ReviewCard } from '@/components/ReviewCard';
import { SkeletonList } from '@/components/SkeletonCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Product, StoreListing, Review, PriceHistory, AIRecommendation } from '@/types';
import { toast } from 'sonner';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<(Product & { listings: StoreListing[] }) | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getProduct(id), api.getReviews(id), api.getPriceHistory(id)]).then(([p, r, h]) => {
      setProduct(p);
      setReviews(r);
      setPriceHistory(h);
      setLoading(false);
    });
  }, [id]);

  const findBestValue = async () => {
    if (!id) return;
    setAiLoading(true);
    const rec = await api.getAIRecommendation(id);
    setAiRec(rec);
    setAiLoading(false);
  };

  const submitReview = () => {
    if (newRating === 0) { toast.error('Please select a rating'); return; }
    const review: Review = { id: `r-${Date.now()}`, productId: id!, userId: 'u1', userName: 'You', rating: newRating, comment: newComment, isVerifiedBuyer: true, createdAt: new Date().toISOString() };
    setReviews([review, ...reviews]);
    setNewRating(0);
    setNewComment('');
    toast.success('Review submitted!');
  };

  if (loading) return <div className="container-main py-8"><SkeletonList count={2} /></div>;
  if (!product) return <div className="container-main py-20 text-center"><h2 className="font-display text-xl">Product not found</h2></div>;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

  return (
    <div className="container-main py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="h-64 sm:h-80 bg-secondary overflow-hidden">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">No Image</div>
              )}
            </div>
            <div className="p-6">
              <p className="text-xs text-muted-foreground mb-1">{product.category} · SKU: {product.sku}</p>
              <h1 className="font-display text-2xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-4">{product.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-star text-star" />{avgRating} ({reviews.length} reviews)</span>
                <span>{product.listings.length} stores</span>
              </div>
            </div>
          </div>

          {/* Price History Chart */}
          {priceHistory.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-display font-semibold mb-4">Price History</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceHistory.map(h => ({ date: new Date(h.recordedAt).toLocaleDateString(), price: h.price }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-display font-semibold mb-4">Reviews</h2>
            <div className="mb-6 p-4 rounded-lg border bg-secondary/30">
              <p className="text-sm font-medium mb-2">Write a Review</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setNewRating(i + 1)}>
                    <Star className={`w-5 h-5 transition ${i < newRating ? 'fill-star text-star' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} className="mb-3" />
              <Button size="sm" onClick={submitReview}>Submit Review</Button>
            </div>
            <div className="space-y-3">
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
              {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>}
            </div>
          </div>
        </div>

        {/* Sidebar - Store Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Compare Prices</h2>
            <Button variant="outline" size="sm" onClick={findBestValue} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}Best Value
            </Button>
          </div>

          {aiRec && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-accent" /><span className="text-sm font-semibold">AI Pick: {aiRec.storeName}</span></div>
              <p className="text-xs text-muted-foreground">{aiRec.reason}</p>
            </div>
          )}

          <div className="space-y-2">
            {product.listings.map(l => <StoreListingCard key={l.id} listing={l} productName={product.name} productImage={product.images[0] || ''} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
