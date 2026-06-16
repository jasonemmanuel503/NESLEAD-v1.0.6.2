import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { useAppTheme, THEMES } from './ThemeContext';
import { VERTICAL_TEMPLATES, type IndustryVertical } from '../verticals';
import { Sparkles, MessageSquare, HelpCircle, X, Minus, ChevronRight, Calendar, User, Mail, Phone, Globe, ChevronDown, Send, UserCheck, Shield, AlertCircle, ArrowLeft, Star, Volume2, ShieldAlert, Clock, Video, Search, XCircle, Briefcase, Cpu, Stethoscope, TrendingUp, ShoppingCart, Home, GraduationCap, Scale, Users, Building, List } from 'lucide-react';
import { gsap } from 'gsap';
import { WidgetSkin, ThemeId } from '../types';
import { motion } from 'motion/react';

const playTriggerSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play a friendly dual-tone pleasant synth bubble pop/chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now + 0.04); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6
    
    gain2.gain.setValueAtTime(0.06, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now + 0.04);
    osc2.stop(now + 0.3);
  } catch (err) {
    console.warn("Audio trigger blocked or unsupported by browser context:", err);
  }
};

const INTERNATIONAL_COUNTRIES = [
  "Cameroon",
  "Nigeria",
  "Canada",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Belgium",
  "Switzerland",
  "Gabon",
  "Chad",
  "Congo (DRC)",
  "Congo (Republic)",
  "Central African Republic",
  "Equatorial Guinea",
  "Ivory Coast",
  "Senegal",
  "Ghana",
  "Kenya",
  "Rwanda",
  "South Africa",
  "Togo",
  "Benin",
  "Mali",
  "Guinea",
  "Niger",
  "Spain",
  "Italy",
  "Sweden",
  "Norway",
  "Netherlands",
  "India",
  "China",
  "Japan",
  "United Arab Emirates",
  "Saudi Arabia",
  "Other / International"
];

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'AGENT';
  content: string;
  confidence?: number;
  citationSource?: string;
  createdAt: string;
}

interface FloatingWidgetProps {
  disableExitIntent?: boolean;
  deployMode?: 'platform' | 'client';
  tenantPlan?: string;
}

