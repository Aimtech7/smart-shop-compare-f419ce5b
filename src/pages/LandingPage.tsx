import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Star, ShieldCheck, ShoppingBag, ArrowRight, Flame, ChevronRight, Clock, Smartphone, Shirt, Home as HomeIcon, Dumbbell, Sparkles, Gamepad2, Headphones, Send, Truck, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';
import { SkeletonList } from '@/components/SkeletonCard';
import { ProductCard } from '@/components/ProductCard';
import { HeroBanner } from '@/components/HeroBanner';
import { CountdownTimer } from '@/components/CountdownTimer';
import type { SellerProfile, Product, StoreListing } from '@/types';

const categoryGrid = [
  { name: 'Electronics', icon: Smartphone, color: 'bg-info/10 text-info', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80' },
  { name: 'Fashion', icon: Shirt, color: 'bg-primary/10 text-primary', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80' },
  { name: 'Home & Garden', icon: HomeIcon, color: 'bg-accent/10 text-accent', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80' },
  { name: 'Sports', icon: Dumbbell, color: 'bg-success/10 text-success', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba5b17c3?w=300&q=80' },
  { name: 'Beauty', icon: Sparkles, color: 'bg-warning/10 text-warning', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80' },
  { name: 'Audio', icon: Headphones, color: 'bg-info/10 text-info', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80' },
  { name: 'Toys & Games', icon: Gamepad2, color: 'bg-destructive/10 text-destructive', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&q=80' },
  { name: 'All Categories', icon: ArrowRight, color: 'bg-secondary text-foreground', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80' },
];

const brands = ['Samsung', 'Apple', 'Sony', 'Nike', 'Dyson', 'LG', 'Adidas', 'Bose'];

export default function LandingPage() {
  const [topStores, setTopStores] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<(Product & { listings: StoreListing[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const { searchQuery, setSearchQuery } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getTopStores(), api.getProducts()]).then(([stores, prods]) => {
      setTopStores(stores);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container-main pt-6 pb-4">
        <div className="grid lg:grid-cols-[240px_1fr] gap-5">
          <div className="hidden lg:block rounded-xl border bg-card p-4">
            <h3 className="font-display font-semibold text-sm mb-3">Categories</h3>
            <div className="space-y-0.5">
              {categoryGrid.slice(0, 7).map(({ name, icon: Icon, color, image }) => (
                <button
                  key={name}
                  onClick={() => { setSearchQuery(name); navigate(`/search?q=${name}`); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition text-left text-sm group"
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden shrink-0">
                    <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className="group-hover:text-primary transition">{name}</span>
                </button>
              ))}
              <Link to="/search" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition text-sm text-primary font-medium mt-2">
                <ArrowRight className="w-4 h-4" /> View All
              </Link>
            </div>
          </div>
          <HeroBanner />
        </div>
      </section>

      {/* Mobile search */}
      <section className="container-main py-3 md:hidden">
        <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden border-2 border-transparent focus-within:border-primary transition">
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 text-sm bg-secondary/60 focus:outline-none" />
          <Button type="submit" className="rounded-none px-5"><Search className="w-4 h-4" /></Button>
        </form>
      </section>

      {/* Categories Grid - Mobile */}
      <section className="container-main py-4 lg:hidden">
        <div className="grid grid-cols-4 gap-3">
          {categoryGrid.map(({ name, icon: Icon, color, image }) => (
            <button key={name} onClick={() => { setSearchQuery(name); navigate(`/search?q=${name}`); }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-secondary/60 transition relative overflow-hidden group">
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center overflow-hidden`}>
                <img src={image} alt={name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition absolute inset-0" loading="lazy" />
                <Icon className="w-5 h-5 relative z-10 drop-shadow" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">{name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y bg-card">
        <div className="container-main py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: Shield, title: 'Buyer Protection', desc: 'Secure payments' },
              { icon: BarChart3, title: '240+ Stores', desc: 'Compare across vendors' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-xs">{title}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="py-8">
        <div className="container-main">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="bg-gradient-to-r from-destructive to-primary px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-primary-foreground" />
                <h2 className="font-display font-bold text-primary-foreground text-base sm:text-lg">Flash Sale</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary-foreground/80 text-xs hidden sm:block">Ends in:</span>
                <CountdownTimer />
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {loading ? <SkeletonList count={6} /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {products.slice(0, 6).map(p => (
                    <ProductCard key={p.id} product={p} variant="compact" />
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 pb-4 text-right">
              <Link to="/search" className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1">
                See All Deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Featured Products
          </h2>
          <Link to="/search" className="text-sm text-primary flex items-center gap-1 hover:underline font-semibold">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? <SkeletonList /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* AI Recommended */}
      <section className="bg-secondary/40 py-8">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Recommended For You
            </h2>
            <Link to="/search" className="text-sm text-primary flex items-center gap-1 hover:underline font-semibold">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? <SkeletonList /> : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...products].reverse().slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Banners */}
      <section className="container-main py-8">
        <h2 className="section-heading mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryGrid.slice(0, 4).map(({ name, image }) => (
            <button key={name} onClick={() => { setSearchQuery(name); navigate(`/search?q=${name}`); }}
              className="relative h-40 rounded-xl overflow-hidden group">
              <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white font-display font-bold text-sm">{name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Top Rated Stores */}
      <section className="container-main py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">Top Rated Stores</h2>
          <Link to="/sellers" className="text-sm text-primary flex items-center gap-1 hover:underline font-semibold">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        {loading ? <SkeletonList count={4} /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {topStores.map(store => (
              <div key={store.id} className="rounded-xl border bg-card card-hover overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-primary/10 via-accent/5 to-info/10" />
                <div className="p-4 -mt-8">
                  <div className="w-14 h-14 rounded-xl bg-card border-2 shadow-lg flex items-center justify-center mb-3">
                    <ShoppingBag className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-sm">{store.businessName}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{store.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-star text-star" />{store.rating}</span>
                    <span className="text-muted-foreground">{store.totalSales.toLocaleString()} sales</span>
                  </div>
                  {store.isVerified && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Added */}
      <section className="container-main pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Recently Added</h2>
          <Link to="/search" className="text-sm text-primary flex items-center gap-1 hover:underline font-semibold">Browse All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        {loading ? <SkeletonList /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Brands Carousel */}
      <section className="border-y bg-card py-8">
        <div className="container-main">
          <h2 className="section-heading text-center mb-6">Shop by Brand</h2>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => { setSearchQuery(brand); navigate(`/search?q=${brand}`); }}
                className="px-6 py-3 rounded-xl border bg-background hover:bg-secondary hover:border-primary/30 transition font-display font-bold text-sm text-muted-foreground hover:text-foreground"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12">
        <div className="container-main">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-accent p-8 sm:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Stay in the Loop</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto text-sm">Subscribe to get exclusive deals, price drop alerts, and trending product updates.</p>
            <form onSubmit={(e) => { e.preventDefault(); setEmail(''); }} className="flex max-w-md mx-auto gap-2">
              <Input
                type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-white/40"
              />
              <Button type="submit" variant="secondary" className="shrink-0 shadow-lg gap-1">
                <Send className="w-4 h-4" /> Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container-main pb-12">
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Start Selling on The Buyer</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">Join 240+ stores and reach thousands of buyers. Set up your store in minutes.</p>
          <Link to="/auth/signup?role=seller">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <ShoppingBag className="w-4 h-4 mr-2" /> Register as Seller
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
