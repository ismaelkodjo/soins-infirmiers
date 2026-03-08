import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";

const Blog = () => {
  const { data: articles = [], isLoading } = useArticles();

  return (
    <div className="min-h-screen pt-16">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Le Blog Santé
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Conseils, actualités et informations pour prendre soin de votre santé au quotidien.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden shadow-card animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-muted rounded w-20" />
                    <div className="h-5 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((article) => (
                <Link to={`/blog/${article.slug}`} key={article.slug} className="group">
                  <article className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {article.category}
                      </span>
                      <h2 className="font-display text-lg font-semibold text-card-foreground mt-2 mb-3 leading-snug">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          {article.date}
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          Lire <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
