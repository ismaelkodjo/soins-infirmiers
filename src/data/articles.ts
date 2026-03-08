import blogHomeCare from "@/assets/blog-home-care.jpg";
import blogWellness from "@/assets/blog-wellness.jpg";
import blogPrevention from "@/assets/blog-prevention.jpg";
import blogMobility from "@/assets/blog-mobility.jpg";

export interface Article {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

export const articles: Article[] = [
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
  {
    title: "Mobilité et autonomie : exercices pour rester en forme",
    excerpt: "Des exercices simples à pratiquer chez soi pour maintenir sa mobilité et préserver son autonomie au quotidien.",
    image: blogMobility,
    date: "15 février 2026",
    category: "Bien-être",
  },
];
