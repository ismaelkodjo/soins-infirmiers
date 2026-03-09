import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Plus, Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
    setAppointments(data || []);
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
