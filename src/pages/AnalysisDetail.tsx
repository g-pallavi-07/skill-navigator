import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SkillsComparison } from "@/components/SkillsComparison";
import { GapAnalysis } from "@/components/GapAnalysis";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { DailyRoadmap } from "@/components/DailyRoadmap";
import { ReasoningTrace } from "@/components/ReasoningTrace";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types/analysis";

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    (supabase
      .from("analyses" as any)
      .select("*")
      .eq("id", id)
      .single() as any)
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error("Analysis not found");
          navigate("/my-analyses");
          return;
        }
        setResult({
          resumeSkills: (data.extracted_skills_json as any)?.resumeSkills || [],
          jobSkills: (data.extracted_skills_json as any)?.jobSkills || [],
          skillGaps: data.gap_analysis_json as any || [],
          roadmap: data.roadmap_json as any || [],
          reasoning: data.reasoning_json as any || [],
          matchScore: Number(data.match_score) || 0,
          estimatedTotalHours: Number(data.estimated_total_hours) || 0,
        });
        setFetching(false);
      });
  }, [user, id, navigate]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Adaptive Onboarding</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/my-analyses")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> My Analyses
          </Button>
        </div>
      </nav>

      {fetching ? (
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
      ) : result ? (
        <section className="container max-w-4xl py-10 space-y-6">
          <SkillsComparison resumeSkills={result.resumeSkills} jobSkills={result.jobSkills} />
          <GapAnalysis gaps={result.skillGaps} matchScore={result.matchScore} />
          <LearningRoadmap roadmap={result.roadmap} estimatedTotalHours={result.estimatedTotalHours} />
          <DailyRoadmap roadmap={result.roadmap} estimatedTotalHours={result.estimatedTotalHours} />
          <ReasoningTrace steps={result.reasoning} />
        </section>
      ) : null}
    </div>
  );
}
