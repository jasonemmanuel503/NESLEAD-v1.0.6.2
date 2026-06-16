import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BookOpen, Search, Plus, Filter, Globe, Database, Pencil, Trash2, CheckCircle2, ChevronRight, Upload, Sparkles } from 'lucide-react';
import { VERTICAL_LABELS } from '../lib/industryPersona';
import { useAutoSave } from '../lib/useAutoSave';

interface FAQ {
  id: string | number;
  question: string;
  answer: string;
  category: string;
}

interface KnowledgeBasePageProps {
  vertical?: string | null;
}

function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null;
  const config = {
    saving: { text: 'Saving...', color: '#6366f1' },
    saved:  { text: '✓ Saved',   color: '#059669' },
    error:  { text: '✗ Error',   color: '#dc2626' },
  }[status];

  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 transition-all" style={{ color: config.color }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
      {config.text}
    </span>
  );
}

export default function KnowledgeBasePage({ vertical }: KnowledgeBasePageProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('Services');
  const [showAddForm, setShowAddForm] = useState(false);

  // Editing active FAQ states
  const [editingFaqId, setEditingFaqId] = useState<string | number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingAnswer, setEditingAnswer] = useState('');

  // Auto-save existing edited FAQ
  const { trigger: autoSaveFaqEdit, status: autoSaveFaqEditStatus } = useAutoSave(
    async (params: { id: string | number; question: string; answer: string }) => {
      const token = localStorage.getItem('neslead_session_token');
      const res = await fetch(`/api/faqs/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          question: params.question,
          answer: params.answer
        })
      });
      if (res.ok) {
        setFaqs(prev => prev.map(f => f.id === params.id ? { ...f, question: params.question, answer: params.answer } : f));
      }
    }
  );

  // Auto-save new FAQ creator draft fields
  useEffect(() => {
    const q = localStorage.getItem('neslead_kb_draft_question') || '';
    const a = localStorage.getItem('neslead_kb_draft_answer') || '';
    if (q) setNewQuestion(q);
    if (a) setNewAnswer(a);
  }, []);

  const { trigger: autoSaveNewDraft, status: autoSaveNewDraftStatus } = useAutoSave(
    async (draft: { question: string; answer: string }) => {
      localStorage.setItem('neslead_kb_draft_question', draft.question);
      localStorage.setItem('neslead_kb_draft_answer', draft.answer);
    }
  );

  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0); // 0–100
  const [scrapeError, setScrapeError] = useState('');
  const [scrapeResult, setScrapeResult] = useState<{
    faqs: { id: string; question: string; answer: string }[];
    programs: { id: string; name: string; department: string; duration: string; fees: string; description: string }[];
    document: { fileName: string; fileSize: string; chunkCount: number } | null;
  } | null>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    let normalizedUrl = scrapeUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setScrapeLoading(true);
    setScrapeProgress(0);
    setScrapeError('');
    setScrapeResult(null);

    // GSAP fake-progress simulation
    const fakeProgress = { val: 0 };
    const tween = gsap.to(fakeProgress, {
      val: 85,
      duration: 12,
      ease: 'power1.out',
      onUpdate: () => {
        const rounded = Math.round(fakeProgress.val);
        setScrapeProgress(rounded);
        if (progressBarRef.current) {
          gsap.set(progressBarRef.current, { width: rounded + '%' });
        }
      }
    });

    try {
      const token = localStorage.getItem('neslead_session_token');
      const res = await fetch('/api/knowledge/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ url: normalizedUrl, vertical })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Success animation
        tween.kill();
        setScrapeProgress(100);
        if (progressBarRef.current) {
          await gsap.to(progressBarRef.current, { width: '100%', duration: 0.4 });
        }
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setScrapeResult({
          faqs: data.faqs || [],
          programs: data.programs || [],
          document: data.document ? {
            fileName: data.document.fileName || data.document.file_name || 'scraped_page',
            fileSize: data.document.fileSize || data.document.file_size || '0 bytes',
            chunkCount: data.document.chunkCount || data.document.chunk_count || 0
          } : null
        });

        // Trigger FAQs reload so they sync on-screen
        loadFaqs();
      } else {
        tween.kill();
        const errData = await res.json().catch(() => ({}));
        setScrapeError(errData.message || errData.error || 'Failed to scrape URL.');
        setScrapeProgress(0);
        if (progressBarRef.current) {
          gsap.set(progressBarRef.current, { width: '0%' });
        }
      }
    } catch (err: any) {
      tween.kill();
      setScrapeError(err.message || 'An error occurred during scanning.');
      setScrapeProgress(0);
      if (progressBarRef.current) {
        gsap.set(progressBarRef.current, { width: '0%' });
      }
    } finally {
      setScrapeLoading(false);
    }
  };

  const loadFaqs = async () => {
    setFaqsLoading(true);
    try {
      const token = localStorage.getItem('neslead_session_token');
      const res = await fetch('/api/faqs', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        const loaded = (Array.isArray(data) ? data : (data.faqs || [])).map((item: any) => ({
          ...item,
          category: item.category || 'General'
        }));
        setFaqs(loaded);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setFaqsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;

    try {
      const token = localStorage.getItem('neslead_session_token');
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer,
          category: newCategory
        })
      });
      if (res.ok) {
        await loadFaqs(); // Reload from server for real-time sync
        setNewQuestion('');
        setNewAnswer('');
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Failed to create FAQ:', err);
    }
  };

  const handleDeleteFaq = async (id: string | number) => {
    try {
      const token = localStorage.getItem('neslead_session_token');
      const res = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        await loadFaqs();
      }
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    }
  };

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Knowledge Base Training Base
          </h1>
          {vertical && (
            <p className="text-xs font-semibold text-indigo-400 mt-1">
              Your {VERTICAL_LABELS[vertical] || vertical} knowledge base
            </p>
          )}
          <p className="text-sm text-neutral-400 mt-1">Manage trained FAQs, brochures, scraping catalogs, and custom agent responses.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl font-bold text-white text-sm bg-indigo-500 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add FAQ Answer
        </button>
      </div>

      {/* Grid Layout of controls and content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Filter & Scraping sources */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Search */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Quick Search & Filter</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query FAQ keys..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-transparent border-neutral-700 focus:outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                {['ALL', 'Services', 'Finances', 'General'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-extrabold flex items-center justify-between transition-colors ${categoryFilter === cat ? 'bg-indigo-500/10 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800'}`}
                  >
                    <span>{cat} Category</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Crawler scan mock */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-black uppercase tracking-wider mb-3.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500 animate-pulse" />
              Website URL Scraper
            </h3>
            
            {!scrapeResult ? (
              <div className="space-y-3.5">
                <input 
                  type="text" 
                  value={scrapeUrl}
                  disabled={scrapeLoading}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !scrapeLoading) handleScrape(); }}
                  placeholder="https://mybusiness.com/services"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-700 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                
                {scrapeLoading && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400">Scanning & extracting...</span>
                      <span className="text-[10px] font-mono text-indigo-400">{scrapeProgress}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        ref={progressBarRef}
                        className="h-full rounded-full"
                        style={{ width: '0%', backgroundColor: 'var(--color-accent, #6366f1)' }}
                      />
                    </div>
                  </div>
                )}

                {scrapeError && (
                  <div className="p-3 rounded-xl text-xs font-bold text-red-400 border border-red-500/15 bg-red-500/5">
                    {scrapeError}
                  </div>
                )}

                <button 
                  onClick={handleScrape}
                  disabled={scrapeLoading || !scrapeUrl.trim()}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {scrapeLoading ? 'Scanning...' : 'Index & Extract URL'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Scraped: {scrapeResult.document?.fileName || 'Success'}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {scrapeResult.document?.chunkCount || 0} chunks indexed
                  </div>
                </div>

                {scrapeResult.faqs && scrapeResult.faqs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Extracted FAQs ({scrapeResult.faqs.length})</div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scroller-none border-l-2 border-neutral-800 pl-2">
                      {scrapeResult.faqs.map((f, idx) => (
                        <div key={f.id || idx} className="text-xs space-y-1">
                          <div className="font-bold text-neutral-200">{f.question}</div>
                          <div className="text-neutral-400 text-[11px] leading-relaxed">{f.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scrapeResult.programs && scrapeResult.programs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Extracted {vertical === 'education' ? 'Programs' : 'Services'} ({scrapeResult.programs.length})
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scroller-none border-l-2 border-neutral-800 pl-2">
                      {scrapeResult.programs.map((p, idx) => (
                        <div key={p.id || idx} className="text-xs space-y-1">
                          <div className="font-bold text-neutral-200">{p.name}</div>
                          <div className="text-[10px] text-indigo-400 font-mono">
                            {p.department && <span>{p.department} </span>}
                            {p.duration || p.fees ? `· ${p.duration || ''} ${p.fees || ''}` : ''}
                          </div>
                          {p.description && (
                            <div className="text-neutral-400 text-[11px] leading-relaxed">{p.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setScrapeResult(null);
                    setScrapeUrl('');
                  }}
                  className="w-full py-2 rounded-xl text-center text-xs font-bold bg-neutral-800 hover:bg-neutral-750 text-neutral-300 transition-colors cursor-pointer"
                >
                  Clear Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - FAQ Records list */}
        <div className="lg:col-span-2 space-y-4">
          {showAddForm && (
            <form onSubmit={handleCreateFaq} className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between border-b pb-3 mb-1" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-sm font-black uppercase tracking-wider">New FAQ Entry</h3>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-neutral-400 hover:text-white">Cancel</button>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Do you offer payment plans or installments?"
                  className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm border-neutral-700 outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <textarea 
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Answer block..."
                  className="w-full px-4 py-2.5 rounded-xl border bg-transparent text-sm border-neutral-700 outline-none min-h-[100px]"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <button type="submit" className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-500">
                  Save Training Record
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {faqsLoading ? (
              <div className="text-center py-12 text-neutral-400 text-sm">
                <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading FAQs...
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12 border rounded-2xl border-dashed border-neutral-700/40 text-neutral-400 text-sm">
                No trained FAQs match the specified filter keys.
              </div>
            ) : (
              filteredFaqs.map(faq => (
                <div 
                  key={faq.id} 
                  className="p-5 rounded-2xl border flex items-start gap-4 justify-between"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                        {faq.category}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-500">Trained</span>
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{faq.question}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{faq.answer}</p>
                  </div>

                  <button 
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
