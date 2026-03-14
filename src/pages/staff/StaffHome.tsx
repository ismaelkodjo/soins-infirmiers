import { useAuth } from "@/contexts/AuthContext";
import { useStaffRole, ROLE_LABELS } from "@/hooks/useStaffRole";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, FlaskConical, Users, Clock, CheckCircle, AlertCircle, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SERVICE_LABELS: Record<string, string> = {
  medecine_generale: "Médecine générale",
  maternite: "Maternité",
  laboratoire: "Laboratoire",
};

const getServiceForRole = (role: string | null): string | null => {
  if (!role) return null;
  if (["medecin", "infirmier_diplome", "infirmier_auxiliaire"].includes(role)) return "medecine_generale";
  if (["sage_femme", "accoucheuse_auxiliaire"].includes(role)) return "maternite";
  if (role === "technicien_labo") return "laboratoire";
  return null;
};

const StaffHome = () => {
  const { user } = useAuth();
  const { role, isMedicalStaff, isLabTech, isPharmacist } = useStaffRole();
  const serviceFilter = getServiceForRole(role);

  // Stats: confirmed patients
  const { data: confirmedPatients } = useQuery({
    queryKey: ["dashboard-confirmed", serviceFilter],
    enabled: !isLabTech,
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("id, date, time, type, provider_type, user_id, status")
        .eq("status", "confirmé")
        .order("date", { ascending: true })
        .limit(5);
      if (serviceFilter) query = query.eq("provider_type", serviceFilter);
      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) return [];

      const userIds = [...new Set(data.map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

      return data.map((a) => ({ ...a, patient_name: profileMap.get(a.user_id) || "Patient inconnu" }));
    },
  });

  // Stats: recent ordonnances
  const { data: recentOrdonnances } = useQuery({
    queryKey: ["dashboard-ordonnances"],
    enabled: isMedicalStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordonnances")
        .select("id, diagnosis, medications, patient_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      if (!data?.length) return [];

      const userIds = [...new Set(data.map((o) => o.patient_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

      return data.map((o) => ({ ...o, patient_name: profileMap.get(o.patient_id) || "Patient inconnu" }));
    },
  });

  // Stats: recent lab results
  const { data: recentLabResults } = useQuery({
    queryKey: ["dashboard-lab-results"],
    enabled: isMedicalStaff || isLabTech,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("id, test_name, result, unit, status, patient_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      if (!data?.length) return [];

      const userIds = [...new Set(data.map((l) => l.patient_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

      return data.map((l) => ({ ...l, patient_name: profileMap.get(l.patient_id) || "Patient inconnu" }));
    },
  });

  // Counts
  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts", serviceFilter, isPharmacist],
    queryFn: async () => {
      let aptQuery = supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "confirmé");
      if (serviceFilter) aptQuery = aptQuery.eq("provider_type", serviceFilter);
      const { count: patientsCount } = await aptQuery;

      const { count: ordoCount } = await supabase.from("ordonnances").select("id", { count: "exact", head: true });
      const { count: labCount } = await supabase.from("lab_results").select("id", { count: "exact", head: true });
      const { count: labPendingCount } = await supabase.from("lab_results").select("id", { count: "exact", head: true }).eq("status", "en attente");

      const { count: pharmPending } = await supabase.from("pharmacy_queue").select("id", { count: "exact", head: true }).eq("status", "en attente");

      return {
        patients: patientsCount || 0,
        ordonnances: ordoCount || 0,
        labResults: labCount || 0,
        labPending: labPendingCount || 0,
        pharmPending: pharmPending || 0,
      };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Bienvenue, {user?.user_metadata?.display_name || "Professionnel"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {role && ROLE_LABELS[role]} — Tableau de bord professionnel
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isLabTech && (
          <Link to="/staff/patients">
            <Card className="hover:shadow-card transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Patients confirmés</p>
                    <p className="text-3xl font-bold text-foreground">{counts?.patients ?? "—"}</p>
                  </div>
                  <Users className="h-10 w-10 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {!isLabTech && (
          <Link to="/staff/ordonnances">
            <Card className="hover:shadow-card transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ordonnances</p>
                    <p className="text-3xl font-bold text-foreground">{counts?.ordonnances ?? "—"}</p>
                  </div>
                  <FileText className="h-10 w-10 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link to="/staff/resultats">
          <Card className="hover:shadow-card transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Résultats labo</p>
                  <p className="text-3xl font-bold text-foreground">{counts?.labResults ?? "—"}</p>
                </div>
                <FlaskConical className="h-10 w-10 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analyses en attente</p>
                <p className="text-3xl font-bold text-foreground">{counts?.labPending ?? "—"}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {isPharmacist && (
          <Link to="/staff/pharmacie">
            <Card className="hover:shadow-card transition-shadow cursor-pointer border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pharmacie en attente</p>
                    <p className="text-3xl font-bold text-foreground">{counts?.pharmPending ?? "—"}</p>
                  </div>
                  <Pill className="h-10 w-10 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent confirmed patients */}
        {!isLabTech && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Derniers patients confirmés
                {serviceFilter && (
                  <Badge variant="secondary" className="ml-2 text-xs font-normal">
                    {SERVICE_LABELS[serviceFilter]}
                  </Badge>
                )}
              </CardTitle>
              <Link to="/staff/patients" className="text-xs text-primary hover:underline">Voir tout</Link>
            </CardHeader>
            <CardContent>
              {!confirmedPatients?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun patient confirmé</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Patient</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Motif</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmedPatients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm font-medium">{p.patient_name}</TableCell>
                        <TableCell className="text-sm">{new Date(p.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-sm">{p.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent ordonnances */}
        {!isLabTech && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Dernières ordonnances</CardTitle>
              <Link to="/staff/ordonnances" className="text-xs text-primary hover:underline">Voir tout</Link>
            </CardHeader>
            <CardContent>
              {!recentOrdonnances?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune ordonnance</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Patient</TableHead>
                      <TableHead className="text-xs">Diagnostic</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrdonnances.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-sm font-medium">{o.patient_name}</TableCell>
                        <TableCell className="text-sm truncate max-w-[150px]">{o.diagnosis || "—"}</TableCell>
                        <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent lab results - full width */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Derniers résultats de laboratoire</CardTitle>
            <Link to="/staff/resultats" className="text-xs text-primary hover:underline">Voir tout</Link>
          </CardHeader>
          <CardContent>
            {!recentLabResults?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun résultat</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Analyse</TableHead>
                    <TableHead className="text-xs">Résultat</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLabResults.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm font-medium">{l.patient_name}</TableCell>
                      <TableCell className="text-sm">{l.test_name}</TableCell>
                      <TableCell className="text-sm">{l.result} {l.unit}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            l.status === "terminé"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }
                        >
                          {l.status === "terminé" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(l.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffHome;
