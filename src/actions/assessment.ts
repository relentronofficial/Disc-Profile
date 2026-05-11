"use server";

import { supabase } from "@/lib/supabase";
import { Answer, UserData } from "@/types";
import { computeScores, analyzeDiscProfile } from "@/lib/utils";
import { DISC_PROFILES } from "@/lib/constants";

import { sendZacxTemplateMessage } from "@/lib/zacx";

export async function saveAssessmentResult(userData: UserData, answers: Record<number, Answer>) {
  try {
    const rawScores = computeScores(answers);
    const analysis = analyzeDiscProfile(rawScores, DISC_PROFILES);

    console.log("Saving assessment for:", userData.name);

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        full_name: userData.name,
        mobile_number: userData.mobile,
        city: userData.city,
        business: userData.biz,
        score_d: Math.round(analysis.pct.D),
        score_i: Math.round(analysis.pct.I),
        score_s: Math.round(analysis.pct.S),
        score_c: Math.round(analysis.pct.C),
        dominant_type: analysis.primaryType
      })
      .select()
      .single();

    if (assessmentError) {
      console.error("Supabase Assessment Error:", assessmentError);
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
    console.log("Attempting WhatsApp trigger. Channel ID present:", !!channelId);
    
    if (channelId) {
      const waResult = await sendZacxTemplateMessage({
        to: userData.mobile,
        templateName: "disc_result",
        channelId: channelId,
        variables: [userData.name]
      });
      console.log("WhatsApp Send Result:", waResult.success ? "Success" : "Failed", waResult.error || "");
    } else {
      console.warn("ZACX_CHANNEL_ID missing in environment variables.");
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
