import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, ArrowLeft, Bot, CheckCircle2, ShieldCheck, RefreshCw, ChevronDown, X, Search,
  Cpu, Stethoscope, TrendingUp, ShoppingCart, Home, Hammer, Factory, Truck, GraduationCap, Zap, Phone,
  Film, Hotel, Utensils, Sprout, Car, Briefcase, Scale, Megaphone, Users, Landmark, Heart, Shield,
  Dna, Anchor, Gamepad2, Mountain, Trophy, Leaf, Trash2, ShieldAlert
} from 'lucide-react';
import { ThemeId } from '../types';
import { VERTICALS } from '../verticals';
import { VERTICAL_LABELS } from '../lib/industryPersona';
import { useAutoSave } from '../lib/useAutoSave';

function getVerticalIcon(verticalId: string, className: string = "w-4 h-4 text-neutral-400 group-hover:text-white transition-colors") {
  switch (verticalId) {
    case 'technology':
      return <Cpu className={className} />;
    case 'healthcare':
      return <Stethoscope className={className} />;
    case 'financial-services':
      return <TrendingUp className={className} />;
    case 'retail-ecommerce':
    case 'consumer-goods':
    case 'wholesale-distribution':
    case 'fashion-apparel':
    case 'beauty-personal-care':
      return <ShoppingCart className={className} />;
    case 'real-estate':
      return <Home className={className} />;
    case 'construction':
    case 'home-improvement':
      return <Hammer className={className} />;
    case 'manufacturing':
    case 'chemicals':
    case 'electronics-semiconductors':
      return <Factory className={className} />;
    case 'transportation-logistics':
    case 'maritime-shipping':
      return <Truck className={className} />;
    case 'education':
      return <GraduationCap className={className} />;
    case 'energy-utilities':
      return <Zap className={className} />;
    case 'telecommunications':
      return <Phone className={className} />;
    case 'media-entertainment':
    case 'publishing':
      return <Film className={className} />;
    case 'hospitality-tourism':
      return <Hotel className={className} />;
    case 'food-beverage':
      return <Utensils className={className} />;
    case 'agriculture':
      return <Sprout className={className} />;
    case 'automotive':
      return <Car className={className} />;
    case 'legal-services':
      return <Scale className={className} />;
    case 'marketing-advertising':
      return <Megaphone className={className} />;
    case 'hr-staffing':
      return <Users className={className} />;
    case 'government-public':
      return <Landmark className={className} />;
    case 'nonprofit':
      return <Heart className={className} />;
    case 'insurance':
    case 'security-services':
      return <Shield className={className} />;
    case 'biotech-life-sciences':
      return <Dna className={className} />;
    case 'gaming-esports':
      return <Gamepad2 className={className} />;
    case 'mining-natural-resources':
      return <Mountain className={className} />;
    case 'sports-recreation':
      return <Trophy className={className} />;
    case 'environmental-services':
    case 'waste-management':
      return <Leaf className={className} />;
    default:
      return <Briefcase className={className} />;
  }
}

interface OnboardingWizardProps {
  onSkip: () => void;
  onComplete: (
    themeId: ThemeId,
    botName: string,
    vertical: string,
    scraped: boolean,
    email?: string,
    position?: string,
    personaTone?: string,
    whatsappNumber?: string,
    avatarUrl?: string,
    humanHandoff?: boolean,
    businessHours?: any
  ) => void;
  tenantProfile?: any;
}

