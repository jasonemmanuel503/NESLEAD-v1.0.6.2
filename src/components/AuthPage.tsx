import React, { useState } from 'react';
import { Mail, Phone, Lock, ArrowRight, Sparkles, X, Zap, Eye, EyeOff } from 'lucide-react';
import { isSupabaseConfigured, signUpWithEmail, signInWithEmail } from '../lib/supabase';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onSuccess: (token: string, email: string) => void;
  onCancel: () => void;
}

function getPasswordStrength(pw: string): { level: 'weak' | 'medium' | 'strong'; label: string } {
  if (pw.length < 6) return { level: 'weak', label: 'Weak' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 10, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return { level: 'strong', label: 'Strong' };
  if (score >= 2) return { level: 'medium', label: 'Medium' };
  return { level: 'weak', label: 'Weak' };
}

export default function AuthPage({ initialMode, onSuccess, onCancel }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<'form' | 'email_sent'>('form');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        if (mode === 'signup') {
          const result = await signUpWithEmail(email, password);
          if (result.needsConfirmation) {
            setSignupStep('email_sent');
            return;
          }
          // If no confirmation needed, call onSuccess
          onSuccess(result.token, result.email);
        } else {
          const result = await signInWithEmail(email, password);
          onSuccess(result.token, result.email);
        }
      } else {
        // Simulate real auth call to get a token, saving in memory
        const res = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json();
          onSuccess(data.token || 'mock_session_token', email);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.message || 'Authentication failed. Please check your credentials.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to reach the server. Please make sure the app is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (signupStep === 'email_sent') {
    return (
      <div id="auth_container" className="w-full max-w-md mx-auto p-8 rounded-3xl border shadow-2xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
        <button 
          id="auth_close_btn"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5 text-neutral-400" />
        </button>

        <div className="text-center space-y-4 py-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Confirm your email</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            We sent a verification link to <span className="font-bold text-white font-mono">{email}</span>. Please click the link inside the mail to confirm your account and sign in.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSignupStep('form');
                setMode('login');
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-white text-xs bg-indigo-500 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg"
              style={{ background: 'var(--accent-gradient, linear-gradient(135deg, #6366F1, #4F46E5))' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="auth_container" className="w-full max-w-md mx-auto p-8 rounded-3xl border shadow-2xl relative" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <button 
        id="auth_close_btn"
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <X className="w-5 h-5 text-neutral-400" />
      </button>

      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-2">
          <Zap className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-neutral-400">
          {mode === 'login' ? 'Log in to manage your NesLead workspace' : 'Get started with Horizon Admissions Officer Panel'}
        </p>
      </div>

      <form id="auth_form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="w-full pl-10 pr-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-transparent"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-transparent"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mode === 'signup' && password.length > 0 && (() => {
            const { level, label } = getPasswordStrength(password);
            const colors = { weak: '#ef4444', medium: '#f59e0b', strong: '#10b981' };
            const widths = { weak: '33%', medium: '66%', strong: '100%' };
            return (
              <div className="mt-1.5 space-y-1">
                <div className="w-full h-1 rounded-full bg-neutral-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: widths[level], backgroundColor: colors[level] }}
                  />
                </div>
                <span className="text-[10px] font-bold" style={{ color: colors[level] }}>{label}</span>
              </div>
            );
          })()}
        </div>

        <button 
          id="auth_submit_btn"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
          style={{ background: 'var(--accent-gradient, linear-gradient(135deg, #6366F1, #4F46E5))' }}
        >
          {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-neutral-400">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
        </span>
        <button 
          id="auth_toggle_mode_btn"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="font-bold text-indigo-500 hover:underline"
        >
          {mode === 'login' ? 'Sign Up' : 'Log In'}
        </button>
      </div>
    </div>
  );
}
