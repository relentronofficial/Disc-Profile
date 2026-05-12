export interface Question {
  id: number;
  section: number;
  tag: string;
  text: string;
  instruction: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface Section {
  label: string;
  range: [number, number];
}

export interface DiscProfile {
  letter: "D" | "I" | "S" | "C";
  name: string;
  nickname: string;
  color: string;
  dimColor: string;
  edge: string;
  pattern: string;
  watch: string;
  prescription: string;
  traits: {
    summary: string;
    communication: string;
    decisionMaking: string;
    stressResponse: string;
    leadership: string;
    growth: string;
  };
}

export interface BlendedProfile {
  primaryType: "D" | "I" | "S" | "C";
  secondaryType: "D" | "I" | "S" | "C" | null;
  tertiaryType?: "D" | "I" | "S" | "C" | null;
  profileType: string; // "D", "D/I", "D·I", "D/I/S", "BALANCED"
  profileLabel: string;
  isTied: boolean;
  intensity: string;
  
  // New structured insights based on PDF
  insights: {
    profileIdentity: string;
    breakdownNote: string;
    strengths: string[];
    mentalPattern: string;
    innerTension: string;
    blindSpots: { dimension: string; insight: string; prescription: string }[];
    businessPrescription: string;
    growthEdge: string;
  };
  
  // Axes for visualization
  axes: {
    taskVsPeople: { task: number; people: number; dominant: string; gap: number };
    fastVsCautious: { fast: number; cautious: number; dominant: string; gap: number };
  };

  // Keep old fields for backward compatibility if needed during transition, 
  // but eventually we should migrate to the new structure.
  summary: string;
  communication: string;
  decisionMaking: string;
  stressResponse: string;
  leadership: string;
  growth: string;
}

export interface DiscAnalysis extends BlendedProfile {
  raw: { D: number; I: number; S: number; C: number };
  pct: { D: number; I: number; S: number; C: number };
  total: number;
  bands: { D: string; I: string; S: string; C: string };
  sorted: { key: string; pct: number; band: string }[];
  tiedDimensions: string[];
  suppressedDimensions: string[];
}

export interface UserData {
  name: string;
  mobile: string;
  city: string;
  biz: string;
  date: string;
  categoryId?: string;
  questionSetId?: string;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface QuestionSet {
  id: string;
  category_id: string;
  title: string;
  description: string;
  target_audience: string;
  version: string;
  status: 'active' | 'inactive';
  total_questions: number;
  created_at?: string;
}

export interface QuestionSetMapping {
  id: string;
  question_set_id: string;
  question_id: number;
  display_order: number;
  created_at?: string;
}

export interface Answer {
  answer: "A" | "B" | "C" | "D";
  reflection: string;
}

export interface AssessmentResult {
  id?: string;
  category_id?: string;
  full_name: string;
  mobile_number: string;
  city: string;
  business: string;
  score_d: number;
  score_i: number;
  score_s: number;
  score_c: number;
  dominant_type: string;
  secondary_type?: string;
  blend_label?: string;
  intensity_level?: string;
  behavioral_summary?: string;
  communication_style?: string;
  decision_making?: string;
  leadership_style?: string;
  stress_response?: string;
  growth_recommendations?: string;
  created_at?: string;
}
