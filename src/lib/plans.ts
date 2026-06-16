export type PlanName = 'Free Tier' | 'Starter' | 'Growth' | 'Enterprise' | 'Agency';

export const VALID_PLAN_NAMES: readonly PlanName[] = ['Free Tier', 'Starter', 'Growth', 'Enterprise', 'Agency'] as const;

export const CANONICAL_PLANS: Record<PlanName, { name: PlanName; price_monthly: number; price_annual: number; features: string[]; trial?: string; note?: string }> & Record<string, { name: PlanName; price_monthly: number; price_annual: number; features: string[]; trial?: string; note?: string }> = {
  'Free Tier': {
    name: 'Free Tier',
    price_monthly: 0,
    price_annual: 0,
    trial: 'No Trial',
    note: 'Get started for free',
    features: [
      '1 website widget',
      '50 AI conversations (lifetime pool)',
      'Basic lead capture (10 leads / month)',
      'Basic dashboard & lead list',
      '1 knowledge base file (Docx only, 500 KB)',
      'Community + email support',
      'EN / FR language switching',
      '✗ Appointment scheduling (locked)',
      '✗ Human handoff (locked)',
      '✗ Auto-triggers & WhatsApp (locked)',
      '✗ Geographic analytics (locked)',
      '✗ Reports & export (locked)',
      '✗ Team members — solo only (locked)',
      '✗ Integrations & webhooks (locked)',
      '✗ White-labeling (locked)',
    ]
  },
  'Starter': {
    name: 'Starter',
    price_monthly: 36,
    price_annual: 29,
    trial: '3-Day Free Trial',
    note: 'Essential tools for newer startups',
    features: [
      '1 website widget',
      '500 AI conversations / month',
      'Full lead capture form (200 leads / month)',
      'Full dashboard metrics & lead list',
      '1 knowledge base file (PDF / Docx, 10 MB)',
      'All themes & color modes',
      'EN / FR language switching',
      'Standard email support (48h SLA)',
      '✗ Appointment scheduling (locked)',
      '✗ Human handoff (locked)',
      '✗ Auto-triggers & WhatsApp (locked)',
      '✗ Geographic analytics (locked)',
      '✗ Reports & export (locked)',
      '✗ Team members — solo only (locked)',
      '✗ Integrations & webhooks (locked)',
    ]
  },
  'Growth': {
    name: 'Growth',
    price_monthly: 72,
    price_annual: 58,
    trial: '14-Day Free Trial',
    note: 'Accelerate lead validation channels',
    features: [
      '3 website widgets',
      '5,000 AI conversations / month',
      'Unlimited leads',
      '5 knowledge base files (PDF / Docx / URL, 25 MB)',
      'Appointment scheduler (video, phone, campus)',
      'Human handoff — live agent override',
      'Auto-triggers (exit intent, scroll, idle)',
      'WhatsApp integration',
      'Geographic & source analytics',
      'Advanced reports (basic)',
      'Shared inbox (3 team members)',
      'Priority email + chat support',
      '✗ Integrations & webhooks (locked)',
      '✗ White-labeling (locked)',
    ]
  },
  'Enterprise': {
    name: 'Enterprise',
    price_monthly: 177,
    price_annual: 141,
    trial: '14-Day Free Trial',
    note: 'Robust tools for active companies',
    features: [
      'Unlimited widgets',
      'Unlimited AI conversations',
      'Unlimited leads & knowledge base files',
      'Full RAG: PDF / Docx / URL / custom FAQ',
      'White-label (remove "Powered by NesLead")',
      'Collaborative shared inbox (10 seats)',
      'Advanced reports + CSV / Excel export',
      'Webhook integrations (Zapier, custom endpoints)',
      'CRM export sync (Salesforce-compatible)',
      '99.5% SLA uptime guarantee',
      'Dedicated success coach (monthly check-in)',
    ]
  },
  'Agency': {
    name: 'Agency',
    price_monthly: 450,
    price_annual: 360,
    trial: '14-Day Free Trial',
    note: 'Full white-label capabilities',
    features: [
      'Everything in Enterprise',
      'Reseller white-label multi-tenant engine',
      'Unlimited client sub-accounts',
      'Revenue-share analytics board',
      'Branded client access portal',
      'Unlimited team members & admin roles',
      'Direct CRM webhook sync (Zapier / Salesforce)',
      '99.9% SLA uptime guarantee',
      'Priority phone support + dedicated account manager',
      'Custom onboarding & staff training session',
    ]
  },
  'free tier': {
    name: 'Free Tier',
    price_monthly: 0,
    price_annual: 0,
    trial: 'No Trial',
    note: 'Get started for free',
    features: [
      '1 website widget',
      '50 AI conversations (lifetime pool)',
      'Basic lead capture (10 leads / month)',
      'Basic dashboard & lead list',
      '1 knowledge base file (Docx only, 500 KB)',
      'Community + email support',
      'EN / FR language switching',
      '✗ Appointment scheduling (locked)',
      '✗ Human handoff (locked)',
      '✗ Auto-triggers & WhatsApp (locked)',
      '✗ Geographic analytics (locked)',
      '✗ Reports & export (locked)',
      '✗ Team members — solo only (locked)',
      '✗ Integrations & webhooks (locked)',
      '✗ White-labeling (locked)',
    ]
  },
  'starter': {
    name: 'Starter',
    price_monthly: 36,
    price_annual: 29,
    trial: '3-Day Free Trial',
    note: 'Essential tools for newer startups',
    features: [
      '1 website widget',
      '500 AI conversations / month',
      'Full lead capture form (200 leads / month)',
      'Full dashboard metrics & lead list',
      '1 knowledge base file (PDF / Docx, 10 MB)',
      'All themes & color modes',
      'EN / FR language switching',
      'Standard email support (48h SLA)',
      '✗ Appointment scheduling (locked)',
      '✗ Human handoff (locked)',
      '✗ Auto-triggers & WhatsApp (locked)',
      '✗ Geographic analytics (locked)',
      '✗ Reports & export (locked)',
      '✗ Team members — solo only (locked)',
      '✗ Integrations & webhooks (locked)',
    ]
  },
  'growth': {
    name: 'Growth',
    price_monthly: 72,
    price_annual: 58,
    trial: '14-Day Free Trial',
    note: 'Accelerate lead validation channels',
    features: [
      '3 website widgets',
      '5,000 AI conversations / month',
      'Unlimited leads',
      '5 knowledge base files (PDF / Docx / URL, 25 MB)',
      'Appointment scheduler (video, phone, campus)',
      'Human handoff — live agent override',
      'Auto-triggers (exit intent, scroll, idle)',
      'WhatsApp integration',
      'Geographic & source analytics',
      'Advanced reports (basic)',
      'Shared inbox (3 team members)',
      'Priority email + chat support',
      '✗ Integrations & webhooks (locked)',
      '✗ White-labeling (locked)',
    ]
  },
  'enterprise': {
    name: 'Enterprise',
    price_monthly: 177,
    price_annual: 141,
    trial: '14-Day Free Trial',
    note: 'Robust tools for active companies',
    features: [
      'Unlimited widgets',
      'Unlimited AI conversations',
      'Unlimited leads & knowledge base files',
      'Full RAG: PDF / Docx / URL / custom FAQ',
      'White-label (remove "Powered by NesLead")',
      'Collaborative shared inbox (10 seats)',
      'Advanced reports + CSV / Excel export',
      'Webhook integrations (Zapier, custom endpoints)',
      'CRM export sync (Salesforce-compatible)',
      '99.5% SLA uptime guarantee',
      'Dedicated success coach (monthly check-in)',
    ]
  },
  'agency': {
    name: 'Agency',
    price_monthly: 450,
    price_annual: 360,
    trial: '14-Day Free Trial',
    note: 'Full white-label capabilities',
    features: [
      'Everything in Enterprise',
      'Reseller white-label multi-tenant engine',
      'Unlimited client sub-accounts',
      'Revenue-share analytics board',
      'Branded client access portal',
      'Unlimited team members & admin roles',
      'Direct CRM webhook sync (Zapier / Salesforce)',
      '99.9% SLA uptime guarantee',
      'Priority phone support + dedicated account manager',
      'Custom onboarding & staff training session',
    ]
  }
};

