import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const staticLinks = [
  { to: "/", label: "Accueil" },
  { to: "/blog", label: "Blog" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
];

// Slugs already handled by static routes
const staticSlugs = ["accueil", "blog", "boutique", "contact", "auth", "reset-password", "espace-patient"];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  const { data: profile } = useQuery({
    queryKey: ["navbar-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const { data: dynamicPages } = useQuery({
    queryKey: ["navbar-pages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pages")
        .select("title, slug")
        .eq("published", true)
        .order("created_at", { ascending: true });
      return (data || []).filter((p) => !staticSlugs.includes(p.slug));
    },
    staleTime: 60_000,
  });

  const links = [
    ...staticLinks,
    ...(dynamicPages || []).map((p) => ({ to: `/page/${p.slug}`, label: p.title })),
  ];

  const displayName = profile?.display_name || user?.user_metadata?.display_name;
  const patientLabel = user && displayName ? `Espace ${displayName}` : "Espace Patient";

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span>Infirmier Santé</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
          <Link
            to="/espace-patient"
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <LayoutDashboard className="h-4 w-4" />
            Espace Patient
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm font-medium py-2 ${
                isActive(link.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium py-2 ${
                location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
          <Link
            to="/espace-patient"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-semibold justify-center"
          >
            <LayoutDashboard className="h-4 w-4" />
            Espace Patient
          </Link>
          {user && (
            <button
              onClick={() => { signOut(); setMobileOpen(false); }}
              className="block w-full text-left text-sm font-medium py-2 text-muted-foreground"
            >
              Déconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
