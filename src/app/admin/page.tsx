"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified Basic Auth for demo/prototype as requested
    // In production, use Supabase Auth or a more secure method
    if (username === "admin" && password === "tbt-admin-2024") {
      localStorage.setItem("tbt_admin_session", "active");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-glow-gold opacity-[0.05] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-glow-red opacity-[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/80 relative z-10"
      >
        <div className="text-center mb-10 md:mb-14">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 md:w-16 md:h-16 bg-gold rounded-2xl flex items-center justify-center font-serif text-2xl md:text-3xl font-black text-bg mx-auto mb-6 shadow-xl shadow-gold/20"
          >
            T
          </motion.div>
          <h1 className="font-serif text-3xl md:text-4xl font-black text-txt mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-[10px] md:text-xs text-txt3 uppercase tracking-[0.3em] font-bold opacity-60">
            Tamil Business Tribe
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-txt3 uppercase tracking-[0.2em] ml-1">
              Username
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-txt3 group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 md:h-14 bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 text-base text-txt outline-none focus:border-gold/30 focus:bg-white/[0.04] transition-all"
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-txt3 uppercase tracking-[0.2em] ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-txt3 group-focus-within:text-gold transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 md:h-14 bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-12 text-base text-txt outline-none focus:border-gold/30 focus:bg-white/[0.04] transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-txt3 hover:text-txt"
              >
                {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] md:text-xs text-tbt-red font-bold uppercase tracking-wider text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full h-12 md:h-14 bg-gold hover:bg-gold-hover transition-all duration-300 rounded-xl text-bg text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-gold/10 relative overflow-hidden group"
          >
            <span className="relative z-10">Sign In to Dashboard</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </form>

        <div className="mt-10 md:mt-14 pt-8 border-t border-white/5 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="text-[10px] md:text-[11px] text-txt3 hover:text-gold transition-colors uppercase tracking-[0.3em] font-black"
          >
            ← Back to Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
}
