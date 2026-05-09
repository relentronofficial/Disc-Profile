"use client";

import { useEffect, useState } from "react";
import { DiscProfile, UserData } from "@/types";
import { DISC_PROFILES as STATIC_PROFILES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LayoutDashboard, Loader2, Award, Zap, Shield, Heart } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ResultsProps {
  userData: UserData;
  scores: { D: number; I: number; S: number; C: number };
  onRestart: () => void;
}

export default function Results({ userData, scores, onRestart }: ResultsProps) {
  const [profiles, setProfiles] = useState<Record<string, DiscProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase.from('disc_profiles').select('*');
      if (!error && data && data.length > 0) {
        const mapped: Record<string, DiscProfile> = {};
        data.forEach((p: any) => {
          mapped[p.letter] = {
            letter: p.letter,
            name: p.name,
            nickname: p.nickname,
            color: p.color,
            dimColor: p.dim_color,
            edge: p.edge,
            pattern: p.pattern,
            watch: p.watch,
            prescription: p.prescription
          };
        });
        setProfiles(mapped);
      } else {
        setProfiles(STATIC_PROFILES);
      }
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-red opacity-10 blur-[100px]" />
        <Loader2 className="w-12 h-12 text-tbt-red animate-spin mb-6 relative z-10" />
        <p className="text-xs text-txt3 font-bold uppercase tracking-[0.3em] relative z-10 animate-pulse">
          Analyzing your DNA...
        </p>
      </div>
    );
  }

  const totalQuestions = Object.keys(scores).reduce((acc, key) => acc + scores[key as keyof typeof scores], 0) || 1;
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as keyof typeof profiles;
  const profile = profiles[dominant];

  const discTypes = ["D", "I", "S", "C"] as const;
  const scNames: Record<string, { label: string; icon: any }> = {
    D: { label: "Dominant · Fire Starter", icon: Zap },
    I: { label: "Influential · Heartbeat", icon: Heart },
    S: { label: "Steady · Quiet Root", icon: Shield },
    C: { label: "Conscientious · Architect", icon: Award },
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 relative z-1 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-10 blur-[120px]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-glow-gold rounded-full opacity-[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full mb-6"
        >
          <Award className="w-3.5 h-3.5 text-tbt-red animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-txt/80">
            DISC Assessment Result
          </span>
        </motion.div>
        <h1 className="font-serif text-4xl md:text-5xl font-black text-txt mb-4 leading-tight tracking-tight">
          Your Strategic <span className="text-gradient-red italic">Profile</span>
        </h1>
        <p className="text-sm md:text-base text-txt3 font-medium max-w-[480px] mx-auto opacity-90 leading-relaxed">
          Breakdown of your psychological architecture, {userData.name.split(' ')[0]}.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {discTypes.map((type, idx) => {
          const score = scores[type];
          const pct = Math.round((score / totalQuestions) * 100);
          const isDom = type === dominant;
          const p = profiles[type];
          const Icon = scNames[type].icon;

          if (!p) return null;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.6 }}
              className={cn(
                "bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 transition-all duration-500 relative group overflow-hidden",
                isDom && "border-tbt-red/30 bg-tbt-red/[0.02] ring-1 ring-tbt-red/10"
              )}
            >
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <Icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div className="font-serif text-2xl font-black" style={{ color: p.color }}>
                    {type}
                  </div>
                </div>
                <div className="font-serif text-3xl font-black opacity-30 group-hover:opacity-100 transition-all duration-500" style={{ color: p.color }}>
                  {score}
                </div>
              </div>
              
              <div className="text-[9px] text-txt3 font-black uppercase tracking-[0.3em] mb-4 relative z-10 opacity-70">
                {scNames[type].label}
              </div>
              
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3 relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.5, delay: 0.5 + (0.1 * idx), ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              </div>
              
              <div className="text-[9px] text-txt3 text-right font-black uppercase tracking-[0.2em] opacity-50 relative z-10">
                {pct}% Intensity
              </div>
            </motion.div>
          );
        })}
      </div>

      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden mb-12 relative shadow-2xl shadow-black/80"
        >
          <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/[0.01]">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-serif text-4xl font-black shrink-0 shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: profile.letter === 'D' ? '#cc0000' : profile.color }}
            >
              <span className="relative z-10 text-white">{profile.letter}</span>
            </motion.div>
            <div className="text-center md:text-left pt-1">
              <h2 className="font-serif text-3xl md:text-4xl font-black text-txt mb-2 tracking-tight">
                {profile.letter} <span className="text-white/10 mx-1">—</span> {profile.nickname}
              </h2>
              <div className="text-[9px] text-txt3 uppercase tracking-[0.4em] font-black opacity-50">
                {profile.name} Core Profile · {Math.round((scores[dominant as keyof typeof scores] / totalQuestions) * 100)}% Match
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            <section>
              <div className="text-[10px] font-black text-tbt-red uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-tbt-red animate-pulse" />
                Professional Edge
              </div>
              <p className="text-sm md:text-base text-txt2 leading-relaxed font-medium opacity-90">{profile.edge}</p>
            </section>

            <section>
              <div className="text-[10px] font-black text-tbt-red uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-tbt-red animate-pulse" />
                Mental Pattern
              </div>
              <p className="text-sm md:text-base text-txt2 leading-relaxed font-medium opacity-90">{profile.pattern}</p>
            </section>

            <section>
              <div className="text-[10px] font-black text-tbt-red uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-tbt-red animate-pulse" />
                Blindspots
              </div>
              <p className="text-sm md:text-base text-txt2 leading-relaxed font-medium opacity-90">{profile.watch}</p>
            </section>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white/[0.02] border border-tbt-red/20 rounded-[2rem] p-8 mt-4 relative overflow-hidden group shadow-lg"
            >
              <div className="text-[10px] font-black text-tbt-red uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
                <Zap className="w-4 h-4" />
                Growth Prescription
              </div>
              <p className="text-xl md:text-2xl text-txt font-serif leading-snug italic font-medium relative z-10">
                "{profile.prescription}"
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex flex-col md:flex-row gap-4 justify-center items-center"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="w-full md:w-auto h-14 px-10 bg-white/[0.03] border border-white/10 rounded-xl text-txt2 text-[10px] font-black uppercase tracking-[0.3em] hover:text-txt transition-all duration-300 flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retake
        </motion.button>
        <Link href="/admin" className="w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 px-10 bg-tbt-red hover:bg-tbt-red-hover transition-all duration-500 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group"
          >
            <LayoutDashboard className="w-4 h-4" />
            Strategic Dashboard
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

