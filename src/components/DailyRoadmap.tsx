import { useState, useMemo } from "react";
import type { RoadmapStep } from "@/types/analysis";
import { Calendar, BookOpen, RotateCcw, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkillQuiz } from "@/components/SkillQuiz";
import { SkillExplanation } from "@/components/SkillExplanation";

interface DailyRoadmapProps {
  roadmap: RoadmapStep[];
  estimatedTotalHours: number;
}

interface DayPlan {
  day: number;
  type: "learn" | "revision" | "practice";
  title: string;
  skills: string[];
  hours: number;
  stepIndex?: number;
}

function generateDailyPlan(roadmap: RoadmapStep[]): DayPlan[] {
  const days: DayPlan[] = [];
  let dayNum = 1;
  const HOURS_PER_DAY = 4;

  for (let i = 0; i < roadmap.length; i++) {
    const step = roadmap[i];
    let remaining = step.estimatedHours;

    while (remaining > 0) {
      const todayHours = Math.min(remaining, HOURS_PER_DAY);
      days.push({
        day: dayNum++,
        type: "learn",
        title: step.title,
        skills: step.skills,
        hours: todayHours,
        stepIndex: i,
      });
      remaining -= todayHours;
    }

    // Add revision day every 3 steps
    if ((i + 1) % 3 === 0 && i < roadmap.length - 1) {
      const revisionSkills = roadmap
        .slice(Math.max(0, i - 2), i + 1)
        .flatMap((s) => s.skills);
      days.push({
        day: dayNum++,
        type: "revision",
        title: `Review: ${revisionSkills.slice(0, 3).join(", ")}`,
        skills: revisionSkills,
        hours: 2,
      });
    }
  }

  // Final practice day
  if (days.length > 0) {
    days.push({
      day: dayNum,
      type: "practice",
      title: "Comprehensive Review & Practice",
      skills: roadmap.flatMap((s) => s.skills).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8),
      hours: 3,
    });
  }

  return days;
}

const dayTypeConfig = {
  learn: { icon: BookOpen, color: "bg-primary/10 text-primary border-primary/20" },
  revision: { icon: RotateCcw, color: "bg-info/10 text-info border-info/20" },
  practice: { icon: Play, color: "bg-success/10 text-success border-success/20" },
};

export function DailyRoadmap({ roadmap, estimatedTotalHours }: DailyRoadmapProps) {
  const dailyPlan = useMemo(() => generateDailyPlan(roadmap), [roadmap]);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [activeQuizSkill, setActiveQuizSkill] = useState<string | null>(null);
  const [activeExplanationSkill, setActiveExplanationSkill] = useState<string | null>(null);

  const progress = dailyPlan.length > 0 ? (completedDays.size / dailyPlan.length) * 100 : 0;

  const toggleDay = (day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Daily Learning Schedule
        </h3>
        <div className="text-sm text-muted-foreground">
          {completedDays.size}/{dailyPlan.length} days completed
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-6" />

      <div className="space-y-3">
        {dailyPlan.map((day) => {
          const cfg = dayTypeConfig[day.type];
          const Icon = cfg.icon;
          const isCompleted = completedDays.has(day.day);

          return (
            <div key={day.day}>
              <div
                className={`rounded-lg border p-4 transition-all ${
                  isCompleted ? "bg-success/5 border-success/20 opacity-75" : "hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDay(day.day)}
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "border-success bg-success text-success-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{day.day}</span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {day.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{day.hours}h</span>
                    </div>
                    <h4 className="font-medium text-sm">{day.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {day.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => setActiveExplanationSkill(skill)}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {day.type === "learn" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 h-7 text-xs"
                        onClick={() => setActiveQuizSkill(day.skills[0])}
                      >
                        Start Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {activeQuizSkill && day.skills.includes(activeQuizSkill) && (
                <SkillQuiz
                  skill={activeQuizSkill}
                  onClose={() => setActiveQuizSkill(null)}
                />
              )}

              {activeExplanationSkill && day.skills.includes(activeExplanationSkill) && (
                <SkillExplanation
                  skill={activeExplanationSkill}
                  onClose={() => setActiveExplanationSkill(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
