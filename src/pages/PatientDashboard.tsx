import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Calendar, FileText, Heart, Clock, Settings } from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Patient";

  const quickActions = [
    { icon: Calendar, title: "Mes rendez-vous", description: "Consulter et gérer vos prochains rendez-vous", color: "bg-primary/10 text-primary" },
    { icon: FileText, title: "Mes documents", description: "Ordonnances, résultats d'analyses et comptes-rendus", color: "bg-accent/10 text-accent" },
    { icon: Heart, title: "Mon suivi santé", description: "Historique de vos constantes et soins", color: "bg-destructive/10 text-destructive" },
    { icon: Settings, title: "Mon profil", description: "Modifier vos informations personnelles", color: "bg-muted-foreground/10 text-muted-foreground" },
  ];

  const upcomingAppointments = [
    { date: "12 mars 2026", time: "09:00", type: "Prise de sang" },
    { date: "15 mars 2026", time: "14:30", type: "Pansement post-opératoire" },
    { date: "20 mars 2026", time: "10:00", type: "Contrôle tension" },
  ];

  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Welcome header */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                Bonjour, {displayName} 👋
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1">
                Bienvenue dans votre espace patient
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Quick actions */}
        <h2 className="font-display text-xl font-bold text-foreground mb-6">Accès rapide</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 cursor-pointer group"
            >
              <div className={`w-11 h-11 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-card-foreground mb-1">
                {action.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {action.description}
              </p>
            </div>
          ))}
        </div>

        {/* Upcoming appointments */}
        <h2 className="font-display text-xl font-bold text-foreground mb-6">Prochains rendez-vous</h2>
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          {upcomingAppointments.map((appt, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-5 ${i < upcomingAppointments.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground text-sm">{appt.type}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {appt.date} à {appt.time}
                </p>
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0">
                À venir
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
