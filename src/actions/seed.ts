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
    const { count: pCount } = await supabase.from('disc_profiles').select('*', { count: 'exact', head: true });
    
    if (pCount === 0) {
      console.log("Seeding DISC profiles...");
      const formattedProfiles = Object.values(DISC_PROFILES).map(p => ({
        letter: p.letter,
        name: p.name,
        nickname: p.nickname,
        color: p.color,
        dim_color: p.dimColor,
        edge: p.edge,
        pattern: p.pattern,
        watch: p.watch,
        prescription: p.prescription
      }));
      
      const { error: pError } = await supabase.from('disc_profiles').insert(formattedProfiles);
      if (pError) throw pError;
    }

    return { success: true };
  } catch (err: any) {
    console.error("Seeding error:", err);
    return { success: false, error: err.message };
  }
}
