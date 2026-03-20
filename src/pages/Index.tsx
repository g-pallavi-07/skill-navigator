import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/ResumeUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { SkillsComparison } from "@/components/SkillsComparison";
import { GapAnalysis } from "@/components/GapAnalysis";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { ReasoningTrace } from "@/components/ReasoningTrace";
import { AnalysisLoading } from "@/components/AnalysisLoading";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types/analysis";

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!file && !jobDescription.trim()) {
      toast.error("Please upload a resume or enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      let resumeText = "";
      if (file) {
        const reader = new FileReader();
        resumeText = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const { data, error } = await supabase.functions.invoke("analyze-profile", {
        body: {
          resumeBase64: resumeText || undefined,
          resumeFileName: file?.name,
          jobDescription: jobDescription.trim(),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as AnalysisResult);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = (file || jobDescription.trim().length > 20) && !isAnalyzing;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Adaptive Onboarding</span>
          </div>
        </div>
      </nav>

      {!result && !isAnalyzing && (
        <>
          {/* Hero */}
          <section className="container py-20 text-center animate-fade-up">
            <h1 className="text-4xl font-bold tracking-tight leading-[1.1] md:text-5xl max-w-2xl mx-auto">
              Bridge the gap between
              <br />
              where you are and where you need to be
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Upload your resume and a job description. Our AI analyzes skill gaps and generates a personalized learning roadmap with dependency-aware sequencing.
            </p>
          </section>

          {/* Upload section */}
          <section className="container max-w-2xl pb-20 animate-fade-up stagger-1">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Resume</label>
                <ResumeUpload file={file} onFileSelect={setFile} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Job Description</label>
                <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
              </div>
              <Button
                variant="hero"
                className="w-full"
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              >
                Analyze & Generate Roadmap
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </>
      )}

      {isAnalyzing && (
        <section className="container max-w-2xl">
          <AnalysisLoading />
        </section>
      )}

      {result && (
        <section className="container max-w-4xl py-10 space-y-6">
          <div className="flex items-center justify-between animate-fade-up">
            <h2 className="text-2xl font-bold">Your Analysis</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResult(null);
                setFile(null);
                setJobDescription("");
              }}
            >
              Start Over
            </Button>
          </div>

          <SkillsComparison
            resumeSkills={result.resumeSkills}
            jobSkills={result.jobSkills}
          />
          <GapAnalysis
            gaps={result.skillGaps}
            matchScore={result.matchScore}
          />
          <LearningRoadmap
            roadmap={result.roadmap}
            estimatedTotalHours={result.estimatedTotalHours}
          />
          <ReasoningTrace steps={result.reasoning} />
        </section>
      )}
    </div>
  );
}