import React, { useState, useEffect } from 'react';
import { 
  Phone, Shield, ShieldCheck, Key, Settings, Play, Pause, Save, 
  Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertCircle, 
  Globe, Volume2, User, RefreshCw, BarChart2, MessageSquare, Info
} from 'lucide-react';

interface VoiceSettingsProps {
  authFetch: (url: string, options?: any) => Promise<Response>;
  isSuperAdmin?: boolean;
}

export default function VoiceSettings({ authFetch, isSuperAdmin = false }: VoiceSettingsProps) {
  const [settings, setSettings] = useState({
    voiceApproved: false,
    voiceEnabled: false,
    voiceProvider: 'vapi',
    voicePhoneNumberId: '',
    voiceAgentName: 'Alex',
    voiceOpeningLine: '',
    voiceHandoffNumber: '',
    voiceMaxCallMinutes: 5,
    voiceLanguage: 'en',
    hasApiKey: false
  });

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [editingKey, setEditingKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [callsHistory, setCallsHistory] = useState<any[]>([]);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [refreshingHistory, setRefreshingHistory] = useState(false);

  // Fetch all voice settings & history on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch settings
      const settingsRes = await authFetch('/api/voice/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        setApiKeyInput(''); // don't show or mock real password key
        setEditingKey(false);
      } else {
        const err = await settingsRes.json();
        setErrorMsg(err.message || 'Failed to load voice configuration');
      }

      // 2. Fetch usage
      const usageRes = await authFetch('/api/voice/usage');
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setMinutesUsed(usageData.minutesUsed || 0);
      }

      // 3. Fetch call history
      await fetchCallHistory();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Network error while fetching details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCallHistory = async () => {
    setRefreshingHistory(true);
    try {
      const callsRes = await authFetch('/api/voice/calls');
      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setCallsHistory(callsData.calls || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingHistory(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: any = {
        voiceEnabled: settings.voiceEnabled,
        voicePhoneNumberId: settings.voicePhoneNumberId,
        voiceAgentName: settings.voiceAgentName,
        voiceOpeningLine: settings.voiceOpeningLine,
        voiceHandoffNumber: settings.voiceHandoffNumber,
        voiceMaxCallMinutes: Number(settings.voiceMaxCallMinutes),
        voiceLanguage: settings.voiceLanguage
      };

      if (apiKeyInput.trim()) {
        payload.voiceApiKey = apiKeyInput.trim();
      }

      const res = await authFetch('/api/voice/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg('Voice configuration synchronized successfully.');
        setApiKeyInput('');
        setEditingKey(false);
        // Re-fetch to get correct hasApiKey boolean
        const settingsRes = await authFetch('/api/voice/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Validation or synchronization error.');
      }
    } catch (err) {
      setErrorMsg('Network error during save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVoice = async () => {
    const nextState = !settings.voiceEnabled;
    try {
      const res = await authFetch('/api/voice/settings', {
        method: 'PATCH',
        body: JSON.stringify({ voiceEnabled: nextState })
      });
      if (res.ok) {
        setSettings(prev => ({ ...prev, voiceEnabled: nextState }));
        setSuccessMsg(`Voice agent is now ${nextState ? 'enabled' : 'disabled'}.`);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Could not change voice agent status.');
      }
    } catch (err) {
      setErrorMsg('Network error while toggling state');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-neutral-400 font-bold font-mono">LOADING VOICE ENGINE ENVIRONMENT...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Phone className="w-6 h-6 text-indigo-500" />
            AI Voice Agent Configuration
          </h1>
          <p className="text-sm text-neutral-400 font-medium">
            Configure automated outbound tele-campaign calls and real-time candidate pre-screening metrics.
          </p>
        </div>

        {/* Activate Toggle Badge */}
        {(settings.voiceApproved || isSuperAdmin) && (
          <button
            onClick={handleToggleVoice}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
              settings.voiceEnabled 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/25' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {settings.voiceEnabled ? (
              <>
                <Volume2 className="w-4.5 h-4.5 animate-pulse" />
                <span>Voice Bot Active</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4.5 h-4.5 opacity-60" />
                <span>Voice Bot Paused</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Interim Billing Gate Alert */}
      {!settings.voiceApproved && !isSuperAdmin && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 flex items-start gap-3.5">
          <Shield className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black tracking-tight">Outbound Voice Line Restricted (Approval Required)</h4>
            <p className="text-xs text-amber-500/80 leading-relaxed font-semibold">
              Outgoing tele-calls have not been unlocked for your tenant instance. Outboard automated calling incurs high platform bandwidth and VOIP costs. Please contact support or your account representative to approve voice agent activation.
            </p>
          </div>
        </div>
      )}

      {!settings.voiceApproved && isSuperAdmin && (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 flex items-start gap-3.5">
          <Shield className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-black tracking-tight">Super Admin Bypass Mode Active</h4>
            <p className="text-xs text-indigo-400/85 leading-relaxed font-semibold">
              You are logged in as a Super Admin. The voice lock has been bypassed, allowing you full configuration and outbound calling privileges by default.
            </p>
          </div>
        </div>
      )}

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border rounded-2xl space-y-2 bg-gradient-to-br" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Approved Line Access</span>
          <div className="flex items-center gap-1.5 pt-1">
            {settings.voiceApproved || isSuperAdmin ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-lg font-black text-emerald-500">
                  {settings.voiceApproved ? 'Authorized' : 'Bypassed (Super Admin)'}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-black text-amber-500 font-bold">Billing Gate Blocked</span>
              </>
            )}
          </div>
        </div>

        <div className="p-5 border rounded-2xl space-y-2 bg-gradient-to-br" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Minutes Consumed</span>
          <div className="flex items-center gap-1.5 pt-1">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="text-lg font-black font-mono">{minutesUsed.toFixed(1)} <span className="text-xs text-neutral-400">min</span></span>
          </div>
        </div>

        <div className="p-5 border rounded-2xl space-y-2 bg-gradient-to-br" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Total Voice Calls placed</span>
          <div className="flex items-center gap-1.5 pt-1">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <span className="text-lg font-black font-mono">{callsHistory.length} <span className="text-xs text-neutral-400">placed</span></span>
          </div>
        </div>
      </div>

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        
        {/* Settings column */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-12 space-y-6">
          <div className="border rounded-2xl p-5 space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              <span>Voice Setup Details</span>
            </h3>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <fieldset disabled={!settings.voiceApproved && !isSuperAdmin} className="space-y-4 w-full">
              {/* Toggle Enable Voice Add-On */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-black/10" style={{ borderColor: 'var(--color-border)' }}>
                <div className="space-y-0.5">
                  <span className="font-bold block text-xs">Enable Voice Add-On</span>
                  <span className="text-[10px] text-neutral-400 font-semibold font-mono uppercase">Activates automated outbound tele-campaigns</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.voiceEnabled ? 'bg-indigo-600' : 'bg-zinc-805'}`}
                  style={{ backgroundColor: settings.voiceEnabled ? '#4f46e5' : 'var(--color-border)' }}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.voiceEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

            {/* Private API Key */}
            <div className="space-y-1.5">
              <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                Vapi.ai Private API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    disabled={settings.hasApiKey && !editingKey}
                    value={settings.hasApiKey && !editingKey ? '●●●●●●●●●●●●●●●●' : apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Add your private vapi.ai Bearer Key..."
                    className="w-full border rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                  />
                </div>
                {settings.hasApiKey && !editingKey && (
                  <button
                    type="button"
                    onClick={() => setEditingKey(true)}
                    className="px-3.5 py-2 rounded-xl text-neutral-300 font-bold border hover:opacity-95 text-xs bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    Update Key
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">
                Your key is secured server-side and never exposed to the client. Only edit this to specify a new secret key.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telephone ID */}
              <div className="space-y-1.5">
                <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Vapi.ai Phone Number ID
                </label>
                <input
                  type="text"
                  required={settings.voiceEnabled}
                  value={settings.voicePhoneNumberId}
                  onChange={(e) => setSettings({ ...settings, voicePhoneNumberId: e.target.value })}
                  placeholder="e.g. 7fcd9183-..."
                  className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
                <p className="text-[9px] text-neutral-500">ID of the registered telephone number inside Vapi.ai dashboard.</p>
              </div>

              {/* Agent Name */}
              <div className="space-y-1.5">
                <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Voice Agent Persona Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.voiceAgentName}
                  onChange={(e) => setSettings({ ...settings, voiceAgentName: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                />
                <p className="text-[9px] text-neutral-500">Assign the voice agent persona name (e.g. Alex, Charlotte, Sarah).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Target Voice Language Channel
                </label>
                <div className="relative">
                  <select
                    value={settings.voiceLanguage}
                    onChange={(e) => setSettings({ ...settings, voiceLanguage: e.target.value })}
                    className="w-full border rounded-xl pl-3 pr-10 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold appearance-none cursor-pointer"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                  >
                    <option value="en">English (Rachel / 11Labs)</option>
                    <option value="fr">French (Charlotte / 11Labs)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[9px] text-neutral-500">Selects the spoken language and underlying accent vector.</p>
              </div>

              {/* Slider for Max Call Minutes */}
              <div className="space-y-1.5">
                <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                  Max Duration Allowed: <span className="font-mono text-indigo-400 font-extrabold">{settings.voiceMaxCallMinutes} minutes</span>
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] text-neutral-400 font-bold select-none">2m</span>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={settings.voiceMaxCallMinutes}
                    onChange={(e) => setSettings({ ...settings, voiceMaxCallMinutes: Number(e.target.value) })}
                    className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] text-neutral-400 font-bold select-none">15m</span>
                </div>
                <p className="text-[9px] text-neutral-500">Slide between 2 to 15 minutes call allowance protection.</p>
              </div>
            </div>

            {/* Opening Line textarea */}
            <div className="space-y-1.5">
              <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                Opening Line Greeting Override
              </label>
              <textarea
                value={settings.voiceOpeningLine}
                onChange={(e) => setSettings({ ...settings, voiceOpeningLine: e.target.value })}
                placeholder="Leave blank to use the default auto-generated opening line"
                rows={3}
                className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold resize-none"
                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
              />
              <p className="text-[10px] text-neutral-500 leading-normal">
                Placeholders supported: <code className="font-mono text-[9px] bg-neutral-800 text-neutral-400/90 px-1 py-0.5 rounded">{"{lead_name}"}</code>, <code className="font-mono text-[9px] bg-neutral-800 text-neutral-400/90 px-1 py-0.5 rounded">{"{firm_name}"}</code>.
              </p>
            </div>

            {/* Handoff number */}
            <div className="space-y-1.5">
              <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                Handoff Transfer Number (Human Transfer)
              </label>
              <input
                type="text"
                value={settings.voiceHandoffNumber}
                onChange={(e) => setSettings({ ...settings, voiceHandoffNumber: e.target.value })}
                placeholder="e.g. +1234567890"
                className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold font-mono"
                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: 'var(--color-border)' }}
              />
              <p className="text-[9px] text-neutral-500">Optional: The call will transfer here if the lead requests a human operator.</p>
            </div>

             {/* Save Button */}
            <button
              type="submit"
              disabled={saving || (!settings.voiceApproved && !isSuperAdmin)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-accent ${(!settings.voiceApproved && !isSuperAdmin) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ background: 'var(--accent-gradient)' }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Synchronizing API Parameters...' : 'Save Voice Agent Settings'}</span>
            </button>
            </fieldset>
          </div>
        </form>

        {/* Global info column for instructions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border rounded-2xl p-5 space-y-4 text-xs font-semibold leading-relaxed" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
              <Info className="w-4 h-4" />
              <span>VOICE AGENT COMPILER ENVIRONMENT</span>
            </h3>
            
            <p className="text-neutral-400">
              Our automated voice agent incorporates live pre-screening data and executes natural dialog campaigns using Vapi.ai VOIP systems and Google Gemini models.
            </p>

            <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <span className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wide">Live Dynamic Contextual Prompts:</span>
              <ul className="list-disc pl-4 space-y-2 text-neutral-400">
                <li><strong>Lead Identity:</strong> Infuses target name, interest score, program selection and demographic history directly into prompt vectors.</li>
                <li><strong>Course Offerings:</strong> Passes top 4 educational program listings automatically.</li>
                <li><strong>FAQ Knowledge chunks:</strong> Attaches 6 prompt FAQs to handle intake queries locally.</li>
                <li><strong>KB Semantic Context:</strong> Injects most matching chunks from your general knowledge base files dynamically during init.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Historical voice calls board */}
      <div className="border rounded-2xl p-5 space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-500" />
            Outgoing Tele-Campaign logs
          </h3>
          <button 
            onClick={fetchCallHistory}
            disabled={refreshingHistory}
            className="p-1 px-3.5 border rounded-xl hover:opacity-85 text-[10px] font-bold cursor-pointer transition flex items-center gap-1 text-neutral-400"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <RefreshCw className={`w-3 h-3 ${refreshingHistory ? 'animate-spin' : ''}`} />
            Refresh Records
          </button>
        </div>

        {callsHistory.length === 0 ? (
          <div className="p-8 border rounded-2xl border-dashed text-center space-y-1" style={{ borderColor: 'var(--color-border)' }}>
            <Phone className="w-8 h-8 mx-auto opacity-20 text-neutral-400" />
            <h4 className="font-extrabold text-neutral-400">No voice calls placed yet</h4>
            <p className="text-[10px] text-neutral-500 font-medium max-w-xs mx-auto">Open the verified dossier of any lead from the Leads dashboard and click 'Outbound Voice Call' to initiate.</p>
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-xl border text-xs" style={{ borderColor: 'var(--color-border)' }}>
            {callsHistory.map((call: any) => {
              const dateStr = call.initiated_at ? new Date(call.initiated_at).toLocaleDateString() + ' ' + new Date(call.initiated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown date';
              const isExpanded = expandedCallId === call.id;

              return (
                <div key={call.id} className="transition-all" style={{ backgroundColor: isExpanded ? 'var(--color-bg-secondary)' : 'transparent' }}>
                  <div 
                    onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-3 cursor-pointer hover:bg-neutral-800/10 transition-colors"
                  >
                    <div className="space-y-1 select-none">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-300 text-sm">{call.lead_name || 'Anonymous Lead'}</span>
                        <span className="font-serif text-[10px] text-neutral-500 font-mono">({call.lead_phone || 'No phone'})</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono">Placed on: {dateStr} • Initiated by: {call.initiated_by || 'system'}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Duration */}
                      {call.duration_seconds > 0 && (
                        <span className="font-mono text-[10px] font-bold text-neutral-400 select-all">
                          {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                        </span>
                      )}

                      {/* Status badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-center tracking-wider ${
                        call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                        call.status === 'initiated' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                        'bg-red-500/10 text-red-400 border border-red-500/25'
                      }`}>
                        {call.status}
                      </span>

                      {/* Outcome badge */}
                      {call.status === 'completed' && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-center tracking-wider ${
                          call.outcome === 'booked' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25' :
                          call.outcome === 'interested' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                          call.outcome === 'callback-requested' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          call.outcome === 'no-answer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {call.outcome?.replace('-', ' ')}
                        </span>
                      )}

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                    </div>
                  </div>

                  {/* Expand panel showing transcript details */}
                  {isExpanded && (
                    <div className="p-5 border-t space-y-4 bg-zinc-950/20 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                      {/* Summary Block */}
                      {call.summary && (
                        <div className="space-y-1.5 p-3.5 rounded-xl border bg-black/10 text-neutral-300 font-semibold" style={{ borderColor: 'var(--color-border)' }}>
                          <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">AI Conversation Summary:</span>
                          <p className="leading-relaxed text-xs">{call.summary}</p>
                        </div>
                      )}

                      {/* Transcript dialog block */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">Real-time Conversational Transcript:</span>
                        
                        {call.transcript ? (
                          <div className="p-4 rounded-xl border bg-black/20 font-sans max-h-60 overflow-y-auto space-y-3 leading-relaxed" style={{ borderColor: 'var(--color-border)' }}>
                            {call.transcript.split('\n').map((line: string, i: number) => {
                              const isUserLine = line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('customer:');
                              const isAgentLine = line.toLowerCase().startsWith('assistant:') || line.toLowerCase().startsWith('agent:') || line.toLowerCase().startsWith('ai:');
                              
                              let bubbleStyle: React.CSSProperties = { color: 'var(--color-text-secondary)' };
                              let bubbleClass = 'p-2.5 rounded-lg max-w-[85%] text-xs';
                              let wrapperClass = 'flex w-full justify-start';

                              if (isUserLine) {
                                bubbleClass += ' bg-zinc-800 text-neutral-200 ml-auto';
                                wrapperClass = 'flex w-full justify-end';
                              } else if (isAgentLine) {
                                bubbleClass += ' bg-indigo-950/35 border border-indigo-500/15 text-neutral-200';
                              }

                              return (
                                <div key={i} className={wrapperClass}>
                                  <div className={bubbleClass}>
                                    <p className="font-semibold break-words">{line}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-neutral-500 italic font-semibold">Transcript is being processed by Vapi or was not populated for this call duration.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
