import React, { useState, useEffect, useRef } from 'react';
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
} from 'docx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ThemeProvider, useAppTheme, THEMES } from './components/ThemeContext';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { CurrencyProvider } from './components/CurrencyContext';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import OnboardingChecklist from './components/OnboardingChecklist';
import FloatingWidget from './components/FloatingWidget';
import KnowledgeBasePage from './components/KnowledgeBasePage';
import BillingPage from './components/BillingPage';
import ReportsPage from './components/ReportsPage';
import TeamMembers from './components/TeamMembers';
import UserProfile from './components/UserProfile';
import ConfigurationReminderWidget from './components/ConfigurationReminderWidget';
import GsapTransition from './components/GsapTransition';
import IntegrationsPage from './components/IntegrationsPage';
import SuperAdminPanel from './components/SuperAdminPanel';
import UpgradeModal from './components/UpgradeModal';
import ServiceBuilderPanel from './components/ServiceBuilderPanel';
import TemplatesLibrary from './components/TemplatesLibrary';
import VoiceSettings from './components/VoiceSettings';
import { normalizePlanName } from './lib/plans';
import { getTermOverrides } from './lib/industryPersona';
import { handleOAuthCallback, onAuthStateChange, getCurrentSession } from './lib/supabase';
import confetti from 'canvas-confetti';

