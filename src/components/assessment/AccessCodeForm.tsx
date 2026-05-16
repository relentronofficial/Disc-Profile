"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { validateAccessCode } from "@/actions/accessControl";
import { Question, QuestionSet } from "@/types";

interface AccessCodeFormProps {
  onValidated: (questions: Question[], questionSet: QuestionSet) => void;
  onBack: () => void;
}

export default function AccessCodeForm({ onValidated, onBack }: AccessCodeFormProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateAccessCode(code);
      if (result.success) {
        // Now that result.success is true, TypeScript knows questions and questionSet exist
        onValidated(result.questions!, result.questionSet!);
      } else {
        setError(result.error || "Validation failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-red opacity-[0.05] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-red opacity-[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-tbt-red/10 border border-tbt-red/20 flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-tbt-red" />
          </div>
          <h2 className="font-serif text-3xl font-black text-txt mb-3 tracking-tight">Access Required</h2>
          <p className="text-sm text-txt3 leading-relaxed">
            Please enter your unique access code to begin your personalized assessment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-txt3 uppercase tracking-[0.2em] ml-1">
              Assessment Code
            </label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-txt3 group-focus-within:text-tbt-red transition-colors" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. EMP001"
                disabled={isLoading}
                className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 text-base text-txt outline-none focus:border-tbt-red/40 focus:bg-white/[0.04] transition-all uppercase tracking-widest placeholder:tracking-normal placeholder:normal-case placeholder:text-txt3/30"
                required
              />
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-[11px] text-tbt-red font-bold uppercase tracking-wider mt-2 ml-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full h-14 bg-tbt-red hover:bg-tbt-red-hover disabled:opacity-50 disabled:hover:bg-tbt-red transition-all duration-300 rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-tbt-red/20 flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Validate Code
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <button
            onClick={onBack}
            className="text-[10px] text-txt3 hover:text-txt transition-colors uppercase tracking-[0.3em] font-black"
          >
            ← Back to Details
          </button>
          
          <div className="flex items-center gap-2 text-[9px] text-txt3/50 font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            Verified Assessment System
          </div>
        </div>
      </motion.div>
    </div>
  );
}
