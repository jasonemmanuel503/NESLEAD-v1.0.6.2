import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, ThemeId, ThemeToken } from '../types';

export const THEMES: Record<ThemeId, AppTheme> = {
  slate_coral: {
    id: 'slate_coral',
    label: 'Slate & Coral',
    mode: 'light',
    tokens: {
      bg_primary: '#FAFAFA',
      bg_secondary: '#F4F4F5',
      bg_card: '#FFFFFF',
      border: '#E4E4E7',
      text_primary: '#18181B',
      text_secondary: '#71717A',
      accent: '#FF5C3A',
      accent_hover: '#E8452A',
      accent_gradient: 'linear-gradient(135deg, #FF5C3A, #FF8A65)',
      accent_shadow: 'rgba(255, 92, 58, 0.25)',
      badge_bg: '#FFF1EE',
      badge_text: '#CC3311',
      nav_active_bg: '#FFF1EE',
      nav_active_text: '#FF5C3A',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      launcher_gradient: 'linear-gradient(135deg, #FF5C3A, #FF8A65)'
    }
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    mode: 'dark',
    tokens: {
      bg_primary: '#0A0F1E',
      bg_secondary: '#111827',
      bg_card: '#141B2D',
      border: '#1F2A45',
      text_primary: '#F1F5F9',
      text_secondary: '#64748B',
      accent: '#6366F1',
      accent_hover: '#4F46E5',
      accent_gradient: 'linear-gradient(135deg, #6366F1, #38BDF8)',
      accent_shadow: 'rgba(99, 102, 241, 0.3)',
      badge_bg: '#1E1B4B',
      badge_text: '#A5B4FC',
      nav_active_bg: '#1E1B4B',
      nav_active_text: '#818CF8',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      launcher_gradient: 'linear-gradient(135deg, #6366F1, #38BDF8)'
    }
  },
  aurora: {
    id: 'aurora',
    label: 'Aurora',
    mode: 'gradient',
    tokens: {
      bg_primary: '#050B1F',
      bg_secondary: 'rgba(255,255,255,0.04)',
      bg_card: 'rgba(255,255,255,0.07)',
      border: 'rgba(255,255,255,0.09)',
      text_primary: '#FFFFFF',
      text_secondary: 'rgba(255,255,255,0.6)',
      accent: '#A855F7',
      accent_hover: '#9333EA',
      accent_gradient: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)',
      accent_shadow: 'rgba(168, 85, 247, 0.35)',
      badge_bg: 'rgba(168,85,247,0.15)',
      badge_text: '#D8B4FE',
      nav_active_bg: 'rgba(168,85,247,0.15)',
      nav_active_text: '#C084FC',
      success: '#4ADE80',
      warning: '#FCD34D',
      danger: '#FB7185',
      launcher_gradient: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)'
    }
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    mode: 'light',
    tokens: {
      bg_primary: '#F0FDF4',
      bg_secondary: '#DCFCE7',
      bg_card: '#FFFFFF',
      border: '#BBF7D0',
      text_primary: '#052E16',
      text_secondary: '#166534',
      accent: '#059669',
      accent_hover: '#047857',
      accent_gradient: 'linear-gradient(135deg, #059669, #34D399)',
      accent_shadow: 'rgba(5, 150, 105, 0.25)',
      badge_bg: '#D1FAE5',
      badge_text: '#065F46',
      nav_active_bg: '#D1FAE5',
      nav_active_text: '#059669',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      launcher_gradient: 'linear-gradient(135deg, #059669, #0D9488)'
    }
  },
  carbon: {
    id: 'carbon',
    label: 'Carbon',
    mode: 'dark',
    tokens: {
      bg_primary: '#0D0D0D',
      bg_secondary: '#161616',
      bg_card: '#1C1C1C',
      border: '#2A2A2A',
      text_primary: '#FAFAFA',
      text_secondary: '#737373',
      accent: '#FAFAFA',
      accent_hover: '#E5E5E5',
      accent_gradient: 'linear-gradient(135deg, #FAFAFA, #737373)',
      accent_shadow: 'rgba(255, 255, 255, 0.15)',
      badge_bg: '#262626',
      badge_text: '#A3A3A3',
      nav_active_bg: '#262626',
      nav_active_text: '#FAFAFA',
      success: '#22C55E',
      warning: '#EAB308',
      danger: '#EF4444',
      launcher_gradient: 'linear-gradient(135deg, #3F3F46, #71717A)'
    }
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset Glow',
    mode: 'gradient',
    tokens: {
      bg_primary: '#1A0F1A',
      bg_secondary: '#261526',
      bg_card: '#301A30',
      border: '#442344',
      text_primary: '#FFF0F5',
      text_secondary: 'rgba(255, 240, 245, 0.65)',
      accent: '#FDBA74',
      accent_hover: '#F97316',
      accent_gradient: 'linear-gradient(135deg, #F97316, #EC4899)',
      accent_shadow: 'rgba(249, 115, 22, 0.3)',
      badge_bg: '#5C1E5C',
      badge_text: '#FDBA74',
      nav_active_bg: 'rgba(249, 115, 22, 0.15)',
      nav_active_text: '#FDBA74',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      launcher_gradient: 'linear-gradient(135deg, #F97316, #EC4899)'
    }
  },
  ocean: {
    id: 'ocean',
    label: 'Deep Ocean',
    mode: 'dark',
    tokens: {
      bg_primary: '#031424',
      bg_secondary: '#052038',
      bg_card: '#092B4A',
      border: '#134370',
      text_primary: '#E0F2FE',
      text_secondary: '#7DD3FC',
      accent: '#06B6D4',
      accent_hover: '#0891B2',
      accent_gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
      accent_shadow: 'rgba(6, 182, 212, 0.3)',
      badge_bg: '#0B3A60',
      badge_text: '#22D3EE',
      nav_active_bg: 'rgba(6, 182, 212, 0.15)',
      nav_active_text: '#22D3EE',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      launcher_gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)'
    }
  },
  neon_cosmos: {
    id: 'neon_cosmos',
    label: 'Neon Cosmos',
    mode: 'gradient',
    tokens: {
      bg_primary: '#0B0114',
      bg_secondary: '#160426',
      bg_card: '#22083A',
      border: '#3D155C',
      text_primary: '#F0E6FF',
      text_secondary: '#D2B3FF',
      accent: '#FF007F',
      accent_hover: '#D2006B',
      accent_gradient: 'linear-gradient(135deg, #FF007F, #7B2CBF, #3F37C9)',
      accent_shadow: 'rgba(255, 0, 127, 0.45)',
      badge_bg: '#4C1D95',
      badge_text: '#FF80BF',
      nav_active_bg: 'rgba(255, 0, 127, 0.2)',
      nav_active_text: '#FF80BF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      launcher_gradient: 'linear-gradient(135deg, #FF007F, #7B2CBF, #3F37C9)'
    }
  },
  coral_spark: {
    id: 'coral_spark',
    label: 'Coral Sparkle',
    mode: 'gradient',
    tokens: {
      bg_primary: '#FFF8F6',
      bg_secondary: '#FFECE8',
      bg_card: '#FFFFFF',
      border: '#FFDAD3',
      text_primary: '#3F120A',
      text_secondary: '#8C564C',
      accent: '#FF4D2D',
      accent_hover: '#E02E1B',
      accent_gradient: 'linear-gradient(135deg, #FF4D2D, #FFA600)',
      accent_shadow: 'rgba(255, 77, 45, 0.35)',
      badge_bg: '#FFE8E4',
      badge_text: '#D82713',
      nav_active_bg: 'rgba(255, 77, 45, 0.1)',
      nav_active_text: '#FF4D2D',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      launcher_gradient: 'linear-gradient(135deg, #FF4D2D, #FFA600)'
    }
  }
};

