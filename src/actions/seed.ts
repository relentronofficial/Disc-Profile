"use server";

import { supabase } from "@/lib/supabase";
import { QUESTIONS, DISC_PROFILES } from "@/lib/constants";

export async function seedDatabase() {
  try {
    // 1. Seed Questions
    const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    
    if (qCount === 0) {
      console.log("Seeding questions...");
      const formattedQuestions = QUESTIONS.map(q => ({
        id: q.id,
        section: q.section,
        tag: q.tag,
        text: q.text,
        instruction: q.instruction,
        options: q.options
      }));
      
      const { error: qError } = await supabase.from('questions').insert(formattedQuestions);
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
    // 1. Ensure Category exists
    let { data: cat, error: catError } = await supabase
      .from('assessment_categories')
      .select('id')
      .eq('slug', 'entrepreneurs')
      .single();
    
    if (!cat) {
      const { data: newCat, error: insError } = await supabase
        .from('assessment_categories')
        .insert([{ name: 'Entrepreneurs', slug: 'entrepreneurs', description: 'Specialized DISC for business builders', status: 'active' }])
        .select()
        .single();
      if (insError) throw insError;
      cat = newCat;
    }

    // 2. Ensure Set exists
    let { data: set, error: setError } = await supabase
      .from('question_sets')
      .select('id')
      .eq('category_id', cat!.id)
      .eq('title', 'Entrepreneur Master Set')
      .single();
    
    if (!set) {
      const { data: newSet, error: insSetError } = await supabase
        .from('question_sets')
        .insert([{ 
          category_id: cat!.id, 
          title: 'Entrepreneur Master Set', 
          target_audience: 'Existing & Aspiring Entrepreneurs',
          description: 'Comprehensive 20-scenario assessment',
          status: 'active',
          version: '1.0'
        }])
        .select()
        .single();
      if (insSetError) throw insSetError;
      set = newSet;
    }

    // 3. Map all 20 questions
    const { data: qs, error: qsError } = await supabase.from('questions').select('id').order('id', { ascending: true });
    if (qsError) throw qsError;

    if (qs && qs.length > 0) {
      const mappings = qs.map((q, i) => ({
        question_set_id: set!.id,
        question_id: q.id,
        display_order: i + 1
      }));

      // Clear existing mappings for this set to avoid duplicates if re-run
      await supabase.from('question_set_questions').delete().eq('question_set_id', set!.id);
      
      const { error: mapError } = await supabase.from('question_set_questions').insert(mappings);
      if (mapError) throw mapError;
    }

    return { success: true };
  } catch (err: any) {
    console.error("Entrepreneur seeding error:", err);
    return { success: false, error: err.message };
  }
}
