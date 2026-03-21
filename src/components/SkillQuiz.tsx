import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface SkillQuizProps {
  skill: string;
  onClose: () => void;
}

export function SkillQuiz({ skill, onClose }: SkillQuizProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, [skill]);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { skill },
      });
      if (error) throw error;
      if (data?.questions) {
        setQuestions(data.questions);
      } else {
        throw new Error("No questions generated");
      }
    } catch (err: any) {
      toast.error("Failed to generate quiz: " + (err.message || "Unknown error"));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResult(true);
    if (index === questions[currentQ].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const finishQuiz = async () => {
    setQuizDone(true);
    const percentage = Math.round((score / questions.length) * 100);
    let level = "beginner";
    if (percentage >= 80) level = "advanced";
    else if (percentage >= 50) level = "intermediate";

    if (user) {
      try {
        // Upsert skill progress
        const { error } = await supabase.from("user_skill_progress").upsert(
          {
            user_id: user.id,
            skill_name: skill,
            level,
            quiz_score: percentage,
            attempts: 1,
          },
          { onConflict: "user_id,skill_name" }
        );
        if (error) console.error("Failed to save progress:", error);
      } catch (e) {
        console.error("Error saving quiz progress:", e);
      }
    }
  };

  const finalPercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="mt-2 rounded-lg border bg-card p-6 text-center animate-fade-in">
        <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Generating quiz for {skill}...</p>
      </div>
    );
  }

  if (quizDone) {
    return (
      <div className="mt-2 rounded-lg border bg-card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Quiz Complete: {skill}</h4>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center space-y-3">
          <div className="text-4xl font-bold tabular-nums">{finalPercentage}%</div>
          <p className="text-sm text-muted-foreground">
            {finalPercentage >= 80
              ? "Excellent! Skill marked as advanced."
              : finalPercentage >= 50
              ? "Good progress! Level: intermediate."
              : "Keep practicing! Level: beginner."}
          </p>
          <Progress value={finalPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {score}/{questions.length} correct
          </p>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="mt-2 rounded-lg border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Quiz: {skill}</h4>
          <span className="text-xs text-muted-foreground">
            {currentQ + 1}/{questions.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5 mb-4" />

      <p className="text-sm font-medium mb-4">{q.question}</p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let optClass = "border hover:bg-muted/50 cursor-pointer";
          if (showResult) {
            if (i === q.correctIndex) optClass = "border-success bg-success/10";
            else if (i === selected) optClass = "border-destructive bg-destructive/10";
            else optClass = "border opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={showResult}
              className={`w-full rounded-lg p-3 text-left text-sm transition-all flex items-center gap-3 ${optClass}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {showResult && i === q.correctIndex && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
              {showResult && i === selected && i !== q.correctIndex && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            {q.explanation}
          </p>
          <Button size="sm" onClick={nextQuestion} className="w-full">
            {currentQ + 1 >= questions.length ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      )}
    </div>
  );
}
