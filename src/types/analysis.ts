export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  source: 'resume' | 'job_description' | 'both';
}

export interface SkillGap {
  skill: string;
  status: 'missing' | 'weak' | 'strong';
  currentLevel: string;
  requiredLevel: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  skills: string[];
  estimatedHours: number;
  dependencies: string[];
  resources: string[];
}

export interface ReasoningStep {
  observation: string;
  reasoning: string;
  action: string;
}

export interface AnalysisResult {
  resumeSkills: Skill[];
  jobSkills: Skill[];
  skillGaps: SkillGap[];
  roadmap: RoadmapStep[];
  reasoning: ReasoningStep[];
  matchScore: number;
  estimatedTotalHours: number;
}