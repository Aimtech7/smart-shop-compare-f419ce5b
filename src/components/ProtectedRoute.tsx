import { Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { UserRole } from '@/types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            Your account ({user.role}) doesn't have permission to access this page.
            {allowedRoles.includes('seller') && (
              <> This area is for <strong>sellers only</strong>. You can <Link to="/auth/signup?role=seller" className="text-primary underline">register as a seller</Link> to access it.</>
            )}
          </p>
          <Link to="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
