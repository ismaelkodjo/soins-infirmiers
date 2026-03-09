import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StaffOrdonnances = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");

  const { data: ordonnances, isLoading } = useQuery({
    queryKey: ["staff-ordonnances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordonnances")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ordonnances").insert({
        patient_id: patientId,
        staff_id: user!.id,
        diagnosis,
        medications: medications.split("\n").filter(Boolean),
        content,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-ordonnances"] });
      toast.success("Ordonnance créée avec succès");
      setOpen(false);
      setPatientId("");
      setDiagnosis("");
      setMedications("");
      setContent("");
      setNotes("");
    },
    onError: (error: any) => toast.error(error.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Ordonnances</h1>
          <p className="text-sm text-muted-foreground">Gérer les ordonnances des patients</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nouvelle ordonnance</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une ordonnance</DialogTitle>
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
                <Label>Diagnostic</Label>
                <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
              </div>
              <div>
                <Label>Médicaments (un par ligne)</Label>
                <Textarea value={medications} onChange={(e) => setMedications(e.target.value)} rows={4} placeholder="Amoxicilline 500mg&#10;Paracétamol 1g" />
              </div>
              <div>
                <Label>Contenu / Instructions</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Notes (optionnel)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Création..." : "Créer l'ordonnance"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      ) : !ordonnances?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucune ordonnance pour le moment</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Diagnostic</TableHead>
                <TableHead>Médicaments</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordonnances.map((ord) => (
                <TableRow key={ord.id}>
                  <TableCell className="text-sm">
                    {new Date(ord.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-sm">{ord.diagnosis}</TableCell>
                  <TableCell className="text-sm">{ord.medications?.join(", ")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ord.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StaffOrdonnances;
