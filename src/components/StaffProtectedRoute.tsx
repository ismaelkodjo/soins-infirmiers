import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffRole } from "@/hooks/useStaffRole";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const StaffProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { role, approved, loading } = useStaffRole();
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  if (authLoading || loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/staff-auth" replace />;

  // Admins can access staff area directly
  if (isAdmin) return <>{children}</>;

  if (!role) return <Navigate to="/staff-auth" replace />;

  if (!approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-4 text-center bg-card rounded-xl p-8 shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Compte en attente de validation</h2>
          <p className="text-muted-foreground text-sm">
            Votre inscription a bien été enregistrée. Un administrateur doit valider votre compte avant que vous puissiez accéder au tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StaffProtectedRoute;
