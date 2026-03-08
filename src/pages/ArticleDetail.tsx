import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { articles } from "@/data/articles";
import CommentSection from "@/components/CommentSection";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const articleIndex = articles.findIndex((a) => a.slug === slug);
  const article = articles[articleIndex];

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

  const prevArticle = articleIndex > 0 ? articles[articleIndex - 1] : null;
  const nextArticle = articleIndex < articles.length - 1 ? articles[articleIndex + 1] : null;

  return (
    <div className="min-h-screen pt-16">
      {/* Hero image */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
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

            {/* Navigation between articles */}
            <div className="border-t border-border mt-12 pt-8 grid sm:grid-cols-2 gap-4">
              {prevArticle ? (
                <Link
                  to={`/blog/${prevArticle.slug}`}
                  className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow group"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-3 w-3" /> Article précédent
                  </span>
                  <p className="font-display text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {prevArticle.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {nextArticle && (
                <Link
                  to={`/blog/${nextArticle.slug}`}
                  className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow group text-right"
                >
                  <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 mb-2">
                    Article suivant <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="font-display text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {nextArticle.title}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
