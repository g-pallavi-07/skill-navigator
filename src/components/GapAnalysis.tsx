import type { SkillGap } from "@/types/analysis";
import { Progress } from "@/components/ui/progress";

interface GapAnalysisProps {
  gaps: SkillGap[];
  matchScore: number;
}

const statusConfig = {
  strong: { label: "Strong", color: "bg-skill-have", barColor: 90 },
  weak: { label: "Needs Work", color: "bg-skill-weak", barColor: 45 },
  missing: { label: "Missing", color: "bg-skill-missing", barColor: 10 },
};

const priorityBadge = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-info/10 text-info border-info/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function GapAnalysis({ gaps, matchScore }: GapAnalysisProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Skill Gap Analysis</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Match Score</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${matchScore}%` }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums">{matchScore}%</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {gaps.map((gap) => {
          const cfg = statusConfig[gap.status];
          return (
            <div
              key={gap.skill}
              className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{gap.skill}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityBadge[gap.priority]}`}>
                    {gap.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {gap.currentLevel} → {gap.requiredLevel}
                </p>
              </div>
              <div className="w-24 shrink-0">
                <Progress value={cfg.barColor} className="h-1.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground w-16 text-right shrink-0">
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}