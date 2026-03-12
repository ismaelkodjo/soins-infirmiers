import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Mail, Lock, User, ArrowRight, Check, X, Eye, EyeOff, Stethoscope, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS, type StaffRole } from "@/hooks/useStaffRole";

type ProfileType = "patient" | "personnel" | "admin";

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

const profileTypes: { value: ProfileType; label: string; icon: typeof UserRound; description: string }[] = [
  { value: "patient", label: "Patient", icon: UserRound, description: "Gérer vos rendez-vous et documents" },
  { value: "personnel", label: "Personnel", icon: Stethoscope, description: "Accès professionnel au cabinet" },
  { value: "admin", label: "Administrateur", icon: ShieldCheck, description: "Gestion complète du cabinet" },
];

const Auth = () => {
  const [profileType, setProfileType] = useState<ProfileType>("patient");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("medecin");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const rulesStatus = useMemo(
    () => passwordRules.map((r) => ({ ...r, valid: r.test(password) })),
    [password]
  );
  const allRulesValid = rulesStatus.every((r) => r.valid);

  // Admin can't sign up — only login
  const canSignUp = profileType !== "admin";

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
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (profileType === "personnel") {
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
        } else if (profileType === "admin") {
          const { data: isAdmin } = await supabase.rpc("has_role" as any, {
            _user_id: authData.user.id,
            _role: "admin",
          });
          if (!isAdmin) {
            await supabase.auth.signOut();
            toast.error("Ce compte n'a pas les droits administrateur.");
            return;
          }
          toast.success("Connexion réussie !");
          navigate("/admin");
        } else {
          toast.success("Connexion réussie !");
          navigate("/espace-patient");
        }
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

        if (profileType === "personnel" && authData.user) {
          const { error: staffError } = await supabase.from("staff_members").insert({
            user_id: authData.user.id,
            role: selectedRole,
          });
          if (staffError) console.error("Staff registration error:", staffError);
          toast.success("Inscription réussie ! Vérifiez votre email. Un administrateur devra valider votre compte.");
        } else {
          toast.success("Inscription réussie ! Vérifiez votre email.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profileTypes.find((p) => p.value === profileType)!;
  const Icon = currentProfile.icon;

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md mx-4">
        {/* Profile type selector */}
        <div className="flex gap-2 mb-6">
          {profileTypes.map((pt) => {
            const PtIcon = pt.icon;
            const active = profileType === pt.value;
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => {
                  setProfileType(pt.value);
                  if (pt.value === "admin") setIsLogin(true);
                  setForgotPassword(false);
                }}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <PtIcon className="h-5 w-5" />
                {pt.label}
              </button>
            );
          })}
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Icon className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">{currentProfile.label}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {forgotPassword ? "Mot de passe oublié" : isLogin ? "Connexion" : "Inscription"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{currentProfile.description}</p>

          {profileType === "personnel" && !forgotPassword && (
            <div className="mt-3 bg-accent/50 border border-border rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
              Cet espace est réservé au <strong className="text-foreground">personnel du cabinet</strong>. Votre compte devra être validé par un administrateur.
            </div>
          )}
          {profileType === "admin" && (
            <div className="mt-3 bg-accent/50 border border-border rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
              Seuls les <strong className="text-foreground">administrateurs</strong> peuvent se connecter ici. Les inscriptions ne sont pas ouvertes.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-7 shadow-card space-y-4">
          {/* Display name — signup only, not admin */}
          {!isLogin && !forgotPassword && canSignUp && (
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
                  placeholder={profileType === "personnel" ? "Dr. Jean Dupont" : "Jean Dupont"}
                />
              </div>
            </div>
          )}

          {/* Staff role selector — signup personnel only */}
          {!isLogin && !forgotPassword && profileType === "personnel" && (
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
          )}

          {/* Email */}
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

          {/* Password */}
          {!forgotPassword && (
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
                      {rule.valid ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-destructive" />}
                      <span className={rule.valid ? "text-primary" : "text-muted-foreground"}>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Confirm password — signup only */}
          {!isLogin && !forgotPassword && canSignUp && (
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
                {forgotPassword ? "Envoyer le lien" : isLogin ? "Se connecter" : "S'inscrire"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="text-center space-y-2 pt-2">
            {isLogin && !forgotPassword && (
              <button type="button" onClick={() => setForgotPassword(true)} className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            )}
            <p className="text-sm text-muted-foreground">
              {forgotPassword ? (
                <button type="button" onClick={() => setForgotPassword(false)} className="text-primary hover:underline">
                  Retour à la connexion
                </button>
              ) : canSignUp ? (
                isLogin ? (
                  <>
                    Pas encore de compte ?{" "}
                    <button type="button" onClick={() => setIsLogin(false)} className="text-primary hover:underline">S'inscrire</button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{" "}
                    <button type="button" onClick={() => setIsLogin(true)} className="text-primary hover:underline">Se connecter</button>
                  </>
                )
              ) : null}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
