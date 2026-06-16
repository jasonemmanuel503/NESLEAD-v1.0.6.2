import React, { useState } from 'react';
import { X, Shield, AlertCircle, Save } from 'lucide-react';

interface ForcePlanChangeModalProps {
  isOpen: boolean;
  tenant: {
    id: string;
    name: string;
    plan: string;
  };
  sessionToken: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForcePlanChangeModal({
  isOpen,
  tenant,
  sessionToken,
  onClose,
  onSuccess,
}: ForcePlanChangeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(tenant.plan || 'Starter');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/tenants/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          plan: selectedPlan,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update tenant plan');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="force-plan-modal">
      <div className="relative w-full max-w-md p-6 rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-450 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Force Plan Configuration
            </h3>
            <p className="text-xs text-neutral-400">Override licensee plan and limitations for "{tenant.name}"</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/15 text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Target Tier Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-sm font-semibold text-white' cursor-pointer"
              >
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Reason for Override</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required for administrative tracking purposes"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-sm font-semibold text-white min-h-[80px]"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Force Plan Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
