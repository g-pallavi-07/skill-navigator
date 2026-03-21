import { useState, useEffect } from "react";
import { X, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SkillExplanationProps {
  skill: string;
  onClose: () => void;
}

export function SkillExplanation({ skill, onClose }: SkillExplanationProps) {
  const [content, setContent] = useState<{ explanation: string; summary: string; resources: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-explanation", {
          body: { skill },
        });
        if (error) throw error;
        setContent(data);
      } catch {
        setContent({
          explanation: `Unable to generate explanation for ${skill}. Please try again later.`,
          summary: "",
          resources: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExplanation();
  }, [skill]);

  return (
    <div className="mt-2 rounded-lg border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Learn: {skill}
        </h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Generating content...</p>
        </div>
      ) : content ? (
        <div className="space-y-4 text-sm">
          <div>
            <h5 className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wide">Explanation</h5>
            <p className="leading-relaxed">{content.explanation}</p>
          </div>
          {content.summary && (
            <div>
              <h5 className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wide">Key Takeaways</h5>
              <p className="leading-relaxed">{content.summary}</p>
            </div>
          )}
          {content.resources.length > 0 && (
            <div>
              <h5 className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wide">Resources</h5>
              <ul className="space-y-1">
                {content.resources.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
