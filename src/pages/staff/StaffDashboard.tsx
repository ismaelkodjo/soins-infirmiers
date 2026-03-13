import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffRole, ROLE_LABELS } from "@/hooks/useStaffRole";
import { Home, FileText, Calendar, FlaskConical, LogOut, Stethoscope, Users, Pill, Menu, X } from "lucide-react";
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";
import { useState } from "react";

const StaffDashboard = () => {
  const { signOut } = useAuth();
  const { role, isMedicalStaff, isLabTech, isPharmacist } = useStaffRole();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Espace Pro</span>
        </div>
        <button onClick={closeSidebar} className="md:hidden text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      {role && (
        <p className="text-xs text-muted-foreground px-2 mb-6">{ROLE_LABELS[role]}</p>
      )}

      <nav className="flex-1 space-y-1">
        <NavLink to="/staff" end className={linkClass} onClick={closeSidebar}>
          <Home className="h-4 w-4" />
          Accueil
        </NavLink>

        {isMedicalStaff && (
          <>
            <NavLink to="/staff/ordonnances" className={linkClass} onClick={closeSidebar}>
              <FileText className="h-4 w-4" />
              Ordonnances
            </NavLink>
            <NavLink to="/staff/rendez-vous" className={linkClass} onClick={closeSidebar}>
              <Calendar className="h-4 w-4" />
              Rendez-vous
            </NavLink>
            <NavLink to="/staff/patients" className={linkClass} onClick={closeSidebar}>
              <Users className="h-4 w-4" />
              Patients confirmés
            </NavLink>
          </>
        )}

        {isLabTech && (
          <NavLink to="/staff/resultats" className={linkClass} onClick={closeSidebar}>
            <FlaskConical className="h-4 w-4" />
            Résultats labo
          </NavLink>
        )}

        {isPharmacist && (
          <NavLink to="/staff/pharmacie" className={linkClass} onClick={closeSidebar}>
            <Pill className="h-4 w-4" />
            Pharmacie
          </NavLink>
        )}
      </nav>

      <LogoutConfirmDialog onConfirm={handleSignOut}>
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors mt-4 w-full">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </LogoutConfirmDialog>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border p-4 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffDashboard;
