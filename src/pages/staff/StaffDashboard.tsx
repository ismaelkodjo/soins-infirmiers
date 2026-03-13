import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffRole, ROLE_LABELS } from "@/hooks/useStaffRole";
import { Home, FileText, Calendar, FlaskConical, LogOut, Stethoscope, Users, Pill } from "lucide-react";
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";

const StaffDashboard = () => {
  const { signOut } = useAuth();
  const { role, isMedicalStaff, isLabTech, isPharmacist } = useStaffRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2 px-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Espace Pro</span>
        </div>
        {role && (
          <p className="text-xs text-muted-foreground px-2 mb-6">{ROLE_LABELS[role]}</p>
        )}

        <nav className="flex-1 space-y-1">
          <NavLink to="/staff" end className={linkClass}>
            <Home className="h-4 w-4" />
            Accueil
          </NavLink>

          {isMedicalStaff && (
            <>
              <NavLink to="/staff/ordonnances" className={linkClass}>
                <FileText className="h-4 w-4" />
                Ordonnances
              </NavLink>
              <NavLink to="/staff/rendez-vous" className={linkClass}>
                <Calendar className="h-4 w-4" />
                Rendez-vous
              </NavLink>
              <NavLink to="/staff/patients" className={linkClass}>
                <Users className="h-4 w-4" />
                Patients confirmés
              </NavLink>
            </>
          )}

          {isLabTech && (
            <NavLink to="/staff/resultats" className={linkClass}>
              <FlaskConical className="h-4 w-4" />
              Résultats labo
            </NavLink>
          )}

          {isPharmacist && (
            <NavLink to="/staff/pharmacie" className={linkClass}>
              <Pill className="h-4 w-4" />
              Pharmacie
            </NavLink>
          )}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors mt-4"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffDashboard;