export default function OnboardingWizard({ onSkip, onComplete, tenantProfile }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [botName, setBotName] = useState('AI Assistant');
  const [vertical, setVertical] = useState('technology');
  const [themeId, setThemeId] = useState<ThemeId>('midnight');
  const [scraped, setScraped] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [humanHandoff, setHumanHandoff] = useState(true);

  const { trigger: autoSaveNotificationEmail, status: autoSaveNotificationEmailStatus } = useAutoSave(
    async (value: string) => {
      const token = localStorage.getItem('neslead_session_token');
      await fetch('/api/tenant/config', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ notificationEmail: value })
      });
    }
  );

  // AI Questions states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ msg: string; type: 'QUESTIONS' | 'FINALIZE' | 'ONBOARD' } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isVerticalOverlayOpen, setIsVerticalOverlayOpen] = useState(false);

  const filteredVerticals = VERTICALS.filter(v => 
    v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Restore onboarding progress from localStorage on mount unless wizard was explicitly skipped
  React.useEffect(() => {
    const isSkipped = localStorage.getItem('neslead_skipped_wizard') === 'true';
    if (isSkipped) {
      // reset to defaults
      setStep(1);
      setBotName('NesLead Bot'); // rebrand default tenant bot name
      setVertical('technology');
      setThemeId('midnight');
      setOnboardingAnswers({});
      setAiQuestions([]);
      return;
    }

    const saved = localStorage.getItem('neslead_wizard_saved_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.botName) setBotName(parsed.botName);
        if (parsed.vertical) setVertical(parsed.vertical);
        if (parsed.themeId) setThemeId(parsed.themeId);
        if (parsed.onboardingAnswers) setOnboardingAnswers(parsed.onboardingAnswers);
        if (parsed.aiQuestions) setAiQuestions(parsed.aiQuestions);
        if (parsed.notificationEmail) setNotificationEmail(parsed.notificationEmail);
        if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
        if (parsed.avatarUrl) setAvatarUrl(parsed.avatarUrl);
        if (typeof parsed.humanHandoff === 'boolean') setHumanHandoff(parsed.humanHandoff);
      } catch (e) {
        console.error('Failed to restore onboarding savings draft:', e);
      }
    } else {
      // No localStorage draft — try DB as cross-device fallback
      const token = localStorage.getItem('neslead_session_token');
      if (token) {
        fetch('/api/tenant/wizard-draft', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.draft) {
            const parsed = data.draft;
            if (parsed.step) setStep(parsed.step);
            if (parsed.botName) setBotName(parsed.botName);
            if (parsed.vertical) setVertical(parsed.vertical);
            if (parsed.themeId) setThemeId(parsed.themeId);
            if (parsed.onboardingAnswers) setOnboardingAnswers(parsed.onboardingAnswers);
            if (parsed.aiQuestions) setAiQuestions(parsed.aiQuestions);
            if (parsed.notificationEmail) setNotificationEmail(parsed.notificationEmail);
            if (parsed.whatsappNumber) setWhatsappNumber(parsed.whatsappNumber);
            if (parsed.avatarUrl) setAvatarUrl(parsed.avatarUrl);
            if (typeof parsed.humanHandoff === 'boolean') setHumanHandoff(parsed.humanHandoff);
            // Hydrate localStorage from DB draft so subsequent saves are local-first
            localStorage.setItem('neslead_wizard_saved_progress', JSON.stringify(parsed));
          }
        })
        .catch(e => console.warn('DB draft fetch (non-fatal):', e?.message || e));
      }
    }
  }, []); // keep empty dependency array — mount only

  // Save onboarding progress whenever any relevant state fields change
  React.useEffect(() => {
    const isSkipped = localStorage.getItem('neslead_skipped_wizard') === 'true';
    if (isSkipped) return;

    const progress = {
      step,
      botName,
      vertical,
      themeId,
      onboardingAnswers,
      aiQuestions,
      notificationEmail,
      whatsappNumber,
      avatarUrl,
      humanHandoff
    };

    // Always save locally (fast, synchronous)
    localStorage.setItem('neslead_wizard_saved_progress', JSON.stringify(progress));

    // Debounced DB sync (2s delay — avoid hammering the server on every keystroke)
    const dbSyncTimer = setTimeout(() => {
      const token = localStorage.getItem('neslead_session_token');
      if (token && step > 1) { // Only sync if user has moved past step 1
        fetch('/api/tenant/wizard-draft', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ draft: progress })
        }).catch(e => console.warn('DB draft sync (non-fatal):', e?.message || e));
      }
    }, 2000);

    return () => clearTimeout(dbSyncTimer);
  }, [step, botName, vertical, themeId, onboardingAnswers, aiQuestions, notificationEmail, whatsappNumber, avatarUrl, humanHandoff]);

  const handleNext = async () => {
    setValidationError(null);
    setApiError(null);

    if (step === 1) {
      if (!botName || !botName.trim()) {
        setValidationError('Assistant Bot Name is required.');
        return;
      }
      if (!vertical) {
        setValidationError('Please select a target industry vertical.');
        return;
      }

      setLoadingQuestions(true);
      const token = localStorage.getItem('neslead_session_token');
      try {
        const firmName = tenantProfile?.name || 'Our Firm';
        const tenantId = tenantProfile?.id;
        const res = await fetch('/api/industry-onboarding/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ vertical, firmName, tenantId })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && Array.isArray(data.questions)) {
            setAiQuestions(data.questions);
            const initialAnswers: Record<string, string> = {};
            data.questions.forEach((q: any) => {
              initialAnswers[q.id] = q.type === 'select' && q.options?.[0] ? q.options[0] : '';
            });
            setOnboardingAnswers(initialAnswers);
          }
          setStep(2);
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError({
            msg: errData.message || 'Server failed to generate custom industry questions.',
            type: 'QUESTIONS'
          });
        }
      } catch (err: any) {
        setApiError({
          msg: err.message || 'Network error while retrieving questions. Please check your connection.',
          type: 'QUESTIONS'
        });
      } finally {
        setLoadingQuestions(false);
      }
    } else if (step === 2) {
      const emptyFields = aiQuestions.filter(q => !onboardingAnswers[q.id] || !onboardingAnswers[q.id].trim());
      if (emptyFields.length === aiQuestions.length && aiQuestions.length > 0) {
        setValidationError('Please answer at least one question to help train your AI Assistant.');
        return;
      }
      setStep(3);
    } else {
      if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail.trim())) {
        setValidationError('Please enter a valid format for notification email.');
        return;
      }

      const token = localStorage.getItem('neslead_session_token');
      const tenantId = tenantProfile?.id;
      
      let finalizedOk = false;
      try {
        const res = await fetch('/api/industry-onboarding/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            tenantId,
            vertical,
            assistantName: botName,
            answers: onboardingAnswers
          })
        });
        if (res.ok) {
          finalizedOk = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          setApiError({
            msg: errData.message || 'Server failed to save AI training context setup.',
            type: 'FINALIZE'
          });
          return;
        }
      } catch (err: any) {
        setApiError({
          msg: err.message || 'Failed to connect to the server for context finalization.',
          type: 'FINALIZE'
        });
        return;
      }

      if (finalizedOk) {
        onComplete(
          themeId,
          botName,
          vertical,
          scraped,
          notificationEmail,
          'right_bottom',
          'professional',
          whatsappNumber,
          avatarUrl,
          humanHandoff,
          null
        );
      }
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setApiError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (loadingQuestions) {
    const label = VERTICAL_LABELS[vertical] || vertical;
    return (
      <div className="w-full max-w-2xl mx-auto p-12 rounded-3xl border shadow-2xl flex flex-col items-center justify-center space-y-6" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="p-5 rounded-2xl text-white flex items-center justify-center shadow-lg animate-spin" style={{ background: 'var(--accent-gradient, linear-gradient(135deg, #6366F1, #4F46E5))', animationDuration: '3s' }}>
          <RefreshCw className="w-8 h-8 text-white" />
        </div>
        <p className="text-sm font-semibold text-neutral-300">
          Personalizing your setup for {label}...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl border shadow-2xl relative animate-fade-in" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 pr-20 sm:pr-0">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider text-indigo-500">Workspace Initialization</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-neutral-400 flex-wrap sm:mr-24">
          <span className={step === 1 ? 'text-indigo-500 font-extrabold' : ''}>1. Identity</span>
          <span className="text-neutral-600">•</span>
          <span className={step === 2 ? 'text-indigo-500 font-extrabold' : ''}>2. Profile</span>
          <span className="text-neutral-600">•</span>
          <span className={step === 3 ? 'text-indigo-500 font-extrabold' : ''}>3. Finalize</span>
        </div>
      </div>

      {/* Validation/API error alerts */}
      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-2.5 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-extrabold uppercase tracking-wide">Interface Error: {apiError.type}</span>
          </div>
          <p className="font-medium">{apiError.msg}</p>
          <button
            onClick={handleNext}
            className="self-start px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-[11px] uppercase tracking-wider hover:bg-amber-450 transition-colors pointer-events-auto"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Step Contents */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Configure Assistant Identity</h3>
            <p className="text-sm text-neutral-400 font-medium">Specify the primary industry your business operates in and set the name of your AI assistant.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Assistant Name</label>
              <input 
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border font-semibold text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Target Industry Vertical</label>
              <button 
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsVerticalOverlayOpen(true);
                }}
                className="w-full px-4 py-3 rounded-xl border font-semibold text-sm bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none flex items-center justify-between text-left hover:border-neutral-500 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5">{getVerticalIcon(vertical, "w-4 h-4 text-indigo-400")}</span>
                  <span>{VERTICAL_LABELS[vertical] || vertical}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Target Industry Vertical Searchable Responsive Modal Overlay */}
            {isVerticalOverlayOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                {/* Backdrop Click */}
                <div className="absolute inset-0 cursor-default" onClick={() => setIsVerticalOverlayOpen(false)} />
                
                {/* Modal Container */}
                <div 
                  className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-scale-in"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-6 py-4.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <h4 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Select Industry Vertical</h4>
                      <p className="text-xs text-neutral-400">Tailors AI training seeds & business profiles</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsVerticalOverlayOpen(false)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search bar */}
                  <div className="px-6 py-3">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input 
                        type="text"
                        placeholder="Search industries... (e.g. Technology)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-neutral-500"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1 max-h-[45vh] min-h-[150px]">
                    {filteredVerticals.length === 0 ? (
                      <div className="text-xs text-neutral-500 text-center py-8">
                        No industry verticals found matching &quot;{searchTerm}&quot;
                      </div>
                    ) : (
                      filteredVerticals.map((v) => {
                        const isSelected = vertical === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setVertical(v.id);
                              setIsVerticalOverlayOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left border transition-all duration-150 group cursor-pointer ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold' 
                                : 'border-transparent text-neutral-300 hover:bg-neutral-800/40 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-5 h-5">
                                {getVerticalIcon(v.id, `w-4 h-4 transition-colors ${isSelected ? 'text-indigo-400' : 'text-neutral-450 group-hover:text-white'}`)}
                              </span>
                              <span className="text-sm font-medium">{v.label}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t flex justify-between items-center text-[10px] text-neutral-400" style={{ borderColor: 'var(--color-border)' }}>
                    <span>Total available: {VERTICALS.length}</span>
                    {searchTerm && <span>Matches: {filteredVerticals.length}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>AI-Driven Business Context</h3>
            <p className="text-sm text-neutral-400 font-medium">Please answer these dynamically tailored questions to help initialize and train your AI assistant.</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {aiQuestions.length === 0 && (
              <p className="text-sm text-neutral-400">
                Using standard defaults for customization. Click next to proceed.
              </p>
            )}
            {aiQuestions.map((q) => (
              <div key={q.id} className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 leading-normal">
                  {q.label}
                </label>
                {q.type === 'textarea' ? (
                  <textarea
                    value={onboardingAnswers[q.id] || ''}
                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [q.id]: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border font-medium text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                ) : q.type === 'select' ? (
                  <select
                    value={onboardingAnswers[q.id] || ''}
                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [q.id]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border font-semibold text-sm bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    {(q.options || []).map((opt: string) => (
                      <option key={opt} value={opt} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={onboardingAnswers[q.id] || ''}
                    onChange={(e) => setOnboardingAnswers({ ...onboardingAnswers, [q.id]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border font-medium text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Review & Initialize</h3>
            <p className="text-sm text-neutral-400 font-medium">Finalize communication channels, human handovers, and confirm your AI training seeds.</p>
          </div>

          <div className="space-y-4">
            {/* Read-only summary card */}
            <div className="p-4 rounded-xl border space-y-2.5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div className="flex justify-between items-center text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                <span>Summary Parameters</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-400 block font-bold">Selected Vertical:</span>
                  <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                    {VERTICAL_LABELS[vertical] || vertical}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-bold">Assistant Name:</span>
                  <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                    {botName}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t text-[11px] space-y-1.5" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-neutral-400 font-bold block">Business Profiles:</span>
                {aiQuestions.map((q) => (
                  <div key={q.id} className="text-neutral-300">
                    <span className="font-semibold text-neutral-400 mr-1">{q.label}:</span>
                    <span className="font-mono">{onboardingAnswers[q.id] || '(None provided)'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Notification Email address</label>
                {autoSaveNotificationEmailStatus !== 'idle' && (
                  <span className={`text-[10px] font-bold ${
                    autoSaveNotificationEmailStatus === 'saved' ? 'text-emerald-400' : 
                    autoSaveNotificationEmailStatus === 'saving' ? 'text-indigo-400 animate-pulse' : 'text-red-400'
                  }`}>
                    {autoSaveNotificationEmailStatus === 'saved' ? '✓ Saved' : 
                     autoSaveNotificationEmailStatus === 'saving' ? 'Saving...' : 'Error saving'}
                  </span>
                )}
              </div>
              <input 
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                onBlur={(e) => autoSaveNotificationEmail(e.target.value)}
                placeholder="alerts@mybusiness.com"
                className="w-full px-4 py-3 rounded-xl border bg-transparent font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: autoSaveNotificationEmailStatus === 'saved' ? '#059669' : 'var(--color-border)', color: 'var(--color-text-primary)' , transition: 'border-color 0.3s ease' }}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Human Fallback Handover</div>
                <div className="text-xs text-neutral-400">Allow instant seamless transfer to human advisors.</div>
              </div>
              <input 
                type="checkbox"
                checked={humanHandoff}
                onChange={(e) => setHumanHandoff(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl border font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <button
            onClick={onSkip}
            className="text-xs font-extrabold text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Skip Config for Now
          </button>
        )}

        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-xl text-white font-bold text-sm bg-indigo-500 flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          style={{ background: 'var(--accent-gradient, linear-gradient(135deg, #6366F1, #4F46E5))' }}
        >
          {step === 3 ? 'Complete Setup' : 'Next Step'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
