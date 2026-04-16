import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, ChevronDown, Heart, Grid3X3, Smartphone, Shirt, Home, Dumbbell, Sparkles, Gamepad2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoImg from '@/assets/logo.jpg';

const categories = [
  { name: 'Electronics', icon: Smartphone, color: 'text-info' },
  { name: 'Fashion', icon: Shirt, color: 'text-primary' },
  { name: 'Home & Garden', icon: Home, color: 'text-accent' },
  { name: 'Sports', icon: Dumbbell, color: 'text-success' },
  { name: 'Beauty', icon: Sparkles, color: 'text-warning' },
  { name: 'Toys & Games', icon: Gamepad2, color: 'text-destructive' },
];

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/search', hasDropdown: true },
  { label: 'Best Deals', to: '/search?q=deals' },
  { label: 'Reviews', to: '/search?q=reviews' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const { isAuthenticated, user, cart, searchQuery, setSearchQuery } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const megaRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (signInRef.current && !signInRef.current.contains(e.target as Node)) setSignInOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Main nav - dark themed like reference */}
      <nav className="sticky top-0 z-50 bg-[hsl(var(--foreground))] text-[hsl(var(--background))]">
        <div className="container-main">
          <div className="flex items-center h-14 gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logoImg} alt="Tha Buyer" className="h-9 w-auto rounded-lg" />
              <div className="hidden sm:block">
                <span className="font-display font-bold text-lg leading-none">THA BUYER</span>
                <p className="text-[8px] opacity-60 tracking-wider">Multi-Store · Price Comparison · E-Commerce</p>
              </div>
            </Link>

            {/* Center nav links - desktop */}
            <div className="hidden lg:flex items-center gap-1 ml-auto">
              {navLinks.map((link) => (
                <div key={link.label} className="relative" ref={link.hasDropdown ? megaRef : undefined}>
                  {link.hasDropdown ? (
                    <button
                      onClick={() => setMegaOpen(!megaOpen)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100 transition"
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={link.to}
                      className="px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100 transition"
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Categories dropdown */}
                  {link.hasDropdown && megaOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[500px] bg-card text-foreground border rounded-xl shadow-2xl p-5 z-50 animate-fade-in">
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
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              <ThemeToggle />

              {/* Search toggle */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-white/10 transition">
                <Search className="w-5 h-5" />
              </button>

              <Link to="/search" className="relative p-2 rounded-lg hover:bg-white/10 transition hidden sm:flex">
                <Heart className="w-5 h-5" />
              </Link>

              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Link to={user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/buyer'}>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-10 text-[hsl(var(--background))] hover:bg-white/10">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-[10px] opacity-60 leading-none">Welcome</p>
                        <p className="text-xs font-medium leading-tight">{user?.fullName?.split(' ')[0]}</p>
                      </div>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-[hsl(var(--background))] hover:bg-white/10" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center relative" ref={signInRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSignInOpen(!signInOpen)}
                    className="text-xs h-10 gap-1 text-[hsl(var(--background))] hover:bg-white/10"
                  >
                    Sign Up
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${signInOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  {signInOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card text-foreground border rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                      <Link
                        to="/auth/signup?role=buyer"
                        onClick={() => setSignInOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition text-sm"
                      >
                        <User className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">User</p>
                          <p className="text-[10px] text-muted-foreground">Shop & compare prices</p>
                        </div>
                      </Link>
                      <Link
                        to="/auth/signup?role=seller"
                        onClick={() => setSignInOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition text-sm"
                      >
                        <Store className="w-4 h-4 text-accent" />
                        <div>
                          <p className="font-medium">Seller</p>
                          <p className="text-[10px] text-muted-foreground">Open your store</p>
                        </div>
                      </Link>
                      <div className="border-t mt-1 pt-1">
                        <Link
                          to="/auth/login"
                          onClick={() => setSignInOpen(false)}
                          className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                        >
                          Already have an account? <span className="text-primary font-medium">Sign In</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link to="/cart" className="relative p-2.5 rounded-lg hover:bg-white/10 transition">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse-soft">
                    {cart.length}
                  </span>
                )}
              </Link>

              <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-white/10 bg-[hsl(var(--foreground))] animate-fade-in">
            <div className="container-main py-3">
              <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search products, brands, stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm bg-white/10 text-[hsl(var(--background))] focus:outline-none placeholder:text-white/40"
                  autoFocus
                />
                <Button type="submit" className="rounded-none px-5 shrink-0">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[hsl(var(--foreground))] animate-fade-in">
            <div className="container-main py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative flex rounded-lg overflow-hidden">
                  <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 pl-4 pr-4 py-3 text-sm bg-white/10 text-[hsl(var(--background))] focus:outline-none placeholder:text-white/40" />
                  <Button type="submit" className="rounded-none px-4"><Search className="w-4 h-4" /></Button>
                </div>
              </form>

              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.to} className="px-3 py-2.5 rounded-md hover:bg-white/10 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold opacity-40 mb-2 uppercase tracking-wider">Categories</p>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(({ name, icon: Icon, color }) => (
                    <button key={name} onClick={() => { setSearchQuery(name); setMobileOpen(false); navigate(`/search?q=${name}`); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-center transition">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-[10px] font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                {isAuthenticated ? (
                  <>
                    <Link to={user?.role === 'seller' ? '/seller' : '/buyer'} className="px-3 py-2.5 rounded-md hover:bg-white/10 text-sm font-medium" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
                    <button className="px-3 py-2.5 rounded-md hover:bg-white/10 text-sm text-left font-medium" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" className="px-3 py-2.5 rounded-md hover:bg-white/10 text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
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