interface ThemeContextType {
  activeTheme: AppTheme;
  setThemeById: (id: ThemeId) => void;
  isGlobalDarkMode: boolean;
  setGlobalDarkModeOverride: (override: boolean | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Cookie persistence helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    // 1. Try cookie
    const cookieSaved = getCookie('neslead_theme_id');
    if (cookieSaved && THEMES[cookieSaved as ThemeId]) {
      return cookieSaved as ThemeId;
    }
    // 2. Try localStorage
    const saved = localStorage.getItem('neslead_theme_id');
    if (saved && THEMES[saved as ThemeId]) {
      return saved as ThemeId;
    }
    // 3. Fallback to midnight
    return 'midnight';
  });

  const [darkModeOverride, setDarkModeOverride] = useState<boolean | null>(() => {
    const override = localStorage.getItem('neslead_dark_mode_override') || getCookie('neslead_dark_mode_override');
    if (override === 'true') return true;
    if (override === 'false') return false;
    return null;
  });

  const activeTheme = THEMES[themeId] || THEMES.midnight;

  // Determine if general appearance is dark
  const isGlobalDarkMode = darkModeOverride !== null 
    ? darkModeOverride 
    : (activeTheme.mode === 'dark' || activeTheme.mode === 'gradient');

  useEffect(() => {
    localStorage.setItem('neslead_theme_id', themeId);
    setCookie('neslead_theme_id', themeId);
  }, [themeId]);

  useEffect(() => {
    if (darkModeOverride !== null) {
      localStorage.setItem('neslead_dark_mode_override', String(darkModeOverride));
      setCookie('neslead_dark_mode_override', String(darkModeOverride));
    } else {
      localStorage.removeItem('neslead_dark_mode_override');
      // Delete cookie
      document.cookie = 'neslead_dark_mode_override=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, [darkModeOverride]);

  useEffect(() => {
    // Inject CSS variable tokens into :root standard elements
    const root = document.documentElement;
    const tokens = activeTheme.tokens;

    // Apply Tailwind colors dynamically
    root.style.setProperty('--color-bg-primary', tokens.bg_primary);
    root.style.setProperty('--color-bg-secondary', tokens.bg_secondary);
    root.style.setProperty('--color-bg-card', tokens.bg_card);
    root.style.setProperty('--color-border', tokens.border);
    root.style.setProperty('--color-text-primary', tokens.text_primary);
    root.style.setProperty('--color-text-secondary', tokens.text_secondary);
    root.style.setProperty('--color-accent', tokens.accent);
    root.style.setProperty('--color-accent-hover', tokens.accent_hover);

    // Convert hex accent to R,G,B components for rgba() usage in skins
    const hexToRgb = (hex: string): string => {
      try {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
          : '99,102,241'; // indigo fallback
      } catch (e) {
        return '99,102,241';
      }
    };
    root.style.setProperty('--color-accent-rgb', hexToRgb(tokens.accent));
    
    // Non-tailwind CSS variables
    root.style.setProperty('--accent-gradient', tokens.accent_gradient);
    root.style.setProperty('--accent-shadow', tokens.accent_shadow);
    root.style.setProperty('--badge-bg', tokens.badge_bg);
    root.style.setProperty('--badge-text', tokens.badge_text);
    root.style.setProperty('--nav-active-bg', tokens.nav_active_bg);
    root.style.setProperty('--nav-active-text', tokens.nav_active_text);
    root.style.setProperty('--launcher-gradient', tokens.launcher_gradient);

    // Apply standard dark or light class
    if (isGlobalDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [activeTheme, isGlobalDarkMode]);

  const setThemeById = (id: ThemeId) => {
    if (THEMES[id]) setThemeId(id);
  };

  const setGlobalDarkModeOverride = (override: boolean | null) => {
    setDarkModeOverride(override);
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setThemeById, isGlobalDarkMode, setGlobalDarkModeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within a ThemeProvider');
  return context;
};
