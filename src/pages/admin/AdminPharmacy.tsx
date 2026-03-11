import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pill, Package, Clock, CheckCircle, AlertTriangle, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "medicament", label: "Médicament" },
  { value: "consommable", label: "Consommable médical" },
  { value: "equipement", label: "Équipement" },
];

const AdminPharmacy = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", category: "medicament", description: "", quantity: 0, unit: "unité", min_stock: 5, price: 0 });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["pharmacy-items"],
    queryFn: async () => {
      const { data } = await supabase.from("pharmacy_items" as any).select("*").order("name");
      return (data as any[]) || [];
    },
  });

  const { data: queue = [], isLoading: queueLoading } = useQuery({
    queryKey: ["pharmacy-queue"],
    queryFn: async () => {
      const { data } = await supabase.from("pharmacy_queue" as any).select("*").order("created_at", { ascending: false });
      return (data as any[]) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editingItem) {
        const { error } = await supabase.from("pharmacy_items" as any).update(values).eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pharmacy_items" as any).insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-items"] });
      setItemDialog(false);
      setEditingItem(null);
      resetForm();
      toast({ title: editingItem ? "Article modifié" : "Article ajouté" });
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pharmacy_items" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-items"] });
      toast({ title: "Article supprimé" });
    },
  });

  const updateQueueStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("pharmacy_queue" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-queue"] });
      toast({ title: "Statut mis à jour" });
    },
  });

  const resetForm = () => setForm({ name: "", category: "medicament", description: "", quantity: 0, unit: "unité", min_stock: 5, price: 0 });

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({ name: item.name, category: item.category, description: item.description, quantity: item.quantity, unit: item.unit, min_stock: item.min_stock, price: item.price });
    setItemDialog(true);
  };

  const openNew = () => {
    setEditingItem(null);
    resetForm();
    setItemDialog(true);
  };

  const lowStockCount = items.filter((i: any) => i.quantity <= i.min_stock).length;
  const pendingQueue = queue.filter((q: any) => q.status === "en attente").length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Pharmacie</h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{items.filter((i: any) => i.category === "medicament").length}</p>
              <p className="text-xs text-muted-foreground">Médicaments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{items.filter((i: any) => i.category === "consommable").length}</p>
              <p className="text-xs text-muted-foreground">Consommables</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">Stock faible</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{pendingQueue}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="queue">
            Liste d'attente
            {pendingQueue > 0 && (
              <Badge variant="destructive" className="ml-2 text-[10px] h-5 min-w-[20px]">{pendingQueue}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Articles en stock</CardTitle>
              <Dialog open={itemDialog} onOpenChange={setItemDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-3">
                    <Input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" placeholder="Quantité" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
                      <Input placeholder="Unité" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" placeholder="Stock min" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: +e.target.value })} />
                      <Input type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                      {editingItem ? "Modifier" : "Ajouter"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <p className="text-muted-foreground text-sm">Chargement...</p>
              ) : items.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Aucun article en stock</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {categories.find((c) => c.value === item.category)?.label || item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>{item.price} FCFA</TableCell>
                        <TableCell>
                          {item.quantity <= item.min_stock ? (
                            <Badge variant="destructive">Stock faible</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">En stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patients en attente</CardTitle>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <p className="text-muted-foreground text-sm">Chargement...</p>
              ) : queue.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Aucun patient en attente</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((q: any) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.patient_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {q.source_type === "ordonnance" ? "Ordonnance" : "Analyse"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(q.items || []).map((item: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(q.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          {q.status === "en attente" ? (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
                          ) : q.status === "dispensé" ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Dispensé</Badge>
                          ) : (
                            <Badge variant="secondary">{q.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {q.status === "en attente" && (
                            <Button size="sm" variant="outline" onClick={() => updateQueueStatus.mutate({ id: q.id, status: "dispensé" })}>
                              <CheckCircle className="h-4 w-4 mr-1" />Dispensé
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPharmacy;
