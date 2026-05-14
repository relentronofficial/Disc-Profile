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
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Parallel fetch for profiles and category name
      const [resProfiles, resCategory] = await Promise.all([
        supabase.from('disc_profiles').select('*'),
        userData.categoryId 
          ? supabase.from('assessment_categories').select('name').eq('id', userData.categoryId).single()
          : Promise.resolve({ data: null, error: null })
      ]);

      if (!resProfiles.error && resProfiles.data && resProfiles.data.length > 0) {
        const mapped: Record<string, DiscProfile> = {};
        resProfiles.data.forEach((p: any) => {
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
              summary: "", communication: "", decisionMaking: "", stressResponse: "", leadership: "", growth: ""
            }
          };
        });
        setProfiles(mapped);
      } else {
        setProfiles(STATIC_PROFILES);
      }

      if (resCategory.data) {
        setCategoryName(resCategory.data.name);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [userData.categoryId]);

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
    <div className="max-w-[1000px] mx-auto px-5 md:px-6 py-8 md:py-20 relative z-1">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glow-red rounded-full opacity-10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-gold rounded-full opacity-[0.05] blur-[150px] pointer-events-none" />

      {/* Header - 1. PROFILE IDENTITY */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-24 pt-[2vh] md:pt-[5vh]"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-6 md:mb-10"
        >
          <Award className="w-3 h-3 md:w-4 md:h-4 text-tbt-red animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-txt/80">
            Psychological Intelligence Report
          </span>
        </motion.div>
        
        <h1 className="font-serif font-black text-txt mb-6 md:mb-8 leading-[1.1] tracking-tight" style={{ fontSize: "clamp(1.8rem, 5vw + 1rem, 4.5rem)" }}>
          {categoryName && (
            <span className="block text-[8px] md:text-xs text-tbt-red font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-3 md:mb-4">
              {categoryName} Profile Identity
            </span>
          )}
          {analysis.profileLabel.split(' ').map((word, i) => (
            <span key={i} className={i === 1 || i === 2 ? "text-gradient-red italic" : ""}>{word} </span>
          ))}
        </h1>
        
        <div className="bg-white/[0.03] border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 mt-8 md:mt-12 backdrop-blur-sm shadow-2xl shadow-black/40">
          <p className="text-base md:text-2xl text-txt font-medium max-w-[800px] mx-auto leading-relaxed italic">
            "{insights.profileIdentity}"
          </p>
        </div>
      </motion.div>

      {/* 2. YOUR PERCENTAGE BREAKDOWN */}
      <div className="mb-20 md:mb-32">
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-txt3">The Behavioral Blueprint</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  "bg-white/[0.02] border border-white/10 rounded-[1.2rem] md:rounded-[2rem] p-4 md:p-6 relative overflow-hidden group",
                  analysis.tiedDimensions.includes(type) && "border-tbt-red/30 bg-tbt-red/[0.02]"
                )}
              >
                <div className="flex items-center justify-between mb-4 md:mb-8">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/[0.05] flex items-center justify-center font-serif text-lg md:text-xl font-black" style={{ color: p.color }}>
                    {type}
                  </div>
                  <div className="text-xl md:text-2xl font-black opacity-20" style={{ color: p.color }}>{Math.round(score)}%</div>
                </div>
                
                <div className="h-20 md:h-32 flex items-end gap-1 mb-4 md:mb-6 bg-white/[0.03] rounded-xl md:rounded-2xl p-1.5 md:p-2 relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(10, score)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-full rounded-lg md:rounded-xl overflow-hidden relative" 
                  >
                    <div className="absolute inset-0 opacity-40" style={{ backgroundColor: p.color }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                </div>

                <div className="space-y-0.5 md:space-y-1">
                  <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-txt">{p.name}</div>
                  <div className="text-[7px] md:text-[10px] font-bold text-txt3 uppercase tracking-wider">{band}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <p className="text-center text-[10px] md:text-xs text-txt3 mt-8 md:mt-10 max-w-[600px] mx-auto italic opacity-60">
          {insights.breakdownNote}
        </p>
      </div>

      {/* 3. NATURAL STRENGTHS & 4. MENTAL PATTERN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 relative group"
        >
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-tbt-red/10 flex items-center justify-center border border-tbt-red/20">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-tbt-red" />
            </div>
            <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-txt/60">
              Your Natural Strengths
            </h3>
          </div>
          <ul className="space-y-4 md:space-y-6">
            {insights.strengths.map((strength, i) => (
              <li key={i} className="flex gap-3 md:gap-4">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/5 flex items-center justify-center text-[8px] md:text-[10px] font-black text-tbt-red shrink-0 mt-1">
                  {i + 1}
                </div>
                <p className="text-base md:text-lg text-txt2 font-medium leading-relaxed">{strength}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 relative group"
        >
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
              <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-tbt-red opacity-80" />
            </div>
            <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-txt/60">
              Your Mental Pattern
            </h3>
          </div>
          <p className="text-base md:text-lg text-txt2 leading-relaxed font-medium">
            {insights.mentalPattern}
          </p>
          
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5 grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <div className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-txt3 mb-1.5 md:mb-2">Process Orientation</div>
              <div className="text-[10px] md:text-xs font-bold text-txt">{axes.taskVsPeople.dominant}</div>
            </div>
            <div>
              <div className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-txt3 mb-1.5 md:mb-2">Operational Pace</div>
              <div className="text-[10px] md:text-xs font-bold text-txt">{axes.fastVsCautious.dominant}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. INNER TENSION & AXIS ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/[0.01] border border-white/5 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 mb-16 md:mb-24 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] hidden md:block">
          <Activity className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 md:gap-3 text-white/40 mb-8 md:mb-10">
            <Activity className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">Psychological Tension Axis</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="font-serif text-2xl md:text-5xl font-black text-txt mb-6 md:mb-8 leading-tight">
                Understanding your <span className="text-tbt-red">Inner Tension</span>
              </h2>
              <p className="text-base md:text-xl text-txt2 leading-relaxed font-medium mb-8 opacity-80">
                {insights.innerTension}
              </p>
            </div>
            
            <div className="space-y-8 md:space-y-10">
               <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-txt3">
                    <span>Task Oriented</span>
                    <span>People Oriented</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-tbt-red" style={{ width: `${axes.taskVsPeople.task}%` }} />
                    <div className="h-full bg-tbt-red/20" style={{ width: `${axes.taskVsPeople.people}%` }} />
                  </div>
               </div>
               
               <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-txt3">
                    <span>Fast-Paced</span>
                    <span>Cautious</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-tbt-red" style={{ width: `${axes.fastVsCautious.fast}%` }} />
                    <div className="h-full bg-tbt-red/20" style={{ width: `${axes.fastVsCautious.cautious}%` }} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. BLIND SPOTS */}
      <div className="mb-16 md:mb-24">
        <div className="inline-flex items-center gap-3 text-tbt-red mb-8 md:mb-10">
          <Shield className="w-5 h-5" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">The Blind Spot Radar</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {insights.blindSpots.map((spot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-txt3">
                  {spot.dimension}
                </div>
              </div>
              <p className="text-base md:text-lg text-txt2 font-medium leading-relaxed">
                {spot.insight}
              </p>
            </motion.div>
          ))}
          {insights.blindSpots.length === 0 && (
             <div className="col-span-1 md:col-span-2 text-center py-12 md:py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-[1.5rem] md:rounded-[3rem]">
                <p className="text-[10px] md:text-xs text-txt3 font-medium italic">No major blind spots detected. You maintain a highly balanced profile.</p>
             </div>
          )}
        </div>
      </div>

      {/* 7. BUSINESS PRESCRIPTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-tbt-red border border-tbt-red/20 rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 mb-16 md:mb-24 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 hidden md:block">
           <Zap className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 md:gap-3 text-white/60 mb-8 md:mb-10">
            <Target className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">Strategic Business Protocol</span>
          </div>
          
          <h2 className="font-serif text-2xl md:text-6xl font-black text-white mb-8 md:mb-10 leading-[1.1]">
            Tamil Business Tribe Angle
          </h2>
          
          <div className="max-w-[750px]">
            <p className="text-lg md:text-3xl text-white font-medium leading-relaxed mb-10 md:mb-12">
              "{insights.businessPrescription}"
            </p>
            
            <div className="flex flex-wrap gap-3 md:gap-4">
               {analysis.tiedDimensions.map(d => (
                 <div key={d} className="px-4 md:px-6 py-1.5 md:py-2 bg-white/10 backdrop-blur-md rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
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
        className="bg-[#050505] border border-white/10 rounded-[1.5rem] md:rounded-[3rem] p-8 md:p-16 mb-16 md:mb-24 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-tbt-red/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-tbt-red/10 flex items-center justify-center mx-auto mb-6 md:mb-8 border border-tbt-red/20">
            <Compass className="w-6 h-6 md:w-8 md:h-8 text-tbt-red" />
          </div>
          <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-txt3 mb-4 md:mb-6">The Growth Edge</h3>
          <p className="text-xl md:text-4xl font-serif font-black text-txt leading-tight max-w-[800px] mx-auto italic">
            {insights.growthEdge}
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col md:flex-row gap-4 justify-center items-center pb-12 md:pb-20"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="w-full md:w-auto h-14 md:h-16 px-8 md:px-12 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-txt2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] hover:text-txt transition-all duration-300 flex items-center justify-center gap-2 md:gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Retake Assessment
        </motion.button>
      </motion.div>
    </div>
  );
}

