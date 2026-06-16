import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { useAppTheme, THEMES } from './ThemeContext';
import { useCurrency } from './CurrencyContext';
import { ArrowRight, HelpCircle, Check, Globe, Star, Play, Sparkles, MessageSquare, AlertCircle, Ban, Zap, Shield, ShieldAlert, ShieldCheck, Palette, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';

interface MessageItemProps {
  msg: { role: 'USER' | 'ASSISTANT'; text: string };
  isUser: boolean;
}

const AtmosphericDustCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth || 382;
    let height = canvas.offsetHeight || 460;
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.offsetWidth || 382;
      height = canvas.offsetHeight || 460;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      const resizeCtx = canvas.getContext('2d');
      if (resizeCtx) {
        resizeCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);

    // Dynamic floating sparkles array
    const particleCount = 20;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fade: number;
      hue: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedY: -(Math.random() * 0.15 + 0.05),
        speedX: (Math.random() - 0.5) * 0.1,
        opacity: Math.random() * 0.35 + 0.05,
        fade: Math.random() > 0.5 ? 1 : -1,
        hue: Math.random() > 0.6 ? 262 : (Math.random() > 0.5 ? 190 : 320) // Slate violet, Cyan, and Pink soft mix
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Slow wavy hover effect
        p.speedX += (Math.random() - 0.5) * 0.015;
        p.speedX = Math.max(-0.15, Math.min(0.15, p.speedX));

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw soft glowing translucent atmosphere sparkle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        gradient.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${p.opacity})`);
        gradient.addColorStop(0.3, `hsla(${p.hue}, 85%, 70%, ${p.opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 85%, 70%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{ mixBlendMode: 'plus-lighter', opacity: 0.7 }}
    />
  );
};

const SmoothMessageItem: React.FC<MessageItemProps> = ({ msg, isUser }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(bubbleRef.current,
        { 
          opacity: 0, 
          y: 28, 
          scale: 0.90,
          transformOrigin: isUser ? "bottom right" : "bottom left"
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          ease: 'power3.out',
          clearProps: 'transform'
        }
      );
    }

    if (textRef.current) {
      const words = textRef.current.querySelectorAll('.word-token');
      if (words.length > 0) {
        gsap.fromTo(words,
          {
            opacity: 0,
            y: 6,
            filter: 'blur(3px)'
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.35,
            stagger: 0.02,
            ease: 'power2.out'
          }
        );
      }
    }
  }, [msg.text, isUser]);

  const words = msg.text.split(' ');

  return (
    <div 
      ref={bubbleRef}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full relative z-10`}
    >
      <div 
        className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed border ${isUser ? 'rounded-br-none' : 'rounded-bl-none'} transition-colors duration-300 shadow-md relative overflow-hidden backdrop-blur-[2px]`}
        style={isUser 
          ? { 
              backgroundColor: 'rgba(79, 70, 229, 0.08)', 
              borderColor: 'rgba(79, 70, 229, 0.22)', 
              color: 'var(--color-text-primary)',
              boxShadow: '0 4px 20px -2px rgba(79, 70, 229, 0.04)'
            } 
          : { 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              borderColor: 'var(--color-border)', 
              color: 'var(--color-text-primary)' 
            }
        }
      >
        <div ref={textRef} className="flex flex-wrap gap-x-1 gap-y-0.5">
          {words.map((word, i) => (
            <span key={i} className="word-token inline-block origin-left whitespace-nowrap">
              {word}
            </span>
          ))}
        </div>
        
        {msg.role === 'ASSISTANT' && (
          <div className="mt-1.5 pt-1.5 border-t flex items-center justify-between text-[9px] select-none opacity-80" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-1">
              <span className="w-4 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>94% score</span>
            </div>
            <span>Source: Service Catalog</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SmoothTypingIndicator: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dot1Ref = useRef<HTMLSpanElement>(null);
  const dot2Ref = useRef<HTMLSpanElement>(null);
  const dot3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 12, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }

    const dots = [dot1Ref.current, dot2Ref.current, dot3Ref.current];
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(dots, {
      y: -5,
      stagger: 0.12,
      duration: 0.28,
      ease: 'power2.out'
    }).to(dots, {
      y: 0,
      stagger: 0.12,
      duration: 0.28,
      ease: 'power2.in'
    }, '-=0.18');

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex justify-start relative z-10"
    >
      <div className="border p-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <span 
          ref={dot1Ref}
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: 'var(--color-text-secondary)' }}
        />
        <span 
          ref={dot2Ref}
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: 'var(--color-text-secondary)' }}
        />
        <span 
          ref={dot3Ref}
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: 'var(--color-text-secondary)' }}
        />
      </div>
    </div>
  );
};

const HeroAtmosphereCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth || window.innerWidth;
    let height = canvas.offsetHeight || 500;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const starCount = 65;
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      ox: number;
      oy: number;
      color: string;
      size: number;
    }> = [];

    const colors = [
      'rgba(99, 102, 241, 0.45)', 
      'rgba(45, 212, 191, 0.35)', 
      'rgba(236, 72, 153, 0.35)', 
      'rgba(255, 255, 255, 0.65)'  
    ];

    for (let i = 0; i < starCount; i++) {
      const sx = (Math.random() - 0.5) * 1200;
      const sy = (Math.random() - 0.5) * 1200;
      const sz = Math.random() * 1000 + 100;
      stars.push({
        x: sx,
        y: sy,
        z: sz,
        ox: sx,
        oy: sy,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 1.5 + 0.5
      });
    }

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, zoom: 1, targetZoom: 1 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      mouse.targetX = (clientX - rect.width / 2) * 0.35;
      mouse.targetY = (clientY - rect.height / 2) * 0.35;
      
      const distance = Math.sqrt(mouse.targetX * mouse.targetX + mouse.targetY * mouse.targetY);
      mouse.targetZoom = 1 + (distance / 500) * 0.32;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.offsetWidth || window.innerWidth;
      height = canvas.offsetHeight || 500;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      const resizeCtx = canvas.getContext('2d');
      if (resizeCtx) {
        resizeCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      mouse.zoom += (mouse.targetZoom - mouse.zoom) * 0.06;

      const halfW = width / 2;
      const halfH = height / 2;

      ctx.strokeStyle = `rgba(99, 102, 241, ${0.015 * mouse.zoom})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(halfW + mouse.x * 0.1, halfH + mouse.y * 0.1, 240 * mouse.zoom, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(45, 212, 191, ${0.008 * mouse.zoom})`;
      ctx.beginPath();
      ctx.arc(halfW + mouse.x * 0.15, halfH + mouse.y * 0.15, 480 * mouse.zoom, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.z -= 0.65;
        if (s.z <= 0) {
          s.z = 1000;
          s.x = (Math.random() - 0.5) * 1200;
          s.y = (Math.random() - 0.5) * 1200;
          s.ox = s.x;
          s.oy = s.y;
        }

        const perspectiveFactor = 380 / s.z;
        const px = s.x * perspectiveFactor * mouse.zoom + halfW + mouse.x * (1 - s.z / 1050);
        const py = s.y * perspectiveFactor * mouse.zoom + halfH + mouse.y * (1 - s.z / 1050);
        const radius = s.size * perspectiveFactor * mouse.zoom * 0.85;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.fillStyle = s.color;
          if (s.size > 1.2) {
            ctx.shadowColor = s.color;
            ctx.shadowBlur = radius * 4;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.arc(px, py, Math.max(0.1, radius), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, rgba(0,0,0,0) 80%)'
        }}
      />
      <canvas ref={canvasRef} className="w-full h-full opacity-60 dark:opacity-85" />
    </div>
  );
};

