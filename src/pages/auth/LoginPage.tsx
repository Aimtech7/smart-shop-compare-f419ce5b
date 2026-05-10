import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { user, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const isSeller = roleParam === 'seller';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in — via useEffect to avoid render-time navigate
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/buyer';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      // Navigation will happen via useEffect when user state updates
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };


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
          <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">{isSeller ? 'Login to your seller account' : 'Login to your account'}</p>
        </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-xl border">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register('password')} />{errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}</div>

            <div className="flex justify-end">
              <Link to="/auth/forgot-password" title="Forgot Password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Login
            </Button>

            <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to={`/auth/signup${isSeller ? '?role=seller' : ''}`} className="text-primary font-medium hover:underline">Sign Up</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
