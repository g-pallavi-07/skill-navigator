import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Paste the job description here... Include required skills, qualifications, and responsibilities for best results."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] resize-none rounded-xl border-2 border-dashed bg-card p-4 text-sm leading-relaxed transition-colors focus:border-primary/40"
      />
      <p className="text-xs text-muted-foreground">
        {value.length > 0 ? `${value.split(/\s+/).filter(Boolean).length} words` : "Tip: Include the full job posting for more accurate analysis"}
      </p>
    </div>
  );
}