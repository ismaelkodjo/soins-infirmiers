import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      setMessages(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">Messages de contact</h1>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      ) : messages.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center shadow-card">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun message reçu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="font-medium text-card-foreground">{m.name}</span>
                <span className="text-muted-foreground text-sm">{m.email}</span>
                {m.phone && <span className="text-muted-foreground text-sm">• {m.phone}</span>}
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
