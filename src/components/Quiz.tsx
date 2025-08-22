import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: "What is your primary wellness goal?",
      options: [
        { value: "hydration", label: "Hydration & Recovery" },
        { value: "energy", label: "Energy & Vitality" },
        { value: "immunity", label: "Immune Support" },
        { value: "beauty", label: "Anti-aging & Beauty" },
        { value: "performance", label: "Athletic Performance" },
        { value: "detox", label: "Detoxification" }
      ]
    },
    {
      question: "How would you describe your current energy levels?",
      options: [
        { value: "very-low", label: "Very Low - Constantly Tired" },
        { value: "low", label: "Low - Often Fatigued" },
        { value: "moderate", label: "Moderate - Ups and Downs" },
        { value: "good", label: "Good - Generally Energetic" },
        { value: "excellent", label: "Excellent - High Energy" }
      ]
    },
    {
      question: "Are you currently experiencing any of these?",
      options: [
        { value: "dehydration", label: "Dehydration or Hangover" },
        { value: "stress", label: "High Stress Levels" },
        { value: "illness", label: "Fighting Off Illness" },
        { value: "exercise", label: "Post-Exercise Recovery" },
        { value: "travel", label: "Travel Fatigue" },
        { value: "none", label: "None of the Above" }
      ]
    },
    {
      question: "What's your age range?",
      options: [
        { value: "18-25", label: "18-25 years" },
        { value: "26-35", label: "26-35 years" },
        { value: "36-45", label: "36-45 years" },
        { value: "46-55", label: "46-55 years" },
        { value: "55+", label: "55+ years" }
      ]
    },
    {
      question: "How often do you exercise?",
      options: [
        { value: "never", label: "Never" },
        { value: "rarely", label: "Rarely (1-2x per month)" },
        { value: "sometimes", label: "Sometimes (1-2x per week)" },
        { value: "regularly", label: "Regularly (3-4x per week)" },
        { value: "daily", label: "Daily or Almost Daily" }
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  const getRecommendation = () => {
    const [goal, energy, condition, age, exercise] = answers;
    
    // Updated scoring logic with NAD+ bias and reduced Post-Workout dominance
    let scores = {
      "Re-Hydration": 0,
      "Immunity Myers": 0,
      "The \"Cure\"": 0,
      "NAD+": 2, // Base bias toward NAD+
      "Post-Workout": 0
    };

    // Primary goal scoring
    if (goal === "hydration") scores["Re-Hydration"] += 3;
    if (goal === "energy") scores["NAD+"] += 2;
    if (goal === "immunity") scores["Immunity Myers"] += 3;
    if (goal === "beauty") scores["The \"Cure\""] += 3;
    if (goal === "performance") scores["Post-Workout"] += 2; // Reduced from 3
    if (goal === "detox") scores["NAD+"] += 3;

    // Energy level scoring
    if (energy === "very-low" || energy === "low") {
      scores["NAD+"] += 2;
      scores["Post-Workout"] += 1; // Only small boost
    }
    if (energy === "moderate") scores["NAD+"] += 1;

    // Condition scoring - require multiple signals for Post-Workout
    if (condition === "dehydration") scores["Re-Hydration"] += 3;
    if (condition === "stress") scores["NAD+"] += 2;
    if (condition === "illness") scores["Immunity Myers"] += 3;
    if (condition === "exercise") {
      scores["Post-Workout"] += 2; // Only if also performance goal
      if (goal === "performance") scores["Post-Workout"] += 1; // Bonus only with matching goal
    }

    // Age factor
    if (age === "46-55" || age === "55+") {
      scores["NAD+"] += 1;
      scores["The \"Cure\""] += 1;
    }

    // Exercise factor - require multiple indicators for Post-Workout
    if (exercise === "regularly" || exercise === "daily") {
      if (goal === "performance" || condition === "exercise") {
        scores["Post-Workout"] += 1; // Only with supporting indicators
      } else {
        scores["NAD+"] += 1; // Otherwise boost NAD+
      }
    }

    // Find highest score
    const maxScore = Math.max(...Object.values(scores));
    const recommendedPackage = Object.keys(scores).find(pkg => scores[pkg] === maxScore) || "NAD+";

    const packageDetails = {
      "Re-Hydration": {
        description: "Essential hydration therapy for optimal wellness.",
        nutrients: ["1000mL Fluids", "Electrolytes like sodium, potassium, calcium, chloride"],
        reasoning: "Based on your responses, you need rapid hydration and electrolyte replenishment."
      },
      "Post-Workout": {
        description: "Perfect recovery blend for athletic performance.",
        nutrients: ["Fluids & electrolytes", "L-Carnitine", "Vitamin B1, B6, B12", "Magnesium"],
        reasoning: "Your active lifestyle and performance goals require enhanced recovery support."
      },
      "Immunity Myers": {
        description: "Immune system support with classic Myers' cocktail.",
        nutrients: ["Fluids & electrolytes", "Vitamin B1, B6, B12", "Vitamin C", "Zinc", "Magnesium"],
        reasoning: "Your immune system needs support. This blend will help strengthen your defenses."
      },
      "The \"Cure\"": {
        description: "Ultimate wellness therapy with premium antioxidants.",
        nutrients: ["Fluids & electrolytes", "Vitamin B1, B6, B12", "Vitamin C", "Zinc", "Magnesium", "Glutathione"],
        reasoning: "Perfect for anti-aging benefits and enhanced skin health with powerful antioxidants."
      },
      "NAD+": {
        description: "Premium anti-aging and cellular repair therapy.",
        nutrients: ["Fluids & electrolytes", "NAD+ up to 1000mg"],
        reasoning: "Ideal for energy enhancement, cellular repair, and overall wellness optimization."
      }
    };

    return {
      package: recommendedPackage,
      ...packageDetails[recommendedPackage]
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (showResult) {
    const recommendation = getRecommendation();
    
    return (
      <section id="quiz" className="py-20 bg-gradient-to-br from-primary/5 to-wellness-cream/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Your Perfect IV Match!</CardTitle>
                <CardDescription>Based on your responses, here's our recommendation:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <h3 className="text-xl font-bold text-primary mb-2">{recommendation.package}</h3>
                  <p className="text-muted-foreground mb-4">{recommendation.description}</p>
                  <p className="text-sm text-muted-foreground italic">{recommendation.reasoning}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">This therapy includes:</h4>
                  <ul className="space-y-2">
                    {recommendation.nutrients.map((nutrient, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mr-3"></div>
                        {nutrient}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    variant="medical" 
                    className="flex-1" 
                    onClick={() => {
                      const subject = `Book ${recommendation.package} IV Therapy`;
                      const body = `Hi Nurse Nate,

I completed the IV therapy quiz and I'm interested in booking the ${recommendation.package} treatment.

Here are my quiz results:
- Package: ${recommendation.package}
- Description: ${recommendation.description}
- Reasoning: ${recommendation.reasoning}

Please let me know your availability and pricing.

Thank you!`;
                      window.location.href = `mailto:liquidloungeiv@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                  >
                    Book This Treatment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`https://wa.me/526242287777?text=Hi%20Nurse%20Nate,%20I%20completed%20the%20IV%20quiz%20and%20I%27m%20interested%20in%20the%20${encodeURIComponent(getRecommendation().package)}%20therapy`, '_blank')}
                  >
                    WhatsApp Book
                  </Button>
                  <Button variant="outline" onClick={resetQuiz}>
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quiz" className="py-20 bg-gradient-to-br from-primary/5 to-wellness-cream/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect IV Therapy
            </h2>
            <p className="text-xl text-muted-foreground">
              Answer a few questions to discover which IV therapy is best for your needs.
            </p>
          </div>

          <Card className="border-primary/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="mb-4" />
              <CardTitle className="text-xl">{questions[currentQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={answers[currentQuestion] || ""} 
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  variant="medical"
                  onClick={nextQuestion}
                  disabled={!answers[currentQuestion]}
                  className="flex items-center gap-2"
                >
                  {currentQuestion === questions.length - 1 ? "Get Results" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Quiz;