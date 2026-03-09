import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  in_stock: boolean;
  published: boolean;
}

const emptyForm = { name: "", description: "", price: "0", category: "", image_url: "", in_stock: true, published: false };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      image_url: p.image_url,
      in_stock: p.in_stock,
      published: p.published,
    });
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Erreur upload", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image_url: form.image_url,
      in_stock: form.in_stock,
      published: form.published,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }
    setSubmitting(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Produit modifié" : "Produit créé" });
      setOpen(false);
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé" });
      fetchProducts();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Produits</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nouveau produit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground">Nom</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Prix (FCFA)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Catégorie</label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Image à la Une</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <div className="mt-1">
                  {form.image_url && (
                    <img src={form.image_url} alt="Aperçu" className="w-full h-32 object-cover rounded-lg mb-2 border border-border" />
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Upload...</> : <><Upload className="h-4 w-4 mr-1" /> {form.image_url ? "Changer l'image" : "Télécharger une image"}</>}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} id="in_stock" />
                  <label htmlFor="in_stock" className="text-sm text-foreground">En stock</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} id="published_prod" />
                  <label htmlFor="published_prod" className="text-sm text-foreground">Publié</label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enregistrement..." : editing ? "Enregistrer" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">Aucun produit.</p>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Nom</th>
                <th className="p-4 font-medium text-muted-foreground hidden sm:table-cell">Prix</th>
                <th className="p-4 font-medium text-muted-foreground hidden md:table-cell">Statut</th>
                <th className="p-4 font-medium text-muted-foreground hidden md:table-cell">Stock</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-card-foreground font-medium">{p.name}</td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{p.price.toLocaleString()} FCFA</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {p.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.in_stock ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                      {p.in_stock ? "En stock" : "Rupture"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
