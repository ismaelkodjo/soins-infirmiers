import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Mail, Lock, User, ArrowRight, Check, X, Eye, EyeOff, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS, type StaffRole } from "@/hooks/useStaffRole";

const passwordRules = [
  { label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /\d/.test(p) },
  { label: "Un caractère spécial (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const STAFF_ROLES: StaffRole[] = [
  "medecin",
  "infirmier_diplome",
  "sage_femme",
  "technicien_labo",
  "infirmier_auxiliaire",
  "accoucheuse_auxiliaire",
  "pharmacien",
];

const StaffAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("medecin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const rulesStatus = useMemo(
    () => passwordRules.map((r) => ({ ...r, valid: r.test(password) })),
    [password]
  );
  const allRulesValid = rulesStatus.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Verify staff membership or admin role
        const { data: staff } = await supabase
          .from("staff_members")
          .select("approved")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        const { data: isAdmin } = await supabase.rpc("has_role" as any, {
          _user_id: authData.user.id,
          _role: "admin",
        });

        if (!staff && !isAdmin) {
          await supabase.auth.signOut();
          toast.error("Ce compte n'est pas enregistré comme personnel du cabinet.");
          return;
        }

        toast.success("Connexion réussie !");
        navigate("/staff");
      } else {
        if (!allRulesValid) {
          toast.error("Le mot de passe ne respecte pas toutes les règles de complexité");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }

        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Register as staff member
        if (authData.user) {
          const { error: staffError } = await supabase.from("staff_members").insert({
            user_id: authData.user.id,
            role: selectedRole,
          });
          if (staffError) {
            console.error("Staff registration error:", staffError);
          }
        }

        toast.success("Inscription réussie ! Vérifiez votre email. Un administrateur devra valider votre compte.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Espace Personnel</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {isLogin ? "Connexion" : "Inscription"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin
              ? "Connectez-vous à votre espace professionnel"
              : "Créez votre compte professionnel"}
          </p>
          <div className="mt-4 bg-accent/50 border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
            <p>
              Cet espace est réservé au <strong className="text-foreground">personnel du cabinet</strong>. Votre compte devra être validé par un administrateur après inscription.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-card space-y-5">
          {!isLogin && (
            <>
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
                    placeholder="Dr. Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fonction</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
                  className="w-full border border-input rounded-lg px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
            </>
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
                placeholder="jean@cabinet.fr"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input rounded-lg pl-10 pr-10 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isLogin && password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {rulesStatus.map((rule) => (
                  <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                    {rule.valid ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className={rule.valid ? "text-primary" : "text-muted-foreground"}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-input rounded-lg pl-10 pr-10 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Chargement..." : (
              <>
                {isLogin ? "Se connecter" : "S'inscrire"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-muted-foreground">
              {isLogin ? (
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
            <p className="text-xs text-muted-foreground">
              Vous êtes un patient ?{" "}
              <a href="/auth" className="text-primary hover:underline">
                Accéder à l'espace patient
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffAuth;
