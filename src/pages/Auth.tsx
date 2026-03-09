import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (forgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email de réinitialisation envoyé !");
        setForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
        navigate("/");
      } else {
        if (password !== confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Inscription réussie ! Vérifiez votre email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Infirmier Santé</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {forgotPassword ? "Mot de passe oublié" : isLogin ? "Connexion" : "Inscription"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {forgotPassword
              ? "Entrez votre email pour réinitialiser votre mot de passe"
              : isLogin
              ? "Connectez-vous à votre espace patient"
              : "Créez votre compte patient"}
          </p>
          {!forgotPassword && (
            <div className="mt-4 bg-accent/50 border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
              <p>
                L'<strong className="text-foreground">Espace Patient</strong> vous permet de gérer vos rendez-vous, consulter vos documents médicaux et suivre votre santé. Un compte est nécessaire pour y accéder.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-card space-y-5">
          {!isLogin && !forgotPassword && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="jean@exemple.fr"
              />
            </div>
          </div>

          {!forgotPassword && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          )}

          {!isLogin && !forgotPassword && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          )
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Chargement..."
            ) : (
              <>
                {forgotPassword ? "Envoyer le lien" : isLogin ? "Se connecter" : "S'inscrire"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="text-center space-y-2 pt-2">
            {isLogin && !forgotPassword && (
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            )}
            <p className="text-sm text-muted-foreground">
              {forgotPassword ? (
                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="text-primary hover:underline"
                >
                  Retour à la connexion
                </button>
              ) : isLogin ? (
                <>
                  Pas encore de compte ?{" "}
                  <button type="button" onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                    S'inscrire
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{" "}
                  <button type="button" onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
