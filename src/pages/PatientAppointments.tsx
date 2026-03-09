import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Plus, Check, XCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface StaffOption {
  user_id: string;
  role: string;
  display_name: string | null;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  staff_id: string | null;
  staff_name?: string;
}

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", type: "", staff_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);

  const ROLE_LABELS: Record<string, string> = {
    medecin: "Médecin",
    infirmier_diplome: "Infirmier(e) diplômé(e)",
    sage_femme: "Sage-femme",
    technicien_labo: "Technicien labo",
    infirmier_auxiliaire: "Infirmier(e) auxiliaire",
    accoucheuse_auxiliaire: "Accoucheuse auxiliaire",
  };

  const fetchStaff = async () => {
    const { data: staff } = await supabase
      .from("staff_members")
      .select("user_id, role")
      .eq("approved", true);
    if (!staff) return;

    const userIds = staff.map((s) => s.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const options: StaffOption[] = staff.map((s) => ({
      ...s,
      display_name: profiles?.find((p) => p.user_id === s.user_id)?.display_name || null,
    }));
    setStaffOptions(options);
  };

  const fetchAppointments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (data) {
      // Fetch staff names for appointments with staff_id
      const staffIds = data.filter((a) => a.staff_id).map((a) => a.staff_id!);
      let staffProfiles: Record<string, string> = {};
      if (staffIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", staffIds);
        if (profiles) {
          profiles.forEach((p) => {
            staffProfiles[p.user_id] = p.display_name || "Prestataire";
          });
        }
      }
      setAppointments(
        data.map((a) => ({
          ...a,
          staff_name: a.staff_id ? staffProfiles[a.staff_id] || "Prestataire" : undefined,
        }))
      );
    } else {
      setAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      date: form.date,
      time: form.time,
      type: form.type,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer le rendez-vous.", variant: "destructive" });
    } else {
      toast({ title: "Rendez-vous demandé", description: "Votre demande a bien été enregistrée." });
      setOpen(false);
      setForm({ date: "", time: "", type: "" });
      fetchAppointments();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user!.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    } else {
      toast({ title: "Statut mis à jour", description: `Rendez-vous ${status}.` });
      fetchAppointments();
    }
  };

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

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Mes rendez-vous</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Demander un RDV</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demander un rendez-vous</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Type de soin</label>
                  <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Ex: Prise de sang, Pansement..." required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Heure</label>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Envoi..." : "Envoyer la demande"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {new Date(appt.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à {appt.time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                  {appt.status === "à venir" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(appt.id, "confirmé")}>
                        <Check className="h-3.5 w-3.5" /> Confirmer
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => updateStatus(appt.id, "annulé")}>
                        <XCircle className="h-3.5 w-3.5" /> Annuler
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
