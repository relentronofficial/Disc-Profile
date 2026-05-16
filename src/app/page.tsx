"use client";

import { useState, useEffect } from "react";
import Landing from "@/components/assessment/Landing";
import AccessCodeForm from "@/components/assessment/AccessCodeForm";
import CategorySelection from "@/components/assessment/CategorySelection";
import IntroScreen from "@/components/assessment/IntroScreen";
import Questionnaire from "@/components/assessment/Questionnaire";
import Results from "@/components/assessment/Results";
import { UserData, Answer, Question, QuestionSet } from "@/types";
import { computeScores } from "@/lib/utils";
import { saveAssessmentResult } from "@/actions/assessment";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, AlertTriangle } from "lucide-react";

type Step = "landing" | "code" | "category" | "intro" | "questionnaire" | "results";

const STORAGE_KEY = "tbt_assessment_session";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [finalScores, setFinalScores] = useState<{ D: number; I: number; S: number; C: number } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { step, userData, answers, currentIdx, activeQuestions, questionSet, finalScores } = JSON.parse(saved);
        if (step) setStep(step as Step);
        if (userData) setUserData(userData);
        if (answers) setAnswers(answers);
        if (typeof currentIdx === 'number') setCurrentIdx(currentIdx);
        if (activeQuestions) setActiveQuestions(activeQuestions);
        if (questionSet) setQuestionSet(questionSet);
        if (finalScores) setFinalScores(finalScores);
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step,
        userData,
        answers,
        currentIdx,
        activeQuestions,
        questionSet,
        finalScores
      }));
    }
  }, [step, userData, answers, currentIdx, isLoaded, activeQuestions, questionSet, finalScores]);

  const handleStart = async (data: UserData) => {
    setUserData(data);
    setStep("code");
    setCurrentIdx(0);
  };

  const handleCodeValidated = (questions: Question[], set: QuestionSet) => {
    setActiveQuestions(questions);
    setQuestionSet(set);
    if (userData) {
      setUserData({
        ...userData,
        categoryId: set.category_id,
        questionSetId: set.id
      });
    }
    setStep("intro");
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!userData) return;

    let setId = "";
    // Resolve active sets for this category
    const { data: setRes } = await supabase
      .from('question_sets')
      .select('id, title')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (setRes && setRes.length > 0) {
      // Prioritize the set with "Master" in the title
      const masterSet = setRes.find(s => s.title.toLowerCase().includes('master')) || setRes[0];
      setId = masterSet.id;
    }

    const updatedData = { ...userData, categoryId, questionSetId: setId };
    setUserData(updatedData);
    setStep("intro");
  };

  const handleIntroComplete = () => {
    setStep("questionnaire");
  };

  const handleComplete = async (finalAnswers: Record<number, Answer>, questions: Question[]) => {
    console.log("Assessment Complete. Calculating results for", questions.length, "questions.");
    const scores = computeScores(finalAnswers, questions);
    setAnswers(finalAnswers);
    setActiveQuestions(questions);
    setFinalScores(scores);
    setStep("results");
    
    if (userData) {
      console.log("Saving assessment result...");
      const result = await saveAssessmentResult(userData, finalAnswers);
      if (!result.success) {
        console.error("Failed to save assessment:", result.error);
        alert(`Note: Your results are shown correctly, but there was an issue saving them to the database. \n\nError: ${result.error}\n\nPlease contact support if you need a permanent record.`);
      } else {
        console.log("Assessment saved successfully:", result.data?.id);
      }
    }
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStep("landing");
    setUserData(null);
    setAnswers({});
    setActiveQuestions([]);
    setQuestionSet(null);
    setCurrentIdx(0);
    setShowLogoutConfirm(false);
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-bg" />; // Loading placeholder
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-bg">
      {/* Top Bar with Logout - Fixed Positioning to avoid overlaps */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-[100] pointer-events-none">
        <AnimatePresence>
          {step !== "landing" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setShowLogoutConfirm(true)}
              className="group flex items-center justify-center w-10 h-10 md:w-auto md:h-12 bg-white/5 hover:bg-tbt-red/10 border border-white/10 rounded-full transition-all backdrop-blur-md shadow-xl pointer-events-auto md:px-6"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-txt3 group-hover:text-tbt-red transition-colors hidden md:block mr-3">Exit Assessment</span>
              <LogOut className="w-4 h-4 text-txt3 group-hover:text-tbt-red transition-colors" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[400px] bg-card border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <LogOut className="w-32 h-32" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-tbt-red/10 border border-tbt-red/20 flex items-center justify-center mx-auto mb-8">
                  <AlertTriangle className="w-8 h-8 text-tbt-red" />
                </div>
                
                <h3 className="font-serif text-2xl font-black text-txt mb-4 tracking-tight">End Assessment?</h3>
                <p className="text-sm text-txt3 leading-relaxed mb-10 px-4">
                  Are you sure you want to exit? Your current progress will be lost and you'll need to start again.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="h-14 rounded-2xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-txt2 hover:bg-white/5 transition-all"
                  >
                    No, Stay
                  </button>
                  <button 
                    onClick={handleRestart}
                    className="h-14 rounded-2xl bg-tbt-red hover:bg-tbt-red-hover text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-tbt-red/20"
                  >
                    Yes, Exit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {step === "landing" && <Landing onStart={handleStart} />}
          {step === "code" && (
            <AccessCodeForm 
              onValidated={handleCodeValidated} 
              onBack={() => setStep("landing")} 
            />
          )}
          {step === "category" && <CategorySelection onSelect={handleCategorySelect} />}
          {step === "intro" && <IntroScreen onComplete={handleIntroComplete} />}
          {step === "questionnaire" && (
            <Questionnaire
              userData={userData!}
              currentIdx={currentIdx}
              setCurrentIdx={setCurrentIdx}
              answers={answers}
              setAnswers={setAnswers}
              onComplete={handleComplete}
              questions={activeQuestions}
            />
          )}
          {step === "results" && userData && (
            <Results
              userData={userData}
              scores={finalScores || computeScores(answers, activeQuestions)}
              onRestart={handleRestart}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
