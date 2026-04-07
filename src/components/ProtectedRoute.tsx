import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireClient?: boolean;
  requireStaff?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireClient = false,
  requireStaff = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isClient, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin-only pages
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Staff-only pages (admin or rep — not clients)
  if (requireStaff && !isStaff) {
    return <Navigate to="/portal" replace />;
  }

  // Client-only pages
  if (requireClient && !isClient) {
    return <Navigate to="/" replace />;
  }

  // Default redirect: clients hitting admin routes go to portal
  if (isClient && !requireClient) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}
