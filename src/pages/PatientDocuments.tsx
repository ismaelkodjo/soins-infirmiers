import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const PatientDocuments = () => (
  <div className="min-h-screen pt-16 bg-background">
    <div className="container mx-auto px-4 py-10">
      <Link to="/espace-patient" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
      </Link>
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">Mes documents</h1>
      <div className="bg-card rounded-xl p-8 text-center shadow-card">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Vos ordonnances et résultats d'analyses apparaîtront ici.</p>
        <p className="text-muted-foreground text-sm mt-1">Cette fonctionnalité sera bientôt disponible.</p>
      </div>
    </div>
  </div>
);

export default PatientDocuments;
