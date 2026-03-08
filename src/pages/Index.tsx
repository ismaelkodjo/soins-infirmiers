import { Link } from "react-router-dom";
import { Stethoscope, Home, Syringe, HeartPulse, Clock, Shield, Users, Calendar, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-nurse.jpg";
import { articles } from "@/data/articles";

const services = [
  {
    icon: Syringe,
    title: "Injections & Perfusions",
    description: "Administration de traitements injectables à domicile en toute sécurité.",
  },
  {
    icon: Stethoscope,
    title: "Surveillance Médicale",
    description: "Suivi régulier de vos constantes et de votre état de santé général.",
  },
  {
    icon: Home,
    title: "Soins à Domicile",
    description: "Pansements, soins post-opératoires et accompagnement quotidien.",
  },
  {
    icon: HeartPulse,
    title: "Prévention Santé",
    description: "Conseils personnalisés pour maintenir votre bien-être au quotidien.",
  },
];

const values = [
  { icon: Clock, title: "Disponibilité", description: "7j/7, interventions rapides" },
  { icon: Shield, title: "Confiance", description: "Diplômé d'État, assuré" },
  { icon: Users, title: "Écoute", description: "Un suivi humain et attentif" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Infirmier professionnel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="text-primary-foreground/80 font-body text-lg mb-4 font-medium tracking-wide uppercase">
              Soins infirmiers à domicile
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Votre santé, notre priorité
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl font-body leading-relaxed mb-8 max-w-lg">
              Des soins professionnels et bienveillants, directement chez vous. Prenez rendez-vous dès aujourd'hui.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Prendre rendez-vous
              </Link>
              <Link
                to="/blog"
                className="border-2 border-primary-foreground/40 text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-primary-foreground/10 transition-colors"
              >
                Lire le blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mes Services
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Une gamme complète de soins infirmiers adaptés à vos besoins.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Pourquoi me choisir ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Besoin de soins à domicile ?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Contactez-moi pour planifier une visite ou obtenir des informations sur mes prestations.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Me contacter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
