import type { Skill } from "@/types/analysis";

interface SkillsComparisonProps {
  resumeSkills: Skill[];
  jobSkills: Skill[];
}

const levelColor = (level: string) => {
  switch (level) {
    case 'advanced': return 'bg-success/15 text-success border-success/20';
    case 'intermediate': return 'bg-info/15 text-info border-info/20';
    default: return 'bg-warning/15 text-warning border-warning/20';
  }
};

function SkillPill({ skill }: { skill: Skill }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${levelColor(skill.level)}`}>
      {skill.name}
      <span className="opacity-60 capitalize">· {skill.level}</span>
    </span>
  );
}

export function SkillsComparison({ resumeSkills, jobSkills }: SkillsComparisonProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up">
      <h3 className="text-lg font-semibold mb-4">Extracted Skills</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Your Resume
          </h4>
          <div className="flex flex-wrap gap-2">
            {resumeSkills.map((s) => (
              <SkillPill key={s.name} skill={s} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Job Requirements
          </h4>
          <div className="flex flex-wrap gap-2">
            {jobSkills.map((s) => (
              <SkillPill key={s.name} skill={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}