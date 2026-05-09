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
}

export interface UserData {
  name: string;
  mobile: string;
  city: string;
  biz: string;
  date: string;
}

export interface Answer {
  answer: "A" | "B" | "C" | "D";
  reflection: string;
}

export interface AssessmentResult {
  id?: string;
  full_name: string;
  mobile_number: string;
  city: string;
  business: string;
  score_d: number;
  score_i: number;
  score_s: number;
  score_c: number;
  dominant_type: string;
  created_at?: string;
}
