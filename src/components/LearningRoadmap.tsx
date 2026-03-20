import type { RoadmapStep } from "@/types/analysis";
import { Clock, BookOpen, CheckCircle2 } from "lucide-react";

interface LearningRoadmapProps {
  roadmap: RoadmapStep[];
  estimatedTotalHours: number;
}

export function LearningRoadmap({ roadmap, estimatedTotalHours }: LearningRoadmapProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Personalized Learning Roadmap</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="tabular-nums">{estimatedTotalHours}h estimated</span>
        </div>
      </div>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-6">
          {roadmap.map((step, i) => (
            <div key={step.step} className="relative flex gap-4">
              {/* Node */}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-sm font-semibold text-primary">
                {step.step}
              </div>
              {/* Content */}
              <div className="flex-1 rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/20">
                <h4 className="font-medium text-sm">{step.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {step.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {step.estimatedHours}h
                  </span>
                  {step.dependencies.length > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Requires: {step.dependencies.join(", ")}
                    </span>
                  )}
                </div>
                {step.resources.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {step.resources.join(" · ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}