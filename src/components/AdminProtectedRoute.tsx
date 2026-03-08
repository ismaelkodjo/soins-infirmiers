import { Navigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useAdminCheck();

  // Wait for both auth and admin check to complete
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  // Not logged in → auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but not admin → home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
