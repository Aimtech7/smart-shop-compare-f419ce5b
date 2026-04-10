import { ShoppingBag, Shield, Users, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container-main py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-display text-3xl font-bold mb-4">About The Buyer</h1>
        <p className="text-lg text-muted-foreground">We connect buyers with the best prices across hundreds of stores, powered by AI-driven price comparison technology.</p>
        <p className="text-sm text-muted-foreground mt-2 font-semibold">Shop Smart, Live Better</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: ShoppingBag, title: 'Multi-Store Platform', desc: 'Compare prices from 240+ verified stores in one place.' },
          { icon: Shield, title: 'Trusted & Secure', desc: 'Verified sellers and secure transactions for peace of mind.' },
          { icon: Users, title: 'Community Driven', desc: 'Real reviews from verified buyers help you make better choices.' },
          { icon: Award, title: 'AI-Powered', desc: 'Our AI analyzes price, rating, and stock to find the best value.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-card p-6 text-center card-hover">
            <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
