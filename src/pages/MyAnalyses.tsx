import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Trash2, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisRow {
  id: string;
  role_selected: string | null;
  match_score: number | null;
  estimated_total_hours: number | null;
  created_at: string;
}

export default function MyAnalyses() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analyses")
      .select("id, role_selected, match_score, estimated_total_hours, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Failed to load analyses");
        else setAnalyses((data as AnalysisRow[]) || []);
        setFetching(false);
      });
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

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
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
      </nav>

      <section className="container max-w-3xl py-10">
        <h1 className="text-2xl font-bold mb-6 animate-fade-up">My Analyses</h1>

        {fetching ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : analyses.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="text-muted-foreground">No saved analyses yet.</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Start Your First Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up stagger-1">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border bg-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/analysis/${a.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {a.role_selected || "General Analysis"}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {a.match_score != null ? `${a.match_score}% match` : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a.estimated_total_hours != null ? `${a.estimated_total_hours}h` : "N/A"}
                    </span>
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(a.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
