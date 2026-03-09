import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  "à venir": "bg-blue-100 text-blue-800",
  "confirmé": "bg-green-100 text-green-800",
  "annulé": "bg-red-100 text-red-800",
};

const StaffAppointments = () => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["staff-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Rendez-vous</h1>
        <p className="text-sm text-muted-foreground">Consulter les rendez-vous des patients</p>
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
                <TableHead>Type</TableHead>
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
