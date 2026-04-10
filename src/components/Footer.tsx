import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, ShieldCheck, CreditCard, Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-main py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl"><span className="font-display font-bold text-xl">Tha Buyer</span>
            </div>
            <p className="text-xs text-background/50 mb-2 font-semibold">Shop Smart, Live Better</p>
            <p className="text-xs text-background/50 mb-5 max-w-[220px] leading-relaxed">
              Compare prices across hundreds of stores. Find the best deals, powered by AI.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-xs text-background/60">
              <Link to="/about" className="hover:text-primary transition">About Us</Link>
              <Link to="/sellers" className="hover:text-primary transition">Seller Directory</Link>
              <Link to="/how-to-sell" className="hover:text-primary transition">How to Sell</Link>
              <Link to="/help" className="hover:text-primary transition">Help Center</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">For Buyers</h4>
            <div className="flex flex-col gap-2.5 text-xs text-background/60">
              <Link to="/search" className="hover:text-primary transition">Browse Products</Link>
              <Link to="/auth/signup" className="hover:text-primary transition">Create Account</Link>
              <Link to="/cart" className="hover:text-primary transition">My Cart</Link>
              <Link to="/buyer" className="hover:text-primary transition">Order Tracking</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">For Sellers</h4>
            <div className="flex flex-col gap-2.5 text-xs text-background/60">
              <Link to="/auth/signup?role=seller" className="hover:text-primary transition">Start Selling</Link>
              <Link to="/seller" className="hover:text-primary transition">Seller Dashboard</Link>
              <Link to="/how-to-sell" className="hover:text-primary transition">Seller Guide</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Contact</h4>
            <div className="flex flex-col gap-2.5 text-xs text-background/60">
              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" />support@thebuyer.com</span>
              <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" />+1 (555) 123-4567</span>
              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" />San Francisco, CA</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-background/10">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: ShieldCheck, label: 'Secure Shopping' },
              { icon: CreditCard, label: 'Safe Payments' },
              { icon: Truck, label: 'Fast Delivery' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-background/40">
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-background/30">
          <span>© {new Date().getFullYear()} <span>© {new Date().getFullYear()} Tha Buyer. All rights reserved.</span></span>
          <div className="flex gap-5">
            <span className="hover:text-background/50 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-background/50 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-background/50 cursor-pointer transition">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
