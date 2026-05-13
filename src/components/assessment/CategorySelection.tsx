"use client";

import { useState, useEffect } from "react";
import { AssessmentCategory } from "@/types";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Briefcase, Users, Layout, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectionProps {
  onSelect: (categoryId: string) => void;
}

export default function CategorySelection({ onSelect }: CategorySelectionProps) {
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('assessment_categories')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      if (data) setCategories(data);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  const getIcon = (slug: string) => {
    if (slug.includes('entrepreneur')) return Briefcase;
    if (slug.includes('student')) return Users;
    if (slug.includes('employee') || slug.includes('corporate')) return Layout;
    return Zap;
  };

  if (loading) return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-bg">
      <div className="w-8 h-8 border-4 border-tbt-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 bg-bg overflow-y-auto py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-serif text-3xl md:text-5xl font-black text-txt mb-4">Choose Your <span className="text-gradient-red italic">Path</span></h2>
        <p className="text-txt3 text-sm md:text-base max-w-md mx-auto uppercase tracking-widest font-bold">Select the profile that best describes your current journey.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl">
        {categories.map((cat, idx) => {
          const Icon = getIcon(cat.slug);
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(cat.id)}
              className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 text-left hover:border-tbt-red/30 transition-all duration-500 shadow-xl hover:shadow-tbt-red/5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-tbt-red scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
              
              <div className="flex items-start gap-5 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-tbt-red/10 group-hover:border-tbt-red/20 transition-colors duration-500">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-txt3 group-hover:text-tbt-red transition-colors duration-500" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-serif text-xl md:text-2xl font-black text-txt mb-2 group-hover:text-tbt-red transition-colors duration-500">{cat.name}</h3>
                  <p className="text-xs md:text-sm text-txt3 line-clamp-2 leading-relaxed">{cat.description || "Specialized DISC assessment for your specific growth journey."}</p>
                </div>

                <div className="self-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <ChevronRight className="w-5 h-5 text-tbt-red" />
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-tbt-red opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
