import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Upload, Calendar, FileText, Trash2, Download } from "lucide-react";

interface Profile {
  user_id: string;
  display_name: string | null;
}

interface PatientDocument {
  id: string;
  user_id: string;
  type: string;
  title: string;
  file_url: string;
  created_at: string;
}

interface Appointment {
  id: string;
  user_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  created_at: string;
}

const AdminPatients = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Document form
  const [docOpen, setDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({ user_id: "", type: "result", title: "" });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docSubmitting, setDocSubmitting] = useState(false);

  // Appointment form
  const [apptOpen, setApptOpen] = useState(false);
  const [apptForm, setApptForm] = useState({ user_id: "", date: "", time: "", type: "" });
  const [apptSubmitting, setApptSubmitting] = useState(false);

  const fetchData = async () => {
    const [profilesRes, docsRes, apptsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("patient_documents").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("date", { ascending: false }),
    ]);
    setProfiles(profilesRes.data || []);
    setDocuments(docsRes.data || []);
    setAppointments(apptsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPatientName = (userId: string) => {
    const p = profiles.find((pr) => pr.user_id === userId);
    return p?.display_name || userId.slice(0, 8) + "...";
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !docForm.user_id) return;
    setDocSubmitting(true);

    const filePath = `${docForm.user_id}/${Date.now()}_${docFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("patient-documents")
      .upload(filePath, docFile);

    if (uploadError) {
      toast({ title: "Erreur", description: "Impossible d'uploader le fichier.", variant: "destructive" });
      setDocSubmitting(false);
      return;
    }

    const { error } = await supabase.from("patient_documents").insert({
      user_id: docForm.user_id,
      type: docForm.type,
      title: docForm.title,
      file_url: filePath,
    });

    setDocSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Document envoyé au patient." });
      setDocOpen(false);
      setDocForm({ user_id: "", type: "result", title: "" });
      setDocFile(null);
      fetchData();
    }
  };

  const handleDeleteDoc = async (doc: PatientDocument) => {
    await supabase.storage.from("patient-documents").remove([doc.file_url]);
    await supabase.from("patient_documents").delete().eq("id", doc.id);
    toast({ title: "Document supprimé" });
    fetchData();
  };

  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptForm.user_id) return;
    setApptSubmitting(true);

    const { error } = await supabase.from("appointments").insert({
      user_id: apptForm.user_id,
      date: apptForm.date,
      time: apptForm.time,
      type: apptForm.type,
    });

    setApptSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Rendez-vous assigné au patient." });
      setApptOpen(false);
      setApptForm({ user_id: "", date: "", time: "", type: "" });
      fetchData();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    toast({ title: "Statut mis à jour" });
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground animate-pulse">Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Gestion des patients</h1>

      <Tabs defaultValue="documents">
        <TabsList className="mb-6">
          <TabsTrigger value="documents">Résultats & Ordonnances</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <div className="flex justify-end mb-4">
            <Dialog open={docOpen} onOpenChange={setDocOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Upload className="h-4 w-4 mr-1" /> Envoyer un document</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Envoyer un document au patient</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDocSubmit} className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Patient</label>
                    <Select value={docForm.user_id} onValueChange={(v) => setDocForm({ ...docForm, user_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un patient" /></SelectTrigger>
                      <SelectContent>
                        {profiles.map((p) => (
                          <SelectItem key={p.user_id} value={p.user_id}>
                            {p.display_name || p.user_id.slice(0, 8) + "..."}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <Select value={docForm.type} onValueChange={(v) => setDocForm({ ...docForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="result">Résultat d'analyse</SelectItem>
                        <SelectItem value="prescription">Ordonnance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Titre</label>
                    <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="Ex: Bilan sanguin mars 2026" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Fichier PDF</label>
                    <Input type="file" accept=".pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={docSubmitting}>
                    {docSubmitting ? "Envoi..." : "Envoyer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {documents.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-card">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun document envoyé pour le moment.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{getPatientName(doc.user_id)}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${doc.type === "result" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {doc.type === "result" ? "Résultat" : "Ordonnance"}
                        </span>
                      </TableCell>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments">
          <div className="flex justify-end mb-4">
            <Dialog open={apptOpen} onOpenChange={setApptOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Calendar className="h-4 w-4 mr-1" /> Assigner un rendez-vous</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assigner un rendez-vous</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleApptSubmit} className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Patient</label>
                    <Select value={apptForm.user_id} onValueChange={(v) => setApptForm({ ...apptForm, user_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un patient" /></SelectTrigger>
                      <SelectContent>
                        {profiles.map((p) => (
                          <SelectItem key={p.user_id} value={p.user_id}>
                            {p.display_name || p.user_id.slice(0, 8) + "..."}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Type de soin</label>
                    <Input value={apptForm.type} onChange={(e) => setApptForm({ ...apptForm, type: e.target.value })} placeholder="Ex: Prise de sang, Pansement..." required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground">Date</label>
                      <Input type="date" value={apptForm.date} onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Heure</label>
                      <Input type="time" value={apptForm.time} onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={apptSubmitting}>
                    {apptSubmitting ? "Envoi..." : "Assigner le rendez-vous"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-card">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun rendez-vous pour le moment.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-medium">{getPatientName(appt.user_id)}</TableCell>
                      <TableCell>{appt.type}</TableCell>
                      <TableCell>{new Date(appt.date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{appt.time.slice(0, 5)}</TableCell>
                      <TableCell>
                        <Select value={appt.status} onValueChange={(v) => handleUpdateStatus(appt.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="à venir">À venir</SelectItem>
                            <SelectItem value="confirmé">Confirmé</SelectItem>
                            <SelectItem value="annulé">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right" />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPatients;