export default function FloatingWidget({ disableExitIntent = false, deployMode: propDeployMode, tenantPlan }: FloatingWidgetProps = {}) {
  const { translate, activeLanguage } = useLanguage();
  const { activeTheme, isGlobalDarkMode } = useAppTheme();

  // Drag-and-drop state structures for repositioning (support desktop and Android drag capability)
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const isMoving = useRef(false);
  const dragStartLocation = useRef({ clientX: 0, clientY: 0, elementX: 0, elementY: 0 });

  const onDragStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const btn = e.currentTarget as HTMLButtonElement;

    dragStartLocation.current = {
      clientX,
      clientY,
      elementX: rect.left,
      elementY: rect.top,
    };
    isMoving.current = false;

    const onDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const moveY = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;
      const deltaX = moveX - dragStartLocation.current.clientX;
      const deltaY = moveY - dragStartLocation.current.clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isMoving.current = true;
      }

      if (isMoving.current) {
        if (moveEvent.cancelable) moveEvent.preventDefault();
        const newX = Math.max(10, Math.min(window.innerWidth - 64, dragStartLocation.current.elementX + deltaX));
        const newY = Math.max(10, Math.min(window.innerHeight - 64, dragStartLocation.current.elementY + deltaY));
        // Mutate DOM directly — NO setState here
        btn.style.left = `${newX}px`;
        btn.style.top = `${newY}px`;
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
        btn.style.transition = 'none';
        btn.style.transform = 'none';
      }
    };

    const onDragEnd = (upEvent: MouseEvent | TouchEvent) => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);

      if (isMoving.current) {
        // Only now commit to React state — a single re-render
        const newX = parseFloat(btn.style.left);
        const newY = parseFloat(btn.style.top);
        setCoords({ x: newX, y: newY });
      }
    };

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);
  };

  // Parse URL search parameters on load (FIX-005 & FIX-009)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key') || params.get('tenantKey') || params.get('tenantId');
    if (key) {
      localStorage.setItem('neslead_tenant_id', key);
      localStorage.setItem('neslead_tenant_key', key);
    }
    // Persist deploy mode: prop > URL param > default 'client'
    const modeFromUrl = params.get('mode') as 'platform' | 'client' | null;
    const resolvedMode = propDeployMode || modeFromUrl || 'client';
    localStorage.setItem('neslead_deploy_mode', resolvedMode);
  }, [propDeployMode]);

  // Launcher positioning toggle
  const [isOpen, setIsOpen] = useState(() => {
    return window.location.pathname === '/widget-embed';
  });
  const [isChatRendered, setIsChatRendered] = useState(() => {
    return window.location.pathname === '/widget-embed';
  });
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const cached = localStorage.getItem('neslead_session_id');
    if (cached) return cached;
    const fresh = `session_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('neslead_session_id', fresh);
    return fresh;
  });

  const handleStartNewChat = () => {
    localStorage.removeItem('neslead_session_id');
    localStorage.removeItem('neslead_selected_vertical');
    localStorage.removeItem('neslead_custom_industry');
    const fresh = `session_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('neslead_session_id', fresh);
    setSessionId(fresh);
    setChatMessages([]);
    setConversationClosed(false);
    setIsHandoffTriggered(false);
    setIsClosingSession(false);
    setIsConfirmingCloseSession(false);
    setInteractionRating(null);
    setSelectedVertical('');
    setTempVertical('');
    setCustomIndustry('');
    setShowCustomIndustryInput(false);
  };

  // Dynamic config loaded from Express server
  const [widgetConfig, setWidgetConfig] = useState({
    botName: 'AI Assistant',
    welcomeMessage: '',
    leadCaptureEnabled: true,
    bookingEnabled: true,
    humanHandoffEnabled: true,
    confidenceDisplayEnabled: true,
    whatsappEnabled: true,
    whatsappNumber: '+237 690 000 000',
    timeTriggerEnabled: true,
    timeTriggerDelay: 6, // fast pop in sandbox
    scrollTriggerEnabled: true,
    scrollTriggerPercent: 50,
    exitIntentEnabled: true,
    idleTriggerEnabled: true,
    position: 'right_bottom',
    launcherEmoji: '🤖',
    pulseEnabled: true,
    launcherLogoUrl: '',
    widgetSkin: 'solid' as WidgetSkin,
    botTheme: 'midnight' as ThemeId,
    _botAccent: '',
    _botGradient: '',
    _botLauncherGradient: '',
    _customBoxShadow: '',
    exitFormHeadline: '',
    exitFormBody: '',
    exitFormBtnLabel: '',
  });

  // Current interface panel: 'slides' | 'lead_form' | 'scheduler' | 'chat' | 'platform_survey' | 'services'
  const [activePanel, setActivePanel] = useState<'slides' | 'lead_form' | 'scheduler' | 'chat' | 'platform_survey' | 'services'>('slides');
  const [widgetPrograms, setWidgetPrograms] = useState<Array<{
    id: string; name: string; department: string; duration: string;
    fees: string; description: string; formSchema: any; published: boolean;
  }>>([]);
  const [leadSavedToast, setLeadSavedToast] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [verticalSearchQuery, setVerticalSearchQuery] = useState('');
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [isConfirmingCloseSession, setIsConfirmingCloseSession] = useState(false);

  // Survey state variables
  const [surveyStep, setSurveyStep] = useState<1 | 2>(1);
  const [surveyName, setSurveyName] = useState('');
  const [surveyEmail, setSurveyEmail] = useState('');
  const [surveyPhone, setSurveyPhone] = useState('');
  const [surveyVertical, setSurveyVertical] = useState('');
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  const SURVEY_VERTICALS = [
    { id: 'education',   icon: '🎓', label: 'Education',           sub: 'Schools, universities, training' },
    { id: 'law_firm',    icon: '⚖️', label: 'Law Firm',             sub: 'Legal intake & consultations' },
    { id: 'medical',     icon: '🏥', label: 'Medical / Clinic',     sub: 'Patient intake & appointments' },
    { id: 'real_estate', icon: '🏠', label: 'Real Estate',          sub: 'Property listings & viewings' },
    { id: 'immigration', icon: '✈️', label: 'Immigration',          sub: 'Visa pathways & case intake' },
    { id: 'recruitment', icon: '💼', label: 'Recruitment',          sub: 'Talent sourcing & screening' },
    { id: 'finance',     icon: '📈', label: 'Financial Advisory',   sub: 'Wealth planning & tax strategy' },
    { id: 'ecommerce',   icon: '🛒', label: 'E-commerce',           sub: 'Orders, products & support' },
    { id: 'saas',        icon: '⚙️', label: 'SaaS / Tech',          sub: 'Cloud products & integrations' },
    { id: 'general',     icon: '🏢', label: 'General Business',     sub: 'Any other business type' },
    { id: 'other',       icon: '🌟', label: 'Other',                sub: 'Any service-based business' },
  ];

  // Forms state variables
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCountry, setLeadCountry] = useState('Canada');
  const [leadCity, setLeadCity] = useState('');
  const [leadProgram, setLeadProgram] = useState('Executive MBA (EN/FR)');
  const [leadDate, setLeadDate] = useState('2026-09-01');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  // Vertical-aware lead form state
  const [selectedVertical, setSelectedVertical] = useState<string>(() => {
    return localStorage.getItem('neslead_selected_vertical') || '';
  });
  const [tempVertical, setTempVertical] = useState<string>(() => {
    return localStorage.getItem('neslead_selected_vertical') || '';
  });
  const [leadFormAnswers, setLeadFormAnswers] = useState<Record<string, string>>({});

  // Stores the visitor's free-typed industry description (for general/other vertical picks)
  const [customIndustry, setCustomIndustry] = useState<string>(() => {
    return localStorage.getItem('neslead_custom_industry') || '';
  });

  // Controls whether the free-text industry input is visible in the survey UI
  const [showCustomIndustryInput, setShowCustomIndustryInput] = useState<boolean>(false);

  // Helper for requests headers pairing with currently logged-in tenant (X-Tenant-Id)
  const getWidgetRequestHeaders = () => {
    const token = localStorage.getItem('neslead_widget_session_token');
    const tenantId = localStorage.getItem('neslead_tenant_id');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
      headers['X-Tenant-Key'] = tenantId;
    }
    return headers;
  };

  // Selector variables for calendar
  const [bookDate, setBookDate] = useState('2026-06-10');
  const [bookTime, setBookTime] = useState('14:30');
  const [bookType, setBookType] = useState<'VIDEO' | 'PHONE'>('VIDEO');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Conversation chat box variables
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [typedInput, setTypedInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHandoffTriggered, setIsHandoffTriggered] = useState(false);
  const [conversationClosed, setConversationClosed] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Triggers indicators states
  const [wasManuallyClosed, setWasManuallyClosed] = useState(() => {
    return sessionStorage.getItem('neslead_widget_dismissed') === 'true';
  });
  const [isLauncherTriggered, setIsLauncherTriggered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitModalSubmitted, setExitModalSubmitted] = useState(false);
  const [exitEmailInput, setExitEmailInput] = useState('');
  const [isIdle, setIsIdle] = useState(false);
  const [interactionRating, setInteractionRating] = useState<number | null>(null);

  // Scrolling check flags
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // Lead source labels — used consistently across all capture points
  const LEAD_SOURCES = {
    EXIT_INTENT: 'Exit Intent Popup',
    IDLE_TRIGGER: 'Idle Trigger',
    SCROLL_TRIGGER: 'Scroll Trigger',
    LEAD_FORM: 'Widget Interactive Form',
    AUTO_CLOSE: 'Widget Auto-Close',
    PLATFORM_SURVEY: 'Platform Survey',
  } as const;

  const [availablePrograms, setAvailablePrograms] = useState<string[]>([
    'Executive MBA (EN/FR)',
    'B.Sc. Software Engineering with Applied AI',
    'Master in Global Public Health',
    'Diploma in Hospitality & Tourism Excellence'
  ]);

  // Load custom backend widget parameters
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/widget/config', {
        headers: getWidgetRequestHeaders()
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.launcherEmoji === '🎓') {
          data.launcherEmoji = '🤖';
        }
        setWidgetConfig(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn("Express server config not yet active, relying on defaults.", err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/widget/programs', {
        headers: getWidgetRequestHeaders()
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const publishedData = data.filter((p: any) => p.published !== false);
          setWidgetPrograms(publishedData);
          if (publishedData.length > 0) {
            const names = publishedData.map((p: any) => p.name || p.title);
            setAvailablePrograms(names);
            setLeadProgram(names[0]);
          }
        }
      }
    } catch (err) {
      console.warn("Express server programs fetch not yet active, relying on defaults.", err);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (!sessionCreated) return;
    fetch('/api/widget/programs', { headers: getWidgetRequestHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => setWidgetPrograms((data || []).filter((p: any) => p.published !== false)))
      .catch(() => {});
  }, [sessionCreated]);

  // Listen to live brand customizer parameter updates in real-time
  useEffect(() => {
    const handleLiveConfig = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setWidgetConfig(prev => ({ ...prev, ...customEvent.detail }));
      }
    };
    window.addEventListener('neslead-widget-config-live', handleLiveConfig);
    return () => {
      window.removeEventListener('neslead-widget-config-live', handleLiveConfig);
    };
  }, []);

  // Parse custom drop shadow styling properties from customAccent JSON on configuration load
  useEffect(() => {
    const raw = widgetConfig.customAccent || '';
    if (raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.shadows) {
          const enabled = parsed.shadows.enabled !== false;
          if (!enabled) {
            setWidgetConfig(prev => ({ ...prev, _customBoxShadow: 'none' }));
          } else {
            const hexToRgbaLocal = (hex: string, opacity: number): string => {
              if (!hex || hex.length < 7) hex = '#000000';
              const rLocal = parseInt(hex.slice(1,3), 16) || 0;
              const gLocal = parseInt(hex.slice(3,5), 16) || 0;
              const bLocal = parseInt(hex.slice(5,7), 16) || 0;
              return `rgba(${rLocal}, ${gLocal}, ${bLocal}, ${(opacity/100).toFixed(2)})`;
            };
            const shadowStr = [
              `${parsed.shadows.x ?? 0}px ${parsed.shadows.y ?? 20}px ${parsed.shadows.blur ?? 60}px ${parsed.shadows.spread ?? 0}px ${hexToRgbaLocal(parsed.shadows.color ?? '#000000', parsed.shadows.opacity ?? 20)}`,
              parsed.shadows.layer2
                ? `${parsed.shadows.x2 ?? 0}px ${parsed.shadows.y2 ?? 8}px ${parsed.shadows.blur2 ?? 32}px ${parsed.shadows.spread2 ?? -4}px ${hexToRgbaLocal(parsed.shadows.color2 ?? '#6366F1', parsed.shadows.opacity2 ?? 25)}`
                : null
            ].filter(Boolean).join(', ');
            setWidgetConfig(prev => ({ ...prev, _customBoxShadow: shadowStr }));
          }
        }
      } catch (e) {
        // Not a valid JSON or parsing failed, ignore
      }
    }
  }, [widgetConfig.customAccent]);

  // Proactive trigger 1: Time-Delayed Tooltip Pop
  useEffect(() => {
    if (!isOpen && widgetConfig.timeTriggerEnabled && !wasManuallyClosed) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, widgetConfig.timeTriggerDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, widgetConfig.timeTriggerEnabled, widgetConfig.timeTriggerDelay, wasManuallyClosed]);

  // Proactive trigger 2: Scroll Depth Pop Launcher Check
  useEffect(() => {
    const handleScrollDetect = () => {
      if (isLauncherTriggered) return;
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercent = (scrollY / (totalHeight || 1)) * 100;

      // Trigger the floating bubble launcher when scrolled 120px down or reached the configured percentage
      if (scrollY > 120 || scrolledPercent >= (widgetConfig.scrollTriggerPercent || 20)) {
        setIsLauncherTriggered(true);
      }
    };

    // Check immediately in case we loaded scrolled down
    const initialScrollY = window.scrollY;
    const initialTotalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const initialScrolledPercent = (initialScrollY / (initialTotalHeight || 1)) * 100;

    if (initialScrollY > 120 || initialScrolledPercent >= (widgetConfig.scrollTriggerPercent || 20)) {
      setIsLauncherTriggered(true);
    } else {
      window.addEventListener('scroll', handleScrollDetect);
    }

    return () => window.removeEventListener('scroll', handleScrollDetect);
  }, [isLauncherTriggered, widgetConfig.scrollTriggerPercent]);

  // Ensure launcher is marked as triggered if chatbot window is forced open early
  useEffect(() => {
    if (isOpen && !isLauncherTriggered) {
      setIsLauncherTriggered(true);
    }
  }, [isOpen, isLauncherTriggered]);

  // Proactive trigger 2b: Automatically open chat panel on Scroll Depth if enabled
  useEffect(() => {
    const handleScrollAutoOpen = () => {
      if (isOpen || !widgetConfig.scrollTriggerEnabled || wasManuallyClosed) return;
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / (totalHeight || 1)) * 100;
      
      if (scrolled >= widgetConfig.scrollTriggerPercent) {
        handleOpenWidget();
        window.removeEventListener('scroll', handleScrollAutoOpen);
      }
    };
    window.addEventListener('scroll', handleScrollAutoOpen);
    return () => window.removeEventListener('scroll', handleScrollAutoOpen);
  }, [isOpen, widgetConfig.scrollTriggerEnabled, widgetConfig.scrollTriggerPercent, wasManuallyClosed]);

  // GSAP Bubble animation for the launcher button entry & idle floating
  useEffect(() => {
    if (isLauncherTriggered) {
      // Scale-up elastic bubble pop animation
      gsap.fromTo("#btn_floating_launcher",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" }
      );

      // Continuous gentle bobbing floating bubble animation
      const bobTimeline = gsap.to("#btn_floating_launcher", {
        y: "-=8",
        duration: 2.0,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      return () => {
        bobTimeline.kill();
      };
    }
  }, [isLauncherTriggered]);

  // GSAP bubble pop-up transition for the chatbot panel when opened
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo("#chat_window_card",
        { scale: 0.3, opacity: 0, transformOrigin: "bottom right" },
        { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen]);

  // Proactive trigger 3: Exit Intent Recovery Modal
  useEffect(() => {
    if (disableExitIntent || !widgetConfig.exitIntentEnabled || wasManuallyClosed) return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Prompt modal if cursor leaves standard top bound viewport (user closes or switches tab)
      if (e.clientY < 15 && !showExitModal && !exitModalSubmitted) {
        setShowExitModal(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [disableExitIntent, widgetConfig.exitIntentEnabled, showExitModal, exitModalSubmitted, wasManuallyClosed]);

  // Proactive trigger 4: Idle Pulsation Glow Aura
  useEffect(() => {
    const resetIdle = () => {
      setIsIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (widgetConfig.idleTriggerEnabled && !isOpen) {
          setIsIdle(true);
        }
      }, 10000); // 10 seconds of complete idle
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keypress', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keypress', resetIdle);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isOpen, widgetConfig.idleTriggerEnabled]);

  // SSE Connection for Real-Time Instant Messages
  useEffect(() => {
    if (!sessionCreated) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connectSSE() {
      const sseUrl = `/api/widget/sse?sessionId=${encodeURIComponent(sessionId)}`;
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          if (data.type === 'message' || data.type === 'new_message') {
            const msg = data.message;
            if (msg) {
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });

              if (!isOpen) {
                setHasUnread(true);
              }
            }
          } else if (data.type === 'agent_joined') {
            setIsHandoffTriggered(true);
            setChatMessages((prev) => {
              const systemMsg: Message = {
                id: `system-${Date.now()}`,
                role: 'SYSTEM' as any,
                content: data.message || "A live advisor has joined this conversation.",
                createdAt: new Date().toISOString()
              };
              return [...prev, systemMsg];
            });
          } else if (data.type === 'conversation_resolved') {
            setConversationClosed(true);
            setChatMessages((prev) => {
              const systemMsg: Message = {
                id: `system-${Date.now()}`,
                role: 'SYSTEM' as any,
                content: data.message || "This conversation has been closed by our team. Thank you for reaching out!",
                createdAt: new Date().toISOString()
              };
              return [...prev, systemMsg];
            });
          }
        } catch (err) {
          console.error("Error parsing widget SSE payload:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.log("Widget SSE connection status changed. Reconnecting...", err);
        if (eventSource) {
          eventSource.close();
        }
        reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    }

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [sessionCreated, sessionId, isOpen]);

  // Resolve deploy mode for this widget instance
  const deployMode = (propDeployMode || localStorage.getItem('neslead_deploy_mode') || 'client') as 'platform' | 'client';
  const isPlatformMode = deployMode === 'platform';

  const platformSlides = [
    {
      emoji: '🚀',
      title: 'Welcome to NesLead',
      desc: 'The AI chatbot platform built for service businesses. Convert more website visitors into booked consultations — automatically.'
    },
    {
      emoji: '🏢',
      title: 'Built for Your Industry',
      desc: 'Whether you run a law firm, clinic, consultancy, or agency — NesLead adapts to your vertical with purpose-built personas and intake flows.'
    },
    {
      emoji: '⚡',
      title: 'Live in Under 10 Minutes',
      desc: 'Paste one script tag on your site. NesLead scans your pages, builds a knowledge base, and starts converting visitors immediately.'
    }
  ];

  const clientSlides = [
    {
      emoji: '🤖',
      title: `${widgetConfig.botName || 'Smart AI'} — Powered by AI`,
      desc: 'Connect instantly with an intelligent AI assistant that understands your needs. Get answers, guidance, and next steps — 24/7.'
    },
    {
      emoji: '💬',
      title: 'Instant Responses, Any Time',
      desc: 'No wait times, no hold music. Our AI reviews our knowledge base and responds with accurate, relevant answers in seconds.'
    },
    {
      emoji: '📅',
      title: 'Book a Consultation',
      desc: 'Prefer speaking with a specialist? Schedule a free session directly from this chat — no back-and-forth emails needed.'
    }
  ];

  const slides = isPlatformMode ? platformSlides : clientSlides;

  // Auto scroll down in chatbox
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleOpenWidget = async () => {
    setIsChatRendered(true);
    setIsOpen(true);
    if (isPlatformMode) {
      setActivePanel('platform_survey');
      setSurveyStep(1);
      return;
    }
    setShowTooltip(false);
    setHasUnread(false);
    playTriggerSound();
    if (window.location.pathname === '/widget-embed') {
      window.parent.postMessage('neslead:open', '*');
    }

    // Initialize session with backend Express
    if (!sessionCreated) {
      try {
        const res = await fetch('/api/widget/session', {
          method: 'POST',
          headers: getWidgetRequestHeaders(),
          body: JSON.stringify({ sessionId })
        });
        if (res.ok) {
          const conv = await res.json();
          // Save session token so subsequent calls can authenticate
          if (conv.token) {
            localStorage.setItem('neslead_widget_session_token', conv.token);
          }
          setChatMessages(conv.messages || []);
          setSessionCreated(true);
        }
      } catch (err) {
        setSessionCreated(true); // fall back offline
      }
    }
  };

  const handleMinimizeWidget = () => {
    gsap.to("#chat_window_card", {
      scale: 0.3,
      opacity: 0,
      duration: 0.45,
      ease: "back.in(1.2)",
      transformOrigin: "bottom right",
      onComplete: () => {
        setIsOpen(false);
        setIsChatRendered(false);
      }
    });

    setWasManuallyClosed(true);
    if (window.location.pathname === '/widget-embed') {
      window.parent.postMessage('neslead:close', '*');
    }
  };

  const handleCloseWidget = async () => {
    const hasRealEmail = leadEmail && leadEmail.includes('@') && !leadEmail.includes('auto-delivered');
    if (hasRealEmail) {
      try {
        await fetch('/api/widget/lead', {
          method: 'POST',
          headers: getWidgetRequestHeaders(),
          body: JSON.stringify({
            sessionId,
            fullName: leadName || 'Anonymous',
            email: leadEmail,
            phone: leadPhone || '',
            country: leadCountry || '',
            city: leadCity || '',
            programInterest: Object.values(leadFormAnswers).join(' | ') || leadProgram || 'Not specified',
            serviceInterest: leadFormAnswers,
            startDate: leadDate || '',
            source: LEAD_SOURCES.AUTO_CLOSE
          })
        });
      } catch (err) {
        console.warn('[Auto-Close] Background lead save failed:', err);
      }
    }

    gsap.to("#chat_window_card", {
      scale: 0.3,
      opacity: 0,
      duration: 0.45,
      ease: "back.in(1.2)",
      transformOrigin: "bottom right",
      onComplete: () => {
        setIsOpen(false);
        setIsChatRendered(false);

        localStorage.removeItem('neslead_session_id');
        localStorage.removeItem('neslead_widget_session_token');

        setSessionCreated(false);
        setChatMessages([]);
        setLeadName('');
        setLeadEmail('');
        setLeadPhone('');
        setLeadCity('');
        setActivePanel('slides');
        setSlideIndex(0);
        setLeadCaptured(false);
        setBookingConfirmed(false);
        setConversationClosed(false);
        setIsHandoffTriggered(false);

        const fresh = `session_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem('neslead_session_id', fresh);
        setSessionId(fresh);
      }
    });

    setWasManuallyClosed(true);
    sessionStorage.setItem('neslead_widget_dismissed', 'true');
    if (window.location.pathname === '/widget-embed') {
      window.parent.postMessage('neslead:close', '*');
    }
  };

  const handleNextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      handleSkipSlides();
    }
  };



  const handleSurveyComplete = async (vertical: string) => {
    setSurveyVertical(vertical);
    setSelectedVertical(vertical);
    localStorage.setItem('neslead_selected_vertical', vertical);
    if (customIndustry.trim()) {
      localStorage.setItem('neslead_custom_industry', customIndustry.trim());
    }
    setSurveySubmitting(true);
    try {
      await fetch('/api/widget/lead', {
        method: 'POST',
        headers: getWidgetRequestHeaders(),
        body: JSON.stringify({
          sessionId,
          fullName: surveyName,
          email: surveyEmail,
          phone: surveyPhone,
          country: 'Unknown',
          city: '',
          programInterest: vertical,
          serviceInterest: { vertical, customIndustry: customIndustry.trim() || undefined },
          startDate: '',
          source: 'NesLead Homepage — Platform Demo',
          deployMode: 'platform'
        })
      });
    } catch (_) {}

    setSurveySubmitting(false);
    setActivePanel('chat');

    setTimeout(async () => {
      setIsTyping(true);
      try {
        const res = await fetch('/api/widget/chat', {
          method: 'POST',
          headers: getWidgetRequestHeaders(),
          body: JSON.stringify({
            sessionId,
            message: `__platform_open__ visitor_name:${surveyName} visitor_vertical:${vertical}${customIndustry.trim() ? ` visitor_industry:${customIndustry.trim().replace(/\s+/g, '_')}` : ''}`,
            deployMode: 'platform'
          })
        });
        if (res.ok) {
          const bodyObj = await res.json();
          setTimeout(() => {
            setIsTyping(false);
            if (bodyObj.message) setChatMessages(items => [...items, bodyObj.message]);
          }, 800);
        } else {
          setIsTyping(false);
        }
      } catch {
        setIsTyping(false);
      }
    }, 400);
  };

  const handleSkipSlides = () => {
    if (isPlatformMode) {
      setActivePanel('chat');
    } else if (widgetConfig.leadCaptureEnabled && !leadCaptured) {
      setActivePanel('lead_form');
    } else {
      setActivePanel('chat');
    }
  };

  const handleSubmitLeadForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setFormSubmitting(true);
    try {
      const res = await fetch('/api/widget/lead', {
        method: 'POST',
        headers: getWidgetRequestHeaders(),
        body: JSON.stringify({
          sessionId,
          fullName: leadName,
          email: leadEmail,
          phone: leadPhone,
          country: leadCountry,
          city: leadCity,
          programInterest: Object.values(leadFormAnswers).join(' | ') || leadProgram || 'Not specified',
          serviceInterest: leadFormAnswers,
          startDate: leadDate
        })
      });
      if (res.ok) {
        setLeadCaptured(true);
        setLeadSavedToast(true);
        setTimeout(() => {
          setLeadSavedToast(false);
        }, 4000);
        if (widgetConfig.bookingEnabled) {
          setActivePanel('scheduler');
        } else {
          setActivePanel('chat');
        }
      }
    } catch (err) {
      // offline fallback
      setLeadCaptured(true);
      setActivePanel('chat');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/widget/appointment', {
        method: 'POST',
        headers: getWidgetRequestHeaders(),
        body: JSON.stringify({
          sessionId,
          leadName,
          program: Object.values(leadFormAnswers).join(' | ') || leadProgram || 'Not specified',
          date: bookDate,
          time: bookTime,
          type: bookType
        })
      });
      if (res.ok) {
        setBookingConfirmed(true);
        setTimeout(() => {
          setActivePanel('chat');
        }, 3000);
      }
    } catch (err) {
      setBookingConfirmed(true);
      setTimeout(() => setActivePanel('chat'), 2000);
    }
  };

  const sendProgrammaticMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    fetch('/api/widget/chat', {
      method: 'POST',
      headers: { ...getWidgetRequestHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: text }),
    }).catch(() => {});
  }, [sessionId]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;

    const userText = typedInput;
    setTypedInput('');

    // Prepend user message visually immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString()
    };
    setChatMessages(items => [...items, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: getWidgetRequestHeaders(),
        body: JSON.stringify({
          sessionId,
          message: userText,
          selectedVertical: selectedVertical || widgetConfig.vertical,
          customIndustry: customIndustry.trim() || undefined,
          deployMode
        })
      });
      
      if (res.ok) {
        const bodyObj = await res.json();
        // Append response with nice typist staggered effect
        setTimeout(() => {
          setIsTyping(false);
          setChatMessages(items => [...items, bodyObj.message]);
        }, 1200);
      }
    } catch (err) {
      setTimeout(() => {
        setIsTyping(false);
        const fallbackAiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'ASSISTANT',
          content: "Sorry, our database endpoints are currently recalibrating training weights. Please speak with an active agent instead!",
          confidence: 70,
          citationSource: 'Offline Backup Router',
          createdAt: new Date().toISOString()
        };
        setChatMessages(items => [...items, fallbackAiMsg]);
      }, 1000);
    }
  };

  const handleTakeoverRescue = async () => {
    setIsHandoffTriggered(true);
    try {
      await fetch('/api/widget/takeover', { 
        method: 'POST', 
        headers: getWidgetRequestHeaders(),
        body: JSON.stringify({ sessionId })
      });
    } catch (err) {
      console.warn("Handoff trigger routed offline");
    }
  };

  const handleRatingSelect = (stars: number) => {
    setInteractionRating(stars);
  };

  const isLeft = widgetConfig.position === 'left_bottom';
  const posClass = isLeft ? 'left-6 md:left-8' : 'right-6 md:right-8';
  const openedPosClass = isLeft ? 'sm:left-6 sm:right-auto md:left-8' : 'sm:right-6 sm:left-auto md:right-8';

  const skin = (widgetConfig.widgetSkin || 'solid') as WidgetSkin;

  // Resolve bot-specific colors — independent of the dashboard :root CSS vars
  const botThemeId = (widgetConfig.botTheme || widgetConfig.theme || 'midnight') as ThemeId;
  const botThemeTokens = THEMES[botThemeId]?.tokens || THEMES.midnight.tokens;
  const isValidHex = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v);
  const botAccent = (widgetConfig.customAccent && isValidHex(widgetConfig.customAccent))
    ? widgetConfig.customAccent
    : (widgetConfig._botAccent || botThemeTokens.accent);
  const botGradient = widgetConfig._botGradient
    || (widgetConfig.customAccent && isValidHex(widgetConfig.customAccent)
      ? `linear-gradient(135deg, ${botAccent}, ${botAccent}cc)`
      : botThemeTokens.accent_gradient);
  const botLauncherGradient = widgetConfig._botLauncherGradient
    || (widgetConfig.customAccent && isValidHex(widgetConfig.customAccent)
      ? `linear-gradient(135deg, ${botAccent}, ${botAccent}cc)`
      : botThemeTokens.launcher_gradient);

  const hexToRgbStr = (hex: string): string => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '99,102,241';
  };

  // Helper to make launcher version of the shadow (halves coordinates, blur, and spread)
  const getSofterShadow = (shadowStr: string | undefined): string | undefined => {
    if (!shadowStr || shadowStr === 'none') return undefined;
    try {
      return shadowStr.replace(/(-?\d+px)\s+(-?\d+px)\s+(\d+)px\s+(-?\d+px)?/g, (match, x, y, blur, spread) => {
        const halfBlur = Math.round(parseInt(blur, 10) / 2);
        const halfX = Math.round(parseInt(x, 10) / 2);
        const halfY = Math.round(parseInt(y, 10) / 2);
        const spr = spread ? `${Math.round(parseInt(spread, 10) / 2)}px` : '';
        return `${halfX}px ${halfY}px ${halfBlur}px ${spr}`.trim();
      });
    } catch (e) {
      return shadowStr;
    }
  };

  // Compute CSS-in-JS overrides for the chat window based on active skin
  const skinWindowStyle = (): React.CSSProperties => {
    const customShadow = widgetConfig._customBoxShadow;
    const base = (() => {
      switch (skin) {
        case 'glass':
          return {
            background: isGlobalDarkMode ? 'rgba(15,15,30,0.55)' : 'rgba(255,255,255,0.58)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: isGlobalDarkMode
              ? '1.5px solid rgba(255,255,255,0.12)'
              : '1.5px solid rgba(255,255,255,0.82)',
            boxShadow: '0 24px 64px rgba(100,80,190,0.18), 0 1px 0 #fff inset',
            borderRadius: '1.625rem',
          };
        case 'dark':
          return {
            background: '#0A0A14',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            borderRadius: '1.5rem',
          };
        case 'soft':
          return {
            background: isGlobalDarkMode ? '#1f1a2e' : '#FFFDF9',
            border: `2px solid ${botAccent}33`,
            boxShadow: `0 12px 40px rgba(${hexToRgbStr(botAccent)},0.35), 0 2px 8px rgba(0,0,0,0.06)`,
            borderRadius: '2rem',
          };
        case 'minimal':
          return {
            background: isGlobalDarkMode ? '#111111' : '#FFFFFF',
            border: `1.5px solid var(--color-border)`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            borderRadius: '0.75rem',
          };
        case 'solid':
        default:
          return {
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            borderRadius: '1.5rem',
          };
      }
    })();
    if (customShadow !== undefined && customShadow !== 'none' && customShadow !== '') {
      base.boxShadow = customShadow;
    }
    return base;
  };

  const skinHeaderStyle = (): React.CSSProperties => {
    switch (skin) {
      case 'glass':
        return {
          background: isGlobalDarkMode
            ? `rgba(${hexToRgbStr(botAccent)},0.12)`
            : `rgba(${hexToRgbStr(botAccent)},0.10)`,
          borderBottom: `1px solid ${isGlobalDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.60)'}`,
          color: 'var(--color-text-primary)',
        };
      case 'dark':
        return {
          background: 'linear-gradient(135deg, #111827, #1e1b4b)',
          borderBottom: `2px solid ${botAccent}`,
          color: '#f1f5f9',
        };
      case 'soft':
        return {
          background: `${botAccent}1a`,
          borderBottom: `1.5px solid ${botAccent}22`,
          color: 'var(--color-text-primary)',
        };
      case 'minimal':
        return {
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        };
      case 'solid':
      default:
        return { background: botGradient, color: '#ffffff' };
    }
  };

  const skinBodyStyle = (): React.CSSProperties => {
    switch (skin) {
      case 'glass':
        return {
          background: isGlobalDarkMode ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        };
      case 'dark':
        return { background: '#0d0d1a' };
      case 'soft':
        return { background: isGlobalDarkMode ? '#261f3a' : '#FEFBF3' };
      case 'minimal':
        return { background: 'var(--color-bg-primary)' };
      default:
        return { backgroundColor: 'var(--color-bg-secondary)' };
    }
  };

  const skinLauncherStyle = (): React.CSSProperties => {
    const shadowVal = `rgba(${hexToRgbStr(botAccent)},0.35)`;
    switch (skin) {
      case 'glass':
        return {
          border: '2px solid rgba(255,255,255,0.85)',
          boxShadow: `0 6px 24px ${shadowVal}`,
        };
      case 'dark':
        return {
          boxShadow: `0 0 20px ${shadowVal}, 0 6px 24px rgba(0,0,0,0.6)`,
        };
      case 'soft':
        return {
          borderRadius: '28%',
          boxShadow: `0 8px 24px ${shadowVal}`,
        };
      case 'minimal':
        return {
          background: botAccent,
          borderRadius: '12px',
          boxShadow: `0 4px 16px ${shadowVal}`,
        };
      default:
        return {};
    }
  };

  // Tooltip position overrides for dynamic dragged coordinates
  const tooltipStyle: React.CSSProperties = {
    zIndex: 50,
  };
  if (coords) {
    const tooltipLeft = coords.x > window.innerWidth / 2
      ? Math.max(10, coords.x + 56 - 256)
      : Math.min(window.innerWidth - 256 - 10, coords.x);
    const tooltipBottom = window.innerHeight - coords.y + 12;
    tooltipStyle.bottom = `${tooltipBottom}px`;
    tooltipStyle.left = `${tooltipLeft}px`;
    tooltipStyle.right = 'auto';
    tooltipStyle.top = 'auto';
  }

  // Chat window position overrides for dynamic dragged coordinates
  const chatWindowStyle: React.CSSProperties = {
    zIndex: 2147483647,
    position: 'fixed',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-bg-card)',
  };

  if (coords) {
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      chatWindowStyle.bottom = 0;
      chatWindowStyle.left = 0;
      chatWindowStyle.right = 0;
      chatWindowStyle.height = '100vh';
      chatWindowStyle.maxHeight = '100vh';
      chatWindowStyle.borderRadius = '0px';
    } else {
      const chatLeft = coords.x > window.innerWidth / 2 
        ? Math.max(20, coords.x + 56 - 384) 
        : Math.min(window.innerWidth - 384 - 20, coords.x);
      
      const bottomOffset = window.innerHeight - coords.y + 16;
      chatWindowStyle.bottom = `${bottomOffset}px`;
      chatWindowStyle.left = `${chatLeft}px`;
      chatWindowStyle.right = 'auto';
      chatWindowStyle.top = 'auto';
      chatWindowStyle.maxHeight = `calc(100vh - ${bottomOffset + 40}px)`;
    }
  } else {
    chatWindowStyle.bottom = 'calc(90px + env(safe-area-inset-bottom, 0px))';
    chatWindowStyle.maxHeight = 'calc(100vh - 120px)';
  }

  return (
    <>
      {/* Dynamic Proactive trigger: Time-delayed Tooltip preview */}
      {showTooltip && (
        <div 
          className={`fixed ${coords ? '' : `bottom-22 ${posClass}`} bg-white border border-zinc-200 p-4 rounded-2xl shadow-xl w-64 animate-bounce z-50 flex flex-col gap-2.5`}
          style={tooltipStyle}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-[#FF5C3A] tracking-wider flex items-center gap-1" style={{ color: botAccent }}>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{widgetConfig.botName || 'AI Assistant'}</span>
            </span>
            <button onClick={() => {
              setShowTooltip(false);
              setWasManuallyClosed(true);
              sessionStorage.setItem('neslead_widget_dismissed', 'true');
            }} className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-700 leading-tight">
            {widgetConfig.welcomeMessage || `Hi! I'm ${widgetConfig.botName || 'your AI assistant'}. Click to chat!`}
          </p>
        </div>
      )}

      {/* Dynamic Proactive trigger: Exit Intent recovery modal overlay */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in text-[var(--color-text-primary)]">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <span className="absolute -top-12 -right-12 p-16 rounded-full bg-red-500/10 block pointer-events-none"></span>
            
            <button 
              onClick={() => {
                setShowExitModal(false);
                setWasManuallyClosed(true);
                sessionStorage.setItem('neslead_widget_dismissed', 'true');
              }}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 relative">
              <div className="inline-flex py-1 px-3.5 bg-red-500/10 border border-red-500/25 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 leading-none shrink-0 self-start">
                <ShieldAlert className="w-3.5 h-3.5" /> Stop! Wait a minute
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                {widgetConfig.exitFormHeadline || (isPlatformMode ? "Don't miss our launch special!" : "Don't miss out!")}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {widgetConfig.exitFormBody || (isPlatformMode ? 'Drop your business email to lock in a priority trial slot.' : 'Drop your email below for exclusive info and options.')}
              </p>
            </div>

            {!exitModalSubmitted ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!exitEmailInput || !exitEmailInput.includes('@')) return;

                  // Mark as submitted immediately for instant UI feedback
                  setExitModalSubmitted(true);

                  // Save to the backend as a real (partial) lead
                  try {
                    await fetch('/api/widget/lead', {
                      method: 'POST',
                      headers: getWidgetRequestHeaders(),
                      body: JSON.stringify({
                        sessionId,
                        fullName: 'Exit Intent Lead',
                        email: exitEmailInput,
                        phone: '',
                        country: '',
                        city: '',
                        programInterest: 'Not specified',
                        source: LEAD_SOURCES.EXIT_INTENT,
                        geo: {
                          device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                          browser: navigator.userAgent.split(' ').pop() || 'Unknown',
                          country: '',
                          city: '',
                          ip_address: ''
                        }
                      })
                    });
                  } catch (err) {
                    // Silent fail — the UI already showed success. The user experience is not affected.
                    console.warn('[Exit Intent] Lead save failed silently:', err);
                  }
                }} 
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  value={exitEmailInput}
                  onChange={(e) => setExitEmailInput(e.target.value)}
                  placeholder="Enter your business email..."
                  className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white text-xs font-bold font-mono transition shadow-lg cursor-pointer"
                  style={{ background: botGradient }}
                >
                  {widgetConfig.exitFormBtnLabel || (isPlatformMode ? "Secure My Priority Trial Slot" : "Secure My Priority Contact Slot")}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 text-emerald-500 text-xs text-center font-semibold">
                ✓ Priority slot secured! Check your inbox for confirmation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main floating launcher bubble widget */}
      {!isOpen && (
        <button
          onClick={(e) => {
            if (isMoving.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            handleOpenWidget();
          }}
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          id="btn_floating_launcher"
          className={`fixed ${coords ? '' : posClass} w-14 h-14 rounded-full text-white shadow-2xl border transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-grab active:cursor-grabbing relative ${isIdle && (widgetConfig.pulseEnabled !== false) ? 'ring-8 animate-pulse' : ''}`}
          style={{ 
            willChange: 'transform',
            touchAction: 'none',
            zIndex: 2147483647,
            position: 'fixed',
            background: botLauncherGradient, 
            boxShadow: getSofterShadow(widgetConfig._customBoxShadow) || `0 8px 24px rgba(${hexToRgbStr(botAccent)},0.35)`,
            borderColor: 'rgba(255,255,255,0.2)',
            ringColor: `rgba(${hexToRgbStr(botAccent)},0.35)`,
            maxWidth: 'calc(100vw - 48px)',
            cursor: 'grab',
            opacity: isLauncherTriggered ? 1 : 0,
            transform: !isLauncherTriggered ? 'scale(0)' : undefined,
            pointerEvents: isLauncherTriggered ? 'auto' : 'none',
            ...skinLauncherStyle(),
            ...(coords ? {
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              right: 'auto',
              bottom: 'auto',
              transition: 'none',
              transform: 'none',
            } : {
              bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            })
          }}
          title="Open Admissions Assistant"
        >
          {hasUnread && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white animate-pulse z-[2147483647]" />
          )}
          {widgetConfig.launcherLogoUrl ? (
            <img src={widgetConfig.launcherLogoUrl} alt="Logo" className="w-9 h-9 object-cover rounded-full shadow-inner" referrerPolicy="no-referrer" />
          ) : widgetConfig.launcherEmoji ? (
            <span className="text-xl inline-block leading-none select-none font-sans" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{widgetConfig.launcherEmoji}</span>
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Chat Window Panel */}
      {isChatRendered && (
        <div 
          id="chat_window_card" 
          className={`fixed bottom-0 right-0 left-0 w-full h-[100dvh] sm:right-auto sm:left-auto ${openedPosClass} sm:w-full sm:max-w-sm sm:h-[520px] sm:rounded-3xl shadow-2xl border overflow-hidden flex flex-col text-[var(--color-text-primary)]`} 
          style={{ ...chatWindowStyle, ...skinWindowStyle() }}
          data-skin={skin}
        >
          {/* Active Banner Header */}
          <div className="px-5 py-4 flex items-center justify-between shadow" style={skinHeaderStyle()}>
            <div className="flex items-center gap-2.5">
              {widgetConfig.launcherLogoUrl ? (
                <div className="w-10 h-10 rounded-full bg-white border border-white/20 overflow-hidden shadow flex items-center justify-center shrink-0">
                  <img src={widgetConfig.launcherLogoUrl} alt="Academy Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow animate-pulse"
                  style={{ color: skin === 'dark' ? '#f1f5f9' : (skin === 'glass' || skin === 'soft' || skin === 'minimal') ? 'var(--color-text-primary)' : '#ffffff' }}
                >
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm tracking-tight" style={{ color: skin === 'dark' ? '#f1f5f9' : (skin === 'glass' || skin === 'soft' || skin === 'minimal') ? 'var(--color-text-primary)' : '#ffffff' }}>{widgetConfig.botName}</h4>
                <div className="flex items-center gap-1 text-[10px] opacity-85 font-semibold" style={{ color: skin === 'dark' ? '#f1f5f9' : (skin === 'glass' || skin === 'soft' || skin === 'minimal') ? 'var(--color-text-secondary)' : '#ffffff' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>AI System Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={handleMinimizeWidget}
                className="hover:text-stone-200 p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                style={{ color: skin === 'dark' ? '#f1f5f9' : (skin === 'glass' || skin === 'soft' || skin === 'minimal') ? 'var(--color-text-primary)' : '#ffffff' }}
                title="Minimize (Keep Session)"
                id="btn_widget_minimize"
              >
                <Minus className="w-4.5 h-4.5" />
              </button>
              
              {/* CLOSE BUTTON */}
              <button 
                onClick={handleCloseWidget}
                className="hover:text-stone-200 p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                style={{ color: skin === 'dark' ? '#f1f5f9' : (skin === 'glass' || skin === 'soft' || skin === 'minimal') ? 'var(--color-text-primary)' : '#ffffff' }}
                title="Close & Submit Data (Start Fresh)"
                id="btn_widget_close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* ACTIVE VIEWS SWITCH */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ ...skinBodyStyle() }}>
            
            {/* PANEL 1: Onboarding Carousel slides */}
            {activePanel === 'slides' && (
              <div className="flex-1 p-6 flex flex-col justify-between items-center text-center animate-fade-in bg-[var(--color-bg-card)] h-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="space-y-4 pt-10 flex flex-col items-center">
                  <span className="text-5xl block animate-bounce">{slides[slideIndex].emoji}</span>
                  <div className="space-y-1.5">
                    <h5 className="font-extrabold text-sm text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{slides[slideIndex].title}</h5>
                    <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">{slides[slideIndex].desc}</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, sIdx) => (
                    <span 
                      key={sIdx} 
                      className={`h-1.5 rounded-full transition-all ${slideIndex === sIdx ? 'w-4.5 bg-accent' : 'w-1.5 bg-zinc-200'}`}
                      style={slideIndex === sIdx ? { backgroundColor: botAccent } : undefined}
                    ></span>
                  ))}
                </div>

                <div className="flex justify-between items-center w-full border-t border-zinc-100 pt-4 mt-6">
                  <button 
                    onClick={handleSkipSlides}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                  >
                    Skip Onboarding
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-0.5 transition cursor-pointer"
                    style={{ background: botGradient }}
                  >
                    <span>{slideIndex === slides.length - 1 ? 'Get Started' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PANEL: Platform Onboarding Survey Gate */}
            {activePanel === 'platform_survey' && (
              <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-primary)' }}>

                {/* Progress bar */}
                <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                  <div className="flex gap-1.5 flex-1 max-w-[120px]">
                    <div
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: surveyStep === 1 ? botAccent : 'var(--color-border)' }}
                    />
                    <div
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: surveyStep === 2 ? botAccent : 'var(--color-border)' }}
                    />
                  </div>
                  <span className="text-[10px] ml-auto font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Step {surveyStep} of 2
                  </span>
                </div>

                {/* ── STEP 1: Identity gate ── */}
                {surveyStep === 1 && (
                  <div className="flex flex-col flex-1 px-5 pb-5 overflow-y-auto">
                    <div className="mb-4 mt-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: 'var(--color-accent)' }}>
                        Free AI Demo
                      </p>
                      <h2 className="text-[16px] font-extrabold leading-snug mb-1"
                        style={{ color: 'var(--color-text-primary)' }}>
                        Let's build your custom demo
                      </h2>
                      <p className="text-[11px] leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}>
                        Drop your details below and we'll instantly send your personalised AI setup summary to your inbox — no fluff, just the exact lead capture flows built for your business.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Full name */}
                      <div>
                        <label className="text-[11px] font-medium block mb-1"
                          style={{ color: 'var(--color-text-secondary)' }}>
                          Full name <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Mitchell"
                          value={surveyName}
                          onChange={e => setSurveyName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-[12px] border outline-none transition-all focus:ring-1 focus:ring-[var(--color-accent)]"
                          style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        />
                      </div>

                      {/* Work email */}
                      <div>
                        <label className="text-[11px] font-medium block mb-1"
                          style={{ color: 'var(--color-text-secondary)' }}>
                          Work email <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="you@company.com"
                          value={surveyEmail}
                          onChange={e => setSurveyEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-[12px] border outline-none transition-all focus:ring-1 focus:ring-[var(--color-accent)]"
                          style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        />
                      </div>

                      {/* Phone (optional) */}
                      <div>
                        <label className="text-[11px] font-medium block mb-1"
                          style={{ color: 'var(--color-text-secondary)' }}>
                          Phone{' '}
                          <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                            (optional — for priority demo callback)
                          </span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 555 000 0000"
                          value={surveyPhone}
                          onChange={e => setSurveyPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-[12px] border outline-none transition-all focus:ring-1 focus:ring-[var(--color-accent)]"
                          style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Continue button — disabled until name + email have at least 1 character */}
                    <button
                      onClick={() => {
                        if (surveyName.trim() && surveyEmail.trim()) setSurveyStep(2);
                      }}
                      disabled={!surveyName.trim() || !surveyEmail.trim()}
                      className="mt-5 w-full py-2.5 rounded-xl text-[12px] font-extrabold transition-all flex items-center justify-center gap-2"
                      style={{
                        background: (!surveyName.trim() || !surveyEmail.trim())
                          ? 'var(--color-border)'
                          : 'var(--color-accent)',
                        color: (!surveyName.trim() || !surveyEmail.trim())
                          ? 'var(--color-text-secondary)'
                          : '#fff',
                        cursor: (!surveyName.trim() || !surveyEmail.trim()) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Continue →
                    </button>
                  </div>
                )}

                {/* ── STEP 2: Vertical selection ── */}
                {surveyStep === 2 && (
                  <div className="flex flex-col flex-1 px-5 pb-5 overflow-y-auto">
                    <div className="mb-3 mt-1">
                      <button
                        onClick={() => setSurveyStep(1)}
                        className="text-[11.5px] font-bold mb-2 flex items-center gap-1 cursor-pointer hover:underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        ← Back
                      </button>
                      <h2 className="text-[16px] font-extrabold leading-snug mb-0.5"
                        style={{ color: 'var(--color-text-primary)' }}>
                        What best describes your business?
                      </h2>
                      <p className="text-[11.5px]" style={{ color: 'var(--color-text-secondary)' }}>
                        We'll load the exact AI intake flows and conversion triggers built for your industry.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {SURVEY_VERTICALS.map(v => {
                        const isSelected = surveyVertical === v.id || tempVertical === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => {
                              if (surveySubmitting) return;
                              if (v.id === 'general' || v.id === 'other') {
                                setTempVertical(v.id);
                                setShowCustomIndustryInput(true);
                              } else {
                                setShowCustomIndustryInput(false);
                                setTempVertical(v.id);
                                handleSurveyComplete(v.id);
                              }
                            }}
                            disabled={surveySubmitting}
                            className="flex flex-col items-start p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            style={{
                              background: isSelected
                                ? 'var(--color-accent)'
                                : 'var(--color-bg-secondary)',
                              border: isSelected
                                ? '1.5px solid var(--color-accent)'
                                : '1px solid var(--color-border)',
                              color: isSelected ? '#fff' : 'var(--color-text-primary)',
                              opacity: surveySubmitting ? 0.6 : 1
                            }}
                          >
                            <span className="text-base mb-0.5">{v.icon}</span>
                            <span className="text-[10.5px] font-bold leading-tight truncate w-full">{v.label}</span>
                            <span className="text-[9.5px] leading-tight mt-0.5"
                              style={{
                                color: isSelected
                                  ? 'rgba(255,255,255,0.75)'
                                  : 'var(--color-text-secondary)'
                              }}>
                              {v.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Free-text industry input — shown when visitor picks General Business or Other */}
                    {showCustomIndustryInput && (
                      <div className="mt-4 space-y-3 animate-fadeIn">
                        {/* Divider */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                          <span className="text-[10px] font-bold px-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Tell us a bit more
                          </span>
                          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                        </div>

                        {/* Input field */}
                        <div className="space-y-1.5">
                          <label
                            className="text-[11px] font-bold block"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            What type of business do you run?
                          </label>
                          <input
                            type="text"
                            value={customIndustry}
                            onChange={(e) => setCustomIndustry(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customIndustry.trim() && !surveySubmitting) {
                                handleSurveyComplete(tempVertical);
                              }
                            }}
                            placeholder="e.g. HVAC contractor, photography studio, IP law firm..."
                            maxLength={80}
                            className="w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              color: 'var(--color-text-primary)',
                              borderColor: 'var(--color-border)',
                            }}
                            autoFocus
                          />
                          <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>
                            This helps us tailor the conversation to your industry. Max 80 characters.
                          </p>
                        </div>

                        {/* Proceed button */}
                        <button
                          type="button"
                          onClick={() => handleSurveyComplete(tempVertical)}
                          disabled={!customIndustry.trim() || surveySubmitting}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                          style={{ background: botGradient }}
                        >
                          {surveySubmitting ? 'Starting...' : 'Start Conversation →'}
                        </button>

                        {/* Back link */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomIndustryInput(false);
                            setCustomIndustry('');
                            setTempVertical('');
                          }}
                          className="w-full text-[10px] font-medium text-center bg-transparent border-none cursor-pointer py-1"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          ← Back to industry selection
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* PANEL 2: Interactive Leads Form */}
            {activePanel === 'lead_form' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-fade-in bg-[var(--color-bg-card)]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="space-y-1 text-center">
                  <h4 className="text-xs font-extrabold text-[#FF5C3A] uppercase tracking-wider" style={{ color: botAccent }}>{translate('collectLeadTitle')}</h4>
                  <p className="text-[11px] text-neutral-400 leading-normal max-w-xs mx-auto">{translate('collectLeadDesc')}</p>
                </div>

                <form onSubmit={handleSubmitLeadForm} className="space-y-3.5 pt-2">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={translate('fullNameField')}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder={translate('emailField')}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-450" />
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder={translate('phoneField')}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                    />
                  </div>

                  {/* Dynamic vertical-aware lead form fields */}
                  {(() => {
                    const currentVertical = (widgetConfig as any).vertical || 'education';
                    const verticalTemplate = VERTICAL_TEMPLATES[currentVertical as IndustryVertical] || VERTICAL_TEMPLATES['education'];
                    const questions = verticalTemplate?.leadFormQuestions || [];

                    return (
                      <div className="space-y-2.5">
                        {/* Country selector always shown */}
                        <select
                          value={leadCountry}
                          onChange={(e) => setLeadCountry(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-2 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none cursor-pointer"
                        >
                          {INTERNATIONAL_COUNTRIES.map((cty) => (
                            <option key={cty} value={cty} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>
                              {cty}
                            </option>
                          ))}
                        </select>

                        {/* Vertical-specific dynamic questions */}
                        {questions.map((q) => {
                          if (q.type === 'select') {
                            return (
                              <select
                                key={q.id}
                                value={leadFormAnswers[q.id] || ''}
                                onChange={(e) => setLeadFormAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                required={q.required !== false}
                                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-2 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none cursor-pointer"
                              >
                                <option value="" disabled style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>
                                  {q.label}...
                                </option>
                                {(q.options || []).map((opt) => (
                                  <option key={opt} value={opt} style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            );
                          }

                          if (q.type === 'text' || q.type === 'tel') {
                            return (
                              <input
                                key={q.id}
                                type={q.type}
                                value={leadFormAnswers[q.id] || ''}
                                onChange={(e) => setLeadFormAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                required={q.required !== false}
                                placeholder={q.label}
                                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl px-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] focus:outline-none"
                              />
                            );
                          }

                          return null;
                        })}
                      </div>
                    );
                  })()}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold font-mono transition shadow-lg cursor-pointer"
                    style={{ background: botGradient }}
                  >
                    {formSubmitting ? translate('sending') : translate('submitField')}
                  </button>
                </form>
              </div>
            )}

            {/* PANEL 3: Advising Scheduling scheduler */}
            {activePanel === 'scheduler' && (
              <div className="flex-1 p-5 space-y-4 animate-fade-in bg-[var(--color-bg-card)] overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-black uppercase text-[#FF5C3A]" style={{ color: botAccent }}>{translate('bookCallTitle')}</span>
                  <h5 className="font-extrabold text-xs text-[var(--color-text-primary)]">{translate('bookCallDesc')}</h5>
                </div>

                {!bookingConfirmed ? (
                  <form onSubmit={handleBookAppointment} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Date Selector</label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="date"
                          required
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Appointment Time</label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          <input
                            type="time"
                            required
                            value={bookTime}
                            onChange={(e) => setBookTime(e.target.value)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-[var(--color-bg-primary)] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Channel Type</label>
                        <div className="relative">
                          {bookType === 'VIDEO' ? (
                            <Video className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          ) : (
                            <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          )}
                          <select
                            value={bookType}
                            onChange={(e) => setBookType(e.target.value as any)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl pl-9 pr-2 py-2 text-xs focus:bg-[var(--color-bg-primary)] outline-none cursor-pointer"
                          >
                            <option value="VIDEO" className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Video Call</option>
                            <option value="PHONE" className="bg-neutral-850 text-neutral-900" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>Phone Interview</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs pt-2">
                      <button
                        type="button"
                        onClick={() => setActivePanel('chat')}
                        className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl hover:bg-[var(--color-bg-secondary)] transition cursor-pointer"
                      >
                        Skip
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 text-white rounded-xl font-bold transition shadow"
                        style={{ background: botGradient }}
                      >
                        {translate('confirmBooking')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold p-4 rounded-2xl text-center flex flex-col items-center gap-1.5">
                    <UserCheck className="w-8 h-8 text-emerald-500 animate-bounce" />
                    <span>{translate('bookSuccessMessage')}</span>
                  </div>
                )}
              </div>
            )}

            {/* PANEL 3.5: Services View */}
            {activePanel === 'services' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  Our Services
                </h3>
                {widgetPrograms.map((prog) => (
                  <motion.div
                    key={prog.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-2xl p-4 space-y-2"
                    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{prog.department}</span>
                    <h4 className="text-sm font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{prog.name}</h4>
                    <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{prog.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black font-mono" style={{ color: 'var(--color-accent)' }}>{prog.fees}</span>
                      <button
                        onClick={() => {
                          setActivePanel('chat');
                          setTimeout(() => sendProgrammaticMessage(`I'm interested in: ${prog.name}`), 200);
                        }}
                        className="px-3 py-1 rounded-lg text-[10px] font-bold text-white cursor-pointer transition hover:scale-[1.02]"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        Enquire →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* PANEL 4: Chat box conversations */}
            {activePanel === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden h-full relative">
                {leadSavedToast && (
                  <div className="absolute top-2 left-2 right-2 bg-emerald-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-fade-in">
                    <UserCheck className="w-4 h-4 text-white shrink-0" />
                    <span className="flex-1">Your details have been saved. A team member will be in touch shortly.</span>
                  </div>
                )}
                
                {isPlatformMode && !selectedVertical && (() => {
                  const verticalsList = Object.values(VERTICAL_TEMPLATES);
                  const filteredVerticals = verticalsList.filter(v => 
                    v.label.toLowerCase().includes(verticalSearchQuery.toLowerCase()) ||
                    v.id.toLowerCase().includes(verticalSearchQuery.toLowerCase())
                  );
                  return (
                    <div className="absolute inset-0 bg-white dark:bg-stone-950 z-30 flex flex-col justify-between overflow-hidden p-5 animate-fade-in">
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="space-y-1.5 text-center pb-3">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF5C3A] mb-1">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <h4 className="text-xs font-black text-[#FF5C3A] uppercase tracking-widest">
                            Configure Your Bot
                          </h4>
                          <p className="text-sm font-black text-[var(--color-text-primary)]">
                            What type of business do you run?
                          </p>
                          <p className="text-[10px] text-neutral-450 leading-normal max-w-xs mx-auto">
                            Choose your industry vertical to load targeted conversion triggers and intake assistant flows.
                          </p>
                        </div>

                        {/* Search Input Filter */}
                        <div className="relative mb-3 shrink-0">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-450 pointer-events-none" />
                          <input
                            type="text"
                            value={verticalSearchQuery}
                            onChange={(e) => setVerticalSearchQuery(e.target.value)}
                            placeholder="Type to filter industries (e.g. law, clinic)..."
                            className="w-full bg-zinc-50 dark:bg-stone-900 border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white dark:focus:bg-stone-950 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                          />
                        </div>

                        {/* Verticals Scrollable Grid */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[220px]">
                          {filteredVerticals.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {filteredVerticals.map((v) => {
                                let IconComponent = Briefcase;
                                if (v.id === 'education') IconComponent = GraduationCap;
                                if (v.id === 'legal-services') IconComponent = Scale;
                                if (v.id === 'healthcare') IconComponent = Stethoscope;
                                if (v.id === 'real-estate') IconComponent = Home;
                                if (v.id === 'hr-staffing') IconComponent = Users;
                                if (v.id === 'financial-services') IconComponent = TrendingUp;
                                if (v.id === 'retail-ecommerce') IconComponent = ShoppingCart;
                                if (v.id === 'technology') IconComponent = Cpu;
                                if (v.id === 'professional-services') IconComponent = Building;

                                const isChosenTemp = tempVertical === v.id;

                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => setTempVertical(v.id)}
                                    className={`p-2.5 rounded-xl border transition text-left flex flex-col justify-between gap-1 group cursor-pointer ${
                                      isChosenTemp
                                        ? 'border-[#FF5C3A] bg-orange-50/50 dark:bg-orange-950/10'
                                        : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-primary)]'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full pt-1">
                                      <IconComponent className={`w-4 h-4 transition-colors ${isChosenTemp ? 'text-[#FF5C3A]' : 'text-neutral-450 group-hover:text-[var(--color-accent)]'}`} />
                                      {isChosenTemp && (
                                        <span className="w-2 h-2 rounded-full bg-[#FF5C3A]"></span>
                                      )}
                                    </div>
                                    <div className="mt-1">
                                      <div className="text-[11px] font-black text-[var(--color-text-primary)] truncate">
                                        {v.label}
                                      </div>
                                      <div className="text-[9px] text-neutral-400 line-clamp-1 leading-normal">
                                        {v.serviceLabel || 'Support Desk'}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-xs text-neutral-400">
                              No matching industries found.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t border-zinc-100 dark:border-stone-850 pt-3 flex flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={!tempVertical}
                          onClick={() => handleSurveyComplete(tempVertical)}
                          className="w-full py-2.5 rounded-xl text-white font-extrabold text-xs transition duration-250 shadow-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            background: tempVertical ? botGradient : 'var(--color-border)',
                          }}
                        >
                          Start Custom Assistant <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="flex justify-between items-center text-[10px] text-neutral-400">
                          <span>Platform Sandbox Onboarding</span>
                          <button
                            type="button"
                            onClick={() => {
                              setTempVertical('other');
                              handleSurveyComplete('other');
                            }}
                            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-stone-300 underline cursor-pointer"
                          >
                            Skip to General
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Chat Panel Top Bar with End/Close Session option */}
                <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
                    <span className="text-emerald-600 dark:text-emerald-400">Intelligent Helper</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCloseSession(true)}
                    className="text-[11px] font-extrabold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition py-0.5 px-2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <XCircle className="w-3.5 h-3.5" /> End Session
                  </button>
                </div>

                {/* Confirmation Backdrop Modal */}
                {isConfirmingCloseSession && (
                  <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-5 z-20 animate-fade-in">
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xl max-w-[85%] text-center space-y-4 animate-scale-in">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-xs text-[var(--color-text-primary)]">End Chat Session?</h5>
                        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                          Are you sure you want to close this chat? Your automated intake assistant flow will be completed.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsConfirmingCloseSession(false)}
                          className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsConfirmingCloseSession(false);
                            setIsClosingSession(true); // confirms! Shows satisfaction rating stars now
                          }}
                          className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-lg shadow-rose-600/10 cursor-pointer"
                        >
                          Yes, End
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scroll messages panel */}
                <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
                  
                  {/* System Initial Greeting message with Bot Avatar & Custom Background */}
                  {!isPlatformMode && (
                    <div className="flex justify-start gap-2.5 items-end animate-bubble-up">
                      {/* Bot Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-605 border border-zinc-200/20 shadow flex items-center justify-center shrink-0 overflow-hidden">
                        {widgetConfig.launcherLogoUrl ? (
                          <img src={widgetConfig.launcherLogoUrl} alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {/* Bot Bubble: subtle light gradient */}
                      <div className="bg-zinc-100 dark:bg-stone-900 border border-[var(--color-border)] text-[var(--color-text-primary)] p-3 rounded-2xl rounded-bl-none max-w-[80%] leading-relaxed shadow-sm">
                        {widgetConfig.welcomeMessage || `Hello! I'm ${widgetConfig.botName || 'your AI assistant'}. How can I help you today?`}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg) => {
                    const isSystem = (msg.role as string) === 'SYSTEM';
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2 animate-bubble-up w-full">
                          <div className="bg-zinc-100 border border-zinc-200 text-neutral-600 px-4 py-2 rounded-2xl text-center text-[11px] font-medium leading-normal shadow-sm max-w-[90%] text-wrap dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-300">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }

                    const isUser = msg.role === 'USER';
                    
                    return (
                      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5 items-end animate-bubble-up`}>
                        {/* Bot Avatar (left alignment) for chatbot or live agent responses */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-605 border border-zinc-200/20 shadow flex items-center justify-center shrink-0 overflow-hidden">
                            {widgetConfig.launcherLogoUrl ? (
                              <img src={widgetConfig.launcherLogoUrl} alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-white" />
                            )}
                          </div>
                        )}

                        {/* Speech Bubble */}
                        <div 
                          className={`p-3 rounded-2xl max-w-[80%] leading-relaxed shadow-sm ${
                            isUser 
                              ? 'text-white rounded-br-none bg-indigo-650 dark:bg-indigo-500 font-medium shadow-sm border border-indigo-750/15 tracking-normal' 
                              : 'bg-zinc-100 dark:bg-stone-900 border rounded-bl-none border-[var(--color-border)] text-[var(--color-text-primary)] font-normal'
                          }`}
                        >
                          {msg.role === 'AGENT' && (
                            <span className="block text-[9px] uppercase font-bold text-accent mb-0.5 tracking-wider" style={{ color: botAccent }}>
                              Live Advisor
                            </span>
                          )}
                          <p className="text-xs whitespace-pre-line leading-relaxed">{msg.content}</p>
                        </div>

                        {/* User Avatar (right alignment) */}
                        {isUser && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-650 to-slate-750 border border-zinc-500/20 shadow flex items-center justify-center shrink-0 overflow-hidden text-neutral-200">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator with Avatar */}
                  {isTyping && (
                    <div className="flex justify-start gap-2.5 items-end animate-bubble-up">
                      {/* Bot Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-605 border border-zinc-200/20 shadow flex items-center justify-center shrink-0 overflow-hidden">
                        {widgetConfig.launcherLogoUrl ? (
                          <img src={widgetConfig.launcherLogoUrl} alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="bg-zinc-100 dark:bg-stone-900 border border-[var(--color-border)] px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm min-h-[38px]">
                        <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-300 rounded-full animate-typing-dot-1"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-300 rounded-full animate-typing-dot-2"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-300 rounded-full animate-typing-dot-3"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stars index interaction feedback triggers, ONLY shown after Close Session is confirmed */}
                {isClosingSession && interactionRating === null && (
                  <div className="mx-4 mb-2.5 p-3 bg-amber-500/[0.04] rounded-xl border border-amber-550/20 text-center animate-fade-in flex flex-col items-center gap-1.5 shadow-sm shrink-0 dark:bg-amber-500/[0.08]" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                      <span className="text-[11px] font-extrabold text-[var(--color-text-primary)]">Rate this Chat Session</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      Please rate the quality of response assistance before leaving:
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button 
                           key={starIdx} 
                           type="button"
                           onClick={() => handleRatingSelect(starIdx)}
                           className="hover:scale-130 transition cursor-pointer text-amber-500 text-lg font-mono"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Star Feedback confirmation voucher */}
                {isClosingSession && interactionRating !== null && (
                  <div className="mx-4 mb-2.5 p-3 bg-emerald-500/[0.04] rounded-xl border border-emerald-500/20 text-center animate-fade-in flex flex-col items-center gap-1 shadow-sm shrink-0">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">✓ Satisfaction Rating Saved!</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsClosingSession(false);
                        setInteractionRating(null);
                        handleCloseWidget(); // Fully exit/close widget!
                      }}
                      className="text-[10px] text-indigo-550 hover:text-indigo-650 underline font-semibold mt-1"
                    >
                      Close and return to page
                    </button>
                  </div>
                )}

                {/* Human taker, takeover buttons */}
                {widgetConfig.humanHandoffEnabled && !isHandoffTriggered && (
                  <div className="px-4.5 py-1.5 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-between shadow-inner shrink-0 text-[11px] text-[var(--color-text-secondary)]">
                    <span>Stuck with questions?</span>
                    <button
                      onClick={handleTakeoverRescue}
                      className="text-accent hover:underline font-extrabold cursor-pointer"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Request Human Advisor Takeover
                    </button>
                  </div>
                )}

                {isHandoffTriggered && (
                  <div className="px-4.5 py-1.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between shrink-0 text-[11px] font-bold text-emerald-800" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)', borderColor: 'var(--color-border)' }}>
                    <span>Advisor Rescue Taking Over...</span>
                    <span className="text-[10px] animate-pulse">● Connecting Live</span>
                  </div>
                )}

                {/* Footer Send box */}
                <form onSubmit={handleSendChatMessage} className="p-3.5 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] flex flex-col gap-2 shrink-0">
                  {conversationClosed && (
                    <button
                      type="button"
                      onClick={handleStartNewChat}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow mb-1"
                    >
                      <span>Start new chat</span>
                    </button>
                  )}
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      disabled={conversationClosed}
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      placeholder={
                        conversationClosed 
                          ? "This conversation has been closed." 
                          : (isPlatformMode 
                              ? "Ask how I can automate your intake..." 
                              : "Ask a question or describe your needs...")
                      }
                      className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-neutral-400 rounded-xl px-3.5 py-2.5 text-xs focus:bg-[var(--color-bg-primary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ ringColor: 'var(--color-accent)' }}
                    />
                    <button
                      type="submit"
                      disabled={conversationClosed}
                      className="p-2.5 rounded-xl text-white shadow hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: botGradient }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {(!tenantPlan || !['enterprise', 'agency'].includes(tenantPlan.toLowerCase())) && (
                  <div className="text-center pt-2 pb-1 text-[9px] text-neutral-400 font-semibold select-none">
                    Powered by{' '}
                    <a href="https://neslead.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-extrabold text-indigo-400">
                      NesLead
                    </a>
                  </div>
                )}

              </div>
            )}

            {/* Bottom Navigation Row */}
            {['chat', 'services', 'scheduler'].includes(activePanel) && (
              <div 
                className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] grid gap-1 px-2 py-1.5 text-center shadow-xs select-none transition-all duration-300"
                style={{
                  gridTemplateColumns: `repeat(${1 + (widgetPrograms && widgetPrograms.length > 0 ? 1 : 0) + (widgetConfig.bookingEnabled ? 1 : 0)}, minmax(0, 1fr))`
                }}
              >
                {/* Tab 1: Chat */}
                <button
                  type="button"
                  onClick={() => setActivePanel('chat')}
                  className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer hover:bg-neutral-150 dark:hover:bg-zinc-850"
                  style={{
                    color: activePanel === 'chat' ? botAccent : 'var(--color-text-secondary)',
                    fontWeight: activePanel === 'chat' ? 'bold' : 'normal',
                  }}
                >
                  <MessageSquare className="w-4 h-4 mx-auto" />
                  <span className="text-[10px]">Chat</span>
                </button>

                {/* Tab 2: Services */}
                {widgetPrograms.length > 0 && (
                  <button
                    onClick={() => setActivePanel('services')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer`}
                    style={{ color: activePanel === 'services' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                  >
                    <List className="w-4 h-4" />
                    <span>Services</span>
                  </button>
                )}

                {/* Tab 3: Book Call */}
                {widgetConfig.bookingEnabled && (
                  <button
                    type="button"
                    onClick={() => setActivePanel('scheduler')}
                    className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all cursor-pointer hover:bg-neutral-150 dark:hover:bg-zinc-850"
                    style={{
                      color: activePanel === 'scheduler' ? botAccent : 'var(--color-text-secondary)',
                      fontWeight: activePanel === 'scheduler' ? 'bold' : 'normal',
                    }}
                  >
                    <Calendar className="w-4 h-4 mx-auto" />
                    <span className="text-[10px]">Book Call</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
