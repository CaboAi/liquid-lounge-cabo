import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const CompactQuiz = () => {
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
        { value: "good", label: "Good - Generally Energetic" }
      ]
    },
    {
      question: "Are you currently experiencing any of these?",
      options: [
        { value: "dehydration", label: "Dehydration or Hangover" },
        { value: "stress", label: "High Stress Levels" },
        { value: "illness", label: "Fighting Off Illness" },
        { value: "exercise", label: "Post-Exercise Recovery" },
        { value: "none", label: "None of the Above" }
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
    const [goal, energy, condition] = answers;
    
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

  if (showResult) {
    const recommendation = getRecommendation();
    
    return (
      <Card className="border-primary/20 shadow-lg h-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 p-2 bg-primary/10 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-lg">Your Perfect IV Match!</CardTitle>
          <CardDescription className="text-sm">Based on your responses:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <h3 className="text-lg font-bold text-primary mb-1">{recommendation.package}</h3>
            <p className="text-sm text-muted-foreground mb-2">{recommendation.description}</p>
            <p className="text-xs text-muted-foreground italic">{recommendation.reasoning}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">This therapy includes:</h4>
            <ul className="space-y-1">
              {recommendation.nutrients.slice(0, 3).map((nutrient, index) => (
                <li key={index} className="flex items-center text-xs">
                  <div className="h-1 w-1 bg-primary rounded-full mr-2"></div>
                  {nutrient}
                </li>
              ))}
              {recommendation.nutrients.length > 3 && (
                <li className="text-xs text-muted-foreground">+ {recommendation.nutrients.length - 3} more</li>
              )}
            </ul>
          </div>
          
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              variant="medical" 
              size="sm" 
              onClick={() => {
                console.log("Button clicked, generating email...");
                const subject = `Book ${recommendation.package} IV Therapy`;
                const body = `Hi Nurse Nate,

I completed the IV therapy quiz and I'm interested in booking the ${recommendation.package} treatment.

Here are my quiz results:
- Package: ${recommendation.package}
- Description: ${recommendation.description}
- Reasoning: ${recommendation.reasoning}

Please let me know your availability and pricing.

Thank you!`;
                const mailtoURL = `mailto:liquidloungeiv@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                console.log("Opening email with URL:", mailtoURL);
                window.open(mailtoURL, '_blank');
              }}
            >
              Book This Treatment
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetQuiz} className="flex-1">
                Retake
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/find-your-iv" className="flex items-center gap-1">
                  <span>Full Quiz</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-lg h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-center">Find Your Perfect IV Therapy</CardTitle>
        <CardDescription className="text-sm text-center">
          Quick assessment for personalized recommendations
        </CardDescription>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">{questions[currentQuestion].question}</h3>
          <RadioGroup 
            value={answers[currentQuestion] || ""} 
            onValueChange={handleAnswer}
            className="space-y-2"
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border border-border rounded hover:border-primary/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} className="flex-shrink-0" />
                <Label htmlFor={option.value} className="text-xs cursor-pointer flex-1 leading-tight">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Previous</span>
          </Button>
          <Button 
            variant="medical"
            size="sm"
            onClick={nextQuestion}
            disabled={!answers[currentQuestion]}
            className="flex items-center gap-1"
          >
            <span>{currentQuestion === questions.length - 1 ? "Get Results" : "Next"}</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/find-your-iv" className="flex items-center gap-1">
              <span>Open full-screen quiz</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactQuiz;