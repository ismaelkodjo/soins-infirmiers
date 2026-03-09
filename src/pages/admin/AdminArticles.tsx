import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image_url: string;
  date: string;
  published: boolean;
  content: string[];
}

const emptyForm = { title: "", slug: "", excerpt: "", category: "", image_url: "", date: "", content: "", published: false };

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchArticles = async () => {
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      category: a.category,
      image_url: a.image_url,
      date: a.date,
      content: a.content.join("\n\n"),
      published: a.published,
    });
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `articles/${Date.now()}.${ext}`;
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
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      category: form.category,
      image_url: form.image_url,
      date: form.date,
      content: form.content.split("\n\n").filter(Boolean),
      published: form.published,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("articles").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("articles").insert(payload));
    }
    setSubmitting(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Article modifié" : "Article créé" });
      setOpen(false);
      fetchArticles();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article supprimé" });
      fetchArticles();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Articles</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-0.5 text-sm">
            {([["all", "Tous"], ["published", "Publiés"], ["draft", "Brouillons"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-md transition-colors ${filter === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>
            ))}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nouvel article</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Titre</label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Slug</label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="mon-article" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Catégorie</label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="15 mars 2026" required />
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
                  <label className="text-sm font-medium text-foreground">Extrait</label>
                  <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Contenu (paragraphes séparés par une ligne vide)</label>
                  <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} id="published" />
                  <label htmlFor="published" className="text-sm text-foreground">Publié</label>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enregistrement..." : editing ? "Enregistrer" : "Créer"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {loading ? (
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground">Aucun article.</p>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Titre</th>
                <th className="p-4 font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                <th className="p-4 font-medium text-muted-foreground hidden md:table-cell">Statut</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.filter(a => filter === "all" ? true : filter === "published" ? a.published : !a.published).map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-card-foreground font-medium">{a.title}</td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell">{a.category}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {a.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminArticles;
