import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotFound from "./NotFound";

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (!page) return <NotFound />;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          {page.title}
        </h1>
        <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap">
          {page.content}
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
