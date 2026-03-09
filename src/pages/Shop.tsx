import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Filter, MessageCircle, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  in_stock: boolean;
}

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const categories = ["Tous", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "Tous" || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

  const handleWhatsAppOrder = (product: Product) => {
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par le produit suivant :\n\n` +
      `🏷️ ${product.name}\n` +
      `💰 Prix : ${formatPrice(product.price)}\n\n` +
      `Merci de me donner plus d'informations.`
    );
    window.open(`https://wa.me/22890140074?text=${message}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      {/* Hero */}
      <section className="container mx-auto px-4 mb-12">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary rounded-2xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShoppingBag className="h-4 w-4" />
            Matériel Médical
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Boutique de Matériel Médical
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Équipements de qualité professionnelle pour les soins à domicile et en cabinet.
            Commandez directement via WhatsApp.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border animate-pulse h-80" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square bg-secondary/50 flex items-center justify-center p-6 relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm">Rupture de stock</Badge>
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
                    {product.category}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-display font-semibold text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      disabled={!product.in_stock}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Commander
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info banner */}
      <section className="container mx-auto px-4 mt-12">
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-green-100 text-green-700 rounded-full p-4">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-display text-xl font-semibold text-foreground mb-1">
              Comment commander ?
            </h3>
            <p className="text-muted-foreground">
              Cliquez sur "Commander" pour nous contacter directement sur WhatsApp au{" "}
              <strong className="text-foreground">+228 90 14 00 74</strong>. 
              Nous vous confirmerons la disponibilité et organiserons la livraison à Dapaong et environs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Shop;
