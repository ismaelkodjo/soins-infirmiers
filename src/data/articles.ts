import blogHomeCare from "@/assets/blog-home-care.jpg";
import blogWellness from "@/assets/blog-wellness.jpg";
import blogPrevention from "@/assets/blog-prevention.jpg";
import blogMobility from "@/assets/blog-mobility.jpg";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  content: string[];
}

export const articles: Article[] = [
  {
    slug: "soins-infirmiers-domicile",
    title: "Les soins infirmiers à domicile : ce qu'il faut savoir",
    excerpt: "Découvrez les avantages des soins à domicile et comment ils peuvent améliorer votre qualité de vie au quotidien.",
    image: blogHomeCare,
    date: "5 mars 2026",
    category: "Soins à domicile",
    content: [
      "Les soins infirmiers à domicile représentent une alternative de plus en plus prisée par les patients souhaitant bénéficier de soins de qualité dans le confort de leur foyer. Cette approche permet de maintenir un lien social tout en recevant des traitements adaptés.",
      "L'un des principaux avantages des soins à domicile est la personnalisation du suivi. Contrairement aux structures hospitalières, l'infirmier à domicile peut consacrer davantage de temps à chaque patient, établissant ainsi une relation de confiance essentielle au processus de guérison.",
      "Les soins proposés à domicile couvrent un large éventail de prestations : injections, perfusions, pansements, prélèvements sanguins, surveillance des constantes vitales, aide à la prise de médicaments, et bien plus encore. L'infirmier adapte ses interventions en fonction de la prescription médicale et des besoins spécifiques de chaque patient.",
      "Pour bénéficier de soins infirmiers à domicile, une ordonnance médicale est généralement nécessaire. Les soins sont pris en charge par l'Assurance Maladie dans le cadre du parcours de soins coordonnés. Il est important de se renseigner auprès de votre médecin traitant pour organiser au mieux votre prise en charge.",
      "Le maintien à domicile contribue également au bien-être psychologique des patients. Rester dans un environnement familier, entouré de ses proches, favorise la récupération et réduit le stress souvent associé aux séjours hospitaliers prolongés.",
    ],
  },
  {
    slug: "bien-etre-prevention-conseils",
    title: "Bien-être et prévention : les conseils de votre infirmier",
    excerpt: "Des gestes simples pour préserver votre santé et prévenir les maladies courantes. Nos recommandations professionnelles.",
    image: blogWellness,
    date: "28 février 2026",
    category: "Bien-être",
    content: [
      "La prévention est le pilier fondamental d'une bonne santé. En adoptant des gestes simples au quotidien, il est possible de réduire considérablement les risques de maladies et de maintenir une qualité de vie optimale à tout âge.",
      "L'hygiène des mains reste le geste barrière le plus efficace contre la transmission des infections. Un lavage régulier des mains au savon, pendant au moins 30 secondes, peut prévenir jusqu'à 80 % des infections courantes. Pensez à vous laver les mains avant les repas, après être passé aux toilettes et en rentrant chez vous.",
      "Le sommeil joue un rôle crucial dans le maintien de votre système immunitaire. Un adulte devrait dormir entre 7 et 9 heures par nuit. Pour améliorer la qualité de votre sommeil, évitez les écrans au moins une heure avant le coucher, maintenez une température fraîche dans votre chambre et établissez une routine régulière.",
      "L'activité physique régulière est un autre facteur clé de prévention. Nul besoin de pratiquer un sport intense : 30 minutes de marche quotidienne suffisent à renforcer le système cardiovasculaire, améliorer l'humeur et maintenir la mobilité articulaire.",
      "Enfin, n'oubliez pas les visites de contrôle régulières chez votre médecin traitant et les dépistages recommandés selon votre âge. La détection précoce des maladies augmente considérablement les chances de guérison et de prise en charge efficace.",
    ],
  },
  {
    slug: "alimentation-sante-nutrition",
    title: "Alimentation et santé : les bases d'une bonne nutrition",
    excerpt: "Comment une alimentation équilibrée peut renforcer votre système immunitaire et prévenir de nombreuses pathologies.",
    image: blogPrevention,
    date: "20 février 2026",
    category: "Prévention",
    content: [
      "Une alimentation équilibrée est la pierre angulaire d'une bonne santé. Ce que nous mangeons influence directement notre énergie, notre humeur, notre système immunitaire et notre capacité à résister aux maladies.",
      "Les fruits et légumes devraient constituer la base de notre alimentation quotidienne. Riches en vitamines, minéraux et antioxydants, ils protègent nos cellules contre le vieillissement prématuré et renforcent nos défenses naturelles. L'objectif recommandé est de consommer au moins 5 portions de fruits et légumes par jour.",
      "Les protéines sont essentielles à la construction et à la réparation des tissus. Variez vos sources : viandes maigres, poissons, œufs, légumineuses et produits laitiers. Les poissons gras comme le saumon ou le maquereau apportent également des oméga-3, bénéfiques pour la santé cardiovasculaire.",
      "L'hydratation est souvent négligée mais elle est fondamentale. Il est recommandé de boire au moins 1,5 litre d'eau par jour, davantage en cas de chaleur ou d'activité physique. L'eau est préférable aux boissons sucrées qui contribuent à la prise de poids et aux problèmes dentaires.",
      "Pour les personnes suivant un traitement médical, certains aliments peuvent interagir avec les médicaments. N'hésitez pas à consulter votre infirmier ou votre pharmacien pour obtenir des conseils nutritionnels adaptés à votre situation particulière.",
    ],
  },
  {
    slug: "mobilite-autonomie-exercices",
    title: "Mobilité et autonomie : exercices pour rester en forme",
    excerpt: "Des exercices simples à pratiquer chez soi pour maintenir sa mobilité et préserver son autonomie au quotidien.",
    image: blogMobility,
    date: "15 février 2026",
    category: "Bien-être",
    content: [
      "Maintenir sa mobilité est essentiel pour conserver son autonomie et sa qualité de vie, en particulier en avançant en âge. Des exercices simples, pratiqués régulièrement, peuvent faire une différence considérable dans votre quotidien.",
      "Les exercices d'équilibre sont particulièrement importants pour prévenir les chutes, première cause d'accidents domestiques chez les personnes âgées. Essayez de vous tenir sur un pied pendant 30 secondes, en vous tenant à une chaise si nécessaire. Répétez cet exercice plusieurs fois par jour pour renforcer progressivement votre stabilité.",
      "Les étirements doux permettent de maintenir la souplesse articulaire et de réduire les raideurs matinales. Prenez quelques minutes chaque matin pour étirer vos bras, vos jambes et votre dos. Ces mouvements simples améliorent la circulation sanguine et réduisent les tensions musculaires.",
      "Le renforcement musculaire ne nécessite pas forcément d'équipement. Des exercices comme se lever et s'asseoir d'une chaise, monter des escaliers ou faire des petites flexions renforcent les muscles des jambes et du dos, essentiels pour la marche et les activités quotidiennes.",
      "Si vous avez des limitations physiques ou des pathologies particulières, demandez conseil à votre infirmier ou à un kinésithérapeute. Ils pourront vous proposer un programme d'exercices adapté à votre condition et vous accompagner dans votre progression de manière sécurisée.",
    ],
  },
];
