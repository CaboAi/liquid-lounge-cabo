import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const IVMenu = () => {
  const ingredients = [
    {
      category: "Vitamins",
      items: ["Vitamin B1-12", "Vitamin C", "Magnesium", "Zinc", "Vitamin D", "Vitamin A & Vitamin E"],
      description: "Essential vitamins for optimal health and energy",
      color: "bg-blue-100 text-blue-800"
    },
    {
      category: "NAD+",
      items: ["Nicotinamide adenine dinucleotide"],
      description: "Anti-aging, cardio & neuro-protective qualities. Studies show improved energy, recovery & longevity.",
      color: "bg-purple-100 text-purple-800"
    },
    {
      category: "Glutathione",
      items: ["Master antioxidant tri-peptide"],
      description: "Helps with detoxification, skin & liver health, and increasing energy.",
      color: "bg-green-100 text-green-800"
    },
    {
      category: "L-Lysine",
      items: ["Essential amino acid"],
      description: "Obtained through diet only to support collagen and immune function.",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      category: "L-Carnitine",
      items: ["Naturally occurring amino acid"],
      description: "Used for weight loss and physical & mental performance. Helps in the conversion of fat to fuel.",
      color: "bg-red-100 text-red-800"
    },
    {
      category: "Fluid & Electrolytes",
      items: ["Sodium", "Potassium", "Magnesium", "Calcium"],
      description: "Essential for all living organisms: proper hydration and cellular function.",
      color: "bg-teal-100 text-teal-800"
    }
  ];

  const ivPackages = [
    {
      name: "Hydration Hero",
      description: "Perfect for dehydration, hangovers, and general wellness",
      ingredients: ["IV Saline", "Electrolytes", "Vitamin B Complex"],
      duration: "30 minutes",
      price: "Starting at $150"
    },
    {
      name: "Energy Boost",
      description: "Combat fatigue and boost energy levels naturally",
      ingredients: ["B Vitamins", "Vitamin C", "Magnesium", "L-Carnitine"],
      duration: "45 minutes", 
      price: "Starting at $200"
    },
    {
      name: "Immunity Shield",
      description: "Strengthen your immune system and fight off illness",
      ingredients: ["High-dose Vitamin C", "Zinc", "Glutathione", "B Complex"],
      duration: "45 minutes",
      price: "Starting at $225"
    },
    {
      name: "Beauty Glow",
      description: "Anti-aging and skin health optimization",
      ingredients: ["Glutathione", "Vitamin C", "Biotin", "Collagen Support"],
      duration: "45 minutes",
      price: "Starting at $275"
    },
    {
      name: "Performance Plus",
      description: "Athletic recovery and performance enhancement", 
      ingredients: ["L-Carnitine", "L-Lysine", "B Complex", "Electrolytes", "Amino Acids"],
      duration: "60 minutes",
      price: "Starting at $300"
    },
    {
      name: "NAD+ Longevity",
      description: "Premium anti-aging and cellular repair therapy",
      ingredients: ["NAD+", "Glutathione", "Vitamin Complex", "Antioxidants"],
      duration: "90 minutes",
      price: "Starting at $450"
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="menu" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            IV Therapy Menu
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our expertly crafted IV therapy packages or let us create a custom blend tailored to your specific needs.
          </p>
        </div>

        {/* Ingredients Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Our Premium Ingredients</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredients.map((ingredient, index) => (
              <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{ingredient.category}</CardTitle>
                    <Badge className={ingredient.color}>{ingredient.category}</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {ingredient.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {ingredient.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-sm text-muted-foreground flex items-center">
                        <div className="h-1 w-1 bg-primary rounded-full mr-2"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* IV Packages */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">IV Therapy Packages</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ivPackages.map((pkg, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                    <ul className="space-y-1">
                      {pkg.ingredients.map((ingredient, ingredientIndex) => (
                        <li key={ingredientIndex} className="text-sm text-muted-foreground flex items-center">
                          <div className="h-1 w-1 bg-primary rounded-full mr-2"></div>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold">{pkg.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-bold text-primary">{pkg.price}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Ready to Book Your IV Therapy?</h3>
          <p className="text-muted-foreground mb-6">
            Contact Nathan Brown BS RN to schedule your personalized IV therapy session in Cabo San Lucas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="medical" size="lg" onClick={() => scrollToSection('contact')}>
              Book Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => scrollToSection('quiz')}>
              Find My Perfect IV
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IVMenu;