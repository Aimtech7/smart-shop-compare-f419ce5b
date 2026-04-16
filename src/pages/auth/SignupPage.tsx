import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import type { UserRole } from '@/types';

const baseFields = {
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
};

const buyerSchema = z.object(baseFields).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const sellerSchema = z.object({
  ...baseFields,
  businessName: z.string().min(2, 'Business name required').max(255),
  commissionAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the commission policy' }) }),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type SellerForm = z.infer<typeof sellerSchema>;

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';
  const [role, setRole] = useState<'buyer' | 'seller'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const schema = role === 'seller' ? sellerSchema : buyerSchema;
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SellerForm>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: SellerForm) => {
    setLoading(true);
    try {
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: role as UserRole,
        businessName: data.businessName,
      });
      setShowVerification(true);
      toast.success('Account created! Please verify your email.');
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <img src={logo} alt="" className="absolute inset-0 w-full h-full object-contain opacity-[0.06] dark:opacity-[0.04] pointer-events-none select-none" />
        <div className="max-w-md w-full text-center space-y-4">
          <img src={logo} alt="Tha Buyer" className="w-16 h-16 rounded-full object-cover mx-auto" />
          <h1 className="font-display text-2xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>
          <Button onClick={() => navigate('/auth/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background logo watermark */}
      <img src={logo} alt="" className="absolute inset-0 w-full h-full object-contain opacity-[0.06] dark:opacity-[0.04] pointer-events-none select-none" />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logo} alt="Tha Buyer" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-xl">Tha Buyer</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join Tha Buyer today</p>
        </div>

        <div className={`flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg border ${role === 'seller' ? 'bg-accent/10 border-accent/30 text-accent-foreground' : 'bg-primary/10 border-primary/30'}`}>
          <span className="text-lg">{role === 'seller' ? '🏪' : '🛒'}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{role === 'seller' ? 'Seller Registration' : 'Buyer Registration'}</p>
            <p className="text-[11px] text-muted-foreground">
              {role === 'seller' ? 'Open your store on Tha Buyer' : 'Shop and compare prices'}
            </p>
          </div>
          <Link
            to={role === 'seller' ? '/auth/signup?role=buyer' : '/auth/signup?role=seller'}
            onClick={() => { setRole(role === 'seller' ? 'buyer' : 'seller'); reset(); }}
            className="text-xs text-primary hover:underline font-medium"
          >
            Switch to {role === 'seller' ? 'Buyer' : 'Seller'}
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" {...register('fullName')} />{errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}</div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
          <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" {...register('phone')} />{errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}</div>
          {role === 'seller' && (
            <div><Label htmlFor="businessName">Business Name</Label><Input id="businessName" {...register('businessName')} />{errors.businessName && <p className="text-xs text-destructive mt-1">{errors.businessName.message}</p>}</div>
          )}
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register('password')} />{errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}</div>
          <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" {...register('confirmPassword')} />{errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}</div>

          {role === 'seller' && (
            <div className="flex items-start gap-2">
              <Checkbox id="commission" {...register('commissionAccepted')} onCheckedChange={() => {}} />
              <div>
                <label htmlFor="commission" className="text-sm">I accept the <a href="#" className="text-primary underline">Commission Policy</a> (10% per transaction)</label>
                {errors.commissionAccepted && <p className="text-xs text-destructive mt-1">{errors.commissionAccepted.message}</p>}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Account
          </Button>

          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/auth/login" className="text-primary font-medium hover:underline">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
