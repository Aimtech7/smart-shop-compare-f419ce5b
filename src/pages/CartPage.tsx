import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, CreditCard, Smartphone, ShoppingCart, Package, ChevronRight, Store, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';
import { toast } from 'sonner';

const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  street: z.string().min(5).max(255),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zipCode: z.string().min(3).max(20),
  country: z.string().min(2).max(100),
});

const suggestedProducts = [
  { name: 'Samsung Galaxy S24 Ultra', price: 1149, category: 'Electronics' },
  { name: 'Sony WH-1000XM5', price: 329, category: 'Audio' },
  { name: 'Nike Air Max 270', price: 150, category: 'Fashion' },
  { name: 'iPad Air M2', price: 599, category: 'Electronics' },
];

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartByStore, clearCart, user } = useStore();
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
  });

  const hasAddress = Boolean(user?.addresses && user.addresses.length > 0);
  const defaultAddress = hasAddress ? user?.addresses![0] : null;

  useEffect(() => {
    if (defaultAddress && user) {
      setValue('fullName', user.fullName || '');
      setValue('phone', user.phone || '');
      setValue('street', defaultAddress.street1 || '');
      setValue('city', defaultAddress.city || '');
      setValue('state', defaultAddress.state || '');
      setValue('zipCode', defaultAddress.zip_code || '');
      setValue('country', defaultAddress.country || 'US');
    }
  }, [defaultAddress, user, setValue]);

  const groupedCart = getCartByStore();
  const total = getCartTotal();
  const shipping = total > 50 ? 0 : 5.99;

  const onCheckout = async (data: any) => {
    setOrderLoading(true);
    try {
      const order = await api.checkout(cart, data, paymentMethod, user?.id || 'guest');
      setOrderId(order.id);
      clearCart();
      setStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="container-main py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground mb-3">Your order has been placed successfully.</p>
          <div className="rounded-xl bg-secondary/50 p-4 mb-6 text-sm">
            <p className="text-muted-foreground">Order ID</p>
            <p className="font-display font-bold text-lg">#{orderId}</p>
            <p className="text-xs text-muted-foreground mt-1">You'll receive a confirmation email shortly.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/buyer"><Button variant="outline">Track Order</Button></Link>
            <Link to="/"><Button>Continue Shopping</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="container-main py-16">
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">Looks like you haven't added anything yet. Browse our products and find something you love!</p>
          <Link to="/search"><Button size="lg" className="shadow-md shadow-primary/20">Start Shopping <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg mb-4">You Might Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedProducts.map(p => (
              <Link key={p.name} to="/search" className="rounded-xl border bg-card p-4 card-hover block group">
                <div className="h-28 bg-secondary/50 rounded-lg flex items-center justify-center mb-3">
                  <Package className="w-8 h-8 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.category}</p>
                <h3 className="font-medium text-sm line-clamp-1 mt-0.5">{p.name}</h3>
                <p className="font-display font-bold text-primary mt-2">${p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{step === 'cart' ? 'Shopping Cart' : 'Checkout'}</span>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {['Cart', 'Checkout', 'Confirmation'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 sm:w-16 ${i <= (step === 'cart' ? 0 : step === 'checkout' ? 1 : 2) ? 'bg-primary' : 'bg-border'}`} />}
            <div className={`flex items-center gap-1.5 ${i <= (step === 'cart' ? 0 : step === 'checkout' ? 1 : 2) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                i <= (step === 'cart' ? 0 : step === 'checkout' ? 1 : 2) ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>{i + 1}</div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {step === 'cart' ? (
            Object.entries(groupedCart).map(([storeName, items]) => (
              <div key={storeName} className="rounded-xl border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b bg-secondary/30 flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">{storeName}</h3>
                  <span className="text-[10px] text-muted-foreground ml-auto">{items.length} item{items.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y">
                  {items.map(item => (
                    <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/50 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">from {item.storeName}</p>
                        <p className="text-sm text-primary font-bold mt-1">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-secondary transition">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-secondary transition">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-display font-bold text-sm w-20 text-right hidden sm:block">${(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t bg-secondary/10 text-right">
                  <span className="text-xs text-muted-foreground">Subtotal: </span>
                  <span className="font-display font-bold">${items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
            ))
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit(onCheckout)} className="space-y-5">
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold">Delivery Address</h2>
                  {hasAddress && (
                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                      To change your address, visit Account Settings.
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input {...register('fullName')} className="mt-1" disabled={hasAddress} />{errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message as string}</p>}</div>
                  <div><Label>Phone</Label><Input {...register('phone')} className="mt-1" disabled={hasAddress} />{errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message as string}</p>}</div>
                  <div className="sm:col-span-2"><Label>Street Address</Label><Input {...register('street')} className="mt-1" disabled={hasAddress} />{errors.street && <p className="text-xs text-destructive mt-1">{errors.street.message as string}</p>}</div>
                  <div><Label>City</Label><Input {...register('city')} className="mt-1" disabled={hasAddress} /></div>
                  <div><Label>State</Label><Input {...register('state')} className="mt-1" disabled={hasAddress} /></div>
                  <div><Label>ZIP Code</Label><Input {...register('zipCode')} className="mt-1" disabled={hasAddress} /></div>
                  <div><Label>Country</Label><Input {...register('country')} className="mt-1" disabled={hasAddress} /></div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display font-semibold mb-4">Payment Method</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { id: 'card' as const, label: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex', icon: CreditCard },
                    { id: 'mobile_money' as const, label: 'Mobile Money', desc: 'MTN, Airtel, Vodafone', icon: Smartphone },
                  ].map(({ id, label, desc, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                      className={`p-4 rounded-xl border text-left transition ${paymentMethod === id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-secondary/50'}`}>
                      <Icon className={`w-6 h-6 mb-2 ${paymentMethod === id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border bg-card p-6 h-fit sticky top-20">
          <h2 className="font-display font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Items ({cart.length})</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? 'text-success font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            {shipping > 0 && <p className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg p-2">Add ${(50 - total).toFixed(2)} more for free shipping</p>}
            <div className="border-t pt-3 flex justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${(total + shipping).toFixed(2)}</span>
            </div>
          </div>
          {step === 'cart' ? (
            <Button className="w-full mt-5 h-12 text-sm font-semibold shadow-md shadow-primary/20" onClick={() => setStep('checkout')}>
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="space-y-2 mt-5">
              <Button className="w-full h-12 text-sm font-semibold shadow-md shadow-primary/20" type="submit" form="checkout-form" disabled={orderLoading}>
                {orderLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Place Order
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep('cart')}>← Back to Cart</Button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground text-center mt-3">🔒 Secure checkout · 30-day returns</p>
        </div>
      </div>
    </div>
  );
}
