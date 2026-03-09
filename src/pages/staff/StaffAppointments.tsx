import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStaffRole, StaffRole } from "@/hooks/useStaffRole";

const statusColors: Record<string, string> = {
  "à venir": "bg-blue-100 text-blue-800",
  "confirmé": "bg-green-100 text-green-800",
  "annulé": "bg-red-100 text-red-800",
};

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

const StaffAppointments = () => {
  const { role } = useStaffRole();
  const serviceFilter = getServiceForRole(role);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["staff-appointments", serviceFilter],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: true });

      if (serviceFilter) {
        query = query.eq("provider_type", serviceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Rendez-vous</h1>
        <p className="text-sm text-muted-foreground">
          {serviceFilter
            ? `Rendez-vous — ${SERVICE_LABELS[serviceFilter] || serviceFilter}`
            : "Consulter les rendez-vous des patients"}
        </p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      ) : !appointments?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucun rendez-vous</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="text-sm">
                    {new Date(apt.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-sm">{apt.time?.slice(0, 5)}</TableCell>
                  <TableCell className="text-sm">{apt.type}</TableCell>
                  <TableCell className="text-sm">
                    {SERVICE_LABELS[apt.provider_type || ""] || apt.provider_type || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[apt.status] || ""}>
                      {apt.status}
                    </Badge>
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

export default StaffAppointments;
