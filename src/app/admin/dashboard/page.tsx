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
  Copy,
  X,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  Layers,
  ListTree
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  AssessmentResult, 
  Question, 
  DiscProfile, 
  AssessmentCategory, 
  QuestionSet, 
  QuestionSetMapping 
} from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { seedDatabase, seedEntrepreneurSet, seedEmployeeSet } from "@/actions/seed";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profiles, setProfiles] = useState<DiscProfile[]>([]);
  
  // New Question Sets State
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [activeSetTab, setActiveSetTab] = useState<"categories" | "sets" | "mapping">("categories");
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [questionStatusFilter, setQuestionStatusFilter] = useState<'active' | 'inactive'>('active');
  const [setMappings, setSetMappings] = useState<QuestionSetMapping[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discFilter, setDiscFilter] = useState("");

  // Detail Drawer State
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [resultAnswers, setResultAnswers] = useState<any[]>([]);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<AssessmentResult | null>(null);

  // Question Editing State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCategory, setEditingCategory] = useState<AssessmentCategory | null>(null);
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [selectedCategoryForRegistry, setSelectedCategoryForRegistry] = useState<AssessmentCategory | null>(null);
  const [registryPoolQuestionIds, setRegistryPoolQuestionIds] = useState<number[]>([]);

  const fetchRegistryPool = useCallback(async (catId: string) => {
    setLoading(true);
    try {
      const { data: setRes } = await supabase
        .from('question_sets')
        .select('id')
        .eq('category_id', catId)
        .ilike('title', '%Master%')
        .limit(1)
        .single();
      
      if (setRes) {
        const { data: mapRes } = await supabase
          .from('question_set_questions')
          .select('question_id')
          .eq('question_set_id', setRes.id)
          .order('display_order', { ascending: true });
        
        if (mapRes) {
          setRegistryPoolQuestionIds(mapRes.map(m => m.question_id));
        }
      } else {
        setRegistryPoolQuestionIds([]);
      }
    } catch (err) {
      setRegistryPoolQuestionIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resResults, resQuestions, resProfiles, resCategories, resSets] = await Promise.all([
        supabase.from('assessments').select('*').order('created_at', { ascending: false }),
        supabase.from('questions').select('*').order('id', { ascending: true }),
        supabase.from('disc_profiles').select('*').order('letter', { ascending: true }),
        supabase.from('assessment_categories').select('*').order('name', { ascending: true }),
        supabase.from('question_sets').select('*').order('created_at', { ascending: false })
      ]);

      if (resResults.error) throw resResults.error;
      if (resQuestions.error) throw resQuestions.error;
      if (resProfiles.error) throw resProfiles.error;
      if (resCategories.error) throw resCategories.error;
      if (resSets.error) throw resSets.error;

      setResults(resResults.data || []);
      setQuestions(resQuestions.data || []);
      setCategories(resCategories.data || []);
      setSets(resSets.data || []);
      
      const mappedProfiles = (resProfiles.data || []).map((p: any) => ({
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
    setResultAnswers([]);
    setFetchingDetail(true);
    
    try {
      // Fetch only answers; join with questions is removed as FK relationship is missing in DB
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('assessment_id', result.id)
        .order('question_id', { ascending: true });
      
      if (error) throw error;
      if (data) setResultAnswers(data);
    } catch (err) {
      console.error("Error fetching answers:", err);
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleSeed = async (forceUpdate = false) => {
    setLoading(true);
    const res = await seedDatabase(forceUpdate);
    if (res.success) {
      fetchData();
    } else {
      setError("Seeding failed: " + res.error);
      setLoading(false);
    }
  };

  const handleSeedEntrepreneur = async () => {
    setLoading(true);
    const res = await seedEntrepreneurSet();
    if (res.success) {
      fetchData();
    } else {
      alert("Seeding failed: " + res.error);
      setLoading(false);
    }
  };

  const handleSeedEmployee = async () => {
    setLoading(true);
    const res = await seedEmployeeSet();
    if (res.success) {
      fetchData();
    } else {
      alert("Seeding failed: " + res.error);
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    const section = (document.getElementById('new-q-section') as HTMLInputElement).value;
    const tag = (document.getElementById('new-q-tag') as HTMLInputElement).value;
    const text = (document.getElementById('new-q-text') as HTMLTextAreaElement).value;
    const instruction = (document.getElementById('new-q-instruction') as HTMLInputElement).value;
    
    const optA = (document.getElementById('new-q-a') as HTMLInputElement).value;
    const discA = (document.getElementById('new-q-a-disc') as HTMLSelectElement).value;
    
    const optB = (document.getElementById('new-q-b') as HTMLInputElement).value;
    const discB = (document.getElementById('new-q-b-disc') as HTMLSelectElement).value;
    
    const optC = (document.getElementById('new-q-c') as HTMLInputElement).value;
    const discC = (document.getElementById('new-q-c-disc') as HTMLSelectElement).value;
    
    const optD = (document.getElementById('new-q-d') as HTMLInputElement).value;
    const discD = (document.getElementById('new-q-d-disc') as HTMLSelectElement).value;
    const status = (document.getElementById('new-q-status') as HTMLInputElement).checked ? 'active' : 'inactive';

    if (!text || !optA || !optB || !optC || !optD) return alert("Please fill the question text and all 4 options.");

    setSaving(true);
    try {
      const { data: newQ, error } = await supabase.from('questions').insert([{
        section: parseInt(section),
        tag,
        text,
        instruction,
        status,
        options: { 
          A: { text: optA, disc: discA }, 
          B: { text: optB, disc: discB }, 
          C: { text: optC, disc: discC }, 
          D: { text: optD, disc: discD } 
        }
      }]).select().single();
      
      if (error) throw error;

      // Automatically map to the category's master pool if a category is selected
      if (selectedCategoryForRegistry && newQ) {
        // 1. Find or Create the "Master Set" for this category
        let { data: masterSet } = await supabase
          .from('question_sets')
          .select('id')
          .eq('category_id', selectedCategoryForRegistry.id)
          .ilike('title', '%Master%')
          .limit(1)
          .single();
        
        if (!masterSet) {
          // Auto-create a master set if it doesn't exist for this new category
          const { data: newSet, error: setErr } = await supabase
            .from('question_sets')
            .insert([{
              category_id: selectedCategoryForRegistry.id,
              title: `${selectedCategoryForRegistry.name} Master Set`,
              description: `Primary assessment flow for ${selectedCategoryForRegistry.name}`,
              status: 'active',
              version: '1.0'
            }])
            .select()
            .single();
          
          if (!setErr) masterSet = newSet;
        }
        
        if (masterSet) {
          // 2. Map the question to the pool
          const { data: mappings } = await supabase
            .from('question_set_questions')
            .select('display_order')
            .eq('question_set_id', masterSet.id)
            .order('display_order', { ascending: false })
            .limit(1);
          
          const nextOrder = mappings && mappings.length > 0 ? mappings[0].display_order + 1 : 1;

          await supabase.from('question_set_questions').insert({
            question_set_id: masterSet.id,
            question_id: newQ.id,
            display_order: nextOrder
          });
        }
      }

      ['new-q-tag', 'new-q-text', 'new-q-instruction', 'new-q-a', 'new-q-b', 'new-q-c', 'new-q-d'].forEach(id => {
        (document.getElementById(id) as any).value = "";
      });
      await fetchData();
      if (selectedCategoryForRegistry) {
        await fetchRegistryPool(selectedCategoryForRegistry.id);
      }
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleUpdateQuestion = async (q: Question) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('questions').update({
        section: q.section, 
        tag: q.tag, 
        text: q.text, 
        instruction: q.instruction, 
        status: q.status,
        options: q.options
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
      
      // Update local state immediately for instant re-numbering shift
      setQuestions(prev => prev.filter(q => q.id !== id));
      setRegistryPoolQuestionIds(prev => prev.filter(qId => qId !== id));
      
      if (selectedCategoryForRegistry) {
        await fetchRegistryPool(selectedCategoryForRegistry.id);
      }
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
        name: p.name, 
        nickname: p.nickname, 
        color: p.color, 
        dim_color: p.dimColor,
        edge: p.edge, 
        pattern: p.pattern, 
        watch: p.watch, 
        prescription: p.prescription,
        traits: p.traits
      }).eq('letter', p.letter);
      if (error) throw error;
      setProfiles(profiles.map(item => item.letter === p.letter ? p : item));
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleUpdateCategory = async (c: AssessmentCategory) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('assessment_categories').update({
        name: c.name, slug: c.slug, description: c.description, status: c.status
      }).eq('id', c.id);
      if (error) throw error;
      setEditingCategory(null);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleUpdateSet = async (s: QuestionSet) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('question_sets').update({
        title: s.title, description: s.description, target_audience: s.target_audience, version: s.version, category_id: s.category_id, status: s.status, show_tags: s.show_tags
      }).eq('id', s.id);
      if (error) throw error;
      setEditingSet(null);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleCreateCategory = async () => {
    const name = (document.getElementById('cat-name') as HTMLInputElement).value;
    const slug = (document.getElementById('cat-slug') as HTMLInputElement).value;
    const desc = (document.getElementById('cat-desc') as HTMLTextAreaElement).value;

    if (!name || !slug) return alert("Name and Slug are required.");

    setSaving(true);
    try {
      const { error } = await supabase.from('assessment_categories').insert([{ name, slug, description: desc, status: 'active' }]);
      if (error) throw error;
      (document.getElementById('cat-name') as any).value = "";
      (document.getElementById('cat-slug') as any).value = "";
      (document.getElementById('cat-desc') as any).value = "";
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleCreateSet = async () => {
    const title = (document.getElementById('set-title') as HTMLInputElement).value;
    const catId = (document.getElementById('set-cat-id') as HTMLSelectElement).value;
    const target = (document.getElementById('set-target') as HTMLInputElement).value;
    const desc = (document.getElementById('set-desc') as HTMLTextAreaElement).value;
    const showTags = (document.getElementById('set-show-tags') as HTMLInputElement).checked;
    const status = (document.getElementById('set-status') as HTMLInputElement).checked ? 'active' : 'inactive';

    if (!title || !catId) return alert("Title and Category are required.");

    setSaving(true);
    try {
      const { error } = await supabase.from('question_sets').insert([{ 
        title, category_id: catId, target_audience: target, description: desc, status, version: '1.0', show_tags: showTags
      }]);
      if (error) throw error;
      (document.getElementById('set-title') as any).value = "";
      (document.getElementById('set-target') as any).value = "";
      (document.getElementById('set-desc') as any).value = "";
      (document.getElementById('set-show-tags') as HTMLInputElement).checked = true;
      (document.getElementById('set-status') as HTMLInputElement).checked = true;
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const fetchMappings = async (setId: string) => {
    const s = sets.find(x => x.id === setId);
    if (!s) return;
    setSelectedSet(s);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_set_questions')
        .select('*')
        .eq('question_set_id', setId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setSetMappings(data || []);
      setActiveSetTab("mapping");
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleAddQuestionToSet = async (qId: number) => {
    if (!selectedSet) return;
    const nextOrder = setMappings.length > 0 ? Math.max(...setMappings.map(m => m.display_order)) + 1 : 1;
    try {
      const { error } = await supabase.from('question_set_questions').insert({
        question_set_id: selectedSet.id,
        question_id: qId,
        display_order: nextOrder
      });
      if (error) throw error;
      fetchMappings(selectedSet.id);
    } catch (err: any) { alert(err.message); }
  };

  const handleRemoveQuestionFromSet = async (mId: string) => {
    if (!selectedSet) return;
    try {
      const { error } = await supabase.from('question_set_questions').delete().eq('id', mId);
      if (error) throw error;
      fetchMappings(selectedSet.id);
    } catch (err: any) { alert(err.message); }
  };

  const handleMoveMapping = async (m: QuestionSetMapping, direction: 'up' | 'down') => {
    const idx = setMappings.findIndex(x => x.id === m.id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    if (targetIdx < 0 || targetIdx >= setMappings.length) return;
    
    const target = setMappings[targetIdx];
    const currentOrder = m.display_order;
    const targetOrder = target.display_order;

    setLoading(true);
    try {
      const { error: err1 } = await supabase
        .from('question_set_questions')
        .update({ display_order: targetOrder })
        .eq('id', m.id);
      
      const { error: err2 } = await supabase
        .from('question_set_questions')
        .update({ display_order: currentOrder })
        .eq('id', target.id);

      if (err1 || err2) throw err1 || err2;
      
      if (selectedSet) fetchMappings(selectedSet.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateSet = async (s: QuestionSet) => {
    if (!confirm(`Duplicate "${s.title}"?`)) return;
    setLoading(true);
    try {
      const { data: newSet, error: setError } = await supabase
        .from('question_sets')
        .insert([{
          category_id: s.category_id,
          title: `${s.title} (Copy)`,
          description: s.description,
          target_audience: s.target_audience,
          version: s.version,
          status: 'inactive',
          show_tags: s.show_tags
        }])
        .select()
        .single();
      if (setError) throw setError;
      const { data: mappings, error: fetchError } = await supabase
        .from('question_set_questions')
        .select('question_id, display_order')
        .eq('question_set_id', s.id);
      if (fetchError) throw fetchError;
      if (mappings && mappings.length > 0) {
        const newMappings = mappings.map(m => ({
          question_set_id: newSet.id,
          question_id: m.question_id,
          display_order: m.display_order
        }));
        const { error: mapError } = await supabase.from('question_set_questions').insert(newMappings);
        if (mapError) throw mapError;
      }
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleDeleteResult = async () => {
    if (!resultToDelete) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('assessments').delete().eq('id', resultToDelete.id);
      if (error) throw error;
      setResultToDelete(null);
      await fetchData();
    } catch (err: any) {
      alert("Deletion failed: " + err.message);
    } finally {
      setSaving(false);
    }
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
          <button onClick={() => setActiveTab("question_sets")} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative", activeTab === "question_sets" ? "bg-tbt-red-dim text-tbt-red font-bold" : "text-txt2 hover:bg-card hover:text-txt")}>
            <Layers className="w-4 h-4" /> Question Sets
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
                        {results.slice(0, 8).map((r, i) => {
                          const cat = categories.find(c => c.id === r.category_id);
                          return (
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
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-tbt-red font-black uppercase tracking-widest">{cat?.name || "Universal"}</span>
                                      <span className="text-[9px] text-txt3 font-bold opacity-30">•</span>
                                      <span className="text-[9px] text-txt3 uppercase tracking-widest font-medium">{r.mobile_number || "No Mobile"}</span>
                                    </div>
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
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              <button onClick={() => fetchDetail(r)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red transition-all" title="View Detail"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => setResultToDelete(r)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-red-primary transition-all" title="Delete Response"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        );
                      })}
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
                      {filteredResults.map((r, i) => {
                        const cat = categories.find(c => c.id === r.category_id);
                        return (
                          <tr key={r.id} className="border-b border-border last:border-0 hover:bg-card2/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-txt3">{filteredResults.length - i}</td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-bold text-txt">{r.full_name}</div>
                                <div className="text-[10px] text-tbt-red uppercase font-black tracking-widest mt-0.5">{cat?.name || "Universal"}</div>
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
                            <button onClick={() => fetchDetail(r)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red transition-all" title="View Detail"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => setResultToDelete(r)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-red-primary transition-all" title="Delete Response"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {!selectedCategoryForRegistry ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="font-serif text-3xl font-black text-txt">Scenario Registry</h1>
                        <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold">Choose a category to manage assessment questions</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((cat, idx) => (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group relative bg-card border border-border rounded-[2rem] p-8 text-left hover:border-tbt-red/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-tbt-red/5 overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-tbt-red scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                          
                          {/* Status Toggle on Top */}
                          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                             <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border", (cat.status || 'active') === 'active' ? "bg-green-primary/5 text-green-primary border-green-primary/20" : "bg-txt3/5 text-txt3 border-border")}>{(cat.status || 'active')}</span>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const newStatus = (cat.status || 'active') === 'active' ? 'inactive' : 'active';
                                 handleUpdateCategory({...cat, status: newStatus});
                               }}
                               className={cn(
                                 "p-2 rounded-lg bg-surface border border-border transition-all shadow-sm",
                                 (cat.status || 'active') === 'active' ? "text-txt3 hover:text-red-primary" : "text-txt3 hover:text-green-primary"
                               )}
                               title={(cat.status || 'active') === 'active' ? "Deactivate Category" : "Activate Category"}
                             >
                               <Layers className="w-3.5 h-3.5" />
                             </button>
                          </div>

                          <div 
                            onClick={() => {
                              setSelectedCategoryForRegistry(cat);
                              fetchRegistryPool(cat.id);
                            }}
                            className="flex flex-col gap-4 relative z-10 cursor-pointer"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center group-hover:bg-tbt-red/10 group-hover:border-tbt-red/20 transition-all">
                              <ListTree className="w-6 h-6 text-txt3 group-hover:text-tbt-red" />
                            </div>
                            <div>
                              <h3 className="font-serif text-2xl font-black text-txt mb-2 group-hover:text-tbt-red transition-colors">{cat.name}</h3>
                              <p className="text-xs text-txt3 line-clamp-2 leading-relaxed">{cat.description || "Manage scenarios for this specific audience."}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border group-hover:border-tbt-red/10">
                              <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Active Pool</span>
                              <ChevronRight className="w-4 h-4 text-tbt-red opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedCategoryForRegistry(null)}
                          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-txt3 hover:text-tbt-red hover:border-tbt-red transition-all"
                        >
                          <ArrowUp className="-rotate-90 w-4 h-4" />
                        </button>
                        <div>
                          <h1 className="font-serif text-3xl font-black text-txt">{selectedCategoryForRegistry.name} Pool</h1>
                          <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> Assessment scenario registry control
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CREATE NEW QUESTION FORM */}
                    <div className="bg-card border border-tbt-red-border/30 rounded-2xl overflow-hidden shadow-xl shadow-tbt-red/5">
                      <div className="p-5 bg-tbt-red-dim border-b border-tbt-red-border/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-tbt-red flex items-center justify-center text-white shadow-lg shadow-tbt-red/20"><Plus className="w-4 h-4" /></div>
                        <span className="text-xs font-black text-tbt-red uppercase tracking-[0.2em]">Add Scenario to {selectedCategoryForRegistry.name}</span>
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
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest block mb-2">Internal Tag</label>
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
                            { l: 'A', name: 'Dominant', color: 'text-tbt-red', border: 'focus:border-tbt-red/40', defaultDisc: 'D' },
                            { l: 'B', name: 'Influential', color: 'text-gold', border: 'focus:border-gold/40', defaultDisc: 'I' },
                            { l: 'C', name: 'Steady', color: 'text-green-primary', border: 'focus:border-green-primary/40', defaultDisc: 'S' },
                            { l: 'D', name: 'Conscientious', color: 'text-blue-primary', border: 'focus:border-blue-primary/40', defaultDisc: 'C' }
                          ].map(item => (
                            <div key={item.l} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className={cn("text-[10px] uppercase font-black tracking-widest", item.color)}>Option {item.l}</label>
                                <select id={`new-q-${item.l.toLowerCase()}-disc`} defaultValue={item.defaultDisc} className="text-[9px] font-black bg-surface border border-border rounded px-2 py-0.5 outline-none focus:border-tbt-red">
                                  <option value="D">D (Dominance)</option>
                                  <option value="I">I (Influence)</option>
                                  <option value="S">S (Steadiness)</option>
                                  <option value="C">C (Conscientiousness)</option>
                                </select>
                              </div>
                              <input id={`new-q-${item.l.toLowerCase()}`} type="text" placeholder={`Answer text for option ${item.l}...`} className={cn("w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none transition-all", item.border)} />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer group/toggle">
                              <input type="checkbox" id="new-q-status" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-4 peer-focus:ring-tbt-red/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tbt-red transition-all"></div>
                            </label>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Initial Status</span>
                              <span className="text-[9px] text-txt3 opacity-60 uppercase font-bold">Set as Active in Registry</span>
                            </div>
                          </div>
                          <button onClick={handleCreateQuestion} disabled={saving} className="px-10 py-4 bg-tbt-red text-white text-xs font-black rounded-xl hover:bg-tbt-red-hover transition-all flex items-center gap-2 shadow-xl shadow-tbt-red/20 active:scale-95">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            PUBLISH TO {selectedCategoryForRegistry.name.toUpperCase()} POOL
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LIST QUESTIONS */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-txt3" />
                          <span className="text-[10px] font-black text-txt3 uppercase tracking-[0.25em]">Pool Scenarios ({questions.filter(q => registryPoolQuestionIds.includes(q.id) && (q.status || 'active') === questionStatusFilter).length})</span>
                        </div>
                        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
                          <button onClick={() => setQuestionStatusFilter('active')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", questionStatusFilter === 'active' ? "bg-tbt-red text-white shadow-lg shadow-tbt-red/10" : "text-txt3 hover:text-txt")}>Active</button>
                          <button onClick={() => setQuestionStatusFilter('inactive')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", questionStatusFilter === 'inactive' ? "bg-tbt-red text-white shadow-lg shadow-tbt-red/10" : "text-txt3 hover:text-txt")}>Inactive</button>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {questions.filter(q => registryPoolQuestionIds.includes(q.id) && (q.status || 'active') === questionStatusFilter).map((q, idx) => (
                          <div key={q.id} className="bg-card border border-border rounded-2xl p-6 hover:border-border2 transition-all group">
                            {editingQuestion?.id === q.id ? (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Section</label>
                                    <input type="number" value={editingQuestion.section} onChange={e => setEditingQuestion({...editingQuestion, section: parseInt(e.target.value)})} className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red" />
                                  </div>
                                  <div className="md:col-span-2 space-y-1">
                                    <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Tag</label>
                                    <input type="text" value={editingQuestion.tag} onChange={e => setEditingQuestion({...editingQuestion, tag: e.target.value})} className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red" />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Question Text</label>
                                  <textarea value={editingQuestion.text} onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})} className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt outline-none focus:border-tbt-red" rows={2} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  {Object.entries(editingQuestion.options).map(([l, opt]) => {
                                    const text = typeof opt === 'string' ? opt : opt.text;
                                    const disc = typeof opt === 'string' ? (l === 'A' ? 'D' : l === 'B' ? 'I' : l === 'C' ? 'S' : 'C') : opt.disc;
                                    return (
                                      <div key={l} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-black text-txt3 uppercase">{l} Scoring</span>
                                          <select 
                                            value={disc} 
                                            onChange={e => setEditingQuestion({...editingQuestion, options: {...editingQuestion.options, [l]: { text, disc: e.target.value }}})} 
                                            className="text-[8px] font-black bg-surface border border-border rounded px-1 outline-none focus:border-tbt-red"
                                          >
                                            <option value="D">D</option>
                                            <option value="I">I</option>
                                            <option value="S">S</option>
                                            <option value="C">C</option>
                                          </select>
                                        </div>
                                        <input 
                                          type="text" 
                                          value={text} 
                                          onChange={e => setEditingQuestion({...editingQuestion, options: {...editingQuestion.options, [l]: { text: e.target.value, disc }}})} 
                                          className="w-full h-10 bg-surface border border-border rounded-xl px-3 text-sm text-txt outline-none focus:border-tbt-red" 
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                  <div className="flex items-center gap-3">
                                    <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                      <input type="checkbox" checked={editingQuestion.status === 'active'} onChange={e => setEditingQuestion({...editingQuestion, status: e.target.checked ? 'active' : 'inactive'})} className="sr-only peer" />
                                      <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-4 peer-focus:ring-tbt-red/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tbt-red transition-all"></div>
                                    </label>
                                    <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Question Status</span>
                                  </div>
                                  <div className="flex gap-3">
                                    <button onClick={() => setEditingQuestion(null)} className="p-3 text-txt3 hover:text-txt transition-all"><X className="w-5 h-5" /></button>
                                    <button onClick={() => handleUpdateQuestion(editingQuestion)} className="bg-tbt-red text-white px-8 py-2 rounded-xl text-xs font-black shadow-lg shadow-tbt-red/20 transition-all uppercase tracking-widest">Update Scenario</button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-8">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-[10px] font-black text-tbt-red shadow-sm">#{idx + 1}</span>
                                    <span className="text-[10px] font-black text-txt3 uppercase tracking-[0.1em] px-2 py-1 bg-surface border border-border rounded-md">SEC {q.section} • {q.tag}</span>
                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border", q.status === 'active' ? "bg-green-primary/5 text-green-primary border-green-primary/20" : "bg-txt3/5 text-txt3 border-border")}>{q.status}</span>
                                  </div>
                                  <h4 className="font-serif text-lg font-bold text-txt mb-4 leading-snug">{q.text}</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {Object.entries(q.options).map(([l, opt]) => {
                                      const text = typeof opt === 'string' ? opt : opt.text;
                                      const disc = typeof opt === 'string' ? '' : opt.disc;
                                      return (
                                        <div key={l} className="flex gap-2.5 text-xs items-center">
                                          <span className={cn("font-black shrink-0", 
                                            l === 'A' ? 'text-tbt-red' : l === 'B' ? 'text-gold' : l === 'C' ? 'text-green-primary' : 'text-blue-primary')}>{l}:</span>
                                          <span className="text-txt3 leading-relaxed line-clamp-1 flex-1">{text}</span>
                                          {disc && <span className="text-[9px] font-black bg-surface border border-border px-1 rounded opacity-60">{disc}</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={async () => {
                                    const newStatus = q.status === 'active' ? 'inactive' : 'active';
                                    await handleUpdateQuestion({...q, status: newStatus});
                                  }} className={cn("p-2.5 bg-surface border border-border rounded-xl transition-all", q.status === 'active' ? "text-txt3 hover:text-red-primary" : "text-txt3 hover:text-green-primary")} title={q.status === 'active' ? "Deactivate" : "Activate"}>
                                    <Layers className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setEditingQuestion(q)} className="p-2.5 bg-surface border border-border rounded-xl text-txt3 hover:text-tbt-red hover:border-tbt-red transition-all"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2.5 bg-surface border border-border rounded-xl text-txt3 hover:text-red-primary hover:border-red-primary transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {questions.filter(q => registryPoolQuestionIds.includes(q.id) && (q.status || 'active') === questionStatusFilter).length === 0 && (
                          <div className="p-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
                            <FileText className="w-12 h-12 text-txt3/20 mx-auto mb-4" />
                            <h3 className="font-serif text-xl font-black text-txt3 uppercase tracking-widest">No {questionStatusFilter} Scenarios</h3>
                            <p className="text-xs text-txt3 mt-2">Switch filters or add a new scenario to this pool.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Question Sets Tab */}
            {activeTab === "question_sets" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-serif text-3xl font-black text-txt">Multi-Audience Engine</h1>
                    <p className="text-sm text-txt3 mt-1 uppercase tracking-widest font-bold">Manage categories and specialized question sets</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleSeed(true)} disabled={loading} className="px-5 py-2.5 bg-tbt-red-dim border border-tbt-red/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-tbt-red hover:bg-tbt-red/10 transition-all flex items-center gap-2">
                      <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Reshuffle & Sync Master Pool
                    </button>
                    <button onClick={handleSeedEntrepreneur} disabled={loading} className="px-5 py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-txt2 hover:text-tbt-red hover:border-tbt-red transition-all flex items-center gap-2">
                      <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Sync Entrepreneur Set
                    </button>
                    <button onClick={handleSeedEmployee} disabled={loading} className="px-5 py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-txt2 hover:text-tbt-red hover:border-tbt-red transition-all flex items-center gap-2">
                      <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Sync Employee Set
                    </button>
                  </div>
                </div>

                {/* Sub-Navigation */}
                <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border w-fit">
                  {[
                    { id: 'categories', label: 'Categories', icon: ListTree },
                    { id: 'sets', label: 'Question Sets', icon: Layers },
                    { id: 'mapping', label: 'Set Mapping', icon: RefreshCcw, disabled: !selectedSet }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => !t.disabled && setActiveSetTab(t.id as any)}
                      disabled={t.disabled}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        activeSetTab === t.id 
                          ? "bg-tbt-red text-white shadow-lg shadow-tbt-red/20" 
                          : t.disabled ? "opacity-30 cursor-not-allowed text-txt3" : "text-txt3 hover:text-txt hover:bg-card"
                      )}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeSetTab === "categories" && (
                    <motion.div key="cats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">Category Name</label>
                            <input id="cat-name" type="text" placeholder="e.g. Entrepreneurs" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">URL Slug (Unique)</label>
                            <input id="cat-slug" type="text" placeholder="entrepreneurs" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">Description</label>
                          <textarea id="cat-desc" rows={2} placeholder="Describe this audience..." className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt outline-none focus:border-tbt-red transition-all resize-none" />
                        </div>
                        <div className="flex justify-end">
                          <button onClick={handleCreateCategory} disabled={saving} className="px-8 py-3 bg-tbt-red text-white text-[10px] font-black rounded-xl hover:bg-tbt-red-hover transition-all flex items-center gap-2 uppercase tracking-widest">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Category
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(c => (
                          <div key={c.id} className="bg-card border border-border rounded-2xl p-6 hover:border-tbt-red/30 transition-all group">
                            {editingCategory?.id === c.id ? (
                              <div className="space-y-4">
                                <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full h-10 bg-surface border border-border rounded-lg px-3 text-sm text-txt outline-none focus:border-tbt-red" placeholder="Category Name" />
                                <input type="text" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})} className="w-full h-10 bg-surface border border-border rounded-lg px-3 text-sm text-txt outline-none focus:border-tbt-red" placeholder="slug" />
                                <textarea value={editingCategory.description || ""} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-txt outline-none focus:border-tbt-red resize-none" rows={2} placeholder="Description" />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingCategory(null)} className="p-2 text-txt3 hover:text-txt"><X className="w-5 h-5" /></button>
                                  <button onClick={() => handleUpdateCategory(editingCategory)} className="bg-tbt-red text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Update</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-serif text-xl font-black text-txt">{c.name}</h4>
                                      <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border", c.status === 'active' ? "bg-green-primary/5 text-green-primary border-green-primary/20" : "bg-txt3/5 text-txt3 border-border")}>{c.status || 'active'}</span>
                                    </div>
                                    <code className="text-[10px] bg-surface px-2 py-0.5 rounded text-tbt-red font-bold uppercase tracking-widest">/{c.slug}</code>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={async () => {
                                      const newStatus = (c.status || 'active') === 'active' ? 'inactive' : 'active';
                                      await handleUpdateCategory({...c, status: newStatus});
                                    }} className={cn("p-2 rounded-lg bg-surface border border-border transition-all", (c.status || 'active') === 'active' ? "text-txt3 hover:text-red-primary" : "text-txt3 hover:text-green-primary")} title={(c.status || 'active') === 'active' ? "Deactivate" : "Activate"}>
                                      <Layers className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingCategory(c)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red transition-all"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={async () => { if(confirm("Delete Category?")){ await supabase.from('assessment_categories').delete().eq('id', c.id); fetchData(); } }} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-red-primary transition-all"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                                <p className="text-xs text-txt3 leading-relaxed line-clamp-2">{c.description || "No description provided."}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSetTab === "sets" && (
                    <motion.div key="sets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">Set Title</label>
                            <input id="set-title" type="text" placeholder="e.g. Core Entrepreneur Assessment v1" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">Category</label>
                            <select id="set-cat-id" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red appearance-none cursor-pointer font-bold">
                              <option value="">Select a Category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">Target Audience (Short)</label>
                            <input id="set-target" type="text" placeholder="e.g. Existing Business Owners" className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm text-txt outline-none focus:border-tbt-red transition-all" />
                          </div>
                          <div className="flex gap-8">
                            <div className="flex items-center gap-3 pt-2">
                              <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                <input type="checkbox" id="set-show-tags" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-4 peer-focus:ring-tbt-red/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tbt-red transition-all"></div>
                              </label>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Question Tags</span>
                                <span className="text-[9px] text-txt3 opacity-60 uppercase font-bold">Visible in Frontend</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                <input type="checkbox" id="set-status" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-4 peer-focus:ring-tbt-red/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tbt-red transition-all"></div>
                              </label>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Set Status</span>
                                <span className="text-[9px] text-txt3 opacity-60 uppercase font-bold">Active in Frontend</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-txt3 uppercase font-black tracking-widest">Description / Goal</label>
                          <textarea id="set-desc" rows={2} placeholder="Purpose of this specific question set..." className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-txt outline-none focus:border-tbt-red transition-all resize-none" />
                        </div>
                        <div className="flex justify-end">
                          <button onClick={handleCreateSet} disabled={saving} className="px-8 py-3 bg-tbt-red text-white text-[10px] font-black rounded-xl hover:bg-tbt-red-hover transition-all flex items-center gap-2 uppercase tracking-widest">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Question Set
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sets.map(s => (
                          <div key={s.id} className={cn("bg-card border rounded-2xl p-6 transition-all group relative", selectedSet?.id === s.id ? "border-tbt-red shadow-lg shadow-tbt-red/5" : "border-border hover:border-border2")}>
                            {editingSet?.id === s.id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Title</label>
                                    <input type="text" value={editingSet.title} onChange={e => setEditingSet({...editingSet, title: e.target.value})} className="w-full h-10 bg-surface border border-border rounded-lg px-3 text-sm text-txt outline-none focus:border-tbt-red" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Category</label>
                                    <select value={editingSet.category_id} onChange={e => setEditingSet({...editingSet, category_id: e.target.value})} className="w-full h-10 bg-surface border border-border rounded-lg px-3 text-sm text-txt outline-none focus:border-tbt-red">
                                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Target Audience</label>
                                    <input type="text" value={editingSet.target_audience} onChange={e => setEditingSet({...editingSet, target_audience: e.target.value})} className="w-full h-10 bg-surface border border-border rounded-lg px-3 text-sm text-txt outline-none focus:border-tbt-red" />
                                  </div>
                                  <div className="flex flex-col gap-4 pt-4">
                                    <div className="flex items-center gap-3">
                                      <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                        <input type="checkbox" checked={editingSet.show_tags} onChange={e => setEditingSet({...editingSet, show_tags: e.target.checked})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-4 peer-focus:ring-tbt-red/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tbt-red transition-all"></div>
                                      </label>
                                      <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Show Tags</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                        <input type="checkbox" checked={editingSet.status === 'active'} onChange={e => setEditingSet({...editingSet, status: e.target.checked ? 'active' : 'inactive'})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-4 peer-focus:ring-tbt-red/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tbt-red transition-all"></div>
                                      </label>
                                      <span className="text-[10px] font-black text-txt3 uppercase tracking-widest">Active Set</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-txt3 uppercase font-black tracking-widest px-1">Description</label>
                                  <textarea value={editingSet.description} onChange={e => setEditingSet({...editingSet, description: e.target.value})} className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-txt outline-none focus:border-tbt-red resize-none" rows={2} />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingSet(null)} className="p-2 text-txt3 hover:text-txt"><X className="w-5 h-5" /></button>
                                  <button onClick={() => handleUpdateSet(editingSet)} className="bg-tbt-red text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-tbt-red/20">Update</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-serif text-xl font-black text-txt">{s.title}</h4>
                                    <span className="text-[9px] bg-tbt-red-dim text-tbt-red px-1.5 py-0.5 rounded font-black">v{s.version}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingSet({...s, show_tags: s.show_tags !== false})} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red transition-all" title="Edit Set"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDuplicateSet(s)} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-tbt-red hover:bg-tbt-red-dim transition-all" title="Duplicate Set"><Copy className="w-4 h-4" /></button>
                                    <button onClick={() => fetchMappings(s.id)} className="p-2 rounded-lg bg-surface border border-border text-tbt-red hover:bg-tbt-red-dim transition-all" title="Manage Mappings"><RefreshCcw className="w-4 h-4" /></button>
                                    <button onClick={async () => { if(confirm("Delete Set?")){ await supabase.from('question_sets').delete().eq('id', s.id); fetchData(); } }} className="p-2 rounded-lg bg-surface border border-border text-txt3 hover:text-red-primary transition-all" title="Delete Set"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                  <div className="text-[10px] font-black text-txt3 uppercase tracking-widest flex items-center gap-2">
                                    <ListTree className="w-3 h-3" /> {categories.find(c => c.id === s.category_id)?.name || "Uncategorized"}
                                  </div>
                                  <div className={cn("text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded border", s.show_tags ? "bg-tbt-red/5 text-tbt-red border-tbt-red/20" : "bg-txt3/5 text-txt3 border-border")}>
                                    Tags: {s.show_tags ? "Visible" : "Hidden"}
                                  </div>
                                  <div className={cn("text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded border", s.status === 'active' ? "bg-green-primary/5 text-green-primary border-green-primary/20" : "bg-txt3/5 text-txt3 border-border")}>
                                    Status: {s.status === 'active' ? "Active" : "Inactive"}
                                  </div>
                                </div>
                                <p className="text-xs text-txt3 mb-6 line-clamp-2">{s.description || "No description provided."}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                  <div className="text-[10px] font-bold text-txt3 uppercase tracking-widest">Target: <span className="text-txt2">{s.target_audience || "Universal"}</span></div>
                                  <button onClick={() => fetchMappings(s.id)} className="text-[10px] font-black text-tbt-red uppercase tracking-widest hover:underline">Manage Mapping →</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSetTab === "mapping" && selectedSet && (
                    <motion.div key="mapping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Questions in this Set */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-tbt-red/5 border border-tbt-red/10 rounded-xl">
                          <div>
                            <div className="text-[10px] font-black text-tbt-red uppercase tracking-[0.2em]">Active Selection</div>
                            <div className="text-sm font-black text-txt">{selectedSet.title}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black text-txt3 uppercase tracking-widest">Questions</div>
                            <div className="text-xl font-black text-tbt-red">{setMappings.length}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-txt3 uppercase tracking-widest border-b border-border pb-2">Mapped Scenarios</h4>
                          {setMappings.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-txt3 text-xs italic">
                              No questions mapped to this set yet. Add from the registry.
                            </div>
                          )}
                          <div className="grid gap-3">
                            {setMappings.map((m, idx) => {
                              const q = questions.find(x => x.id === m.question_id);
                              return (
                                <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group">
                                  <div className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center text-[10px] font-black text-tbt-red">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-txt3 uppercase tracking-widest mb-0.5">#{q?.id} • {q?.tag}</div>
                                    <div className="text-xs font-bold text-txt truncate">{q?.text}</div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleMoveMapping(m, 'up')} disabled={idx === 0} className="p-1.5 text-txt3 hover:text-tbt-red disabled:opacity-20" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleMoveMapping(m, 'down')} disabled={idx === setMappings.length - 1} className="p-1.5 text-txt3 hover:text-tbt-red disabled:opacity-20" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleRemoveQuestionFromSet(m.id)} className="p-1.5 text-txt3 hover:text-red-primary ml-1" title="Remove Mapping"><X className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Master Question Registry Picker */}
                      <div className="space-y-4">
                        <div className="p-4 bg-surface border border-border rounded-xl">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt3" />
                            <input type="text" placeholder="Search Master Registry..." className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-4 text-xs text-txt outline-none focus:border-tbt-red" />
                          </div>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          <h4 className="text-[10px] font-black text-txt3 uppercase tracking-widest border-b border-border pb-2 sticky top-0 bg-bg z-10">Available Registry Items</h4>
                          <div className="grid gap-3">
                            {questions.filter(q => !setMappings.find(m => m.question_id === q.id)).map(q => (
                              <button key={q.id} onClick={() => handleAddQuestionToSet(q.id)} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-tbt-red/40 text-left transition-all group">
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-black text-txt3 uppercase tracking-widest mb-0.5">SEC {q.section} • {q.tag}</div>
                                  <div className="text-xs font-bold text-txt line-clamp-1">{q.text}</div>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-txt3 group-hover:text-tbt-red group-hover:bg-tbt-red-dim transition-all">
                                  <Plus className="w-4 h-4" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                      
                      {/* Detailed Traits Section */}
                      <div className="px-8 pb-8">
                        <div className="pt-8 border-t border-border space-y-6">
                          <h4 className="text-[10px] font-black text-txt3 uppercase tracking-[0.2em] mb-4">Detailed Behavioral Traits</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[9px] text-txt3 uppercase font-black tracking-widest block">Communication</label>
                              <textarea 
                                value={p.traits?.communication || ""} 
                                onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, traits: {...(item.traits || {}), communication: e.target.value}} : item))} 
                                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-txt2 outline-none focus:border-tbt-red transition-all" 
                                rows={2} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-txt3 uppercase font-black tracking-widest block">Decision Making</label>
                              <textarea 
                                value={p.traits?.decisionMaking || ""} 
                                onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, traits: {...(item.traits || {}), decisionMaking: e.target.value}} : item))} 
                                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-txt2 outline-none focus:border-tbt-red transition-all" 
                                rows={2} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-txt3 uppercase font-black tracking-widest block">Stress Response</label>
                              <textarea 
                                value={p.traits?.stressResponse || ""} 
                                onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, traits: {...(item.traits || {}), stressResponse: e.target.value}} : item))} 
                                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-txt2 outline-none focus:border-tbt-red transition-all" 
                                rows={2} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-txt3 uppercase font-black tracking-widest block">Leadership</label>
                              <textarea 
                                value={p.traits?.leadership || ""} 
                                onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, traits: {...(item.traits || {}), leadership: e.target.value}} : item))} 
                                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-txt2 outline-none focus:border-tbt-red transition-all" 
                                rows={2} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-txt3 uppercase font-black tracking-widest block">Growth Area</label>
                              <textarea 
                                value={p.traits?.growth || ""} 
                                onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, traits: {...(item.traits || {}), growth: e.target.value}} : item))} 
                                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-txt2 outline-none focus:border-tbt-red transition-all" 
                                rows={2} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-txt3 uppercase font-black tracking-widest block">Executive Summary</label>
                              <textarea 
                                value={p.traits?.summary || ""} 
                                onChange={e => setProfiles(profiles.map(item => item.letter === p.letter ? {...item, traits: {...(item.traits || {}), summary: e.target.value}} : item))} 
                                className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-txt2 outline-none focus:border-tbt-red transition-all" 
                                rows={2} 
                              />
                            </div>
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-tbt-red font-black uppercase tracking-widest">{categories.find(c => c.id === selectedResult.category_id)?.name || "Universal Profile"}</span>
                      <span className="text-[10px] text-txt3 font-bold opacity-30">•</span>
                      <p className="text-[10px] text-txt3 uppercase tracking-widest font-bold">Report #{selectedResult.id?.slice(0,8)}</p>
                    </div>
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

                {/* Behavioral Analysis */}
                {(selectedResult.blend_label || selectedResult.behavioral_summary) && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-txt3 uppercase tracking-[0.2em] border-b border-border pb-3">Behavioral Analysis</h4>
                    <div className="space-y-4">
                      {selectedResult.blend_label && (
                        <div className="bg-card p-5 rounded-xl border border-border">
                          <div className="text-[10px] font-black text-tbt-red uppercase tracking-widest mb-1">Profile Blend</div>
                          <div className="text-lg font-bold text-txt">{selectedResult.blend_label}</div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-border">
                          <div className="text-[9px] font-black text-txt3 uppercase tracking-widest mb-1">Intensity Level</div>
                          <div className="text-sm font-bold text-txt">{selectedResult.intensity_level || "Standard"}</div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border">
                          <div className="text-[9px] font-black text-txt3 uppercase tracking-widest mb-1">Secondary Type</div>
                          <div className="text-sm font-bold text-txt">{selectedResult.secondary_type || "None"}</div>
                        </div>
                      </div>

                      {selectedResult.behavioral_summary && (
                        <div className="bg-card p-5 rounded-xl border border-border">
                          <div className="text-[10px] font-black text-txt3 uppercase tracking-widest mb-2">Behavioral Summary</div>
                          <p className="text-xs text-txt2 leading-relaxed italic">"{selectedResult.behavioral_summary}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                         {[
                           { label: "Communication Style", value: selectedResult.communication_style },
                           { label: "Decision Making", value: selectedResult.decision_making },
                           { label: "Leadership Style", value: selectedResult.leadership_style },
                           { label: "Stress Response", value: selectedResult.stress_response },
                           { label: "Growth Edge", value: selectedResult.growth_recommendations },
                         ].map((item, i) => item.value ? (
                           <div key={i} className="bg-card p-4 rounded-xl border border-border">
                             <div className="text-[9px] font-black text-txt3 uppercase tracking-widest mb-1">{item.label}</div>
                             <p className="text-xs text-txt2 leading-relaxed">{item.value}</p>
                           </div>
                         ) : null)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Log */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-txt3 uppercase tracking-[0.2em] border-b border-border pb-3">Response Log</h4>
                  <div className="space-y-6">
                    {resultAnswers.map((ans, idx) => {
                      const qData = ans.questions;
                      const question = (Array.isArray(qData) ? qData[0] : qData) || questions.find(q => q.id === ans.question_id);
                      const selectedLetter = ans.answer_letter;
                      
                      // Resolve actual DISC type from stored mapping
                      let discType = "";
                      if (question && question.options && question.options[selectedLetter]) {
                        const opt = question.options[selectedLetter];
                        discType = typeof opt === 'object' ? opt.disc : (selectedLetter === 'A' ? 'D' : selectedLetter === 'B' ? 'I' : selectedLetter === 'C' ? 'S' : 'C');
                      } else {
                        // Fallback to legacy
                        discType = selectedLetter === 'A' ? 'D' : selectedLetter === 'B' ? 'I' : selectedLetter === 'C' ? 'S' : 'C';
                      }

                      return (
                        <div key={idx} className="space-y-4 bg-surface border border-border/50 rounded-2xl p-6 hover:border-tbt-red/20 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-[10px] font-black text-white bg-tbt-red px-2 py-0.5 rounded shadow-sm">Q{idx + 1}</span>
                                <span className="text-[10px] font-black text-txt3 uppercase tracking-widest bg-surface border border-border px-2 py-0.5 rounded">
                                  {question?.tag || "Assessment"}
                                </span>
                                <div className="ml-auto flex items-center gap-2">
                                  <span className="text-[9px] font-black text-txt3 uppercase tracking-widest opacity-60">Selected:</span>
                                  <span className="text-[10px] font-black text-white bg-tbt-red w-6 h-6 rounded-lg flex items-center justify-center shadow-lg shadow-tbt-red/20">
                                    {selectedLetter}
                                  </span>
                                </div>
                              </div>
                              <h5 className="text-sm font-bold text-txt mb-5 leading-relaxed">{question?.text || `Scenario #${ans.question_id}`}</h5>
                              
                              <div className="grid gap-2">
                                {['A', 'B', 'C', 'D'].map((letter) => {
                                  const isSelected = letter === selectedLetter;
                                  const opt = question?.options?.[letter];
                                  const text = typeof opt === 'object' ? opt?.text : opt;
                                  
                                  return (
                                    <div key={letter} className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-xs",
                                      isSelected 
                                        ? "bg-tbt-red/5 border-tbt-red/30 text-txt font-bold shadow-sm" 
                                        : "bg-card/50 border-border/50 text-txt3 opacity-60"
                                    )}>
                                      <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                                        isSelected ? "bg-tbt-red text-white" : "bg-surface border border-border text-txt3"
                                      )}>
                                        {letter}
                                      </div>
                                      <span className="flex-1">{text || "Option text unavailable"}</span>
                                      {isSelected && (
                                        <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded", 
                                          discType === 'D' ? 'bg-tbt-red text-white' : 
                                          discType === 'I' ? 'bg-gold text-white' : 
                                          discType === 'S' ? 'bg-green-primary text-white' : 
                                          'bg-blue-primary text-white')}>
                                          {discType}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          {ans.reflection && (
                            <div className="mt-2 bg-card p-4 rounded-xl border border-border/50 italic text-[11px] text-txt3 leading-relaxed relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-tbt-red/10" />
                              <span className="text-[9px] font-black text-tbt-red uppercase tracking-widest block mb-1 opacity-50">Reflection</span>
                              "{ans.reflection}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {fetchingDetail && (
                      <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border">
                        <Loader2 className="w-8 h-8 text-tbt-red/20 animate-spin mx-auto mb-4" />
                        <p className="text-xs text-txt3 font-bold uppercase tracking-widest">Loading response data...</p>
                      </div>
                    )}
                    {!fetchingDetail && resultAnswers.length === 0 && (
                      <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border">
                        <FileText className="w-8 h-8 text-txt3/20 mx-auto mb-4" />
                        <p className="text-xs text-txt3 font-bold uppercase tracking-widest">No responses recorded for this assessment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {resultToDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResultToDelete(null)} className="fixed inset-0 bg-bg/80 backdrop-blur-md z-[200]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-border z-[201] rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-tbt-red-dim flex items-center justify-center text-tbt-red mb-6">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-black text-txt mb-2">Delete Response?</h3>
                <p className="text-sm text-txt3 leading-relaxed mb-8">
                  Are you sure you want to delete the assessment for <span className="text-txt font-bold">"{resultToDelete.full_name}"</span>? This action cannot be undone.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => setResultToDelete(null)} className="h-12 rounded-xl border border-border text-xs font-black uppercase tracking-widest text-txt3 hover:bg-card hover:text-txt transition-all">No, Cancel</button>
                  <button onClick={handleDeleteResult} disabled={saving} className="h-12 rounded-xl bg-tbt-red text-white text-xs font-black uppercase tracking-widest hover:bg-tbt-red-hover shadow-lg shadow-tbt-red/20 transition-all flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
