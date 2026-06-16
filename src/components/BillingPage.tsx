import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Sparkles, Building, Briefcase, Zap, ShieldAlert, FileText, Download, Gift, Globe, PhoneCall } from 'lucide-react';
import { useCurrency } from './CurrencyContext';
import { CANONICAL_PLANS, VALID_PLAN_NAMES, PlanName, VOICE_ADDON_PLANS, VoiceAddOnName, VALID_VOICE_ADDON_NAMES } from '../lib/plans';
import PaymentModal from './PaymentModal';

const PLAN_ICONS: Record<PlanName, any> = {
  'Free Tier': Gift,
  'Starter': Briefcase,
  'Growth': Zap,
  'Enterprise': Sparkles,
  'Agency': Building,
};

const plans = VALID_PLAN_NAMES.map(name => ({
  ...CANONICAL_PLANS[name],
  icon: PLAN_ICONS[name] ?? null,
  popular: name === 'Growth'
}));

interface BillingPageProps {
  leadsCount: number;
  convsCount: number;
  onPlanUpgrade: () => void;
  currentPlan: string;
  isTrialActive: boolean;
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>;
}

export default function BillingPage({ leadsCount, convsCount, onPlanUpgrade, currentPlan, isTrialActive, authFetch }: BillingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const { convertAndFormat, currency, detectedCountry, changeCurrencyOverride, availableCurrencies, isLoading } = useCurrency();

  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<any>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const [voiceUsage, setVoiceUsage] = useState<{
    minutesUsed: number;
    totalMinutesThisMonth: number;
    totalCallsThisMonth: number;
  } | null>(null);
  const [voiceUsageLoading, setVoiceUsageLoading] = useState(true);

  const [voiceAddonTier, setVoiceAddonTier] = useState<VoiceAddOnName | null>(null);
  const [voiceSettingsLoading, setVoiceSettingsLoading] = useState(true);
  const [switchingAddon, setSwitchingAddon] = useState<string | null>(null);
  const [addonError, setAddonError] = useState<string | null>(null);

  const planLimits: Record<string, { leads: string; convos: string }> = {
    'Free Tier':   { leads: '10',        convos: '50 total' },
    'Starter':     { leads: '200',       convos: '500 / mo' },
    'Growth':      { leads: 'Unlimited', convos: '5,000 / mo' },
    'Enterprise':  { leads: 'Unlimited', convos: 'Unlimited' },
    'Agency':      { leads: 'Unlimited', convos: 'Unlimited' },
  };

  const normalizeKey = (s: string) => {
    const lower = s.toLowerCase().replace(' tier', '').replace(' plan', '').trim();
    return Object.keys(planLimits).find(k => k.toLowerCase().replace(' tier','').replace(' plan','').trim() === lower) || 'Starter';
  };

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(() => {
    const idx = plans.findIndex(p => normalizeKey(p.name) === normalizeKey(currentPlan));
    return idx >= 0 ? idx : 1;
  });
  const displayPlan = plans[selectedPlanIndex];

  const fetchInvoices = async () => {
    setInvoicesLoading(true);
    try {
      const res = await authFetch('/api/billing/invoices');
      const data = await res.json();
      if (res.ok && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const fetchVoiceUsage = async () => {
    setVoiceUsageLoading(true);
    try {
      const res = await authFetch('/api/voice/usage');
      const data = await res.json();
      if (res.ok && data.success) {
        setVoiceUsage(data);
      }
    } catch (err) {
      console.error('Error fetching voice usage:', err);
    } finally {
      setVoiceUsageLoading(false);
    }
  };

  const fetchVoiceSettings = async () => {
    setVoiceSettingsLoading(true);
    try {
      const res = await authFetch('/api/voice/settings');
      const data = await res.json();
      if (res.ok) {
        setVoiceAddonTier(data.voiceAddonTier || null);
      }
    } catch (err) {
      console.error('Error fetching voice settings:', err);
    } finally {
      setVoiceSettingsLoading(false);
    }
  };

  const handleSwitchVoiceAddon = async (tierName: VoiceAddOnName) => {
    setSwitchingAddon(tierName);
    setAddonError(null);
    try {
      const res = await authFetch('/api/voice/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceAddonTier: tierName })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update voice add-on tier');
      }
      setUpgradeSuccess(`✓ Voice add-on tier updated to ${tierName}!`);
      setVoiceAddonTier(tierName);
      await fetchVoiceSettings();
      await fetchVoiceUsage();
    } catch (err: any) {
      console.error('Error switching voice add-on:', err);
      addonError === null ? setAddonError(err.message || 'An error occurred while switching the plan.') : undefined;
    } finally {
      setSwitchingAddon(null);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchVoiceUsage();
    fetchVoiceSettings();
  }, [currentPlan]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PAID' || s === 'SUCCESSFUL' || s === 'SUCCESS') {
      return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] uppercase">Paid</span>;
    }
    if (s === 'PENDING') {
      return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-[10px] uppercase">Pending</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-extrabold text-[10px] uppercase">{status}</span>;
  };

  const formatInvoiceAmount = (amount: number, invCurrency: string) => {
    if (invCurrency === 'USD') {
      return convertAndFormat(amount);
    }
    if (invCurrency === 'XAF') {
      return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
    }
    return `${invCurrency} ${amount.toLocaleString()}`;
  };

  const limits = planLimits[normalizeKey(currentPlan)];

  const handleUpgradeClick = (planName: string) => {
    const p = plans.find(pl => pl.name === planName);
    if (p) {
      setPendingPlan(p);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async (invoiceId: string) => {
    const planRank: Record<string, number> = {
      'Free Tier': 0,
      'Starter': 1,
      'Growth': 2,
      'Enterprise': 3,
      'Agency': 4,
    };
    if (pendingPlan) {
      const oldRank = planRank[normalizeKey(currentPlan)] ?? 1;
      const newRank = planRank[normalizeKey(pendingPlan.name)] ?? 1;
      const actionWord = newRank >= oldRank ? 'upgraded' : 'downgraded';
      setUpgradeSuccess(`✓ Plan ${actionWord} to ${pendingPlan.name}!`);
    } else {
      setUpgradeSuccess('✓ Plan updated successfully!');
    }
    setUpgradeError(null);
    setShowPaymentModal(false);
    setPendingPlan(null);
    onPlanUpgrade(); // Re-fetch tenant profile
    await fetchInvoices(); // Refresh the list of invoices

    setTimeout(() => {
      setUpgradeSuccess(null);
    }, 5000);
  };

  return (
    <div className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
      {/* Top Banner Status */}
      <div className="p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-500">Plan & Subscriptions</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Active Plan: {currentPlan.endsWith('Tier') ? currentPlan : `${currentPlan} Tier`}</h2>
          <p className="text-xs text-neutral-400 font-medium">
            {isTrialActive ? 'You are currently utilizing the free trial tier. Unlock unlimited workflows anytime.' : 'Manage your plan, payment method, and billing history below.'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center md:text-right">
            <div className="text-2xl font-black text-indigo-500">{leadsCount} / {limits.leads}</div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Leads captured</div>
          </div>
          <div className="text-center md:text-right border-l pl-6" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-2xl font-black text-indigo-500">{convsCount} / {limits.convos}</div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Convos Active</div>
          </div>
        </div>
      </div>

      {/* 7E: AI VOICE SPEECH CREDITS & TELEPHONY ALLOCATIONS WIDGET */}
      <div className="p-6 md:p-8 rounded-3xl border space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">AI Add-On Telephony Metrics</span>
              <h3 className="text-sm font-black text-neutral-200">Outbound Speech Credits Allocated</h3>
            </div>
          </div>
          {voiceSettingsLoading ? (
            <span className="text-[10px] bg-neutral-800/40 text-neutral-400 border border-neutral-700/40 font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl self-start sm:self-auto">
              Loading Add-On...
            </span>
          ) : voiceAddonTier ? (
            <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl self-start sm:self-auto shadow-sm">
              {voiceAddonTier} Add-On
            </span>
          ) : (
            <span className="text-[10px] bg-neutral-800/40 text-neutral-400 border border-neutral-700/40 font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl self-start sm:self-auto">
              Add-On Not Active
            </span>
          )}
        </div>

        {/* Explanatory notice near top of section */}
        <p className="text-xs text-neutral-400 font-medium leading-relaxed bg-neutral-900/20 p-3.5 rounded-xl border border-neutral-800/50">
          The AI Voice Agent is a standalone add-on billed separately from your core NesLead subscription. It requires Super Admin approval before activation.
        </p>

        {voiceUsageLoading || voiceSettingsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs">
            <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent animate-spin rounded-full"></span>
            <span>Calculating speech duration credits & configurations...</span>
          </div>
        ) : (
          (() => {
            if (!voiceAddonTier) {
              return (
                <div className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/40 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <PhoneCall className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-200">No Voice Add-On Active</h4>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                      Subscribe to one of our premium standalone AI Voice Add-on plans below to allocate dedicated outbound call minutes and launch your customized interactive voice assistant.
                    </p>
                  </div>
                </div>
              );
            }

            const maxMins = VOICE_ADDON_PLANS[voiceAddonTier].included_minutes;
            const overageRate = VOICE_ADDON_PLANS[voiceAddonTier].overage_rate_per_min;
            const thisMonthMins = Math.round((voiceUsage?.totalMinutesThisMonth || 0) * 10) / 10;
            const remainingMins = Math.max(0, Math.round((maxMins - thisMonthMins) * 10) / 10);
            const pct = Math.min(100, Math.round((thisMonthMins / maxMins) * 100));

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="p-3 bg-neutral-900/30 rounded-xl border border-neutral-800/40">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Minutes This Month</span>
                    <span className="text-base font-extrabold text-neutral-100 font-mono">{thisMonthMins} <span className="text-xs text-neutral-500">mins</span></span>
                  </div>
                  <div className="p-3 bg-neutral-900/30 rounded-xl border border-neutral-800/40">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Plan Limit Minutes</span>
                    <span className="text-base font-extrabold text-neutral-100 font-mono">{maxMins} <span className="text-xs text-neutral-500">mins</span></span>
                  </div>
                  <div className="p-3 bg-neutral-900/30 rounded-xl border border-neutral-800/40">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Remaining Balance</span>
                    <span className="text-base font-extrabold text-amber-450 text-amber-400 font-mono">{remainingMins} <span className="text-[10px] text-amber-500/80">mins left</span></span>
                  </div>
                  <div className="p-3 bg-neutral-900/30 rounded-xl border border-neutral-800/40">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Outbound Calls Placed</span>
                    <span className="text-base font-extrabold text-neutral-100 font-mono">{voiceUsage?.totalCallsThisMonth || 0} <span className="text-xs text-neutral-500">runs</span></span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400">
                    <span>SPEECH WORKLOAD PROGRESSION INDEX ({pct}%)</span>
                    <span>All-Time Logged: {Math.round((voiceUsage?.minutesUsed || 0) * 10) / 10} voice mins</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden border border-neutral-800">
                    <div 
                      className="bg-amber-505 h-full rounded-full transition-all duration-500 ease-out animate-pulse"
                      style={{ 
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' 
                      }}
                    />
                  </div>
                  <p className="text-[9.5px] text-neutral-500 font-medium leading-relaxed">
                    Minutes consumption tracks duration from greeting answer until webhook completion. Plan renewals reset logs on the 1st of each calendar month.
                  </p>
                </div>
              </div>
            );
          })()
        )}

        {/* Voice Add-On Plans Subscription Options */}
        {!voiceSettingsLoading && (
          <div className="border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
            <div className="space-y-1.5 mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" /> Standalone Voice Add-On Subscription Tiers
              </h4>
              <p className="text-[11px] text-neutral-400">
                Choose a voice pricing add-on to allocate dedicated outbound calling limits. Billed independently from your main seat plan.
              </p>
            </div>

            {addonError && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold">
                {addonError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALID_VOICE_ADDON_NAMES.map((name) => {
                const plan = VOICE_ADDON_PLANS[name];
                const isActive = voiceAddonTier === name;
                const priceValue = plan.price_monthly;
                const convertedPrice = convertAndFormat(priceValue);
                const convertedOverage = convertAndFormat(plan.overage_rate_per_min);

                return (
                  <div
                    key={name}
                    id={`voice-addon-card-${name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`p-6 rounded-3xl border relative flex flex-col justify-between gap-6 transition-all bg-neutral-900/60 ${
                      isActive ? 'border-amber-500 bg-amber-500/[0.03] ring-1 ring-amber-500/30 shadow-md' : 'hover:border-neutral-700'
                    }`}
                    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: isActive ? undefined : 'var(--color-border)' }}
                  >
                    {isActive && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Active Add-on
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black tracking-tight text-white">{plan.name}</h3>
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20">
                            {plan.badge}
                          </span>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black tracking-tight text-white">
                            {isLoading ? (
                              <span className="inline-block w-16 h-7 bg-neutral-800 animate-pulse rounded"></span>
                            ) : (
                              convertedPrice
                            )}
                          </span>
                          <span className="text-xs text-neutral-400">/ month</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold leading-normal">{plan.description}</p>
                      </div>

                      <div className="space-y-2 border-t pt-4 border-neutral-800 text-xs">
                        <div className="flex items-start gap-2 text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span><strong className="font-extrabold text-white">{plan.included_minutes} mins</strong> included outbound</span>
                        </div>
                        <div className="flex items-start gap-2 text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span>Overage rate: <strong className="font-extrabold text-white">{isLoading ? '...' : `${convertedOverage}/min`}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`btn-voice-addon-${name.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => isActive ? undefined : handleSwitchVoiceAddon(name)}
                      disabled={isActive || switchingAddon === name}
                      className={`w-full py-3 rounded-xl font-bold text-[10px] cursor-pointer tracking-wider uppercase transition-all ${
                        isActive
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-default'
                          : 'bg-amber-500 text-black hover:opacity-90 active:scale-[0.99] font-black'
                      }`}
                    >
                      {switchingAddon === name ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-3 h-3 border-2 border-black border-t-transparent animate-spin rounded-full"></span>
                          <span>Switching...</span>
                        </span>
                      ) : isActive ? (
                        '✓ Current Add-on'
                      ) : (
                        `Switch to ${name}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4 py-3 bg-neutral-900/40 rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)' }} id="billing-cycle-toggle-container">
        <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${billingCycle === 'monthly' ? 'text-indigo-400' : 'text-neutral-400'}`}>Monthly Billing</span>
        <button
          onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
          className="relative w-12 h-6 rounded-full bg-neutral-800 border border-neutral-700 p-0.5 transition-colors cursor-pointer"
          style={{ borderColor: 'var(--color-border)' }}
          id="billing-cycle-toggle-btn"
        >
          <div
            className={`w-4 h-4 rounded-full bg-indigo-500 shadow-md transform transition-transform duration-200 ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${billingCycle === 'annual' ? 'text-indigo-400' : 'text-neutral-400'}`}>Annual Billing</span>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/20">Save 20%</span>
        </div>
      </div>

      {/* Dynamic Geolocation & Currency Indicator */}
      <div className="flex justify-center">
        <div 
          className="inline-flex flex-col sm:flex-row items-center gap-4 px-5 py-3 rounded-2xl border text-xs shadow-sm bg-neutral-900/30" 
          style={{ borderColor: 'var(--color-border)' }}
          id="billing-admin-currency-selector"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-300">
            <Globe className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>
              Auto-Detected Country: <strong className="font-bold text-zinc-100">{detectedCountry}</strong> (<span className="font-mono text-indigo-400 font-extrabold">{currency}</span>)
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-800"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Change currency:</span>
            <select 
              value={currency} 
              onChange={(e) => changeCurrencyOverride(e.target.value)}
              className="bg-zinc-900/50 border border-neutral-800 py-1 pl-2 pr-8 font-black cursor-pointer rounded-lg text-[11px] h-auto focus:ring-1 focus:ring-indigo-500/50 outline-none text-indigo-400"
            >
              {availableCurrencies.map(cur => (
                <option key={cur.code} value={cur.code} className="bg-zinc-900 text-neutral-100">
                  {cur.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {upgradeSuccess && (
        <div id="upgrade-success-alert" className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold text-center mt-2 flex items-center justify-center gap-2 animate-fade-in shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{upgradeSuccess}</span>
        </div>
      )}

      {/* Tab switcher & Single Plan Card */}
      <div className="space-y-6" id="billing-plans-switcher-section">
        {/* Tab switcher */}
        <div className="flex gap-2 overflow-x-auto justify-center pb-2 border-b border-neutral-800" id="billing-plans-tabs-container">
          {plans.map((plan, i) => (
            <button
              key={plan.name}
              id={`tab-select-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedPlanIndex(i)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedPlanIndex === i
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15'
                  : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-indigo-400'
              }`}
            >
              {plan.name}
              {normalizeKey(plan.name) === normalizeKey(currentPlan) && (
                <span className="ml-1.5 text-emerald-400">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Single plan card below */}
        <div className="max-w-md mx-auto w-full" id="single-plan-card-wrapper">
          {(() => {
            const plan = displayPlan;
            const PlanIcon = plan.icon;
            const normalize = (s: string) => s.toLowerCase().replace(' tier', '').replace(' plan', '').trim();
            const isActivePlan = normalize(plan.name) === normalize(currentPlan);
            const currentPrice = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
            const yearlySavings = (plan.price_monthly - plan.price_annual) * 12;

            return (
              <div 
                id={`plan-card-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`p-6 rounded-3xl border relative flex flex-col justify-between gap-6 transition-all bg-neutral-900/60 ${plan.popular ? 'border-indigo-500 bg-indigo-500/[0.03] ring-1 ring-indigo-500/30' : ''}`}
                style={{ backgroundColor: 'var(--color-bg-card)', borderColor: plan.popular ? undefined : 'var(--color-border)' }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500 text-white flex items-center gap-1 shadow-md">
                    <Sparkles className="w-2.5 h-2.5" /> Popular Choice
                  </span>
                )}

                {isActivePlan && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Active
                  </span>
                )}

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black tracking-tight text-white">{plan.name.endsWith('Tier') ? plan.name : `${plan.name} Tier`}</h3>
                      {plan.note && (
                        <p className="text-[10px] text-neutral-400 font-bold leading-normal">{plan.note}</p>
                      )}
                    </div>
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
                      {PlanIcon && <PlanIcon className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight text-white">
                        {isLoading ? (
                          <span className="inline-block w-20 h-9 bg-neutral-800 animate-pulse rounded"></span>
                        ) : (
                          convertAndFormat(currentPrice)
                        )}
                      </span>
                      <span className="text-xs text-neutral-400">/ month</span>
                    </div>
                    {plan.trial && plan.trial !== 'No Trial' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {plan.trial}
                        </span>
                      </div>
                    )}
                    {billingCycle === 'annual' && yearlySavings > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
                        Save {isLoading ? (
                          <span className="inline-block w-8 h-3 bg-neutral-850 animate-pulse rounded"></span>
                        ) : (
                          convertAndFormat(yearlySavings)
                        )} / year
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 border-t pt-5 border-neutral-800">
                    {plan.features.map(f => {
                      const isLocked = f.startsWith('✗');
                      const cleanFeat = isLocked ? f.substring(1).trim() : f;
                      return (
                        <div key={f} className="flex items-start gap-2 text-xs text-neutral-300" style={{ color: isLocked ? '#71717a' : undefined }}>
                          {isLocked ? (
                            <span className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5 flex items-center justify-center font-bold text-[9px]">✗</span>
                          ) : (
                            <Check className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                          )}
                          <span className={isLocked ? 'line-through opacity-60' : ''}>{cleanFeat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  id={`btn-action-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => isActivePlan ? undefined : handleUpgradeClick(plan.name)}
                  disabled={isActivePlan || upgrading === plan.name}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs cursor-pointer tracking-wider uppercase transition-all ${isActivePlan ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-indigo-500 text-white hover:opacity-90 active:scale-[0.99]'}`}
                >
                  {upgrading === plan.name
                    ? 'Processing...'
                    : isActivePlan
                    ? '✓ Current Plan'
                    : plan.name === 'Free Tier'
                    ? 'Switch to Free Tier'
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {upgradeError && (
        <div id="upgrade-error-banner" className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold text-center mt-2">
          {upgradeError}
        </div>
      )}

      {/* History log mockup */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4 text-neutral-400" /> Invoice Receipts History
        </h3>
        <div className="border rounded-xl divide-y overflow-hidden text-xs" style={{ borderColor: 'var(--color-border)', divideColor: 'var(--color-border)' }}>
          {invoicesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-neutral-800 rounded"></div>
                  <div className="w-32 h-3 bg-neutral-800 rounded"></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-4 bg-neutral-800 rounded"></div>
                  <div className="w-12 h-5 bg-neutral-800 rounded-full"></div>
                  <div className="w-4 h-4 bg-neutral-800 rounded animate-none"></div>
                </div>
              </div>
            ))
          ) : invoices.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 font-semibold text-xs py-10" id="no-invoices-prompt">
              No billing history yet.
            </div>
          ) : (
            invoices.map(inv => (
              <div key={inv.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-800/10">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-neutral-200">{inv.id}</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {inv.plan} ({(inv.billing_cycle || '').toUpperCase()})
                    </span>
                  </div>
                  <span className="text-neutral-450 text-neutral-400 text-[11px] font-medium hidden sm:inline">
                    {formatDate(inv.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold text-neutral-200">
                    {formatInvoiceAmount(inv.amount, inv.currency || 'USD')}
                  </span>
                  {getStatusBadge(inv.status)}
                  <button className="text-indigo-400 hover:text-indigo-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showPaymentModal && pendingPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingPlan(null);
          }}
          selectedPlan={pendingPlan}
          billingCycle={billingCycle}
          tenantCurrency={currency}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
