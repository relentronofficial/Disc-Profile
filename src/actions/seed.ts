"use server";

import { supabase } from "@/lib/supabase";
import { QUESTIONS, EMPLOYEE_QUESTIONS, DISC_PROFILES } from "@/lib/constants";
import { shuffleArray } from "@/lib/utils";

/**
 * Helper to shuffle DISC options for a question
 */
function shuffleQuestionOptions(q: any) {
  const discLetters: ("D" | "I" | "S" | "C")[] = ["D", "I", "S", "C"];
  const shuffledDisc = shuffleArray(discLetters);
  
  const newOptions: any = {};
  ["A", "B", "C", "D"].forEach((letter, index) => {
    const disc = shuffledDisc[index];
    // Find original option that had this disc
    const originalOption = Object.values(q.options).find((opt: any) => 
      (typeof opt === 'string' ? false : opt.disc === disc)
    ) as any;
    
    newOptions[letter] = {
      text: originalOption?.text || "",
      disc: disc
    };
  });

  return {
    ...q,
    options: newOptions
  };
}

export async function seedDatabase(forceUpdate = false) {
  try {
    // 1. Seed All Questions (Entrepreneur + Employee)
    const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    
    if (qCount === 0 || forceUpdate) {
      console.log("Seeding all questions (forceUpdate:", forceUpdate, ")...");
      const allQs = [...QUESTIONS, ...EMPLOYEE_QUESTIONS];
      // Note: Questions are already pre-shuffled in constants.ts
      // We still apply shuffleQuestionOptions to ensure randomness if seeded multiple times
      const formattedQuestions = allQs.map(q => shuffleQuestionOptions(q));
      
      const { error: qError } = await supabase.from('questions').upsert(formattedQuestions, { onConflict: 'id' });
      if (qError) throw qError;
    }

    // 2. Seed DISC Profiles
    console.log("Seeding/Updating DISC profiles...");
    const formattedProfiles = Object.values(DISC_PROFILES).map(p => ({
      letter: p.letter,
      name: p.name,
      nickname: p.nickname,
      color: p.color,
      dim_color: p.dimColor,
      edge: p.edge,
      pattern: p.pattern,
      watch: p.watch,
      prescription: p.prescription,
      traits: p.traits
    }));
    
    const { error: pError } = await supabase
      .from('disc_profiles')
      .upsert(formattedProfiles, { onConflict: 'letter' });
    
    if (pError) throw pError;

    return { success: true };
  } catch (err: any) {
    console.error("Seeding error:", err);
    return { success: false, error: err.message };
  }
}

export async function seedEntrepreneurSet() {
  try {
    console.log("Syncing & Shuffling Entrepreneur Set...");
    
    // 1. Ensure Category exists
    let { data: cat } = await supabase.from('assessment_categories').select('id').eq('slug', 'entrepreneurs').single();
    if (!cat) {
      const { data: newCat, error } = await supabase.from('assessment_categories').insert([{ name: 'Entrepreneurs', slug: 'entrepreneurs', description: 'Specialized DISC for business builders', status: 'active' }]).select().single();
      if (error) throw error;
      cat = newCat;
    }

    // 2. Shuffle and Upsert Questions 1-20
    const questionsToShuffle = QUESTIONS.slice(0, 20).map(q => shuffleQuestionOptions(q));
    const { error: upsertError } = await supabase.from('questions').upsert(questionsToShuffle, { onConflict: 'id' });
    if (upsertError) throw upsertError;

    // 3. Ensure Set exists
    let { data: set } = await supabase.from('question_sets').select('id').eq('category_id', cat!.id).eq('title', 'Entrepreneur Master Set').single();
    if (!set) {
      const { data: newSet, error } = await supabase.from('question_sets').insert([{ 
        category_id: cat!.id, 
        title: 'Entrepreneur Master Set', 
        target_audience: 'Existing & Aspiring Entrepreneurs',
        description: 'Comprehensive 20-scenario assessment',
        status: 'active',
        version: '1.0',
        show_tags: true
      }]).select().single();
      if (error) throw error;
      set = newSet;
    }

    // 4. Map questions
    const mappings = questionsToShuffle.map((q, i) => ({
      question_set_id: set!.id,
      question_id: q.id,
      display_order: i + 1
    }));

    await supabase.from('question_set_questions').delete().eq('question_set_id', set!.id);
    const { error: mapError } = await supabase.from('question_set_questions').insert(mappings);
    if (mapError) throw mapError;

    return { success: true };
  } catch (err: any) {
    console.error("Entrepreneur sync error:", err);
    return { success: false, error: err.message };
  }
}

export async function seedEmployeeSet() {
  try {
    console.log("Syncing & Shuffling Employee Set...");
    
    // 1. Ensure Category exists
    let { data: cat } = await supabase.from('assessment_categories').select('id').eq('slug', 'employees').single();
    if (!cat) {
      const { data: newCat, error } = await supabase.from('assessment_categories').insert([{ name: 'Employees', slug: 'employees', description: 'Specialized DISC for corporate professionals', status: 'active' }]).select().single();
      if (error) throw error;
      cat = newCat;
    }

    // 2. Shuffle and Upsert Employee Questions (IDs 21-50)
    const questionsToShuffle = EMPLOYEE_QUESTIONS.map(q => shuffleQuestionOptions(q));
    const { error: upsertError } = await supabase.from('questions').upsert(questionsToShuffle, { onConflict: 'id' });
    if (upsertError) throw upsertError;

    // 3. Ensure Set exists
    let { data: set } = await supabase.from('question_sets').select('id').eq('category_id', cat!.id).eq('title', 'Employee Master Set').single();
    if (!set) {
      const { data: newSet, error } = await supabase.from('question_sets').insert([{ 
        category_id: cat!.id, 
        title: 'Employee Master Set', 
        target_audience: 'Corporate Professionals & Teams',
        description: 'Comprehensive 30-scenario assessment',
        status: 'active',
        version: '1.0',
        show_tags: true
      }]).select().single();
      if (error) throw error;
      set = newSet;
    }

    // 4. Map all 30 questions
    const mappings = questionsToShuffle.map((q, i) => ({
      question_set_id: set!.id,
      question_id: q.id,
      display_order: i + 1
    }));

    await supabase.from('question_set_questions').delete().eq('question_set_id', set!.id);
    const { error: mapError } = await supabase.from('question_set_questions').insert(mappings);
    if (mapError) throw mapError;

    return { success: true };
  } catch (err: any) {
    console.error("Employee sync error:", err);
    return { success: false, error: err.message };
  }
}
