import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, UserRound, Info } from "lucide-react";

const SERVICE_TYPES = [
  { value: "medecine_generale", label: "Médecine générale" },
  { value: "maternite", label: "Maternité" },
  { value: "laboratoire", label: "Laboratoire" },
];

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  provider_type: string | null;
}

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setAppointments(data || []);
        setLoading(false);
      });
  }, [user]);

  const statusColor = (status: string) => {
    if (status === "confirmé") return "bg-green-100 text-green-700";
    if (status === "annulé") return "bg-destructive/10 text-destructive";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto px-4 py-10">
        <Link to="/espace-patient" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>

        <h1 className="font-display text-2xl font-bold text-foreground mb-4">Mes rendez-vous</h1>

        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3 mb-8 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          Vos rendez-vous sont planifiés par le personnel médical.
        </div>

        {loading ? (
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        ) : appointments.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-card">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun rendez-vous pour le moment.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            {appointments.map((appt, i) => (
              <div key={appt.id} className={`flex items-center gap-4 p-5 ${i < appointments.length - 1 ? "border-b border-border" : ""}`}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground text-sm">{appt.type}</p>
                  {appt.provider_type && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <UserRound className="h-3 w-3" />
                      {SERVICE_TYPES.find((s) => s.value === appt.provider_type)?.label || appt.provider_type}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {new Date(appt.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à {appt.time.slice(0, 5)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${statusColor(appt.status)}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
