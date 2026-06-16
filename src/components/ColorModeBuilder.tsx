import React, { useState, useEffect } from 'react';
import { Pipette, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { ColorMode, GradientType, GradientStop, GlassPreset } from '../types';

interface ColorModeBuilderProps {
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  // Solid
  solidColor: string;
  setSolidColor: (c: string) => void;
  // Gradient
  gradientType: GradientType;
  setGradientType: (t: GradientType) => void;
  gradientAngle: number;
  setGradientAngle: (a: number) => void;
  gradientStops: GradientStop[];
  setGradientStops: (stops: GradientStop[]) => void;
  // Glass
  glassPreset: GlassPreset;
  setGlassPreset: (p: GlassPreset) => void;
  glassBlur: number;
  setGlassBlur: (v: number) => void;
  glassOpacity: number;
  setGlassOpacity: (v: number) => void;
  // Apply
  onApply: () => void;
  applied: boolean;
}

export function buildGradientString(type: GradientType, angle: number, stops: GradientStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ');
  if (type === 'linear') return `linear-gradient(${angle}deg, ${stopStr})`;
  if (type === 'radial') return `radial-gradient(circle, ${stopStr})`;
  return `conic-gradient(from 0deg, ${stopStr})`;
}

export const GLASS_PRESETS: Record<GlassPreset, { label: string; bg: string; border: string; accentGradient: string; launcherGradient: string; previewStyle: React.CSSProperties }> = {
  frosted: {
    label: 'Frosted',
    bg: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.2)',
    accentGradient: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
    launcherGradient: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(200,200,255,0.15))',
    previewStyle: { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' },
  },
  dark_glass: {
    label: 'Dark Glass',
    bg: 'rgba(0,0,0,0.35)',
    border: 'rgba(255,255,255,0.08)',
    accentGradient: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(30,30,30,0.3))',
    launcherGradient: 'linear-gradient(135deg, rgba(20,20,20,0.8), rgba(60,60,60,0.5))',
    previewStyle: { background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' },
  },
  aurora_glass: {
    label: 'Aurora',
    bg: 'rgba(99,102,241,0.15)',
    border: 'rgba(168,85,247,0.3)',
    accentGradient: 'linear-gradient(135deg, rgba(99,102,241,0.6), rgba(168,85,247,0.4))',
    launcherGradient: 'linear-gradient(135deg, #6366F1, #A855F7)',
    previewStyle: { background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(168,85,247,0.3)' },
  },
  smoke: {
    label: 'Smoke',
    bg: 'rgba(120,120,120,0.18)',
    border: 'rgba(255,255,255,0.15)',
    accentGradient: 'linear-gradient(135deg, rgba(120,120,120,0.4), rgba(80,80,80,0.2))',
    launcherGradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
    previewStyle: { background: 'rgba(120,120,120,0.18)', backdropFilter: 'blur(10px) saturate(1.3)', border: '1px solid rgba(255,255,255,0.15)' },
  },
  crystal: {
    label: 'Crystal',
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.35)',
    accentGradient: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(200,220,255,0.1))',
    launcherGradient: 'linear-gradient(135deg, rgba(200,210,255,0.5), rgba(255,255,255,0.3))',
    previewStyle: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px) brightness(1.1)', border: '1px solid rgba(255,255,255,0.35)' },
  },
  neon_glass: {
    label: 'Neon Glass',
    bg: 'rgba(0,0,0,0.4)',
    border: 'var(--color-accent)',
    accentGradient: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(10,10,30,0.4))',
    launcherGradient: 'linear-gradient(135deg, var(--color-accent), transparent)',
    previewStyle: { background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(14px)', border: '1px solid var(--color-accent)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
  },
};

