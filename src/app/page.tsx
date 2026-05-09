"use client";

import { useState } from "react";
import Landing from "@/components/assessment/Landing";
import Questionnaire from "@/components/assessment/Questionnaire";
import Results from "@/components/assessment/Results";
import { UserData, Answer } from "@/types";
import { computeScores } from "@/lib/utils";
import { saveAssessmentResult } from "@/actions/assessment";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Step = "landing" | "questionnaire" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  const handleStart = (data: UserData) => {
    setUserData(data);
    setStep("questionnaire");
  };

  const handleComplete = async (finalAnswers: Record<number, Answer>) => {
    setAnswers(finalAnswers);
    setStep("results");
    
    if (userData) {
      await saveAssessmentResult(userData, finalAnswers);
    }
  };

  const handleRestart = () => {
    setStep("landing");
    setUserData(null);
    setAnswers({});
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-bg">
      {/* Dynamic Background Logo */}
      <AnimatePresence>
        {step === "landing" && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.9, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-6 left-6 z-10 w-24 h-10 md:w-32 md:h-12"
          >
            <Image 
              src="/logo.png" 
              alt="TBT Logo" 
              fill 
              className="object-contain object-left"
              priority
            />
          </motion.div>
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
          {step === "questionnaire" && <Questionnaire onComplete={handleComplete} />}
          {step === "results" && userData && (
            <Results
              userData={userData}
              scores={computeScores(answers)}
              onRestart={handleRestart}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

