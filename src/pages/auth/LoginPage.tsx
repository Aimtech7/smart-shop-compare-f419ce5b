import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { ShoppingBag, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { signIn, resetPassword } = useAuth();
  const { user, isAuthenticated } = useStore();
  const navigate = useNavigate();

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

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error('Enter your email'); return; }
    try {
      await resetPassword(forgotEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setForgotMode(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-primary-foreground" /></div>
            <span className="font-display font-bold text-xl"><span className="font-display font-bold text-xl">Tha Buyer</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">Login to your account</p>
        </div>

        {forgotMode ? (
          <div className="space-y-4 bg-card p-6 rounded-xl border">
            <h2 className="font-display font-semibold text-lg">Reset Password</h2>
            <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
            <div>
              <Label htmlFor="forgot-email">Email</Label>
              <Input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleForgotPassword}>Send Reset Link</Button>
            <button onClick={() => setForgotMode(false)} className="text-sm text-primary hover:underline w-full text-center">Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-xl border">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register('password')} />{errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}</div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-primary hover:underline">Forgot password?</button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Login
            </Button>

            <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/auth/signup" className="text-primary font-medium hover:underline">Sign Up</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
