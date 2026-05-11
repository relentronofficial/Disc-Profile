"use client";

import { useEffect, useState } from "react";
import { DiscProfile, UserData, BlendedProfile } from "@/types";
import { DISC_PROFILES as STATIC_PROFILES, BLEND_TITLES } from "@/lib/constants";
import { cn, analyzeDiscProfile } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LayoutDashboard, Loader2, Award, Zap, Shield, Heart, MessageSquare, Lightbulb, Activity, Target, Compass } from "lucide-react";
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
            prescription: p.prescription,
            traits: p.traits || {
              summary: "",
              communication: "",
              decisionMaking: "",
              stressResponse: "",
              leadership: "",
              growth: ""
            }
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
          Synthesizing your behavioral DNA...
        </p>
      </div>
    );
  }

  const analysis = analyzeDiscProfile(scores, profiles);
  const { insights, axes, pct, bands, sorted } = analysis;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 md:py-20 relative z-1">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glow-red rounded-full opacity-10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-gold rounded-full opacity-[0.05] blur-[150px] pointer-events-none" />

      {/* Header - 1. PROFILE IDENTITY */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 md:mb-24 pt-[5vh]"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full mb-10"
        >
          <Award className="w-4 h-4 text-tbt-red animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-txt/80">
            Psychological Intelligence Report
          </span>
        </motion.div>
        
        <h1 className="font-serif font-black text-txt mb-8 leading-[1.1] tracking-tight" style={{ fontSize: "clamp(2.2rem, 6vw + 1rem, 4.5rem)" }}>
          {analysis.profileLabel.split(' ').map((word, i) => (
            <span key={i} className={i === 1 || i === 2 ? "text-gradient-red italic" : ""}>{word} </span>
          ))}
        </h1>
        
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 mt-12 backdrop-blur-sm shadow-2xl shadow-black/40">
          <p className="text-lg md:text-2xl text-txt font-medium max-w-[800px] mx-auto leading-relaxed italic">
            "{insights.profileIdentity}"
          </p>
        </div>
      </motion.div>

      {/* 2. YOUR PERCENTAGE BREAKDOWN */}
      <div className="mb-32">
        <div className="flex items-center gap-4 mb-14">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-txt3">The Behavioral Blueprint</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(["D", "I", "S", "C"] as const).map((type, idx) => {
            const p = profiles[type];
            if (!p) return null;
            const score = pct[type];
            const band = bands[type];

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={cn(
                  "bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group",
                  analysis.tiedDimensions.includes(type) && "border-tbt-red/30 bg-tbt-red/[0.02]"
                )}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center font-serif text-xl font-black" style={{ color: p.color }}>
                    {type}
                  </div>
                  <div className="text-2xl font-black opacity-20" style={{ color: p.color }}>{Math.round(score)}%</div>
                </div>
                
                <div className="h-32 flex items-end gap-1 mb-6 bg-white/[0.03] rounded-2xl p-2 relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(10, score)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-full rounded-xl overflow-hidden relative" 
                  >
                    <div className="absolute inset-0 opacity-40" style={{ backgroundColor: p.color }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-txt">{p.name}</div>
                  <div className="text-[10px] font-bold text-txt3 uppercase tracking-wider">{band}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-center text-xs text-txt3 mt-10 max-w-[600px] mx-auto italic opacity-60">
          {insights.breakdownNote}
        </p>
      </div>

      {/* 3. NATURAL STRENGTHS & 4. MENTAL PATTERN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative group"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-tbt-red/10 flex items-center justify-center border border-tbt-red/20">
              <Zap className="w-6 h-6 text-tbt-red" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-txt/60">
              Your Natural Strengths
            </h3>
          </div>
          <ul className="space-y-6">
            {insights.strengths.map((strength, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-tbt-red shrink-0 mt-1">
                  {i + 1}
                </div>
                <p className="text-lg text-txt2 font-medium leading-relaxed">{strength}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative group"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
              <Lightbulb className="w-6 h-6 text-tbt-red opacity-80" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-txt/60">
              Your Mental Pattern
            </h3>
          </div>
          <p className="text-lg text-txt2 leading-relaxed font-medium">
            {insights.mentalPattern}
          </p>
          
          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-txt3 mb-2">Process Orientation</div>
              <div className="text-xs font-bold text-txt">{axes.taskVsPeople.dominant}</div>
            </div>
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-txt3 mb-2">Operational Pace</div>
              <div className="text-xs font-bold text-txt">{axes.fastVsCautious.dominant}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. INNER TENSION & AXIS ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 md:p-16 mb-24 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
          <Activity className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 text-white/40 mb-10">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Psychological Tension Axis</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-txt mb-8 leading-tight">
                Understanding your <span className="text-tbt-red">Inner Tension</span>
              </h2>
              <p className="text-lg md:text-xl text-txt2 leading-relaxed font-medium mb-8 opacity-80">
                {insights.innerTension}
              </p>
            </div>
            
            <div className="space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-txt3">
                    <span>Task Oriented</span>
                    <span>People Oriented</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-tbt-red" style={{ width: `${axes.taskVsPeople.task}%` }} />
                    <div className="h-full bg-tbt-red/20" style={{ width: `${axes.taskVsPeople.people}%` }} />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-txt3">
                    <span>Fast-Paced</span>
                    <span>Cautious</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-tbt-red" style={{ width: `${axes.fastVsCautious.fast}%` }} />
                    <div className="h-full bg-tbt-red/20" style={{ width: `${axes.fastVsCautious.caution}%` }} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. BLIND SPOTS */}
      <div className="mb-24">
        <div className="inline-flex items-center gap-3 text-tbt-red mb-10">
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">The Blind Spot Radar</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insights.blindSpots.map((spot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[2.5rem] p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-txt3">
                  {spot.dimension}
                </div>
              </div>
              <p className="text-lg text-txt2 font-medium leading-relaxed">
                {spot.insight}
              </p>
            </motion.div>
          ))}
          {insights.blindSpots.length === 0 && (
             <div className="col-span-2 text-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem]">
                <p className="text-txt3 font-medium italic">No major blind spots detected. You maintain a highly balanced profile.</p>
             </div>
          )}
        </div>
      </div>

      {/* 7. BUSINESS PRESCRIPTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-tbt-red border border-tbt-red/20 rounded-[4rem] p-10 md:p-20 mb-24 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
           <Zap className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 text-white/60 mb-10">
            <Target className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.5em]">Strategic Business Protocol</span>
          </div>
          
          <h2 className="font-serif text-3xl md:text-6xl font-black text-white mb-10 leading-[1.1]">
            Your <span className="opacity-60 italic">Zero-Rupee</span> Marketing Angle
          </h2>
          
          <div className="max-w-[750px]">
            <p className="text-xl md:text-3xl text-white font-medium leading-relaxed mb-12">
              "{insights.businessPrescription}"
            </p>
            
            <div className="flex flex-wrap gap-4">
               {analysis.tiedDimensions.map(d => (
                 <div key={d} className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                   Leveraging {profiles[d]?.name}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8. GROWTH EDGE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="bg-[#050505] border border-white/10 rounded-[3rem] p-10 md:p-16 mb-24 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-tbt-red/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-tbt-red/10 flex items-center justify-center mx-auto mb-8 border border-tbt-red/20">
            <Compass className="w-8 h-8 text-tbt-red" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-txt3 mb-6">The Growth Edge</h3>
          <p className="text-2xl md:text-4xl font-serif font-black text-txt leading-tight max-w-[800px] mx-auto italic">
            {insights.growthEdge}
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col md:flex-row gap-4 justify-center items-center pb-20"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="w-full md:w-auto h-16 px-12 bg-white/[0.03] border border-white/10 rounded-2xl text-txt2 text-[10px] font-black uppercase tracking-[0.4em] hover:text-txt transition-all duration-300 flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Retake Assessment
        </motion.button>
        <Link href="/admin" className="w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-16 px-12 bg-tbt-red hover:bg-tbt-red-hover transition-all duration-500 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group"
          >
            <LayoutDashboard className="w-5 h-5" />
            Strategic Dashboard
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

