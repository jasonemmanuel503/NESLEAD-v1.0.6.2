import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Server, 
  Database, 
  Key, 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Settings, 
  Search, 
  Filter, 
  Building, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  HelpCircle,
  Eye,
  Edit2,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { CANONICAL_PLANS, normalizePlanName, VALID_PLAN_NAMES } from '../lib/plans';
import TenantDetailDrawer from './superadmin/TenantDetailDrawer';
import ForcePlanChangeModal from './superadmin/ForcePlanChangeModal';

interface SuperAdminPanelProps {
  sessionToken: string | null;
  exitFormHeadline?: any;
  exitFormBody?: any;
  exitFormBtnLabel?: any;
  onSaveExitForm?: (headline: any, body: any, btnLabel: any) => Promise<void>;
}

export default function SuperAdminPanel({ sessionToken }: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'payments' | 'settings' | 'my_team'>('overview');
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d' | 'thismonth'>('all');

  const [selectedTenantForDetail, setSelectedTenantForDetail] = useState<any | null>(null);
  const [selectedTenantForPlan, setSelectedTenantForPlan] = useState<any | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  // Platform admin states
  const [myRole, setMyRole] = useState<string | null>(null);
  const [platformAdmins, setPlatformAdmins] = useState<any[]>([]);
  const [platformAdminsLoading, setPlatformAdminsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'SUPPORT_AGENT' | 'FINANCE_ADMIN' | 'SALES_AGENT' | 'PLATFORM_MANAGER'>('SUPPORT_AGENT');
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // Bank transfer details states
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaveMsg, setBankSaveMsg] = useState('');

  const loadBankSettings = async () => {
    try {
      const res = await adminFetch('/api/superadmin/bank-settings');
      if (res.ok) {
        const data = await res.json();
        setBankName(data.bankName || '');
        setBankAccountNumber(data.bankAccountNumber || '');
        setBankAccountName(data.bankAccountName || '');
      }
    } catch (err) {
      console.error('Error loading bank settings:', err);
    }
  };

  const saveBankSettings = async () => {
    setBankSaving(true);
    setBankSaveMsg('');
    try {
      const res = await adminFetch('/api/superadmin/bank-settings', {
        method: 'POST',
        body: JSON.stringify({
          bankName,
          bankAccountNumber,
          bankAccountName,
        }),
      });
      if (res.ok) {
        setBankSaveMsg('✓ Bank details saved successfully!');
        // Clear message after 3 seconds
        setTimeout(() => setBankSaveMsg(''), 3000);
      } else {
        const errDetail = await res.json();
        setBankSaveMsg(`Error: ${errDetail.error || errDetail.message || 'Failed to save bank details.'}`);
      }
    } catch (err: any) {
      console.error('Error saving bank settings:', err);
      setBankSaveMsg(`Error: ${err.message || 'An error occurred.'}`);
    } finally {
      setBankSaving(false);
    }
  };

  const handleToggleSuspend = async (tenant: any) => {
    const isSuspended = tenant.is_suspended === 1;
    const actionWord = isSuspended ? 'reactivate' : 'suspend';
    
    let reason = '';
    if (!isSuspended) {
      const inputReason = prompt('Enter a reason for suspending this tenant:', 'Violation of terms of service');
      if (inputReason === null) return; // User cancelled
      reason = inputReason.trim() || 'Suspended by admin';
    } else {
      if (!confirm('Are you sure you want to reactivate this tenant?')) return;
    }

    setSuspendingId(tenant.id);
    try {
      const endpoint = isSuspended 
        ? `/api/superadmin/tenant/${tenant.id}/reactivate`
        : `/api/superadmin/tenant/${tenant.id}/suspend`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        await loadData();
      } else {
        const error = await res.json();
        alert(error.error || error.message || `Failed to ${actionWord} tenant.`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setSuspendingId(null);
    }
  };

  const adminFetch = (url: string, options: any = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': sessionToken ? `Bearer ${sessionToken}` : '',
    };
    return fetch(url, { ...options, headers });
  };

  const loadData = async () => {
    setTenantsLoading(true);
    setInvoicesLoading(true);
    try {
      const tenantsRes = await adminFetch('/api/superadmin/tenants');
      if (tenantsRes.ok) {
        const data = await tenantsRes.json();
        setTenants(data.tenants || []);
      }

      const invoicesRes = await adminFetch('/api/superadmin/invoices');
      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Error loading super admin data:', err);
    } finally {
      setTenantsLoading(false);
      setInvoicesLoading(false);
    }
  };

  const fetchMyRole = async () => {
    try {
      const res = await adminFetch('/api/superadmin/my-role');
      if (res.ok) {
        const data = await res.json();
        setMyRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching platform role:', err);
    }
  };

  const fetchPlatformAdmins = async () => {
    setPlatformAdminsLoading(true);
    try {
      const res = await adminFetch('/api/superadmin/platform-admins');
      if (res.ok) {
        const data = await res.json();
        setPlatformAdmins(data.admins || []);
      }
    } catch (err) {
      console.error('Error fetching platform admins:', err);
    } finally {
      setPlatformAdminsLoading(false);
    }
  };

  const handleAddPlatformAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setSubmittingAdmin(true);
    try {
      const res = await adminFetch('/api/superadmin/platform-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          role: newAdminRole,
        }),
      });
      if (res.ok) {
        setNewAdminEmail('');
        fetchPlatformAdmins();
      } else {
        const err = await res.json();
        alert(err.error || err.message || 'Failed to add team member');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleDeactivatePlatformAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to deactivate ${email}? They will lose super admin access immediately.`)) {
      return;
    }
    try {
      const res = await adminFetch(`/api/superadmin/platform-admins/${id}/deactivate`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchPlatformAdmins();
      } else {
        const err = await res.json();
        alert(err.error || err.message || 'Failed to deactivate team member');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  useEffect(() => {
    loadData();
    fetchMyRole();
    loadBankSettings();
  }, [sessionToken]);

  // Fetch invoices when payments tab becomes active (Task 2.9)
  useEffect(() => {
    if (activeTab === 'payments') {
      const fetchInvoices = async () => {
        setInvoicesLoading(true);
        try {
          const res = await adminFetch('/api/superadmin/invoices');
          if (res.ok) {
            const data = await res.json();
            setInvoices(data.invoices || []);
          }
        } catch (err) {
          console.error('Error loading invoices in tab transition:', err);
        } finally {
          setInvoicesLoading(false);
        }
      };
      fetchInvoices();
    }
  }, [activeTab, sessionToken]);

  useEffect(() => {
    if (activeTab === 'my_team') {
      fetchPlatformAdmins();
    }
  }, [activeTab, myRole, sessionToken]);

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to mark this invoice as paid manually? This will activate the corresponding plan levels and notify tracking systems.')) {
      return;
    }
    setMarkingPaidId(invoiceId);
    try {
      const res = await adminFetch(`/api/superadmin/invoice/${invoiceId}/mark-paid`, {
        method: 'POST'
      });
      if (res.ok) {
        // Reload all data so stats and tables immediately reflect the update
        await loadData();
      } else {
        const errDetail = await res.json();
        alert(errDetail.error || errDetail.message || 'Failed to update invoice status.');
      }
    } catch (err) {
      console.error('Error marking invoice paid:', err);
      alert('An error occurred while marking the invoice as paid.');
    } finally {
      setMarkingPaidId(null);
    }
  };

  // Compute Platform Metrics
  const totalTenants = tenants.length;
  
  const activePaidTenants = tenants.filter(t => {
    const planName = normalizePlanName(t.plan);
    return planName !== 'Free Tier';
  }).length;

  const mrr = tenants.reduce((sum, t) => {
    const planName = normalizePlanName(t.plan);
    if (planName === 'Free Tier') return sum;
    const price = CANONICAL_PLANS[planName]?.price_monthly ?? 0;
    return sum + price;
  }, 0);

  const arr = mrr * 12;

  const recentlyJoined = [...tenants]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PAID' || s === 'SUCCESSFUL' || s === 'SUCCESS') {
      return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/15">Paid</span>;
    }
    if (s === 'PENDING') {
      return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase border border-amber-500/15 font-mono">Pending</span>;
    }
    if (s === 'FAILED') {
      return <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold text-[10px] uppercase border border-red-500/15">Failed</span>;
    }
    if (s === 'REFUNDED') {
      return <span className="px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-400 font-bold text-[10px] uppercase border border-neutral-500/15">Refunded</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-450 font-bold text-[10px] uppercase border border-neutral-500/15">{status}</span>;
  };

  // Filter Tenants for the Tenants List
  let hiddenMissingDateCount = 0;
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.bot_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.vertical || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPlan = true;
    if (planFilter !== 'all') {
      const normPlan = normalizePlanName(t.plan).toLowerCase();
      if (planFilter === 'trial') {
        matchesPlan = t.is_trial === 1;
      } else {
        matchesPlan = normPlan === planFilter.toLowerCase();
      }
    }

    if (matchesSearch && matchesPlan) {
      if (dateFilter !== 'all' && !t.created_at) {
        console.warn("Tenant missing registration date, excluded from filtering:", t.id || t.email);
        hiddenMissingDateCount++;
        return false;
      }
    }

    // NEW: date range match
    let matchesDate = true;
    if (dateFilter !== 'all' && t.created_at) {
      const created = new Date(t.created_at).getTime();
      const now = Date.now();
      if (dateFilter === '7d') matchesDate = now - created <= 7 * 24 * 60 * 60 * 1000;
      else if (dateFilter === '30d') matchesDate = now - created <= 30 * 24 * 60 * 60 * 1000;
      else if (dateFilter === '90d') matchesDate = now - created <= 90 * 24 * 60 * 60 * 1000;
      else if (dateFilter === 'thismonth') {
        const d = new Date(t.created_at);
        const n = new Date();
        matchesDate = d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
      }
    }

    return matchesSearch && matchesPlan && matchesDate;
  });

  return (
    <div className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            Super Administrator Control Panel
          </h1>
          <p className="text-xs text-neutral-400 font-semibold tracking-wide">
            Platform-wide analytics, tenant databases, payment audits, and active engine states.
          </p>
        </div>
        <button 
          onClick={loadData}
          disabled={tenantsLoading || invoicesLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-neutral-300 hover:text-white transition duration-150 text-xs font-bold shrink-0"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(tenantsLoading || invoicesLoading) ? 'animate-spin text-neutral-500' : ''}`} />
          Reload Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto scroller-none" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { id: 'overview', name: 'Overview', icon: TrendingUp },
          { id: 'tenants', name: 'Tenants', icon: Users },
          { id: 'payments', name: 'Payments', icon: CreditCard },
          { id: 'settings', name: 'Settings', icon: Settings },
          ...(myRole === 'PLATFORM_OWNER' ? [{ id: 'my_team', name: 'My Team', icon: Shield }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black text-xs tracking-wider uppercase transition-all duration-150 shrink-0 cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {tenantsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl border animate-pulse space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <div className="w-24 h-3 bg-neutral-800 rounded"></div>
                    <div className="w-16 h-8 bg-neutral-800 rounded"></div>
                    <div className="w-32 h-2.5 bg-neutral-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Tenants', value: totalTenants, sub: 'Registered domains' },
                  { label: 'Active Subscriptions', value: activePaidTenants, sub: `${((activePaidTenants / Math.max(1, totalTenants)) * 100).toFixed(1)}% Conversion Rate` },
                  { label: 'Estimated MRR', value: `$${mrr.toLocaleString()}`, sub: 'Monthly Recurring Revenue' },
                  { label: 'Estimated ARR', value: `$${arr.toLocaleString()}`, sub: 'Annual Rate Run-estimate' },
                ].map((card, i) => (
                  <div key={i} className="p-6 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{card.label}</span>
                      <div className="text-3xl font-black mt-2 tracking-tight text-neutral-200">{card.value}</div>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-bold mt-2 uppercase tracking-wide">{card.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recently Joined */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-neutral-200">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Recently Joined
                </h3>
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase">Last 5 registrations</span>
              </div>

              {tenantsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-neutral-800/20 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : recentlyJoined.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs font-semibold">No tenants joined yet.</div>
              ) : (
                <div className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                  {recentlyJoined.map((t, i) => {
                    const normPlan = normalizePlanName(t.plan);
                    return (
                      <div key={t.id} className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-neutral-800/10 px-2 rounded-lg -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-neutral-400 bg-neutral-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                            {i + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-neutral-200">{t.email}</span>
                            <span className="text-[10px] text-neutral-450 text-neutral-450 text-neutral-500 font-semibold uppercase">
                              {t.bot_name || 'No Assistant'} {t.vertical ? `· ${t.vertical}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border`} style={{ color: t.badgeColor || '#6B7280', borderColor: `${t.badgeColor || '#6B7280'}20`, backgroundColor: `${t.badgeColor || '#6B7280'}08` }}>
                            {normPlan}
                          </span>
                          <span className="text-neutral-400 font-semibold text-[11px]">
                            {formatDate(t.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Environment Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-500" />
                  System environment
                </h3>
                <div className="space-y-3.5 text-xs font-bold">
                  <div className="flex justify-between items-center py-1 border-b border-neutral-800/50">
                    <span className="text-neutral-450">Active Runtime</span>
                    <span className="font-mono text-indigo-400">Node.js + Express + Vite</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-800/50">
                    <span className="text-neutral-450">Persistence Engine</span>
                    <span className="font-mono text-indigo-400">SQLite (better-sqlite3)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-450">Sandbox Status</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      CONNECTED
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  Active Token Auth Key
                </h3>
                <div className="space-y-2">
                  <div className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest leading-none">Security context payload</div>
                  <div className="p-3 bg-neutral-900/60 rounded-xl font-mono text-[10px] break-all border border-neutral-800 text-neutral-400 font-bold leading-normal">
                    {sessionToken || 'No superadmin token bound in localStorage'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TENANTS */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Search and filter controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search tenants by email, assistant name, ID, or vertical..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-900/40 border rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={planFilter}
                      onChange={e => setPlanFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 bg-neutral-900/40 border rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[120px]"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <option value="all">All Plans</option>
                      <option value="trial">Active Trials</option>
                      {VALID_PLAN_NAMES.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <Filter className="absolute right-3 top-3 w-3 h-3 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Date Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'all', label: 'All Time' },
                  { key: '7d', label: 'Last 7 Days' },
                  { key: '30d', label: 'Last 30 Days' },
                  { key: '90d', label: 'Last 90 Days' },
                  { key: 'thismonth', label: 'This Month' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDateFilter(key)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border transition-colors cursor-pointer ${
                      dateFilter === key
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        : 'text-neutral-400 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {hiddenMissingDateCount > 0 && (
                <div className="text-[11px] font-bold text-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 flex items-center gap-1.5 transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>{hiddenMissingDateCount} tenant{hiddenMissingDateCount !== 1 ? 's' : ''} have no registration date and are hidden in this filter.</span>
                </div>
              )}
            </div>

            {/* Tenant list */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                  Registered Tenants ({filteredTenants.length})
                </h3>
              </div>

              {tenantsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-800/20 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs font-semibold">
                  No tenants matches the search parameters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Tenant Name</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Owner Email</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Plan</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Created Date</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                      {filteredTenants.map(t => {
                        const tenantName = t.bot_name || (t.email ? t.email.split('@')[0].charAt(0).toUpperCase() + t.email.split('@')[0].slice(1) : `Tenant ${t.id.slice(0, 5)}`);
                        
                        // Plan Badge Mapping
                        const planName = normalizePlanName(t.plan);
                        const planNameLower = planName.toLowerCase();
                        let planColorClass = "bg-neutral-500/10 text-neutral-400 border-neutral-500/15"; // Free (grey)
                        if (planNameLower === 'starter') {
                          planColorClass = "bg-blue-500/10 text-blue-400 border-blue-500/15"; // Blue
                        } else if (planNameLower === 'professional' || planNameLower === 'pro') {
                          planColorClass = "bg-purple-500/10 text-purple-400 border-purple-500/15"; // Purple
                        } else if (planNameLower === 'agency') {
                          planColorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"; // Green
                        }

                        // Status Badge Mapping
                        let statusBadge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                            Active
                          </span>
                        );
                        if (t.is_suspended === 1) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/15">
                              Suspended
                            </span>
                          );
                        } else if (t.is_trial === 1) {
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/15">
                              Trial
                            </span>
                          );
                        }

                        return (
                          <tr key={t.id} className="hover:bg-neutral-800/10 transition-colors">
                            <td className="py-4 font-bold text-neutral-200">
                              {tenantName}
                            </td>
                            <td className="py-4 font-medium text-neutral-300">
                              {t.email}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${planColorClass}`}>
                                {planName}
                              </span>
                            </td>
                            <td className="py-4">
                              {statusBadge}
                            </td>
                            <td className="py-4 text-neutral-400 font-medium text-[11px]">
                              {formatDate(t.created_at)}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                                <button
                                  onClick={() => setSelectedTenantForDetail(t)}
                                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/60 text-neutral-300 hover:text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => setSelectedTenantForPlan(t)}
                                  className="px-2 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/15 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="Change Plan"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Plan</span>
                                </button>
                                <button
                                  onClick={() => handleToggleSuspend(t)}
                                  disabled={suspendingId === t.id}
                                  className={`px-2 py-1 border rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                    t.is_suspended === 1
                                      ? 'bg-emerald-600/10 hover:bg-emerald-600/20 border-emerald-500/15 text-emerald-400 hover:text-emerald-300'
                                      : 'bg-red-650/10 hover:bg-red-650/20 border-red-500/15 text-red-400 hover:text-red-350'
                                  }`}
                                  title={t.is_suspended ===  1 ? 'Reactivate Tenant' : 'Suspend Tenant'}
                                >
                                  {t.is_suspended === 1 ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  <span>{t.is_suspended === 1 ? 'Reactivate' : 'Suspend'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-neutral-200">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  System Payment Audits
                </h3>
                <span className="text-[10px] text-neutral-500 font-extrabold uppercase">All invoice records</span>
              </div>

              {invoicesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-800/20 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs font-semibold">
                  No payment billing invoice records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Tenant Name</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Invoice ID</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Plan</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Amount</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Currency</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Gateway</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Date</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                      {invoices.map(inv => {
                        const tenantDisplayName = inv.tenant_name || inv.tenant_email || `ID: ${inv.tenant_id?.slice(0, 8)}`;
                        const isPendingBank = inv.status?.toUpperCase() === 'PENDING' && 
                          (inv.payment_gateway || '').toLowerCase().includes('bank');

                        return (
                          <tr key={inv.id} className="hover:bg-neutral-800/10 transition-colors">
                            <td className="py-4 font-bold text-neutral-200">
                              {tenantDisplayName}
                            </td>
                            <td className="py-4 font-mono text-neutral-400 text-[10px]">{inv.id}</td>
                            <td className="py-4 text-neutral-400 font-semibold uppercase">
                              {inv.plan} ({inv.billing_cycle || 'monthly'})
                            </td>
                            <td className="py-4 font-bold text-neutral-200">
                              {inv.currency === 'USD' ? `$${inv.amount}` : inv.amount.toLocaleString()}
                            </td>
                            <td className="py-4 font-mono text-neutral-400 font-bold uppercase">{inv.currency || 'USD'}</td>
                            <td className="py-4">{getStatusBadge(inv.status)}</td>
                            <td className="py-4 text-neutral-400 font-bold font-mono text-[11px] uppercase">
                              {inv.payment_gateway || 'paypal'}
                            </td>
                            <td className="py-4 text-neutral-400 font-semibold text-[11px]">
                              {formatDate(inv.created_at)}
                            </td>
                            <td className="py-4 text-right">
                              {isPendingBank && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPaid(inv.id)}
                                  disabled={markingPaidId === inv.id}
                                  className="px-2 py-1 bg-emerald-650/10 hover:bg-emerald-600/20 border border-emerald-500/15 text-emerald-400 hover:text-emerald-355 rounded-lg transition-all text-[11px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  {markingPaidId === inv.id ? 'Marking...' : 'Mark as Paid'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Plan pricing display */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                  Global Plan Tariffs config
                </h3>
              </div>
              <p className="text-[11px] text-neutral-450 text-neutral-400">
                These are the system-wide core plan details currently defined in our canonical plans package. Editing configurations will be enabled in subsequent developer phases.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {VALID_PLAN_NAMES.map(name => {
                  const plan = CANONICAL_PLANS[name];
                  return (
                    <div key={name} className="p-4 rounded-xl border space-y-2 text-xs" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <div className="font-extrabold text-neutral-200">{plan.name}</div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-[11px]">
                          <span className="text-neutral-500">Monthly</span>
                          <span className="text-neutral-300">${plan.price_monthly}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-[11px]">
                          <span className="text-neutral-500">Annual</span>
                          <span className="text-neutral-300">${plan.price_annual}/mo</span>
                        </div>
                        <div className="flex justify-between font-semibold text-[11px]">
                          <span className="text-neutral-500">Trial days</span>
                          <span className="text-neutral-300">{plan.trial}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bank details editable config */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                  Manual Bank Transfer details
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400">
                Set your offline bank transfer details. These values are shown to clients who choose the Manual Bank Transfer payment option.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Bank Name', value: bankName, setter: setBankName, placeholder: 'e.g. Afriland First Bank' },
                  { label: 'Account Number', value: bankAccountNumber, setter: setBankAccountNumber, placeholder: 'e.g. 00012345678' },
                  { label: 'Account Name', value: bankAccountName, setter: setBankAccountName, placeholder: 'e.g. NesLead Technologies' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label} className="p-4 rounded-xl border space-y-1.5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <label className="text-[10px] text-neutral-500 font-extrabold uppercase">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-xl border bg-zinc-900 border-neutral-700 text-xs text-neutral-200 outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>
                ))}
              </div>

              {bankSaveMsg && (
                <p className={`text-[11px] font-bold mt-1 ${bankSaveMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{bankSaveMsg}</p>
              )}

              <button
                type="button"
                onClick={saveBankSettings}
                disabled={bankSaving}
                className="mt-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {bankSaving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: MY TEAM (PLATFORM ADMINS) */}
        {activeTab === 'my_team' && myRole === 'PLATFORM_OWNER' && (
          <div className="space-y-6">
            {/* Add platform admin form */}
            <div className="p-6 rounded-2xl border space-y-4 font-sans" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                  Add New Platform Admin
                </h3>
              </div>
              <form onSubmit={handleAddPlatformAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border bg-zinc-900 border-neutral-700 text-xs text-neutral-200 outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                    Platform Role
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-zinc-900 border-neutral-700 text-xs text-neutral-200 outline-none focus:border-indigo-500 transition duration-150"
                  >
                    <option value="SUPPORT_AGENT">Support Agent</option>
                    <option value="FINANCE_ADMIN">Finance Admin</option>
                    <option value="SALES_AGENT">Sales Agent</option>
                    <option value="PLATFORM_MANAGER">Platform Manager</option>
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1.5 font-semibold leading-relaxed">
                    {newAdminRole === 'SUPPORT_AGENT' && 'View-only: leads, tenants, conversations. No plan changes or suspensions.'}
                    {newAdminRole === 'FINANCE_ADMIN' && 'View invoices and payments. Cannot modify plans or suspend tenants.'}
                    {newAdminRole === 'SALES_AGENT' && 'View leads and tenants. Can add notes. No billing or admin actions.'}
                    {newAdminRole === 'PLATFORM_MANAGER' && 'Full access except super admin PIN actions and bank config.'}
                  </p>
                </div>
                <div className="md:pt-6">
                  <button
                    type="submit"
                    disabled={submittingAdmin}
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-xl font-extrabold text-xs transition duration-150 uppercase tracking-wider cursor-pointer"
                  >
                    {submittingAdmin ? 'Adding...' : 'Add Team Member'}
                  </button>
                </div>
              </form>
            </div>

            {/* List current platform admins */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                    Platform Team Members
                  </h3>
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/15">
                  {platformAdmins.length} Connected
                </span>
              </div>

              {platformAdminsLoading ? (
                <div className="py-10 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-xs text-neutral-500 font-bold">Loading platform team...</span>
                </div>
              ) : platformAdmins.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs font-semibold">
                  No managed platform team members registered.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Email</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Role</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">Created At</th>
                        <th className="pb-3 text-neutral-400 font-extrabold uppercase tracking-wider text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                      {platformAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-neutral-800/10 transition-colors">
                          <td className="py-4 font-bold text-neutral-200">{admin.email}</td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase font-bold border border-indigo-500/15">
                              {admin.role}
                            </span>
                          </td>
                          <td className="py-4">
                            {admin.is_active === 1 ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/15">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold text-[10px] uppercase border border-red-500/15">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-neutral-400 font-semibold text-[11px]">
                            {formatDate(admin.created_at)}
                          </td>
                          <td className="py-4 text-right">
                            {admin.is_active === 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeactivatePlatformAdmin(admin.id, admin.email)}
                                className="px-2 p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 hover:text-red-300 rounded-lg transition-all text-[11px] font-bold cursor-pointer"
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Detail Drawer & Modals */}
      {selectedTenantForDetail && (
        <TenantDetailDrawer
          tenant={selectedTenantForDetail}
          sessionToken={sessionToken}
          onClose={() => setSelectedTenantForDetail(null)}
        />
      )}

      {selectedTenantForPlan && (
        <ForcePlanChangeModal
          isOpen={!!selectedTenantForPlan}
          tenant={{
            id: selectedTenantForPlan.id,
            name: selectedTenantForPlan.bot_name || (selectedTenantForPlan.email ? selectedTenantForPlan.email.split('@')[0] : 'Tenant'),
            plan: selectedTenantForPlan.plan
          }}
          sessionToken={sessionToken}
          onClose={() => setSelectedTenantForPlan(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
