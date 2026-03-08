import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  date: string;
  category: string;
  content: string[];
};

export const useArticles = () => {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, image_url, date, category, content")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useArticle = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async (): Promise<Article | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, image_url, date, category, content")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};
