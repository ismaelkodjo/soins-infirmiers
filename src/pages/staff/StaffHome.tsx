import { useAuth } from "@/contexts/AuthContext";
import { useStaffRole, ROLE_LABELS } from "@/hooks/useStaffRole";
import { Calendar, FileText, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";

const StaffHome = () => {
  const { user } = useAuth();
  const { role, isMedicalStaff, isLabTech } = useStaffRole();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">
        Bienvenue, {user?.user_metadata?.display_name || "Professionnel"}
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        {role && ROLE_LABELS[role]} — Tableau de bord professionnel
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isMedicalStaff && (
          <>
            <Link
              to="/staff/ordonnances"
              className="bg-card border border-border rounded-xl p-6 hover:shadow-card transition-shadow group"
            >
              <FileText className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold text-foreground mb-1">Ordonnances</h3>
              <p className="text-sm text-muted-foreground">
                Créer et gérer les ordonnances des patients
              </p>
            </Link>

            <Link
              to="/staff/rendez-vous"
              className="bg-card border border-border rounded-xl p-6 hover:shadow-card transition-shadow group"
            >
              <Calendar className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold text-foreground mb-1">Rendez-vous</h3>
              <p className="text-sm text-muted-foreground">
                Consulter et gérer les rendez-vous patients
              </p>
            </Link>
          </>
        )}

        {isLabTech && (
          <Link
            to="/staff/resultats"
            className="bg-card border border-border rounded-xl p-6 hover:shadow-card transition-shadow group"
          >
            <FlaskConical className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-display font-semibold text-foreground mb-1">Résultats de laboratoire</h3>
            <p className="text-sm text-muted-foreground">
              Saisir et gérer les résultats d'analyses
            </p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default StaffHome;
