"use server";

import { supabase } from "@/lib/supabase";
import { Answer, UserData } from "@/types";
import { computeScores, analyzeDiscProfile } from "@/lib/utils";
import { DISC_PROFILES } from "@/lib/constants";

import { sendZacxTemplateMessage } from "@/lib/zacx";

export async function saveAssessmentResult(userData: UserData, answers: Record<number, Answer>) {
  try {
    const scores = computeScores(answers);
    
    // 1. Fetch Profile Configs for Analysis
    const { data: profileRes } = await supabase.from('disc_profiles').select('*');
    const profiles: Record<string, any> = {};
    if (profileRes) {
      profileRes.forEach(p => {
        profiles[p.letter] = {
          ...p,
          dimColor: p.dim_color,
          traits: p.traits || { summary: "", communication: "", decisionMaking: "", stressResponse: "", leadership: "", growth: "" }
        };
      });
    }

    // 2. Run Full Analysis
    const analysis = analyzeDiscProfile(scores, profiles as any);
    const dominant = analysis.primaryType;

    console.log("Saving assessment for:", userData.name);

    // Validate categoryId is a valid UUID string if it exists
    const categoryId = (userData.categoryId && userData.categoryId.trim() !== "") 
      ? userData.categoryId 
      : null;

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        full_name: userData.name,
        mobile_number: userData.mobile,
        city: userData.city,
        business: userData.biz,
        category_id: categoryId,
        score_d: scores.D,
        score_i: scores.I,
        score_s: scores.S,
        score_c: scores.C,
        dominant_type: dominant,
        secondary_type: analysis.secondaryType,
        blend_label: analysis.profileLabel,
        intensity_level: analysis.intensity,
        behavioral_summary: analysis.insights.profileIdentity,
        communication_style: analysis.communication,
        decision_making: analysis.decisionMaking,
        leadership_style: analysis.leadership,
        stress_response: analysis.stressResponse,
        growth_recommendations: analysis.growth
      })
      .select()
      .single();

    if (assessmentError) {
      console.error("Supabase Assessment Error:", {
        message: assessmentError.message,
        details: assessmentError.details,
        hint: assessmentError.hint,
        code: assessmentError.code,
        payload: {
          full_name: userData.name,
          mobile_number: userData.mobile,
          category_id: categoryId,
          dominant_type: dominant
        }
      });
      return { 
        success: false, 
        error: `Database Insert Failed: ${assessmentError.message}`, 
        details: assessmentError.details,
        hint: assessmentError.hint 
      };
    }

    if (!assessment) {
      return { success: false, error: "No data returned from insert" };
    }

    const answersToInsert = Object.entries(answers).map(([qId, a]) => ({
      assessment_id: assessment.id,
      question_id: parseInt(qId),
      answer_letter: a.answer,
      reflection: a.reflection
    }));

    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert);

    // Trigger WhatsApp Message via Zacx
    const channelId = process.env.ZACX_CHANNEL_ID;
    if (channelId) {
      // Run in background/non-blocking if possible, but for server actions we just await
      try {
        await sendZacxTemplateMessage({
          to: userData.mobile,
          templateName: "disc_result",
          channelId: channelId,
          variables: [userData.name]
        });
      } catch (waErr) {
        console.error("WhatsApp Trigger failed, but assessment was saved:", waErr);
      }
    }

    if (answersError) {
      console.error("Supabase Answers Error:", answersError);
      return { success: true, data: assessment, warning: "Assessment saved, but answers log failed." };
    }

    return { success: true, data: assessment };
  } catch (err: any) {
    console.error("Unexpected Error in saveAssessmentResult:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
