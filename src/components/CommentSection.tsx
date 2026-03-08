import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send, Trash2, MessageCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
  };
}

const CommentSection = ({ articleSlug }: { articleSlug: string }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id")
      .eq("article_slug", articleSlug)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      // Fetch profiles for all comment authors
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      const commentsWithProfiles = data.map((c) => ({
        ...c,
        profile: profileMap.get(c.user_id) ?? { display_name: null },
      }));

      setComments(commentsWithProfiles);
    } else {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      article_slug: articleSlug,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast.error("Erreur lors de l'envoi du commentaire");
    } else {
      toast.success("Commentaire publié !");
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Commentaire supprimé");
    }
  };

  return (
    <div className="mt-12 border-t border-border pt-10">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-primary" />
        Commentaires ({comments.length})
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            rows={3}
            maxLength={1000}
            className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Laisser un commentaire..."
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Publier
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-secondary rounded-xl p-6 text-center mb-8">
          <p className="text-muted-foreground text-sm mb-3">
            Connectez-vous pour laisser un commentaire
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Se connecter
          </Link>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {comment.profile?.display_name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-foreground/85 text-sm leading-relaxed mt-3 pl-12">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
