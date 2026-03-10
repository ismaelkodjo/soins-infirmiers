import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, FlaskConical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StaffLabResults = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [referenceRange, setReferenceRange] = useState("");
  const [notes, setNotes] = useState("");

  // All lab results
  const { data: results, isLoading } = useQuery({
    queryKey: ["staff-lab-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      if (!data?.length) return [];

      // Fetch patient profiles
      const patientIds = [...new Set(data.map((r) => r.patient_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", patientIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

      return data.map((r) => ({
        ...r,
        patient_name: profileMap.get(r.patient_id) || "Patient inconnu",
      }));
    },
  });

  const pendingResults = results?.filter((r) => r.status === "en attente") || [];
  const completedResults = results?.filter((r) => r.status === "terminé") || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lab_results").insert({
        patient_id: patientId,
        staff_id: user!.id,
        test_name: testName,
        result,
        unit: unit || null,
        reference_range: referenceRange || null,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-lab-results"] });
      toast.success("Résultat ajouté avec succès");
      setOpen(false);
      setPatientId("");
      setTestName("");
      setResult("");
      setUnit("");
      setReferenceRange("");
      setNotes("");
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Complete a pending lab result
  const completeMutation = useMutation({
    mutationFn: async ({ id, resultValue, unitValue, refRange, notesValue }: {
      id: string; resultValue: string; unitValue: string; refRange: string; notesValue: string;
    }) => {
      const { error } = await supabase
        .from("lab_results")
        .update({
          result: resultValue,
          unit: unitValue || null,
          reference_range: refRange || null,
          notes: notesValue || null,
          status: "terminé",
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-lab-results"] });
      queryClient.invalidateQueries({ queryKey: ["staff-patients-confirmed"] });
      toast.success("Résultat enregistré et marqué comme terminé");
      setEditingId(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editResult, setEditResult] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editRefRange, setEditRefRange] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const startEditing = (r: any) => {
    setEditingId(r.id);
    setEditResult(r.result || "");
    setEditUnit(r.unit || "");
    setEditRefRange(r.reference_range || "");
    setEditNotes(r.notes || "");
  };

  const statusColors: Record<string, string> = {
    "en attente": "bg-yellow-100 text-yellow-800",
    "terminé": "bg-green-100 text-green-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Résultats de laboratoire</h1>
          <p className="text-sm text-muted-foreground">Saisir et consulter les résultats d'analyses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nouveau résultat</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un résultat</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
              className="space-y-4"
            >
              <div>
                <Label>ID Patient</Label>
                <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} required placeholder="UUID du patient" />
              </div>
              <div>
                <Label>Nom de l'analyse</Label>
                <Input value={testName} onChange={(e) => setTestName(e.target.value)} required placeholder="Hémoglobine, Glycémie..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Résultat</Label>
                  <Input value={result} onChange={(e) => setResult(e.target.value)} required placeholder="12.5" />
                </div>
                <div>
                  <Label>Unité</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="g/dL" />
                </div>
              </div>
              <div>
                <Label>Valeurs de référence</Label>
                <Input value={referenceRange} onChange={(e) => setReferenceRange(e.target.value)} placeholder="12.0 - 16.0" />
              </div>
              <div>
                <Label>Notes (optionnel)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Enregistrement..." : "Enregistrer le résultat"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      ) : !results?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucun résultat de laboratoire</p>
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Users className="h-4 w-4" />
              En attente ({pendingResults.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              Terminés ({completedResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {!pendingResults.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune analyse en attente</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Analyse demandée</TableHead>
                      <TableHead>Date demande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingResults.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-sm">{r.patient_name}</TableCell>
                        <TableCell className="text-sm">{r.test_name}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(r.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[r.status] || ""}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === r.id ? (
                            <Dialog open onOpenChange={() => setEditingId(null)}>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Saisir le résultat — {r.test_name}</DialogTitle>
                                </DialogHeader>
                                <div className="bg-muted/50 rounded-lg p-3 mb-2">
                                  <p className="text-sm font-medium">Patient : {r.patient_name}</p>
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label>Résultat</Label>
                                      <Input value={editResult} onChange={(e) => setEditResult(e.target.value)} placeholder="12.5" />
                                    </div>
                                    <div>
                                      <Label>Unité</Label>
                                      <Input value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="g/dL" />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Valeurs de référence</Label>
                                    <Input value={editRefRange} onChange={(e) => setEditRefRange(e.target.value)} placeholder="12.0 - 16.0" />
                                  </div>
                                  <div>
                                    <Label>Notes</Label>
                                    <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} />
                                  </div>
                                  <Button
                                    onClick={() => completeMutation.mutate({
                                      id: r.id,
                                      resultValue: editResult,
                                      unitValue: editUnit,
                                      refRange: editRefRange,
                                      notesValue: editNotes,
                                    })}
                                    disabled={!editResult.trim() || completeMutation.isPending}
                                    className="w-full"
                                  >
                                    {completeMutation.isPending ? "Enregistrement..." : "Valider et terminer"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => startEditing(r)}
                          >
                            <FlaskConical className="h-3.5 w-3.5" /> Saisir résultat
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {!completedResults.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun résultat terminé</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Analyse</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedResults.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-sm">{r.patient_name}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(r.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-sm">{r.test_name}</TableCell>
                        <TableCell className="text-sm">{r.result} {r.unit}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.reference_range || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[r.status] || ""}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StaffLabResults;
