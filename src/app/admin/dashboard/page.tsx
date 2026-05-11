"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  LogOut, 
  TrendingUp,
  Download,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCcw,
  FileText,
  Save,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronRight,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Phone
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AssessmentResult, Question, DiscProfile } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { seedDatabase } from "@/actions/seed";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profiles, setProfiles] = useState<DiscProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discFilter, setDiscFilter] = useState("");

  // Detail Drawer State
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [resultAnswers, setResultAnswers] = useState<any[]>([]);

  // Question Editing State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resResults, resQuestions, resProfiles] = await Promise.all([
        supabase.from('assessments').select('*').order('created_at', { ascending: false }),
        supabase.from('questions').select('*').order('id', { ascending: true }),
        supabase.from('disc_profiles').select('*').order('letter', { ascending: true })
      ]);

      if (resResults.error) throw resResults.error;
      if (resQuestions.error) throw resQuestions.error;
      if (resProfiles.error) throw resProfiles.error;

      setResults(resResults.data || []);
      setQuestions(resQuestions.data || []);
      
      const mappedProfiles = (resProfiles.data || []).map((p: any) => ({
        letter: p.letter,
        name: p.name,
        nickname: p.nickname,
        color: p.color,
        dimColor: p.dim_color,
        edge: p.edge,
        pattern: p.pattern,
        watch: p.watch,
        prescription: p.prescription
      })) as DiscProfile[];
      
      // Explicitly sort as D -> I -> S -> C
      const discOrder = ['D', 'I', 'S', 'C'];
      const sortedProfiles = mappedProfiles.sort((a, b) => 
        discOrder.indexOf(a.letter) - discOrder.indexOf(b.letter)
      );
      
      setProfiles(sortedProfiles);

      if (resQuestions.data?.length === 0) {
        setError("Database is empty. Please use the 'Seed Data' button to initialize content.");
      }

    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = localStorage.getItem("tbt_admin_session");
    if (!session) {
      router.push("/admin");
    } else {
      fetchData();
      
      // Setup realtime subscription
      const channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assessments' },
          () => {
            console.log('Database change detected, refreshing...');
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [router, fetchData]);

  const fetchDetail = async (result: AssessmentResult) => {
    setSelectedResult(result);
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('assessment_id', result.id)
      .order('question_id', { ascending: true });
    
    if (!error && data) {
      setResultAnswers(data);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    const res = await seedDatabase();
    if (res.success) {
      fetchData();
    } else {
      setError("Seeding failed: " + res.error);
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    const section = (document.getElementById('new-q-section') as HTMLInputElement).value;
    const tag = (document.getElementById('new-q-tag') as HTMLInputElement).value;
    const text = (document.getElementById('new-q-text') as HTMLTextAreaElement).value;
    const instruction = (document.getElementById('new-q-instruction') as HTMLInputElement).value;
    const optA = (document.getElementById('new-q-a') as HTMLInputElement).value;
    const optB = (document.getElementById('new-q-b') as HTMLInputElement).value;
    const optC = (document.getElementById('new-q-c') as HTMLInputElement).value;
    const optD = (document.getElementById('new-q-d') as HTMLInputElement).value;

    if (!text || !optA || !optB || !optC || !optD) return alert("Please fill the question text and all 4 options.");

    setSaving(true);
    try {
      const { error } = await supabase.from('questions').insert([{
        section: parseInt(section),
        tag,
        text,
        instruction,
        options: { A: optA, B: optB, C: optC, D: optD }
      }]);
      if (error) throw error;
      ['new-q-tag', 'new-q-text', 'new-q-instruction', 'new-q-a', 'new-q-b', 'new-q-c', 'new-q-d'].forEach(id => {
        (document.getElementById(id) as any).value = "";
      });
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleUpdateQuestion = async (q: Question) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('questions').update({
        section: q.section, tag: q.tag, text: q.text, instruction: q.instruction, options: q.options
      }).eq('id', q.id);
      if (error) throw error;
      setQuestions(questions.map(item => item.id === q.id ? q : item));
      setEditingQuestion(null);
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const filteredResults = results.filter(r => {
    if (!r) return false;
    const name = (r.full_name || '').toLowerCase();
    const city = (r.city || '').toLowerCase();
    const business = (r.business || '').toLowerCase();
    const mobile = (r.mobile_number || '');
    const search = (searchQuery || '').toLowerCase();

    const matchesSearch = name.includes(search) || 
                          city.includes(search) ||
                          business.includes(search) ||
                          mobile.includes(search);
    const matchesDisc = discFilter === "" || r.dominant_type === discFilter;
    return matchesSearch && matchesDisc;
  });

  const handleExportCSV = () => {
    if (filteredResults.length === 0) return alert("No data to export.");
    const headers = ["#", "Full Name", "Mobile", "City", "Business", "Dominant Type", "Score D", "Score I", "Score S", "Score C", "Date"];
    const rows = filteredResults.map((r, i) => [
      filteredResults.length - i,
      `"${r.full_name}"`,
      `"${r.mobile_number || ''}"`,
      `"${r.city || ''}"`,
      `"${r.business || ''}"`,
      r.dominant_type,
      r.score_d,
      r.score_i,
      r.score_s,
      r.score_c,
      new Date(r.created_at!).toLocaleDateString('en-GB')
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TBT_DISC_Responses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateProfile = async (p: DiscProfile) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('disc_profiles').update({
        name: p.name, nickname: p.nickname, color: p.color, dim_color: p.dimColor,
        edge: p.edge, pattern: p.pattern, watch: p.watch, prescription: p.prescription
      }).eq('letter', p.letter);
      if (error) throw error;
      setProfiles(profiles.map(item => item.letter === p.letter ? p : item));
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const stats = [
    { label: "Active Respondents", value: results.length, trend: "+12%" },
    { label: "Completion Rate", value: "94%", trend: "Optimal" },
    { label: "Avg. Dominance", value: (results.reduce((acc, r) => acc + r.score_d, 0) / (results.length || 1)).toFixed(1), trend: "-0.5%" },
    { label: "Latest Submission", value: results[0] ? new Date(results[0].created_at!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "—", trend: "Live" },
  ];

  return (
    <div className="min-h-screen bg-bg flex font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-surface fixed h-screen z-20">
        <div className="p-6 border-b border-border flex items-center justify-center">
          <div className="relative w-40 h-16">
            <Image 
              src="/logo.png" 
              alt="TBT Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-txt3 uppercase tracking-[0.12em] px-3 mb-3 mt-2">Overview</div>
          <button onClick={() => setActiveTab("dashboard")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all", activeTab === "dashboard" ? "bg-tbt-red-dim text-tbt-red font-bold shadow-sm" : "text-txt2 hover:bg-card hover:text-txt")}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          
          <div className="text-[10px] font-bold text-txt3 uppercase tracking-[0.12em] px-3 mb-3 mt-8">Assessments</div>
          <button onClick={() => setActiveTab("responses")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative", activeTab === "responses" ? "bg-tbt-red-dim text-tbt-red font-bold" : "text-txt2 hover:bg-card hover:text-txt")}>
            <Users className="w-4 h-4" /> All Responses
            <span className="absolute right-3 bg-tbt-red text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{results.length}</span>
          </button>
          <button onClick={() => setActiveTab("questions")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all", activeTab === "questions" ? "bg-tbt-red-dim text-tbt-red font-bold" : "text-txt2 hover:bg-card hover:text-txt")}>
            <HelpCircle className="w-4 h-4" /> Questions
          </button>
          
          <div className="text-[10px] font-bold text-txt3 uppercase tracking-[0.12em] px-3 mb-3 mt-8">System</div>
          <button onClick={() => setActiveTab("profiles")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all", activeTab === "profiles" ? "bg-tbt-red-dim text-tbt-red font-bold" : "text-txt2 hover:bg-card hover:text-txt")}>
            <FileText className="w-4 h-4" /> DISC Configuration
          </button>
        </div>

        <div className="p-4 border-t border-border">
          <button onClick={() => { localStorage.removeItem("tbt_admin_session"); router.push("/admin"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-txt3 hover:text-tbt-red transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 min-h-screen flex flex-col">
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-txt uppercase tracking-widest">{activeTab}</h2>
            <div className="w-1 h-1 rounded-full bg-border2 mx-1" />
            <span className="text-[11px] text-txt3 font-semibold uppercase tracking-wider">Live Environment</span>
          </div>
          <div className="flex items-center gap-4">
            {loading && <Loader2 className="w-4 h-4 text-tbt-red animate-spin" />}
            <button onClick={fetchData} className="p-2 text-txt3 hover:text-tbt-red transition-colors"><RefreshCcw className="w-4 h-4" /></button>
            <button onClick={() => router.push("/")} className="text-xs text-txt3 hover:text-tbt-red transition-colors font-bold border border-border px-3 py-1.5 rounded-lg uppercase tracking-wider">← Frontend</button>
          </div>
        </header>

        <main className="p-8 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Header Actions */}
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="font-serif text-3xl font-black text-txt">At a Glance</h1>
                    <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold">Real-time performance metrics</p>
                  </div>
                  <button onClick={() => setActiveTab("responses")} className="px-4 py-2 border border-border rounded-lg text-[11px] font-black text-txt2 hover:bg-card hover:text-txt transition-all uppercase tracking-widest flex items-center gap-2">View Full List <ChevronRight className="w-3 h-3" /></button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                      <div className="text-[10px] font-black text-txt3 uppercase tracking-[0.15em] mb-4">{stat.label}</div>
                      <div className="flex items-end justify-between">
                        <div className="font-serif text-3xl font-black text-txt">{stat.value}</div>
                        <div className="text-[10px] font-bold text-tbt-red bg-tbt-red-dim px-2 py-1 rounded-md mb-1">{stat.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DISC Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {["D", "I", "S", "C"].map((type) => {
                    const count = results.filter(r => r.dominant_type === type).length;
                    const pct = results.length > 0 ? Math.round((count / results.length) * 100) : 0;
                    const p = profiles.find(item => item.letter === type);
                    if (!p) return null;
                    return (
                      <div key={type} className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: p.color }} />
                        <div className="font-serif text-4xl font-black mb-1" style={{ color: p.color }}>{type}</div>
                        <div className="text-[10px] text-txt3 uppercase font-black tracking-widest mb-5">{p.name}s</div>
                        <div className="font-serif text-3xl font-bold text-txt mb-4">{count}</div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                        </div>
                        <div className="text-[10px] text-txt3 mt-2.5 font-black uppercase tracking-widest">{pct}% Share</div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Submissions Table */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-txt3 uppercase tracking-[0.2em]">Recent Activity</h3>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface/50 border-b border-border">
                          <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">Respondent</th>
                          <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest text-center">Type</th>
                          <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">D · I · S · C</th>
                          <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 8).map((r, i) => (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-card2/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white", 
                                  r.dominant_type === 'D' ? 'bg-tbt-red' : 
                                  r.dominant_type === 'I' ? 'bg-gold' : 
                                  r.dominant_type === 'S' ? 'bg-green-primary' : 'bg-blue-primary')}>
                                  {r.full_name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-txt">{r.full_name}</div>
                                  <div className="text-[10px] text-txt3 uppercase tracking-widest font-medium">{r.mobile_number || "No Mobile"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-md border border-border bg-surface text-txt">
                                {r.dominant_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1.5 items-center">
                                <span className="text-[10px] font-bold text-tbt-red">{r.score_d}</span>
                                <div className="w-px h-2 bg-border" />
                                <span className="text-[10px] font-bold text-gold">{r.score_i}</span>
                                <div className="w-px h-2 bg-border" />
                                <span className="text-[10px] font-bold text-green-primary">{r.score_s}</span>
                                <div className="w-px h-2 bg-border" />
                                <span className="text-[10px] font-bold text-blue-primary">{r.score_c}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[11px] text-txt3 font-bold uppercase tracking-tighter">{new Date(r.created_at!).toLocaleDateString('en-GB')}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => fetchDetail(r)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red transition-all"><Eye className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "responses" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-serif text-3xl font-black text-txt">All Responses</h1>
                    <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold">Comprehensive data repository</p>
                  </div>
                  <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-tbt-red text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-tbt-red-hover shadow-lg shadow-tbt-red/10 transition-all"><Download className="w-4 h-4" /> Export CSV</button>
                </div>

                <div className="flex flex-wrap gap-4 items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-txt3" />
                    <input type="text" placeholder="Search by name, city, business, or mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-11 bg-surface border border-border rounded-xl pl-12 pr-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-txt3" />
                    <select value={discFilter} onChange={(e) => setDiscFilter(e.target.value)} className="h-11 bg-surface border border-border rounded-xl px-5 text-sm text-txt outline-none focus:border-tbt-red cursor-pointer min-w-[160px] font-bold">
                      <option value="">All Types</option>
                      <option value="D">D — Dominant</option>
                      <option value="I">I — Influential</option>
                      <option value="S">S — Steady</option>
                      <option value="C">C — Conscientious</option>
                    </select>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface/50 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">#</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">Respondent</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">Mobile</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">City</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest text-center">Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest text-center">D</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest text-center">I</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest text-center">S</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest text-center">C</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt3 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((r, i) => (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-card2/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-txt3">{filteredResults.length - i}</td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-bold text-txt">{r.full_name}</div>
                              <div className="text-[10px] text-txt3 uppercase tracking-widest">{r.business || "—"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-txt2">{r.mobile_number || "—"}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-txt2">{r.city || "—"}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn("font-serif font-black text-sm", 
                              r.dominant_type === 'D' ? 'text-tbt-red' : 
                              r.dominant_type === 'I' ? 'text-gold' : 
                              r.dominant_type === 'S' ? 'text-green-primary' : 'text-blue-primary')}>
                              {r.dominant_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-xs font-bold text-txt2">{r.score_d}</td>
                          <td className="px-6 py-4 text-center text-xs font-bold text-txt2">{r.score_i}</td>
                          <td className="px-6 py-4 text-center text-xs font-bold text-txt2">{r.score_s}</td>
                          <td className="px-6 py-4 text-center text-xs font-bold text-txt2">{r.score_c}</td>
                          <td className="px-6 py-4 text-[11px] text-txt3 font-bold uppercase">{new Date(r.created_at!).toLocaleDateString('en-GB')}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button onClick={() => fetchDetail(r)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red transition-all"><Eye className="w-4 h-4" /></button>
                            <button onClick={async () => { if(confirm("Delete?")){ await supabase.from('assessments').delete().eq('id', r.id); fetchData(); } }} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-red-primary transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-serif text-3xl font-black text-txt">Questionnaire</h1>
                    <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold">Dynamic assessment engine control</p>
                  </div>
                </div>

                {/* CREATE NEW QUESTION FORM */}
                <div className="bg-card border border-tbt-red-border/30 rounded-2xl overflow-hidden shadow-xl shadow-tbt-red/5">
                  <div className="p-5 bg-tbt-red-dim border-b border-tbt-red-border/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tbt-red flex items-center justify-center text-white shadow-lg shadow-tbt-red/20"><Plus className="w-4 h-4" /></div>
                    <span className="text-xs font-black text-tbt-red uppercase tracking-[0.2em]">Add Assessment Scenario</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block mb-2">Section Mapping</label>
                        <select id="new-q-section" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red appearance-none cursor-pointer">
                          <option value="1">Section 1 — Reactions</option>
                          <option value="2">Section 2 — People</option>
                          <option value="3">Section 3 — Business</option>
                          <option value="4">Section 4 — Vision</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block mb-2">Category Tag</label>
                        <input id="new-q-tag" type="text" placeholder="e.g. MONEY & RISK" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block mb-2">Scenario Text / Question</label>
                      <textarea id="new-q-text" rows={2} placeholder="Describe the situation..." className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt outline-none focus:border-tbt-red transition-all resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block mb-2">User Guidance / Instruction</label>
                      <input id="new-q-instruction" type="text" placeholder="e.g. Don't overthink - pick what feels natural." className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {[
                        { l: 'A', name: 'Dominant', color: 'text-tbt-red', border: 'focus:border-tbt-red/40' },
                        { l: 'B', name: 'Influential', color: 'text-gold', border: 'focus:border-gold/40' },
                        { l: 'C', name: 'Steady', color: 'text-green-primary', border: 'focus:border-green-primary/40' },
                        { l: 'D', name: 'Conscientious', color: 'text-blue-primary', border: 'focus:border-blue-primary/40' }
                      ].map(item => (
                        <div key={item.l} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={cn("text-[10px] uppercase font-black tracking-widest", item.color)}>Option {item.l} — {item.name}</label>
                          </div>
                          <input id={`new-q-${item.l.toLowerCase()}`} type="text" placeholder={`Scenario for ${item.name} type...`} className={cn("w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none transition-all", item.border)} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-4">
                      <button onClick={handleCreateQuestion} disabled={saving} className="px-10 py-4 bg-tbt-red text-white text-xs font-black rounded-xl hover:bg-tbt-red-hover transition-all flex items-center gap-2 shadow-xl shadow-tbt-red/20 active:scale-95">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        PUBLISH TO QUESTIONNAIRE
                      </button>
                    </div>
                  </div>
                </div>

                {/* LIST QUESTIONS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-4 border-b border-border">
                    <FileText className="w-4 h-4 text-txt3" />
                    <span className="text-[10px] font-black text-txt3 uppercase tracking-[0.25em]">Questionnaire Registry ({questions.length} Active Items)</span>
                  </div>
                  <div className="grid gap-4">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-card border border-border rounded-2xl p-6 hover:border-border2 transition-all group">
                        {editingQuestion?.id === q.id ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                              <input type="number" value={editingQuestion.section} onChange={e => setEditingQuestion({...editingQuestion, section: parseInt(e.target.value)})} className="h-10 bg-surface border border-border rounded-xl px-3 text-sm text-txt outline-none focus:border-tbt-red" />
                              <input type="text" value={editingQuestion.tag} onChange={e => setEditingQuestion({...editingQuestion, tag: e.target.value})} className="col-span-2 h-10 bg-surface border border-border rounded-xl px-3 text-sm text-txt outline-none focus:border-tbt-red" />
                            </div>
                            <textarea value={editingQuestion.text} onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})} className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-txt outline-none focus:border-tbt-red" rows={2} />
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(editingQuestion.options).map(([l, t]) => (
                                <div key={l} className="space-y-1">
                                  <span className="text-[9px] font-black text-txt3 uppercase">{l} Scoring</span>
                                  <input type="text" value={t} onChange={e => setEditingQuestion({...editingQuestion, options: {...editingQuestion.options, [l]: e.target.value}})} className="w-full h-10 bg-surface border border-border rounded-xl px-3 text-sm text-txt outline-none focus:border-tbt-red" />
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end gap-3">
                              <button onClick={() => setEditingQuestion(null)} className="p-3 text-txt3 hover:text-txt transition-all"><X className="w-5 h-5" /></button>
                              <button onClick={() => handleUpdateQuestion(editingQuestion)} className="bg-tbt-red text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-tbt-red/10 transition-all">UPDATE</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-[10px] font-black text-tbt-red shadow-sm">#{q.id}</span>
                                <span className="text-[10px] font-black text-txt3 uppercase tracking-[0.1em] px-2 py-1 bg-surface border border-border rounded-md">SEC {q.section} • {q.tag}</span>
                              </div>
                              <h4 className="font-serif text-lg font-bold text-txt mb-4 leading-snug">{q.text}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {Object.entries(q.options).map(([l, t]) => (
                                  <div key={l} className="flex gap-2.5 text-xs">
                                    <span className={cn("font-black shrink-0", 
                                      l === 'A' ? 'text-tbt-red' : l === 'B' ? 'text-gold' : l === 'C' ? 'text-green-primary' : 'text-blue-primary')}>{l}:</span>
                                    <span className="text-txt3 leading-relaxed line-clamp-1">{t}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingQuestion(q)} className="p-2.5 bg-surface border border-border rounded-xl text-txt3 hover:text-tbt-red hover:border-tbt-red transition-all"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteQuestion(q.id)} className="p-2.5 bg-surface border border-border rounded-xl text-txt3 hover:text-red-primary hover:border-red-primary transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profiles Tab */}
            {activeTab === "profiles" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-serif text-3xl font-black text-txt">Evaluation Core</h1>
                    <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold">DISC Profile Logic & Interpretations</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {profiles.map((p) => (
                    <div key={p.letter} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-6 bg-surface/50 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-black shadow-lg text-white", 
                            p.letter === 'D' ? 'bg-tbt-red shadow-tbt-red/10' : 
                            p.letter === 'I' ? 'bg-gold shadow-gold/10' : 
                            p.letter === 'S' ? 'bg-green-primary shadow-green-primary/10' : 'bg-blue-primary shadow-blue-primary/10')}>
                            {p.letter}
                          </div>
                          <div>
                            <h4 className="font-serif text-xl font-black text-txt tracking-tight">{p.name}</h4>
                            <p className="text-[11px] text-txt3 uppercase tracking-[0.2em] font-black mt-0.5">{p.nickname}</p>
                          </div>
                        </div>
                        <button onClick={() => handleUpdateProfile(p)} className="flex items-center gap-2 px-6 py-2.5 bg-tbt-red/10 border border-tbt-red/20 text-tbt-red rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-tbt-red/20 transition-all shadow-lg shadow-tbt-red/5">
                          <Save className="w-3 h-3" /> Update Profile
                        </button>
                      </div>
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block">Business Edge</label>
                            <textarea value={p.edge} onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, edge: e.target.value} : item))} className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt2 outline-none focus:border-tbt-red transition-all leading-relaxed" rows={3} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block">Mental Pattern</label>
                            <textarea value={p.pattern} onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, pattern: e.target.value} : item))} className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt2 outline-none focus:border-tbt-red transition-all leading-relaxed" rows={3} />
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block">Watch This / Weakness</label>
                            <textarea value={p.watch} onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, watch: e.target.value} : item))} className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt2 outline-none focus:border-tbt-red transition-all leading-relaxed" rows={3} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-tbt-red uppercase font-black tracking-widest block">Zero Rupee Prescription</label>
                            <textarea value={p.prescription} onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, prescription: e.target.value} : item))} className="w-full bg-surface border border-tbt-red/20 rounded-xl p-4 text-sm text-txt2 outline-none focus:border-tbt-red transition-all leading-relaxed italic" rows={3} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      <AnimatePresence>
        {selectedResult && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedResult(null)} className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full max-w-[550px] bg-surface border-l border-border z-[101] shadow-2xl shadow-black overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-black text-white", 
                    selectedResult.dominant_type === 'D' ? 'bg-tbt-red' : 
                    selectedResult.dominant_type === 'I' ? 'bg-gold' : 
                    selectedResult.dominant_type === 'S' ? 'bg-green-primary' : 'bg-blue-primary')}>
                    {selectedResult.dominant_type}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-black text-txt">{selectedResult.full_name}</h2>
                    <p className="text-xs text-txt3 uppercase tracking-widest font-bold">Submission Report • {selectedResult.id?.slice(0,8)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedResult(null)} className="p-3 text-txt3 hover:text-txt transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-txt2 text-sm"><Phone className="w-4 h-4 text-tbt-red" /> {selectedResult.mobile_number || "No Mobile"}</div>
                    <div className="flex items-center gap-3 text-txt2 text-sm"><MapPin className="w-4 h-4 text-tbt-red" /> {selectedResult.city || "Unknown City"}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-txt2 text-sm"><Calendar className="w-4 h-4 text-tbt-red" /> {new Date(selectedResult.created_at!).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    <div className="flex items-center gap-3 text-txt2 text-sm"><Briefcase className="w-4 h-4 text-tbt-red" /> {selectedResult.business || "Business Owner"}</div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-txt3 uppercase tracking-[0.2em] border-b border-border pb-3">Score Breakdown</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-card p-4 rounded-xl border border-border"><div className="text-2xl font-black text-tbt-red">{selectedResult.score_d}</div><div className="text-[9px] font-bold text-txt3 mt-1 uppercase">Dominant</div></div>
                    <div className="bg-card p-4 rounded-xl border border-border"><div className="text-2xl font-black text-gold">{selectedResult.score_i}</div><div className="text-[9px] font-bold text-txt3 mt-1 uppercase">Influential</div></div>
                    <div className="bg-card p-4 rounded-xl border border-border"><div className="text-2xl font-black text-green-primary">{selectedResult.score_s}</div><div className="text-[9px] font-bold text-txt3 mt-1 uppercase">Steady</div></div>
                    <div className="bg-card p-4 rounded-xl border border-border"><div className="text-2xl font-black text-blue-primary">{selectedResult.score_c}</div><div className="text-[9px] font-bold text-txt3 mt-1 uppercase">Conscientious</div></div>
                  </div>
                </div>

                {/* Response Log */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-txt3 uppercase tracking-[0.2em] border-b border-border pb-3">Response Log</h4>
                  <div className="space-y-6">
                    {resultAnswers.map((ans, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-tbt-red border border-tbt-red/30 px-1.5 py-0.5 rounded">Q{ans.question_id}</span>
                          <span className={cn("text-[10px] font-black uppercase", 
                            ans.answer_letter === 'A' ? 'text-tbt-red' : 
                            ans.answer_letter === 'B' ? 'text-gold' : 
                            ans.answer_letter === 'C' ? 'text-green-primary' : 'text-blue-primary')}>
                            Response: Option {ans.answer_letter}
                          </span>
                        </div>
                        {ans.reflection && (
                          <div className="bg-card p-4 rounded-xl border border-border italic text-xs text-txt2 leading-relaxed">
                            "{ans.reflection}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
