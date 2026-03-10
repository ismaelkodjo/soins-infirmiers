import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, FlaskConical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStaffRole, StaffRole } from "@/hooks/useStaffRole";

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
  const { role } = useStaffRole();
  const serviceFilter = getServiceForRole(role);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["staff-patients-confirmed", serviceFilter],
    queryFn: async () => {
      // Get confirmed appointments for this service
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

      // Get unique user IDs
      const userIds = [...new Set(appointments.map((a) => a.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      // Check lab results for each patient
      const { data: labResults } = await supabase
        .from("lab_results")
        .select("patient_id")
        .in("patient_id", userIds);

      const patientsWithLab = new Set(labResults?.map((l) => l.patient_id) || []);

      return appointments.map((apt) => ({
        ...apt,
        profile: profileMap.get(apt.user_id) || { display_name: null },
        has_lab_request: patientsWithLab.has(apt.user_id),
      })) as PatientAppointment[];
    },
  });

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
                <TableHead>Bilan demandé</TableHead>
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
                        <FlaskConical className="h-3 w-3" /> Oui
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Non</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StaffPatients;