const GRADIENT_PRESETS: { label: string; stops: GradientStop[]; type: GradientType; angle: number }[] = [
  { label: 'Indigo Sky',     type: 'linear', angle: 135, stops: [{ color: '#6366F1', position: 0 }, { color: '#38BDF8', position: 100 }] },
  { label: 'Sunset Blaze',   type: 'linear', angle: 135, stops: [{ color: '#F97316', position: 0 }, { color: '#EC4899', position: 100 }] },
  { label: 'Ocean Deep',     type: 'linear', angle: 180, stops: [{ color: '#06B6D4', position: 0 }, { color: '#3B82F6', position: 50 }, { color: '#6366F1', position: 100 }] },
  { label: 'Aurora Night',   type: 'linear', angle: 135, stops: [{ color: '#6366F1', position: 0 }, { color: '#A855F7', position: 50 }, { color: '#EC4899', position: 100 }] },
  { label: 'Rose Gold',      type: 'linear', angle: 135, stops: [{ color: '#F43F5E', position: 0 }, { color: '#FB923C', position: 100 }] },
  { label: 'Cyber Neon',     type: 'linear', angle: 90,  stops: [{ color: '#FF007F', position: 0 }, { color: '#7B2CBF', position: 50 }, { color: '#3F37C9', position: 100 }] },
  { label: 'Forest Mist',    type: 'linear', angle: 135, stops: [{ color: '#059669', position: 0 }, { color: '#34D399', position: 100 }] },
  { label: 'Coral Bloom',    type: 'linear', angle: 135, stops: [{ color: '#FF5C3A', position: 0 }, { color: '#FF8A65', position: 100 }] },
  { label: 'Midnight Chrome',type: 'linear', angle: 135, stops: [{ color: '#1F2937', position: 0 }, { color: '#6B7280', position: 100 }] },
  { label: 'Golden Hour',    type: 'linear', angle: 135, stops: [{ color: '#F59E0B', position: 0 }, { color: '#FBBF24', position: 50 }, { color: '#FDE68A', position: 100 }] },
  { label: 'Arctic Frost',   type: 'radial',  angle: 0,   stops: [{ color: '#E0F2FE', position: 0 }, { color: '#7DD3FC', position: 50 }, { color: '#38BDF8', position: 100 }] },
  { label: 'Lavender Dream', type: 'linear', angle: 135, stops: [{ color: '#C084FC', position: 0 }, { color: '#818CF8', position: 100 }] },
];

const QUICK_COLORS = ['#6366F1', '#A855F7', '#EC4899', '#06B6D4', '#059669', '#F97316', '#EF4444', '#FAFAFA'];

