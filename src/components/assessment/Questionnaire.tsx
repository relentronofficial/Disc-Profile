"use client";

import { useState, useEffect, useMemo } from "react";
import { UserData, Question, Answer, QuestionOption } from "@/types";
import { SECTIONS } from "@/lib/constants";
import { cn, shuffleArray } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import Image from "next/image";

interface QuestionnaireProps {
  userData: UserData;
  currentIdx: number;
  setCurrentIdx: React.Dispatch<React.SetStateAction<number>>;
  answers: Record<number, Answer>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, Answer>>>;
  onComplete: (answers: Record<number, Answer>, questions: Question[]) => void;
}

export default function Questionnaire({ 
  userData,
  currentIdx, 
  setCurrentIdx, 
  answers, 
  setAnswers, 
  onComplete 
}: QuestionnaireProps) {
  const [reflection, setReflection] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTags, setShowTags] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      if (userData.questionSetId) {
        // Fetch from Mapping Table
        const { data, error } = await supabase
          .from('question_set_questions')
          .select(`
            question_id,
            display_order,
            questions (*)
          `)
          .eq('question_set_id', userData.questionSetId)
          .order('display_order', { ascending: true });
        
        if (!error && data && data.length > 0) {
          const mappedQuestions = data.map((item: any) => item.questions).filter(Boolean);
          setQuestions(mappedQuestions);
        } else {
          setQuestions([]);
        }

        // Fetch set configuration (show_tags)
        const { data: setConfig } = await supabase
          .from("question_sets")
          .select("show_tags")
          .eq("id", userData.questionSetId)
          .single();
        
        if (setConfig) {
          setShowTags(setConfig.show_tags !== false); // Default to true if null
        }
      } else if (!userData.categoryId) {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('id', { ascending: true });
        
        if (!error && data) {
          setQuestions(data);
        }
      } else {
        setQuestions([]);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, [userData.questionSetId, userData.categoryId]);

  useEffect(() => {
    if (questions[currentIdx]) {
      setReflection(answers[questions[currentIdx].id]?.reflection || "");
    }
  }, [currentIdx, answers, questions]);

  const question = questions[currentIdx];

  // Dynamic Shuffling: Shuffles options locally for this session
  const shuffledOptions = useMemo(() => {
    if (!question) return [];
    const entries = Object.entries(question.options) as [("A" | "B" | "C" | "D"), string | QuestionOption][];
    return shuffleArray(entries);
  }, [question]);

  if (loading) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-bg relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-glow-red opacity-10 blur-[100px]" />
        <Loader2 className="w-8 h-8 text-tbt-red animate-spin mb-4 relative z-10" />
        <p className="text-[10px] text-txt3 font-black uppercase tracking-[0.2em] relative z-10 animate-pulse">
          Initializing DNA Sequence...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-bg p-4 text-center">
        <p className="text-txt2 text-sm">No discovery parameters found for this profile.</p>
      </div>
    );
  }

  const section = SECTIONS.find(
    (s) => question.id >= s.range[0] && question.id <= s.range[1]
  ) || { label: "General Sequence" };

  const handleSelect = (letter: "A" | "B" | "C" | "D", disc?: "D" | "I" | "S" | "C") => {
    console.log(`[DNA SEQUENCE] Q${question.id} Selection: Option ${letter} -> Mapped to ${disc || 'UNKNOWN'}`);
    
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { 
        answer: letter, 
        discType: disc, 
        reflection 
      },
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
      onComplete(updatedAnswers, questions);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="h-[100dvh] flex flex-col relative z-1 overflow-hidden bg-bg font-sans safe-area-inset">
      {/* Brand Logo - Top Left */}
      <div className="absolute top-4 left-6 md:top-10 md:left-10 z-50 pointer-events-none">
        <div className="relative w-[70px] h-[25px] md:w-[120px] md:h-[45px]">
          <Image 
            src="/logo.png" 
            alt="TBT Logo" 
            fill 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Background Cinematic Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-glow-red opacity-[0.06] blur-[120px] -z-10 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-glow-red opacity-[0.03] blur-[120px] -z-10 pointer-events-none" />

      {/* 1. Header Section - Fixed Height & Compact */}
      <header className="w-full pt-[6vh] md:pt-[6vh] pb-[1vh] md:pb-[2vh] px-6 md:px-12 flex justify-center shrink-0">
        <div className="w-full max-w-[840px] flex flex-col gap-1.5 md:gap-2">
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-tbt-red shadow-[0_0_8px_rgba(204,0,0,0.6)] animate-pulse" />
              <span className="text-[8px] md:text-[10px] text-tbt-red font-black tracking-[0.25em] uppercase opacity-80">
                {section?.label.split("—")[0]}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] md:text-[10px] text-txt2 font-black tracking-widest uppercase">
                {Math.round(progress)}% <span className="text-txt3 opacity-40 ml-1">Profiled</span>
              </span>
            </div>
          </div>
          <div className="h-0.5 md:h-1 bg-white/[0.03] rounded-full overflow-hidden shadow-inner ring-1 ring-white/[0.02]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-tbt-red/40 via-tbt-red to-tbt-red/40 rounded-full shadow-[0_0_10px_rgba(204,0,0,0.2)]"
              transition={{ duration: 0.6, ease: "circOut" }}
            />
          </div>
        </div>
      </header>

      {/* 2. Main Content Section - Flexible and Non-Scrolling */}
      <main className="flex-1 flex flex-col items-center w-full px-5 md:px-12 overflow-hidden min-h-0">
        <div className="w-full max-w-[840px] flex-1 flex flex-col min-h-0 relative py-[1vh] md:py-[2vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col w-full h-full justify-between md:justify-center min-h-0"
            >
              <div className="flex flex-col min-h-0">
                {/* Question Meta */}
                <div className="flex items-center gap-3 mb-[1vh] md:mb-[2vh] opacity-50 shrink-0">
                  {showTags && (
                    <>
                      <div className="flex items-center gap-2 text-[7px] md:text-[8px] text-tbt-red font-black uppercase tracking-[0.2em]">
                        <Sparkles className="w-2.5 h-2.5" />
                        {question.tag}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                    </>
                  )}
                  <div className="font-serif text-[7px] md:text-[9px] text-txt3 font-bold uppercase tracking-widest">
                    Inquiry {currentIdx + 1} of {questions.length}
                  </div>
                </div>

                {/* Cinematic Heading - Optimized space usage */}
                <div className="mb-[2vh] md:mb-[3vh] max-w-[760px] shrink-0">
                  <h2 
                    className="font-serif font-black text-txt mb-1 md:mb-4 tracking-tight leading-[1.15]"
                    style={{ fontSize: "clamp(1.1rem, 3.2vh + 0.4rem, 2.4rem)" }}
                  >
                    {question.text}
                  </h2>
                  <p 
                    className="text-txt3 font-medium leading-relaxed italic opacity-70 border-l-2 border-tbt-red/20 pl-4 md:pl-6 max-w-[640px]"
                    style={{ fontSize: "clamp(0.7rem, 0.8vh + 0.35rem, 0.9rem)" }}
                  >
                    {question.instruction}
                  </p>
                </div>

                {/* Premium Option Grid - Proportional Sizing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1vh] md:gap-4 lg:gap-5 mb-[1vh] md:mb-[2vh] overflow-y-auto md:overflow-hidden min-h-0 pr-1 custom-scrollbar">
                  {shuffledOptions.map(
                    ([originalLetter, opt], index) => {
                      const displayLetter = (["A", "B", "C", "D"] as const)[index];
                      const text = typeof opt === 'string' ? opt : opt.text;
                      const disc = typeof opt === 'string' ? undefined : opt.disc;
                      return (
                        <motion.button
                          key={originalLetter}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            console.log(`UI Select: Q${question.id} Position ${displayLetter} (Original: ${originalLetter}, Mapped to: ${disc || 'LEGACY'})`);
                            handleSelect(originalLetter, disc);
                          }}
                          className={cn(
                            "flex items-center gap-3 md:gap-4 bg-white/[0.012] border border-white/[0.06] rounded-xl md:rounded-2xl p-[1.5vh] md:p-5 text-left w-full transition-all duration-300 group relative overflow-hidden shrink-0",
                            answers[question.id]?.answer === originalLetter &&
                              "bg-tbt-red/[0.07] border-tbt-red/30 shadow-[0_15px_40px_rgba(204,0,0,0.08)] ring-1 ring-tbt-red/10"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-tbt-red/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div
                            className={cn(
                              "w-6 h-6 md:w-9 md:h-9 rounded-lg md:rounded-xl border border-white/10 flex items-center justify-center text-[9px] md:text-sm font-black text-txt3 shrink-0 transition-all font-serif group-hover:border-tbt-red/30 relative z-10",
                              answers[question.id]?.answer === originalLetter &&
                                "bg-tbt-red border-tbt-red text-white shadow-md scale-105"
                            )}
                          >
                            {displayLetter}
                          </div>
                          <div
                            className={cn(
                              "text-txt2 font-medium leading-tight md:leading-snug transition-colors duration-300 group-hover:text-txt relative z-10",
                              answers[question.id]?.answer === originalLetter && "text-txt font-semibold"
                            )}
                            style={{ fontSize: "clamp(0.8rem, 0.8vh + 0.4rem, 1rem)" }}
                          >
                            {text}
                          </div>
                        </motion.button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Optional Reflection */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-[1vh] md:mt-[2vh] space-y-1.5 shrink-0"
              >
                <div className="flex items-center justify-between px-1">
                  <label className="text-[8px] md:text-[9px] text-txt3 font-black uppercase tracking-widest opacity-40">Optional Reflection</label>
                  {reflection && (
                    <span className="text-[7px] md:text-[8px] text-tbt-red font-bold uppercase tracking-tighter">Drafting...</span>
                  )}
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Any specific thoughts on this scenario?"
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 md:p-3 text-[10px] md:text-xs text-txt2 outline-none focus:border-tbt-red/20 focus:bg-white/[0.04] transition-all resize-none h-10 md:h-16"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 3. Footer Section - Fixed Height and Bottom-Anchored */}
      <footer className="w-full pb-[2vh] md:pb-[6vh] pt-[1.5vh] md:pt-[2vh] px-6 md:px-12 flex justify-center shrink-0 border-t border-white/[0.02] bg-bg/40 backdrop-blur-md">
        <div className="w-full max-w-[840px]">
          <div className="flex gap-3 md:gap-4 items-center">
            {currentIdx > 0 && (
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="h-10 md:h-12 px-5 md:px-10 bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl text-txt2 text-[8px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-txt hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 md:w-5 md:h-5" />
                <span className="hidden xs:inline tracking-widest">Revisit</span>
              </motion.button>
            )}
            <motion.button
              whileHover={answers[question.id] ? { scale: 1.01, y: -1 } : {}}
              whileTap={answers[question.id] ? { scale: 0.99 } : {}}
              disabled={!answers[question.id]}
              onClick={handleNext}
              className="flex-1 h-10 md:h-12 bg-tbt-red hover:bg-tbt-red-hover transition-all duration-500 rounded-xl md:rounded-2xl text-white text-[8px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-4 shadow-[0_10px_30px_rgba(204,0,0,0.1)] group/next relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/next:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-2 tracking-widest">
                {currentIdx < questions.length - 1
                  ? <>Advance Sequence <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/next:translate-x-1 transition-transform" /></>
                  : <>Generate Profile <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/next:translate-x-1 transition-transform" /></>}
              </span>
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}
