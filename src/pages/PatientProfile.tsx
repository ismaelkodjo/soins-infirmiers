import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const PatientProfile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).single();
      if (data?.display_name) setDisplayName(data.display_name);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <Link to="/espace-patient" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground mb-8">Mon profil</h1>
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        ) : (
          <form onSubmit={handleSave} className="bg-card rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Nom d'affichage</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Votre nom" />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
