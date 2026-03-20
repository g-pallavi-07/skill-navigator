import type { ReasoningStep } from "@/types/analysis";
import { Brain } from "lucide-react";

interface ReasoningTraceProps {
  steps: ReasoningStep[];
}

export function ReasoningTrace({ steps }: ReasoningTraceProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        Reasoning Trace
      </h3>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed space-y-1"
          >
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0">observe:</span>
              <span>{step.observation}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary shrink-0">reason:</span>
              <span>{step.reasoning}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-success shrink-0">action:</span>
              <span>{step.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}