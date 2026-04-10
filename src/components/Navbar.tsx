import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, ShoppingBag, ChevronDown, Heart, Grid3X3, Smartphone, Shirt, Home, Dumbbell, Sparkles, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

const categories = [
  { name: 'Electronics', icon: Smartphone, color: 'text-info' },
  { name: 'Fashion', icon: Shirt, color: 'text-primary' },
  { name: 'Home & Garden', icon: Home, color: 'text-accent' },
  { name: 'Sports', icon: Dumbbell, color: 'text-success' },
  { name: 'Beauty', icon: Sparkles, color: 'text-warning' },
  { name: 'Toys & Games', icon: Gamepad2, color: 'text-destructive' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { isAuthenticated, user, cart, searchQuery, setSearchQuery } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground text-xs hidden md:block">
        <div className="container-main flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <span className="font-medium">Free Shipping on orders over $50</span>
            <span className="opacity-40">|</span>
            <Link to="/help" className="hover:underline transition">Help Center</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/how-to-sell" className="hover:underline transition"><Link to="/how-to-sell" className="hover:underline transition">Sell on Tha Buyer</Link></Link>
            <Link to="/about" className="hover:underline transition">About Us</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container-main">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl hidden sm:block">The Buyer</span>
            </Link>

            {/* Categories button */}
            <div className="relative hidden lg:block" ref={megaRef}>
              <button
                onClick={() => setMegaOpen(!megaOpen)}
                className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                <Grid3X3 className="w-4 h-4" />
                Categories
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
              </button>

              {megaOpen && (
                <div className="absolute top-full left-0 mt-2 w-[500px] bg-card border rounded-xl shadow-2xl p-5 z-50 animate-fade-in">
                  <h3 className="font-display font-semibold text-sm mb-3 text-muted-foreground">Browse Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(({ name, icon: Icon, color }) => (
                      <button
                        key={name}
                        onClick={() => {
                          setSearchQuery(name);
                          setMegaOpen(false);
                          navigate(`/search?q=${name}`);
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition text-left group"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-[10px] text-muted-foreground">Browse products</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Link to="/search" onClick={() => setMegaOpen(false)} className="text-sm text-primary font-medium hover:underline">
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full flex rounded-lg overflow-hidden border-2 border-transparent focus-within:border-primary transition-colors">
                <input
                  type="text"
                  placeholder="Search products, brands, stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm bg-secondary/60 focus:outline-none placeholder:text-muted-foreground/60"
                />
                <Button type="submit" className="rounded-none px-5 shrink-0">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <ThemeToggle />

              <Link to="/search" className="relative p-2 rounded-lg hover:bg-secondary transition hidden sm:flex">
                <Heart className="w-5 h-5" />
              </Link>

              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Link to={user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/buyer'}>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-10">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-[10px] text-muted-foreground leading-none">Welcome</p>
                        <p className="text-xs font-medium leading-tight">{user?.fullName?.split(' ')[0]}</p>
                      </div>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm" className="text-xs h-10">Log In</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button size="sm" className="text-xs h-10 shadow-md shadow-primary/20">Sign Up</Button>
                  </Link>
                </div>
              )}

              <Link to="/cart" className="relative p-2.5 rounded-lg hover:bg-secondary transition">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse-soft">
                    {cart.length}
                  </span>
                )}
              </Link>

              <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-card animate-fade-in">
            <div className="container-main py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative flex rounded-lg overflow-hidden border">
                  <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 pl-4 pr-4 py-3 text-sm bg-background focus:outline-none" />
                  <Button type="submit" className="rounded-none px-4"><Search className="w-4 h-4" /></Button>
                </div>
              </form>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Categories</p>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(({ name, icon: Icon, color }) => (
                    <button key={name} onClick={() => { setSearchQuery(name); setMobileOpen(false); navigate(`/search?q=${name}`); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-center transition">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-[10px] font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 border-t pt-3">
                {isAuthenticated ? (
                  <>
                    <Link to={user?.role === 'seller' ? '/seller' : '/buyer'} className="px-3 py-2.5 rounded-md hover:bg-secondary text-sm font-medium" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
                    <button className="px-3 py-2.5 rounded-md hover:bg-secondary text-sm text-left font-medium" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" className="px-3 py-2.5 rounded-md hover:bg-secondary text-sm font-medium" onClick={() => setMobileOpen(false)}>Log In</Link>
                    <Link to="/auth/signup" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full mt-1">Create Account</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
