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
      }, visibleIndex === -1 ? 500 : 2500); // Slightly faster for better flow
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visibleIndex]);

  return (
    <div className="h-screen w-full bg-bg flex flex-col md:flex-row items-center justify-center p-[5vh] md:p-[8vh] overflow-hidden relative border-none box-border">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.9, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-6 left-6 z-20 w-24 h-10 md:w-32 md:h-12"
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-red rounded-full opacity-5 blur-[120px]" />

      {/* Left Side: Lottie Animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-full h-[35vh] md:h-auto md:w-1/2 flex justify-center items-center mb-[4vh] md:mb-0 relative"
      >
        <div className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px]">
          <Lottie 
            animationData={animationData} 
            loop={true}
            className="w-full h-full drop-shadow-[0_0_30px_rgba(204,0,0,0.15)]"
          />
        </div>
      </motion.div>

      {/* Right Side: Instructions */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-start justify-center md:pl-[6vw] relative z-10">
        <div className="space-y-[2vh] md:space-y-[3vh] w-full">
          {INSTRUCTIONS.map((text, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: visibleIndex >= index ? (visibleIndex === index ? 1 : 0.4) : 0,
                y: visibleIndex >= index ? 0 : 15,
                scale: visibleIndex === index ? 1 : 0.98
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1],
                opacity: { duration: 1 }
              }}
              className="font-medium leading-relaxed tracking-tight text-left"
              style={{
                fontSize: "clamp(0.95rem, 1.2vh + 0.8vw, 1.45rem)",
                maxWidth: "min(100%, 550px)",
                color: visibleIndex === index ? "var(--color-txt)" : "var(--color-txt3)"
              }}
            >
              {text}
            </motion.p>
          ))}
        </div>

        {/* Start Button Container */}
        <div className="h-[12vh] md:h-[15vh] flex items-center mt-[4vh] md:mt-[2vh]">
          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 md:px-10 md:py-4 bg-tbt-red rounded-xl text-white font-black tracking-[0.2em] shadow-[0_10px_40px_rgba(204,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(204,0,0,0.4)] transition-all overflow-hidden uppercase"
                style={{
                  fontSize: "clamp(0.7rem, 0.8vh + 0.4vw, 0.85rem)"
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
