import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  updated_at: string;
}

const emptyForm = { title: "", slug: "", content: "", published: false };

const AdminPages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchPages = async () => {
    const { data } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
    setPages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Page) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, content: p.content, published: p.published });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { title: form.title, slug: form.slug, content: form.content, published: form.published };

    let error;
    if (editing) {
      ({ error } = await supabase.from("pages").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("pages").insert(payload));
    }
    setSubmitting(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Page modifiée" : "Page créée" });
      setOpen(false);
      fetchPages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette page ?")) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Page supprimée" });
      fetchPages();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Pages</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nouvelle page</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier la page" : "Nouvelle page"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-foreground">Titre</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ma-page" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Contenu</label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} id="published" />
                <label htmlFor="published" className="text-sm text-foreground">Publiée</label>
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
      ) : pages.length === 0 ? (
        <p className="text-muted-foreground">Aucune page.</p>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Titre</th>
                <th className="p-4 font-medium text-muted-foreground hidden sm:table-cell">Slug</th>
                <th className="p-4 font-medium text-muted-foreground hidden md:table-cell">Statut</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-card-foreground font-medium">{p.title}</td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">/{p.slug}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {p.published ? "Publiée" : "Brouillon"}
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

export default AdminPages;
