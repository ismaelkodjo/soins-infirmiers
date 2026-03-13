import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold mb-4">
              <Heart className="h-5 w-5 fill-primary text-primary" />
              Infirmier Santé
            </Link>
            <p className="text-sm opacity-70 leading-relaxed">
              Des soins infirmiers professionnels à domicile, avec bienveillance et expertise.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Accueil</Link></li>
              <li><Link to="/blog" className="hover:opacity-100 transition-opacity">Blog</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>📞 +22890140074</li>
              <li>📧 sakpanikodjo@gmail.com</li>
              <li>📍 Dapaong, Togo</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-50">
          © 2026 Infirmier Santé. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
