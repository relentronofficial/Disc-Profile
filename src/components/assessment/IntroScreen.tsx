"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "../../../TBT.json";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface IntroScreenProps {
  onComplete: () => void;
}

const INSTRUCTIONS = [
  "Overthink panna vendam 😊",
  "Ungalukku natural ah feel aagura answer ah choose pannunga — ideal ah irukanum nu illa, mathavanga expect pannura madhiri irukanum nu illa.",
  "Indha assessment unga real personality um behavioral style um purinjukka design pannirukom.",
  "So honest ah answer pannina dhaan most accurate result kidaikum",
  "Apo than ungala improve panna yengalala help panna mudiyum."
];

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (visibleIndex < INSTRUCTIONS.length - 1) {
      const timer = setTimeout(() => {
        setVisibleIndex(prev => prev + 1);
      }, visibleIndex === -1 ? 400 : 2200); // Faster cadence for mobile/compact feel
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [visibleIndex]);

  return (
    <div className="min-h-[100dvh] w-full bg-bg flex flex-col md:flex-row items-center justify-between p-6 md:p-[8vh] overflow-hidden relative box-border safe-area-inset">
      {/* Logo - Positioned relative to viewport padding */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-[3vh] left-6 md:top-8 md:left-10 z-30 w-20 h-8 md:w-32 md:h-12"
      >
        <Image 
          src="/logo.png" 
          alt="TBT Logo" 
          fill 
          className="object-contain object-left"
          priority
        />
      </motion.div>

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-5 blur-[120px] pointer-events-none" />

      {/* Left/Top Section: Lottie Animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full md:w-1/2 flex items-center justify-center mt-[7vh] md:mt-0 flex-1 min-h-0"
      >
        <div className="w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[340px] md:max-w-[450px] lg:max-w-[500px] aspect-square relative">
          <Lottie 
            animationData={animationData} 
            loop={true}
            className="w-full h-full drop-shadow-[0_0_20px_rgba(204,0,0,0.15)]"
          />
        </div>
      </motion.div>

      {/* Right/Bottom Section: Instructions & CTA */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center md:pl-[6vw] flex-[1.2] md:flex-1 min-h-0 z-10 pb-[2vh] md:pb-0 gap-[2vh] md:gap-[4vh]">
        {/* Text Container */}
        <div className="space-y-[1.5vh] md:space-y-[2.5vh] w-full flex flex-col justify-center items-center md:items-start overflow-hidden">
          {INSTRUCTIONS.map((text, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: visibleIndex >= index ? (visibleIndex === index ? 1 : 0.35) : 0,
                y: visibleIndex >= index ? 0 : 10,
                scale: visibleIndex === index ? 1 : 0.98
              }}
              transition={{ 
                duration: 0.7, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="font-medium leading-[1.4] tracking-tight text-center md:text-left px-4"
              style={{
                fontSize: "clamp(0.85rem, 1vh + 0.4vw, 1.35rem)",
                maxWidth: "min(90vw, 500px)",
                color: visibleIndex === index ? "var(--color-txt)" : "var(--color-txt3)"
              }}
            >
              {text}
            </motion.p>
          ))}
        </div>

        {/* Start Button Container */}
        <div className="h-[10vh] flex items-center mt-0">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="group relative inline-flex items-center gap-3 px-10 py-[1.5vh] md:py-[2vh] bg-tbt-red rounded-xl text-white font-black tracking-[0.2em] shadow-[0_10px_30px_rgba(204,0,0,0.3)] transition-all overflow-hidden uppercase"
                style={{
                  fontSize: "clamp(0.7rem, 0.7vh + 0.3vw, 0.85rem)",
                  minHeight: "44px"
                }}
              >
                <span className="relative z-10">Start Assessment</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
