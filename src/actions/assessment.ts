"use server";

import { supabase } from "@/lib/supabase";
import { Answer, UserData } from "@/types";
import { computeScores, getDominantType } from "@/lib/utils";

import { sendZacxTemplateMessage } from "@/lib/zacx";

export async function saveAssessmentResult(userData: UserData, answers: Record<number, Answer>) {
  try {
    const scores = computeScores(answers);
    const dominant = getDominantType(scores);

    console.log("Saving assessment for:", userData.name);

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        full_name: userData.name,
        mobile_number: userData.mobile,
        city: userData.city,
        business: userData.biz,
        score_d: scores.D,
        score_i: scores.I,
        score_s: scores.S,
        score_c: scores.C,
        dominant_type: dominant
      })
      .select()
      .single();

    if (assessmentError) {
      console.error("Supabase Assessment Error:", assessmentError);
      return { 
        success: false, 
        error: assessmentError.message, 
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
