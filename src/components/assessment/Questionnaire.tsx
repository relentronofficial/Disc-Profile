"use client";

import { useState, useEffect } from "react";
import { Question, Answer, Section } from "@/types";
import { SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface QuestionnaireProps {
  onComplete: (answers: Record<number, Answer>) => void;
}

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [reflection, setReflection] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data) {
        setQuestions(data);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions[currentIdx]) {
      setReflection(answers[questions[currentIdx].id]?.reflection || "");
    }
  }, [currentIdx, answers, questions]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-red opacity-10 blur-[100px]" />
        <Loader2 className="w-8 h-8 text-tbt-red animate-spin mb-4 relative z-10" />
        <p className="text-[10px] text-txt3 font-black uppercase tracking-[0.2em] relative z-10">
          Loading...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-4 text-center">
        <p className="text-txt2 text-sm">No questions found.</p>
      </div>
    );
  }

  const question = questions[currentIdx];
  const section = SECTIONS.find(
    (s) => question.id >= s.range[0] && question.id <= s.range[1]
  );

  const isFirstOfSection = SECTIONS.some((s) => s.range[0] === question.id);
  const sectionIndex = SECTIONS.findIndex((s) => s.range[0] === question.id);

  const handleSelect = (letter: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { answer: letter, reflection },
    }));
  };

  const handleNext = () => {
    if (!answers[question.id]) return;

    const updatedAnswers = {
      ...answers,
      [question.id]: { ...answers[question.id], reflection },
    };
    setAnswers(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="h-screen max-h-screen flex flex-col px-4 md:px-8 lg:px-12 relative z-1 overflow-hidden bg-bg">
      {/* Background Glow */}
      <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-glow-gold opacity-[0.03] blur-[100px] -z-10" />
      
      {/* Optimized Header - Reduced top padding */}
      <div className="pt-6 md:pt-10 pb-4">
        <div className="max-w-[560px] md:max-w-[720px] lg:max-w-[840px] mx-auto w-full">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
              <span className="text-[10px] md:text-xs text-gold font-black tracking-[0.2em] uppercase">
                {section?.label.split("—")[0]}
              </span>
            </div>
            <span className="text-[10px] md:text-xs text-txt3 font-bold uppercase tracking-widest">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-gold/40 to-gold rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Better vertical distribution for taller screens */}
      <div className="flex-1 flex flex-col items-center py-4 md:py-8 lg:py-12 overflow-y-auto no-scrollbar">
        <div className="max-w-[560px] md:max-w-[720px] lg:max-w-[840px] w-full flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col w-full"
            >
              {isFirstOfSection && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.03] border border-gold/10 rounded-2xl p-4 md:p-6 flex items-center gap-4 mb-6 md:mb-10 shadow-sm"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-xl md:text-2xl text-gold shrink-0">
                    {["I", "II", "III", "IV"][sectionIndex] || "•"}
                  </div>
                  <div>
                    <div className="text-[8px] md:text-[10px] text-gold/50 font-black uppercase tracking-widest mb-1">New Phase</div>
                    <div className="font-serif text-lg md:text-2xl font-black text-txt tracking-tight leading-none">
                      {section?.label}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-2.5 text-[8px] md:text-[10px] text-gold/60 font-black uppercase mb-2 opacity-70">
                <Sparkles className="w-4 h-4 text-gold/60" />
                {question.tag}
              </div>

              <div className="font-serif text-[10px] md:text-xs text-txt3 mb-2 font-bold uppercase tracking-widest opacity-40">
                Step {question.id} of {questions.length}
              </div>

              <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-black leading-[1.15] text-txt mb-4 md:mb-6 tracking-tight">
                {question.text}
              </h2>

              <p className="text-[11px] md:text-sm lg:text-base text-txt3 font-medium mb-8 md:mb-12 leading-relaxed italic opacity-70 max-w-[720px]">
                {question.instruction}
              </p>

              <div className="grid grid-cols-1 gap-3 md:gap-4 mb-10 md:mb-14">
                {(Object.entries(question.options) as [("A" | "B" | "C" | "D"), string][]).map(
                  ([letter, text]) => (
                    <motion.button
                      key={letter}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelect(letter)}
                      className={cn(
                        "flex items-center gap-4 md:gap-6 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 text-left w-full transition-all duration-300 group relative",
                        answers[question.id]?.answer === letter &&
                          "bg-gold/[0.08] border-gold/40 shadow-2xl shadow-gold/5 ring-1 ring-gold/10"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-white/10 flex items-center justify-center text-xs md:text-sm font-black text-txt3 shrink-0 transition-all font-serif group-hover:border-gold/30",
                          answers[question.id]?.answer === letter &&
                            "bg-gold border-gold text-bg shadow-md scale-110"
                        )}
                      >
                        {letter}
                      </div>
                      <div
                        className={cn(
                          "text-xs md:text-lg lg:text-xl text-txt2 font-medium leading-snug md:leading-normal transition-colors duration-300 group-hover:text-txt",
                          answers[question.id]?.answer === letter && "text-txt font-semibold"
                        )}
                      >
                        {text}
                      </div>
                    </motion.button>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="pb-10 md:pb-16 pt-4">
        <div className="max-w-[560px] md:max-w-[720px] lg:max-w-[840px] mx-auto w-full px-1">
          <div className="flex gap-4 items-center">
            {currentIdx > 0 && (
              <button
                onClick={handleBack}
                className="h-12 md:h-14 px-6 md:px-10 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-txt2 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-txt hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Previous
              </button>
            )}
            <motion.button
              whileHover={answers[question.id] ? { scale: 1.02, y: -2 } : {}}
              whileTap={answers[question.id] ? { scale: 0.98 } : {}}
              disabled={!answers[question.id]}
              onClick={handleNext}
              className="flex-1 h-12 md:h-14 bg-gold hover:bg-gold-hover transition-all duration-500 rounded-xl md:rounded-2xl text-bg text-[10px] md:text-xs font-black uppercase tracking-widest disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-gold/10 group/next"
            >
              {currentIdx < questions.length - 1
                ? <>Proceed to Next Step <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/next:translate-x-1 transition-transform" /></>
                : <>View Strategic Profile <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/next:translate-x-1 transition-transform" /></>}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
