import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { BlendedProfile, DiscProfile, DiscAnalysis } from "@/types";
import { BLEND_TITLES } from "./constants";

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

export function analyzeDiscProfile(
  raw: { D: number; I: number; S: number; C: number },
  allProfiles: Record<string, DiscProfile>
): DiscAnalysis {
  // STEP 1: RAW COUNT (Passed in as 'raw')
  const total = raw.D + raw.I + raw.S + raw.C || 1;

  // STEP 2: PERCENTAGE WEIGHT
  const pct = {
    D: (raw.D / total) * 100,
    I: (raw.I / total) * 100,
    S: (raw.S / total) * 100,
    C: (raw.C / total) * 100,
  };

  // STEP 3: INTENSITY BAND
  const getBand = (p: number) => {
    if (p >= 60) return "EXTREME";
    if (p >= 45) return "DOMINANT";
    if (p >= 30) return "STRONG";
    if (p >= 20) return "SUPPORTING";
    if (p >= 10) return "BACKGROUND";
    return "SUPPRESSED";
  };

  const bands = {
    D: getBand(pct.D),
    I: getBand(pct.I),
    S: getBand(pct.S),
    C: getBand(pct.C),
  };

  // Sort dimensions by percentage
  const sorted = Object.entries(pct)
    .map(([key, value]) => ({ key, pct: value, band: getBand(value) }))
    .sort((a, b) => b.pct - a.pct);

  const primary = sorted[0].key as "D" | "I" | "S" | "C";
  const secondary = sorted[1].key as "D" | "I" | "S" | "C";
  const tertiary = sorted[2].key as "D" | "I" | "S" | "C";
  const quaternary = sorted[3].key as "D" | "I" | "S" | "C";

  // STEP 4: PROFILE TYPE CLASSIFICATION & STEP 6: TIE-HANDLING
  const highest = sorted[0].pct;
  const tiedDimensions = sorted.filter(d => highest - d.pct <= 5).map(d => d.key);
  const isTied = tiedDimensions.length > 1;

  let profileType = "";
  let profileLabel = "";

  if (sorted.every(d => Math.abs(d.pct - sorted[0].pct) <= 10)) {
    profileType = "BALANCED";
    profileLabel = "The Adaptive All-Rounder";
  } else if (tiedDimensions.length === 3) {
    profileType = tiedDimensions.join("/");
    profileLabel = "Triple Influence Blend";
  } else if (isTied) {
    profileType = tiedDimensions.join("·");
    profileLabel = BLEND_TITLES[tiedDimensions.join("")] || `${tiedDimensions.join("·")} Blend`;
  } else {
    // Check for blends vs pure types
    const gapToSecond = sorted[0].pct - sorted[1].pct;
    if (sorted[0].pct >= 50 && gapToSecond >= 20) {
      profileType = primary;
      profileLabel = `Pure ${allProfiles[primary]?.name || primary}`;
    } else {
      profileType = `${primary}/${secondary}`;
      profileLabel = BLEND_TITLES[primary + secondary] || `${primary}/${secondary} Blend`;
    }
  }

  // STEP 5: OPPOSITION AXIS ANALYSIS
  const task = pct.D + pct.C;
  const people = pct.I + pct.S;
  const fast = pct.D + pct.I;
  const caution = pct.S + pct.C;

  const getAxisInterpretation = (val1: number, val2: number, label1: string, label2: string) => {
    const gap = Math.abs(val1 - val2);
    if (gap <= 10) return { dominant: "Balanced", gap };
    return { dominant: val1 > val2 ? label1 : label2, gap };
  };

  const taskVsPeople = getAxisInterpretation(task, people, "Task-Oriented", "People-Oriented");
  const fastVsCautious = getAxisInterpretation(fast, caution, "Fast-Paced", "Cautious");

  // STEP 7: SUPPRESSED DIMENSION INSIGHT
  const suppressedDimensions = sorted.filter(d => d.pct < 15).map(d => d.key);

  // INSIGHT GENERATION (STEP 3 & 4 of Insight Architecture)
  const getInsightDepth = (p: number) => {
    if (p >= 60) return 5;
    if (p >= 45) return 4;
    if (p >= 30) return 3;
    if (p >= 20) return 2;
    if (p >= 10) return 1;
    return 1;
  };

  // Dynamic content generation helper
  const primaryProfile = allProfiles[primary];
  const secondaryProfile = allProfiles[secondary];

  const insights = {
    profileIdentity: isTied 
      ? `Your assessment reveals something psychologically interesting — you scored equally (or near-equally) in ${tiedDimensions.join(" and ")}. In professional DISC research, this is called a ${profileType} pattern and it means you do not operate from a single fixed style. You switch between ${tiedDimensions.join(" and ")} based on context, relationship, and stress level.`
      : `Your profile is dominated by the ${primaryProfile?.name} dimension (${Math.round(pct[primary])}%). This indicates a ${getBand(pct[primary]).toLowerCase()} drive for ${primaryProfile?.traits.summary.toLowerCase() || "your primary goals"}.`,
    
    breakdownNote: `Your scores represent a unique mix of all four dimensions. Even your lower scores like ${quaternary} (${Math.round(pct[quaternary])}%) are psychologically informative, showing what you naturally deprioritize to focus on your strengths.`,
    
    strengths: [
      primaryProfile?.edge || "Natural initiative",
      secondaryProfile?.edge || "Relational warmth",
      allProfiles[tertiary]?.traits.summary.split(",")[0] || "Adaptive stability"
    ],

    mentalPattern: isTied
      ? `You navigate the world using two different internal maps. When you are in achievement-focused contexts, your ${tiedDimensions[0]} side leads. When you are in collaborative or stable contexts, your ${tiedDimensions[1]} side leads. The trigger for the switch is usually the level of urgency or interpersonal pressure.`
      : `${primaryProfile?.pattern || "You approach challenges with a direct and focused mindset."} This is supported by your ${secondaryProfile?.name || "secondary"} side which adds ${secondaryProfile?.traits.summary.toLowerCase() || "additional perspective"}.`,

    innerTension: `The primary tension in your profile exists between ${primary} and ${secondary}. Specifically, it's a conflict of ${
      (primary === "D" && secondary === "S") || (primary === "S" && secondary === "D") ? "speed vs stability" :
      (primary === "I" && secondary === "C") || (primary === "C" && secondary === "I") ? "emotional vs rational" :
      (primary === "D" && secondary === "I") || (primary === "I" && secondary === "D") ? "urgency vs warmth" :
      (primary === "D" && secondary === "C") || (primary === "C" && secondary === "D") ? "boldness vs precision" :
      (primary === "I" && secondary === "S") || (primary === "S" && secondary === "I") ? "energy vs patience" :
      (primary === "S" && secondary === "C") || (primary === "C" && secondary === "S") ? "harmony vs accuracy" :
      "identity clarity"
    }. This isn't a weakness; it's the specific psychological cost of your unique profile.`,

    blindSpots: suppressedDimensions.map(d => ({
      dimension: d,
      insight: allProfiles[d]?.watch || "You may deprioritize this area.",
      prescription: allProfiles[d]?.prescription || "Focus on intentional practice."
    })),

    businessPrescription: `${primaryProfile?.prescription || "Take consistent action."} Tailored to your ${profileType} blend, we recommend focusing on your ${taskVsPeople.dominant.toLowerCase()} nature while leveraging your ${fastVsCautious.dominant.toLowerCase()} pace. Tamil Business Tribe will help you refine this approach.`,

    growthEdge: `If you develop even 10-15% more ${quaternary} in your operating style, you will unlock a new level of ${allProfiles[quaternary]?.name.toLowerCase() === "steady" ? "client trust and referrals" : allProfiles[quaternary]?.name.toLowerCase() === "conscientious" ? "precision and scalability" : "energy and influence"}. This is worth more than any ad you could run.`
  };

  return {
    raw,
    pct,
    total,
    bands,
    sorted,
    primaryType: primary,
    secondaryType: secondary,
    tertiaryType: tertiary,
    profileType,
    profileLabel,
    isTied,
    tiedDimensions,
    intensity: getBand(pct[primary]),
    suppressedDimensions,
    axes: {
      taskVsPeople: { task, people, dominant: taskVsPeople.dominant, gap: taskVsPeople.gap },
      fastVsCautious: { fast, caution, dominant: fastVsCautious.dominant, gap: fastVsCautious.gap }
    },
    insights,
    // Backward compatibility fields
    summary: insights.profileIdentity,
    communication: primaryProfile?.traits.communication || "",
    decisionMaking: primaryProfile?.traits.decisionMaking || "",
    stressResponse: primaryProfile?.traits.stressResponse || "",
    leadership: primaryProfile?.traits.leadership || "",
    growth: insights.growthEdge
  };
}
