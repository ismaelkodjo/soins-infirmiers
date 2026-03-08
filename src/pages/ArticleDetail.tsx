import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import { useArticle } from "@/hooks/useArticles";
import CommentSection from "@/components/CommentSection";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="h-[40vh] min-h-[300px] bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            <div className="h-5 bg-muted rounded w-full animate-pulse" />
            <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Article introuvable</h1>
          <Link to="/blog" className="text-primary font-semibold hover:underline">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero image */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-3 py-1 rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-background leading-tight max-w-3xl">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 text-background/70 text-sm mt-4">
              <Calendar className="h-4 w-4" />
              {article.date}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>

            <div className="space-y-6">
              {article.content.map((paragraph, i) => (
                <p key={i} className="text-foreground/85 leading-relaxed text-base font-body">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Comments */}
            <CommentSection articleSlug={article.slug} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
