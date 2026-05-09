import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeScores(answers: Record<number, { answer: string }>) {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  Object.values(answers).forEach((a) => {
    if (a.answer === "A") scores.D++;
    if (a.answer === "B") scores.I++;
    if (a.answer === "C") scores.S++;
    if (a.answer === "D") scores.C++;
  });
  return scores;
}

export function getDominantType(scores: { D: number; I: number; S: number; C: number }) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as "D" | "I" | "S" | "C";
}
