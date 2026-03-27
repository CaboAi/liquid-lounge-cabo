"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, RotateCcw, Phone } from "lucide-react";
import {
  compactQuizQuestions,
  fullQuizQuestions,
  ivPackages,
  contactInfo,
  type QuizQuestion,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface QuizProps {
  variant?: "compact" | "full";
}

export default function Quiz({ variant = "full" }: QuizProps) {
  const questions: QuizQuestion[] =
    variant === "compact" ? compactQuizQuestions : fullQuizQuestions;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const progress = ((step + 1) / questions.length) * 100;
  const currentQ = questions[step];

  const recommendation = useMemo(() => {
    if (!showResult) return null;

    const scores: Record<string, number> = {};
    Object.values(answers).forEach((value) => {
      // Find the matching option and add its points
      questions.forEach((q) => {
        const opt = q.options.find((o) => o.value === value);
        if (opt) {
          Object.entries(opt.points).forEach(([pkgId, pts]) => {
            scores[pkgId] = (scores[pkgId] || 0) + pts;
          });
        }
      });
    });

    const topId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    return ivPackages.find((p) => p.id === topId) || ivPackages[0];
  }, [showResult, answers, questions]);

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));

    if (step < questions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 200);
    } else {
      setTimeout(() => setShowResult(true), 200);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleRetake = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  if (showResult && recommendation) {
    const Icon = recommendation.icon;
    return (
      <div className="mx-auto max-w-lg">
        <Card className="border-none bg-white shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(164_44%_28%/0.1)]">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <p className="overline mb-2">YOUR RECOMMENDATION</p>
            <h2 className="text-2xl font-heading font-semibold">
              {recommendation.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {recommendation.description}
            </p>
            <p className="mt-4 text-2xl font-bold">
              <span className="text-lg">$</span>
              {recommendation.price}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Button variant="medical" size="lg" asChild>
                <Link href="/contact">Book {recommendation.name}</Link>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={contactInfo.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  WhatsApp Nate
                </a>
              </Button>
              <Button variant="ghost" onClick={handleRetake}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card className="border-none bg-white shadow-lg">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>
                Question {step + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Question */}
          <h3 className="mb-6 text-lg font-semibold">{currentQ.question}</h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                  answers[currentQ.id] === option.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 hover:bg-secondary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {answers[currentQ.id] && step < questions.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => s + 1)}
              >
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
