import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, FlaskConical, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStaffRole, StaffRole } from "@/hooks/useStaffRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const SERVICE_LABELS: Record<string, string> = {
  medecine_generale: "Médecine générale",
  maternite: "Maternité",
  laboratoire: "Laboratoire",
};

const getServiceForRole = (role: StaffRole | null): string | null => {
  if (!role) return null;
  if (["medecin", "infirmier_diplome", "infirmier_auxiliaire"].includes(role)) return "medecine_generale";
  if (["sage_femme", "accoucheuse_auxiliaire"].includes(role)) return "maternite";
  if (role === "technicien_labo") return "laboratoire";
  return null;
};

interface PatientAppointment {
  id: string;
  date: string;
  time: string;
  type: string;
  provider_type: string | null;
  user_id: string;
  status: string;
  profile?: { display_name: string | null };
  has_lab_request: boolean;
}

const StaffPatients = () => {
  const { user } = useAuth();
  const { role } = useStaffRole();
  const serviceFilter = getServiceForRole(role);
  const queryClient = useQueryClient();

  const [labDialogOpen, setLabDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientAppointment | null>(null);
  const [testName, setTestName] = useState("");

  const { data: patients, isLoading } = useQuery({
    queryKey: ["staff-patients-confirmed", serviceFilter],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*")
        .eq("status", "confirmé")
        .order("date", { ascending: true });

      if (serviceFilter) {
        query = query.eq("provider_type", serviceFilter);
      }

      const { data: appointments, error } = await query;
      if (error) throw error;
      if (!appointments?.length) return [];

      const userIds = [...new Set(appointments.map((a) => a.user_id))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const { data: labResults } = await supabase
        .from("lab_results")
        .select("patient_id, status")
        .in("patient_id", userIds);

      const patientsWithLab = new Set(labResults?.map((l) => l.patient_id) || []);

      return appointments.map((apt) => ({
        ...apt,
        profile: profileMap.get(apt.user_id) || { display_name: null },
        has_lab_request: patientsWithLab.has(apt.user_id),
      })) as PatientAppointment[];
    },
  });

  const requestLabMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatient || !user) throw new Error("Données manquantes");
      const { error } = await supabase.from("lab_results").insert({
        patient_id: selectedPatient.user_id,
        staff_id: user.id,
        test_name: testName,
        result: "",
        status: "en attente",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-patients-confirmed"] });
      queryClient.invalidateQueries({ queryKey: ["staff-lab-results"] });
      toast({ title: "Analyse demandée", description: `Demande de "${testName}" envoyée au laboratoire.` });
      setLabDialogOpen(false);
      setTestName("");
      setSelectedPatient(null);
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const openLabRequest = (patient: PatientAppointment) => {
    setSelectedPatient(patient);
    setTestName("");
    setLabDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Patients confirmés</h1>
        <p className="text-sm text-muted-foreground">
          {serviceFilter
            ? `Patients avec rendez-vous confirmés — ${SERVICE_LABELS[serviceFilter] || serviceFilter}`
            : "Liste des patients avec rendez-vous confirmés"}
        </p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      ) : !patients?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucun patient avec rendez-vous confirmé</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Bilan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-sm">
                    {p.profile?.display_name || "Patient inconnu"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(p.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-sm">{p.time?.slice(0, 5)}</TableCell>
                  <TableCell className="text-sm">{p.type}</TableCell>
                  <TableCell className="text-sm">
                    {SERVICE_LABELS[p.provider_type || ""] || p.provider_type || "—"}
                  </TableCell>
                  <TableCell>
                    {p.has_lab_request ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 gap-1">
                        <FlaskConical className="h-3 w-3" /> Demandé
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1"
                      onClick={() => openLabRequest(p)}
                    >
                      <FlaskConical className="h-3.5 w-3.5" /> Demander analyse
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog demande d'analyse */}
      <Dialog open={labDialogOpen} onOpenChange={setLabDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Demander une analyse de laboratoire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium text-foreground">
                Patient : {selectedPatient?.profile?.display_name || "Patient inconnu"}
              </p>
              <p className="text-xs text-muted-foreground">
                RDV du {selectedPatient && new Date(selectedPatient.date).toLocaleDateString("fr-FR")} — {selectedPatient?.type}
              </p>
            </div>
            <div>
              <Label>Nom de l'analyse</Label>
              <Input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Ex : NFS, Glycémie, Bilan hépatique..."
              />
            </div>
            <Button
              onClick={() => requestLabMutation.mutate()}
              disabled={!testName.trim() || requestLabMutation.isPending}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {requestLabMutation.isPending ? "Envoi..." : "Envoyer la demande au labo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPatients;
