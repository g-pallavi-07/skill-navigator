import { Loader2 } from "lucide-react";

export function AnalysisLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
      <p className="mt-4 font-medium">Analyzing your profile...</p>
      <p className="text-sm text-muted-foreground mt-1">
        Extracting skills, identifying gaps, and building your roadmap
      </p>
      <div className="mt-6 flex gap-2">
        {["Parsing resume", "Extracting skills", "Building roadmap"].map((label, i) => (
          <span
            key={label}
            className="animate-pulse-soft rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            style={{ animationDelay: `${i * 400}ms` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}