import { 
  Sparkles, MessageSquare, Database, Calendar as CalendarIcon, Zap,
  Settings, CreditCard, ChevronRight, CheckCircle, Circle, 
  MapPin, Plus, ArrowRight, Compass, ShieldAlert, ShieldCheck, BarChart3, 
  Users, User, Trash, Filter, Search, Shield, Save, Check, RefreshCcw, LogOut, ArrowUpRight, GraduationCap, Link2, BookOpen, X, ChevronDown, ChevronUp, Menu, Wand2, Inbox, AlertCircle,
  Mail, Phone, Globe, UserCheck, Download, Printer, FileText, Minus, Lock,
  Archive, CheckSquare, Layout, Star, Clock, Copy, Eye, Tag, TrendingUp, Layers,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';

import { Lead, Conversation, Appointment, Program, ThemeId, Message, WidgetSkin, ColorMode, GradientType, GradientStop, GlassPreset, FormField, FormTemplate, TemplateCategory } from './types';
import { ColorModeBuilder, buildGradientString, GLASS_PRESETS } from './components/ColorModeBuilder';
import AuthPage from './components/AuthPage';
import { useAutoSave } from './lib/useAutoSave';

// Authenticated fetch wrapper for premium session calls
const authFetch = (url: string, options: any = {}) => {
  const token = localStorage.getItem('neslead_session_token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
  return fetch(url, { ...options, headers });
};

// ─── Collapsible sidebar nav button ────────────────────────────────────────
interface NavButtonProps {
  tabKey: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  badge?: React.ReactNode;      // e.g. count badge, lock icon, "New" pill
  tooltip?: string;             // plain text for collapsed tooltip
}

function NavButton({ tabKey, icon, label, active, collapsed, onClick, badge, tooltip }: NavButtonProps) {
  const activeStyle: React.CSSProperties = { backgroundColor: 'var(--nav-active-bg)', color: 'var(--nav-active-text)' };
  const inactiveStyle: React.CSSProperties = { color: 'var(--color-text-secondary)' };

  return (
    <div className="relative group w-full">
      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer
          ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-4 py-2.5 gap-2.5'}
        `}
        style={active ? activeStyle : inactiveStyle}
        aria-label={tooltip}
      >
        {/* Icon — always visible */}
        <span className="shrink-0 flex items-center justify-center">{icon}</span>

        {/* Label text — animated in/out */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              key={`nav-label-${tabKey}`}
              initial={{ opacity: 0, x: -6, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -6, width: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex-1 overflow-hidden whitespace-nowrap flex items-center"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge — only in expanded mode */}
        <AnimatePresence>
          {!collapsed && badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="ml-auto shrink-0"
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Tooltip — only shown in collapsed mode, on hover */}
      {collapsed && tooltip && (
        <div
          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200]
            px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl
            opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          }}
          role="tooltip"
        >
          {tooltip}
          {/* Arrow pointing left */}
          <div
            className="absolute right-full top-1/2 -translate-y-1/2 border-w-[4px] border-y-transparent border-l-transparent border-r-[4px]"
            style={{ borderRightColor: 'var(--color-border)' }}
          />
        </div>
      )}
    </div>
  );
}

const SIDEBAR_EXPANDED_WIDTH = 256;  // px — matches w-64
const SIDEBAR_COLLAPSED_WIDTH = 72;  // px — icon-only mode

function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null;
  const config = {
    saving: { text: 'Saving...', color: '#6366f1', bg: '#eef2ff' },
    saved:  { text: '✓ Saved',   color: '#059669', bg: '#ecfdf5' },
    error:  { text: '✗ Error',   color: '#dc2626', bg: '#fef2f2' },
  }[status];
  return (
    <span
      className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md transition-all animate-fade-in inline-block"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.text}
    </span>
  );
}

function MainApp() {
  const { translate, activeLanguage, setIsLanguage } = useLanguage();
  const { activeTheme, setThemeById, isGlobalDarkMode, setGlobalDarkModeOverride } = useAppTheme();

  // Authentication & Wizard states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminRoute] = useState<boolean>(() => window.location.pathname === '/admin');
  const [signupIntentPlan, setSignupIntentPlan] = useState<string>(() => {
    return localStorage.getItem('neslead_signup_intent_plan') || 'Starter';
  });
  const [showWizard, setShowWizard] = useState(false);
  const [skippedWizard, setSkippedWizard] = useState(() => {
    return localStorage.getItem('neslead_skipped_wizard') === 'true';
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('signup');
  const [userRole, setUserRole] = useState<'OWNER' | 'ADMIN'>('OWNER');
  const [teamMemberRole, setTeamMemberRole] = useState<string | null>(null);
  const [platformRole, setPlatformRole] = useState<string | null>(null);
  const [isPostSignupWizard, setIsPostSignupWizard] = useState(false);
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);
  const [wizardManuallyClosed, setWizardManuallyClosed] = useState(false);

  // Sidebar navigation routes
  // 'dashboard' | 'leads' | 'conversations' | 'kb' | 'programs' | 'appointments' | 'reports' | 'widget_config' | 'billing' | 'profile'
  const [activeTab, setActiveTab ] = useState<string>(() => {
    return localStorage.getItem('neslead_active_tab') || 'dashboard';
  });
  const [tenantProfile, setTenantProfile] = useState<any>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

  // Super Admin PIN gate
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neslead_pin_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinShake, setPinShake] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    if (showPinModal) {
      const t = setTimeout(() => {
        const el = document.getElementById('pin-hidden-input') as HTMLInputElement | null;
        if (el) el.focus();
      }, 120); // After animation settles
      return () => clearTimeout(t);
    }
  }, [showPinModal]);

  // Dynamic Trial Countdown Engine (Server-Side enforced)
  const isTrialActive = tenantProfile?.is_trial === 1;

  const getTrialDaysRemaining = (): number => {
    if (!tenantProfile?.trial_expires_at) return 7; // Default for new accounts before first API call sets it
    const now = Date.now();
    const expiry = new Date(tenantProfile.trial_expires_at).getTime();
    const diff = expiry - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialExpired = isTrialActive && trialDaysRemaining <= 0;

  // Also add: precise hours remaining for countdown display
  const getTrialHoursRemaining = (): number => {
    if (!tenantProfile?.trial_expires_at) return 168;
    const diff = new Date(tenantProfile.trial_expires_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  };
  const trialHoursRemaining = getTrialHoursRemaining();

  const getTabLockTier = (tab: string): string | null => {
    // Super admin bypass — platform owner is never gated by plan locks
    if (tenantProfile?.isSuperAdmin) return null;

    const currentPlan = (tenantProfile?.plan || 'Starter').toLowerCase();
    const isFreeTier = currentPlan === 'free tier';

    if (tab === 'appointments') {
      if (isFreeTier || currentPlan === 'starter') return 'Growth';
    }
    if (tab === 'integrations') {
      if (isFreeTier || currentPlan === 'starter') return 'Growth';
    }
    if (tab === 'reports') {
      if (isFreeTier || currentPlan === 'starter' || currentPlan === 'growth') return 'Enterprise';
    }
    if (tab === 'team') {
      if (isFreeTier || currentPlan === 'starter' || currentPlan === 'growth') return 'Enterprise';
    }
    return null;
  };

  // Core collections synced from server
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsSubTab, setProgramsSubTab] = useState<'catalog' | 'form_builder' | 'templates'>('catalog');
  const [formBuilderFullscreen, setFormBuilderFullscreen] = useState(false);
  const [selectedBuilderProgramId, setSelectedBuilderProgramId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [templatePreviewModal, setTemplatePreviewModal] = useState<FormTemplate | null>(null);
  const [templateApplying, setTemplateApplying] = useState<string | null>(null); // template id being applied
  const [templateToApply, setTemplateToApply] = useState<FormTemplate | null>(null);

  // Filter queries
  const [leadQuery, setLeadQuery] = useState('');
  const [activeLeadFilter, setActiveLeadFilter] = useState<'ALL' | 'HOT' | 'WARM' | 'CONTACTED' | 'CONVERTED' | 'COLD'>('ALL');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('ALL');
  const [convFilter, setConvFilter] = useState<'ALL' | 'ACTIVE' | 'ESCALATED' | 'RESOLVED' | 'ARCHIVED'>('ALL');
  const [selectedConvIds, setSelectedConvIds] = useState<Set<string>>(new Set());
  const [convStats, setConvStats] = useState({ active: 0, escalated: 0, resolved: 0, unread: 0 });

  // Active chat in Shared Inbox state
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [mobileInboxView, setMobileInboxView] = useState<'list' | 'chat'>('list');
  const [agentReplyText, setAgentReplyText] = useState('');

  // Checklist steps state
  const [checklistSteps, setChecklistSteps] = useState([
    { id: 1, label: 'Connect website & choose industry', tabKey: 'setup_wizard', completed: false },
    { id: 2, label: 'Knowledge base scan', tabKey: 'setup_wizard', completed: false },
    { id: 3, label: 'Brand & theme customization', tabKey: 'setup_wizard', completed: false },
    { id: 4, label: 'Lead capture & triggers', tabKey: 'setup_wizard', completed: false },
    { id: 5, label: 'Notifications & delivery', tabKey: 'setup_wizard', completed: false },
    { id: 6, label: 'Bot behavior & availability', tabKey: 'setup_wizard', completed: false }
  ]);
  const [showChecklist, setShowChecklist] = useState(true);

  // Widget Settings Edit Form values
  const [cfgBotName, setCfgBotName] = useState('AI Assistant');
  const [cfgWelcomeMessage, setCfgWelcomeMessage] = useState('Hello! Welcome to our website! How can I help you find the right services or book a call today? 🚀');
  const [cfgVertical, setCfgVertical] = useState('education');
  const [cfgCustomPersona, setCfgCustomPersona] = useState('');
  const [cfgNotificationEmail, setCfgNotificationEmail] = useState('');
  const [cfgLeadCapture, setCfgLeadCapture] = useState(true);
  const [cfgBooking, setCfgBooking] = useState(true);
  const [cfgHandoff, setCfgHandoff] = useState(true);
  const [cfgConfidence, setCfgConfidence] = useState(true);
  const [cfgWhatsApp, setCfgWhatsApp] = useState(true);
  const [cfgWhatsAppNumber, setCfgWhatsAppNumber] = useState('+237 690 000 000');
  const [cfgTimeTrigger, setCfgTimeTrigger] = useState(true);
  const [cfgTimeDelay, setCfgTimeDelay] = useState(6);
  const [cfgScrollTrigger, setCfgScrollTrigger] = useState(true);
  const [cfgScrollPercent, setCfgScrollPercent] = useState(50);
  const [cfgExitIntent, setCfgExitIntent] = useState(true);
  const [cfgExitFormHeadline, setCfgExitFormHeadline] = useState('');
  const [cfgExitFormBody, setCfgExitFormBody] = useState('');
  const [cfgExitFormBtnLabel, setCfgExitFormBtnLabel] = useState('');
  const [cfgIdleTrigger, setCfgIdleTrigger] = useState(true);
  const [cfgPosition, setCfgPosition] = useState('right_bottom');
  const [cfgLauncherEmoji, setCfgLauncherEmoji] = useState('🤖');
  const [cfgLauncherLogoUrl, setCfgLauncherLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [cfgPulseEnabled, setCfgPulseEnabled] = useState(true);
  const [cfgWidgetSkin, setCfgWidgetSkin] = useState<WidgetSkin>('solid');
  const [cfgCustomAccent, setCfgCustomAccent] = useState('');
  
  // Custom Color Override modes
  const [cfgColorMode, setCfgColorMode] = useState<ColorMode>('solid');
  const [cfgSolidColor, setCfgSolidColor] = useState('#6366F1');
  
  // Gradient mode config
  const [cfgGradientType, setCfgGradientType] = useState<GradientType>('linear');
  const [cfgGradientAngle, setCfgGradientAngle] = useState(135);
  const [cfgGradientStops, setCfgGradientStops] = useState<GradientStop[]>([
    { color: '#6366F1', position: 0 },
    { color: '#38BDF8', position: 100 },
  ]);
  
  // Glass mode config
  const [cfgGlassPreset, setCfgGlassPreset] = useState<GlassPreset>('frosted');
  const [cfgGlassBlur, setCfgGlassBlur] = useState(12);
  const [cfgGlassOpacity, setCfgGlassOpacity] = useState(12); // percentage integer
  
  // Applied status indicator
  const [gradientApplied, setGradientApplied] = useState(false);
  const isFirstRun = useRef(true);

  // Widget Shadow & Depth config
  const [cfgShadowEnabled, setCfgShadowEnabled] = useState(true);
  const [cfgShadowColor, setCfgShadowColor] = useState('#000000');
  const [cfgShadowColorOpacity, setCfgShadowColorOpacity] = useState(20); // 0–100
  const [cfgShadowX, setCfgShadowX] = useState(0);     // -60 to 60px
  const [cfgShadowY, setCfgShadowY] = useState(20);    // -60 to 60px
  const [cfgShadowBlur, setCfgShadowBlur] = useState(60);  // 0–120px
  const [cfgShadowSpread, setCfgShadowSpread] = useState(0);  // -30 to 30px
  const [cfgShadow2Enabled, setCfgShadow2Enabled] = useState(false); // second shadow layer
  const [cfgShadow2Color, setCfgShadow2Color] = useState('#6366F1');
  const [cfgShadow2Opacity, setCfgShadow2Opacity] = useState(25);
  const [cfgShadow2X, setCfgShadow2X] = useState(0);
  const [cfgShadow2Y, setCfgShadow2Y] = useState(8);
  const [cfgShadow2Blur, setCfgShadow2Blur] = useState(32);
  const [cfgShadow2Spread, setCfgShadow2Spread] = useState(-4);

  const hexToRgba = (hex: string, opacity: number): string => {
    if (!hex || hex.length < 7) hex = '#000000';
    const r = parseInt(hex.slice(1,3), 16) || 0;
    const g = parseInt(hex.slice(3,5), 16) || 0;
    const b = parseInt(hex.slice(5,7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${(opacity/100).toFixed(2)})`;
  };

  const computedBoxShadow = cfgShadowEnabled
    ? [
        `${cfgShadowX}px ${cfgShadowY}px ${cfgShadowBlur}px ${cfgShadowSpread}px ${hexToRgba(cfgShadowColor, cfgShadowColorOpacity)}`,
        cfgShadow2Enabled
          ? `${cfgShadow2X}px ${cfgShadow2Y}px ${cfgShadow2Blur}px ${cfgShadow2Spread}px ${hexToRgba(cfgShadow2Color, cfgShadow2Opacity)}`
          : null,
      ].filter(Boolean).join(', ')
    : 'none';

  const [cfgBotTheme, setCfgBotTheme] = useState<ThemeId>('midnight');
  const [showBrandCustomize, setShowBrandCustomize] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sidebar collapse state — persisted to localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neslead_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // GSAP target ref for the sidebar element
  const sidebarRef = useRef<HTMLElement>(null);
  // Ref to track if GSAP animation is currently running (prevent double-clicks)
  const sidebarAnimatingRef = useRef(false);

  // Track if we are on desktop (md+) — sidebar collapse only applies here
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Effective collapsed state — only collapsed on desktop
  const effectiveCollapsed = sidebarCollapsed && isDesktop;

  // Responsive mobile detector state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial sidebar width from persisted state (no animation on first load)
  useEffect(() => {
    if (sidebarRef.current && window.innerWidth >= 768) {
      gsap.set(sidebarRef.current, {
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      });
    }
  }, []); // empty deps — runs once on mount only

  // Widget bot colors — validated and dispatched/applied to document.documentElement and the interactive widget
  useEffect(() => {
    const root = document.documentElement;

    const shadowBlob = {
      enabled: cfgShadowEnabled,
      color: cfgShadowColor,
      opacity: cfgShadowColorOpacity,
      x: cfgShadowX,
      y: cfgShadowY,
      blur: cfgShadowBlur,
      spread: cfgShadowSpread,
      layer2: cfgShadow2Enabled,
      color2: cfgShadow2Color,
      opacity2: cfgShadow2Opacity,
      x2: cfgShadow2X,
      y2: cfgShadow2Y,
      blur2: cfgShadow2Blur,
      spread2: cfgShadow2Spread
    };

    if (cfgColorMode === 'solid' && cfgSolidColor) {
      root.style.setProperty('--color-accent', cfgSolidColor);
      root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${cfgSolidColor}, ${cfgSolidColor}cc)`);
      root.style.setProperty('--launcher-gradient', `linear-gradient(135deg, ${cfgSolidColor}, ${cfgSolidColor}cc)`);
      const strVal = JSON.stringify({ mode: 'solid', color: cfgSolidColor, shadows: shadowBlob });
      if (cfgCustomAccent !== strVal) {
        setCfgCustomAccent(strVal);
      }
    } else if (cfgColorMode === 'gradient') {
      const gradientCSS = buildGradientString(cfgGradientType, cfgGradientAngle, cfgGradientStops);
      root.style.setProperty('--accent-gradient', gradientCSS);
      root.style.setProperty('--launcher-gradient', gradientCSS);
      root.style.setProperty('--color-accent', cfgGradientStops[0]?.color ?? activeTheme.tokens.accent);
      const strVal = JSON.stringify({ mode: 'gradient', type: cfgGradientType, angle: cfgGradientAngle, stops: cfgGradientStops, shadows: shadowBlob });
      if (cfgCustomAccent !== strVal) {
        setCfgCustomAccent(strVal);
      }
    } else if (cfgColorMode === 'glass') {
      const preset = GLASS_PRESETS[cfgGlassPreset];
      const blurValue = `${cfgGlassBlur}px`;
      const bgWithOpacity = preset.bg.replace(/[\d.]+\)$/, `${cfgGlassOpacity / 100})`);
      root.style.setProperty('--accent-gradient', preset.accentGradient);
      root.style.setProperty('--launcher-gradient', preset.launcherGradient);
      root.style.setProperty('--glass-blur', blurValue);
      root.style.setProperty('--glass-bg', bgWithOpacity);
      root.style.setProperty('--glass-border', preset.border);
      root.style.setProperty('--glass-shadow', '0 8px 32px rgba(0,0,0,0.2)');
      const strVal = JSON.stringify({ mode: 'glass', preset: cfgGlassPreset, blur: cfgGlassBlur, opacity: cfgGlassOpacity, shadows: shadowBlob });
      if (cfgCustomAccent !== strVal) {
        setCfgCustomAccent(strVal);
      }
    } else {
      root.style.setProperty('--color-accent', activeTheme.tokens.accent);
      root.style.setProperty('--accent-gradient', activeTheme.tokens.accent_gradient);
      root.style.setProperty('--launcher-gradient', activeTheme.tokens.launcher_gradient);
      const strVal = JSON.stringify({ mode: 'default', shadows: shadowBlob });
      if (cfgCustomAccent !== strVal) {
        setCfgCustomAccent(strVal);
      }
    }
  }, [
    cfgColorMode, cfgSolidColor, cfgGradientType, cfgGradientAngle, cfgGradientStops, cfgGlassPreset, cfgGlassBlur, cfgGlassOpacity, activeTheme,
    cfgShadowEnabled, cfgShadowColor, cfgShadowColorOpacity, cfgShadowX, cfgShadowY, cfgShadowBlur, cfgShadowSpread,
    cfgShadow2Enabled, cfgShadow2Color, cfgShadow2Opacity, cfgShadow2X, cfgShadow2Y, cfgShadow2Blur, cfgShadow2Spread
  ]);

  // Persist current active view tab state in local storage to sustain browser refreshes
  useEffect(() => {
    localStorage.setItem('neslead_active_tab', activeTab);
  }, [activeTab]);

  // New item creation forms
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLeadStatus, setEditLeadStatus] = useState<string>('');
  const [editLeadScore, setEditLeadScore] = useState<number>(0);

  // Voice call states inside Lead Dossier Drawer
  const [isPlacingVoiceCall, setIsPlacingVoiceCall] = useState<boolean>(false);
  const [voiceCallFeedback, setVoiceCallFeedback] = useState<{ type: 'success' | 'error' | 'info' | null, text: string }>({ type: null, text: '' });
  const [selectedLeadVoiceCalls, setSelectedLeadVoiceCalls] = useState<any[]>([]);
  const [expandedLeadCallId, setExpandedLeadCallId] = useState<string | null>(null);
  const [loadingLeadVoiceCalls, setLoadingLeadVoiceCalls] = useState<boolean>(false);
  
  const [voiceSettings, setVoiceSettings] = useState<any>(null);
  const [showCallConfirm, setShowCallConfirm] = useState<boolean>(false);
  const [leadDossierTab, setLeadDossierTab] = useState<'profile' | 'voice'>('profile');

  useEffect(() => {
    if (selectedLead) {
      setEditLeadStatus(selectedLead.status);
      setEditLeadScore(selectedLead.score);
      setVoiceCallFeedback({ type: null, text: '' });
      setExpandedLeadCallId(null);
      setShowCallConfirm(false);
      setLeadDossierTab('profile');
      
      // Fetch selected lead's call history
      setLoadingLeadVoiceCalls(true);
      authFetch(`/api/voice/calls/lead/${selectedLead.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success) {
            setSelectedLeadVoiceCalls(data.calls || []);
          } else {
            setSelectedLeadVoiceCalls([]);
          }
        })
        .catch(err => {
          console.error('[Voice] Error fetching lead calls:', err);
          setSelectedLeadVoiceCalls([]);
        })
        .finally(() => {
          setLoadingLeadVoiceCalls(false);
        });

      // Fetch voice settings for toggle/confirmation display check
      authFetch('/api/voice/settings')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setVoiceSettings(data);
          }
        })
        .catch(err => {
          console.error('[Voice] Error fetching settings:', err);
        });
    } else {
      setSelectedLeadVoiceCalls([]);
      setVoiceSettings(null);
      setShowCallConfirm(false);
    }
  }, [selectedLead]);

  // Handle active call state status polling every 5s while non-terminal
  useEffect(() => {
    if (!selectedLead || !selectedLeadVoiceCalls || selectedLeadVoiceCalls.length === 0) return;

    const hasActiveCall = selectedLeadVoiceCalls.some(
      c => c.status === 'initiated' || c.status === 'ringing' || c.status === 'in-progress' || c.status === 'queued'
    );

    if (!hasActiveCall) return;

    const intervalId = setInterval(() => {
      authFetch(`/api/voice/calls/lead/${selectedLead.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success) {
            setSelectedLeadVoiceCalls(data.calls || []);
          }
        })
        .catch(err => {
          console.error('[Voice Polling Error]:', err);
        });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedLead, selectedLeadVoiceCalls]);

  const handleInitiateVoiceCall = async (leadId: string) => {
    setShowCallConfirm(false);
    setIsPlacingVoiceCall(true);
    setVoiceCallFeedback({ type: 'info', text: 'Initializing outbound cellular voice connection...' });

    try {
      const res = await authFetch('/api/voice/calls/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVoiceCallFeedback({
          type: 'success',
          text: data.message || `Outbound automated calling connection triggered to target.`
        });

        // Add the initiated call record directly to history
        const newCallRecord = {
          id: data.callId,
          vapi_call_id: data.vapiCallId,
          status: 'initiated',
          initiated_by: 'You',
          initiated_at: new Date().toISOString(),
          duration_seconds: 0,
          outcome: 'initiated',
          transcript: '',
          summary: ''
        };
        setSelectedLeadVoiceCalls(prev => [newCallRecord, ...prev]);
      } else {
        setVoiceCallFeedback({
          type: 'error',
          text: data.message || 'Call initiation failed. Please verify voice credit approval and configuration in settings.'
        });
      }
    } catch (err: any) {
      console.error(err);
      setVoiceCallFeedback({
        type: 'error',
        text: 'Network boundary failure during call negotiation.'
      });
    } finally {
      setIsPlacingVoiceCall(false);
    }
  };

  const adminScrollAnchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (adminScrollAnchorRef.current) {
      adminScrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvId, conversations]);
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadCountry, setNewLeadCountry] = useState('Canada');
  const [newLeadProgram, setNewLeadProgram] = useState('Executive MBA (EN/FR)');

  const [showAddProgModal, setShowAddProgModal] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgDept, setNewProgDept] = useState('Business');
  const [newProgDuration, setNewProgDuration] = useState('2 Years');
  const [newProgFees, setNewProgFees] = useState('$12,000 / Year');
  const [newProgBadge, setNewProgBadge] = useState('Limited seats');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgDeliveryMode, setNewProgDeliveryMode] = useState('Remote');

  // Validate token session when browser window starts up and handle OAuth redirect callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const isOAuth = url.pathname === '/auth/callback' || url.hash.includes('access_token');

    if (isOAuth) {
      handleOAuthCallback().then(async (result) => {
        if (result && result.token && result.email) {
          localStorage.setItem('neslead_session_token', result.token);

          // Sync tenant to SQLite
          try {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${result.token}`
              },
              body: JSON.stringify({ email: result.email })
            });
          } catch (_) {}

          // Clean the URL (remove hash params)
          window.history.replaceState({}, document.title, '/');

          // Trigger the normal session check
          setIsLoggedIn(true);
          checkUserSession(result.token);
        }
      });
    } else {
      const token = localStorage.getItem('neslead_session_token');
      if (token) {
        checkUserSession(token);
      }
    }

    // Listen for Supabase auth state changes (token refresh, sign out)
    const { data: { subscription } } = onAuthStateChange((session) => {
      if (session && session.access_token) {
        localStorage.setItem('neslead_session_token', session.access_token);
      } else if (!session) {
        // Session ended — sign out
        localStorage.removeItem('neslead_session_token');
        localStorage.removeItem('neslead_tenant_id');
        setPinUnlocked(false);
        localStorage.removeItem('neslead_pin_unlocked');
        setPinInput('');
        setPinError('');
        setShowPinModal(false);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserSession = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        
        // Read intent plan from localStorage (survives the auth flow redirect)
        const intentPlan = localStorage.getItem('neslead_signup_intent_plan') || 'Starter';
        setSignupIntentPlan(intentPlan);
        
        // Redirect to billing tab if they showed active intent during this or previous session
        if (localStorage.getItem('neslead_signup_intent_plan')) {
          setActiveTab('billing');
          localStorage.setItem('neslead_active_tab', 'billing');
        }

        // If user logged in via /admin route, redirect to super_admin tab automatically
        if (isAdminRoute && data.isSuperAdmin) {
          setActiveTab('super_admin');
          localStorage.setItem('neslead_active_tab', 'super_admin');
          setPinUnlocked(true); // Auto-unlock PIN gate for /admin route — they used the dedicated URL
        }

        setTenantProfile(data);
        // If user tried to log in via /admin but is not a platform admin, force logout and show error
        if (isAdminRoute && !data.isSuperAdmin) {
          localStorage.removeItem('neslead_session_token');
          localStorage.removeItem('neslead_email');
          setIsLoggedIn(false);
          setTenantProfile(null);
          setShowAuth(false);
          // Show a brief error — we'll use a simple alert as a safe, zero-risk approach
          alert('Access denied. This login portal is restricted to NesLead platform team members only. Please use the main site to log in to your account.');
          return;
        }
        if (data.role) {
          setTeamMemberRole(data.role);
        } else {
          setTeamMemberRole('OWNER');
        }
        if (data.platformRole) {
          setPlatformRole(data.platformRole);
        } else {
          setPlatformRole(null);
        }
        if (data.onboarded) {
          setShowWizard(false);
          setSkippedWizard(false);
        } else if (data.isSuperAdmin) {
          // Super admins skip onboarding entirely — they manage the platform, not use it as a client
          setShowWizard(false);
          setSkippedWizard(true);
        } else {
          const bypassed = data.skipped_wizard || localStorage.getItem('neslead_skipped_wizard') === 'true';
          if (bypassed) {
            setShowWizard(false);
            setSkippedWizard(true);
            localStorage.removeItem('neslead_wizard_saved_progress');
          } else {
            setIsPostSignupWizard(true);
            setShowWizard(true);
          }
        }
      } else {
        localStorage.removeItem('neslead_session_token');
        setPinUnlocked(false);
        localStorage.removeItem('neslead_pin_unlocked');
        setPinInput('');
        setPinError('');
        setShowPinModal(false);
        setIsLoggedIn(false);
        setTenantProfile(null);
        setPlatformRole(null);
      }
    } catch (err) {
      console.error('Session handshaking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2 Minutes Setup configuration auto-remind timer
  useEffect(() => {
    if (isLoggedIn && tenantProfile && tenantProfile.onboarded !== 1 && !tenantProfile.isSuperAdmin) {
      const timer = setTimeout(() => {
        // Use functional setState check to read latest state, avoiding stale closure
        setTenantProfile(prev => {
          if (prev && prev.onboarded !== 1 && !wizardManuallyClosed && !prev.isSuperAdmin) {
            localStorage.removeItem('neslead_skipped_wizard');
            setSkippedWizard(false);
            setShowWizard(true);
          }
          return prev; // Don't change anything — just reading
        });
      }, 120000); // 120,000 ms = 2 minutes

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, tenantProfile?.onboarded, tenantProfile?.isSuperAdmin, wizardManuallyClosed]);

  // Synchronize or load checklist steps
  useEffect(() => {
    if (!isLoggedIn) return;

    // 1. If onboarded, all are complete!
    if (tenantProfile?.onboarded === 1) {
      setChecklistSteps(prev => prev.map(s => ({ ...s, completed: true })));
      return;
    }

    // 2. If wizardDraft is available, parse and set it
    if (tenantProfile?.wizardDraft) {
      try {
        const parsed = typeof tenantProfile.wizardDraft === 'string'
          ? JSON.parse(tenantProfile.wizardDraft)
          : tenantProfile.wizardDraft;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isValid = parsed.every(p => typeof p.id === 'number' && typeof p.completed === 'boolean');
          if (isValid) {
            setChecklistSteps(prev => {
              return prev.map(step => {
                const found = parsed.find(p => p.id === step.id);
                return found ? { ...step, completed: found.completed } : step;
              });
            });
            return;
          }
        }
      } catch (err) {
        console.error('Failed to parse checklist progress:', err);
      }
    }

    // 3. Fallback: try to read from localStorage 'neslead_wizard_saved_progress'
    try {
      const saved = localStorage.getItem('neslead_wizard_saved_progress');
      if (saved) {
        const d = JSON.parse(saved);
        const currentStep = d.step ?? 0;
        setChecklistSteps(prev => prev.map(step => {
          let completed = false;
          if (step.id === 1) completed = currentStep > 1;
          else if (step.id === 2) completed = currentStep > 3;
          else if (step.id === 3) completed = currentStep > 4;
          else if (step.id === 4) completed = currentStep > 7;
          else if (step.id === 5) completed = currentStep > 9;
          else if (step.id === 6) completed = currentStep > 14;
          return { ...step, completed };
        }));
      }
    } catch (_) {}
  }, [isLoggedIn, tenantProfile?.onboarded, tenantProfile?.wizardDraft]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const params = new URLSearchParams();
      if (templateCategoryFilter && templateCategoryFilter !== 'all') params.set('category', templateCategoryFilter);
      if (templateSearch) params.set('search', templateSearch);
      if (cfgVertical) params.set('vertical', cfgVertical);
      const res = await authFetch(`/api/templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleApplyTemplate = async (template: FormTemplate) => {
    setTemplateApplying(template.id);
    try {
      // Increment use count in background
      authFetch(`/api/templates/${template.id}/use`, { method: 'POST' }).catch(() => {});

      // Switch to form builder tab — the template data is passed via state
      setTemplateToApply(template);
      setSelectedBuilderProgramId(''); // new form, not editing existing
      setProgramsSubTab('form_builder');
      setFormBuilderFullscreen(true);
    } finally {
      setTemplateApplying(null);
    }
  };

  useEffect(() => {
    if (programsSubTab === 'templates') {
      fetchTemplates();
    }
  }, [programsSubTab, templateCategoryFilter, templateSearch]);

  // Fetch initial datasets from server database
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Profile Status - always fetch, even if silent, to keep profile plans/badges in full sync
      const tenantRes = await authFetch('/api/tenant/me');
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        setTenantProfile(tenantData);
        if (tenantData.role) {
          setTeamMemberRole(tenantData.role);
        } else {
          setTeamMemberRole('OWNER');
        }
        if (tenantData.platformRole) {
          setPlatformRole(tenantData.platformRole);
        } else {
          setPlatformRole(null);
        }
        if (tenantData.id) {
          localStorage.setItem('neslead_tenant_id', tenantData.id);
        }
      }

      // Leads
      const leadsRes = await authFetch('/api/leads');
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data);
      }
      
      // Conversations
      const convRes = await authFetch('/api/conversations');
      if (convRes.ok) {
        const data = await convRes.json();
        setConversations(data);
        if (data.length > 0 && !selectedConvId) {
          setSelectedConvId(data[0].id);
        }
      }
      await fetchConvStats();

      // Appointments
      const apptRes = await authFetch('/api/appointments');
      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data);
      }

      if (!silent) {
        // Course Programs
        const progRes = await authFetch('/api/programs');
        if (progRes.ok) {
          const data = await progRes.json();
          setPrograms(data);
        }

        // Widget settings config parameters
        const cfgRes = await authFetch('/api/widget/config');
        if (cfgRes.ok) {
          const c = await cfgRes.json();
          setCfgBotName(c.botName || 'AI Assistant');
          setCfgWelcomeMessage(c.welcomeMessage || '');
          setCfgLeadCapture(c.leadCaptureEnabled !== false);
          setCfgBooking(c.bookingEnabled !== false);
          setCfgHandoff(c.humanHandoffEnabled !== false);
          setCfgConfidence(c.confidenceDisplayEnabled !== false);
          setCfgWhatsApp(c.whatsappEnabled !== false);
          setCfgWhatsAppNumber(c.whatsappNumber || '+237 690 000 000');
          setCfgTimeTrigger(c.timeTriggerEnabled !== false);
          setCfgTimeDelay(c.timeTriggerDelay || 6);
          setCfgScrollTrigger(c.scrollTriggerEnabled !== false);
          setCfgScrollPercent(c.scrollTriggerPercent || 50);
          setCfgExitIntent(c.exitIntentEnabled !== false);
          setCfgIdleTrigger(c.idleTriggerEnabled !== false);
          setCfgPosition(c.position || 'right_bottom');
          setCfgLauncherEmoji(c.launcherEmoji === '🎓' ? '🤖' : (c.launcherEmoji || '🤖'));
          setCfgLauncherLogoUrl(c.launcherLogoUrl || '');
          setCfgPulseEnabled(c.pulseEnabled !== false);
          setCfgCustomAccent(c.customAccent || '');
          const rawAccent = c.customAccent || '';
          if (rawAccent.startsWith('{')) {
            try {
              const parsed = JSON.parse(rawAccent);
              if (parsed.mode === 'gradient') {
                setCfgColorMode('gradient');
                setCfgGradientType(parsed.type);
                setCfgGradientAngle(parsed.angle);
                setCfgGradientStops(parsed.stops);
              } else if (parsed.mode === 'glass') {
                setCfgColorMode('glass');
                setCfgGlassPreset(parsed.preset);
                setCfgGlassBlur(parsed.blur ?? 12);
                setCfgGlassOpacity(parsed.opacity ?? 12);
              } else if (parsed.mode === 'solid') {
                setCfgColorMode('solid');
                setCfgSolidColor(parsed.color ?? '#6366F1');
              }
              if (parsed.shadows) {
                setCfgShadowEnabled(parsed.shadows.enabled !== false);
                setCfgShadowColor(parsed.shadows.color ?? '#000000');
                setCfgShadowColorOpacity(parsed.shadows.opacity ?? 20);
                setCfgShadowX(parsed.shadows.x ?? 0);
                setCfgShadowY(parsed.shadows.y ?? 20);
                setCfgShadowBlur(parsed.shadows.blur ?? 60);
                setCfgShadowSpread(parsed.shadows.spread ?? 0);
                setCfgShadow2Enabled(parsed.shadows.layer2 ?? false);
                setCfgShadow2Color(parsed.shadows.color2 ?? '#6366F1');
                setCfgShadow2Opacity(parsed.shadows.opacity2 ?? 25);
                setCfgShadow2X(parsed.shadows.x2 ?? 0);
                setCfgShadow2Y(parsed.shadows.y2 ?? 8);
                setCfgShadow2Blur(parsed.shadows.blur2 ?? 32);
                setCfgShadow2Spread(parsed.shadows.spread2 ?? -4);
              }
            } catch (e) {
              console.warn('Failed to parse customAccent JSON', e);
            }
          } else if (rawAccent.startsWith('#')) {
            setCfgColorMode('solid');
            setCfgSolidColor(rawAccent);
          } else {
            setCfgColorMode('solid');
            setCfgSolidColor('');
          }
          if (c.botTheme) setCfgBotTheme(c.botTheme as ThemeId);
          else if (c.theme) setCfgBotTheme(c.theme as ThemeId);
          if (c.widgetSkin) setCfgWidgetSkin(c.widgetSkin as WidgetSkin);
          setCfgExitFormHeadline(c.exitFormHeadline || '');
          setCfgExitFormBody(c.exitFormBody || '');
          setCfgExitFormBtnLabel(c.exitFormBtnLabel || '');
          setCfgVertical(c.vertical || 'education');
          setCfgCustomPersona(c.customPersona || '');
          setCfgNotificationEmail(c.notificationEmail || '');
          if (c.theme) {
            setThemeById(c.theme);
          }
        }
      }
    } catch (err) {
      console.warn('Backend is initializing, offline layout fallback is enabled.', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const silentFetchConversations = async () => {
    try {
      const res = await authFetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error('Silent conversations fetch failed:', e);
    }
  };

  function playNotificationSound() {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    loadData();

    const token = localStorage.getItem('neslead_session_token');
    if (!token) return;

    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connectAdminSSE() {
      es = new EventSource(`/api/admin/sse?token=${encodeURIComponent(token)}`);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          if (data.type === 'message') {
            const msg = data.message;
            const convId = data.conversationId;
            if (msg && convId) {
              setConversations((prev) => {
                const targetIdx = prev.findIndex((c) => c.id === convId);
                if (targetIdx === -1) {
                  // If it's a completely new incoming session conversation
                  loadData(true);
                  return prev;
                }
                const oldConv = prev[targetIdx];
                if (oldConv.messages.some((m) => m.id === msg.id)) {
                  return prev;
                }
                const updatedConv = {
                  ...oldConv,
                  messages: [...oldConv.messages, msg],
                  unreadCount: (oldConv.unreadCount || 0) + 1,
                  status: 'ACTIVE' as any
                };
                const nextList = [...prev];
                nextList.splice(targetIdx, 1);
                return [updatedConv, ...nextList];
              });
              fetchConvStats();
              playNotificationSound();
            }
          } else if (data.type === 'ai_reply' || data.type === 'agent_reply') {
            const msg = data.message;
            const convId = data.conversationId;
            if (msg && convId) {
              setConversations((prev) => {
                const targetIdx = prev.findIndex((c) => c.id === convId);
                if (targetIdx === -1) return prev;
                const oldConv = prev[targetIdx];
                if (oldConv.messages.some((m) => m.id === msg.id)) return prev;
                const updatedConv = {
                  ...oldConv,
                  messages: [...oldConv.messages, msg],
                  unreadCount: data.type === 'agent_reply' ? 0 : oldConv.unreadCount
                };
                const nextList = [...prev];
                nextList.splice(targetIdx, 1);
                return [updatedConv, ...nextList];
              });
              fetchConvStats();
            }
          } else if (data.type === 'conversation_updated') {
            // Optimistically update the conversation preview in state
            setConversations(prev => prev.map(c => {
              if (c.id === data.conversationId) {
                return {
                  ...c,
                  unreadCount: data.unreadCount !== undefined ? data.unreadCount : c.unreadCount,
                  status: data.status !== undefined ? data.status : c.status,
                  lastMessage: data.lastMessage !== undefined ? data.lastMessage : (c.messages[c.messages.length - 1]?.content || ''),
                  lastMessageRole: data.lastMessageRole !== undefined ? data.lastMessageRole : (c.messages[c.messages.length - 1]?.role || 'USER'),
                  updatedAt: data.timestamp || new Date().toISOString()
                };
              }
              return c;
            }));
            // Fetch fresh stats
            fetchConvStats();
            // Silent full conversations reload to load latest message details or updates
            silentFetchConversations();
            // Trigger ping sound
            playNotificationSound();
          } else if (data.type === 'conversation_resolved') {
            setConversations(prev => prev.map(c =>
              c.id === data.conversationId ? { ...c, status: 'RESOLVED' as any, unreadCount: 0 } : c
            ));
            fetchConvStats();
            silentFetchConversations();
          }
        } catch (e) {
          console.error("Admin SSE parsing error:", e);
        }
      };

      es.onerror = (err) => {
        console.log("Admin SSE connection status changed. Reconnecting...", err);
        if (es) es.close();
        reconnectTimeout = setTimeout(connectAdminSSE, 5000);
      };
    }

    connectAdminSSE();

    return () => {
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [isLoggedIn]);

  const { trigger: triggerAutoSave, status: autoSaveStatus } = useAutoSave(async (configData: any) => {
    await authFetch('/api/widget/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
  }, 1200);

  const { trigger: autoSaveBotName, status: autoSaveBotNameStatus } = useAutoSave(
    async (value: string) => {
      await authFetch('/api/tenant/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botName: value })
      });
    }
  );

  const { trigger: autoSaveWelcomeMessage, status: autoSaveWelcomeMessageStatus } = useAutoSave(
    async (value: string) => {
      await authFetch('/api/tenant/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeMessage: value })
      });
    }
  );

  const { trigger: autoSaveCustomPersona, status: autoSaveCustomPersonaStatus } = useAutoSave(
    async (value: string) => {
      await authFetch('/api/tenant/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPersona: value })
      });
    }
  );

  const { trigger: autoSaveNotificationEmail, status: autoSaveNotificationEmailStatus } = useAutoSave(
    async (value: string) => {
      await authFetch('/api/tenant/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationEmail: value })
      });
    }
  );

  // Handle widget config save action
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus('saving');
    try {
      await authFetch('/api/widget/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName: cfgBotName,
          welcomeMessage: cfgWelcomeMessage,
          leadCaptureEnabled: cfgLeadCapture,
          bookingEnabled: cfgBooking,
          humanHandoffEnabled: cfgHandoff,
          confidenceDisplayEnabled: cfgConfidence,
          whatsappEnabled: cfgWhatsApp,
          whatsappNumber: cfgWhatsAppNumber,
          timeTriggerEnabled: cfgTimeTrigger,
          timeTriggerDelay: cfgTimeDelay,
          scrollTriggerEnabled: cfgScrollTrigger,
          scrollTriggerPercent: cfgScrollPercent,
          exitIntentEnabled: cfgExitIntent,
          idleTriggerEnabled: cfgIdleTrigger,
          position: cfgPosition,
          launcherEmoji: cfgLauncherEmoji,
          launcherLogoUrl: cfgLauncherLogoUrl,
          pulseEnabled: cfgPulseEnabled,
          theme: activeTheme.id,
          botTheme: cfgBotTheme,
          customAccent: cfgCustomAccent,
          vertical: cfgVertical,
          customPersona: cfgCustomPersona,
          widgetSkin: cfgWidgetSkin,
          exitFormHeadline: cfgExitFormHeadline,
          exitFormBody: cfgExitFormBody,
          exitFormBtnLabel: cfgExitFormBtnLabel
        })
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }
  };

  // Handle uploading brand logo icon for widget launcher setting
  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    
    // Size check (500KB limit)
    if (file.size > 500 * 1024) {
      setLogoError('Image size must be less than 500KB.');
      setTimeout(() => setLogoError(''), 5000);
      return;
    }

    setLogoUploading(true);
    setLogoError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await authFetch('/api/widget/upload-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              fileName: file.name,
              mimeType: file.type
            })
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'File upload failed');
          }

          const data = await res.json();
          setCfgLauncherLogoUrl(data.imageUrl);
          
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (xhrError: any) {
          console.error('Widget logo upload fail', xhrError);
          setLogoError(xhrError.message || 'Server upload failed.');
        } finally {
          setLogoUploading(false);
        }
      };
      reader.onerror = () => {
        setLogoError('Failed to read logo image file.');
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setLogoError('An interface reading error occurred.');
      setLogoUploading(false);
    }
  };
  useEffect(() => {
    if (!isLoggedIn) return;
    
    let computedBotAccent = '';
    let computedBotGradient = '';
    let computedBotLauncherGradient = '';

    if (cfgColorMode === 'solid') {
      computedBotAccent = cfgSolidColor;
      computedBotGradient = cfgSolidColor ? `linear-gradient(135deg, ${cfgSolidColor}, ${cfgSolidColor}cc)` : '';
      computedBotLauncherGradient = computedBotGradient;
    } else if (cfgColorMode === 'gradient') {
      computedBotAccent = cfgGradientStops[0]?.color ?? activeTheme.tokens.accent;
      computedBotGradient = buildGradientString(cfgGradientType, cfgGradientAngle, cfgGradientStops);
      computedBotLauncherGradient = computedBotGradient;
    } else if (cfgColorMode === 'glass') {
      const preset = GLASS_PRESETS[cfgGlassPreset];
      computedBotAccent = activeTheme.tokens.accent;
      computedBotGradient = preset.accentGradient;
      computedBotLauncherGradient = preset.launcherGradient;
    }

    // Always dispatch structural/behavioral config immediately
    const immediateConfig = {
      botName: cfgBotName,
      welcomeMessage: cfgWelcomeMessage,
      leadCaptureEnabled: cfgLeadCapture,
      bookingEnabled: cfgBooking,
      humanHandoffEnabled: cfgHandoff,
      confidenceDisplayEnabled: cfgConfidence,
      whatsappEnabled: cfgWhatsApp,
      whatsappNumber: cfgWhatsAppNumber,
      timeTriggerEnabled: cfgTimeTrigger,
      timeTriggerDelay: cfgTimeDelay,
      scrollTriggerEnabled: cfgScrollTrigger,
      scrollTriggerPercent: cfgScrollTrigger,
      exitIntentEnabled: cfgExitIntent,
      idleTriggerEnabled: cfgIdleTrigger,
      position: cfgPosition,
      launcherEmoji: cfgLauncherEmoji,
      pulseEnabled: cfgPulseEnabled,
      launcherLogoUrl: cfgLauncherLogoUrl,
      widgetSkin: cfgWidgetSkin,
      theme: activeTheme.id,
      botTheme: cfgBotTheme,
      _customBoxShadow: computedBoxShadow,
      exitFormHeadline: cfgExitFormHeadline,
      exitFormBody: cfgExitFormBody,
      exitFormBtnLabel: cfgExitFormBtnLabel,
    };

    const configData = {
      ...immediateConfig,
      customAccent: cfgCustomAccent,
      _botAccent: computedBotAccent,
      _botGradient: computedBotGradient,
      _botLauncherGradient: computedBotLauncherGradient,
    };

    // Color data: dispatch immediately for solid; defer for gradient/glass
    if (cfgColorMode === 'solid' || isFirstRun.current) {
      window.dispatchEvent(new CustomEvent('neslead-widget-config-live', {
        detail: configData
      }));
      isFirstRun.current = false;
    } else {
      // Dispatch structural changes without color data for gradient/glass
      window.dispatchEvent(new CustomEvent('neslead-widget-config-live', {
        detail: immediateConfig
      }));
    }

    // Trigger useAutoSave with configData
    triggerAutoSave(configData);
  }, [
    cfgBotName, cfgWelcomeMessage, cfgLeadCapture, cfgBooking, cfgHandoff,
    cfgConfidence, cfgWhatsApp, cfgWhatsAppNumber, cfgTimeTrigger, cfgTimeDelay,
    cfgScrollTrigger, cfgScrollPercent, cfgExitIntent, cfgIdleTrigger, cfgPosition,
    cfgLauncherEmoji, cfgPulseEnabled, activeTheme.id, cfgBotTheme, cfgCustomAccent, cfgLauncherLogoUrl, cfgWidgetSkin, isLoggedIn,
    cfgExitFormHeadline, cfgExitFormBody, cfgExitFormBtnLabel,
    cfgColorMode, cfgSolidColor, cfgGradientType, cfgGradientAngle, cfgGradientStops, cfgGlassPreset, cfgGlassBlur, cfgGlassOpacity,
    cfgShadowEnabled, cfgShadowColor, cfgShadowColorOpacity, cfgShadowX, cfgShadowY, cfgShadowBlur, cfgShadowSpread,
    cfgShadow2Enabled, cfgShadow2Color, cfgShadow2Opacity, cfgShadow2X, cfgShadow2Y, cfgShadow2Blur, cfgShadow2Spread,
    triggerAutoSave
  ]);

  const handleWizardComplete = async (
    themeId: ThemeId,
    wizardBotName: string,
    vertical: string,
    scraped: boolean,
    notificationEmail?: string,
    widgetPosition?: string,
    personaTone?: string,
    whatsappNumber?: string,
    avatarUrl?: string,
    humanHandoff?: boolean,
    businessHours?: { enabled: boolean; start: string; end: string; timezone: string; offlineMessage: string }
  ) => {
    const token = localStorage.getItem('neslead_session_token');
    try {
      await fetch('/api/tenant/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          botName: wizardBotName,
          primaryColor: '#6366F1',
          welcomeMessage: cfgWelcomeMessage || 'Hello! Choose an option or query our interactive assistant.',
          plan: signupIntentPlan || 'Starter',
          theme: themeId,
          vertical,
          scraped,
          notificationEmail: notificationEmail || '',
          widgetPosition: widgetPosition || 'right_bottom',
          personaTone: personaTone || 'professional',
          whatsappNumber: whatsappNumber || '',
          avatarUrl: avatarUrl || '',
          humanHandoff: humanHandoff ?? true,
          businessHours: businessHours || null
        })
      });

      // Optimistically update the local tenant profile state before other actions
      setTenantProfile(prev => prev ? { ...prev, onboarded: 1 } : prev);

      // Also clear any wizard draft from DB
      try {
        await fetch('/api/tenant/wizard-draft', {
          method: 'DELETE',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
      } catch (_) {}
    } catch (err) {
      console.error('Onboarding submission failed:', err);
    }

    // Clear all local draft data
    localStorage.removeItem('neslead_wizard_saved_progress');
    localStorage.removeItem('neslead_skipped_wizard');
    setSkippedWizard(false);
    setShowWizard(false);
    setWizardManuallyClosed(false);

    // Show confetti success modal (Task 18E adds this state)
    setShowOnboardingSuccess(true);
    // Auto-dismiss after 8 seconds
    setTimeout(() => setShowOnboardingSuccess(false), 8000);
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.6 }
        });
      }, 250);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { x: 0.3, y: 0.5 }
        });
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { x: 0.7, y: 0.5 }
        });
      }, 500);
    } catch (e) {
      console.error(e);
    }

    // Redirect: post-signup → Leads tab; later-stage → stay on dashboard showing summary
    if (isPostSignupWizard) {
      setIsLoggedIn(true);
      setActiveTab('leads');
    } else {
      setActiveTab('dashboard');
    }

    setIsPostSignupWizard(false);
    loadData();
  };

  const handleNavClick = (tabKey: any) => {
    const requiredTier = getTabLockTier(tabKey);
    if (requiredTier) {
      setUpgradeModalFeature(tabKey);
      setUpgradeModalOpen(true);
      setMobileMenuOpen(false);
      return;
    }
    if (tabKey === 'super_admin' && !pinUnlocked) {
      setShowPinModal(true);
      setPinInput('');
      setPinError('');
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    if (!isDesktop) return; // never collapse on mobile
    if (sidebarAnimatingRef.current) return; // prevent rapid double-clicks
    sidebarAnimatingRef.current = true;

    const nextCollapsed = !sidebarCollapsed;

    // GSAP animates the sidebar width — buttery smooth, 60fps
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: nextCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        duration: 0.35,
        ease: 'power3.inOut',
        onComplete: () => {
          sidebarAnimatingRef.current = false;
        }
      });
    }

    // Update React state and persist
    setSidebarCollapsed(nextCollapsed);
    try {
      localStorage.setItem('neslead_sidebar_collapsed', String(nextCollapsed));
    } catch {}
  };

  const handlePinSubmit = async (pinOverride?: string) => {
    const pin = pinOverride ?? pinInput;
    if (pin.length !== 4) return;
    setPinLoading(true);
    setPinError('');
    try {
      const res = await authFetch('/api/superadmin/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setPinUnlocked(true);
        localStorage.setItem('neslead_pin_unlocked', 'true');
        setShowPinModal(false);
        setPinInput('');
        setActiveTab('super_admin');
      } else {
        const data = await res.json().catch(() => ({}));
        setPinError(data.message || 'Incorrect PIN. Try again.');
        setPinInput('');
        setPinShake(true);
        setTimeout(() => setPinShake(false), 600);
      }
    } catch {
      setPinError('Network error. Please try again.');
      setPinInput('');
    } finally {
      setPinLoading(false);
    }
  };

  const handleToggleChecklistStep = async (id: number) => {
    let updatedSteps: typeof checklistSteps = [];
    setChecklistSteps(prev => {
      updatedSteps = prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
      return updatedSteps;
    });

    try {
      await authFetch('/api/tenant/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: updatedSteps })
      });
    } catch (err) {
      console.error('Error saving checklist step status:', err);
    }
  };

  const fetchConvStats = async () => {
    try {
      const res = await authFetch('/api/conversations/stats');
      if (res.ok) {
        const stats = await res.json();
        setConvStats(stats);
      }
    } catch (err) {
      console.error('Error fetching conversation stats:', err);
    }
  };

  // Shared Inbox active conversational operations
  const activeConversation = conversations.find(c => c.id === selectedConvId);

  const handleHijackTakeover = async (id: string) => {
    try {
      const res = await authFetch(`/api/conversations/${id}/takeover`, { method: 'POST' });
      if (res.ok) {
        const body = await res.json();
        setConversations(prev => prev.map(c => c.id === id ? (body.conversation || { ...c, status: 'ESCALATED' }) : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConversationStatus = async (id: string, newStatus: string) => {
    try {
      const res = await authFetch(`/api/conversations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const body = await res.json();
        setConversations(prev => prev.map(c => c.id === id ? (body.conversation || { ...c, status: newStatus }) : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAgentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReplyText.trim() || !selectedConvId) return;

    try {
      const res = await authFetch(`/api/conversations/${selectedConvId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: agentReplyText, role: 'AGENT' })
      });
      if (res.ok) {
        const bodyObj = await res.json();
        setConversations(prev => prev.map(c => {
          if (c.id === selectedConvId) {
            return bodyObj.conversation || c;
          }
          return c;
        }));
        setAgentReplyText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await authFetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedConvId === id) {
          setSelectedConvId(null);
        }
        setSelectedConvIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        fetchConvStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'mark_read') => {
    if (selectedConvIds.size === 0) return;
    try {
      const idsArray = Array.from(selectedConvIds);
      const res = await authFetch('/api/conversations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsArray, action })
      });
      if (res.ok) {
        if (action === 'delete') {
          setConversations(prev => prev.filter(c => !selectedConvIds.has(c.id)));
          setSelectedConvId(prev => (prev && selectedConvIds.has(prev)) ? null : prev);
        } else if (action === 'archive') {
          setConversations(prev => prev.map(c => selectedConvIds.has(c.id) ? { ...c, status: 'ARCHIVED' } : c));
        } else if (action === 'mark_read') {
          setConversations(prev => prev.map(c => selectedConvIds.has(c.id) ? { ...c, unreadCount: 0 } : c));
        }
        setSelectedConvIds(new Set());
        fetchConvStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const idsArray = conversations.map(c => c.id);
    if (idsArray.length === 0) return;
    try {
      const res = await authFetch('/api/conversations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsArray, action: 'mark_read' })
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => ({ ...c, unreadCount: 0 })));
        fetchConvStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeadInline = async () => {
    if (!selectedLead) return;
    try {
      const res = await authFetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editLeadStatus, score: Number(editLeadScore) })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedLead = data.lead;
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
        setSelectedLead(updatedLead);
        await loadData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Leads CRUD
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail) return;

    try {
      const res = await authFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newLeadName,
          email: newLeadEmail,
          phone: newLeadPhone,
          country: newLeadCountry,
          programInterest: newLeadProgram,
          status: 'COLD', // admin-created leads start as COLD by default
          score: 50
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(prev => [data.lead, ...prev]); // optimistic prepend instead of full reload
        setShowAddLeadModal(false);
        // Reset ALL form fields including country and program
        setNewLeadName('');
        setNewLeadEmail('');
        setNewLeadPhone('');
        setNewLeadCountry('Canada');
        setNewLeadProgram('Executive MBA (EN/FR)');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to permanently delete this lead? This action cannot be undone.");
    if (!isConfirmed) return;
    try {
      await authFetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Programs CRUD
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName) return;

    try {
      const res = await authFetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProgName,
          // Type (a): Only non-education categories combine category/department and delivery mode into a single string
          department: cfgVertical === 'education' ? newProgDept : `${newProgDept} · ${newProgDeliveryMode}`,
          duration: newProgDuration,
          fees: newProgFees,
          capacityBadge: newProgBadge,
          description: newProgDesc
        })
      });
      if (res.ok) {
        const item = await res.json();
        setPrograms(v => [...v, item]);
        setShowAddProgModal(false);
        setNewProgName('');
        setNewProgDesc('');
        setNewProgDept('Business');
        setNewProgDuration('2 Years');
        setNewProgFees('$12,000 / Year');
        setNewProgBadge('Limited seats');
        setNewProgDeliveryMode('Remote');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await authFetch(`/api/programs/${id}`, { method: 'DELETE' });
      setPrograms(v => v.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveServiceFromBuilder = async (data: {
    programId?: string;
    name: string;
    department: string;
    duration: string;
    fees: string;
    capacityBadge: string;
    description: string;
    formSchema: FormField[];
    published: boolean;
    formBg?: string;
    formLogoUrl?: string;
    formLogoPosition?: 'top-left' | 'top-right' | 'top-center';
    formBgBlendMode?: string;
    formBgSize?: 'cover' | 'contain' | 'auto';
    formBgOpacity?: number;
  }) => {
    try {
      const isEdit = !!data.programId;
      const url = isEdit ? `/api/programs/${data.programId}` : '/api/programs';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          department: data.department,
          duration: data.duration,
          fees: data.fees,
          capacityBadge: data.capacityBadge,
          description: data.description,
          formSchema: data.formSchema,
          published: data.published,
          formBg: data.formBg,
          formLogoUrl: data.formLogoUrl,
          formLogoPosition: data.formLogoPosition,
          formBgBlendMode: data.formBgBlendMode,
          formBgSize: data.formBgSize,
          formBgOpacity: data.formBgOpacity
        })
      });
      if (res.ok) {
        const item = await res.json();
        if (isEdit) {
          setPrograms(v => v.map(p => p.id === data.programId ? item : p));
        } else {
          setPrograms(v => [...v, item]);
          setSelectedBuilderProgramId(item.id);
        }
        return item;
      } else {
        throw new Error('Failed to save program from builder');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const exportToCSV = () => {
    // Collect headers
    const headers = [
      'Lead ID',
      'Full Name',
      'Email',
      'Phone Number',
      'Country',
      'City',
      'Program / Service Interest',
      'Target Timeline',
      'RAG Score',
      'Status',
      'Source',
      'Registered At'
    ];
    
    // Build CSV lines
    const rows = filteredLeads.map(l => [
      l.id                                    ?? '',
      l.fullName                              ?? '',
      l.email                                 ?? '',
      l.phone                                 ?? '',
      l.country                               ?? '',
      l.city                                  ?? '',
      l.programInterest                       ?? '',
      l.startDate                             ?? '',
      String(l.score                          ?? 0),
      l.status                                ?? 'COLD',
      l.source                                ?? '',
      l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToDocx = async () => {
    const dateStr = new Date().toLocaleDateString();
    const tenantName = tenantProfile?.name || 'NesLead';

    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        'Full Name',
        'Email',
        'Phone',
        'Country',
        'Program / Service Interest',
        'Timeline',
        'Score',
        'Status',
      ].map(
        (label) =>
          new TableCell({
            shading: { fill: 'F3F4F6' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'D1D5DB' },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    bold: true,
                    size: 18,
                    color: '374151',
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          })
      ),
    });

    const dataRows = filteredLeads.map(
      (l) =>
        new TableRow({
          children: [
            l.fullName ?? '',
            l.email ?? '',
            l.phone ?? '',
            l.country ?? '',
            l.programInterest ?? '',
            l.startDate ?? '',
            String(l.score ?? 0),
            l.status ?? 'COLD',
          ].map(
            (value) =>
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
                  left: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
                  right: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: value,
                        size: 18,
                        color: '4B5563',
                        font: 'Segoe UI',
                      }),
                    ],
                  }),
                ],
              })
          ),
        })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'NesLead — Qualified Leads Export Report',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${tenantName} · Generated on ${dateStr} · ${filteredLeads.length} record(s) · Filter: ${activeLeadFilter}`,
                  size: 18,
                  color: '6B7280',
                  font: 'Segoe UI',
                }),
              ],
              spacing: { after: 400 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [headerRow, ...dataRows],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `\nExported by NesLead Platform · ${new Date().toISOString()}`,
                  size: 16,
                  color: '9CA3AF',
                  font: 'Segoe UI',
                  italics: true,
                }),
              ],
              spacing: { before: 600 },
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_report_${Date.now()}.docx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const dateStr = new Date().toLocaleDateString();
    const tenantName = tenantProfile?.name || 'NesLead';

    // Header block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39); // #111827
    doc.text('Qualified Leads Export Report', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // #6B7280
    doc.text(
      `${tenantName}  ·  Generated: ${dateStr}  ·  Records: ${filteredLeads.length}  ·  Filter: ${activeLeadFilter}`,
      14,
      25
    );

    // Divider line
    doc.setDrawColor(229, 231, 235); // #E5E7EB
    doc.setLineWidth(0.3);
    doc.line(14, 28, 283, 28);

    // Table
    autoTable(doc, {
      startY: 33,
      head: [
        ['Full Name', 'Email', 'Phone', 'Country', 'Program / Service', 'Timeline', 'Score', 'Status'],
      ],
      body: filteredLeads.map((l) => [
        l.fullName || 'N/A',
        l.email || 'N/A',
        l.phone || 'N/A',
        l.country || 'N/A',
        l.programInterest || 'N/A',
        l.startDate || 'N/A',
        String(l.score || 0),
        l.status || 'COLD',
      ]),
      headStyles: {
        fillColor: [243, 244, 246],   // #F3F4F6
        textColor: [55, 65, 81],      // #374151
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [75, 85, 99],      // #4B5563
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],   // #F9FAFB
      },
      columnStyles: {
        0: { cellWidth: 38 },  // Full Name
        1: { cellWidth: 52 },  // Email
        2: { cellWidth: 30 },  // Phone
        3: { cellWidth: 22 },  // Country
        4: { cellWidth: 42 },  // Program
        5: { cellWidth: 22 },  // Timeline
        6: { cellWidth: 14 },  // Score
        7: { cellWidth: 18 },  // Status
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [229, 231, 235],
      tableLineWidth: 0.1,
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175); // #9CA3AF
      doc.text(
        `NesLead Platform · Lead Export · Page ${i} of ${pageCount}`,
        148.5,
        205,
        { align: 'center' }
      );
    }

    doc.save(`leads_export_${Date.now()}.pdf`);
  };

  // Filter leads matches search and categories
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(leadQuery.toLowerCase()) || 
                          l.email.toLowerCase().includes(leadQuery.toLowerCase()) || 
                          l.country.toLowerCase().includes(leadQuery.toLowerCase());
    const matchesFilter = activeLeadFilter === 'ALL' || l.status === activeLeadFilter;
    const matchesSource = leadSourceFilter === 'ALL' || l.source === leadSourceFilter;
    return matchesSearch && matchesFilter && matchesSource;
  });

  // Calculate quick indicators
  const totalLeadsCount = leads.length;
  const hotLeadsCount = leads.filter(l => l.status === 'HOT').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'CONVERTED').length;

  // LANDING PAGE SCREEN VIEW
  if (!isLoggedIn && !showWizard) {
    if (showAuth) {
      return (
        <motion.div 
          id="auth_wrapper" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center relative transition-colors duration-300 w-full" 
          style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
        >
          {isAdminRoute && (
            /* Super admin route — show branded admin header above the auth form */
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              <div className="p-2 rounded-xl text-white flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight block">NesLead <span style={{ color: '#10b981' }}>Admin</span></span>
                <span className="text-[9px] font-bold text-neutral-400 block tracking-widest uppercase">Platform Team Access</span>
              </div>
            </div>
          )}
          <AuthPage 
            initialMode={authInitialMode}
            onSuccess={(token, email) => {
              localStorage.setItem('neslead_session_token', token);
              localStorage.setItem('neslead_email', email);
              setShowAuth(false);
              checkUserSession(token);
            }}
            onCancel={() => {
              setShowAuth(false);
            }}
          />
          {/* No FloatingWidget on /admin route — super admins don't need the provider bot */}
          {!isAdminRoute && <FloatingWidget deployMode="platform" tenantPlan={tenantProfile?.plan} />}
        </motion.div>
      );
    }

    // If someone navigates directly to /admin but hasn't triggered showAuth yet, auto-trigger login
    if (isAdminRoute) {
      // Immediately show auth form for /admin route
      if (!showAuth) {
        setTimeout(() => {
          setAuthInitialMode('login');
          setShowAuth(true);
        }, 0);
      }
    }

    return (
      <motion.div 
        id="landing_wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <LandingPage 
          onStartDemo={(selectedPlan) => {
            const plan = selectedPlan || 'Starter';
            setSignupIntentPlan(plan);
            localStorage.setItem('neslead_signup_intent_plan', plan);
            setAuthInitialMode('signup');
            setShowAuth(true);
          }}
          onLogin={() => {
            setAuthInitialMode('login');
            setShowAuth(true);
          }}
        />
        <FloatingWidget disableExitIntent={true} deployMode="platform" tenantPlan={tenantProfile?.plan} />
      </motion.div>
    );
  }



  // Show a beautiful, high-contrast theme-adaptive loader to prevent sudden splashes or race conditions on initialization
  if (isLoggedIn && loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
      >
        <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/15 animate-ping duration-1000" />
            <div className="p-5 rounded-2xl text-white flex items-center justify-center shadow-lg animate-spin" style={{ background: 'var(--accent-gradient)', animationDuration: '3s' }}>
              <RefreshCcw className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Synchronizing Workspace</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Retrieving your insights, conversational histories, and configurations securely...
            </p>
          </div>

          <div className="w-full space-y-3 pt-4 opacity-40">
            <div className="h-4 w-2/3 rounded-md bg-zinc-500/30 mx-auto animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-zinc-500/20 animate-pulse" />
            <div className="h-20 w-full rounded-2xl bg-zinc-500/20 animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Intercept widget embed requests (FIX-005)
  const isWidgetEmbedMode = window.location.pathname === '/widget-embed';
  if (isWidgetEmbedMode) {
    return (
      <div className="w-full h-full min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden" style={{ colorScheme: 'light' }}>
        <FloatingWidget tenantPlan={tenantProfile?.plan} />
      </div>
    );
  }

  // COMPREHENSIVE B2B SAAS PORTAL VIEW
  return (
    <motion.div 
      id="saas_dashboard_root" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col md:flex-row transition-colors duration-300 relative w-full" 
      style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      
      {/* Mobile/Tablet Top Sticky Navigation Bar */}
      <div className="flex md:hidden items-center justify-between px-5 py-3.5 border-b shrink-0 z-40 sticky top-0" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl text-white flex items-center justify-center shadow shadow-accent" style={{ background: 'var(--accent-gradient)' }}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight block">Nes<span style={{ color: 'var(--color-accent)' }}>Lead</span></span>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1 px-3 text-[10px] uppercase tracking-wider font-extrabold border rounded-xl transition cursor-pointer flex items-center gap-1.5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
        >
          <span>{mobileMenuOpen ? 'Close Menu' : 'Open Menu'}</span>
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation Drawer */}
      <aside 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 border-r shrink-0 flex flex-col justify-between z-50 transition-transform duration-300 md:relative md:translate-x-0 md:flex h-full
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `} 
        style={{ 
          borderColor: 'var(--color-border)', 
          backgroundColor: 'var(--color-bg-card)',
          // GSAP controls width on desktop. On mobile, always full-width drawer.
          width: undefined, // GSAP sets this inline; don't hardcode it in JSX
          minWidth: isDesktop ? undefined : (effectiveCollapsed ? '72px' : '256px'), // dynamic minWidth to allow GSAP transition on desktop without snapping
        }}
      >
        {/* Floating Collapse/Expand Toggle Button (Desktop only) */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:flex absolute top-[26px] -right-3.5 w-7 h-7 rounded-full border items-center justify-center cursor-pointer z-[100] shadow-md transition-all hover:scale-110"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          title={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: effectiveCollapsed ? 180 : 0 }}
            transition={{ duration: 0.35, ease: [0.87, 0, 0.13, 1] }}
            className="flex items-center justify-center"
          >
            <PanelLeftClose className="w-4 h-4" />
          </motion.div>
        </button>
        
        <div className={`flex flex-col flex-1 ${effectiveCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
          {/* Logo brand */}
          <div 
            className="border-b flex items-center overflow-hidden shrink-0 relative h-20 transition-all duration-350"
            style={{ 
              borderBottomColor: 'var(--color-border)',
              paddingLeft: effectiveCollapsed ? '16px' : '24px',
              paddingRight: effectiveCollapsed ? '16px' : '24px',
            }}
          >
            {/* Logo icon — always visible, centered when collapsed */}
            <div 
              className="p-2.5 rounded-xl text-white flex items-center justify-center shadow shadow-accent shrink-0"
              style={{ background: 'var(--accent-gradient)' }}
            >
              <Zap className="w-5 h-5" />
            </div>

            {/* Brand text — fades + slides out on collapse */}
            <AnimatePresence mode="wait">
              {!effectiveCollapsed && (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="ml-2 overflow-hidden whitespace-nowrap"
                >
                  <span className="text-xl font-bold tracking-tight block">
                    Nes<span className="text-accent underline decoration-wavy" style={{ color: 'var(--color-accent)' }}>Lead</span>
                  </span>
                  <span className="text-[9px] font-bold text-neutral-400 block tracking-widest uppercase mt-0.5">
                    Lead Intelligence Platform
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile identifier block - adapted beautifully to selected themes */}
          <div 
            onClick={() => handleNavClick('profile')}
            className="border-b flex items-center cursor-pointer hover:opacity-90 transition-all overflow-hidden shrink-0"
            style={{ 
              borderBottomColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-bg-secondary)',
              padding: effectiveCollapsed ? '12px 14px' : '16px',
              justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
              transition: 'padding 0.35s cubic-bezier(0.87,0,0.13,1)',
            }}
            title={effectiveCollapsed ? (tenantProfile?.name || 'Profile') : undefined}
          >
            {/* Avatar — always visible */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-sm border shadow-inner shrink-0" 
              style={{ backgroundColor: 'var(--color-border)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {tenantProfile?.profile_image_url ? (
                <img src={tenantProfile.profile_image_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (tenantProfile?.name || tenantProfile?.email || 'E').charAt(0).toUpperCase()
              )}
            </div>

            {/* Name + role — fades + slides out on collapse */}
            <AnimatePresence mode="wait">
              {!effectiveCollapsed && (
                <motion.div
                  key="profile-text"
                  initial={{ opacity: 0, width: 0, x: -8 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="min-w-0 flex-1 ml-3 overflow-hidden whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h5 className="text-xs font-black leading-none truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {tenantProfile?.name || 'Emmanuel J.'}
                    </h5>
                    {tenantProfile?.isSuperAdmin ? (
                      /* Super admin green badge — shows the specific platform role */
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white tracking-widest bg-emerald-600 font-mono leading-none border border-emerald-400">
                        {platformRole === 'PLATFORM_OWNER'
                          ? 'SUPER ADMIN'
                          : platformRole === 'SUPPORT_AGENT'
                          ? 'SUPPORT'
                          : platformRole === 'FINANCE_ADMIN'
                          ? 'FINANCE'
                          : platformRole === 'SALES_AGENT'
                          ? 'SALES'
                          : platformRole === 'PLATFORM_MANAGER'
                          ? 'MANAGER'
                          : 'ADMIN'}
                      </span>
                    ) : !isTrialActive ? (
                      /* Regular client — shows their plan */
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white tracking-widest bg-emerald-500 font-mono leading-none">
                        {tenantProfile?.plan || 'Starter'}
                      </span>
                    ) : (
                      /* Regular client on trial */
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 tracking-widest font-mono leading-none">
                        TRIAL
                      </span>
                    )}
                  </div>

                  {tenantProfile?.isSuperAdmin ? (
                    /* Super admin subtitle line */
                    <span className="text-[9px] font-bold uppercase font-mono block mt-1 truncate" style={{ color: '#10b981' }}>
                      NesLead Platform Team
                    </span>
                  ) : (
                    /* Regular client subtitle line — shows Owner + email prefix */
                    <span className="text-[9px] font-bold uppercase font-mono block mt-1 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      Owner • {tenantProfile?.email ? tenantProfile.email.split('@')[0] : 'Account'}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Standard Navigation tabs lists with dynamic highlight matching */}
          <div className={`space-y-1 select-none ${effectiveCollapsed ? 'overflow-visible' : 'overflow-hidden'} ${effectiveCollapsed ? 'px-2 py-4' : 'p-4'}`} style={{ transition: 'padding 0.35s cubic-bezier(0.87,0,0.13,1)' }}>

            <NavButton
              tabKey="dashboard"
              icon={<Compass className="w-4.5 h-4.5" />}
              label={<span>{translate('dashboard')}</span>}
              active={activeTab === 'dashboard'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('dashboard')}
              tooltip="Dashboard"
            />

            <NavButton
              tabKey="leads"
              icon={<Users className="w-4.5 h-4.5" />}
              label={<span>{translate('leads')}</span>}
              active={activeTab === 'leads'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('leads')}
              tooltip="Leads"
              badge={
                leads.length > 0
                  ? <span className="bg-neutral-100 text-neutral-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">{leads.length}</span>
                  : undefined
              }
            />

            <NavButton
              tabKey="conversations"
              icon={<Inbox className="w-4.5 h-4.5" />}
              label={<span>{translate('conversations')}</span>}
              active={activeTab === 'conversations'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('conversations')}
              tooltip="Live Inbox"
              badge={
                conversations.filter(c => (c.unreadCount || 0) > 0).length > 0
                  ? <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                      {conversations.filter(c => (c.unreadCount || 0) > 0).length} unread
                    </span>
                  : undefined
              }
            />

            <NavButton
              tabKey="kb"
              icon={<Database className="w-4.5 h-4.5" />}
              label={<span>{translate('knowledgeBase')}</span>}
              active={activeTab === 'kb'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('kb')}
              tooltip="Knowledge Base"
            />

            <NavButton
              tabKey="programs"
              icon={<BookOpen className="w-4.5 h-4.5" />}
              label={<span>{cfgVertical === 'education' ? translate('programs') : getTermOverrides(cfgVertical).servicePlural}</span>}
              active={activeTab === 'programs'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('programs')}
              tooltip={cfgVertical === 'education' ? 'Programs' : getTermOverrides(cfgVertical).servicePlural}
            />

            <NavButton
              tabKey="appointments"
              icon={<CalendarIcon className="w-4.5 h-4.5" />}
              label={<span>{translate('appointments')}</span>}
              active={activeTab === 'appointments'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('appointments')}
              tooltip="Appointments"
              badge={getTabLockTier('appointments') ? <Lock className="w-3.5 h-3.5 text-amber-500 opacity-80" /> : undefined}
            />

            <NavButton
              tabKey="reports"
              icon={<BarChart3 className="w-4.5 h-4.5" />}
              label={<span>{translate('reports')}</span>}
              active={activeTab === 'reports'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('reports')}
              tooltip="Reports"
              badge={getTabLockTier('reports') ? <Lock className="w-3.5 h-3.5 text-amber-500 opacity-80" /> : undefined}
            />

            <NavButton
              tabKey="widget_config"
              icon={<Settings className="w-4.5 h-4.5" />}
              label={<span>{translate('widgetConfig')}</span>}
              active={activeTab === 'widget_config'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('widget_config')}
              tooltip="Widget Config"
            />

            <NavButton
              tabKey="integrations"
              icon={<Link2 className="w-4.5 h-4.5" />}
              label={<span>Integrations</span>}
              active={activeTab === 'integrations'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('integrations')}
              tooltip="Integrations"
              badge={
                getTabLockTier('integrations')
                  ? <Lock className="w-3.5 h-3.5 text-amber-500 opacity-80" />
                  : <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono animate-pulse">New</span>
              }
            />

            <NavButton
              tabKey="voice_settings"
              icon={<Phone className="w-4.5 h-4.5" />}
              label={<span>Voice Agent</span>}
              active={activeTab === 'voice_settings'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('voice_settings')}
              tooltip="Voice Agent"
              badge={<span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono animate-pulse">Beta</span>}
            />

            <NavButton
              tabKey="billing"
              icon={<CreditCard className="w-4.5 h-4.5" />}
              label={<span>{translate('billing')}</span>}
              active={activeTab === 'billing'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('billing')}
              tooltip="Billing"
            />

            <NavButton
              tabKey="team"
              icon={<Users className="w-4.5 h-4.5" />}
              label={<span>Team Members</span>}
              active={activeTab === 'team'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('team')}
              tooltip="Team Members"
              badge={getTabLockTier('team') ? <Lock className="w-3.5 h-3.5 text-amber-500 opacity-80" /> : undefined}
            />

            <NavButton
              tabKey="setup_wizard"
              icon={<Wand2 className="w-4.5 h-4.5" />}
              label={<span>Setup Wizard</span>}
              active={activeTab === 'setup_wizard'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('setup_wizard')}
              tooltip="Setup Wizard"
              badge={
                tenantProfile?.onboarded !== 1
                  ? <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-mono">Todo</span>
                  : <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono">Done</span>
              }
            />

            <NavButton
              tabKey="profile"
              icon={<User className="w-4.5 h-4.5" />}
              label={<span>User Profile</span>}
              active={activeTab === 'profile'}
              collapsed={effectiveCollapsed}
              onClick={() => handleNavClick('profile')}
              tooltip="User Profile"
            />

            {tenantProfile?.isSuperAdmin && (
              <NavButton
                tabKey="super_admin"
                icon={<ShieldCheck className="w-4.5 h-4.5" />}
                label={<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Admin Panel</span>}
                active={activeTab === 'super_admin'}
                collapsed={effectiveCollapsed}
                onClick={() => handleNavClick('super_admin')}
                tooltip="Admin Panel"
              />
            )}

          </div>
        </div>

        {/* Global togglers & Logout */}
        <div 
          className={`border-t shrink-0 ${effectiveCollapsed ? 'overflow-visible' : 'overflow-hidden'}`}
          style={{ 
            borderTopColor: 'var(--color-border)',
            padding: effectiveCollapsed ? '12px 8px' : '16px',
            transition: 'padding 0.35s cubic-bezier(0.87,0,0.13,1)',
          }}
        >
          <AnimatePresence mode="wait">
            {!effectiveCollapsed ? (
              // EXPANDED: full theme + language + logout
              <motion.div
                key="footer-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                {/* Theme switcher */}
                <div className="flex rounded-lg p-1 text-xs font-semibold border items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <span className="text-[10px] pl-2 font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Theme</span>
                  <select
                    value={activeTheme.id}
                    onChange={(e) => setThemeById(e.target.value as ThemeId)}
                    className="bg-transparent rounded px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold focus:outline-none cursor-pointer"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {Object.entries(THEMES).map(([id, t]) => (
                      <option key={id} value={id} style={{ backgroundColor: t.tokens.bg_primary, color: t.tokens.text_primary }}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Language Switcher */}
                <div className="flex rounded-lg p-1 text-xs font-semibold border items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                  <span className="text-[10px] pl-2 font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Language</span>
                  <div className="flex gap-1">
                    <button onClick={() => setIsLanguage('en')} className="px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer"
                      style={activeLanguage === 'en' ? { backgroundColor: 'var(--color-accent)', color: '#FFFFFF' } : { color: 'var(--color-text-secondary)' }}>EN</button>
                    <button onClick={() => setIsLanguage('fr')} className="px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer"
                      style={activeLanguage === 'fr' ? { backgroundColor: 'var(--color-accent)', color: '#FFFFFF' } : { color: 'var(--color-text-secondary)' }}>FR</button>
                  </div>
                </div>

                {/* Logout */}
                <button 
                  onClick={() => {
                    localStorage.removeItem('neslead_session_token');
                    localStorage.removeItem('neslead_email');
                    localStorage.removeItem('neslead_skipped_wizard');
                    localStorage.removeItem('neslead_dismissed_setup_popup');
                    setPinUnlocked(false); localStorage.removeItem('neslead_pin_unlocked'); setPinInput(''); setPinError('');
                    setShowPinModal(false); setSkippedWizard(false); setIsLoggedIn(false);
                    setShowWizard(false); setWizardManuallyClosed(false);
                    setTenantProfile(null); setPlatformRole(null); setActiveTab('dashboard');
                  }}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer border"
                  style={{ borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.06)', color: '#ef4444' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor='rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.45)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor='rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.25)'; }}
                >
                  <LogOut className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
                  <span>Log Out</span>
                </button>
              </motion.div>
            ) : (
              // COLLAPSED: icon-only vertical stack with tooltips
              <motion.div
                key="footer-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col items-center gap-2"
              >
                {/* Theme icon with tooltip */}
                <div className="relative group w-full flex justify-center">
                  <button
                    className="p-2 rounded-xl cursor-pointer transition-colors hover:bg-neutral-200/10"
                    style={{ color: 'var(--color-text-secondary)' }}
                    title="Theme"
                    onClick={() => setSidebarCollapsed(false)} // expand to access theme
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200] px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                    Expand for Theme & Language
                  </div>
                </div>

                {/* Logout icon */}
                <div className="relative group w-full flex justify-center">
                  <button
                    className="p-2 rounded-xl cursor-pointer transition-colors hover:bg-red-500/10"
                    style={{ color: '#ef4444' }}
                    title="Log Out"
                    onClick={() => {
                      localStorage.removeItem('neslead_session_token');
                      localStorage.removeItem('neslead_email');
                      localStorage.removeItem('neslead_skipped_wizard');
                      localStorage.removeItem('neslead_dismissed_setup_popup');
                      setPinUnlocked(false); localStorage.removeItem('neslead_pin_unlocked'); setPinInput(''); setPinError('');
                      setShowPinModal(false); setSkippedWizard(false); setIsLoggedIn(false);
                      setShowWizard(false); setWizardManuallyClosed(false);
                      setTenantProfile(null); setPlatformRole(null); setActiveTab('dashboard');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200] px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                    Log Out
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </aside>

      {/* Main Page Area Container */}
      <main 
        className="flex-1 overflow-y-auto px-6 py-8 transition-all duration-350"
        style={{ 
          // On desktop, the sidebar width is managed by GSAP, so main flexes to fill the rest.
          // No manual margin needed because the sidebar is in the same flex row.
          // However, set min-width to prevent content compression on collapse.
          minWidth: 0,
        }}
      >
        {/* ── Trial Expired Top Banner ── */}
        {isTrialExpired && (
          <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 text-white text-xs font-bold shadow-lg animate-fade-in"
            style={{ background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)' }}
          >
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>Your 7-day free trial has ended. Upgrade to keep your leads, widgets, and AI responses active.</span>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="ml-4 px-3 py-1 rounded-lg bg-white text-red-600 font-black text-[11px] hover:bg-red-50 transition-all cursor-pointer shrink-0"
            >
              Upgrade Now →
            </button>
          </div>
        )}

        {/* ── Main App Content (always rendered, but data is blurred if trial expired) ── */}
        <div style={{ marginTop: isTrialExpired ? '40px' : '0' }}>
          <GsapTransition activeKey={activeTab}>
            {/* Onboarding Setup checklist conditional display layout progress indicator */}
            {activeTab === 'dashboard' && showChecklist && !tenantProfile?.isSuperAdmin && (
          <OnboardingChecklist 
            steps={checklistSteps}
            onToggleStep={handleToggleChecklistStep}
            onDismiss={() => setShowChecklist(false)}
            onNavigateTab={(tabKey) => { setActiveTab(tabKey); }}
          />
        )}

        {/* TAB 1: Dashboard overview stats indicators */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6" style={{ color: 'var(--color-text-primary)' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Lead Intelligence Panel</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Track real-time candidate leads, AI confidence indexes, and scheduled orientation counseling appointments.</p>
              </div>

              {/* Language Switch */}
              <div className="flex bg-zinc-100 rounded-lg p-0.5 text-xs font-semibold border border-zinc-200 self-start shrink-0">
                <button
                  onClick={() => setIsLanguage('en')}
                  className={`px-3 py-1 rounded-md transition-all ${activeLanguage === 'en' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setIsLanguage('fr')}
                  className={`px-3 py-1 rounded-md transition-all ${activeLanguage === 'fr' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'}`}
                >
                  Français
                </button>
              </div>
            </div>

            {/* Trial Quota status and update plan */}
            {isTrialActive && !tenantProfile?.isSuperAdmin && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
                <div className="flex gap-2.5 items-start text-xs text-amber-950">
                  <Shield className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold">
                      {trialDaysRemaining > 0
                        ? trialDaysRemaining === 1
                          ? `⏳ Last day! ${trialHoursRemaining} hours remaining on your free trial — upgrade now.`
                          : `⏳ ${trialDaysRemaining} days left on your free trial — upgrade to keep all features active.`
                        : '🔒 Your 7-day free trial has ended. Upgrade to restore full access.'}
                    </h5>
                    <p className="text-[10px] text-amber-700 font-medium">Capture lead parameters, configure custom scrapers, and schedule consultation slots.</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('billing')}
                  className="px-4 py-2 border rounded-xl bg-white border-amber-300 text-amber-950 text-xs font-bold transition shadow-sm hover:bg-neutral-50 shrink-0 self-start cursor-pointer"
                >
                  {translate('upgradeNow')}
                </button>
              </div>
            )}

            {/* KPI statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Total Captured Leads</span>
                <span className="text-3xl font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{leads.length}</span>
                <span className="text-[10px] block font-medium leading-normal break-words" style={{ color: 'var(--color-text-secondary)' }}>Captured from London, Nigeria, Canada</span>
              </div>

              <div className="border rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>High Rating HOT Prospects</span>
                <span className="text-3xl font-black block font-mono" style={{ color: 'var(--color-accent)' }}>{hotLeadsCount} leads</span>
                <span className="text-[10px] font-bold inline-block rounded-md px-2 py-0.5 max-w-max text-center break-words" style={{ color: 'var(--badge-text)', backgroundColor: 'var(--badge-bg)' }}>
                  ★ Active Orientation Candidate
                </span>
              </div>

              <div className="border rounded-2xl p-5 shadow-sm space-y-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Active schedules</span>
                <span className="text-3xl font-black block font-mono leading-tight" style={{ color: 'var(--color-text-primary)' }}>{appointments.length} confirmed</span>
                <span className="text-[10px] block font-medium leading-normal break-words" style={{ color: 'var(--color-text-secondary)' }}>Pending channel & video integrations</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Confirmed Appointments list ledger */}
              <div className="lg:col-span-6 border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <CalendarIcon className="w-4.5 h-4.5" style={{ color: 'var(--color-accent)' }} />
                    <span>Admissions Interventions Ledger</span>
                  </h3>
                  <button onClick={() => setActiveTab('appointments')} className="text-[10px] font-extrabold text-accent hover:underline" style={{ color: 'var(--color-accent)' }}>
                    See all
                  </button>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {appointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="py-4 flex justify-between items-center text-xs first:pt-0 last:pb-0" style={{ borderBottomColor: 'var(--color-border)' }}>
                      <div className="space-y-0.5">
                        <span className="font-extrabold block" style={{ color: 'var(--color-text-primary)' }}>{appt.leadName}</span>
                        <span className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>{appt.program}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[11px] block" style={{ color: 'var(--color-text-primary)' }}>{appt.date} @ {appt.time}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 font-mono" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                          {appt.type} CONFIRMED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent hot leads lists */}
              <div className="lg:col-span-6 border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <Users className="w-4.5 h-4.5" style={{ color: 'var(--color-accent)' }} />
                    <span>Recent Student Leads Captured</span>
                  </h3>
                  <button onClick={() => setActiveTab('leads')} className="text-[10px] font-extrabold text-accent hover:underline" style={{ color: 'var(--color-accent)' }}>
                    Manager Leads
                  </button>
                </div>

                <div className="space-y-3">
                  {leads.slice(0, 4).map((l) => (
                    <div key={l.id} className="p-3 border rounded-xl flex items-center justify-between hover:opacity-85 transition-colors" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                      <div className="space-y-0.5">
                        <span className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>{l.fullName}</span>
                        <span className="text-[10px] block font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                          <span
                            style={isTrialExpired ? {
                              filter: 'blur(5px)',
                              userSelect: 'none',
                              cursor: 'not-allowed',
                              pointerEvents: 'none'
                            } : {}}
                            title={isTrialExpired ? 'Upgrade to view contact details' : undefined}
                          >
                            {l.email}
                          </span>
                          <span> • {l.country}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full" style={l.status === 'HOT' ? { backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' } : l.status === 'CONVERTED' ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' } : { backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)' }}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live Embed status warning indicator */}
            <div className="p-5 bg-zinc-900 text-zinc-100 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3 w-full lg:w-auto">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center animate-spin-slow shrink-0 mt-0.5 lg:mt-0">
                  <Compass className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold">Copy widget snippet tag for your site</h4>
                  <p className="text-[10px] text-neutral-400 leading-normal">You can inspect live clicks, interaction matrices, and triggers synced into your dashboard once embeded.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('widget_config')}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer w-full lg:w-auto justify-center hover:opacity-90 active:scale-98"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <span>Embed Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>
        )}

        {/* TAB 2: Leads management screen */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Leads Directory</h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Track dynamic conversion pipelines, geographic customer metrics, and synchronize business interaction calls in real-time.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Clean export buttons */}
                <div className="flex items-center gap-1 w-full sm:w-auto p-1 border rounded-xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <button
                    onClick={exportToCSV}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 transition text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                    style={{ color: 'var(--color-text-primary)' }}
                    title="Export directory as standard Microsoft Excel spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV / Excel</span>
                  </button>
                  <button
                    onClick={() => { exportToDocx(); }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 transition text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                    style={{ color: 'var(--color-text-primary)' }}
                    title="Export as Word Document (.docx)"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Word</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 transition text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                    style={{ color: 'var(--color-text-primary)' }}
                    title="Export directory as high-fidelity PDF Document"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow cursor-pointer shadow-accent animate-none"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Manual Insert</span>
                </button>
              </div>
            </div>

            {/* Filter toolbars lists */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-1.5 self-start md:self-auto text-xs font-bold select-none overflow-x-auto w-full md:w-auto" style={{ color: 'var(--color-text-secondary)' }}>
                <button
                  onClick={() => setActiveLeadFilter('ALL')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'ALL' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  All Leads ({leads.length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('HOT')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'HOT' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  HOT ({leads.filter(l => l.status === 'HOT').length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('WARM')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'WARM' ? { backgroundColor: '#F59E0B', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  Warm ({leads.filter(l => l.status === 'WARM').length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('CONTACTED')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'CONTACTED' ? { backgroundColor: '#3B82F6', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  Contacted ({leads.filter(l => l.status === 'CONTACTED').length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('CONVERTED')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'CONVERTED' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  Converted ({leads.filter(l => l.status === 'CONVERTED').length})
                </button>
                <button
                  onClick={() => setActiveLeadFilter('COLD')}
                  className="px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  style={activeLeadFilter === 'COLD' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-secondary)' }}
                >
                  Cold ({leads.filter(l => l.status === 'COLD').length})
                </button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                <select
                  value={leadSourceFilter}
                  onChange={e => setLeadSourceFilter(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <option value="ALL">All Sources</option>
                  <option value="Widget Interactive Form">💬 Chatbot</option>
                  <option value="Exit Intent Popup">🚪 Exit Intent</option>
                  <option value="Idle Trigger">⏳ Idle Trigger</option>
                  <option value="Platform Survey">📋 Survey</option>
                  <option value="Widget Auto-Close">❌ Auto-Close</option>
                </select>

                {/* Local search indicator */}
                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="absolute left-3 top-2.5 w-4.5 h-4.5" style={{ color: 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={leadQuery}
                    onChange={(e) => setLeadQuery(e.target.value)}
                    placeholder="Search name, country or email..."
                    className="w-full border pl-9 pr-4 py-2 rounded-xl text-xs focus:bg-white outline-none focus:ring-1 focus:ring-accent placeholder:opacity-30 dark:placeholder:opacity-25"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            {/* Table layout of leads */}
            <div className="border rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-bold" style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottomColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <th className="px-4 py-3">{translate('fullNameField')}</th>
                      <th className="px-4 py-3">RAG Score</th>
                      <th className="px-4 py-3">Origin</th>
                      <th className="px-4 py-3">Program Level</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-400 italic">No leads match the current filter.</td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => (
                        <tr 
                          key={l.id} 
                          onClick={() => setSelectedLead(l)}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-850/50 transition-all cursor-pointer border-b last:border-0"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <td className="px-4 py-4 leading-normal">
                            <span className="font-extrabold block" style={{ color: 'var(--color-text-primary)' }}>{l.fullName}</span>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              <span
                                style={isTrialExpired ? {
                                  filter: 'blur(5px)',
                                  userSelect: 'none',
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none'
                                } : {}}
                                title={isTrialExpired ? 'Upgrade to view contact details' : undefined}
                              >
                                {l.email}
                              </span>
                              <span> • </span>
                              <span
                                style={isTrialExpired ? {
                                  filter: 'blur(5px)',
                                  userSelect: 'none',
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none'
                                } : {}}
                                title={isTrialExpired ? 'Upgrade to view contact details' : undefined}
                              >
                                {l.phone}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 block rounded-full ${l.status === 'HOT' ? 'bg-red-500 animate-pulse' : l.status === 'CONVERTED' ? 'bg-emerald-500' : 'bg-neutral-300'}`}></span>
                              <div>
                                <span className="font-black block font-mono" style={{ color: 'var(--color-text-primary)' }}>{l.score}% rating</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-[9px] block font-serif uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{l.status}</span>
                                  {l.source && (
                                    <span
                                      className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          l.source === 'Exit Intent Popup' ? 'rgba(239,68,68,0.1)' :
                                          l.source === 'Idle Trigger' ? 'rgba(245,158,11,0.1)' :
                                          l.source === 'Platform Survey' ? 'rgba(99,102,241,0.1)' :
                                          'rgba(107,114,128,0.1)',
                                        color:
                                          l.source === 'Exit Intent Popup' ? '#EF4444' :
                                          l.source === 'Idle Trigger' ? '#F59E0B' :
                                          l.source === 'Platform Survey' ? '#6366F1' :
                                          '#6B7280'
                                      }}
                                    >
                                      {l.source === 'Exit Intent Popup' ? '🚪 Exit' :
                                       l.source === 'Idle Trigger' ? '⏳ Idle' :
                                       l.source === 'Platform Survey' ? '📋 Survey' :
                                       l.source === 'Widget Interactive Form' ? '💬 Chat' :
                                       l.source === 'Widget Auto-Close' ? '❌ Auto' :
                                       l.source}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {l.city ? `${l.city}, ` : ''}{l.country}
                          </td>
                          <td className="px-4 py-4 font-bold max-w-[200px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                            {l.programInterest}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(l.id);
                              }}
                              className="p-1 px-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all cursor-pointer text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <Trash className="w-3" />
                              <span>Archive</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CLICKED LEAD DETAIL VIEWER MODAL */}
            {selectedLead && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-[var(--color-text-primary)] animate-fade-in">
                <div className="border rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="inline-flex py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                        Verified Lead Dossier
                      </div>
                      <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                        <span
                          style={isTrialExpired ? {
                            filter: 'blur(5px)',
                            userSelect: 'none',
                            cursor: 'not-allowed',
                            pointerEvents: 'none'
                          } : {}}
                        >
                          {selectedLead.fullName}
                        </span>
                      </h3>
                      <p className="text-[10px] font-mono shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Registered System ID: {selectedLead.id}</p>
                    </div>
                    <button onClick={() => setSelectedLead(null)} className="p-1.5 hover:opacity-85 rounded-full border transition cursor-pointer" style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* TAB SWITCHER */}
                  <div className="flex border-b text-xs font-bold gap-4 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                      type="button"
                      onClick={() => setLeadDossierTab('profile')}
                      className={`pb-2 px-1 transition-all border-b-2 hover:opacity-100 cursor-pointer ${leadDossierTab === 'profile' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-neutral-400 font-medium'}`}
                    >
                      General Profile & Demography
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadDossierTab('voice')}
                      className={`pb-2 px-1 transition-all border-b-2 hover:opacity-100 cursor-pointer flex items-center gap-1.5 ${leadDossierTab === 'voice' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-neutral-400 font-medium'}`}
                    >
                      <Phone className="w-3 h-3" />
                      <span>Speech Outreach Logs ({selectedLeadVoiceCalls.length})</span>
                    </button>
                  </div>

                  {leadDossierTab === 'profile' ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* PRIMARY DEMOGRAPHICS CONTEXT */}
                        <div className="space-y-3 p-4 rounded-2xl border bg-black/5" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Core Contact Credentials</h4>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                              <span
                                className="font-semibold select-all break-all"
                                style={isTrialExpired ? {
                                  filter: 'blur(5px)',
                                  userSelect: 'none',
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none'
                                } : {}}
                              >
                                {selectedLead.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                              <span
                                className="font-semibold select-all"
                                style={isTrialExpired ? {
                                  filter: 'blur(5px)',
                                  userSelect: 'none',
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none'
                                } : {}}
                              >
                                {selectedLead.phone || 'No direct phone'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                              <span className="font-semibold">{selectedLead.city ? `${selectedLead.city}, ` : ''}{selectedLead.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                              <span className="font-bold text-accent" style={{ color: 'var(--color-accent)' }}>{selectedLead.programInterest || 'General Inquiry'}</span>
                            </div>
                          </div>
                        </div>

                        {/* ACADEMIC PIPELINE & AI INTELLIGENCE RECORD */}
                        <div className="space-y-3 p-4 rounded-2xl border flex flex-col justify-between bg-black/5" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Intelligent Pipeline Status</h4>
                            
                            <div className="space-y-2 mt-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-[11px]">Enrollment Rating:</span>
                                <span className="font-extrabold font-mono text-sm px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">{selectedLead.score}% score</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-[11px]">RAG Priority Class:</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${
                                  selectedLead.status === 'HOT' ? 'bg-red-500' : 
                                  selectedLead.status === 'CONVERTED' ? 'bg-emerald-500' : 
                                  'bg-neutral-500'
                                }`}>{selectedLead.status}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-neutral-400 text-[11px]">Acquisition Source:</span>
                                <span className="font-bold underline text-[11px] truncate capitalize">{selectedLead.source || 'Widget Bot Intake'}</span>
                              </div>
                            </div>

                            {/* Interactive Edit Fields for status & score */}
                            <div className="mt-4 pt-3 border-t space-y-2.5" style={{ borderColor: 'var(--color-border)' }}>
                              <span className="block text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Update Pipeline Values</span>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] text-neutral-400 mb-1 font-bold">RAG Stage</label>
                                  <select
                                    value={editLeadStatus}
                                    onChange={(e) => setEditLeadStatus(e.target.value)}
                                    className="w-full text-[11px] p-1.5 rounded-lg border focus:outline-none"
                                    style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                                  >
                                    <option value="HOT">🔴 HOT</option>
                                    <option value="WARM">🟡 WARM</option>
                                    <option value="CONTACTED">🔵 CONTACTED</option>
                                    <option value="CONVERTED">🟢 CONVERTED</option>
                                    <option value="COLD">⚫ COLD</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] text-neutral-400 mb-1 font-bold">Fit Score (%)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editLeadScore}
                                    onChange={(e) => setEditLeadScore(Number(e.target.value))}
                                    className="w-full text-[11px] p-1.5 rounded-lg border focus:outline-none font-mono font-bold"
                                    style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                                  />
                                </div>
                              </div>

                              <button
                                onClick={handleUpdateLeadInline}
                                className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 border text-white font-black hover:bg-neutral-800 text-[10px] transition cursor-pointer"
                                style={{ borderColor: 'var(--color-border)' }}
                              >
                                Apply Pipeline Updates
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in max-h-[60vh] overflow-y-auto pr-1">
                      {/* AI VOICE OUTBOUND CALLING CONTROL PANEL */}
                      <div className="space-y-3.5 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <Phone className="w-3.5 h-3.5" />
                            <span>NesLead Outbound AI Voice Agent</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">Powered by Vapi.ai</span>
                        </h4>

                        <div className="space-y-3">
                          {selectedLead.phone ? (
                            <div className="space-y-3">
                              {!voiceSettings ? (
                                <div className="p-3 bg-neutral-900/40 border border-dashed rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-zinc-400" style={{ borderColor: 'var(--color-border)' }}>
                                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Loading voice credentials and parameters...</span>
                                </div>
                              ) : !voiceSettings.voiceApproved && !tenantProfile?.isSuperAdmin ? (
                                <div className="p-4 rounded-xl border border-dashed text-zinc-400 text-[11px] font-semibold flex items-center gap-2.5 bg-neutral-900/40" style={{ borderColor: 'var(--color-border)' }}>
                                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                                  <div className="space-y-0.5">
                                    <p className="font-extrabold text-neutral-300">Outbound Voice Line Restricted</p>
                                    <p className="text-[10px] text-neutral-500 font-medium">This add-on has not been unlocked for your account. Please contact support or your account representative to approve voice agent activation.</p>
                                  </div>
                                </div>
                              ) : !voiceSettings.voiceEnabled ? (
                                <div className="p-4 rounded-xl border border-dashed text-zinc-400 text-[11px] font-semibold flex items-center gap-2.5 bg-neutral-900/40" style={{ borderColor: 'var(--color-border)' }}>
                                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                                  <div className="space-y-0.5">
                                    <p className="font-extrabold text-neutral-300">Outbound Voice Calls Disabled</p>
                                    <p className="text-[10px] text-neutral-500 font-medium">Please enable the Voice Add-On in Settings &gt; AI Voice Configuration to make phone calls.</p>
                                  </div>
                                </div>
                              ) : showCallConfirm ? (
                                <div className="p-4 border rounded-xl bg-indigo-500/5 space-y-3 animate-fade-in text-xs font-semibold" style={{ borderColor: 'var(--color-border)' }}>
                                  <p className="text-[11px] leading-relaxed select-none">
                                    You are about to initiate an AI phone call to <span className="font-bold text-indigo-400">{selectedLead.fullName}</span> at <span className="font-mono text-zinc-350">{selectedLead.phone}</span>. The AI will introduce itself as <span className="text-indigo-400 font-bold">{voiceSettings?.voiceAgentName || 'Alex'}</span>. Proceed?
                                  </p>
                                  <div className="flex justify-end gap-2.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setShowCallConfirm(false)}
                                      className="px-3 py-1.5 rounded-lg border hover:bg-neutral-800/20 transition cursor-pointer text-[11px] font-bold"
                                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isPlacingVoiceCall}
                                      onClick={() => handleInitiateVoiceCall(selectedLead.id)}
                                      className="px-4 py-1.5 rounded-lg font-bold text-white transition flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-[11px]"
                                    >
                                      <Phone className="w-3.5 h-3.5 shrink-0" />
                                      <span>Start Call</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isPlacingVoiceCall}
                                  onClick={() => setShowCallConfirm(true)}
                                  className="w-full py-2.5 px-4 rounded-xl text-white font-extrabold hover:opacity-90 text-[11px] transition cursor-pointer flex items-center justify-center gap-2 shadow-md bg-indigo-600 border border-indigo-500/20 animate-fade-in"
                                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
                                >
                                  <Phone className="w-4 h-4 text-white animate-bounce" />
                                  <span>{isPlacingVoiceCall ? 'Dispatching Call System...' : 'Initiate Outbound AI Call'}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl border border-dashed border-red-500/20 bg-red-500/5 text-red-400 text-[11px] font-bold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>This lead has no telephone number registered on their record.</span>
                            </div>
                          )}

                          {/* Feedback log messages */}
                          {voiceCallFeedback.text && (
                            <div className={`p-3 rounded-xl text-[11px] font-bold border leading-relaxed animate-fade-in ${
                              voiceCallFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              voiceCallFeedback.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-indigo-500/10 border-indigo-500/25 text-indigo-400 animate-pulse'
                            }`}>
                              {voiceCallFeedback.text}
                            </div>
                          )}

                          {/* Selected lead's call records list */}
                          <div className="space-y-2 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <span className="block text-[9px] uppercase font-mono font-black text-neutral-400 tracking-wider">Lead Call Logs & Transcripts ({selectedLeadVoiceCalls.length})</span>
                            
                            {loadingLeadVoiceCalls ? (
                              <div className="py-2.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
                                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                <span>Retrieving voice logs...</span>
                              </div>
                            ) : selectedLeadVoiceCalls.length === 0 ? (
                              <p className="text-[10px] text-neutral-500 italic font-medium">No outreach outreach calls placed for this lead.</p>
                            ) : (
                              <div className="border rounded-xl divide-y overflow-hidden text-[11px]" style={{ borderColor: 'var(--color-border)' }}>
                                {selectedLeadVoiceCalls.map(c => {
                                  const isExp = expandedLeadCallId === c.id;
                                  const dtStr = c.initiated_at ? new Date(c.initiated_at).toLocaleDateString() : 'Today';

                                  return (
                                    <div key={c.id} className="bg-black/10 transition-colors">
                                      <div 
                                        onClick={() => setExpandedLeadCallId(isExp ? null : c.id)}
                                        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-neutral-800/20 transition-colors"
                                      >
                                        <div className="space-y-0.5 select-none">
                                          <p className="font-bold text-neutral-300">Outreach Call — {dtStr}</p>
                                          {c.duration_seconds > 0 && (
                                            <p className="text-[9px] text-neutral-500 font-mono">Duration: {Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                            c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                                            c.status === 'initiated' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse' :
                                            'bg-red-500/10 text-red-400 border border-red-500/25'
                                          }`}>
                                            {c.status}
                                          </span>
                                          {c.status === 'completed' && (
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                              c.outcome === 'booked' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25' :
                                              c.outcome === 'interested' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                                              c.outcome === 'callback-requested' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                                              'bg-zinc-850 text-zinc-400'
                                            }`}>
                                              {c.outcome?.replace('-', ' ')}
                                            </span>
                                          )}
                                          {isExp ? <ChevronUp className="w-3.5 h-3.5 text-zinc-450" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-450" />}
                                        </div>
                                      </div>

                                      {isExp && (
                                        <div className="p-3 border-t space-y-3 bg-zinc-950/20 text-[10px]" style={{ borderColor: 'var(--color-border)' }}>
                                          {c.summary && (
                                            <div className="space-y-1">
                                              <p className="font-extrabold text-indigo-400 uppercase text-[8px] tracking-wider select-none">AI Summary:</p>
                                              <p className="text-zinc-350 font-semibold leading-relaxed">{c.summary}</p>
                                            </div>
                                          )}
                                          <div className="space-y-1">
                                            <p className="font-extrabold text-indigo-400 uppercase text-[8px] tracking-wider select-none">Conversation Transcript:</p>
                                            {c.transcript ? (
                                              <div className="p-2 border rounded bg-zinc-950/50 text-zinc-350 font-mono leading-relaxed max-h-36 overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
                                                {c.transcript}
                                              </div>
                                            ) : (
                                              <p className="italic text-zinc-500 font-medium">Transcript processing or not populated.</p>
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
                      </div>
                    </div>
                  )}

                  {/* VISITOR GEOGRAPHICAL TELEMETRY METRICS */}
                  <div className="space-y-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                      <span>Conversational Context & Geo-telemetry Indicators</span>
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="block text-[9px] text-neutral-400 uppercase font-bold">Access Device</span>
                        <span className="font-semibold block truncate">{selectedLead.geo?.device || 'Desktop PC'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-neutral-400 uppercase font-bold">Browser Client</span>
                        <span className="font-semibold block truncate">{selectedLead.geo?.browser || 'Chrome SECURE'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-neutral-400 uppercase font-bold">Operating System</span>
                        <span className="font-semibold block truncate">{selectedLead.geo?.os || 'Windows/Linux'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-neutral-400 uppercase font-bold">Session Reference</span>
                        <span className="font-semibold block font-mono text-[9px] truncate">{selectedLead.geo?.ip_address || '196.200.44.11'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t text-[10px] space-y-1" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <p><strong>Page visited initial:</strong> <span className="underline break-all select-all">{selectedLead.geo?.page_visited || '/home'}</span></p>
                      {selectedLead.geo?.referrer && (
                        <p><strong>Referral query:</strong> <span className="italic break-all">{selectedLead.geo.referrer}</span></p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={async () => {
                        const matchingConv = conversations.find(c => c.leadId === selectedLead.id);
                        if (matchingConv) {
                          setSelectedConvId(matchingConv.id);
                          try {
                            await authFetch(`/api/conversations/${matchingConv.id}/read`, { method: 'POST' });
                            setConversations(prev => prev.map(c => c.id === matchingConv.id ? { ...c, unreadCount: 0 } : c));
                          } catch (e) {
                            console.error(e);
                          }
                        }
                        setSelectedLead(null);
                        handleNavClick('conversations');
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                      style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Trace Backchat History</span>
                    </button>
                    <button 
                      onClick={() => setSelectedLead(null)}
                      className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Dismiss Reviewer Dossier</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL MANAGE LEADS POPUP MODAL */}
            {showAddLeadModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-neutral-800 animate-fade-in">
                <div className="border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase" style={{ color: 'var(--color-text-primary)' }}>Insert Prospective Candidate Manual</h3>
                    <button onClick={() => setShowAddLeadModal(false)} className="hover:opacity-80 transition cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateLead} className="space-y-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Candidate Name</label>
                      <input
                        type="text"
                        required
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="e.g. Jean-Pierre Mvondo"
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent placeholder:opacity-30 dark:placeholder:opacity-25"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Email address</label>
                      <input
                        type="email"
                        required
                        value={newLeadEmail}
                        onChange={(e) => setNewLeadEmail(e.target.value)}
                        placeholder="e.g. jp.mvondo@univ.cm"
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent placeholder:opacity-30 dark:placeholder:opacity-25"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Phone number</label>
                      <input
                        type="text"
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        placeholder="e.g. +237 670 12 34 56"
                        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent placeholder:opacity-30 dark:placeholder:opacity-25"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Country</label>
                        <input
                          type="text"
                          value={newLeadCountry}
                          onChange={(e) => setNewLeadCountry(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-accent"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Target Program</label>
                        <select
                          value={newLeadProgram}
                          onChange={(e) => setNewLeadProgram(e.target.value)}
                          className="w-full border rounded-xl px-2 py-2 outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
                        >
                          <option>Executive MBA (EN/FR)</option>
                          <option>B.Sc. Software Engineering with Applied AI</option>
                          <option>Master in Global Public Health</option>
                          <option>Diploma in Hospitality & Tourism Excellence</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddLeadModal(false)}
                        className="px-4 py-2 border rounded-xl hover:opacity-85 cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl text-white transition shadow cursor-pointer hover:opacity-90"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        Save Student
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 3: Shared Inbox Conversations and hijack TakeOver */}
        {activeTab === 'conversations' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }} 
            className="flex flex-col h-full overflow-hidden animate-fade-in" 
            style={{ height: 'calc(100vh - 120px)' }}
          >
            {/* Header / Stats bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Live Inbox</h1>
                <p className="text-xs flex flex-wrap items-center gap-2 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="flex items-center gap-1.5 font-bold text-rose-500">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    {convStats.unread || 0} unread
                  </span>
                  <span>•</span>
                  <span className="text-emerald-500 font-bold" style={{ color: '#10B981' }}>{convStats.active || 0} active</span>
                  <span>•</span>
                  <span className="text-amber-500 font-bold" style={{ color: '#F59E0B' }}>{convStats.escalated || 0} escalated</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Horizontal scrollable Filter tabs */}
                <div className="flex bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-1 gap-1 overflow-x-auto select-none no-scrollbar">
                  {(['ALL', 'ACTIVE', 'ESCALATED', 'RESOLVED', 'ARCHIVED'] as const).map((filterOpt) => {
                    const isActive = convFilter === filterOpt;
                    const count = filterOpt === 'ALL'
                      ? conversations.filter(c => c.status !== 'ARCHIVED').length
                      : conversations.filter(c => c.status === filterOpt).length;

                    return (
                      <button
                        key={filterOpt}
                        type="button"
                        onClick={() => {
                          setConvFilter(filterOpt);
                          setSelectedConvIds(new Set()); // Reset selections on filter change
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${isActive ? 'bg-[var(--color-accent)] text-white shadow' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                        style={isActive ? { backgroundColor: 'var(--color-accent)' } : undefined}
                      >
                        {filterOpt} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Mark All Read Button */}
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[var(--color-border)] rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mark All Read</span>
                </button>

                {/* Search */}
                <div className="relative w-full sm:w-56 shrink-0">
                  <input
                    type="text"
                    value={convSearchQuery}
                    onChange={(e) => setConvSearchQuery(e.target.value)}
                    placeholder="Search name or ID..."
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-accent outline-none"
                  />
                  {convSearchQuery && (
                    <button 
                      onClick={() => setConvSearchQuery('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 font-bold font-mono text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden min-h-0 items-stretch border rounded-3xl shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              {/* Left Panel — Inbox list */}
              {(() => {
                const visibleConvs = conversations
                  .filter(conv => {
                    if (convFilter === 'ALL') {
                      return conv.status !== 'ARCHIVED';
                    }
                    return conv.status === convFilter;
                  })
                  .filter(conv => {
                    if (convSearchQuery.trim()) {
                      const query = convSearchQuery.toLowerCase();
                      const matchedLead = leads.find(l => l.id === conv.leadId);
                      const nameLabel = matchedLead ? matchedLead.fullName.toLowerCase() : `visitor ${conv.sessionId.slice(-6)}`.toLowerCase();
                      const idLabel = conv.sessionId.toLowerCase();
                      return nameLabel.includes(query) || idLabel.includes(query);
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    const aTime = a.updatedAt || a.startedAt || '';
                    const bTime = b.updatedAt || b.startedAt || '';
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                  });

                return (
                  <div 
                    className={`
                      flex-shrink-0 border-r flex flex-col h-full overflow-hidden
                      w-full md:col-span-3 lg:col-span-4
                      ${selectedConvId && mobileInboxView === 'chat' ? 'hidden md:flex' : 'flex'}
                    `} 
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {/* Bulk Action Toolbar */}
                    <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between gap-1 flex-wrap bg-[var(--color-bg-secondary)] shrink-0 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={visibleConvs.length > 0 && visibleConvs.every(c => selectedConvIds.has(c.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedConvIds(new Set([...selectedConvIds, ...visibleConvs.map(c => c.id)]));
                            } else {
                              setSelectedConvIds(prev => {
                                const next = new Set(prev);
                                visibleConvs.forEach(c => next.delete(c.id));
                                return next;
                              });
                            }
                          }}
                          className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-accent accent-[var(--color-accent)] cursor-pointer w-3.5 h-3.5"
                        />
                        <span className="text-[10px] font-extrabold text-[var(--color-text-secondary)] uppercase tracking-wider select-none">
                          {selectedConvIds.size > 0 ? `${selectedConvIds.size} Selected` : 'Select All'}
                        </span>
                      </div>

                      {selectedConvIds.size > 0 && (
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <button
                            onClick={() => handleBulkAction('mark_read')}
                            className="px-2 py-1 text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                            title="Mark Selected Read"
                          >
                            <CheckSquare className="w-3 h-3" />
                            <span>Read</span>
                          </button>
                          <button
                            onClick={() => handleBulkAction('archive')}
                            className="px-2 py-1 text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                            title="Archive Selected"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Archive</span>
                          </button>
                          <button
                            onClick={() => handleBulkAction('delete')}
                            className="px-2 py-1 text-[9px] font-black uppercase text-red-600 hover:text-red-700 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                            title="Delete Selected"
                          >
                            <Trash className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
                      {visibleConvs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 h-full text-center text-neutral-400 select-none">
                          <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
                          <p className="font-semibold text-xs text-[var(--color-text-secondary)]">No conversations found</p>
                          <p className="text-[10px] text-neutral-400 max-w-[200px] mt-1">Conversations from your chatbot widget will appear here in real time.</p>
                        </div>
                      ) : (
                        visibleConvs.map((conv) => {
                          const matchedLead = leads.find(l => l.id === conv.leadId);
                          const nameLabel = matchedLead ? matchedLead.fullName : `Visitor ${conv.sessionId.slice(-6)}`;
                          const isSelected = conv.id === selectedConvId;

                          const lastMsg = conv.messages[conv.messages.length - 1];
                          const lastMessageFromUser = lastMsg ? lastMsg.role === 'USER' : true;
                          const showUserAvatar = conv.status === 'ESCALATED' || lastMessageFromUser;
                          const initials = nameLabel ? nameLabel.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '??';

                          let timeAgo = 'Just now';
                          if (conv.updatedAt || conv.startedAt) {
                            const date = new Date(conv.updatedAt || conv.startedAt || '');
                            const diffMs = Date.now() - date.getTime();
                            const diffMin = Math.floor(diffMs / 60000);
                            const diffHr = Math.floor(diffMin / 60);
                            if (diffMin < 1) timeAgo = 'Just now';
                            else if (diffMin < 60) timeAgo = `${diffMin}m ago`;
                            else if (diffHr < 24) timeAgo = `${diffHr}h ago`;
                            else timeAgo = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          }

                          const dotColor = conv.status === 'ESCALATED' ? '#F59E0B' : (conv.status === 'RESOLVED' || conv.status === 'CLOSED' || conv.status === 'ARCHIVED') ? '#6B7280' : '#10B981';

                          return (
                            <div
                              key={conv.id}
                              className={`group relative flex items-center border-b border-[var(--color-border)] ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-neutral-500/5'}`}
                            >
                              {/* Selection Checkbox */}
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConvIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(conv.id)) {
                                      next.delete(conv.id);
                                    } else {
                                      next.add(conv.id);
                                    }
                                    return next;
                                  });
                                }}
                                className="p-3 pr-0 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedConvIds.has(conv.id)}
                                  onChange={() => {}}
                                  className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-accent accent-[var(--color-accent)] cursor-pointer w-3.5 h-3.5"
                                />
                              </div>

                              <div
                                onClick={async () => {
                                  setSelectedConvId(conv.id);
                                  setMobileInboxView('chat');
                                  try {
                                    await authFetch(`/api/conversations/${conv.id}/read`, { method: 'POST' });
                                    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                                    fetchConvStats();
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className="flex-1 p-3 text-left transition relative flex items-start gap-3 cursor-pointer select-none"
                                style={isSelected ? { borderLeft: '3px solid var(--color-accent)' } : undefined}
                              >
                                {/* Visual Avatar */}
                                {showUserAvatar ? (
                                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white" style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)' }}>
                                    {initials || '??'}
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-neutral-100 dark:bg-zinc-800 border border-[var(--color-border)] overflow-hidden">
                                    {cfgLauncherLogoUrl ? (
                                      <img src={cfgLauncherLogoUrl} alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="text-sm select-none">{cfgLauncherEmoji || '🤖'}</span>
                                    )}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                  <div className="flex justify-between items-baseline">
                                    <span className="font-extrabold text-[13px] text-[var(--color-text-primary)] truncate max-w-[130px] flex items-center gap-1">
                                      <span>{nameLabel}</span>
                                      {!showUserAvatar && (
                                        <span className="text-[9px] font-bold text-accent bg-accent/10 px-1 py-0.5 rounded" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-10)' }}>
                                          AI
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">{timeAgo}</span>
                                  </div>

                                  <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-1 pr-6">
                                    {lastMsg?.content || 'Started chat'}
                                  </p>

                                  <div className="flex items-center justify-between mt-1">
                                    <span className="flex items-center gap-1.5 pb-0.5">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{conv.status}</span>
                                    </span>
                                    {conv.unreadCount > 0 && (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] leading-none shrink-0 min-w-4 text-center">
                                        {conv.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Individual Hover Delete Button */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure you want to delete this conversation?")) {
                                    await handleDeleteConversation(conv.id);
                                  }
                                }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-md"
                                title="Delete Conversation"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Central messages panel hijack board console column */}
              <div className={`md:col-span-9 lg:col-span-8 flex-col h-full overflow-hidden md:flex ${mobileInboxView === 'chat' ? 'flex' : 'hidden'}`}>
                {activeConversation ? (
                  <div className="flex-1 flex flex-col overflow-hidden h-full">
                    
                    {/* Console Header details */}
                    <div className="px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm shrink-0" style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Mobile Back Button to inbox selection list */}
                        <button
                          onClick={() => setMobileInboxView('list')}
                          className="md:hidden p-1.5 rounded-lg hover:bg-neutral-200 bg-stone-100 text-neutral-500 hover:text-neutral-700 cursor-pointer transition-colors shrink-0"
                          title="Back to Conversations"
                        >
                          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div className="truncate">
                          <h4 className="font-bold text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
                            Interactive Session {activeConversation.sessionId.slice(-6)}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium">
                            <span className="font-bold">Chat status:</span>
                            <span className="font-mono text-accent" style={{ color: 'var(--color-accent)' }}>{activeConversation.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {activeConversation.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleHijackTakeover(activeConversation.id)}
                            className="px-3.5 py-1.5 border-2 rounded-xl text-[10px] font-black uppercase text-accent hover:bg-accent/5 transition cursor-pointer flex items-center gap-1 self-start sm:self-auto shrink-0 animate-pulse"
                            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>AI Takeover Hijack</span>
                          </button>
                        )}
                        {activeConversation.status === 'ESCALATED' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateConversationStatus(activeConversation.id, 'ACTIVE')}
                              className="px-3 py-1.5 border rounded-xl text-[10px] font-extrabold uppercase hover:bg-neutral-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                              title="Turn AI Bot assistance back on for this chat"
                            >
                              <span>Restart AI Bot</span>
                            </button>
                            <button
                              onClick={() => handleUpdateConversationStatus(activeConversation.id, 'RESOLVED')}
                              className="px-3 py-1.5 bg-neutral-950 text-white rounded-xl text-[10px] font-black uppercase hover:bg-neutral-800 transition cursor-pointer"
                            >
                              <span>Mark Resolved</span>
                            </button>
                          </div>
                        )}
                        {activeConversation.status === 'RESOLVED' && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-auto shrink-0">
                              ✓ Handled & Resolved
                            </span>
                            <button
                              onClick={() => handleUpdateConversationStatus(activeConversation.id, 'ACTIVE')}
                              className="px-2.5 py-1.5 border rounded-xl text-[10px] font-extrabold text-neutral-600 hover:text-neutral-950 dark:hover:bg-zinc-800 transition cursor-pointer"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              Re-open Chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Messages scrolling list */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs font-medium">
                      {activeConversation.messages.map((m) => {
                        const matchedLead = leads.find(l => l.id === activeConversation.leadId);
                        const userInitials = matchedLead ? matchedLead.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : activeConversation.sessionId.slice(-2).toUpperCase();

                        return (
                          <div key={m.id} className={`flex ${m.role === 'USER' ? 'justify-start' : 'justify-end'} items-end gap-2.5 animate-fade-in`}>
                            {/* USER Avatar (Left side) */}
                            {m.role === 'USER' && (
                              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] text-white select-none shadow" style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)' }}>
                                {userInitials || 'U'}
                              </div>
                            )}

                            <div 
                              className={`p-3 rounded-2xl max-w-[75%] leading-relaxed shadow-sm ${m.role === 'USER' ? 'rounded-bl-none' : m.role === 'AGENT' ? 'rounded-br-none text-white' : 'rounded-br-none'}`} 
                              style={
                                m.role === 'USER' 
                                  ? { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderLeft: '3px solid var(--color-border)' } 
                                  : m.role === 'AGENT' 
                                    ? { background: 'var(--accent-gradient)' } 
                                    : { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderRight: `4px solid var(--color-accent)` }
                              }
                            >
                              {m.role === 'AGENT' && (
                                <span className="block text-[8px] uppercase font-bold text-stone-200 font-mono mb-1">Human Recruiter response</span>
                              )}
                              {m.role === 'ASSISTANT' && (
                                <span className="block text-[8px] uppercase font-bold text-accent font-serif mb-1" style={{ color: 'var(--color-accent)' }}>RAG Bot Reply</span>
                              )}

                              <p>{m.content}</p>

                              {m.role === 'ASSISTANT' && m.confidence && (
                                <div className="mt-1.5 pt-1.5 border-t flex items-center justify-between text-[9px] font-mono" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                  <span>Similarity confidence: {m.confidence}%</span>
                                  <span className="underline truncate max-w-[124px]">Source: {m.citationSource || 'Catalog'}</span>
                                </div>
                              )}
                            </div>

                            {/* ASSISTANT (Bot) Avatar (Right side) */}
                            {m.role === 'ASSISTANT' && (
                              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-xs bg-neutral-100 dark:bg-zinc-800 border border-[var(--color-border)] overflow-hidden shadow">
                                {cfgLauncherLogoUrl ? (
                                  <img src={cfgLauncherLogoUrl} alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-sm select-none">{cfgLauncherEmoji || '🤖'}</span>
                                )}
                              </div>
                            )}

                            {/* AGENT Avatar (Right side) */}
                            {m.role === 'AGENT' && (
                              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center shadow text-white" style={{ background: 'var(--accent-gradient)' }}>
                                <Shield className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={adminScrollAnchorRef} />
                    </div>

                    {/* Quick Canned replies snippets selector */}
                    <div className="px-4 py-3 border-t shrink-0 text-[10px] flex flex-col sm:flex-row gap-2.5 sm:items-center select-none" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                      <span className="font-extrabold text-neutral-400 uppercase shrink-0">Canned:</span>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 w-full">
                        <button 
                          onClick={() => setAgentReplyText("Absolutely! We offer flexible payment plans and installment options. I'd be happy to walk you through the details.")}
                          className="px-2.5 py-2 sm:py-1 border rounded-xl sm:rounded-md transition text-left sm:text-center text-[10px] font-bold cursor-pointer hover:bg-neutral-100"
                          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        >
                          Installments Plan
                        </button>
                        <button 
                          onClick={() => setAgentReplyText("Great news — you qualify for our 45% Merit Excellence Scholarship based on your GPA averages!")}
                          className="px-2.5 py-2 sm:py-1 border rounded-xl sm:rounded-md transition text-left sm:text-center text-[10px] font-bold cursor-pointer hover:bg-neutral-100"
                          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        >
                          Merit 45% Waiver
                        </button>
                        <button 
                          onClick={() => setAgentReplyText("I have verified your calendar booking in our advisor slots. Expect an orientation video link shortly.")}
                          className="px-2.5 py-2 sm:py-1 border rounded-xl sm:rounded-md transition text-left sm:text-center text-[10px] font-bold cursor-pointer hover:bg-neutral-100"
                          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                        >
                          Confirm Appointment
                        </button>
                      </div>
                    </div>

                    {/* Agent Direct reply typing panel */}
                    <form 
                      onSubmit={handleSendAgentReply} 
                      className="p-3.5 border-t shrink-0 flex gap-2" 
                      style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <input
                        type="text"
                        value={agentReplyText}
                        onChange={(e) => setAgentReplyText(e.target.value)}
                        placeholder={
                          activeConversation?.status === 'ESCALATED' 
                            ? "Reply as human advisor — lead is waiting..."
                            : activeConversation?.status === 'RESOLVED'
                              ? "Conversation resolved. Re-open to reply."
                              : "Use 'AI Takeover Hijack' above to take control of this chat first."
                        }
                        disabled={activeConversation?.status !== 'ESCALATED'}
                        className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      />
                      <button
                        type="submit"
                        disabled={activeConversation?.status !== 'ESCALATED'}
                        className="px-5 py-2.5 rounded-xl text-white font-bold transition shadow cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        Send Over
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-400 italic">
                    Select an ongoing conversation to audit chatbot responses.
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 4: Knowledge Base RAG editor - Routed cleanly back to subcomp */}
        {activeTab === 'kb' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <KnowledgeBasePage vertical={tenantProfile?.vertical} />
          </motion.div>
        )}

        {/* TAB 5: Course Programs Manager */}
        {activeTab === 'programs' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* Sub-tab navigation bar */}
            <div className="flex items-center gap-1 px-2 pt-1 pb-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
              {/* Tab: Catalog */}
              <button
                type="button"
                onClick={() => setProgramsSubTab('catalog')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2`}
                style={{
                  color: programsSubTab === 'catalog' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderBottomColor: programsSubTab === 'catalog' ? 'var(--color-accent)' : 'transparent',
                  backgroundColor: 'transparent'
                }}
              >
                {cfgVertical === 'education' ? '📚 Program Catalog' : `🗂 ${getTermOverrides(cfgVertical).service} Catalog`}
              </button>

              {/* Tab: Form Builder */}
              <button
                type="button"
                onClick={() => { setProgramsSubTab('form_builder'); setFormBuilderFullscreen(true); }}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5`}
                style={{
                  color: programsSubTab === 'form_builder' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderBottomColor: programsSubTab === 'form_builder' ? 'var(--color-accent)' : 'transparent',
                  backgroundColor: 'transparent'
                }}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Form Builder
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff', opacity: 0.9 }}
                >
                  NEW
                </span>
              </button>

              {/* Tab: Templates Library */}
              <button
                type="button"
                onClick={() => setProgramsSubTab('templates')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5`}
                style={{
                  color: programsSubTab === 'templates' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderBottomColor: programsSubTab === 'templates' ? 'var(--color-accent)' : 'transparent',
                  backgroundColor: 'transparent'
                }}
              >
                <Layout className="w-3.5 h-3.5" />
                Templates Library
              </button>
            </div>

            {/* Sub-tab content */}
            <AnimatePresence mode="wait">
              {programsSubTab === 'catalog' && (
                <motion.div
                  key="catalog"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  {cfgVertical === 'education' ? 'Programs & Courses Catalog' : `${getTermOverrides(cfgVertical).servicePlural} Catalog`}
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {cfgVertical === 'education' ? 'Manage academic programs and course listings.' : `Add ${getTermOverrides(cfgVertical).service.toLowerCase()} listings, configure pricing, and publish your active catalog.`}
                </p>
              </div>

              <button
                onClick={() => setShowAddProgModal(true)}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition shadow cursor-pointer shadow-accent"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {cfgVertical === 'education' ? '+ Add New Program' : `+ Add New ${getTermOverrides(cfgVertical).service}`}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
              {programs.map((p) => (
                <div key={p.id} className="border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm relative group overflow-hidden hover:shadow-md transition" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <span className="absolute top-0 right-0 p-1.5 text-[8px] font-bold uppercase rounded-bl-lg font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                    {p.duration}
                  </span>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>{p.department}</span>
                    <div className="flex justify-between items-start gap-1.5">
                      <h4 className="text-sm font-extrabold tracking-tight block leading-snug" style={{ color: 'var(--color-text-primary)' }}>{p.name}</h4>
                      {p.published ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-md border font-mono shrink-0 text-green-700 bg-green-50 border-green-200">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                          Live
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border font-mono shrink-0 text-amber-700 bg-amber-50 border-amber-200">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-normal line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>{p.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-205 font-mono">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : p.capacityBadge}
                      </span>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBuilderProgramId(p.id);
                            setProgramsSubTab('form_builder');
                            setFormBuilderFullscreen(true);
                          }}
                          className="text-[10px] text-orange-500 hover:underline font-bold transition cursor-pointer"
                          title="Design linked client intake questionnaire"
                        >
                          Intake Form
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProgram(p.id)}
                          className="text-[10px] text-red-500 hover:underline font-bold transition flex items-center gap-0.5 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NEW PROGRAM MODEL */}
            {showAddProgModal && (
              <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in text-xs">
                <div className="border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase" style={{ color: 'var(--color-text-primary)' }}>
                      {cfgVertical === 'education' ? 'Add New Syllabus Program' : `Add New ${getTermOverrides(cfgVertical).service} Listing`}
                    </h3>
                    <button onClick={() => setShowAddProgModal(false)} className="transition cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProgram} className="space-y-3 pt-2 text-xs">
                    {/* Type (a): Academic-specific syllabus, yearly tuition, and faculty fields belong specifically to high-schools/universities in the education vertical */}
                    {cfgVertical === 'education' ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide animate-none" style={{ color: 'var(--color-text-secondary)' }}>Program Name</label>
                          <input
                            type="text"
                            required
                            value={newProgName}
                            onChange={(e) => setNewProgName(e.target.value)}
                            placeholder="e.g. M.Sc. Data Science and Finance"
                            className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Faculty Dept</label>
                            <input
                              type="text"
                              required
                              value={newProgDept}
                              onChange={(e) => setNewProgDept(e.target.value)}
                              placeholder="e.g. Science"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Duration</label>
                            <input
                              type="text"
                              required
                              value={newProgDuration}
                              onChange={(e) => setNewProgDuration(e.target.value)}
                              placeholder="e.g. 2 Years"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Yearly Tuition</label>
                            <input
                              type="text"
                              required
                              value={newProgFees}
                              onChange={(e) => setNewProgFees(e.target.value)}
                              placeholder="e.g. $15,000"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Cap Status Badge</label>
                            <input
                              type="text"
                              value={newProgBadge}
                              onChange={(e) => setNewProgBadge(e.target.value)}
                              placeholder="e.g. 25 slots"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Syllabus Overview Description</label>
                          <textarea
                            rows={3}
                            required
                            value={newProgDesc}
                            onChange={(e) => setNewProgDesc(e.target.value)}
                            placeholder="Overview objectives program highlights..."
                            className="w-full border rounded-xl px-3 py-2 outline-none resize-none animate-none font-semibold leading-relaxed"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                          ></textarea>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide animate-none" style={{ color: 'var(--color-text-secondary)' }}>Service Name</label>
                          <input
                            type="text"
                            required
                            value={newProgName}
                            onChange={(e) => setNewProgName(e.target.value)}
                            placeholder="e.g. Website Audit & Strategy"
                            className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Category</label>
                            <input
                              type="text"
                              required
                              value={newProgDept}
                              onChange={(e) => setNewProgDept(e.target.value)}
                              placeholder="e.g. Consulting, Legal, Marketing"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Delivery Mode</label>
                            <input
                              type="text"
                              required
                              value={newProgDeliveryMode}
                              onChange={(e) => setNewProgDeliveryMode(e.target.value)}
                              placeholder="e.g. Remote, On-site, Hybrid"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Timeline</label>
                            <input
                              type="text"
                              required
                              value={newProgDuration}
                              onChange={(e) => setNewProgDuration(e.target.value)}
                              placeholder="e.g. 3–5 Business Days, Ongoing"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Starting Price</label>
                            <input
                              type="text"
                              required
                              value={newProgFees}
                              onChange={(e) => setNewProgFees(e.target.value)}
                              placeholder="e.g. $500, Free Consultation"
                              className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Key Benefit</label>
                          <input
                            type="text"
                            value={newProgBadge}
                            onChange={(e) => setNewProgBadge(e.target.value)}
                            placeholder="e.g. Guaranteed results or free retry"
                            className="w-full border rounded-xl px-3 py-2 outline-none font-semibold"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
                          <textarea
                            rows={3}
                            required
                            value={newProgDesc}
                            onChange={(e) => setNewProgDesc(e.target.value)}
                            placeholder="Brief overview of what's included..."
                            className="w-full border rounded-xl px-3 py-2 outline-none resize-none animate-none font-semibold leading-relaxed"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                          ></textarea>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 justify-end pt-4 font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddProgModal(false)}
                        className="px-4 py-2 border rounded-xl cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl text-white transition shadow cursor-pointer"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        {cfgVertical === 'education' ? 'Save Catalog Program' : `Save ${getTermOverrides(cfgVertical).service} Listing`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
                </motion.div>
              )}

              {programsSubTab === 'form_builder' && (
                <motion.div
                  key="form_builder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full flex-grow flex flex-col items-center justify-center h-64 p-6 border border-dashed rounded-2xl"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  <Wand2 className="w-8 h-8 mb-2 opacity-30 animate-pulse text-indigo-500" />
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Form Builder is currently active in Full-Screen Workspace mode.</p>
                  <button
                    onClick={() => setFormBuilderFullscreen(true)}
                    className="mt-3 px-4 py-1.5 rounded-lg text-[11px] font-black text-white hover:scale-105 transition cursor-pointer"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    Re-open Workspace Overlay
                  </button>
                </motion.div>
              )}

              {programsSubTab === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <TemplatesLibrary
                    onApplyTemplate={async (template, targetId) => {
                      const progId = targetId || selectedBuilderProgramId;
                      if (!progId) return;
                      const updatedFields = template.formSchema || [];
                      try {
                        const res = await authFetch(`/api/programs/${progId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            formSchema: updatedFields,
                            formBg: template.formBg || '',
                            formLogoUrl: template.formLogoUrl || '',
                            formLogoPosition: template.formLogoPosition || 'top-left',
                            formBgBlendMode: template.formBgBlendMode || 'normal',
                            formBgSize: template.formBgSize || 'cover',
                            formBgOpacity: template.formBgOpacity ?? 100
                          })
                        });
                        if (res.ok) {
                          const updatedPrg = await res.json();
                          setPrograms(prev => prev.map(p => p.id === progId ? updatedPrg : p));
                          setSelectedBuilderProgramId(progId);
                          setProgramsSubTab('form_builder');
                          setFormBuilderFullscreen(true);
                          confetti({
                            particleCount: 120,
                            spread: 60,
                            origin: { y: 0.6 }
                          });
                        }
                      } catch (err) {
                        console.error("Apply template failed:", err);
                      }
                    }}
                    programs={programs}
                    tenantProfile={tenantProfile}
                    vertical={cfgVertical}
                    authFetch={authFetch}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* TAB 6: Calendar Appointments ledger */}
        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>ORIENTATION INTERVIEWS CALENDAR</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Track and confirm incoming video consultations and phone slots with prospects.</p>
            </div>

            <div className="border rounded-2xl shadow-sm overflow-hidden text-xs" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="font-bold border-b" style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottomColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <th className="px-4 py-3">Applicant Candidate</th>
                      <th className="px-4 py-3">Counseling Program</th>
                      <th className="px-4 py-3">Time Constraints</th>
                      <th className="px-4 py-3">Format Type</th>
                      <th className="px-4 py-3 text-right">Activity Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center italic" style={{ color: 'var(--color-text-secondary)' }}>No appointments registered.</td>
                      </tr>
                    ) : (
                      appointments.map((appt) => (
                        <tr key={appt.id} className="transition px-4" style={{ borderBottomColor: 'var(--color-border)' }}>
                          <td className="px-4 py-4.5 font-bold" style={{ color: 'var(--color-text-primary)' }}>{appt.leadName}</td>
                          <td className="px-4 py-4.5 font-bold max-w-[150px] truncate" style={{ color: 'var(--color-text-secondary)' }} title={appt.program}>{appt.program}</td>
                          <td className="px-4 py-4.5 font-mono text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                            <strong style={{ color: 'var(--color-text-primary)' }}>{appt.date}</strong> at <strong style={{ color: 'var(--color-text-primary)' }}>{appt.time}</strong> ({appt.timezone || 'Yaoundé'})
                          </td>
                          <td className="px-4 py-4.5 font-bold">
                            <span className={`text-[9px] font-mono font-bold border px-2.5 py-0.5 rounded-full ${appt.type === 'VIDEO' ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20'}`}>
                              {appt.type} CALL
                            </span>
                          </td>
                          <td className="px-4 py-4.5 text-right font-black">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 rounded-full px-3 py-1 font-mono uppercase">
                              ● CONFIRMED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: Visual reports map charts - Routed cleanly to reports subcomp */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ReportsPage leads={leads} conversations={conversations} appointments={appointments} vertical={tenantProfile?.vertical} authFetch={authFetch} />
          </motion.div>
        )}

        {/* TAB 8: Widget configuration page */}
        {activeTab === 'widget_config' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{translate('widgetConfig')}</h1>
                  <AutoSaveIndicator status={autoSaveStatus} />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Configure branding parameters, welcome triggers, and client interactive scripts.</p>
              </div>

              <div className="flex gap-2">
                {saveStatus === 'saved' && (
                  <span className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-mono inline-block animate-bounce">
                    ✓ Sync Successful!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-2.5 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shadow-accent"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  {saveStatus === 'saving' ? 'Syncing...' : translate('save')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
              {/* Branding and configuration properties columns */}
              <div className="lg:col-span-7 space-y-6">
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Interface Parameters</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Assistant Bot Name</label>
                        <AutoSaveIndicator status={autoSaveBotNameStatus} />
                      </div>
                      <input
                        type="text"
                        value={cfgBotName}
                        onChange={(e) => setCfgBotName(e.target.value)}
                        onBlur={(e) => autoSaveBotName(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold font-sans"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: autoSaveBotNameStatus === 'saved' ? '#059669' : 'var(--color-border)', transition: 'border-color 0.3s ease' }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>WhatsApp Redirect Channel</label>
                      <input
                        type="text"
                        value={cfgWhatsAppNumber}
                        onChange={(e) => setCfgWhatsAppNumber(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: 'var(--color-border)' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Notification Email address</label>
                      <AutoSaveIndicator status={autoSaveNotificationEmailStatus} />
                    </div>
                    <input
                      type="email"
                      value={cfgNotificationEmail}
                      onChange={(e) => setCfgNotificationEmail(e.target.value)}
                      onBlur={(e) => autoSaveNotificationEmail(e.target.value)}
                      placeholder="alerts@mybusiness.com"
                      className="w-full border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-semibold"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: autoSaveNotificationEmailStatus === 'saved' ? '#059669' : 'var(--color-border)', transition: 'border-color 0.3s ease' }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Initial Greeting Overrides</label>
                      <AutoSaveIndicator status={autoSaveWelcomeMessageStatus} />
                    </div>
                    <textarea
                      rows={3}
                      value={cfgWelcomeMessage}
                      onChange={(e) => setCfgWelcomeMessage(e.target.value)}
                      onBlur={(e) => autoSaveWelcomeMessage(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs outline-none resize-none animate-none font-semibold leading-relaxed"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' , borderColor: autoSaveWelcomeMessageStatus === 'saved' ? '#059669' : 'var(--color-border)', transition: 'border-color 0.3s ease' }}
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        Custom AI Persona (Advanced — Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <AutoSaveIndicator status={autoSaveCustomPersonaStatus} />
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.12)', color: 'var(--color-accent)' }}
                        >
                          Overrides Vertical Template
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={cfgCustomPersona}
                      onChange={(e) => setCfgCustomPersona(e.target.value)}
                      onBlur={(e) => autoSaveCustomPersona(e.target.value)}
                      placeholder={`Leave blank to use the selected vertical's default persona.\n\nOr write a custom system prompt here to fully control your bot's voice and scope. Example:\n"You are Maya, a friendly AI intake assistant for Greenfield Law. You help prospective clients understand our immigration and family law services, collect their case type, and book a 15-minute intro call with one of our attorneys..."`}
                      rows={6}
                      className="w-full border rounded-xl px-3.5 py-3 text-xs resize-y outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-mono leading-relaxed placeholder:opacity-40"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        borderColor: autoSaveCustomPersonaStatus === 'saved' ? '#059669' : 'var(--color-border)',
                        transition: 'border-color 0.3s ease',
                        minHeight: '120px',
                      }}
                    />
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      When set, this completely replaces the vertical template. Use{' '}
                      <code className="px-1 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                        {'{firm_name}'}
                      </code>{' '}
                      as a placeholder — it will be replaced with your business name automatically. Your Knowledge Base documents still apply on top of this prompt.
                    </p>
                  </div>
                </div>

                {/* ── WIDGET DESIGN SKIN SELECTOR ─────────────────────── */}
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                        <span className="text-base">🎨</span>
                        <span>Widget Design Style</span>
                      </h3>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Choose a structural visual preset for your chat window and launcher.
                      </p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.10)', color: 'var(--color-accent)' }}>
                      Live Preview ⚡
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                    {([
                      {
                        id: 'solid',
                        label: 'Solid',
                        icon: '⬜',
                        desc: 'Clean flat panels. Professional for any sector.',
                        badge: 'Default',
                      },
                      {
                        id: 'glass',
                        label: 'Glass',
                        icon: '🔮',
                        desc: 'Frosted blur backdrop, gradient depth. Premium feel.',
                        badge: '✨ Popular',
                      },
                      {
                        id: 'dark',
                        label: 'Neural',
                        icon: '🌑',
                        desc: 'Deep dark panels with neon accent glows.',
                        badge: 'Tech',
                      },
                      {
                        id: 'soft',
                        label: 'Soft',
                        icon: '🌸',
                        desc: 'Rounded, warm, pastel. Great for schools & childcare.',
                        badge: 'Friendly',
                      },
                      {
                        id: 'minimal',
                        label: 'Minimal',
                        icon: '📋',
                        desc: 'Thin borders, flat header. Law, finance, medical.',
                        badge: 'Clean',
                      },
                    ] as { id: WidgetSkin; label: string; icon: string; desc: string; badge: string }[]).map((s) => {
                      const isSelected = cfgWidgetSkin === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCfgWidgetSkin(s.id);
                            // Immediately fire live preview update
                            const configData = {
                              widgetSkin: s.id,
                              // pass other current values so widget doesn't lose state
                              botName: cfgBotName,
                              position: cfgPosition,
                              launcherEmoji: cfgLauncherEmoji,
                              pulseEnabled: cfgPulseEnabled,
                              customAccent: cfgCustomAccent,
                              launcherLogoUrl: cfgLauncherLogoUrl,
                              theme: activeTheme.id,
                            };
                            window.dispatchEvent(new CustomEvent('neslead-widget-config-live', { detail: configData }));
                          }}
                          className={`border rounded-xl p-3 text-left flex flex-col gap-1.5 transition-all cursor-pointer select-none relative ${
                            isSelected
                              ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 shadow-md'
                              : 'hover:border-[var(--color-accent)] hover:scale-[1.02] shadow-xs'
                          }`}
                          style={{
                            borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-secondary)',
                          }}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold shadow" style={{ background: 'var(--color-accent)' }}>
                              ✓
                            </span>
                          )}
                          <span className="text-xl leading-none">{s.icon}</span>
                          <span className="font-extrabold text-[11px] tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{s.label}</span>
                          <span className="text-[9px] leading-snug font-normal" style={{ color: 'var(--color-text-secondary)' }}>{s.desc}</span>
                          <span className="mt-auto text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full self-start" style={{ backgroundColor: `${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}22`, color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                            {s.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Contextual hint based on selected skin */}
                  {cfgWidgetSkin === 'glass' && (
                    <p className="text-[10px] px-3 py-2 rounded-xl border" style={{ backgroundColor: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.18)', color: 'var(--color-text-secondary)' }}>
                      💡 <strong>Tip:</strong> Glassmorphism looks best with gradient palette themes like <em>Aurora</em>, <em>Midnight</em>, or <em>Neon Cosmos</em> — and on host pages with colourful backgrounds.
                    </p>
                  )}
                  {cfgWidgetSkin === 'dark' && (
                    <p className="text-[10px] px-3 py-2 rounded-xl border" style={{ backgroundColor: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.15)', color: 'var(--color-text-secondary)' }}>
                      💡 <strong>Tip:</strong> The Neural skin always renders dark regardless of your current platform theme. Pair it with <em>Midnight</em>, <em>Ocean</em>, or <em>Neon Cosmos</em> for a cohesive look.
                    </p>
                  )}
                  {cfgWidgetSkin === 'minimal' && (
                    <p className="text-[10px] px-3 py-2 rounded-xl border" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      💡 <strong>Tip:</strong> Minimal works best with light palette themes like <em>Slate &amp; Coral</em>, <em>Forest</em>, or <em>Coral Sparkle</em>.
                    </p>
                  )}
                </div>
                {/* ── /WIDGET DESIGN SKIN SELECTOR ─────────────────────── */}

                {/* ── WIDGET SHADOW & DEPTH CUSTOMIZATION ─────────────── */}
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                      🔑 WIDGET SHADOW & DEPTH
                    </h3>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      Adjust drop shadows to create a premium depth and layered visual layout.
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--color-text-primary)' }}>Enable Shadow Effects</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cfgShadowEnabled}
                        onChange={(e) => setCfgShadowEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {cfgShadowEnabled && (
                    <div className="space-y-4 pt-1">
                      {/* Presets */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>Quick Shadow Presets</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'Soft Lift', x: 0, y: 20, blur: 60, spread: 0, opacity: 18, color: '#000000', layer2: false },
                            { name: 'Deep Glow', x: 0, y: 20, blur: 80, spread: 0, opacity: 35, color: 'accent', layer2: false },
                            { name: 'Color Pop', x: 0, y: 20, blur: 60, spread: 0, opacity: 15, color: '#000000', layer2: true, l2x: 0, l2y: 8, l2blur: 32, l2spread: -4, l2opacity: 40, l2color: 'accent' },
                            { name: 'Crisp Edge', x: 2, y: 4, blur: 0, spread: 0, opacity: 90, color: '#000000', layer2: false },
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                const activeAccent = cfgCustomAccent || activeTheme.tokens.accent;
                                setCfgShadowX(preset.x);
                                setCfgShadowY(preset.y);
                                setCfgShadowBlur(preset.blur);
                                setCfgShadowSpread(preset.spread);
                                setCfgShadowColorOpacity(preset.opacity);
                                setCfgShadowColor(preset.color === 'accent' ? activeAccent : preset.color);
                                setCfgShadow2Enabled(preset.layer2);
                                if (preset.layer2) {
                                  setCfgShadow2X(preset.l2x ?? 0);
                                  setCfgShadow2Y(preset.l2y ?? 8);
                                  setCfgShadow2Blur(preset.l2blur ?? 32);
                                  setCfgShadow2Spread(preset.l2spread ?? -4);
                                  setCfgShadow2Opacity(preset.l2opacity ?? 40);
                                  setCfgShadow2Color(preset.l2color === 'accent' ? activeAccent : (preset.l2color ?? '#6366f1'));
                                }
                              }}
                              className="px-2 py-1 rounded border hover:scale-[1.02] cursor-pointer text-[9px] font-extrabold transition-all"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                            >
                              {preset.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCfgShadowEnabled(false)}
                            className="px-2 py-1 rounded border hover:scale-[1.02] cursor-pointer text-[9px] font-extrabold transition-all text-rose-400"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                          >
                            Disable
                          </button>
                        </div>
                      </div>

                      {/* Layer 1 controls */}
                      <div className="p-3.5 border rounded-xl space-y-3.5" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--color-accent)]">Primary Shadow Layer</span>
                        </div>

                        {/* Color and Opacity */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-zinc-400">Color</label>
                            <input
                              type="color"
                              value={cfgShadowColor}
                              onChange={(e) => setCfgShadowColor(e.target.value)}
                              className="w-full h-8 rounded-lg cursor-pointer border bg-transparent p-0"
                              style={{ borderColor: 'var(--color-border)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                              <span>Opacity</span>
                              <span>{cfgShadowColorOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={cfgShadowColorOpacity}
                              onChange={(e) => setCfgShadowColorOpacity(parseInt(e.target.value))}
                              className="w-full mt-1.5"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>
                        </div>

                        {/* Offsets */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                              <span>Offset X</span>
                              <span>{cfgShadowX}px</span>
                            </div>
                            <input
                              type="range"
                              min="-60"
                              max="60"
                              value={cfgShadowX}
                              onChange={(e) => setCfgShadowX(parseInt(e.target.value))}
                              className="w-full mt-1.5"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                              <span>Offset Y</span>
                              <span>{cfgShadowY}px</span>
                            </div>
                            <input
                              type="range"
                              min="-60"
                              max="60"
                              value={cfgShadowY}
                              onChange={(e) => setCfgShadowY(parseInt(e.target.value))}
                              className="w-full mt-1.5"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>
                        </div>

                        {/* Blur and Spread */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                              <span>Blur Radius</span>
                              <span>{cfgShadowBlur}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="120"
                              value={cfgShadowBlur}
                              onChange={(e) => setCfgShadowBlur(parseInt(e.target.value))}
                              className="w-full mt-1.5"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                              <span>Spread</span>
                              <span>{cfgShadowSpread}px</span>
                            </div>
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={cfgShadowSpread}
                              onChange={(e) => setCfgShadowSpread(parseInt(e.target.value))}
                              className="w-full mt-1.5"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Layer 2 Toggle */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Second Glow Shadow Layer</span>
                        <button
                          type="button"
                          onClick={() => setCfgShadow2Enabled(!cfgShadow2Enabled)}
                          className="px-2.5 py-1 text-[9px] font-black uppercase rounded border transition-colors cursor-pointer"
                          style={{
                            backgroundColor: cfgShadow2Enabled ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                            borderColor: cfgShadow2Enabled ? 'transparent' : 'var(--color-border)',
                            color: cfgShadow2Enabled ? '#ffffff' : 'var(--color-text-primary)'
                          }}
                        >
                          {cfgShadow2Enabled ? 'Remove' : 'Add Layer 2'}
                        </button>
                      </div>

                      {/* Layer 2 controls */}
                      {cfgShadow2Enabled && (
                        <div className="p-3.5 border rounded-xl space-y-3.5" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--color-accent)]">Secondary Layer (Stack Glow)</span>

                          {/* Color and Opacity */}
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-zinc-400">Color</label>
                              <input
                                type="color"
                                value={cfgShadow2Color}
                                onChange={(e) => setCfgShadow2Color(e.target.value)}
                                className="w-full h-8 rounded-lg cursor-pointer border bg-transparent p-0"
                                style={{ borderColor: 'var(--color-border)' }}
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                                <span>Opacity</span>
                                <span>{cfgShadow2Opacity}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={cfgShadow2Opacity}
                                onChange={(e) => setCfgShadow2Opacity(parseInt(e.target.value))}
                                className="w-full mt-1.5"
                                style={{ accentColor: 'var(--color-accent)' }}
                              />
                            </div>
                          </div>

                          {/* Offsets */}
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                                <span>Offset X</span>
                                <span>{cfgShadow2X}px</span>
                              </div>
                              <input
                                type="range"
                                min="-60"
                                max="60"
                                value={cfgShadow2X}
                                onChange={(e) => setCfgShadow2X(parseInt(e.target.value))}
                                className="w-full mt-1.5"
                                style={{ accentColor: 'var(--color-accent)' }}
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                                <span>Offset Y</span>
                                <span>{cfgShadow2Y}px</span>
                              </div>
                              <input
                                type="range"
                                min="-60"
                                max="60"
                                value={cfgShadow2Y}
                                onChange={(e) => setCfgShadow2Y(parseInt(e.target.value))}
                                className="w-full mt-1.5"
                                style={{ accentColor: 'var(--color-accent)' }}
                              />
                            </div>
                          </div>

                          {/* Blur and Spread */}
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                                <span>Blur Radius</span>
                                <span>{cfgShadow2Blur}px</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="120"
                                value={cfgShadow2Blur}
                                onChange={(e) => setCfgShadow2Blur(parseInt(e.target.value))}
                                className="w-full mt-1.5"
                                style={{ accentColor: 'var(--color-accent)' }}
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400">
                                <span>Spread</span>
                                <span>{cfgShadow2Spread}px</span>
                              </div>
                              <input
                                type="range"
                                min="-30"
                                max="30"
                                value={cfgShadow2Spread}
                                onChange={(e) => setCfgShadow2Spread(parseInt(e.target.value))}
                                className="w-full mt-1.5"
                                style={{ accentColor: 'var(--color-accent)' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* ── /WIDGET SHADOW & DEPTH CUSTOMIZATION ─────────────── */}

                {/* Brand Options Button & Customized UI Box */}
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }}></span>
                        <span>Interactive Brand Customizer</span>
                      </h3>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Configure positioning, color themes, launcher style and live previews.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBrandCustomize(!showBrandCustomize)}
                      className="px-3 py-1.5 border rounded-lg transition cursor-pointer text-[10px] font-bold flex items-center gap-1 hover:opacity-90"
                      style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                      <span>{showBrandCustomize ? 'Hide Config' : 'Configure Brand'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBrandCustomize ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showBrandCustomize && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      {/* Color Palette customization options */}
                      <div className="space-y-2">
                        {/* Info Banner */}
                        <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-[10px] mb-2" style={{ backgroundColor: 'rgba(var(--color-accent-rgb),0.06)', border: '1px solid rgba(var(--color-accent-rgb),0.15)' }}>
                          <span className="shrink-0 mt-0.5">🎨</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            <strong style={{ color: 'var(--color-text-primary)' }}>Bot appearance only.</strong> These color changes apply exclusively to your embedded chat widget — your admin dashboard theme is not affected.
                          </span>
                        </div>
                        <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Select Color Palette Theme ({THEMES[cfgBotTheme]?.label || cfgBotTheme})</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {Object.entries(THEMES).map(([id, t]) => {
                            const isSelected = cfgBotTheme === id;
                            return (
                              <div
                                key={id}
                                className={`border rounded-xl p-3 text-center transition-all flex flex-col justify-between items-center gap-2.5 relative cursor-pointer select-none group ${
                                  isSelected 
                                    ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 shadow-md' 
                                    : 'hover:border-[var(--color-accent)] shadow-xs hover:scale-[1.02]'
                                }`}
                                style={{
                                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  color: 'var(--color-text-primary)',
                                }}
                                onClick={() => {
                                  setCfgBotTheme(id as ThemeId);
                                  setCfgColorMode('solid');
                                  setCfgSolidColor('');
                                  setCfgCustomAccent(''); // Reset individual override on theme switch
                                }}
                              >
                                {isSelected && (
                                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold shadow" style={{ background: 'var(--color-accent)' }}>
                                    ✓
                                  </span>
                                )}
                                <span
                                  className="font-extrabold text-[10px] leading-tight block truncate tracking-tight group-hover:text-[var(--color-accent)] transition-colors"
                                >
                                  {t.label}
                                </span>

                                <div className="flex gap-1.5 justify-center mt-1">
                                  {[
                                    { key: 'accent', value: t.tokens.accent, label: 'Accent' },
                                    { key: 'bg_primary', value: t.tokens.bg_primary, label: 'Primary bg' },
                                    { key: 'bg_card', value: t.tokens.bg_card, label: 'Card bg' }
                                  ].map((item) => {
                                    const isColorActive = isSelected && (cfgCustomAccent === item.value || (cfgCustomAccent === "" && item.key === 'accent'));
                                    return (
                                      <button
                                        type="button"
                                        key={item.key}
                                        title={`Use ${item.label} (${item.value})`}
                                        onClick={(e) => {
                                          e.stopPropagation(); // prevent container click from resetting custom accent
                                          if (!isSelected) {
                                            setCfgBotTheme(id as ThemeId);
                                          }
                                          setCfgColorMode('solid');
                                          setCfgSolidColor(item.value);
                                          setCfgCustomAccent(item.value);
                                        }}
                                        className="w-5 h-5 rounded-full border transition cursor-pointer relative shadow-inner hover:scale-115 flex items-center justify-center"
                                        style={{
                                          backgroundColor: item.value,
                                          borderColor: isColorActive ? 'var(--color-text-primary)' : 'rgba(0,0,0,0.15)',
                                          borderWidth: isColorActive ? '2px' : '1px'
                                        }}
                                      >
                                        {isColorActive && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Accent Color Mode Builder */}
                      <ColorModeBuilder
                        colorMode={cfgColorMode}
                        setColorMode={setCfgColorMode}
                        solidColor={cfgSolidColor}
                        setSolidColor={setCfgSolidColor}
                        gradientType={cfgGradientType}
                        setGradientType={setCfgGradientType}
                        gradientAngle={cfgGradientAngle}
                        setGradientAngle={setCfgGradientAngle}
                        gradientStops={cfgGradientStops}
                        setGradientStops={setCfgGradientStops}
                        glassPreset={cfgGlassPreset}
                        setGlassPreset={setCfgGlassPreset}
                        glassBlur={cfgGlassBlur}
                        setGlassBlur={setCfgGlassBlur}
                        glassOpacity={cfgGlassOpacity}
                        setGlassOpacity={setCfgGlassOpacity}
                        onApply={() => {
                          let computedBotAccent = '';
                          let computedBotGradient = '';
                          let computedBotLauncherGradient = '';

                          if (cfgColorMode === 'gradient') {
                            computedBotAccent = cfgGradientStops[0]?.color ?? activeTheme.tokens.accent;
                            computedBotGradient = buildGradientString(cfgGradientType, cfgGradientAngle, cfgGradientStops);
                            computedBotLauncherGradient = computedBotGradient;
                          } else if (cfgColorMode === 'glass') {
                            const preset = GLASS_PRESETS[cfgGlassPreset];
                            computedBotAccent = activeTheme.tokens.accent;
                            computedBotGradient = preset.accentGradient;
                            computedBotLauncherGradient = preset.launcherGradient;
                          } else {
                            computedBotAccent = cfgSolidColor;
                            computedBotGradient = `linear-gradient(135deg, ${cfgSolidColor}, ${cfgSolidColor}cc)`;
                            computedBotLauncherGradient = computedBotGradient;
                          }

                          const configData = {
                            botName: cfgBotName,
                            welcomeMessage: cfgWelcomeMessage,
                            leadCaptureEnabled: cfgLeadCapture,
                            bookingEnabled: cfgBooking,
                            humanHandoffEnabled: cfgHandoff,
                            confidenceDisplayEnabled: cfgConfidence,
                            whatsappEnabled: cfgWhatsApp,
                            whatsappNumber: cfgWhatsAppNumber,
                            timeTriggerEnabled: cfgTimeTrigger,
                            timeTriggerDelay: cfgTimeDelay,
                            scrollTriggerEnabled: cfgScrollTrigger,
                            scrollTriggerPercent: cfgScrollTrigger,
                            exitIntentEnabled: cfgExitIntent,
                            idleTriggerEnabled: cfgIdleTrigger,
                            position: cfgPosition,
                            launcherEmoji: cfgLauncherEmoji,
                            pulseEnabled: cfgPulseEnabled,
                            theme: activeTheme.id,
                            botTheme: cfgBotTheme,
                            customAccent: cfgCustomAccent,
                            launcherLogoUrl: cfgLauncherLogoUrl,
                            widgetSkin: cfgWidgetSkin,
                            _botAccent: computedBotAccent,
                            _botGradient: computedBotGradient,
                            _botLauncherGradient: computedBotLauncherGradient,
                            _customBoxShadow: computedBoxShadow,
                          };

                          window.dispatchEvent(new CustomEvent('neslead-widget-config-live', { detail: configData }));
                          
                          setGradientApplied(true);
                          setTimeout(() => {
                            setGradientApplied(false);
                          }, 1800);
                        }}
                        applied={gradientApplied}
                      />

                      {/* Positioning and Launcher bubble customization details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* POSITION */}
                        <div className="space-y-1.5">
                          <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Widget Position on Screen</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCfgPosition('right_bottom');
                                window.dispatchEvent(new CustomEvent('neslead-widget-config-live', {
                                  detail: {
                                    position: 'right_bottom',
                                    botName: cfgBotName,
                                    launcherEmoji: cfgLauncherEmoji,
                                    pulseEnabled: cfgPulseEnabled,
                                    widgetSkin: cfgWidgetSkin,
                                    theme: activeTheme.id,
                                  }
                                }));
                              }}
                              className={`py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${cfgPosition === 'right_bottom' ? 'text-white border-transparent' : ''}`}
                              style={cfgPosition === 'right_bottom' 
                                ? { background: 'var(--accent-gradient)' } 
                                : { backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }
                              }
                            >
                              ↘ Right Bottom
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCfgPosition('left_bottom');
                                window.dispatchEvent(new CustomEvent('neslead-widget-config-live', {
                                  detail: {
                                    position: 'left_bottom',
                                    botName: cfgBotName,
                                    launcherEmoji: cfgLauncherEmoji,
                                    pulseEnabled: cfgPulseEnabled,
                                    widgetSkin: cfgWidgetSkin,
                                    theme: activeTheme.id,
                                  }
                                }));
                              }}
                              className={`py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${cfgPosition === 'left_bottom' ? 'text-white border-transparent' : ''}`}
                              style={cfgPosition === 'left_bottom' 
                                ? { background: 'var(--accent-gradient)' } 
                                : { backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }
                              }
                            >
                              ↙ Left Bottom
                            </button>
                          </div>
                        </div>

                        {/* HELPER LAUNCHER EMOJI */}
                        <div className="space-y-1.5">
                          <label className="font-bold block uppercase tracking-wide text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Launcher Bubble Icon Preset</label>
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {['🤖', '💬', '👩', '✨', '🎓', '🏫'].map((emoji) => {
                              const isSelected = cfgLauncherEmoji === emoji;
                              return (
                                <button
                                  type="button"
                                  key={emoji}
                                  onClick={() => setCfgLauncherEmoji(emoji)}
                                  className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm transition cursor-pointer shrink-0`}
                                  style={isSelected 
                                    ? { borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg-secondary)', outline: '1px solid var(--color-accent)' }
                                    : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }
                                  }
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                            <input
                              type="text"
                              maxLength={3}
                              value={cfgLauncherEmoji}
                              onChange={(e) => setCfgLauncherEmoji(e.target.value)}
                              placeholder="..."
                              className="w-10 h-8 text-center border rounded-xl text-xs outline-none uppercase shrink-0 font-bold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                              title="Custom character symbol"
                            />
                          </div>
                        </div>
                      </div>

                      {/* BRAND IMAGE / LOGO CUSTOMIZATION */}
                      <div className="space-y-4 border rounded-2xl p-4 mt-2" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                        <div>
                          <div className="flex flex-row items-center justify-between gap-2 overflow-hidden flex-wrap w-full">
                            <span className="font-extrabold text-[12px] uppercase tracking-wider truncate" style={{ color: 'var(--color-text-primary)' }}>Custom Brand Logo Image</span>
                            <span className="text-[9px] font-black uppercase text-emerald-400 font-mono tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap overflow-hidden">Real-time Push</span>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="relative group inline-block">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-serif font-black text-xs cursor-help shadow-sm select-none transition-colors">
                                i
                              </span>
                              {/* Hover Tooltip/Popover */}
                              <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto absolute left-0 top-7 z-50 w-72 sm:w-80 md:w-96 max-w-[85vw] p-3 rounded-xl border shadow-xl text-[11px] leading-relaxed transition-all duration-200"
                                   style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                <div className="absolute top-0 left-[6px] -translate-y-1 w-2 h-2 rotate-45 border-t border-l" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }} />
                                Upload your business logo to display inside the launcher bubble badge instead of the emoji character symbols. Accepts PNG, JPG, or SVG under 500KB.
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                              Hover to see guidelines
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          {/* Current Logo Preview Thumbnail */}
                          <div className="flex flex-col items-center justify-center relative w-16 h-16 rounded-full border shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                            {cfgLauncherLogoUrl ? (
                              <img src={cfgLauncherLogoUrl} alt="Logo preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-neutral-400">
                                <span className="text-lg">{cfgLauncherEmoji || '🤖'}</span>
                                <span className="text-[7px] font-bold uppercase mt-0.5">Preset</span>
                              </div>
                            )}

                            {/* Floating Clear Button */}
                            {cfgLauncherLogoUrl && (
                              <button
                                type="button"
                                onClick={() => setCfgLauncherLogoUrl('')}
                                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-extrabold cursor-pointer"
                                title="Remove brand logo icon"
                              >
                                RESET
                              </button>
                            )}
                          </div>

                          {/* File Drop & Choose Target (Drag & Drop + Click manual selection support) */}
                          <div className="flex-1 w-full">
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleLogoUpload(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => {
                                const el = document.getElementById('brand_logo_file_picker');
                                if (el) el.click();
                              }}
                              className="w-full py-4 px-3 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-accent)] transition-all bg-[var(--color-bg-secondary)]"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              <input
                                type="file"
                                id="brand_logo_file_picker"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleLogoUpload(e.target.files[0]);
                                  }
                                }}
                              />
                              <div className="flex items-center gap-1.5 justify-center mb-1">
                                <span className="text-xs font-black uppercase text-accent" style={{ color: 'var(--color-accent)' }}>
                                  {logoUploading ? '⚡ Uploading...' : 'Drag / Click to upload'}
                                </span>
                              </div>
                              <span className="text-[9px] font-semibold text-neutral-400">
                                Max size: 500KB. PNG, JPG, or SVG
                              </span>
                            </div>

                            {/* Upload Failure Message */}
                            {logoError && (
                              <p className="text-red-500 text-[10px] font-bold mt-1.5 animate-pulse">
                                ⚠️ {logoError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Animation pulse option */}
                      <label 
                        className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer font-bold"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                      >
                        <div>
                          <span style={{ color: 'var(--color-text-primary)' }}>Interactive Pulse Notification Ring</span>
                          <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Bonus launcher glow animation triggers when visitor is idle</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfgPulseEnabled}
                          onChange={() => setCfgPulseEnabled(!cfgPulseEnabled)}
                          className="w-4 h-4 rounded text-accent"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent" style={{ color: 'var(--color-accent)' }}>Features Toggles</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Require Conversational Lead form</span>
                        <span className="text-[9px] font-normal block mt-0.5 animate-none" style={{ color: 'var(--color-text-secondary)' }}>Prompt visitor information capture first</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgLeadCapture}
                        onChange={() => setCfgLeadCapture(!cfgLeadCapture)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Active Video Slot Schedulers</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Let captured leads book a consultation</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgBooking}
                        onChange={() => setCfgBooking(!cfgBooking)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Allow Advisor takeover cues</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Show "Ask Recruiter Help" buttons</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgHandoff}
                        onChange={() => setCfgHandoff(!cfgHandoff)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Confidence display stats</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Below each RAG reply, show similarity scores</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgConfidence}
                        onChange={() => setCfgConfidence(!cfgConfidence)}
                        className="w-4 h-4 rounded text-accent"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Javascript embed instructions and trigger options column */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Embed code snippet */}
                <div className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent" style={{ color: 'var(--color-accent)' }}>WordPress / Webflow Embed script</h3>
                  <p className="text-[10px] text-zinc-400 leading-normal">Insert this single code snippet inside your global website header or footer layout template:</p>
                  
                  <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-lg font-mono text-[9px] leading-relaxed select-all whitespace-pre-wrap overflow-x-auto text-zinc-300 text-left">
                    {`<!-- NesLead Widget -->
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${window.location.origin}/widget-embed?key=${tenantProfile?.widget_key || tenantProfile?.id || 'ea_live_67a0dbf09ca889ff212'}&mode=client';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:420px;height:600px;border:none;z-index:99999;background:transparent;';
    iframe.allow = 'microphone';
    document.body.appendChild(iframe);
    window.addEventListener('message', function(e) {
      if (e.data === 'close-neslead-widget') iframe.style.display = 'none';
      if (e.data === 'open-neslead-widget')  iframe.style.display = 'block';
    });
  })();
</script>`}
                  </div>
                </div>

                {/* Behavioral trigger speeds parameters options */}
                <div className="border rounded-2xl p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-accent" style={{ color: 'var(--color-accent)' }}>Behavioral Triggers</h3>

                  <div className="space-y-3 text-xs font-bold">
                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Time Delayed Popup</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Autoshow teaser speech bubbles</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgTimeTrigger}
                        onChange={() => setCfgTimeTrigger(!cfgTimeTrigger)}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    {cfgTimeTrigger && (
                      <div className="px-3 py-2 border rounded-xl space-y-1.5 animate-fade-in" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        <div className="flex justify-between items-baseline text-[10px] font-mono font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                           <span>Delay threshold timer:</span>
                           <span style={{ color: 'var(--color-text-primary)' }}>{cfgTimeDelay} seconds</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={30}
                          value={cfgTimeDelay}
                          onChange={(e) => setCfgTimeDelay(Number(e.target.value))}
                          className="w-full accent-accent"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                      </div>
                    )}

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Exit Intent Recovery overlay</span>
                        <span className="text-[9px] font-normal block mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Lock-in waivers when user leaves tab bounds</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgExitIntent}
                        onChange={() => setCfgExitIntent(!cfgExitIntent)}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>

                    {cfgExitIntent && (
                      <div className="space-y-3 p-3 border rounded-xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div>
                          <label className="block text-[10px] uppercase font-black tracking-wider text-neutral-400 mb-1">Exit Form Headline</label>
                          <input
                            type="text"
                            placeholder="e.g. Don't miss out!"
                            value={cfgExitFormHeadline}
                            onChange={(e) => setCfgExitFormHeadline(e.target.value)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-black tracking-wider text-neutral-400 mb-1">Exit Form Body Text</label>
                          <textarea
                            placeholder="e.g. Drop your email below for exclusive info and options."
                            value={cfgExitFormBody}
                            rows={2}
                            onChange={(e) => setCfgExitFormBody(e.target.value)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-black tracking-wider text-neutral-400 mb-1">Exit Form Button Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Secure My Priority Contact Slot"
                            value={cfgExitFormBtnLabel}
                            onChange={(e) => setCfgExitFormBtnLabel(e.target.value)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <label 
                      className="flex items-center justify-between border rounded-xl p-3 transition cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <div>
                        <span>Idle pulsation launcher aura</span>
                        <span className="text-[9px] font-normal block mt-0.5 font-sans" style={{ color: 'var(--color-text-secondary)' }}>Glow launcher if active user remains inactive</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cfgIdleTrigger}
                        onChange={() => setCfgIdleTrigger(!cfgIdleTrigger)}
                        className="w-4 h-4"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

          </form>
          </motion.div>
        )}

        {/* TAB 9: Billing Ledger settings Routed cleanly back to subcomp */}
        {activeTab === 'billing' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <BillingPage 
              leadsCount={leads.length} 
              convsCount={conversations.length} 
              onPlanUpgrade={() => loadData(true)} 
              currentPlan={tenantProfile?.plan || signupIntentPlan || 'Starter'}
              isTrialActive={isTrialActive}
              authFetch={authFetch}
            />
          </motion.div>
        )}

        {/* TAB 10: Team Members administration dashboard */}
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TeamMembers vertical={cfgVertical} authFetch={authFetch} />
          </motion.div>
        )}

        {/* TAB 11: User Profile Settings dashboard */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <UserProfile 
              onProfileUpdated={loadData}
              tenantProfile={tenantProfile}
              teamRole={teamMemberRole}
              onAvatarChange={(url) => setTenantProfile(prev => prev ? { ...prev, profile_image_url: url } : prev)}
            />
          </motion.div>
        )}

        {/* PIN Gate Modal for Super Admin */}
        {showPinModal && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowPinModal(false); setPinInput(''); setPinError(''); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={pinShake
                ? { opacity: 1, scale: 1, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }
                : { opacity: 1, scale: 1, y: 0, x: 0 }}
              transition={{ duration: pinShake ? 0.5 : 0.25 }}
              className="w-full max-w-sm mx-4 rounded-2xl border p-8 space-y-6 shadow-2xl"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Admin PIN Required
                </h2>
                <p className="text-xs font-semibold text-neutral-400">
                  Enter your 4-digit supervisor PIN to access the control panel.
                </p>
              </div>

              {/* 4 digit boxes */}
              <div 
                className="flex gap-3 justify-center cursor-text" 
                onClick={() => { document.getElementById('pin-hidden-input')?.focus(); }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black font-mono transition-all"
                    style={{
                      borderColor: pinInput.length === i
                        ? 'var(--color-accent, #6366f1)'
                        : pinInput.length > i
                          ? 'var(--color-accent, #6366f1)'
                          : 'var(--color-border)',
                      backgroundColor: 'var(--color-bg-base)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {pinInput[i] ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Hidden input that captures keystrokes */}
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                autoFocus
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinInput(val);
                  setPinError('');
                  if (val.length === 4) {
                    setTimeout(() => {
                      handlePinSubmit(val);
                    }, 80);
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && pinInput.length === 4) handlePinSubmit(); }}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '1px',
                  height: '1px',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
                id="pin-hidden-input"
              />

              {/* Error message */}
              {pinError && (
                <p className="text-center text-xs font-bold text-red-400">{pinError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 text-xs font-black uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition-all hover:bg-neutral-800/10 cursor-pointer text-neutral-300"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="pin-submit-btn"
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 4 || pinLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all disabled:opacity-40 bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                >
                  {pinLoading ? 'Verifying…' : 'Unlock'}
                </button>
              </div>

              {/* Numeric pad (mobile-friendly fallback) */}
              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={!k}
                    onClick={() => {
                      if (k === '⌫') {
                        setPinInput(p => p.slice(0, -1));
                        setPinError('');
                      } else if (k && pinInput.length < 4) {
                        const next = pinInput + k;
                        setPinInput(next);
                        setPinError('');
                      }
                    }}
                    className={`h-10 rounded-xl text-sm font-black transition-all ${k ? 'hover:opacity-80 active:scale-95 cursor-pointer' : 'invisible'}`}
                    style={{
                      backgroundColor: k === '⌫' ? 'transparent' : 'var(--color-bg-base, #1b1b1d)',
                      border: k && k !== '⌫' ? '1px solid var(--color-border)' : 'none',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* TAB 11.5: Super Admin Panel */}
        {activeTab === 'super_admin' && tenantProfile?.isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SuperAdminPanel
              sessionToken={localStorage.getItem('neslead_session_token')}
              exitFormHeadline={cfgExitFormHeadline}
              exitFormBody={cfgExitFormBody}
              exitFormBtnLabel={cfgExitFormBtnLabel}
              onSaveExitForm={async (headline, body, btnLabel) => {
                setCfgExitFormHeadline(headline);
                setCfgExitFormBody(body);
                setCfgExitFormBtnLabel(btnLabel);
                try {
                  await authFetch('/api/widget/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      botName: cfgBotName,
                      welcomeMessage: cfgWelcomeMessage,
                      leadCaptureEnabled: cfgLeadCapture,
                      bookingEnabled: cfgBooking,
                      humanHandoffEnabled: cfgHandoff,
                      confidenceDisplayEnabled: cfgConfidence,
                      whatsappEnabled: cfgWhatsApp,
                      whatsappNumber: cfgWhatsAppNumber,
                      timeTriggerEnabled: cfgTimeTrigger,
                      timeTriggerDelay: cfgTimeDelay,
                      scrollTriggerEnabled: cfgScrollTrigger,
                      scrollTriggerPercent: cfgScrollPercent,
                      exitIntentEnabled: cfgExitIntent,
                      idleTriggerEnabled: cfgIdleTrigger,
                      position: cfgPosition,
                      launcherEmoji: cfgLauncherEmoji,
                      launcherLogoUrl: cfgLauncherLogoUrl,
                      pulseEnabled: cfgPulseEnabled,
                      theme: activeTheme.id,
                      botTheme: cfgBotTheme,
                      customAccent: cfgCustomAccent,
                      vertical: cfgVertical,
                      customPersona: cfgCustomPersona,
                      widgetSkin: cfgWidgetSkin,
                      exitFormHeadline: headline,
                      exitFormBody: body,
                      exitFormBtnLabel: btnLabel
                    })
                  });
                } catch (err) {
                  console.error('Error saving superadmin exit form settings:', err);
                }
              }}
            />
          </motion.div>
        )}

        {/* TAB 12: Embedded Setup Wizard panel */}
        {activeTab === 'setup_wizard' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-black">Assistant Setup Wizard</h2>
              </div>
              <p className="text-xs max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                Configure your bot's identity, knowledge base, lead capture fields, engagement triggers, and delivery settings. All answers are saved to your account permanently.
              </p>
            </div>

            {/* Status Banner */}
            {tenantProfile?.onboarded === 1 ? (
              <div className="p-4 rounded-2xl border flex items-start gap-3"
                style={{ backgroundColor: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 text-white shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400">Setup Completed</h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Your assistant is live. Re-run the wizard at any time to change vertical, theme, or any other setting. Previous answers will be pre-filled.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border flex items-start gap-3"
                style={{ backgroundColor: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: 'linear-gradient(136deg, #F59E0B, #EF4444)' }}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-600 dark:text-amber-400">Setup Incomplete</h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Your assistant has not been activated. Complete the wizard to go live. Progress is automatically saved — you can pause and resume from any device.
                  </p>
                </div>
              </div>
            )}

            {/* Configuration Summary — only visible after onboarding is done */}
            {tenantProfile?.onboarded === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Bot Name', value: cfgBotName || '—', icon: '🤖' },
                  { label: 'Vertical', value: cfgVertical || '—', icon: '🎯' },
                  { label: 'Theme', value: activeTheme?.id || '—', icon: '🎨' },
                  { label: 'Notification Email', value: (() => {
                    try {
                      const d = JSON.parse(localStorage.getItem('neslead_wizard_saved_progress') || '{}');
                      return d.notificationEmail || tenantProfile?.email || 'Not set';
                    } catch {
                      return tenantProfile?.email || 'Not set';
                    }
                  })(), icon: '📧' },
                ].map((item) => (
                  <div key={item.label} className="border rounded-2xl p-4 space-y-1"
                    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <span className="text-xl block">{item.icon}</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}>{item.label}</p>
                    <p className="text-sm font-black truncate capitalize"
                      style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Main CTA Card */}
            <div
              className="rounded-3xl border p-8 flex flex-col items-center justify-center gap-5 text-center relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', minHeight: '260px' }}
            >
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 60% 40%, var(--color-accent) 0%, transparent 70%)' }} />

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative"
                style={{ background: 'var(--accent-gradient)' }}>
                <Wand2 className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2 max-w-md relative">
                <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  {tenantProfile?.onboarded === 1 ? 'Reconfigure Your Assistant' : 'Launch Setup Wizard'}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {tenantProfile?.onboarded === 1
                    ? 'Reconfigure vertical, rebrand your bot, or update notification settings. Changes apply immediately.'
                    : '15 guided steps to activate your AI assistant. Takes about 6 minutes. Progress is saved automatically across all devices.'}
                </p>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('neslead_skipped_wizard');
                  setSkippedWizard(false);
                  setShowWizard(true);
                }}
                className="px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2.5 cursor-pointer relative"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <Wand2 className="w-4 h-4" />
                <span>{tenantProfile?.onboarded === 1 ? 'Reconfigure Assistant' : 'Start Setup Wizard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Resume notice — only shown if a draft exists beyond step 1 */}
              {(() => {
                try {
                  const d = JSON.parse(localStorage.getItem('neslead_wizard_saved_progress') || '{}');
                  if (d.step && d.step > 1 && tenantProfile?.onboarded !== 1) {
                    return (
                      <p className="text-[11px] font-medium relative" style={{ color: 'var(--color-text-secondary)' }}>
                        ↩ Saved draft found at <strong>Step {d.step} of 15</strong>. The wizard will resume where you left off.
                      </p>
                    );
                  }
                } catch {}
                return null;
              })()}
            </div>
          </motion.div>
        )}

        {/* TAB 13: Integrations Settings Hub */}
        {activeTab === 'integrations' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <IntegrationsPage />
          </motion.div>
        )}

        {/* TAB 14: AI Voice Settings Hub */}
        {activeTab === 'voice_settings' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <VoiceSettings authFetch={authFetch} isSuperAdmin={tenantProfile?.isSuperAdmin === true} />
          </motion.div>
        )}

          </GsapTransition>
        </div>
      </main>

      {/* Persistent floating launcher sandbox widget synced dynamically with form configs */}
      <FloatingWidget
        tenantPlan={tenantProfile?.plan}
        disableExitIntent={tenantProfile?.isSuperAdmin === true}
      />

      {/* Configuration reminder banner for uncompleted setups */}
      <ConfigurationReminderWidget
        onboarded={tenantProfile?.onboarded === 1 || ['programs', 'kb', 'inbox', 'leads'].includes(activeTab)}
        tenantProfile={tenantProfile}
        vertical={tenantProfile?.vertical}
        onboardingContext={tenantProfile?.onboarding_context}
        onResumeWizard={() => {
          localStorage.removeItem('neslead_skipped_wizard');
          setSkippedWizard(false);
          setShowWizard(true);
        }}
      />

      {/* ══════════════════════════════════════════════════
          GLOBAL ONBOARDING WIZARD MODAL OVERLAY
          Single entry point for both first-time and re-run.
          Controlled by showWizard state from App.tsx.
          ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            key="wizard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowWizard(false);
              }
            }}
          >
            <motion.div
              key="wizard-card"
              id="wizard_modal_scroller"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl relative scrollbar-none scroll-smooth-container"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close/Minimize button — always visible to allow exit or minimize */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  id="minimize_wizard_btn"
                  onClick={() => { setShowWizard(false); setWizardManuallyClosed(true); }}
                  className="p-2 rounded-full border transition-all cursor-pointer bg-[var(--color-bg-card)] hover:bg-zinc-800 hover:text-white flex items-center justify-center shadow-lg"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  title="Minimize setup"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  id="close_wizard_btn"
                  onClick={() => { setShowWizard(false); setWizardManuallyClosed(true); }}
                  className="p-2 rounded-full border transition-all cursor-pointer bg-[var(--color-bg-card)] hover:bg-red-950/20 hover:text-red-400 flex items-center justify-center shadow-lg"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  title="Exit Setup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <OnboardingWizard
                tenantProfile={tenantProfile}
                onSkip={async () => {
                  localStorage.setItem('neslead_skipped_wizard', 'true');
                  localStorage.setItem('neslead_dismissed_setup_popup', 'true');
                  localStorage.removeItem('neslead_wizard_saved_progress');
                  setSkippedWizard(true);
                  setShowWizard(false);
                  setIsPostSignupWizard(false);
                  const token = localStorage.getItem('neslead_session_token');
                  try {
                    await fetch('/api/tenant/skip', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                      }
                    });
                  } catch (err) {
                    console.error('Failed to skip onboarding:', err);
                  }
                }}
                onComplete={handleWizardComplete}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ONBOARDING SUCCESS CELEBRATION MODAL */}
      <AnimatePresence>
        {showOnboardingSuccess && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-md overflow-hidden rounded-3xl p-6 md:p-8 border shadow-2xl relative text-center space-y-5"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)'
              }}
            >
              {/* Pulsing Trophy / Star Icon */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50/50 dark:bg-zinc-800/60 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/10 animate-ping" />
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>

              {/* Celebration Greetings */}
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-indigo-500">
                  Congratulations !!! 🎉
                </h3>
                <p className="text-sm font-extrabold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                  Your account has been configured successfully .. Welcome to Your New Dashboard
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Your customized virtual onboarding agent and lead workflows are now fully deployed and ready for action.
                </p>
              </div>

              {/* Status Landmarks Summary */}
              <div className="rounded-2xl border p-4 text-left space-y-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 font-mono block">Setup Summary:</span>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span style={{ color: 'var(--color-text-primary)' }}>15 Wizard configuration parameters initialized</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span style={{ color: 'var(--color-text-primary)' }}>Customized AI agent workspace active</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span style={{ color: 'var(--color-text-primary)' }}>Floating widget deployment embed ready</span>
                  </div>
                </div>
              </div>

              {/* Action Close CTA */}
              <button
                type="button"
                onClick={() => {
                  setShowOnboardingSuccess(false);
                  setActiveTab('leads');
                }}
                className="w-full py-3 px-6 rounded-xl text-white text-sm font-bold shadow-lg cursor-pointer transition hover:scale-[1.01] active:scale-[0.98]"
                style={{ background: 'var(--accent-gradient)' }}
              >
                Go to My Leads →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {templatePreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setTemplatePreviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div>
                  <h3 className="text-sm font-black" style={{ color: 'var(--color-text-primary)' }}>
                    {templatePreviewModal.name}
                  </h3>
                  <p className="text-[10px] mt-0.5 capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                    {templatePreviewModal.category.replace(/_/g, ' ')} · {templatePreviewModal.formSchema.length} fields
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTemplatePreviewModal(null)}
                  className="p-1.5 rounded-lg transition hover:bg-neutral-100 cursor-pointer"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview area — renders the form schema visually */}
              <div
                className="p-5 max-h-[60vh] overflow-y-auto"
                style={{
                  background: templatePreviewModal.formBg || 'var(--color-bg-base)',
                }}
              >
                {templatePreviewModal.formSchema.length === 0 ? (
                  <div className="text-center py-10">
                    <Layout className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--color-accent)' }} />
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Template preview coming soon</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templatePreviewModal.formSchema.map((field) => (
                      <div key={field.id} className="space-y-1">
                        {field.type !== 'divider' && field.type !== 'vertical_divider' && field.type !== 'page_break' && (
                          <label className="text-[10px] font-bold block" style={{ color: 'var(--color-text-primary)', textAlign: field.textAlign || 'left' }}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-0.5">*</span>}
                          </label>
                        )}
                        {['short_text', 'phone', 'email', 'number', 'password'].includes(field.type) && (
                          <div className="w-full h-8 border rounded-lg" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }} />
                        )}
                        {field.type === 'long_text' && (
                          <div className="w-full h-16 border rounded-lg" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }} />
                        )}
                        {['dropdown', 'radio', 'multi_checkbox'].includes(field.type) && (
                          <div className="flex flex-wrap gap-1.5">
                            {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
                              <span key={i} className="text-[9px] px-2 py-0.5 border rounded-md" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>{opt}</span>
                            ))}
                          </div>
                        )}
                        {field.type === 'divider' && (
                          <div className="py-1">
                            <div
                                style={{
                                  height: `${field.dividerThickness ?? 1}px`,
                                  width: '100%',
                                  backgroundColor: field.dividerColor || 'var(--color-border)',
                                  borderRadius: '9999px',
                                }}
                            />
                          </div>
                        )}
                        {field.type === 'vertical_divider' && (
                          <div className="flex justify-center items-stretch py-1 mx-auto" style={{ minHeight: '30px' }}>
                            <div
                                style={{
                                  width: `${field.dividerThickness ?? 2}px`,
                                  minHeight: '100%',
                                  height: field.dividerHeight ?? 40,
                                  backgroundColor: field.dividerColor || 'var(--color-border)',
                                  borderRadius: '9999px',
                                  alignSelf: 'stretch',
                                }}
                            />
                          </div>
                        )}
                        {field.type === 'section_header' && (
                          <p className="text-xs font-black" style={{ color: 'var(--color-text-primary)', textAlign: field.textAlign || 'left' }}>{field.label}</p>
                        )}
                        {field.type === 'cta_button' && (
                          field.ctaIsSocialGroup ? (
                            <div className="flex gap-2.5 flex-wrap justify-center w-full py-1">
                              {(field.ctaSocialLinks || []).map((link, i) => (
                                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0" style={{ backgroundColor: link.color || '#6366f1', color: '#fff' }}>
                                  🔗
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="w-full py-2.5 rounded-xl text-white text-xs font-black text-center"
                              style={{ background: field.ctaBgColor || 'var(--accent-gradient)' }}
                            >
                              {field.ctaLabel || field.label}
                            </div>
                          )
                        )}
                        {field.type === 'time_picker' && (
                          <div className="w-full h-8 border rounded-lg flex items-center px-2.5 gap-1.5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                            <span className="text-[10px] text-neutral-400">🕒 12:00 PM</span>
                          </div>
                        )}
                        {field.type === 'date_range' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="w-full h-8 border rounded-lg flex items-center px-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                              <span className="text-[9px] text-neutral-400">Start Date</span>
                            </div>
                            <div className="w-full h-8 border rounded-lg flex items-center px-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                              <span className="text-[9px] text-neutral-400">End Date</span>
                            </div>
                          </div>
                        )}
                        {field.type === 'address_autocomplete' && (
                          <div className="w-full h-8 border rounded-lg flex items-center px-2.5 gap-1.5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                            <span className="text-[10px] text-neutral-400">📍 Enter address...</span>
                          </div>
                        )}
                        {field.type === 'color_picker' && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg border bg-indigo-500" />
                            <span className="text-[10px] font-mono text-neutral-400">#6366F1</span>
                          </div>
                        )}
                        {field.type === 'signature_pad' && (
                          <div className="w-full h-12 border border-dashed rounded-lg flex items-center justify-center bg-neutral-50">
                            <span className="text-[9px] text-neutral-400 font-bold">🖌 SIGNATURE PAD PREVIEW</span>
                          </div>
                        )}
                        {field.type === 'otp_input' && (
                          <div className="flex gap-1.5">
                            {Array.from({ length: field.otpLength || 6 }).map((_, i) => (
                              <div key={i} className="w-6 h-7 border rounded flex items-center justify-center text-xs font-black bg-neutral-50 text-neutral-300">•</div>
                            ))}
                          </div>
                        )}
                        {field.type === 'hidden_field' && (
                          <div className="w-full border border-dashed p-1 text-center text-[9px] text-neutral-400 uppercase tracking-widest">[Hidden Input: {field.label}]</div>
                        )}
                        {field.type === 'calculation_field' && (
                          <div className="w-full border p-2 rounded-xl bg-neutral-50/50 flex justify-between items-center">
                            <span className="text-[9px] font-black tracking-wide text-neutral-400">🧮 FORMULA ESTIMATION</span>
                            <span className="text-xs font-mono font-bold text-indigo-500">$0.00</span>
                          </div>
                        )}
                        {field.type === 'matrix_grid' && (
                          <div className="border rounded-lg p-2 space-y-1 bg-white">
                            <div className="flex justify-between text-[8px] font-bold text-neutral-400 border-b pb-1">
                              <span>Matrix Item</span>
                              <div className="flex gap-2.5">
                                <span>Opt 1</span>
                                <span>Opt 2</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[8px] text-neutral-500">
                              <span>Row A</span>
                              <div className="flex gap-4">
                                <span className="opacity-40">⚪</span>
                                <span className="opacity-40">⚪</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {field.type === 'ranking_field' && (
                          <div className="space-y-1">
                            {(field.rankingItems || ['Item 1', 'Item 2']).slice(0, 2).map((item, i) => (
                              <div key={i} className="flex justify-between items-center p-1 border rounded bg-white text-[9px] text-neutral-600">
                                <span>{i + 1}. {item}</span>
                                <span>⇅</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {field.type === 'nps_score' && (
                          <div className="flex justify-between gap-1 overflow-x-auto py-1">
                            {Array.from({ length: 11 }).map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-bold text-neutral-400 bg-neutral-50 shrink-0">{i}</div>
                            ))}
                          </div>
                        )}
                        {field.type === 'country_selector' && (
                          <div className="w-full h-8 border rounded-lg flex items-center px-2.5 gap-1.5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                            <span className="text-[10px] text-neutral-400">🌐 Select country...</span>
                          </div>
                        )}
                        {field.type === 'terms_checkbox' && (
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                            <input type="checkbox" disabled className="w-3 h-3 rounded" />
                            <span>I agree to the Terms & Conditions</span>
                          </div>
                        )}
                        {field.type === 'accordion_section' && (
                          <div className="border rounded-lg divide-y bg-neutral-50/50">
                            <div className="p-1 px-2 flex justify-between text-[9px] font-bold"><span>Accordion Header</span><span>▼</span></div>
                          </div>
                        )}
                        {field.type === 'tab_container' && (
                          <div className="border rounded-lg bg-white overflow-hidden">
                            <div className="flex border-b bg-neutral-55 text-[8px] font-bold gap-2 p-1 px-2">
                              <span className="text-indigo-600 border-b border-indigo-600">Active Tab</span>
                              <span className="text-neutral-400">Tab 2</span>
                            </div>
                          </div>
                        )}
                        {field.type === 'repeating_section' && (
                          <div className="border rounded-lg p-2 bg-neutral-50/20 border-dashed space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-neutral-400"><span>Repeating List Template</span><span>+ Add</span></div>
                            <div className="h-6 border rounded bg-white" />
                          </div>
                        )}
                        {field.type === 'progress_bar' && (
                          <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden"><div className="h-full bg-indigo-500 w-1/3" /></div>
                        )}
                        {field.type === 'header_image_banner' && (
                          <div className="w-full h-12 rounded-lg bg-neutral-100 flex items-center justify-center border text-[9px] text-neutral-400">🖼 Wide Overlay Header Image</div>
                        )}
                        {field.type === 'video_embed' && (
                          <div className="w-full h-16 rounded-lg bg-neutral-900 flex items-center justify-center text-[10px] text-neutral-500">▶ Video Embed Block</div>
                        )}
                        {field.type === 'shape_framed_image' && (
                          <div className="w-10 h-10 rounded-full bg-neutral-100 border mx-auto flex items-center justify-center text-[8px] text-neutral-400">Image</div>
                        )}
                        {field.type === 'logo_mark' && (
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-indigo-300 mx-auto flex items-center justify-center text-[8px]">⭐</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div
                className="flex items-center justify-between px-5 py-4 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{templatePreviewModal.useCount} teams using this</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplatePreviewModal(null)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer transition hover:bg-neutral-100"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={templatePreviewModal.status !== 'active' || templateApplying === templatePreviewModal.id}
                    onClick={() => {
                      handleApplyTemplate(templatePreviewModal);
                      setTemplatePreviewModal(null);
                    }}
                    className="px-4 py-2 rounded-xl text-white text-xs font-black cursor-pointer transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {templatePreviewModal.status !== 'active' ? '⏳ Coming Soon' : 'Use This Template →'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {formBuilderFullscreen && (
        <div className="fixed inset-0 z-[100] flex flex-col font-sans" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {/* Top bar: close button + title + nested nav for Builder / My Forms */}
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-[var(--color-bg-card)]" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-500 animate-pulse" />
              <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Form Builder Workspace Overlay</h2>
            </div>
            <button
              onClick={() => setFormBuilderFullscreen(false)}
              className="p-1 px-3 rounded-lg text-xs font-bold font-mono border hover:bg-neutral-800/20 text-neutral-400 hover:text-neutral-200 transition cursor-pointer flex items-center gap-1.5"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
              aria-label="Close form builder"
            >
              <X className="w-4 h-4" />
              <span>Exit Workspace</span>
            </button>
          </div>
          {/* Full-height ServiceBuilderPanel */}
          <div className="flex-1 overflow-hidden h-full">
            <ServiceBuilderPanel
              programs={programs}
              onSave={handleSaveServiceFromBuilder}
              vertical={cfgVertical}
              initialProgramId={selectedBuilderProgramId}
              onDeleteForm={handleDeleteProgram}
              templateToApply={templateToApply}
              onTemplateApplied={() => setTemplateToApply(null)}
              isSuperAdmin={tenantProfile?.isSuperAdmin}
            />
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        featureKey={upgradeModalFeature}
        currentPlan={tenantProfile?.plan || 'Starter'}
        onUpgradeSuccess={() => loadData(true)}
        onNavigateToBilling={() => setActiveTab('billing')}
        authFetch={authFetch}
      />

    </motion.div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <MainApp />
        </CurrencyProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
