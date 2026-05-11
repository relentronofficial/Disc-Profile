"use client";

import { useState } from "react";
import { UserData } from "@/types";
import { ArrowRight, Clock, CheckCircle, Lock, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LandingProps {
  onStart: (data: UserData) => void;
}

export default function Landing({ onStart }: LandingProps) {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState<UserData>({
    name: "",
    mobile: "+91 ",
    city: "",
    biz: "",
    date: getToday(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Please enter your full name";
    
    const digitsOnly = formData.mobile.replace(/\D/g, "");
    if (!formData.mobile.trim() || formData.mobile === "+91 ") {
      newErrors.mobile = "Mobile number is required";
    } else if (formData.mobile.startsWith("+91") && digitsOnly.length !== 12) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    } else if (digitsOnly.length < 10) {
      newErrors.mobile = "Mobile number must be at least 10 digits";
    }
    
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.biz.trim()) newErrors.biz = "Please specify your business or work";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStart = () => {
    if (validate()) {
      onStart(formData);
    }
  };

  const inputClasses = (field: string) => `
    h-11 w-full bg-white/[0.03] border rounded-xl px-4 text-sm text-txt font-sans outline-none transition-all duration-200
    placeholder:text-txt3/50
    ${errors[field] 
      ? "border-tbt-red/40 bg-tbt-red/5 ring-1 ring-tbt-red/20" 
      : "border-white/10 focus:border-tbt-red/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-tbt-red/20 shadow-inner"}
  `;

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center relative z-1 px-6 overflow-hidden bg-bg">
      {/* Brand Logo - Top Left */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <div className="relative w-[90px] h-[35px] md:w-[120px] md:h-[45px]">
          <Image 
            src="/logo.png" 
            alt="TBT Logo" 
            fill 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-20 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-10 blur-[120px] animate-pulse-slow [animation-delay:2s] pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center w-full max-w-[520px] gap-[2vh] md:gap-[4vh]">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full mb-3 md:mb-6 relative group"
          >
            <Sparkles className="w-2.5 h-2.5 text-tbt-red animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-txt2 group-hover:text-txt transition-colors">
              Tamil Business Tribe Assessment
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-serif font-black leading-tight text-txt mb-2 md:mb-3 text-center tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 3.5vh + 0.5rem, 3.2rem)" }}
          >
            Your Business <span className="text-gradient-red italic">Mindset</span> Profile
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-txt2 leading-relaxed max-w-[540px] mx-auto mb-4 md:mb-8 text-center font-medium opacity-90 px-4 md:px-0"
            style={{ fontSize: "clamp(0.75rem, 0.8vh + 0.4rem, 0.95rem)" }}
          >
            Unlock the dynamic DISC framework to decode your entrepreneurial DNA.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 md:gap-6 justify-center"
          >
            <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-txt3 font-black uppercase tracking-[0.2em]">
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-tbt-red/80" /> 8 Mins
            </div>
            <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-txt3 font-black uppercase tracking-[0.2em]">
              <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-tbt-red/80" /> DISC Logic
            </div>
            <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-txt3 font-black uppercase tracking-[0.2em]">
              <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-tbt-red/80" /> Private
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-10 w-full text-left relative shadow-2xl shadow-black/50 mx-4"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-white/5">
            <div>
              <div className="text-[9px] md:text-[10px] font-black text-txt uppercase tracking-[0.2em] mb-0.5">Respondent Intake</div>
              <div className="text-[8px] md:text-[9px] text-txt3 font-medium">Professional details required.</div>
            </div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-tbt-red shadow-[0_0_8px_rgba(204,0,0,0.5)] animate-pulse" />
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-bold text-txt/70 flex items-center gap-2 ml-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({...errors, name: ""});
                  }}
                  className={inputClasses("name")}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[8px] md:text-[9px] text-tbt-red font-semibold flex items-center gap-1 mt-0.5 ml-1"
                    >
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-bold text-txt/70 flex items-center gap-2 ml-1 uppercase tracking-wider">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  value={formData.mobile}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith("+")) {
                       val = "+" + val.replace(/[^\d ]/g, "");
                    }
                    setFormData({ ...formData, mobile: val });
                    if (errors.mobile) setErrors({...errors, mobile: ""});
                  }}
                  className={inputClasses("mobile")}
                />
                <AnimatePresence>
                  {errors.mobile && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[8px] md:text-[9px] text-tbt-red font-semibold flex items-center gap-1 mt-0.5 ml-1"
                    >
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.mobile}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-bold text-txt/70 flex items-center gap-2 ml-1 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (errors.city) setErrors({...errors, city: ""});
                  }}
                  className={inputClasses("city")}
                />
                <AnimatePresence>
                  {errors.city && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[8px] md:text-[9px] text-tbt-red font-semibold flex items-center gap-1 mt-0.5 ml-1"
                    >
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.city}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-bold text-txt/70 flex items-center gap-2 ml-1 uppercase tracking-wider">
                  Business
                </label>
                <input
                  type="text"
                  placeholder="Industry/Profession"
                  value={formData.biz}
                  onChange={(e) => {
                    setFormData({ ...formData, biz: e.target.value });
                    if (errors.biz) setErrors({...errors, biz: ""});
                  }}
                  className={inputClasses("biz")}
                />
                <AnimatePresence>
                  {errors.biz && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[8px] md:text-[9px] text-tbt-red font-semibold flex items-center gap-1 mt-0.5 ml-1"
                    >
                      <AlertCircle className="w-2.5 h-2.5" /> {errors.biz}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStart}
            className="w-full h-11 md:h-12 mt-6 md:mt-8 bg-tbt-red hover:bg-tbt-red-hover transition-all duration-300 rounded-xl font-sans text-[10px] md:text-xs font-black text-white flex items-center justify-center gap-2.5 shadow-xl shadow-tbt-red/20 relative overflow-hidden group/btn"
          >
            <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase">
              BEGIN DISCOVERY
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </motion.button>
          
          <div className="mt-4 md:mt-5 text-center">
            <p className="text-[8px] md:text-[9px] text-txt3 font-medium flex items-center justify-center gap-2">
              <Lock className="w-2.5 h-2.5" /> Secure & Confidential
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
