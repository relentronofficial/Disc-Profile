"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      setLoading(true);
      const results: any = {
        env: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "MISSING",
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ') ? "Valid Format (eyJ)" : "INVALID FORMAT") : "MISSING",
        },
        connection: null,
        error: null,
      };

      try {
        const { data, error } = await supabase.from('questions').select('id').limit(1);
        results.connection = data ? "SUCCESS" : "FAILED";
        results.error = error;
      } catch (err: any) {
        results.connection = "CRASHED";
        results.error = {
          message: err.message,
          stack: err.stack,
          raw: err
        };
      }
      
      setStatus(results);
      setLoading(false);
    }
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 p-10 font-mono">
      <h1 className="text-2xl mb-6 border-b border-green-900 pb-2">Supabase Connectivity Debugger</h1>
      
      {loading ? (
        <div className="animate-pulse">Running diagnostics...</div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg text-white mb-2 underline">1. Environment Variables</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-zinc-800">
              {JSON.stringify(status.env, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-lg text-white mb-2 underline">2. Connection Status</h2>
            <div className={`text-xl font-bold ${status.connection === 'SUCCESS' ? 'text-green-400' : 'text-red-500'}`}>
              {status.connection}
            </div>
          </section>

          <section>
            <h2 className="text-lg text-white mb-2 underline">3. Error Details</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-auto max-w-full">
              {status.error ? JSON.stringify(status.error, null, 2) : "No errors reported."}
            </pre>
          </section>

          <section className="text-zinc-500 text-sm italic">
            Tip: If variables are MISSING, ensure you have restarted your `npm run dev` process.
          </section>
        </div>
      )}
    </div>
  );
}