export function ColorModeBuilder({
  colorMode,
  setColorMode,
  solidColor,
  setSolidColor,
  gradientType,
  setGradientType,
  gradientAngle,
  setGradientAngle,
  gradientStops,
  setGradientStops,
  glassPreset,
  setGlassPreset,
  glassBlur,
  setGlassBlur,
  glassOpacity,
  setGlassOpacity,
  onApply,
  applied,
}: ColorModeBuilderProps) {
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

  useEffect(() => {
    setIsEyeDropperSupported('EyeDropper' in window);
  }, []);

  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setSolidColor(result.sRGBHex.toUpperCase());
        }
      } catch (e) {
        console.warn('EyeDropper cancelled or failed', e);
      }
    }
  };

  const addStop = () => {
    if (gradientStops.length >= 6) return;
    const sorted = [...gradientStops].sort((a, b) => a.position - b.position);
    let maxGap = -1;
    let insertIdx = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        insertIdx = i;
      }
    }

    const stopA = sorted[insertIdx];
    const stopB = sorted[insertIdx + 1];
    const newPosition = Math.round((stopA.position + stopB.position) / 2);

    let newColor = '#6366F1';
    try {
      const parseHex = (hex: string) => {
        const h = hex.replace('#', '');
        return {
          r: parseInt(h.substring(0, 2), 16),
          g: parseInt(h.substring(2, 4), 16),
          b: parseInt(h.substring(4, 6), 16)
        };
      };
      const cA = parseHex(stopA.color);
      const cB = parseHex(stopB.color);
      const avgR = Math.round((cA.r + cB.r) / 2).toString(16).padStart(2, '0');
      const avgG = Math.round((cA.g + cB.g) / 2).toString(16).padStart(2, '0');
      const avgB = Math.round((cA.b + cB.b) / 2).toString(16).padStart(2, '0');
      newColor = `#${avgR}${avgG}${avgB}`.toUpperCase();
    } catch (e) {
      newColor = stopA.color;
    }

    const nextStops = [...gradientStops, { color: newColor, position: newPosition }];
    setGradientStops(nextStops.sort((a, b) => a.position - b.position));
  };

  const removeStop = (index: number) => {
    if (gradientStops.length <= 2) return;
    const copy = [...gradientStops];
    copy.splice(index, 1);
    setGradientStops(copy);
  };

  const updateStopColor = (index: number, color: string) => {
    const copy = [...gradientStops];
    copy[index] = { ...copy[index], color: color.toUpperCase() };
    setGradientStops(copy);
  };

  const updateStopPosition = (index: number, position: number) => {
    const copy = [...gradientStops];
    const clampedPos = Math.max(0, Math.min(100, position));
    copy[index] = { ...copy[index], position: clampedPos };
    setGradientStops(copy);
  };

  const loadGradientPreset = (preset: typeof GRADIENT_PRESETS[0]) => {
    setGradientType(preset.type);
    setGradientAngle(preset.angle);
    setGradientStops(preset.stops);
  };

  const activeGradString = buildGradientString(gradientType, gradientAngle, gradientStops);

  return (
    <div
      className="border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">🎨</span>
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
            Custom Accent Override
          </h3>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-accent)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
          Live Preview ⚡
        </div>
      </div>

      {/* Mode Select Tabs */}
      <div className="flex p-1 rounded-xl bg-opacity-20 gap-1 w-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {(['solid', 'gradient', 'glass'] as ColorMode[]).map((m) => {
          const isActive = colorMode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setColorMode(m)}
              className="flex-1 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
              style={
                isActive
                  ? {
                      background: 'var(--accent-gradient)',
                      color: '#ffffff',
                      boxShadow: 'var(--accent-shadow)',
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--color-text-secondary)',
                    }
              }
            >
              {m === 'solid' && 'Solid'}
              {m === 'gradient' && 'Gradient ✨'}
              {m === 'glass' && 'Glass 🔮'}
            </button>
          );
        })}
      </div>

      {/* Solid Panel */}
      {colorMode === 'solid' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Color Swatch Wrapper */}
            <div
              className="relative w-10 h-10 rounded-xl border shrink-0 transition shadow-inner cursor-pointer"
              style={{ backgroundColor: solidColor, borderColor: 'var(--color-border)' }}
            >
              <input
                type="color"
                value={solidColor.startsWith('#') && solidColor.length === 7 ? solidColor : '#6366F1'}
                onChange={(e) => setSolidColor(e.target.value.toUpperCase())}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </div>

            {/* Hex text input */}
            <input
              type="text"
              maxLength={7}
              placeholder="#6366F1"
              value={solidColor}
              onChange={(e) => {
                let val = e.target.value.trim();
                if (val.length > 0 && !val.startsWith('#')) {
                  val = '#' + val;
                }
                setSolidColor(val.toUpperCase());
              }}
              onBlur={() => {
                if (!/^#[0-9A-Fa-f]{6}$/.test(solidColor)) {
                  setSolidColor('#6366F1');
                }
              }}
              className="flex-1 min-w-[100px] border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[var(--color-accent)] font-mono font-semibold"
              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            />

            {/* Eyedropper API */}
            {isEyeDropperSupported && (
              <button
                type="button"
                onClick={handleEyeDropper}
                className="p-2 sm:p-2.5 rounded-xl border transition hover:opacity-85 cursor-pointer shrink-0"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                title="Use EyeDropper tool"
              >
                <Pipette className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick pick swatches */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Quick Picks
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_COLORS.map((col) => {
                const isActive = solidColor.toUpperCase() === col.toUpperCase();
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      setSolidColor(col);
                      setSolidColor(col);
                    }}
                    className="w-7 h-7 rounded-lg border relative transition transform hover:scale-105 cursor-pointer shadow-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: col, borderColor: 'var(--color-border)' }}
                  >
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shadow"
                        style={{ backgroundColor: col === '#FAFAFA' ? '#111827' : '#FFFFFF' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gradient Panel */}
      {colorMode === 'gradient' && (
        <div className="space-y-4 pt-1">
          {/* Step 1: Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            {(['linear', 'radial', 'conic'] as GradientType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setGradientType(t)}
                className="py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold uppercase tracking-wide transition cursor-pointer"
                style={
                  gradientType === t
                    ? {
                        backgroundColor: 'var(--color-accent)',
                        borderColor: 'var(--color-accent)',
                        color: '#ffffff',
                      }
                    : {
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }
                }
              >
                {t === 'linear' && 'Linear ↗'}
                {t === 'radial' && 'Radial ◎'}
                {t === 'conic' && 'Conic 🌀'}
              </button>
            ))}
          </div>

          {/* Step 2: Angle control for Linear */}
          {gradientType === 'linear' && (
            <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Angle
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(Math.max(0, Math.min(360, Number(e.target.value))))}
                    className="w-12 text-center text-xs font-mono font-bold bg-secondary border py-1 px-1.5 rounded-lg focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>°</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(Number(e.target.value))}
                  className="flex-1 cursor-pointer"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
              </div>

              {/* Quick Angle Buttons */}
              <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1.5 pt-1">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setGradientAngle(deg)}
                    className="py-1 px-2 text-[9px] font-mono font-bold rounded-md border transition hover:opacity-85 bg-secondary text-primary cursor-pointer shrink-0"
                    style={{
                      borderColor: gradientAngle === deg ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: gradientAngle === deg ? 'var(--color-bg-secondary)' : 'var(--color-bg-secondary)',
                      color: gradientAngle === deg ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                    }}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Real Time Gradient Preview Bar */}
          <div className="space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
            <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
              Gradient Preview
            </label>
            <div
              className="w-full h-12 rounded-xl shadow-inner border"
              style={{
                background: activeGradString,
                borderColor: 'var(--color-border)',
              }}
              title="Active Gradient Preview"
            />
          </div>

          {/* Step 4: Colour Stops Editor */}
          <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                Colour Stops
              </label>
              <button
                type="button"
                onClick={addStop}
                disabled={gradientStops.length >= 6}
                className="flex items-center gap-1 py-1 px-2 relative rounded-lg text-[9px] font-bold uppercase tracking-wider transition hover:opacity-90 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
              >
                <Plus className="w-3 h-3" />
                Add Stop
              </button>
            </div>

            {/* Stops list */}
            <div className="space-y-2.5 pt-1.5">
              {gradientStops.map((stop, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 border p-2 sm:p-0 sm:border-0 rounded-xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary) sm:bg-transparent' }}>
                  <div className="flex items-center gap-2">
                    {/* Color Swatch */}
                    <div
                      className="relative w-7 h-7 rounded-lg border shadow-inner shrink-0 cursor-pointer"
                      style={{ backgroundColor: stop.color, borderColor: 'var(--color-border)' }}
                    >
                      <input
                        type="color"
                        value={stop.color.startsWith('#') && stop.color.length === 7 ? stop.color : '#6366F1'}
                        onChange={(e) => updateStopColor(index, e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>

                    {/* Hex field */}
                    <input
                      type="text"
                      maxLength={7}
                      value={stop.color}
                      onChange={(e) => {
                        let val = e.target.value.trim();
                        if (val.length > 0 && !val.startsWith('#')) val = '#' + val;
                        updateStopColor(index, val);
                      }}
                      onBlur={() => {
                        if (!/^#[0-9A-Fa-f]{6}$/.test(stop.color)) {
                          updateStopColor(index, '#6366F1');
                        }
                      }}
                      className="w-20 text-xs font-mono font-bold border rounded-lg py-1 px-1.5 bg-secondary focus:ring-1 focus:ring-[var(--color-accent)] outline-none shrink-0"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>

                  {/* Range Slider & Number Input */}
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => updateStopPosition(index, Number(e.target.value))}
                      className="flex-1 cursor-pointer"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <div className="flex items-center gap-0.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) => updateStopPosition(index, Number(e.target.value))}
                        className="w-10 text-center text-xs font-mono font-bold bg-secondary border py-1 px-1 rounded-lg focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                      <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>%</span>
                    </div>

                    {/* Delete stop */}
                    <button
                      type="button"
                      disabled={gradientStops.length <= 2}
                      onClick={() => removeStop(index)}
                      className="p-1.5 rounded-lg border transition hover:opacity-85 text-red-500 disabled:opacity-30 cursor-pointer shrink-0"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
                      title="Remove Color Stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: Professional Presets */}
          <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
            <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
              Quick Presets
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin select-none snap-x snap-mandatory">
              {GRADIENT_PRESETS.map((preset, index) => {
                const presetGradHex = buildGradientString(preset.type, preset.angle, preset.stops);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => loadGradientPreset(preset)}
                    className="px-3.5 py-2 rounded-xl shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm hover:scale-105 transition duration-150 relative overflow-hidden cursor-pointer flex items-center justify-center border snap-center"
                    style={{
                      background: presetGradHex,
                      minWidth: '100px',
                      height: '42px',
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <span className="relative z-10 drop-shadow-sm truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={onApply}
            className="w-full py-2.5 sm:py-3 rounded-xl font-bold uppercase tracking-widest text-[#ffffff] shadow-md hover:brightness-110 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5 text-[10px]"
            style={
              applied
                ? { backgroundColor: 'var(--color-success)', background: 'var(--color-success)' }
                : { background: 'var(--accent-gradient)', boxShadow: 'var(--accent-shadow)' }
            }
          >
            {applied ? (
              <>
                <Check className="w-4 h-4" />
                ✓ Applied!
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Apply Gradient to Widget
              </>
            )}
          </button>
        </div>
      )}

      {/* Glassmorphism Panel */}
      {colorMode === 'glass' && (
        <div className="space-y-4 pt-1">
          {/* Glass Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-1">
            {Object.entries(GLASS_PRESETS).map(([presetKey, pData]) => {
              const isActive = glassPreset === presetKey;
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => setGlassPreset(presetKey as GlassPreset)}
                  className="w-full h-18 sm:h-20 rounded-xl relative overflow-hidden cursor-pointer transition p-1.5 border"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                    borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)'
                  }}
                >
                  <div
                    className="absolute inset-1.5 rounded-lg flex flex-col items-center justify-center"
                    style={pData.previewStyle}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-sm">{pData.label}</span>
                    {isActive && (
                      <span className="absolute top-1 right-1 bg-white p-0.5 rounded-full text-[var(--color-accent)] shadow">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Intensity Controls */}
          <div className="space-y-3.5 border-t pt-3.5" style={{ borderColor: 'var(--color-border)' }}>
            {/* Blur Intensity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Blur Intensity</span>
                <span className="font-mono text-xs text-primary">{glassBlur}px</span>
              </div>
              <input
                type="range"
                min={4}
                max={32}
                value={glassBlur}
                onChange={(e) => setGlassBlur(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>

            {/* Background Opacity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Background Opacity</span>
                <span className="font-mono text-xs text-primary">{glassOpacity}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={onApply}
            className="w-full py-2.5 sm:py-3 rounded-xl font-bold uppercase tracking-widest text-[#ffffff] shadow-md hover:brightness-110 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5 text-[10px]"
            style={
              applied
                ? { backgroundColor: 'var(--color-success)', background: 'var(--color-success)' }
                : { background: 'var(--accent-gradient)', boxShadow: 'var(--accent-shadow)' }
            }
          >
            {applied ? (
              <>
                <Check className="w-4 h-4" />
                ✓ Applied!
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Apply Glass Effect to Widget
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
