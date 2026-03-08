import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ShoppingBag, MessageSquare, Users } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ articles: 0, products: 0, messages: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [a, p, m] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        articles: a.count || 0,
        products: p.count || 0,
        messages: m.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: FileText, label: "Articles", value: stats.articles, color: "bg-primary/10 text-primary" },
    { icon: ShoppingBag, label: "Produits", value: stats.products, color: "bg-accent/10 text-accent" },
    { icon: MessageSquare, label: "Messages", value: stats.messages, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">Tableau de bord</h1>
      <div className="grid sm:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl p-6 shadow-card">
            <div className={`w-11 h-11 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">{c.value}</p>
            <p className="text-muted-foreground text-sm">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
