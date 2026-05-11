"use client";

import { analyzeDiscProfile } from "@/lib/utils";
import { DISC_PROFILES } from "@/lib/constants";

export default function ScoringDebugPage() {
  const testCases = [
    { name: "Test Case 1: Classic single dominant", scores: { D: 13, I: 4, S: 2, C: 1 } },
    { name: "Test Case 2: Standard two-way blend", scores: { D: 10, I: 3, S: 2, C: 5 } },
    { name: "Test Case 3: TIED top two", scores: { D: 8, I: 8, S: 2, C: 2 } },
    { name: "Test Case 4: Three-way blend", scores: { D: 7, I: 7, S: 6, C: 0 } },
    { name: "Test Case 5: Balanced / Versatile", scores: { D: 6, I: 5, S: 5, C: 4 } },
    { name: "Test Case 6: Three-way tie", scores: { D: 7, I: 7, S: 0, C: 6 } },
    { name: "Test Case 7: 30-question assessment", scores: { D: 12, I: 9, S: 6, C: 3 } },
    { name: "Test Case 8: Near-tie (within 5%)", scores: { D: 8, I: 6, S: 3, C: 3 } },
  ];

  const results = testCases.map(tc => ({
    name: tc.name,
    analysis: analyzeDiscProfile(tc.scores, DISC_PROFILES)
  }));

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 font-mono text-xs">
      <h1 className="text-2xl mb-10 text-tbt-red font-black uppercase tracking-widest border-b border-white/10 pb-4">
        DISC Scoring Engine Validator
      </h1>

      <div className="space-y-12">
        {results.map((r, i) => (
          <div key={i} className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
            <h2 className="text-lg text-tbt-red mb-6 font-bold">{r.name}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-txt3 mb-1 uppercase tracking-tighter">Profile Type</div>
                <div className="text-xl font-black text-white">{r.analysis.profileType}</div>
              </div>
              <div>
                <div className="text-txt3 mb-1 uppercase tracking-tighter">Intensity</div>
                <div className="text-xl font-black text-white">{r.analysis.intensity}</div>
              </div>
              <div>
                <div className="text-txt3 mb-1 uppercase tracking-tighter">Total N</div>
                <div className="text-xl font-black text-white">{r.analysis.total}</div>
              </div>
              <div>
                <div className="text-txt3 mb-1 uppercase tracking-tighter">Primary</div>
                <div className="text-xl font-black text-white">{r.analysis.primaryType}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-white/40 uppercase tracking-widest font-black text-[10px]">Percentage & Bands</h3>
                {r.analysis.sorted.map(s => (
                  <div key={s.key} className="flex items-center gap-4">
                    <div className="w-8 font-black text-lg">{s.key}</div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-tbt-red" style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="w-12 text-right font-bold">{Math.round(s.pct)}%</div>
                    <div className="w-24 text-[9px] uppercase opacity-40 font-black">{s.band}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-white/40 uppercase tracking-widest font-black text-[10px]">Axes & Blinds</h3>
                <div className="space-y-2">
                   <div className="flex justify-between">
                     <span>Task vs People:</span>
                     <span className="text-white font-bold">{r.analysis.axes.taskVsPeople.dominant} ({Math.round(r.analysis.axes.taskVsPeople.gap)}%)</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Fast vs Cautious:</span>
                     <span className="text-white font-bold">{r.analysis.axes.fastVsCautious.dominant} ({Math.round(r.analysis.axes.fastVsCautious.gap)}%)</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Tied Detected:</span>
                     <span className="text-white font-bold">{r.analysis.isTied ? "YES" : "NO"}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Suppressed:</span>
                     <span className="text-tbt-red font-bold">{r.analysis.suppressedDimensions.join(", ") || "None"}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5">
               <h3 className="text-white/40 uppercase tracking-widest font-black text-[10px] mb-4">Profile Summary</h3>
               <p className="text-sm text-txt2 italic leading-relaxed">
                 {r.analysis.insights.profileIdentity}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
