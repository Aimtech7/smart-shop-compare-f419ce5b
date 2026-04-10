import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';
import { SkeletonList } from '@/components/SkeletonCard';
import { StoreListingCard } from '@/components/StoreListingCard';
import type { Product, StoreListing, AIRecommendation } from '@/types';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<(Product & { listings: StoreListing[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { searchQuery, setSearchQuery } = useStore();

  useEffect(() => {
    if (query) setSearchQuery(query);
    setLoading(true);
    api.getProducts({ query, sortBy: sortBy as any }).then(r => { setResults(r); setLoading(false); });
  }, [query, sortBy]);

  const findBestValue = async (productId: string) => {
    setSelectedProduct(productId);
    setAiLoading(true);
    const rec = await api.getAIRecommendation(productId);
    setAiRec(rec);
    setAiLoading(false);
  };

  return (
    <div className="container-main py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Search Results</h1>
          {query && <p className="text-sm text-muted-foreground mt-1">Showing results for "<span className="text-foreground font-medium">{query}</span>"</p>}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <SkeletonList count={6} /> : results.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">No results found</h2>
          <p className="text-muted-foreground">Try different keywords or browse categories</p>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map(product => (
            <div key={product.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/product/${product.id}`} className="sm:w-40 h-32 bg-secondary rounded-lg shrink-0 overflow-hidden">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No Image</div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                        <Link to={`/product/${product.id}`}><h3 className="font-display font-semibold text-lg hover:text-primary transition">{product.name}</h3></Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => findBestValue(product.id)} disabled={aiLoading && selectedProduct === product.id}>
                        {aiLoading && selectedProduct === product.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                        Find Best Value
                      </Button>
                    </div>

                    {selectedProduct === product.id && aiRec && (
                      <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-accent" /><span className="font-semibold text-sm">AI Recommendation</span><span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Score: {aiRec.score}/100</span></div>
                        <p className="text-sm text-muted-foreground">{aiRec.reason}</p>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">{product.listings.length} store{product.listings.length !== 1 ? 's' : ''} selling this product</p>
                      {product.listings.map(listing => (
                        <StoreListingCard key={listing.id} listing={listing} productName={product.name} productImage={product.images[0] || ''} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
