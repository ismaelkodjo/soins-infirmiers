import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStaffRole, StaffRole } from "@/hooks/useStaffRole";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    setUpdatingId(null);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    } else {
      toast({ title: "Statut mis à jour", description: `Rendez-vous ${status}.` });
      queryClient.invalidateQueries({ queryKey: ["staff-appointments"] });
    }
  };

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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    {apt.status === "à venir" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50"
                          disabled={updatingId === apt.id}
                          onClick={() => updateStatus(apt.id, "confirmé")}
                        >
                          <Check className="h-3.5 w-3.5" /> Confirmer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-destructive border-destructive/20 hover:bg-destructive/5"
                          disabled={updatingId === apt.id}
                          onClick={() => updateStatus(apt.id, "annulé")}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Annuler
                        </Button>
                      </div>
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

export default StaffAppointments;