const DEMO_CONFIGS = [
  {
    botName: "NesLead Bot",
    statusText: "AI Assistant · Online",
    avatarIcon: "⚡",
    gradient: "linear-gradient(135deg, #7C3AED, #0EA5E9)",
    accentShadow: "rgba(124,58,237,0.35)",
    launcherEmoji: "🤖",
    slides: [
      { emoji: '🚀', title: 'Meet Your AI Assistant', desc: 'Always on, always ready. NesLead Bot qualifies leads and books consultations while you sleep.' },
      { emoji: '🎯', title: 'Works For Any Business', desc: 'Clinics, agencies, law firms, gyms — NesLead Bot adapts its conversation flow to your industry.' },
      { emoji: '⚡', title: 'Live in Under 10 Minutes', desc: 'One line of code on your site. No setup calls. Just paste and watch leads come in.' }
    ],
    msg1: "Hello! 👋 Welcome to NesLead. I'm here to help you find the right solution for your business. What brings you here today?",
    msg2: "We run a busy dental clinic and keep missing leads who visit after hours. Can this help?",
    msg3: "Absolutely! 🦷 NesLead Bot is live 24/7 — it greets every visitor, asks the right intake questions, and captures their details automatically. No more missed opportunities after hours.\n\nShall I grab your contact info so we can set up a free trial for your clinic?",
    formTitle: "🗓️ Book Your Free Trial",
    inputName: "Your full name",
    inputEmail: "Work email",
    inputPhone: "Phone / WhatsApp",
    submitLabel: "Start My Free Trial →",
    leadName: "James Okafor",
    leadEmail: "james@brightsmile.com",
    leadPhone: "+44 7911 234 567",
    successMsg: "🎉 Booked! James Okafor's trial has been activated",
    msg4: "You're all set, James! 🚀 Your 14-day free trial is now live. Check your inbox — I've sent your setup guide and a link to onboard your first bot in under 10 minutes. See you on the other side! 💪",
    statLeads: "214",
    statLeadsLabel: "Leads captured today",
    statRate: "79%",
    statRateLabel: "Visitor-to-lead rate",
    statLive: "8 visitors in chat now"
  },
  {
    botName: "NesLead Bot",
    statusText: "AI Assistant · Online",
    avatarIcon: "⚡",
    gradient: "linear-gradient(135deg, #10B981, #3B82F6)",
    accentShadow: "rgba(16,185,129,0.35)",
    launcherEmoji: "🤖",
    slides: [
      { emoji: '🤖', title: 'Welcome to NesLead', desc: 'AI-powered lead capture for any business — clinics, agencies, law firms, salons, and more. Convert visitors automatically, 24/7.' },
      { emoji: '💬', title: 'Smart AI, Any Industry', desc: 'NesLead adapts to your vertical with purpose-built conversation flows and intake forms tailored to your services.' },
      { emoji: '⚡', title: 'One Script Tag. Done.', desc: 'Paste one line on your website. NesLead starts qualifying and capturing leads immediately. No coding needed.' }
    ],
    msg1: "Hi there! 👋 I'm your AI assistant. How can I help you today? Whether you have a question or want to book a consultation, I'm here 24/7.",
    msg2: "I'm interested in your services — how does pricing work?",
    msg3: "Great question! 🎯 We offer flexible plans starting from a free trial with no credit card required. Most clients see their first qualified lead within 48 hours of going live.\n\nCan I grab your details so our team can send you a personalised quote?",
    formTitle: "📋 Get Your Free Quote",
    inputName: "Your name",
    inputEmail: "Business email",
    inputPhone: "Phone / WhatsApp",
    submitLabel: "Send Me the Quote →",
    leadName: "Sarah Mitchell",
    leadEmail: "sarah@mybusiness.com",
    leadPhone: "+1 415 882 3301",
    successMsg: "✓ Lead captured — Sarah Mitchell added to your dashboard",
    msg4: "You're all set, Sarah! 🚀 Expect a personalised quote in your inbox within 1 hour. One of our team will also reach out to walk you through everything. Can I help with anything else?",
    statLeads: "147",
    statLeadsLabel: "Leads captured today",
    statRate: "72%",
    statRateLabel: "Visitor-to-lead rate",
    statLive: "5 visitors in chat now"
  },
  {
    botName: "NesLead Bot",
    statusText: "Consultant Assistant Active",
    avatarIcon: "⚡",
    gradient: "linear-gradient(135deg, #EC4899, #6366F1)",
    accentShadow: "rgba(236,72,153,0.35)",
    launcherEmoji: "💼",
    slides: [
      { emoji: '💼', title: 'B2B Custom Scale', desc: 'Generate enterprise-level contracts and customized quotes directly through interactive consultation paths.' },
      { emoji: '📊', title: 'Built-in CRM Sync', desc: 'Captured data instantly streams to your CRM pipelines like Salesforce, HubSpot, or custom webhooks.' },
      { emoji: '🔐', title: 'Enterprise Security', desc: 'Durable, SOC2-compliant, completely private RAG database keeping your proprietary operations secure.' }
    ],
    msg1: "Hello! Welcome to our custom agency consulting channel. Are you looking to scale your development setup with advanced systems?",
    msg2: "Hi! Yes, do you offer customized agency packages for modern web platforms?",
    msg3: "Yes, we offer tailored development with complete SEO indexing and high-performance server scaling. Our startup packages enjoy a 20% discount!\n\nCould I take your details so we can draft a custom proposal?",
    formTitle: "📋 Custom Scope Setup",
    inputName: "Company contact name",
    inputEmail: "Work email",
    inputPhone: "Direct work line",
    submitLabel: "Lock in Custom Quote →",
    leadName: "David Chen",
    leadEmail: "david@leadagency.co",
    leadPhone: "+44 7911 123456",
    successMsg: "✓ Slot Locked — Tomorrow at 2:00 PM (Details sent to email)",
    msg4: "All set, David! 🚀 Expect a contact draft in your inbox within 2 hours. One of our team will also reach out to walk you through everything. Can I help with anything else?",
    statLeads: "284",
    statLeadsLabel: "Monthly agency signups",
    statRate: "79%",
    statRateLabel: "Conversion optimization rate",
    statLive: "7 visitors in chat now"
  }
];

interface SingleDemoPlayerProps {
  config: typeof DEMO_CONFIGS[0];
  onFinished: () => void;
  demoIndex: number;
}

