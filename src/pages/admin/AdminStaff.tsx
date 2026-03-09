import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, Trash2, UserCheck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, string> = {
  medecin: "Médecin",
  infirmier_diplome: "Infirmier(e) diplômé(e) d'État",
  sage_femme: "Sage-femme d'État",
  technicien_labo: "Technicien supérieur de laboratoire",
  infirmier_auxiliaire: "Infirmier(e) auxiliaire d'État",
  accoucheuse_auxiliaire: "Accoucheuse auxiliaire d'État",
};

interface StaffMember {
  id: string;
  user_id: string;
  role: string;
  approved: boolean;
  created_at: string;
  profile?: {
    display_name: string | null;
  } | null;
}

const AdminStaff = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: staffMembers = [], isLoading } = useQuery({
    queryKey: ["admin-staff-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select(`
          id,
          user_id,
          role,
          approved,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((staff) => ({
        ...staff,
        profile: profileMap.get(staff.user_id) || null,
      })) as StaffMember[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("staff_members")
        .update({ approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-members"] });
      toast({
        title: approved ? "Membre validé" : "Membre refusé",
        description: approved
          ? "Le membre du personnel a été validé avec succès."
          : "L'accès du membre a été révoqué.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-staff-members"] });
      setDeleteId(null);
      toast({
        title: "Membre supprimé",
        description: "L'inscription a été supprimée.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce membre.",
        variant: "destructive",
      });
    },
  });

  const pendingStaff = staffMembers.filter((s) => !s.approved);
  const approvedStaff = staffMembers.filter((s) => s.approved);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Gestion du personnel
      </h1>

      {/* Pending Staff Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-warning" />
            Inscriptions en attente
            {pendingStaff.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingStaff.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingStaff.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Aucune inscription en attente de validation.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      {staff.profile?.display_name || "Nom non défini"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROLE_LABELS[staff.role] || staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(staff.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          approveMutation.mutate({ id: staff.id, approved: true })
                        }
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(staff.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Staff Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-primary" />
            Personnel validé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedStaff.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Aucun membre du personnel validé.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      {staff.profile?.display_name || "Nom non défini"}
                    </TableCell>
                    <TableCell>
                      <Badge>{ROLE_LABELS[staff.role] || staff.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(staff.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          approveMutation.mutate({ id: staff.id, approved: false })
                        }
                        disabled={approveMutation.isPending}
                      >
                        Révoquer l'accès
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(staff.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'inscription de ce membre du
              personnel. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStaff;
