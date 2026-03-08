import blogHomeCare from "@/assets/blog-home-care.jpg";
import blogWellness from "@/assets/blog-wellness.jpg";
import blogPrevention from "@/assets/blog-prevention.jpg";
import { Calendar } from "lucide-react";

const articles = [
  {
    title: "Les soins infirmiers à domicile : ce qu'il faut savoir",
    excerpt: "Découvrez les avantages des soins à domicile et comment ils peuvent améliorer votre qualité de vie au quotidien.",
    image: blogHomeCare,
    date: "5 mars 2026",
    category: "Soins à domicile",
  },
  {
    title: "Bien-être et prévention : les conseils de votre infirmier",
    excerpt: "Des gestes simples pour préserver votre santé et prévenir les maladies courantes. Nos recommandations professionnelles.",
    image: blogWellness,
    date: "28 février 2026",
    category: "Bien-être",
  },
  {
    title: "Alimentation et santé : les bases d'une bonne nutrition",
    excerpt: "Comment une alimentation équilibrée peut renforcer votre système immunitaire et prévenir de nombreuses pathologies.",
    image: blogPrevention,
    date: "20 février 2026",
    category: "Prévention",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
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

      {/* Articles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.title}
                className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 group cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {article.category}
                  </span>
                  <h2 className="font-display text-xl font-semibold text-card-foreground mt-2 mb-3 leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    {article.date}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