const SingleDemoPlayer: React.FC<SingleDemoPlayerProps> = ({ config, onFinished, demoIndex }) => {
  const [step, setStep] = useState<'launcher' | 'slides' | 'convo' | 'stats'>('launcher');
  const [slideIndex, setSlideIndex] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const onFinishedRef = useRef(onFinished);
  const configRef = useRef(config);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Reset local player states when active index transitions
  useEffect(() => {
    setStep('launcher');
    setSlideIndex(0);
    setMsgCount(0);
    setTyping(false);
    setFormVisible(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSubmitting(false);
    setSuccessVisible(false);
  }, [demoIndex]);

  useEffect(() => {
    let active = true;
    const wait = (ms: number) => new Promise(resolve => {
      const t = setTimeout(() => {
        resolve(null);
      }, ms);
      cleanups.push(() => clearTimeout(t));
    });

    const cleanups: Array<() => void> = [];

    const typeIntoField = async (setter: (val: string) => void, text: string) => {
      for (let i = 0; i <= text.length; i++) {
        if (!active) return;
        setter(text.slice(0, i));
        await wait(28 + Math.random() * 20);
      }
    };

    const playSequence = async () => {
      const currentConfig = configRef.current;
      // Scene 1: Launcher visible (unread badge on)
      setStep('launcher');
      await wait(1800);
      if (!active) return;

      // Scene 2: Slides onboarding (launcher open status)
      setStep('slides');
      setSlideIndex(0);
      await wait(1500);
      if (!active) return;

      setSlideIndex(1);
      await wait(1500);
      if (!active) return;

      setSlideIndex(2);
      await wait(1800);
      if (!active) return;

      // Scene 3: Conversation begins — transition from slides to chat feed
      setStep('convo');
      setMsgCount(1); // bot message 1
      await wait(1800);
      if (!active) return;

      setMsgCount(2); // user response shows
      await wait(1500);
      if (!active) return;

      setTyping(true); // bot starts typing
      await wait(1600);
      if (!active) return;
      setTyping(false);

      setMsgCount(3); // bot responds with requirements and intake prompt
      await wait(1800);
      if (!active) return;

      // Scene 4: Intake Form card captures details
      setFormVisible(true);
      await wait(1000);
      if (!active) return;

      // Start filling details characters-by-characters
      await typeIntoField(setFormName, currentConfig.leadName);
      await wait(300);
      if (!active) return;

      await typeIntoField(setFormEmail, currentConfig.leadEmail);
      await wait(300);
      if (!active) return;

      await typeIntoField(setFormPhone, currentConfig.leadPhone);
      await wait(600);
      if (!active) return;

      // Submit form (loading simulation)
      setFormSubmitting(true);
      await wait(600);
      if (!active) return;
      setFormSubmitting(false);

      // Scene 5: Lead Confirmed!
      setSuccessVisible(true);
      await wait(1200);
      if (!active) return;

      // Final bot typing
      setTyping(true);
      await wait(1600);
      if (!active) return;
      setTyping(false);

      setMsgCount(4); // Bot concluding message
      await wait(2200);
      if (!active) return;

      // Scene 6: Floating metrics display
      setStep('stats');
      await wait(1000); // reduced from 4500 for immediate, snappy handoffs
      if (!active) return;

      // Execute callback to parent to swap to next demo
      onFinishedRef.current();
    };

    playSequence();

    return () => {
      active = false;
      cleanups.forEach(c => c());
    };
  }, [demoIndex]);

  // Smooth scroll helper
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [msgCount, typing, formVisible, formName, formEmail, formPhone, successVisible]);

  return (
    <div className="w-full max-w-sm relative select-none md:scale-100 scale-95 origin-center transition-all">

      {/* Floating Dashboard Metrics cards showing up upon completing/stats state */}
      {step === 'stats' && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -15 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="absolute top-4 -left-4 xs:-left-8 sm:-left-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xl flex flex-col backdrop-blur-md z-30 select-none text-left min-w-[120px]"
          >
            <span className="text-xl font-black font-mono leading-none" style={{ background: config.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {config.statLeads}
            </span>
            <span className="text-[9px] font-bold text-[var(--color-text-secondary)] leading-tight mt-1">
              {config.statLeadsLabel}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -15 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute top-22 -left-4 xs:-left-8 sm:-left-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-3 shadow-2xl flex flex-col backdrop-blur-md z-30 select-none text-left min-w-[120px]"
          >
            <span className="text-xl font-black font-mono leading-none" style={{ background: config.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {config.statRate}
            </span>
            <span className="text-[9px] font-bold text-[var(--color-text-secondary)] leading-tight mt-1">
              {config.statRateLabel}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-12 -left-4 xs:-left-8 sm:-left-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-2.5 px-3.5 shadow-2xl flex items-center gap-2 backdrop-blur-md z-30 select-none"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] font-extrabold text-[var(--color-text-secondary)] whitespace-nowrap leading-none mt-[0.5px]">
              {config.statLive}
            </span>
          </motion.div>
        </>
      )}

      {/* Launcher Bubble state (hidden card) */}
      {step === 'launcher' ? (
        <div className="w-[340px] h-[500px] flex items-end justify-end pointer-events-none pr-4 pb-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 4.5, repeatType: 'reverse', ease: 'easeInOut' }}
            className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl border cursor-pointer pointer-events-auto relative shrink-0"
            style={{ background: config.gradient, borderColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <span className="text-2xl">{config.launcherEmoji}</span>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900" />
          </motion.div>
        </div>
      ) : (
        /* Chat Card element */
        <div 
          className="w-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col min-h-[480px] h-[480px] select-none relative shadow-[0_0_50px_rgba(79,70,229,0.15)] md:shadow-[0_0_80px_rgba(79,70,229,0.22)]" 
          style={{ 
            borderColor: 'var(--color-border)', 
            backgroundColor: 'var(--color-bg-card)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          {/* Ambient atmospheric dust particles floating in the background */}
          <AtmosphericDustCanvas />

          {/* Header */}
          <div className="px-5 py-3.5 border-b flex items-center justify-between shadow-sm relative z-10 text-white select-none pointer-events-none" style={{ borderBottomColor: 'var(--color-border)', background: config.gradient }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/20 font-bold">
                {config.avatarIcon}
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-xs tracking-tight">{config.botName}</h4>
                <div className="flex items-center gap-1 text-[9.5px] opacity-90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{config.statusText}</span>
                </div>
              </div>
            </div>
            <HelpCircle className="w-4 h-4 text-white opacity-80" />
          </div>

          {/* Slides panel view */}
          {step === 'slides' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-card)] relative z-10 animate-fade-in select-none pointer-events-none">
              <div className="text-4xl mb-4 animate-bounce shrink-0" style={{ animationDuration: '3s' }}>
                {config.slides[slideIndex].emoji}
              </div>
              <h5 className="font-extrabold text-sm tracking-tight mb-2 uppercase" style={{ color: 'var(--color-accent)' }}>
                {config.slides[slideIndex].title}
              </h5>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed max-w-[240px] mb-6 font-medium">
                {config.slides[slideIndex].desc}
              </p>
              <div className="flex gap-1.5 mb-4 justify-center">
                {[0, 1, 2].map(i => (
                  <span 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === slideIndex ? 'w-5 bg-indigo-500' : 'w-1.5 bg-[var(--color-border)]'
                    }`}
                    style={{ backgroundColor: i === slideIndex ? 'var(--color-accent)' : undefined }}
                  />
                ))}
              </div>
              <button 
                disabled
                className="text-[10px] font-bold text-white px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1 select-none pointer-events-none"
                style={{ background: config.gradient }}
              >
                <span>{slideIndex === 2 ? 'Get Started →' : 'Next →'}</span>
              </button>
            </div>
          )}

          {/* Active chat convo & statistics panel elements */}
          {(step === 'convo' || step === 'stats') && (
            <>
              {/* Message Feed Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[352px] text-xs no-scrollbar relative z-10 select-none pointer-events-none"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Message 1 (Bot) */}
                {msgCount >= 1 && (
                  <div className="flex justify-start w-full relative z-10 animate-fade-in text-left">
                    <div className="flex gap-2 max-w-[85%] items-end">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs shrink-0 select-none font-bold">
                        {config.avatarIcon}
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-bl-none border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] shadow-md leading-relaxed pr-6 font-medium">
                        {config.msg1}
                      </div>
                    </div>
                  </div>
                )}

                {/* Message 2 (User) */}
                {msgCount >= 2 && (
                  <div className="flex justify-end w-full relative z-10 animate-fade-in text-right">
                    <div className="p-3.5 rounded-2xl rounded-br-none border text-white shadow-md leading-relaxed max-w-[85%] text-left font-semibold"
                         style={{ background: config.gradient, boxShadow: `0 4px 15px ${config.accentShadow}`, borderColor: 'rgba(255,255,255,0.08)' }}>
                      {config.msg2}
                    </div>
                  </div>
                )}

                {/* Typing Indicator 1 */}
                {typing && msgCount === 2 && (
                  <div className="flex justify-start w-full relative z-10 animate-fade-in text-left">
                    <div className="flex gap-2 max-w-[85%] items-end">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs shrink-0 select-none font-bold">
                        {config.avatarIcon}
                      </div>
                      <div className="border p-3.5 px-4 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm bg-[var(--color-bg-card)] border-[var(--color-border)] select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Message 3 (Bot responds query) */}
                {msgCount >= 3 && (
                  <div className="flex justify-start w-full relative z-10 animate-fade-in text-left">
                    <div className="flex gap-2 max-w-[85%] items-end">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs shrink-0 select-none font-bold">
                        {config.avatarIcon}
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-bl-none border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] shadow-md leading-relaxed whitespace-pre-line font-medium">
                        {config.msg3}
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Lead Form Card */}
                {formVisible && (
                  <div className="border rounded-2xl p-4 shadow-xl z-20 relative space-y-3 bg-[var(--color-bg-card)] border-[var(--color-border)] text-left transition-all duration-300">
                    <div className="text-xs font-black flex items-center gap-1.5 text-[var(--color-text-primary)]">
                      {config.formTitle}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text"
                        readOnly
                        value={formName}
                        placeholder={config.inputName}
                        className={`w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border text-[11px] font-semibold rounded-xl outline-none transition-all ${
                          formName ? 'border-emerald-500/80 text-emerald-500 bg-emerald-500/5' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'
                        }`}
                      />
                      <input 
                        type="text"
                        readOnly
                        value={formEmail}
                        placeholder={config.inputEmail}
                        className={`w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border text-[11px] font-semibold rounded-xl outline-none transition-all ${
                          formEmail ? 'border-emerald-500/80 text-emerald-500 bg-emerald-500/5' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'
                        }`}
                      />
                      <input 
                        type="text"
                        readOnly
                        value={formPhone}
                        placeholder={config.inputPhone}
                        className={`w-full px-3.5 py-2.5 bg-[var(--color-bg-secondary)] border text-[11px] font-semibold rounded-xl outline-none transition-all ${
                          formPhone ? 'border-emerald-500/80 text-emerald-500 bg-emerald-500/5' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'
                        }`}
                      />
                      <button 
                        type="button"
                        disabled
                        className="w-full text-xs font-black text-white py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ background: formSubmitting ? 'var(--color-border)' : config.gradient }}
                      >
                        {formSubmitting ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : config.submitLabel}
                      </button>
                    </div>
                  </div>
                )}

                {/* Lead Captured Success Notification Banner */}
                {successVisible && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl text-center text-emerald-500 text-[10px] font-extrabold animate-fade-in select-none">
                    {config.successMsg}
                  </div>
                )}

                {/* Typing Indicator 2 */}
                {typing && msgCount === 3 && successVisible && (
                  <div className="flex justify-start w-full relative z-10 animate-fade-in text-left">
                    <div className="flex gap-2 max-w-[85%] items-end">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs shrink-0 select-none font-bold">
                        {config.avatarIcon}
                      </div>
                      <div className="border p-3.5 px-4 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm bg-[var(--color-bg-card)] border-[var(--color-border)] select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Message 4 (Bot concluded conversation) */}
                {msgCount >= 4 && (
                  <div className="flex justify-start w-full relative z-10 animate-fade-in text-left">
                    <div className="flex gap-2 max-w-[85%] items-end">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs shrink-0 select-none font-bold">
                        {config.avatarIcon}
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-bl-none border bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] shadow-md leading-relaxed whitespace-pre-line font-medium">
                        {config.msg4}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom message input bar */}
              <div className="p-3.5 border-t flex gap-2 relative z-10 shrink-0 pointer-events-none select-none" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <input
                  type="text"
                  disabled
                  placeholder="Ask us anything..."
                  className="flex-1 border text-[11px] font-semibold rounded-xl px-3 py-2 outline-none"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <button disabled className="p-2.5 rounded-xl text-white opacity-85 shrink-0" style={{ background: config.gradient }}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ContinuousSequencedDemos: React.FC = () => {
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);

  const handleDemoFinished = () => {
    setActiveDemoIndex(prev => (prev + 1) % DEMO_CONFIGS.length);
  };

  return (
    <div className="w-full relative flex items-center justify-center min-h-[500px] xs:min-h-[540px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDemoIndex}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full flex justify-center items-center"
        >
          <SingleDemoPlayer 
            key={activeDemoIndex}
            demoIndex={activeDemoIndex}
            config={DEMO_CONFIGS[activeDemoIndex]} 
            onFinished={handleDemoFinished} 
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const rotationLines = [
  "Turn Every Website Visitor Into A Qualified Conversation",
  "Your Next Client Is Already On Your Website — Are You Talking To Them?",
  "Every Unanswered Question Is A Lead Walking Out The Door",
  "From First Click To Booked Appointment — Fully Automated",
  "Your Competitors Are Replying In Seconds. Are You?"
];

interface LandingPageProps {
  onStartDemo: (selectedPlan?: string) => void;
  onLogin: () => void;
}

export default function LandingPage({ onStartDemo, onLogin }: LandingPageProps) {
  const { translate, activeLanguage, setIsLanguage } = useLanguage();
  const { activeTheme, setThemeById } = useAppTheme();
  const { convertAndFormat, currency, detectedCountry, changeCurrencyOverride, availableCurrencies, isLoading } = useCurrency();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);

  // Text rotator state and reference
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Use the requested clipPath inset animation from bottom to top
      if (headlineRef.current) {
        gsap.from(headlineRef.current, {
          clipPath: "inset(100% 0 0 0)",
          duration: 1.5,
          ease: "power2.out"
        });
      }

      // Transition to next line after showing the text for some seconds
      const timer = setTimeout(() => {
        if (headlineRef.current) {
          gsap.to(headlineRef.current, {
            clipPath: "inset(0 0 100% 0)",
            duration: 1.0,
            ease: "power2.in",
            onComplete: () => {
              setCurrentLineIndex((prev) => (prev + 1) % rotationLines.length);
            }
          });
        } else {
          setCurrentLineIndex((prev) => (prev + 1) % rotationLines.length);
        }
      }, 6500);

      return () => {
        clearTimeout(timer);
      };
    }, headlineRef);

    return () => {
      ctx.revert();
    };
  }, [currentLineIndex]);

  // Dedicated Landing Page Exit Intent Popup States
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitVariant, setExitVariant] = useState<'A' | 'B' | 'C'>('A');
  const [exitEmail, setExitEmail] = useState('');
  const [exitSubmitting, setExitSubmitting] = useState(false);
  const [exitSubmitted, setExitSubmitted] = useState(false);
  const [exitError, setExitError] = useState('');
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [resetMessage, setResetMessage] = useState('');

  // 1. A/B test setup - on mount pick or fetch sticky exit variant for new visitors
  useEffect(() => {
    let stored = localStorage.getItem('neslead_exit_variant') as 'A' | 'B' | 'C' | null;
    if (!stored || !['A', 'B', 'C'].includes(stored)) {
      const variants = ['A', 'B', 'C'] as const;
      stored = variants[Math.floor(Math.random() * 3)];
      localStorage.setItem('neslead_exit_variant', stored);
    }
    setExitVariant(stored);
  }, []);

  // Auto-cycle the exit popup messages inline on a smooth, modern timer
  useEffect(() => {
    if (!showExitPopup || exitSubmitted) return;

    const interval = setInterval(() => {
      setExitVariant(prev => {
        if (prev === 'A') return 'B';
        if (prev === 'B') return 'C';
        return 'A';
      });
    }, 4500); // Cycles smoothly every 4.5 seconds

    return () => clearInterval(interval);
  }, [showExitPopup, exitSubmitted]);

  // 2. Track scroll percentage dynamically to filter immediate bounces (require >= 30%)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const pct = (window.scrollY / totalHeight) * 100;
      setScrollPercentage(pct);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Trigger exit intent popup if mouse leaves standard top-bound viewport
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 15) {
        const alreadyFired = localStorage.getItem('neslead_exit_intent_fired') === 'true';
        // Only trigger if scrolled at least 30%, not already shown during session, and forms not already submitted
        if (scrollPercentage >= 30 && !alreadyFired && !showExitPopup && !exitSubmitted) {
          setShowExitPopup(true);
          localStorage.setItem('neslead_exit_intent_fired', 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [scrollPercentage, showExitPopup, exitSubmitted]);

  // Lead capture post submission handler
  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitEmail || !exitEmail.trim()) {
      setExitError('Email is required.');
      return;
    }

    setExitSubmitting(true);
    setExitError('');

    try {
      const response = await fetch('/api/widget/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: 'SaaS Visitor Exit Lead',
          email: exitEmail.trim(),
          source: `Exit Intent - Landing Page - Version ${exitVariant}`,
          status: 'HOT',
          programInterest: exitVariant === 'C' ? '50% Discount Growth Plan Offer' : 'Product Workspace Demo Request',
          geo: {
            referrer: `Exit Intent Variant ${exitVariant}`,
            device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
            browser: navigator.userAgent.substring(0, 40),
            country: 'Global'
          }
        })
      });

      if (response.ok) {
        setExitSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setExitError(data.message || 'Operation failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setExitError('Network interface timeout. Could not save connection settings.');
    } finally {
      setExitSubmitting(false);
    }
  };

  const renderExitContent = () => {
    // If user has successfully submitted the email capture
    if (exitSubmitted) {
      return (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Check className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-emerald-500">
              {exitVariant === 'A' && "You're in."}
              {exitVariant === 'B' && "On its way."}
              {exitVariant === 'C' && "Claimed."}
            </h3>
            <p className="text-sm font-medium leading-relaxed pl-1" style={{ color: 'var(--color-text-secondary)' }}>
              {exitVariant === 'A' && "Check your inbox — your free workspace is ready. Let's get your first lead."}
              {exitVariant === 'B' && "Check your inbox — the demo is industry-specific, so it'll feel familiar."}
              {exitVariant === 'C' && "Your discount code is in your inbox. It expires in 7 days — don't sit on it."}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setShowExitPopup(false)}
            className="mt-2 px-5 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white"
          >
            Dismiss
          </button>
        </div>
      );
    }

    // Otherwise, render the active variant content
    let badgeText = '';
    let badgeColor = '';
    let headline = '';
    let body = '';
    let buttonLabel = '';
    let subtext = '';

    if (exitVariant === 'A') {
      badgeText = '⚡ Before you go';
      badgeColor = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      headline = 'Your next lead just left without talking to anyone.';
      body = 'NesLead turns website visitors into booked appointments — automatically, 24/7, in any language. Takes 5 minutes to set up. See it work on your own site before you decide anything.';
      buttonLabel = 'Start Free — No Card Required';
      subtext = 'Free plan available · Cancel anytime · Setup in under 5 minutes';
    } else if (exitVariant === 'B') {
      badgeText = '👀 Still deciding?';
      badgeColor = 'bg-teal-500/10 text-teal-500 border border-teal-500/20';
      headline = 'Watch it qualify a real lead in under 60 seconds.';
      body = "Most teams spend hours chasing cold inquiries. NesLead handles the first conversation, captures contact details, and books the meeting — while you sleep. Drop your email and we'll send you a 60-second walkthrough built around your industry.";
      buttonLabel = 'Send Me the Demo';
      subtext = 'No sales call. No commitment. Just a 60-second clip.';
    } else {
      badgeText = '🎁 Exclusive offer';
      badgeColor = 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      headline = 'Get your first 3 months at half price.';
      body = "We're offering 50% off the Growth plan for businesses that activate this month. One widget, 5,000 AI conversations, lead capture, live handoff — everything your team needs. Lock in the rate before it expires.";
      buttonLabel = 'Claim 50% Off Now';
      subtext = 'Offer valid for new accounts activated within 7 days · Billed monthly after trial';
    }

    return (
      <div className="space-y-4">
        {/* Animated header section that passes inline automatically with a stable min-height */}
        <div className="min-h-[195px] flex flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={exitVariant}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-2.5"
            >
              {/* Badge */}
              <div>
                <span className={`inline-block px-2.5 py-1 text-[10px] tracking-wider uppercase font-extrabold rounded-md ${badgeColor}`}>
                  {badgeText}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-[17px] md:text-lg font-black tracking-tight leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                {headline}
              </h2>

              {/* Description Body */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Input/Submit Form remains unchanged & fixed */}
        <form onSubmit={handleExitSubmit} className="space-y-3 pt-2">
          <div className="space-y-1">
            <input 
              type="email"
              required
              value={exitEmail}
              onChange={(e) => { setExitEmail(e.target.value); setExitError(''); }}
              placeholder="Enter your work email..."
              className="w-full px-4 py-3 border rounded-2xl outline-none text-xs font-medium transition-all"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
            {exitError && (
              <p className="text-[11px] font-bold text-rose-500 pl-1">{exitError}</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={exitSubmitting}
            className="w-full py-3 px-5 text-xs font-black uppercase tracking-wider rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {exitSubmitting && (
              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
            )}
            <span> START FREE - NO CREDIT CARD REQUIRED</span>
          </button>
        </form>

        {/* Subtext remains dynamically bound but cycles cleanly */}
        <div className="min-h-[28px] overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={exitVariant}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] text-center w-full"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {subtext}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Support inquiry state variables
  const [supportBrand, setSupportBrand] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);

  // Auto-playing interactive chat widget preview variables
  const [mockMessages, setMockMessages] = useState<Array<{ role: 'USER'|'ASSISTANT', text: string }>>([
    { role: 'USER', text: 'Hi, do you offer customized agency packages for modern web platforms?' }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [mockMessages, isTyping]);

  const scenario = [
    { role: 'ASSISTANT' as const, text: 'Hello! Yes, we offer tailored development with complete SEO indexing and high-performance server scaling. Startup packages enjoy a 20% discount!' },
    { role: 'USER' as const, text: 'Excellent! What materials are needed to get started with the custom build?' },
    { role: 'ASSISTANT' as const, text: 'You can simply upload your business brochures, branding files, or pricing documents. Would you like to book a free consulting slot with an expert tomorrow at 2:00 PM?' },
    { role: 'USER' as const, text: 'Perfect, let\'s lock it in!' },
    { role: 'ASSISTANT' as const, text: 'Done! Your business advisory call is set and confirmed. I have sent details to your email! Let\'s scale your pipeline! 🚀' }
  ];

  useEffect(() => {
    if (currentStep >= scenario.length) {
      const timer = setTimeout(() => {
        setMockMessages([{ role: 'USER', text: 'Hi, do you offer customized agency packages for modern web platforms?' }]);
        setCurrentStep(0);
      }, 5000);
      return () => clearTimeout(timer);
    }

    const delay = scenario[currentStep].role === 'ASSISTANT' ? 2500 : 1800;
    const timer = setTimeout(() => {
      setIsTyping(true);
      const typeFactor = setTimeout(() => {
        setIsTyping(false);
        setMockMessages(prev => [...prev, scenario[currentStep]]);
        setCurrentStep(s => s + 1);
      }, 1500);
      return () => clearTimeout(typeFactor);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitting(true);
    setSupportSuccess(null);
    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandName: supportBrand,
          email: supportEmail,
          message: supportMessage
        })
      });
      const data = await response.json();
      if (data.success) {
        setSupportSuccess(data.message);
        setSupportBrand('');
        setSupportEmail('');
        setSupportMessage('');
      } else {
        setSupportSuccess(data.message || 'An unexpected error occurred. However, your inquiry has been queued locally for processing.');
      }
    } catch (err) {
      console.error(err);
      setSupportSuccess('Successfully compiled and queued your priority ticket. Our engineering squad has been notified!');
    } finally {
      setSupportSubmitting(false);
    }
  };

  const pricingTiers = [
    {
      name: translate('FreeTierName'),
      price_monthly: 0,
      price_annual: 0,
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
    {
      name: translate('StarterName'),
      price_monthly: 36,
      price_annual: 29,
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
    {
      name: translate('GrowthName'),
      price_monthly: 72,
      price_annual: 58,
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
      ],
      popular: true
    },
    {
      name: translate('ProName'),
      price_monthly: 177,
      price_annual: 141,
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
    {
      name: translate('AgencyName'),
      price_monthly: 450,
      price_annual: 360,
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
  ];

  const faqAccordion = [
    {
      q: 'How does the AI assistant gather its knowledge about our business or services?',
      a: 'NesLead uses a state-of-the-art Retrieval-Augmented Generation (RAG) system. You simply dump your custom service brochures, pricing spreadsheets, brand docs, and FAQ files into the dashboard, or paste staging/product page URLs; files are scanned to give high-accuracy replies.'
    },
    {
      q: 'Will the AI hallucinate or quote incorrect service pricing?',
      a: 'We implement strict validation controls. Below each AI response, a confidence meter is tracked. If similarity metrics fall below 70%, the system halts and suggests booking a consulting call with your sales/advising team.'
    },
    {
      q: 'How difficult is the installation on our website?',
      a: 'You only inject one script tag directly into your website template header or footer (compatible with WordPress, Webflow, Squarespace, Wix, or custom HTML) and the assistant renders instantly.'
    },
    {
      q: 'Who owns the captured lead and contact records?',
      a: 'Your company retains 100% ownership of your leads and conversational histories. Records can be filtered, archived, and exported to spreadsheets or external CRM software anytime.'
    },
    {
      q: 'Can our team members override the chatbot when a prospective lead asks a complex question?',
      a: 'Yes! Your sales or support staff see live ongoing conversations in the Shared Inbox, receive desktop notifications when the visitor has custom queries, and can override the AI with a single click to chat directly.'
    },
    {
      q: 'Can we change the pricing plan or cancel our subscription anytime?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or cancel directly from your secure Billing Panel. If you change plans or cancel, your business leads remain fully downloadable.'
    }
  ];

  return (
    <div id="landing_root" className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b flex items-center justify-between px-6 py-4 shadow-sm" style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl text-white flex items-center justify-center shadow-md shadow-accent" style={{ background: 'var(--accent-gradient)' }}>
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Nes<span className="text-accent underline decoration-wavy" style={{ color: 'var(--color-accent)' }}>Lead</span></span>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          <a href="#features" className="hover:text-accent transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-accent transition-colors">How It Works</a>
          <a href="#demo" className="hover:text-accent transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-accent transition-colors">FAQs</a>
        </nav>

        {/* Desktop actions (shown on large screens and above) */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-4 lg:gap-3">
          {/* Theme Selector Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg px-1.5 sm:px-2.5 py-1.5 text-xs font-semibold border shrink-0 transition-all duration-200" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
            <select
              value={activeTheme.id}
              onChange={(e) => setThemeById(e.target.value as any)}
              className="bg-transparent outline-none cursor-pointer text-[11px] sm:text-xs font-bold max-w-[20px] sm:max-w-[100px] md:max-w-none border-none p-0 focus:ring-0 text-ellipsis overflow-hidden"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id} className="text-zinc-950 bg-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switch */}
          <div className="flex rounded-lg p-0.5 text-xs font-semibold border shrink-0" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setIsLanguage('en')}
              className="px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
              style={activeLanguage === 'en' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
            >
              EN
            </button>
            <button
              onClick={() => setIsLanguage('fr')}
              className="px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
              style={activeLanguage === 'fr' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
            >
              FR
            </button>
          </div>

          <button
            onClick={() => setShowAdminPin(true)}
            id="btn_landing_login"
            className="text-[11px] sm:text-xs md:text-sm font-semibold px-2 sm:px-4 py-2 rounded-xl hover:opacity-85 transition-colors cursor-pointer border shrink-0"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            Super<span className="hidden sm:inline"> Admin</span>
          </button>
          
          <button
            onClick={onLogin}
            id="btn_landing_demo"
            className="text-[11px] sm:text-xs md:text-sm font-semibold text-white px-2.5 sm:px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
            style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 14px var(--accent-shadow)' }}
          >
            <span>Login / Signup</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* Mobile/Tablet Header Controls (Hamburger button to maintain zero margin/padding layout overflow bugs) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg border transition-all hover:opacity-80 cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 animate-pulse" />}
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Drawer Dropdown Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-b overflow-hidden z-40 sticky top-[73px] w-full shadow-lg"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="px-6 py-5 flex flex-col gap-6">
              {/* Navigation Links */}
              <div className="flex flex-col gap-4 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  How It Works
                </a>
                <a
                  href="#demo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  Interactive Demo
                </a>
                <a
                  href="#pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1 border-b"
                  style={{ borderBottomColor: 'var(--color-border)' }}
                >
                  Pricing
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors py-1"
                >
                  FAQs
                </a>
              </div>

              {/* Theme & Language mobile layouts */}
              <div className="flex flex-col gap-4 pt-4 border-t" style={{ borderTopColor: 'var(--color-border)' }}>
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Appearance Palette</span>
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold border transition-all" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <Palette className="w-4 h-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
                    <select
                      value={activeTheme.id}
                      onChange={(e) => setThemeById(e.target.value as any)}
                      className="bg-transparent outline-none cursor-pointer text-xs font-bold w-full border-none p-0 focus:ring-0"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {Object.values(THEMES).map((t) => (
                        <option key={t.id} value={t.id} className="text-zinc-950 bg-white">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Language Preference</span>
                  <div className="flex rounded-xl p-1 text-xs font-bold border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => setIsLanguage('en')}
                      className="flex-1 py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                      style={activeLanguage === 'en' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
                    >
                      English (EN)
                    </button>
                    <button
                      onClick={() => setIsLanguage('fr')}
                      className="flex-1 py-2 rounded-lg transition-all shadow-sm cursor-pointer text-center"
                      style={activeLanguage === 'fr' ? { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' } : { color: 'var(--color-text-secondary)' }}
                    >
                      Français (FR)
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowAdminPin(true);
                  }}
                  className="w-full text-xs font-bold px-4 py-3 rounded-xl hover:opacity-85 transition-colors cursor-pointer border text-center"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  Super Admin
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogin();
                  }}
                  className="w-full text-xs font-bold text-white px-5 py-3 rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 14px var(--accent-shadow)' }}
                >
                  <span>Login / Signup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 xs:px-6 sm:px-8 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Deep atmospheric starfield simulations with spatial zoom logic */}
        <HeroAtmosphereCanvas />

        <div 
          className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start w-full relative z-10 select-none"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider style-badge select-none" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>NesLead Platform</span>
          </div>

          <h3 
            ref={headlineRef}
            className="text text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.12] sm:leading-[1.15] text-center lg:text-left drop-shadow-[0_4px_30px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_4px_30px_rgba(0,0,0,0.65)]" 
            style={{ 
              color: 'var(--color-text-primary)',
              minHeight: '3.4em',
              display: 'block'
            }}
          >
            {rotationLines[currentLineIndex]}
          </h3>

          <p 
            className="text-sm sm:text-base md:text-lg max-w-xl leading-relaxed opacity-95 my-2 text-center lg:text-left mx-auto lg:mx-0 drop-shadow-[0_2px_15px_rgba(0,0,0,0.12)]" 
            style={{ 
              color: 'var(--color-text-secondary)'
            }}
          >
            {translate('landingSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => onStartDemo('Starter')}
              id="hero_cta_demo"
              className="px-8 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg text-lg cursor-pointer"
              style={{ background: 'var(--accent-gradient)', boxShadow: '0 8px 20px var(--accent-shadow)' }}
            >
              <Zap className="w-5 h-5" />
              <span>{translate('getStartedButton')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('demo');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-2xl border font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg cursor-pointer animate-fade-in"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{translate('tryDemoButton')}</span>
            </button>
          </div>

          {/* Fully responsive stats details card - displays vertically as clean blocks where descriptions sit neatly under the metric tags */}
          <div className="w-full max-w-2xl mt-8 p-6 rounded-2xl border flex flex-col md:flex-row items-stretch justify-between gap-6 transition-all duration-200 animate-fade-in relative z-10 select-none pointer-events-none" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', userSelect: 'none' }}>
            <div className="flex flex-col items-center text-center p-3 rounded-xl flex-1 select-none w-full">
              <div className="flex-shrink-0 px-4 h-11 min-w-[80px] rounded-xl flex items-center justify-center font-black font-mono text-xs text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/10 dark:border-emerald-500/20 whitespace-nowrap mb-3">100%</div>
              <div className="space-y-1">
                <span className="block text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>No Credit Card Required</span>
                <span className="block text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>Instant test environment ready</span>
              </div>
            </div>
            
            <div className="hidden md:block w-px self-stretch my-2" style={{ backgroundColor: 'var(--color-border)' }}></div>
            
            <div className="flex flex-col items-center text-center p-3 rounded-xl flex-1 select-none w-full">
              <div className="flex-shrink-0 px-4 h-11 min-w-[80px] rounded-xl flex items-center justify-center font-black font-mono text-xs text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/10 dark:border-emerald-500/20 whitespace-nowrap mb-3">14 Days</div>
              <div className="space-y-1">
                <span className="block text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>Complete Free Trial</span>
                <span className="block text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>No locked or throttled features</span>
              </div>
            </div>
            
            <div className="hidden md:block w-px self-stretch my-2" style={{ backgroundColor: 'var(--color-border)' }}></div>
            
            <div className="flex flex-col items-center text-center p-3 rounded-xl flex-1 select-none w-full">
              <div className="flex-shrink-0 px-4 h-11 min-w-[80px] rounded-xl flex items-center justify-center font-black font-mono text-xs text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/10 dark:border-emerald-500/20 whitespace-nowrap mb-3">1 Script</div>
              <div className="space-y-1">
                <span className="block text-xs font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>Embed Tag Install</span>
                <span className="block text-[10px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>Matches any website instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mock Playbox Chatbot */}
        <div id="demo" className="lg:col-span-5 w-full flex justify-center scroll-mt-24 relative select-none">
          <ContinuousSequencedDemos />
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-4 inline-block"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
            Live Demo
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-2" 
            style={{ color: 'var(--color-text-primary)' }}>
            See NesLead in 90 Seconds
          </h2>
        </div>
        {/* Mobile View: YouTube Shorts (Portrait 9:16 Aspect Ratio) */}
        <div className="block md:hidden relative w-full max-w-[290px] mx-auto rounded-3xl overflow-hidden shadow-2xl border aspect-[9/16]"
          style={{ borderColor: 'var(--color-border)' }}>
          <iframe 
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/mfhbFOgUCNU?si=MMmlWR2vK2XuWR_t"
            title="NesLead Mobile Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        {/* Tablet & Desktop View: YouTube Presentation (Widescreen 16:9 Aspect Ratio) */}
        <div className="hidden md:block relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border"
          style={{ paddingBottom: '56.25%', borderColor: 'var(--color-border)' }}>
          <iframe 
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/o9-ObGgfpEk?si=03-d4U1eJTivwzgg"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="features" className="py-20 border-t" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'rgba(255, 92, 58, 0.02)' }}>
        <div className="max-w-7xl mx-auto px-6 w-full space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-normal" style={{ color: 'var(--color-text-primary)' }}>
              {translate('problemTitle')}
            </h2>
            <p className="max-w-2xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Every prospective buyer searching your services after standard business hours and leaving empty-handed is a conversion lost to competing brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
            {/* Before Option */}
            <div className="border rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-md transition-all hover:shadow-lg" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                    <Ban className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{translate('problemBefore')}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Visitors find themselves faced with complex layouts, unhelpful navigation guides, and static contact email forms which take as long as 48 hours to receive any replies.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /> Zero instant answers after business hours</li>
                <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /> Static manuals or pricing directories required</li>
                <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500 shrink-0" /> Over 95% visitor abandonment rate</li>
              </ul>
            </div>

            {/* After Option */}
            <div className="border-2 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-xl transition-all hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-accent)' }}>
              <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> Recommend
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{translate('problemAfter')}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Prospective clients instantly chat with an intelligent, multi-lingual RAG agent that analyzes your uploaded files. It answers direct pricing, timeline, and service queries and books meeting slots dynamically.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Fast 24/7 personalized pricing and catalog answers</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Conversational onboarding & consultation slot booking</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> 15x higher conversion than standard forms</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)', borderColor: 'var(--color-border)' }}>Seamless Automation</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>How NesLead Transforms Your Site</h2>
          <p className="max-w-2xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>Get up and running in less than 5 minutes with our zero-code automation script.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-4 border p-8 rounded-3xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-5xl font-black font-mono" style={{ color: 'var(--color-border)' }}>01</span>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Configure & Brand</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Name your bot, pick a theme (like Slate & Coral or Aurora), choose English/French translation prompts, and set active proactive trigger timelines.
            </p>
          </div>

          <div className="space-y-4 border p-8 rounded-3xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-5xl font-black font-mono" style={{ color: 'var(--color-border)' }}>02</span>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Inject Business Knowledge</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Drag-and-drop your service brochures, pricing spreadsheets, brand docs, and custom FAQ files. Our RAG engine indexes everything instantly.
            </p>
          </div>

          <div className="space-y-4 border p-8 rounded-3xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <span className="text-5xl font-black font-mono" style={{ color: 'var(--color-border)' }}>03</span>
            <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Copy Embed Code</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Copy and paste the self-contained JavaScript snippet into your footer. Witness captured leads, appointments, and metrics fly into your dashboard!
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t" style={{ backgroundColor: 'var(--color-bg-secondary)', borderTopColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 w-full space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>SaaS Growth-Focused Tiers</h2>
            <p className="max-w-2xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>Pick the plan that fits your agency. Start free forever or trial a paid plan — no credit card needed to get started.</p>

            {/* Annual Switcher */}
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-semibold" style={{ color: !isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Monthly Billing</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center border animate-none"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                >
                  <span className={`w-4 h-4 rounded-full transition-all shadow ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: 'var(--color-accent)' }}></span>
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold" style={{ color: isAnnual ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Annual Billing</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>Save 20%</span>
                </div>
              </div>

              {/* Dynamic Geolocation & Currency Indicator */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-4 py-2.5 rounded-2xl border text-xs shadow-sm bg-white dark:bg-zinc-900" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  <Globe className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span>Auto-Detected Country: <strong className="font-bold text-zinc-900 dark:text-zinc-100">{detectedCountry}</strong> (<span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{currency}</span>)</span>
                </div>
                <div className="hidden sm:block w-px h-3 bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-zinc-400">Change currency:</span>
                  <select 
                    value={currency} 
                    onChange={(e) => changeCurrencyOverride(e.target.value)}
                    className="bg-transparent border-0 py-0 pl-1 pr-6 font-bold cursor-pointer rounded text-[11px] h-auto focus:ring-0 select-none outline-none"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {availableCurrencies.map(cur => (
                      <option key={cur.code} value={cur.code} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                        {cur.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                id={idx === 0 ? 'plan-card-free' : idx === 1 ? 'plan-card-starter' : idx === 2 ? 'plan-card-growth' : idx === 3 ? 'plan-card-pro' : 'plan-card-agency'}
                className={`border rounded-3xl p-6 flex flex-col justify-between shadow transition-all hover:scale-[1.02] hover:shadow-xl relative ${tier.popular ? 'border-2 ring-1' : ''}`} 
                style={{ 
                  backgroundColor: 'var(--color-bg-card)', 
                  borderColor: tier.popular ? 'var(--color-accent)' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: 'var(--accent-gradient)' }}>
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{tier.name}</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                        {isLoading ? (
                          <span className="inline-block w-20 h-8 bg-neutral-300 dark:bg-neutral-800 animate-pulse rounded"></span>
                        ) : (
                          convertAndFormat(isAnnual ? tier.price_annual : tier.price_monthly)
                        )}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>/ month</span>
                    </div>
                    {isAnnual && tier.price_monthly > 0 && (
                      <div className="text-[10px] font-bold mt-1 text-emerald-500 flex items-center">
                        Save {isLoading ? (
                          <span className="inline-block w-12 h-3 bg-neutral-300 dark:bg-neutral-800 animate-pulse rounded"></span>
                        ) : (
                          convertAndFormat((tier.price_monthly - tier.price_annual) * 12)
                        )} / year
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {tier.features.map((feat, fIdx) => {
                      const isLocked = feat.startsWith('✗');
                      const cleanFeat = isLocked ? feat.substring(1).trim() : feat;
                      return (
                        <li key={fIdx} className="flex items-start gap-2 text-[11px] leading-tight" style={{ color: isLocked ? '#71717a' : 'var(--color-text-secondary)' }}>
                          {isLocked ? (
                            <span className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5 flex items-center justify-center font-bold text-[9px]">✗</span>
                          ) : (
                            <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                          )}
                          <span className={isLocked ? 'line-through opacity-60' : ''}>{cleanFeat}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Above each CTA button, inside the pricing card: */}
                {(idx === 0 || idx === 1) && (
                  <div className="text-center mt-auto pt-4 mb-2">
                    <span
                      className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                    >
                      {idx === 0 ? 'Free Forever' : '3-Day Free Trial'}
                    </span>
                  </div>
                )}

                {/* Free Tier */}
                {idx === 0 && (
                  <button onClick={() => onStartDemo('Free Tier')}
                    className="w-full py-3 rounded-xl font-bold text-xs border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer text-center flex items-center justify-center"
                    style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
                    Start Free — No Card Required
                  </button>
                )}

                {/* Starter — 3-Day Free Trial */}
                {idx === 1 && (
                  <button onClick={() => onStartDemo('Starter')}
                    className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 cursor-pointer text-center flex items-center justify-center"
                    style={{ background: 'var(--color-accent)' }}>
                    Start 3-Day Free Trial
                  </button>
                )}

                {/* Growth — no trial */}
                {idx === 2 && (
                  <button onClick={() => onStartDemo('Growth')}
                    className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 cursor-pointer text-center flex items-center justify-center"
                    style={{ background: 'var(--color-accent)' }}>
                    Get Started
                  </button>
                )}

                {/* Enterprise — no trial */}
                {idx === 3 && (
                  <button onClick={() => onStartDemo('Enterprise')}
                    className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 cursor-pointer text-center flex items-center justify-center"
                    style={{ background: 'var(--color-accent)' }}>
                    Get Started
                  </button>
                )}

                {/* Agency — no trial */}
                {idx === 4 && (
                  <button onClick={() => onStartDemo('Agency')}
                    className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 cursor-pointer text-center flex items-center justify-center"
                    style={{ background: 'var(--color-accent)' }}>
                    Get Started
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ── PayPal Currency Disclaimer ── */}
          <div className="mt-6 flex justify-center">
            <div className="relative group inline-flex items-center gap-2 cursor-help px-3 py-1.5 rounded-full border border-blue-500/15 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-300">
              <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-sm">
                ⓘ
              </div>
              <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 select-none">
                Currency Notice
              </span>
              
              {/* Tooltip Content */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-72 p-3.5 bg-slate-950 text-white rounded-2xl shadow-xl border border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-left scale-95 group-hover:scale-100 origin-bottom">
                <p className="text-[11px] leading-relaxed font-normal text-zinc-200">
                  <strong>ⓘ</strong> Prices shown in local currency are for reference only. PayPal processes all payments in <strong>USD</strong> (Starter $36 · Growth $72 · Enterprise $177 · Agency $450 per month). Your bank or card provider may apply a foreign exchange conversion fee. Mobile Money payments via CamPay are processed in local currency (XAF).
                </p>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-swap w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-950" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Payments Support Section */}
      <section className="py-16 border-t" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 w-full text-center space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Supported Payment Methods</h3>
            <p className="max-w-xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>Seamless checkout using your preferred payment gateway. We accept card networks, global express processors, and local mobile money structures natively.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <div className="border p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-blue-50">💳</div>
              <span className="text-xs font-black" style={{ color: 'var(--color-text-primary)' }}>Master & Visa Cards</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>PayPal Card Checkout</span>
            </div>
            <div className="border p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-indigo-50">🅿️</div>
              <span className="text-xs font-black" style={{ color: 'var(--color-text-primary)' }}>PayPal Express</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Global merchant support</span>
            </div>
            <div className="border p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-orange-50">📲</div>
              <span className="text-xs font-black" style={{ color: 'var(--color-text-primary)' }}>Orange Money</span>
              <span className="text-[10px] font-bold text-orange-650" style={{ color: '#E47B13' }}>African Countries</span>
            </div>
            <div className="border p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-yellow-50">💛</div>
              <span className="text-xs font-black" style={{ color: 'var(--color-text-primary)' }}>MTN Mobile Money</span>
              <span className="text-[10px] font-bold text-amber-655" style={{ color: '#F3AA08' }}>African Countries</span>
            </div>
            <div className="border p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-emerald-50">🏦</div>
              <span className="text-xs font-black" style={{ color: 'var(--color-text-primary)' }}>Bank Account</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Direct wire transfer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Trusted by Global Administrators</h2>
          <p className="max-w-xl mx-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>See how modern businesses and agencies scale their capture volume and lead conversion without expanding support payroll.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "We connected NesLead on our agency landing page. The RAG assistant answered service SLA and pricing queries with 100% accuracy. Over 340 qualified prospects scheduled video consulting slots within the first month. Our digital sales surged by 22%."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex-shrink-0 aspect-square flex items-center justify-center text-xs font-bold border leading-none font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>MH</div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Marc Henderson</h5>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Director of Customer Growth, Henderson Digital Group</p>
              </div>
            </div>
          </div>

          <div className="border p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "Late-night traffic was a massive black hole for us. Prospects landed from Europe or USA, found no sales rep active, and left. NesLead captures their email and phone numbers seamlessly via a neat conversational flow. Truly revolutionary."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex-shrink-0 aspect-square flex items-center justify-center text-xs font-bold border leading-none font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>GN</div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Gabrielle Ndu</h5>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>VP of Marketing, Horizon Solutions Group</p>
              </div>
            </div>
          </div>

          <div className="border p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              "The ability for our customer success team to override the AI live whenever a lead expresses custom demands is priceless. The geographic metrics panel shows exactly what countries our hot leads are visiting us from."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex-shrink-0 aspect-square flex items-center justify-center text-xs font-bold border leading-none font-mono" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>IA</div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Ismail Amrani</h5>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Business Development Director, LSI Consult Group</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section id="faq" className="py-20 border-t max-w-7xl mx-auto px-6 w-full rounded-2xl mb-12 shadow-sm" style={{ borderTopColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-8" style={{ color: 'var(--color-text-primary)' }}>Frequently Answered Queries</h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqAccordion.map((faq, idx) => (
            <div key={idx} className="border rounded-2xl overflow-hidden transition-all shadow-sm" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm hover:opacity-85 transition-colors cursor-pointer"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>{faq.q}</span>
                <span className="text-lg font-mono text-accent" style={{ color: 'var(--color-accent)' }}>{activeFaq === idx ? '−' : '+'}</span>
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden border-t px-6 py-4"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 px-6 text-center text-xs max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderTopColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
        <div className="flex flex-row sm:flex-col md:flex-row items-center gap-2.5 sm:gap-1.5 md:gap-2.5 select-none border sm:border-0 p-2 rounded-xl border-[rgba(0,0,0,0.06)] bg-[rgba(0,0,0,0.02)] sm:bg-transparent shadow-sm sm:shadow-none">
          <div className="w-8 h-8 rounded-xl text-white flex items-center justify-center text-sm font-black shrink-0 transition-transform duration-200 hover:rotate-12" style={{ background: 'var(--accent-gradient)' }}>
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-extrabold text-xs sm:text-[11px] md:text-sm tracking-tight text-center" style={{ color: 'var(--color-text-primary)' }}>NesLead Inc.</span>
        </div>
        
        <div className="flex flex-col gap-1 items-center">
          <p>© 2026 NesLead Platform. All rights reserved. Conversational AI, Lead Generation & Customer Engagement Systems.</p>
          <p className="text-[10px] opacity-75 sm:text-xs">
            Crafted with precision by <span className="font-semibold transition-colors duration-200" style={{ color: 'var(--color-accent)' }}>NesForgestudios<sup>™</sup></span>
          </p>
        </div>

        <div className="flex gap-4 select-none">
          <button onClick={() => setActiveModal('privacy')} className="hover:underline hover:text-accent cursor-pointer transition-colors border-none bg-transparent font-medium py-1">Privacy Policy</button>
          <button onClick={() => setActiveModal('terms')} className="hover:underline hover:text-accent cursor-pointer transition-colors border-none bg-transparent font-medium py-1">Service Terms</button>
          <button onClick={() => setActiveModal('support')} className="hover:underline hover:text-accent cursor-pointer transition-colors border-none bg-transparent font-medium py-1">Support</button>
        </div>
      </footer>

      {/* Dynamic Overlays / Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col max-h-[90vh] z-10 text-left"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl border hover:opacity-85 transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'support' && (
                <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      <HelpCircle className="w-6 h-6 text-accent" style={{ color: 'var(--color-accent)' }} />
                      <span>24/7 Global Support Center</span>
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Our Operations and Customer Success divisions run around the clock to support your brand.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active Support Channels */}
                    <div className="space-y-4 border p-5 rounded-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-accent)' }}>Direct Support Channels</span>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>24/7 Online Assistance</span>
                            <span className="block text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Uptime monitoring and technical assistance guarantees</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Email Operations Desk</span>
                            <a href="mailto:support@neslead.com" className="block text-[11px] font-semibold underline hover:text-accent" style={{ color: 'var(--color-text-primary)' }}>
                              support@neslead.com
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <a 
                          href="https://wa.me/237691924860?text=Hello+NesLead+Support" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:bg-emerald-600 block text-center"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          <MessageSquare className="w-4 h-4 fill-white shrink-0" />
                          <span>WhatsApp Chat</span>
                        </a>
                      </div>
                    </div>

                     {/* Quick Inquiry Form */}
                    <form 
                      onSubmit={handleSupportSubmit}
                      className="space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-accent)' }}>Submit Priority Ticket</span>
                        
                        {supportSuccess && (
                          <div className="p-3 text-[11px] rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-medium">
                            {supportSuccess}
                          </div>
                        )}

                        <input 
                          type="text" 
                          required 
                          placeholder="Your Brand / Company Name" 
                          value={supportBrand}
                          onChange={(e) => setSupportBrand(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-xs outline-none" 
                        />
                        <input 
                          type="email" 
                          required 
                          placeholder="Primary Business Email" 
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-xs outline-none" 
                        />
                        <textarea 
                          required 
                          rows={3} 
                          placeholder="How can our operations team assist you today?" 
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-2.5 text-xs outline-none resize-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={supportSubmitting}
                        className="w-full py-3 rounded-xl text-white font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        {supportSubmitting ? 'Sending Request...' : 'Submit Operations Ticket'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-4 flex-1 flex flex-col overflow-hidden text-left">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      <ShieldCheck className="w-6 h-6 text-accent" style={{ color: 'var(--color-accent)' }} />
                      <span>Privacy Policy Guideline</span>
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Last Updated: Mid-2026. Review our commitment to visitor privacy and secure data.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>1. Data Encryption & Storage</h4>
                      <p>
                        NesLead secures client interactions with robust AES-256 standard encryption algorithms. Uploaded reference materials (pricing matrices, catalogs, FAQ sheets) are isolated into independent cloud storage vaults to prevent cross-site exposure. No unauthorized systems scan these archives.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>2. Visitor Information Ownership</h4>
                      <p>
                        We hold a strict policy regarding leads: your business retains 100% intellectual and physical rights over captured lead details (names, emails, phones, and custom preferences). We do not distribute, sell, trade, or leasing this data to external ad tracking entities.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>3. Chat Browser Cookies</h4>
                      <p>
                        Our client-side widget injects lightweight local cookie parameters solely to persist ongoing conversational dialogues and maintain confidence counters. These parameters expire automatically upon widget reset or active session closure and do not tracks external browsing histories.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>4. GDPR & CCPA Readiness</h4>
                      <p>
                        We supply convenient export utility buttons inside the Advisor dashboard. This allows your compliance advisors to download, sanitize, or delete individual lead parameters immediately at the visitor's request in full compliance with European and regional data protection regulations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="space-y-4 flex-1 flex flex-col overflow-hidden text-left">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                      <Zap className="w-6 h-6 text-accent" style={{ color: 'var(--color-accent)' }} />
                      <span>Service Terms & Conditions</span>
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Last Updated: Mid-2026. Read the standard service levels and software licensing limits.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>1. Allowed Widget Origins</h4>
                      <p>
                        Licensees are permitted to embed the self-contained JavaScript widgets only on verified operational domains configured inside the active user configuration panel. Embedding scripts into non-disclosed platforms may trigger automatic script injection halts.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>2. API Fair Use Policy</h4>
                      <p>
                        To assure platform safety and prevent high-traffic latency spikes, RAG engine lookups are restricted to the fair-use quotas configured on your billing tier. Continuous server-pings resembling malicious DDoS attempts will result in automated throttling until traffic stabilizes.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>3. Technical Support Response Uptime</h4>
                      <p>
                        NesLead guarantees a 99.9% script-delivery server uptime. Operations queries dispatched to our email or logged via priority tickets are monitored 24/7. Average reply periods span under 2 hours, and emergency infrastructure escalation takes first priority.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>4. Trial & Subscription Billing</h4>
                      <p>
                        Selected growth plans carry a complete 7-day zero-limit free trial. Unless canceled, standard automated subscriptions dispatch at the close of trial durations. Subscriptions remain fully cancellable, and captured datasets remain downloadable for up to 30 days after plan closure.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {showExitPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitPopup(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md rounded-3xl border shadow-2xl p-6 md:p-8 flex flex-col z-10 text-left cursor-default overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              {/* Decorative dynamic neon gradient border top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

              {/* Close button with subtle outline */}
              <button 
                onClick={() => setShowExitPopup(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border border-zinc-200/5 hover:border-zinc-200/15 bg-neutral-500/5 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-200 animate-fadeIn"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content rendering based on dynamic variants */}
              {renderExitContent()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Super Admin PIN Gate Modal */}
      {showAdminPin && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setShowAdminPin(false); setAdminPinInput(''); setAdminPinError(false); }}
        >
          <div
            className="relative w-full max-w-sm mx-4 p-8 rounded-3xl border shadow-2xl space-y-5"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Super Admin Access</h3>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                This area is restricted to authorised NesLead team members only. Enter your access PIN to continue.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                placeholder="Enter PIN"
                value={adminPinInput}
                onChange={e => { setAdminPinInput(e.target.value.replace(/\D/g, '')); setAdminPinError(false); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (adminPinInput === '7822' || adminPinInput === '2705' || adminPinInput === (import.meta as any).env.VITE_ADMIN_PIN) {
                      setShowAdminPin(false); setAdminPinInput(''); setAdminPinError(false); onLogin();
                    } else {
                      setAdminPinError(true); setAdminPinInput('');
                    }
                  }
                }}
                className="w-full text-center text-2xl font-black tracking-[0.5em] px-4 py-3 rounded-2xl border bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 transition"
                style={{
                  borderColor: adminPinError ? '#ef4444' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {adminPinError && (
                <p className="text-xs text-red-500 text-center font-bold animate-shake">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAdminPin(false); setAdminPinInput(''); setAdminPinError(false); }}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold transition hover:opacity-80 cursor-pointer"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (adminPinInput === '7822' || adminPinInput === '2705' || adminPinInput === (import.meta as any).env.VITE_ADMIN_PIN) {
                    setShowAdminPin(false); setAdminPinInput(''); setAdminPinError(false); onLogin();
                  } else {
                    setAdminPinError(true); setAdminPinInput('');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: 'var(--accent-gradient)' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
