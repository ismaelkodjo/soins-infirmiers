import { Navigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminCheck();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
