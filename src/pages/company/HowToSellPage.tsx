import { UserPlus, Package, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HowToSellPage() {
  return (
    <div className="container-main py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-display text-3xl font-bold mb-4"><h1 className="font-display text-3xl font-bold mb-4">Start Selling on Tha Buyer</h1></h1>
        <p className="text-lg text-muted-foreground">Join 240+ stores and reach thousands of buyers looking for the best prices.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: UserPlus, step: '1', title: 'Register', desc: 'Create a seller account with your business details.' },
          { icon: Package, step: '2', title: 'List Products', desc: 'Add your products with competitive pricing.' },
          { icon: CreditCard, step: '3', title: 'Start Selling', desc: 'Receive orders and manage your inventory.' },
          { icon: TrendingUp, step: '4', title: 'Grow', desc: 'Track performance and optimize your pricing.' },
        ].map(({ icon: Icon, step, title, desc }) => (
          <div key={step} className="rounded-xl border bg-card p-6 text-center relative">
            <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">{step}</span>
            <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link to="/auth/signup?role=seller"><Button size="lg">Register as Seller</Button></Link>
      </div>
    </div>
  );
}