export function normalizePlanName(input: string): PlanName {
  if (!input) return 'Starter';
  const p = input.toLowerCase().trim();
  if (p === 'pro' || p === 'professional') return 'Enterprise';

  const match = VALID_PLAN_NAMES.find(name => name.toLowerCase() === p);
  if (match) return match;
  return 'Starter';
}

export type VoiceAddOnName = 'Voice Starter' | 'Voice Growth' | 'Voice Agency';

export const VALID_VOICE_ADDON_NAMES: readonly VoiceAddOnName[] = ['Voice Starter', 'Voice Growth', 'Voice Agency'] as const;

export interface VoiceAddOnPlan {
  name: VoiceAddOnName;
  price_monthly: number;
  included_minutes: number;
  overage_rate_per_min: number;
  badge: string;
  description: string;
}

export const VOICE_ADDON_PLANS: Record<VoiceAddOnName, VoiceAddOnPlan> = {
  'Voice Starter': {
    name: 'Voice Starter',
    price_monthly: 49,
    included_minutes: 60,
    overage_rate_per_min: 0.85,
    badge: 'AI Voice Add-On',
    description: '60 minutes of outbound AI voice calls included, then $0.85/min.'
  },
  'Voice Growth': {
    name: 'Voice Growth',
    price_monthly: 99,
    included_minutes: 200,
    overage_rate_per_min: 0.65,
    badge: 'AI Voice Add-On',
    description: '200 minutes of outbound AI voice calls included, then $0.65/min.'
  },
  'Voice Agency': {
    name: 'Voice Agency',
    price_monthly: 249,
    included_minutes: 600,
    overage_rate_per_min: 0.45,
    badge: 'AI Voice Add-On',
    description: '600 minutes of outbound AI voice calls included, then $0.45/min.'
  }
};

