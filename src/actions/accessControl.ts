"use server";

import { supabase } from "@/lib/supabase";
import { Question, QuestionSet } from "@/types";

export type ValidationResult = 
  | { success: true; questions: Question[]; questionSet: QuestionSet }
  | { success: false; error: string };

export async function validateAccessCode(code: string): Promise<ValidationResult> {
  try {
    // 1. Fetch the access code mapping to a Category (Pool)
    const { data: mapping, error: mappingError } = await supabase
      .from('access_codes')
      .select('category_id, status')
      .eq('code', code.toUpperCase())
      .single();

    if (mappingError || !mapping) {
      return { success: false, error: "Invalid access code. Please check and try again." };
    }

    if (mapping.status !== 'active') {
      return { success: false, error: "This access code is no longer active." };
    }

    // 2. Find the "Master Set" for this Category (Pool)
    const { data: questionSet, error: setError } = await supabase
      .from('question_sets')
      .select('*')
      .eq('category_id', mapping.category_id)
      .ilike('title', '%Master%')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (setError || !questionSet) {
      // Fallback: Just take the most recent active set if no "Master" is found
      const { data: fallbackSet, error: fallbackError } = await supabase
        .from('question_sets')
        .select('*')
        .eq('category_id', mapping.category_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fallbackError || !fallbackSet) {
        return { success: false, error: "No active assessment pool found for this code." };
      }
      return await loadQuestionsForSet(fallbackSet);
    }

    return await loadQuestionsForSet(questionSet);
  } catch (err: any) {
    console.error("Access code validation error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

async function loadQuestionsForSet(questionSet: QuestionSet): Promise<ValidationResult> {
  // Fetch the questions for this set
  const { data: mappings, error: mapError } = await supabase
    .from('question_set_questions')
    .select('question_id, display_order')
    .eq('question_set_id', questionSet.id)
    .order('display_order', { ascending: true });

  if (mapError || !mappings) {
    return { success: false, error: "Failed to load questions for this pool." };
  }

  const questionIds = mappings.map(m => m.question_id);
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds);

  if (qError || !questions) {
    return { success: false, error: "Failed to fetch scenario data." };
  }

  // Sort questions by display_order
  const sortedQuestions = mappings.map(m => 
    questions.find(q => q.id === m.question_id)
  ).filter(Boolean) as Question[];

  return { 
    success: true, 
    questionSet: questionSet as QuestionSet,
    questions: sortedQuestions
  };
}

export async function seedAccessCodes() {
  try {
    const { data: cats } = await supabase.from('assessment_categories').select('id, name');
    if (!cats || cats.length === 0) {
      return { success: false, error: "No categories found to map." };
    }

    const empCat = cats.find(c => c.name.toLowerCase().includes('employee'));
    const entCat = cats.find(c => c.name.toLowerCase().includes('entrepreneur'));

    const codesToInsert = [];
    if (empCat) {
      codesToInsert.push({ code: 'EMP001', category_id: empCat.id, status: 'active' });
    }
    if (entCat) {
      codesToInsert.push({ code: 'ENT001', category_id: entCat.id, status: 'active' });
    }

    if (codesToInsert.length > 0) {
      const { error } = await supabase.from('access_codes').upsert(codesToInsert, { onConflict: 'code' });
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
