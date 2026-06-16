import React from 'react';
import { X, Shield, Mail, Calendar, Key, AlertCircle } from 'lucide-react';

interface TenantDetailDrawerProps {
  tenant: any;
  sessionToken: string | null;
  onClose: () => void;
}

export default function TenantDetailDrawer({ tenant, sessionToken, onClose }: TenantDetailDrawerProps) {
  if (!tenant) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in" id="tenant-detail-drawer">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative w-full max-w-lg h-full bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slide-in">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Tenant Registry Dossier
              </h3>
              <p className="text-xs text-neutral-400">System metadata view representing real-time configuration</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-450 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Status overview card */}
            <div className="p-4 rounded-xl border border-neutral-805 bg-neutral-950/50 space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500">Tier License</span>
              <div className="text-lg font-black tracking-tight text-indigo-400 uppercase">{tenant.plan || 'Starter'}</div>
              <div className="text-xs text-neutral-300">
                Type: {tenant.is_trial ? '⏳ Trial License' : '💳 Paid Contract'}
              </div>
            </div>

            {/* General Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-550 block">Tenant Identifier</span>
                <span className="text-xs font-mono text-neutral-200 bg-neutral-950 px-2 py-1 rounded block truncate select-all">{tenant.id}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-550 block">Registered Email</span>
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {tenant.email || 'N/A'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-550 block">Created On</span>
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-550 block">Integration Widget Key</span>
                <span className="text-xs font-mono text-neutral-200 bg-neutral-950 px-2 py-1 rounded block truncate select-all">{tenant.widget_key || 'Not Provisioned'}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-xs font-bold text-center text-white transition-all cursor-pointer"
        >
          Dismiss Dossier
        </button>
      </div>
    </div>
  );
}
