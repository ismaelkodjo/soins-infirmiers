import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientDocument {
  id: string;
  type: string;
  title: string;
  file_url: string;
  created_at: string;
}

const PatientDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("patient_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDocuments(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleDownload = async (doc: PatientDocument) => {
    const { data } = await supabase.storage
      .from("patient-documents")
      .createSignedUrl(doc.file_url, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto px-4 py-10">
        <Link to="/espace-patient" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground mb-8">Mes documents</h1>

        {loading ? (
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        ) : documents.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-card">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun document pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-card rounded-xl p-5 shadow-card flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.type === "result" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground text-sm">{doc.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {doc.type === "result" ? "Résultat d'analyse" : "Ordonnance"} — {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                  <Download className="h-4 w-4 mr-1" /> Télécharger
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDocuments;
