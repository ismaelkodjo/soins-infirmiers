
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Autre',
  image_url TEXT NOT NULL DEFAULT '/placeholder.svg',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url) VALUES
('Tensiomètre électronique', 'Tensiomètre automatique au bras avec écran LCD large. Mesure précise de la tension artérielle et du pouls.', 25000, 'Diagnostic', '/placeholder.svg'),
('Oxymètre de pouls', 'Oxymètre digital portable pour mesurer la saturation en oxygène et la fréquence cardiaque.', 15000, 'Diagnostic', '/placeholder.svg'),
('Thermomètre infrarouge', 'Thermomètre sans contact avec lecture instantanée. Idéal pour enfants et adultes.', 12000, 'Diagnostic', '/placeholder.svg'),
('Glucomètre complet', 'Kit complet avec lancettes et bandelettes pour le suivi de la glycémie à domicile.', 20000, 'Diagnostic', '/placeholder.svg'),
('Fauteuil roulant pliable', 'Fauteuil roulant léger en aluminium, pliable pour le transport facile.', 150000, 'Mobilité', '/placeholder.svg'),
('Béquilles réglables', 'Paire de béquilles en aluminium avec hauteur réglable et embouts antidérapants.', 18000, 'Mobilité', '/placeholder.svg'),
('Lit médicalisé', 'Lit médicalisé électrique avec télécommande, barrières latérales et matelas.', 450000, 'Mobilier médical', '/placeholder.svg'),
('Nébuliseur portable', 'Nébuliseur ultrasonique portable pour le traitement des affections respiratoires.', 35000, 'Soins respiratoires', '/placeholder.svg'),
('Kit de premiers secours', 'Kit complet avec pansements, désinfectant, ciseaux, gants et bandages.', 8000, 'Soins généraux', '/placeholder.svg'),
('Stéthoscope professionnel', 'Stéthoscope double pavillon pour auscultation cardiaque et pulmonaire.', 30000, 'Diagnostic', '/placeholder.svg');
