import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const IVMenu = () => {
  const nutrients = [
    {
      category: "Vitamins",
      items: ["Vitamin B1-12", "Vitamin C", "Magnesium", "Zinc", "Vitamin D", "Vitamin A & Vitamin E"],
      description: "Essential vitamins for optimal health and energy",
      color: "bg-blue-100 text-blue-800"
    },
    {
      category: "NAD+",
      items: ["Nicotinamide adenine dinucleotide"],
      description: "Nicotinamide adenine dinucleotide (NAD+) is a critical coenzyme found in every cell. Anti-aging, cardio & neuro-protective qualities. Clinical studies show improved cellular energy production, enhanced recovery, DNA repair support, and longevity benefits. May help with mental clarity, physical endurance, and metabolic function.",
      color: "bg-purple-100 text-purple-800"
    },
    {
      category: "Glutathione",
      items: ["Master antioxidant tri-peptide"],
      description: "Glutathione is the body's master antioxidant tri-peptide, composed of three amino acids. Essential for detoxification processes, supports liver health, enhances skin brightness and clarity, boosts immune function, and increases cellular energy. Known as the most important antioxidant for overall health and anti-aging.",
      color: "bg-green-100 text-green-800"
    },
    {
      category: "L-Lysine",
      items: ["Essential amino acid"],
      description: "L-Lysine is an essential amino acid that cannot be produced by the body and must be obtained through diet or supplementation. Critical for collagen synthesis, immune system support, wound healing, calcium absorption, and protein synthesis. Particularly beneficial for skin health, bone strength, and recovery.",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      category: "L-Carnitine",
      items: ["Naturally occurring amino acid"],
      description: "L-Carnitine is a naturally occurring amino acid derivative that plays a crucial role in energy metabolism. Facilitates the conversion of fat to fuel at the cellular level, supports weight management, enhances physical performance, improves mental clarity, and aids in recovery. Essential for optimal mitochondrial function and energy production.",
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
      name: "Re-Hydration",
      description: "Essential hydration therapy for optimal wellness",
      nutrients: ["1000mL Fluids", "Electrolytes like sodium, potassium, calcium, chloride"],
      duration: "30-45 minutes",
      price: "Prices starting at $120. Average spend $300. No hidden costs. Straight to your living room"
    },
    {
      name: "Post-Workout",
      description: "Perfect recovery blend for athletic performance",
      nutrients: ["Fluids & electrolytes", "L-Carnitine", "Vitamin B1, B6, B12", "Magnesium"],
      duration: "45 minutes",
      price: "Prices starting at $120. Average spend $300. No hidden costs. Straight to your living room"
    },
    {
      name: "Immunity Myers",
      description: "Immune system support with classic Myers' cocktail",
      nutrients: ["Fluids & electrolytes", "Vitamin B1, B6, B12", "Vitamin C", "Zinc", "Magnesium"],
      duration: "45 minutes",
      price: "Prices starting at $120. Average spend $300. No hidden costs. Straight to your living room"
    },
    {
      name: "The \"Cure\"",
      description: "Ultimate wellness therapy with premium antioxidants",
      nutrients: ["Fluids & electrolytes", "Vitamin B1, B6, B12", "Vitamin C", "Zinc", "Magnesium", "Glutathione"],
      duration: "60 minutes",
      price: "Prices starting at $120. Average spend $300. No hidden costs. Straight to your living room"
    },
    {
      name: "NAD+",
      description: "Premium anti-aging and cellular repair therapy",
      nutrients: ["Fluids & electrolytes", "NAD+ up to 1000mg"],
      duration: "90 minutes",
      price: "Prices starting at $120. Average spend $300. No hidden costs. Straight to your living room",
      specialNote: "Recommended add-on: Vitamin Bs to help with production of energy"
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
          <h3 className="text-2xl font-bold text-center mb-8">Our Premium Nutrients</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nutrients.map((nutrient, index) => (
              <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{nutrient.category}</CardTitle>
                    <Badge className={nutrient.color}>{nutrient.category}</Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {nutrient.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {nutrient.items.map((item, itemIndex) => (
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
                      {pkg.nutrients.map((nutrient, nutrientIndex) => (
                        <li key={nutrientIndex} className="text-sm text-muted-foreground flex items-center">
                          <div className="h-1 w-1 bg-primary rounded-full mr-2"></div>
                          {nutrient}
                        </li>
                      ))}
                    </ul>
                    {pkg.specialNote && (
                      <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                        <p className="text-sm text-primary font-medium">{pkg.specialNote}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="mb-2">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold">{pkg.duration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Pricing</div>
                      <div className="font-bold text-primary text-sm">{pkg.price}</div>
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
            Contact Nathan Brown BSN RN to schedule your personalized IV therapy session in Cabo San Lucas.
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