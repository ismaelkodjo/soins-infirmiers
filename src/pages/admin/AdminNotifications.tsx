import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  related_table: string | null;
  related_id: string | null;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de marquer comme lu.", variant: "destructive" });
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const typeColor = (type: string) => {
    if (type === "success") return "bg-green-100 text-green-700 border-green-200";
    if (type === "warning") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-primary/10 text-primary border-primary/20";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center shadow-card">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-card rounded-xl p-4 shadow-card flex items-start gap-4 transition-opacity ${n.read ? "opacity-60" : ""}`}
            >
              <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${n.read ? "bg-muted" : "bg-primary"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-card-foreground text-sm">{n.title}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColor(n.type)}`}>
                    {n.type === "success" ? "Confirmé" : n.type === "warning" ? "Annulé" : "Info"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{n.message}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => markAsRead(n.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
