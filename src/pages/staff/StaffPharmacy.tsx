import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, FlaskConical, Clock, CheckCircle, CreditCard, Users, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const StaffPharmacy = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("medicaments");

  // Fetch pharmacy queue - medications (ordonnances)
  const { data: medQueue, isLoading: loadingMed } = useQuery({
    queryKey: ["pharmacy-queue-med"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_queue")
        .select("*")
        .eq("source_type", "ordonnance")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pharmacy queue - analyses (lab)
  const { data: labQueue, isLoading: loadingLab } = useQuery({
    queryKey: ["pharmacy-queue-lab"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_queue")
        .select("*")
        .eq("source_type", "analyse")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Counts
  const { data: counts } = useQuery({
    queryKey: ["pharmacy-counts"],
    queryFn: async () => {
      const { count: medPending } = await supabase
        .from("pharmacy_queue")
        .select("id", { count: "exact", head: true })
        .eq("source_type", "ordonnance")
        .eq("status", "en attente");
      const { count: labPending } = await supabase
        .from("pharmacy_queue")
        .select("id", { count: "exact", head: true })
        .eq("source_type", "analyse")
        .eq("status", "en attente");
      const { count: dispensed } = await supabase
        .from("pharmacy_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", "dispensé");
      return {
        medPending: medPending || 0,
        labPending: labPending || 0,
        dispensed: dispensed || 0,
        total: (medPending || 0) + (labPending || 0),
      };
    },
  });

  // Fetch inventory
  const { data: inventory, isLoading: loadingInventory } = useQuery({
    queryKey: ["pharmacy-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pharmacy_items")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Dispense mutation (mark as paid & dispensed)
  const dispenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pharmacy_queue")
        .update({ status: "dispensé" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marqué comme dispensé (payé)");
      queryClient.invalidateQueries({ queryKey: ["pharmacy-queue-med"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-queue-lab"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-counts"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const renderQueue = (data: typeof medQueue, type: "med" | "lab") => {
    if (!data?.length) {
      return <p className="text-sm text-muted-foreground text-center py-8">Aucun patient en attente</p>;
    }

    const pending = data.filter((d) => d.status === "en attente");
    const done = data.filter((d) => d.status === "dispensé");

    return (
      <div className="space-y-6">
        {pending.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              En attente de paiement ({pending.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>{type === "med" ? "Médicaments" : "Analyses"}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.patient_name || "Patient"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.items?.map((i: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {i}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(item.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => dispenseMutation.mutate(item.id)}
                        disabled={dispenseMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Payé & Dispensé
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Dispensés ({done.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>{type === "med" ? "Médicaments" : "Analyses"}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {done.map((item) => (
                  <TableRow key={item.id} className="opacity-60">
                    <TableCell className="font-medium">{item.patient_name || "Patient"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.items?.map((i: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {i}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(item.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" /> Dispensé
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Pharmacie</h1>
        <p className="text-sm text-muted-foreground">Gérez la dispensation des médicaments et analyses après paiement</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total en attente</p>
                <p className="text-3xl font-bold text-foreground">{counts?.total ?? "—"}</p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Médicaments</p>
                <p className="text-3xl font-bold text-foreground">{counts?.medPending ?? "—"}</p>
              </div>
              <Pill className="h-10 w-10 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analyses</p>
                <p className="text-3xl font-bold text-foreground">{counts?.labPending ?? "—"}</p>
              </div>
              <FlaskConical className="h-10 w-10 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dispensés</p>
                <p className="text-3xl font-bold text-foreground">{counts?.dispensed ?? "—"}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="medicaments" className="gap-1.5">
            <Pill className="h-4 w-4" /> Médicaments
          </TabsTrigger>
          <TabsTrigger value="analyses" className="gap-1.5">
            <FlaskConical className="h-4 w-4" /> Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medicaments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liste d'attente — Médicaments</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMed ? (
                <p className="text-sm text-muted-foreground animate-pulse text-center py-8">Chargement...</p>
              ) : (
                renderQueue(medQueue, "med")
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liste d'attente — Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLab ? (
                <p className="text-sm text-muted-foreground animate-pulse text-center py-8">Chargement...</p>
              ) : (
                renderQueue(labQueue, "lab")
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffPharmacy;
