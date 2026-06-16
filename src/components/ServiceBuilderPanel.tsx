import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  X, GripVertical, Plus, Trash, Eye, EyeOff, Save, Send,
  ChevronDown, ChevronUp, ChevronRight, Type, AlignLeft, List, CheckSquare,
  Circle, Calendar, Phone, Mail, Hash, Tag, Minus, MousePointer,
  FileText, BarChart3, Wand2, Check, Copy, Code, RefreshCw, Palette,
  Lock, Upload, Maximize2, Loader2, Sparkles, Layout, Columns, LayoutGrid, Heading, TextCursor,
  Facebook, Twitter, Instagram, Linkedin, Youtube, MessageSquare, Share2, MessageCircle, Image as ImageIcon, ArrowRight,
  Square, SeparatorVertical,
  Clock, CalendarRange, MapPin, Pipette, PenTool, KeyRound, Calculator, Table,
  ListOrdered, Gauge, Globe, FileCheck, Layers, Repeat, Loader, Video, Shapes, Badge,
  Smartphone, Tablet, Monitor, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FormField, FormFieldType, Program, FormTemplate } from '../types';
import confetti from 'canvas-confetti';
import { WORLD_COUNTRIES } from '../lib/industryPersona';

// ─── EmbedCodeHelper ──────────────────────────────────────────────────────────
function EmbedCodeBlock({
  programId, programName, fieldCount, isPublished
}: { programId: string; programName: string; fieldCount: number; isPublished: boolean }) {
  const [copied, setCopied] = useState(false);
  const code = [
    `<!-- EnrollAI Form Widget — ${programName} -->`,
    `<!-- Fields: ${fieldCount} | Status: ${isPublished ? 'Published' : 'Draft'} -->`,
    `<div id="enrollai-form-${programId}"></div>`,
    `<script`,
    `  src="https://cdn.enrollai.app/widget.js"`,
    `  data-form-id="${programId}"`,
    `  data-tenant-id="{{TENANT_ID}}"`,
    `  async`,
    `></script>`,
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mt-2 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <pre className="text-[10px] font-mono p-3 overflow-x-auto leading-relaxed whitespace-pre"
        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
        {code}
      </pre>
      <div className="flex justify-end px-3 pb-2">
        <button type="button" onClick={handleCopy}
          className="text-[10px] font-bold px-3 py-1 rounded-lg cursor-pointer transition flex items-center gap-1"
          style={{ backgroundColor: copied ? '#ecfdf5' : 'var(--color-bg-secondary)', color: copied ? '#059669' : 'var(--color-accent)', borderColor: 'var(--color-border)' }}>
          {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Code</>}
        </button>
      </div>
    </div>
  );
}

// ─── Field palette items ──────────────────────────────────────────────────────
interface PaletteItem {
  type: FormFieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
  defaultLabel: string;
  category: 'basic' | 'advanced' | 'layout' | 'design';
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Basic
  { type: 'short_text',     label: 'Short Text',      icon: <Type className="w-3.5 h-3.5" />,         description: 'Single-line answer',           defaultLabel: 'Your Name',             category: 'basic' },
  { type: 'long_text',      label: 'Long Text',        icon: <AlignLeft className="w-3.5 h-3.5" />,    description: 'Multi-line textarea',          defaultLabel: 'Your Message',          category: 'basic' },
  { type: 'email',          label: 'Email',            icon: <Mail className="w-3.5 h-3.5" />,         description: 'Email address input',          defaultLabel: 'Email Address',         category: 'basic' },
  { type: 'phone',          label: 'Phone',            icon: <Phone className="w-3.5 h-3.5" />,        description: 'Phone number input',           defaultLabel: 'Phone Number',          category: 'basic' },
  { type: 'dropdown',       label: 'Dropdown',         icon: <List className="w-3.5 h-3.5" />,         description: 'Select one from a list',       defaultLabel: 'Select an Option',      category: 'basic' },
  { type: 'multi_checkbox', label: 'Checkboxes',       icon: <CheckSquare className="w-3.5 h-3.5" />,  description: 'Select multiple options',      defaultLabel: 'Choose All That Apply', category: 'basic' },
  { type: 'radio',          label: 'Radio Buttons',    icon: <Circle className="w-3.5 h-3.5" />,       description: 'Select one from buttons',      defaultLabel: 'Pick One',              category: 'basic' },
  { type: 'date',           label: 'Date Picker',      icon: <Calendar className="w-3.5 h-3.5" />,     description: 'Date selection',               defaultLabel: 'Preferred Date',        category: 'basic' },
  { type: 'number',         label: 'Number',           icon: <Hash className="w-3.5 h-3.5" />,         description: 'Numeric input',                defaultLabel: 'Quantity',              category: 'basic' },
  { type: 'password', label: 'Password', icon: <Lock className="w-3.5 h-3.5" />, description: 'Masked password input', defaultLabel: 'Password', category: 'basic' },
  // Advanced
  { type: 'file_upload',    label: 'File Upload',      icon: <FileText className="w-3.5 h-3.5" />,     description: 'Document / image upload',      defaultLabel: 'Upload Document',       category: 'advanced' },
  { type: 'scale',          label: 'Scale / Rating',   icon: <BarChart3 className="w-3.5 h-3.5" />,    description: 'Number scale (1–5 or 1–10)',   defaultLabel: 'Rate Your Experience',  category: 'advanced' },
  { type: 'price_display',  label: 'Price Display',    icon: <Tag className="w-3.5 h-3.5" />,          description: 'Read-only price label',        defaultLabel: 'Service Price',         category: 'advanced' },
  { type: 'cta_button',     label: 'CTA Button',       icon: <MousePointer className="w-3.5 h-3.5" />, description: 'Call-to-action button',        defaultLabel: 'Submit Enquiry',        category: 'advanced' },
  { type: 'time_picker',          label: 'Time Picker',          icon: <Clock className="w-3.5 h-3.5" />,         description: 'Select a standard time',                       defaultLabel: 'Appointment Time',                    category: 'advanced' },
  { type: 'date_range',           label: 'Date Range',           icon: <CalendarRange className="w-3.5 h-3.5" />,  description: 'Select start and end dates',                    defaultLabel: 'Check-in / Check-out',                 category: 'advanced' },
  { type: 'address_autocomplete', label: 'Address Search',       icon: <MapPin className="w-3.5 h-3.5" />,        description: 'Google Places search autocomplete',             defaultLabel: 'Your Address',                        category: 'advanced' },
  { type: 'color_picker',         label: 'Color Picker',         icon: <Pipette className="w-3.5 h-3.5" />,       description: 'Select a custom color swatch',                 defaultLabel: 'Pick a Color',                        category: 'advanced' },
  { type: 'signature_pad',        label: 'Signature Pad',        icon: <PenTool className="w-3.5 h-3.5" />,       description: 'Draw digital signature with pen',              defaultLabel: 'Sign Here',                           category: 'advanced' },
  { type: 'otp_input',            label: 'OTP Input',            icon: <KeyRound className="w-3.5 h-3.5" />,      description: 'One-time secure passcode input',               defaultLabel: 'Verification Code',                   category: 'advanced' },
  { type: 'hidden_field',         label: 'Hidden Field',         icon: <EyeOff className="w-3.5 h-3.5" />,        description: 'Store metadata invisible to users',             defaultLabel: '',                                    category: 'advanced' },
  { type: 'calculation_field',    label: 'Calculation Field',    icon: <Calculator className="w-3.5 h-3.5" />,    description: 'Perform math calculations on fields',          defaultLabel: 'Total Price',                         category: 'advanced' },
  { type: 'matrix_grid',          label: 'Matrix Grid',          icon: <Table className="w-3.5 h-3.5" />,         description: 'Rate multiple rows across columns',            defaultLabel: 'Rate Each Item',                      category: 'advanced' },
  { type: 'ranking_field',        label: 'Ranking Field',        icon: <ListOrdered className="w-3.5 h-3.5" />,   description: 'Drag and drop rows to rank priority',          defaultLabel: 'Rank Your Priorities',                category: 'advanced' },
  { type: 'nps_score',            label: 'NPS Score',            icon: <Gauge className="w-3.5 h-3.5" />,         description: 'Net Promoter Score 0–10 rating',               defaultLabel: 'How likely are you to recommend us?', category: 'advanced' },
  { type: 'country_selector',     label: 'Country Selector',     icon: <Globe className="w-3.5 h-3.5" />,        description: 'Select a country from list',                   defaultLabel: 'Country',                             category: 'advanced' },
  { type: 'terms_checkbox',       label: 'Terms Checkbox',       icon: <FileCheck className="w-3.5 h-3.5" />,     description: 'Checkbox to agree to terms and rules',         defaultLabel: 'I agree to the Terms & Conditions',   category: 'advanced' },
  // Layout
  { type: 'section_header', label: 'Section Header',   icon: <Type className="w-3.5 h-3.5" />,         description: 'Bold section heading',         defaultLabel: 'Section Title',         category: 'layout' },
  { type: 'page_break',     label: 'Page Break',        icon: <Minus className="w-3.5 h-3.5" />,        description: 'Multi-step page separator',    defaultLabel: 'Step 2',                category: 'layout' },
  { type: 'divider',        label: 'Divider Line',      icon: <Minus className="w-3.5 h-3.5" />,        description: 'Horizontal separator',         defaultLabel: '—',                     category: 'layout' },
  { type: 'vertical_divider', label: 'Vertical Divider', icon: <SeparatorVertical className="w-3.5 h-3.5" />, description: 'Vertical column separator', defaultLabel: 'Vertical Divider', category: 'layout' },
  { type: 'single_column_row', label: '1-Column Row',    icon: <Square className="w-3.5 h-3.5" />,       description: 'Responsive container block',   defaultLabel: 'Single Column Row',     category: 'layout' },
  { type: 'two_column_row',   label: '2-Column Row',  icon: <Columns className="w-3.5 h-3.5" />, description: 'Split row into 2 equal columns', defaultLabel: 'Two Column Row', category: 'layout' },
  { type: 'three_column_row', label: '3-Column Row',  icon: <LayoutGrid className="w-3.5 h-3.5" />, description: 'Split row into 3 equal columns', defaultLabel: 'Three Column Row', category: 'layout' },
  { type: 'form_title',       label: 'Form Title',    icon: <Heading className="w-3.5 h-3.5" />,    description: 'Large title above the form',   defaultLabel: 'Contact Us',            category: 'layout' },
  { type: 'rich_text',        label: 'Text Block',    icon: <TextCursor className="w-3.5 h-3.5" />, description: 'Styled paragraph / heading text', defaultLabel: 'Enter your text here...', category: 'layout' },
  { type: 'accordion_section',    label: 'Accordion Section',    icon: <ChevronDown className="w-3.5 h-3.5" />,   description: 'Expandable/collapsible field panel',           defaultLabel: 'Additional Details',                  category: 'layout' },
  { type: 'tab_container',        label: 'Tab Container',        icon: <Layers className="w-3.5 h-3.5" />,        description: 'Tab-selectable nested field blocks',           defaultLabel: 'More Information',                    category: 'layout' },
  { type: 'repeating_section',    label: 'Repeating Section',    icon: <Repeat className="w-3.5 h-3.5" />,        description: 'Dynamic repeating group template',             defaultLabel: 'Add Entry',                           category: 'layout' },
  { type: 'progress_bar',         label: 'Progress Bar',         icon: <Loader className="w-3.5 h-3.5" />,        description: 'Display interactive multi-step tracker',       defaultLabel: 'Step Progress',                       category: 'layout' },
  // Design
  {
    type: 'form_design_block',
    label: 'Form Design',
    icon: <Palette className="w-3.5 h-3.5" />,
    description: 'Background, logo & visual styles',
    defaultLabel: 'Form Design',
    category: 'design',
  },
  { type: 'image_canvas', label: 'Image Canvas', icon: <ImageIcon className="w-3.5 h-3.5" />, description: 'Responsive image block with resize handles', defaultLabel: 'Image Canvas', category: 'design' },
  { type: 'header_image_banner',  label: 'Header Banner',        icon: <ImageIcon className="w-3.5 h-3.5" />,     description: 'Visual image banner with header overlays',     defaultLabel: 'Header Banner',                       category: 'design' },
  { type: 'video_embed',          label: 'Video Embed',          icon: <Video className="w-3.5 h-3.5" />,         description: 'Responsive embedded YouTube/Vimeo player',     defaultLabel: 'Video',                               category: 'design' },
  { type: 'shape_framed_image',   label: 'Framed Image',         icon: <Shapes className="w-3.5 h-3.5" />,        description: 'Image displayed in geometric frame overlay',   defaultLabel: 'Framed Image',                        category: 'design' },
  { type: 'logo_mark',            label: 'Logo Mark',            icon: <Badge className="w-3.5 h-3.5" />,         description: 'Brand logo mark with action link',             defaultLabel: 'Logo',                                category: 'design' },
];

// ─── Helper: createField ──────────────────────────────────────────────────────
function createField(type: FormFieldType, defaultLabel: string): FormField {
  const base: FormField = {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: defaultLabel,
    placeholder: '',
    required: false,
    options: ['dropdown', 'multi_checkbox', 'radio'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    helpText: '',
    defaultValue: '',
    scaleMin: type === 'scale' ? 1 : undefined,
    scaleMax: type === 'scale' ? 5 : undefined,
    scaleStyle: type === 'scale' ? 'numbers' as const : undefined,
    priceMode: type === 'price_display' ? 'static' as const : undefined,
    priceCurrency: type === 'price_display' ? '$' : undefined,
    ctaBgMode: type === 'cta_button' ? 'solid' as const : undefined,
    ctaBgColor: type === 'cta_button' ? '#6366f1' : undefined,
    ctaLabel: type === 'cta_button' ? 'Submit Enquiry' : undefined,
    ctaTarget: type === 'cta_button' ? '_blank' as const : undefined,
    ctaTransitionDuration: type === 'cta_button' ? 300 : undefined,
    ctaGradientAngle: type === 'cta_button' ? 135 : undefined,
  };

  if (type === 'form_design_block') {
    return {
      ...base,
      type: 'form_design_block',
      label: 'Form Design Block',
      required: false,
    };
  }

  if (type === 'image_canvas') {
    return {
      ...base,
      type: 'image_canvas',
      imageCanvasHeight: 200,
      imageCanvasAlign: 'center',
      imageCanvasObjectFit: 'cover',
      imageCanvasBorderRadius: 0,
      imageCanvasBorderWidth: 0,
      imageCanvasBorderColor: '#e2e8f0',
      imageCanvasAlt: 'Form image',
    };
  }

  if (type === 'single_column_row') {
    return {
      ...base,
      columnFields: [[]],
      columnIds: [`col-${Date.now()}-0`],
    };
  }

  if (type === 'two_column_row') {
    return {
      ...base,
      columnFields: [[], []],
      columnIds: [
        `col-${Date.now()}-0`,
        `col-${Date.now()}-1`,
      ],
    };
  }

  if (type === 'three_column_row') {
    return {
      ...base,
      columnFields: [[], [], []],
      columnIds: [
        `col-${Date.now()}-0`,
        `col-${Date.now()}-1`,
        `col-${Date.now()}-2`,
      ],
    };
  }

  if (type === 'form_title') {
    return {
      ...base,
      titleFontSize: 28,
      titleFontWeight: 'bold',
      titleAlign: 'left' as const,
      titleColor: '',
    };
  }

  if (type === 'rich_text') {
    return {
      ...base,
      textTag: 'p' as const,
      textFontSize: 16,
      textBold: false,
      textItalic: false,
      textUnderline: false,
      textColor: '',
      textTransform: 'none' as const,
    };
  }

  if (type === 'time_picker') {
    return {
      ...base,
      timeFormat: '12h',
      timeStep: 30,
    };
  }

  if (type === 'date_range') {
    return {
      ...base,
      dateRangeStartLabel: 'Check-in',
      dateRangeEndLabel: 'Check-out',
      dateRangeMinNights: 1,
    };
  }

  if (type === 'address_autocomplete') {
    return {
      ...base,
      addressComponents: ['street', 'city', 'state', 'zip', 'country'],
    };
  }

  if (type === 'color_picker') {
    return {
      ...base,
      colorPickerDefault: '#6366f1',
      colorPickerPresets: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000', '#ffffff'],
    };
  }

  if (type === 'signature_pad') {
    return {
      ...base,
      signaturePadHeight: 150,
      signaturePadBgColor: '#ffffff',
      signaturePadPenColor: '#000000',
    };
  }

  if (type === 'otp_input') {
    return {
      ...base,
      otpLength: 6,
      otpNumericOnly: true,
    };
  }

  if (type === 'hidden_field') {
    return {
      ...base,
      hiddenFieldSource: 'static' as const,
      hiddenFieldValue: '',
    };
  }

  if (type === 'calculation_field') {
    return {
      ...base,
      calculationExpression: '',
      calculationDecimalPlaces: 2,
      calculationPrefix: '$',
      calculationSuffix: '',
    };
  }

  if (type === 'matrix_grid') {
    return {
      ...base,
      matrixRows: ['Row 1', 'Row 2'],
      matrixColumns: ['Poor', 'Average', 'Good', 'Excellent'],
      matrixInputType: 'radio' as const,
    };
  }

  if (type === 'ranking_field') {
    return {
      ...base,
      rankingOptions: ['Option A', 'Option B', 'Option C'],
    };
  }

  if (type === 'nps_score') {
    return {
      ...base,
      npsLowLabel: 'Not at all likely',
      npsHighLabel: 'Extremely likely',
      scaleMin: 0,
      scaleMax: 10,
    };
  }

  if (type === 'country_selector') {
    return {
      ...base,
      countrySelectorDefault: '',
    };
  }

  if (type === 'terms_checkbox') {
    return {
      ...base,
      termsText: 'I agree to the',
      termsLinkLabel: 'Terms & Conditions',
      termsLinkUrl: '#',
      required: true,
    };
  }

  if (type === 'accordion_section') {
    return {
      ...base,
      accordionTitle: 'Additional Details',
      accordionDefaultOpen: false,
      accordionFields: [],
    };
  }

  if (type === 'tab_container') {
    return {
      ...base,
      tabLabels: ['Tab 1', 'Tab 2'],
      tabContents: [[], []],
    };
  }

  if (type === 'repeating_section') {
    return {
      ...base,
      repeatingFieldGroup: [],
      repeatingMinEntries: 1,
      repeatingMaxEntries: 10,
      repeatingAddButtonLabel: 'Add Another',
    };
  }

  if (type === 'progress_bar') {
    return {
      ...base,
      progressBarStyle: 'bar' as const,
      progressBarColor: '#6366f1',
    };
  }

  if (type === 'header_image_banner') {
    return {
      ...base,
      bannerHeight: 240,
      bannerOverlayPosition: 'center' as const,
      bannerOverlayTextColor: '#ffffff',
      bannerOverlayBgColor: 'rgba(0,0,0,0.4)',
      bannerObjectFit: 'cover' as const,
    };
  }

  if (type === 'video_embed') {
    return {
      ...base,
      videoEmbedAspectRatio: '16:9' as const,
      videoEmbedAutoplay: false,
    };
  }

  if (type === 'shape_framed_image') {
    return {
      ...base,
      shapeFrameType: 'circle' as const,
      shapeFrameSize: 160,
      shapeFrameBorderWidth: 0,
      shapeFrameBorderColor: '#e2e8f0',
    };
  }

  if (type === 'logo_mark') {
    return {
      ...base,
      logoMarkWidth: 120,
      logoMarkPosition: 'top-left' as const,
    };
  }

  return base;
}

// ─── Helper: resolveFormBg ────────────────────────────────────────────────────
function resolveFormBg(bg?: string): string {
  if (!bg) return 'var(--color-bg-secondary)';
  if (bg.startsWith('http') || bg.startsWith('/') || bg.startsWith('data:')) return `url("${bg}") center / cover no-repeat`;
  return bg;
}

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || hex.length < 7) hex = '#000000';
  const r = parseInt(hex.slice(1,3), 16) || 0;
  const g = parseInt(hex.slice(3,5), 16) || 0;
  const b = parseInt(hex.slice(5,7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${(opacity/100).toFixed(2)})`;
}

// ─── Auto-save indicator ──────────────────────────────────────────────────────
type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === 'idle') return null;
  const config = {
    saving: { text: 'Saving...', color: '#6366f1', bg: '#eef2ff' },
    saved:  { text: '✓ Saved',   color: '#059669', bg: '#ecfdf5' },
    error:  { text: '✗ Error',   color: '#dc2626', bg: '#fef2f2' },
  }[status];
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.text}
    </motion.span>
  );
}

// ─── OptionsEditor ────────────────────────────────────────────────────────────
function OptionsEditor({ options, onChange, markDirtyAndSave }: { options: string[]; onChange: (opts: string[]) => void; markDirtyAndSave: () => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
        Options
      </label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            value={opt}
            onChange={(e) => {
              const next = [...options];
              next[i] = e.target.value;
              onChange(next);
            }}
            onBlur={markDirtyAndSave}
            className="flex-1 border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            placeholder={`Option ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => { onChange(options.filter((_, j) => j !== i)); markDirtyAndSave(); }}
            className="shrink-0 text-red-400 hover:text-red-600 transition cursor-pointer p-1"
          >
            <Trash className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => { onChange([...options, '']); markDirtyAndSave(); }}
        className="text-[10px] font-bold border border-dashed rounded-lg px-2.5 py-1.5 w-full cursor-pointer transition hover:bg-neutral-100 flex items-center justify-center gap-1"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <Plus className="w-3 h-3" /> Add Option
      </button>
    </div>
  );
}

// ─── DropZoneLine ─────────────────────────────────────────────────────────────
function DropZoneLine({ index, isActive, onDragOver, onDrop }: {
  index: number;
  isActive: boolean;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative transition-all duration-150"
      style={{ height: isActive ? '32px' : '6px' }}
    >
      {isActive && (
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 6px var(--color-accent)' }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
            style={{ backgroundColor: 'var(--color-accent)', borderColor: '#fff' }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
            style={{ backgroundColor: 'var(--color-accent)', borderColor: '#fff' }} />
        </div>
      )}
    </div>
  );
}

// ─── ColorPickerField ─────────────────────────────────────────────────────────
function ColorPickerField({ label, value, onChange, onBlur }: { label: string; value: string; onChange: (v: string) => void; onBlur?: () => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#6366f1'} onChange={(e) => { onChange(e.target.value); if (onBlur) onBlur(); }}
          className="w-8 h-8 rounded-lg cursor-pointer border p-0.5"
          style={{ borderColor: 'var(--color-border)' }} />
        <input type="text" value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          onBlur={onBlur}
          placeholder="#6366f1"
          className="flex-1 border rounded-lg px-2.5 py-1.5 outline-none font-mono text-xs"
          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} />
      </div>
    </div>
  );
}

// ─── DeviceImageUpload ────────────────────────────────────────────────────────
function DeviceImageUpload({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size should be less than 2MB");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        if (onBlur) onBlur();
      }
      setLoading(false);
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-1 font-sans">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); if (onBlur) onBlur(); }}
            className="text-[9px] text-red-500 hover:underline font-bold cursor-pointer"
          >
            Clear image
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer hover:bg-neutral-50 transition shrink-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
        >
          {loading ? 'Processing...' : value ? 'Change Device Image' : 'Upload from Device'}
        </button>
        <span className="text-[10px] truncate max-w-[120px] text-neutral-400 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {value ? (value.startsWith('data:') ? 'Device Uploaded' : 'External URL linked') : 'No image loaded'}
        </span>
      </div>
      {errorMsg && <p className="text-[9px] text-red-500 font-bold">{errorMsg}</p>}
    </div>
  );
}

// ─── FieldEditor ──────────────────────────────────────────────────────────────
// ─── Google Fonts definition ──────────────────────────────────────────────────
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Nunito', 'Source Sans 3', 'PT Sans', 'Merriweather',
  'Playfair Display', 'Lora', 'Georgia', 'DM Sans', 'Outfit',
  'Work Sans', 'Figtree', 'Plus Jakarta Sans', 'Sora',
  'Space Grotesk', 'Fraunces', 'Cormorant Garamond', 'Josefin Sans',
  'Barlow', 'Mulish', 'Karla', 'IBM Plex Sans', 'Cabin', 'Rubik',
];

const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;
  const id = `gfont-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return; // already loaded
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
};

interface FieldEditorProps {
  key?: React.Key;
  field: FormField;
  index: number;
  fields?: FormField[];
  total: number;
  totalCount?: number;
  onChange: (id: string, updated: Partial<FormField>, skipSave?: boolean) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate?: (id: string) => void;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent<any>, index: number) => void;
  onDragOver: (e: React.DragEvent<any>, index: number) => void;
  onDrop: (e: React.DragEvent<any>, index: number) => void;
  onDragEnd: () => void;
  markDirtyAndSave: () => void;
  onDesignChange?: (patch: Partial<{
    bgMode: 'solid' | 'gradient' | 'image';
    bgSolidColor: string;
    bgGradientColor1: string;
    bgGradientColor2: string;
    bgGradientAngle: number;
    bgImageUrl: string;
    formLogoUrl: string;
    formLogoPosition: 'top-left' | 'top-right' | 'top-center';
    bgSolidOpacity?: number;
    bgGradientOpacity?: number;
    bgImageOverlayColor?: string;
    bgImageOverlayOpacity?: number;
    bgGlassEnabled?: boolean;
    bgGlassBlur?: number;
    bgGlassBorderRadius?: number;
    bgGlassBorderColor?: string;
    bgGlassBorderWidth?: number;
    bgGlassColorStops?: Array<{ color: string; position: number; opacity: number }>;
    bgGlassAngle?: number;
  }>) => void;
  designState?: {
    bgMode: 'solid' | 'gradient' | 'image';
    bgSolidColor: string;
    bgGradientColor1: string;
    bgGradientColor2: string;
    bgGradientAngle: number;
    bgImageUrl: string;
    formLogoUrl: string;
    formLogoPosition: 'top-left' | 'top-right' | 'top-center';
    computedFormBg: string;
    logoUploading: boolean;
    logoUploadError: string;
    handleFormLogoUpload: (file: File) => Promise<void> | void;
    bgSolidOpacity?: number;
    bgGradientOpacity?: number;
    bgImageOverlayColor?: string;
    bgImageOverlayOpacity?: number;
    bgGlassEnabled?: boolean;
    bgGlassBlur?: number;
    bgGlassBorderRadius?: number;
    bgGlassBorderColor?: string;
    bgGlassBorderWidth?: number;
    bgGlassColorStops?: Array<{ color: string; position: number; opacity: number }>;
    bgGlassAngle?: number;
  };
}

function FieldEditor({
  field, index, total, totalCount, onChange, onDelete, onMoveUp, onMoveDown, onDuplicate,
  isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, markDirtyAndSave,
  onDesignChange, designState, fields = []
}: FieldEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [columnError, setColumnError] = useState<string | null>(null);

  const {
    bgMode = 'solid',
    bgSolidColor = '#ffffff',
    bgGradientColor1 = '#6366f1',
    bgGradientColor2 = '#38bdf8',
    bgGradientAngle = 135,
    bgImageUrl = '',
    formLogoUrl = '',
    formLogoPosition = 'top-left',
    computedFormBg = '',
    logoUploading = false,
    logoUploadError = '',
    handleFormLogoUpload = () => {},
    bgSolidOpacity = 100,
    bgGradientOpacity = 100,
    bgImageOverlayColor = '#000000',
    bgImageOverlayOpacity = 0,
    bgGlassEnabled = false,
    bgGlassBlur = 12,
    bgGlassBorderRadius = 16,
    bgGlassBorderColor = '#ffffff',
    bgGlassBorderWidth = 1,
    bgGlassColorStops = [{ color: '#6366f1', position: 0, opacity: 30 }, { color: '#8b5cf6', position: 100, opacity: 20 }],
    bgGlassAngle = 135,
  } = designState || {};

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)',
  };

  const isStructural = ['divider', 'section_header', 'page_break', 'price_display', 'cta_button', 'two_column_row', 'three_column_row', 'form_title', 'rich_text'].includes(field.type);
  const hasOptions = ['dropdown', 'multi_checkbox', 'radio'].includes(field.type);
  const hasPlaceholder = ['short_text', 'long_text', 'phone', 'email', 'number', 'password'].includes(field.type);
  const hasStyling = ['short_text', 'long_text', 'phone', 'email', 'number', 'password', 'dropdown', 'date', 'time_picker', 'date_range', 'address_autocomplete', 'color_picker', 'signature_pad', 'otp_input', 'country_selector', 'repeating_section', 'accordion_section', 'tab_container'].includes(field.type);
  
  const isColumnRow = field.type === 'single_column_row' || field.type === 'two_column_row' || field.type === 'three_column_row';
  const columnCount = field.columnFields ? field.columnFields.length : (field.type === 'three_column_row' ? 3 : field.type === 'two_column_row' ? 2 : field.type === 'single_column_row' ? 1 : 0);

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      draggable={!isEditingText}
      onMouseDown={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
          setIsEditingText(true);
        }
      }}
      onMouseUp={() => setIsEditingText(false)}
      onBlur={() => setIsEditingText(false)}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className="border rounded-xl transition-all"
      style={{
        borderColor: isDragOver ? '#818cf8' : 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: isDragOver ? '0 0 0 2px #818cf840' : 'none',
      }}
    >
      {/* Field row header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 flex-wrap sm:flex-nowrap cursor-pointer select-none"
        onClick={(e) => {
          if (isEditingText) return;
          // Don't toggle if clicking a button, input, textarea, select or handles
          const target = e.target as HTMLElement;
          const tag = target.tagName;
          if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
          if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea')) return;
          // Ignore grip dragging clicks
          if (target.closest('.cursor-grab')) return;
          
          setExpanded(v => !v);
        }}
      >
        <div className="cursor-grab active:cursor-grabbing shrink-0 text-neutral-400 hover:text-neutral-500 transition select-none">
          <GripVertical className="w-4 h-4" />
        </div>
        <span
          className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono"
          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
        >
          {field.type === 'form_design_block' ? '🎨 Design' : field.type.replace(/_/g, ' ')}
        </span>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onChange(field.id, { label: e.target.value }, true)}
          onBlur={() => markDirtyAndSave()}
          className="flex-1 min-w-0 border-0 bg-transparent outline-none text-xs font-bold font-sans"
          style={{ color: 'var(--color-text-primary)' }}
          placeholder="Field label..."
        />
        {!isStructural && field.type !== 'form_design_block' && (
          <button
            type="button"
            onClick={() => onChange(field.id, { required: !field.required })}
            className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer ${
              field.required ? 'bg-red-50 text-red-600 border-red-200' : 'border-neutral-200 text-neutral-400'
            }`}
          >
            {field.required ? 'Required' : 'Optional'}
          </button>
        )}
        <button type="button" onClick={() => setExpanded(v => !v)}
          className="shrink-0 p-1 rounded-lg cursor-pointer transition hover:bg-neutral-100"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <button type="button" disabled={index === 0} onClick={() => onMoveUp(index)}
          className="shrink-0 p-1 rounded cursor-pointer disabled:opacity-30 transition hover:bg-neutral-100 hidden sm:block"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button type="button" disabled={index === total - 1} onClick={() => onMoveDown(index)}
          className="shrink-0 p-1 rounded cursor-pointer disabled:opacity-30 transition hover:bg-neutral-100 hidden sm:block"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button type="button" onClick={() => onDelete(field.id)}
          className="shrink-0 p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>

      {(field.type === 'single_column_row' || field.type === 'two_column_row' || field.type === 'three_column_row') && (() => {
        const defaultColData = field.type === 'single_column_row' ? [[]] : field.type === 'two_column_row' ? [[], []] : [[], [], []];
        const colsArray = field.columnFields || defaultColData;
        const colLen = colsArray.length;
        const gridColsClass = colLen === 1 ? 'grid-cols-1' : colLen === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
        
        return (
          <div className="border-t p-3 bg-neutral-50/50 space-y-2 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
            {columnError && (
              <div className="text-center py-1.5 px-3 text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg animate-fade-in mb-1">
                ⚠️ {columnError}
              </div>
            )}
            <div className={`grid gap-3 ${gridColsClass}`}>
              {colsArray.map((colFields, colIdx) => {
                const colKey = field.columnIds?.[colIdx] ?? `col-${field.id}-${colIdx}`;
                
                return (
                  <div
                    key={colKey}
                    className="border-2 border-dashed rounded-xl p-2.5 space-y-2 transition bg-white"
                    style={{
                      borderColor: 'var(--color-border)',
                      height: field.columnHeights?.[colIdx] != null ? `${field.columnHeights[colIdx]}px` : 'auto',
                      minHeight: field.columnHeights?.[colIdx] != null ? undefined : '60px',
                      width: field.columnWidths?.[colIdx] || undefined,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: field.columnAlignments?.[colIdx] ?? 'stretch',
                      overflowY: field.columnHeights?.[colIdx] != null ? 'auto' : undefined,
                    }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      const type = e.dataTransfer.getData('palette-type') as FormFieldType;
                      const defaultLabel = e.dataTransfer.getData('palette-default-label');
                      if (type && type !== 'single_column_row' && type !== 'two_column_row' && type !== 'three_column_row' && type !== 'form_design_block') {
                        const newColFields = [...colsArray];
                        newColFields[colIdx] = [...(newColFields[colIdx] || []), createField(type, defaultLabel)];
                        onChange(field.id, { columnFields: newColFields });
                        markDirtyAndSave();
                      }
                    }}
                  >
                    {/* Column Header & Column Level Deletion */}
                    <div className="flex items-center justify-between border-b pb-1.5 mb-1 bg-neutral-50 px-2 py-1 rounded" style={{ borderColor: 'var(--color-border)' }}>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Column {String.fromCharCode(65 + colIdx)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (colsArray.length <= 1) {
                            setColumnError("A row must have at least 1 column.");
                            setTimeout(() => setColumnError(null), 4000);
                            return;
                          }
                          
                          const newColFields = colsArray.filter((_, idx) => idx !== colIdx);
                          
                          const fallbackIds = Array.from({ length: colsArray.length }).map((_, i) => field.columnIds?.[i] ?? `col-${field.id}-${i}`);
                          const newColIds = fallbackIds.filter((_, idx) => idx !== colIdx);
                          
                          const newColHeights = (field.columnHeights || []).filter((_, idx) => idx !== colIdx);
                          const newColWidths = (field.columnWidths || []).filter((_, idx) => idx !== colIdx);
                          const newColAlignments = (field.columnAlignments || []).filter((_, idx) => idx !== colIdx);
                          
                          onChange(field.id, {
                            columnFields: newColFields,
                            columnIds: newColIds,
                            columnHeights: newColHeights.length > 0 ? newColHeights : undefined,
                            columnWidths: newColWidths.length > 0 ? newColWidths : undefined,
                            columnAlignments: newColAlignments.length > 0 ? newColAlignments : undefined,
                          });
                          markDirtyAndSave();
                        }}
                        className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-neutral-400 transition cursor-pointer"
                        title="Delete Column"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>

                    {colFields.length === 0 && (
                      <div className="flex items-center justify-center h-full py-4">
                        <span className="text-[10px] text-center font-semibold text-neutral-400">Drop fields here</span>
                      </div>
                    )}
                    {colFields.map((cf, cfIdx) => (
                      <FieldEditor
                        key={cf.id || cfIdx}
                        field={cf}
                        index={cfIdx}
                        fields={colFields}
                        total={colFields.length}
                        totalCount={colFields.length}
                        onChange={(fieldId, updates, skipSave) => {
                          const newColFields = [...colsArray];
                          newColFields[colIdx] = newColFields[colIdx].map(f => f.id === fieldId ? { ...f, ...updates } : f);
                          onChange(field.id, { columnFields: newColFields }, skipSave);
                        }}
                        onDelete={(fieldId) => {
                          const newColFields = [...colsArray];
                          newColFields[colIdx] = newColFields[colIdx].filter(f => f.id !== fieldId);
                          onChange(field.id, { columnFields: newColFields });
                          markDirtyAndSave();
                        }}
                        onMoveUp={(idx) => {
                          if (idx === 0) return;
                          const newColFields = [...colsArray];
                          const col = [...newColFields[colIdx]];
                          [col[idx - 1], col[idx]] = [col[idx], col[idx - 1]];
                          newColFields[colIdx] = col;
                          onChange(field.id, { columnFields: newColFields });
                          markDirtyAndSave();
                        }}
                        onMoveDown={(idx) => {
                          const newColFields = [...colsArray];
                          const col = [...newColFields[colIdx]];
                          if (idx >= col.length - 1) return;
                          [col[idx], col[idx + 1]] = [col[idx + 1], col[idx]];
                          newColFields[colIdx] = col;
                          onChange(field.id, { columnFields: newColFields });
                          markDirtyAndSave();
                        }}
                        onDuplicate={(fieldId) => {
                          const newColFields = [...colsArray];
                          const srcIndex = newColFields[colIdx].findIndex(f => f.id === fieldId);
                          if (srcIndex === -1) return;
                          const src = newColFields[colIdx][srcIndex];
                          const copyLabel = src.label.endsWith(' (Copy)') ? src.label : `${src.label} (Copy)`;
                          const dup = { ...src, id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: copyLabel };
                          newColFields[colIdx].splice(srcIndex + 1, 0, dup);
                          onChange(field.id, { columnFields: newColFields });
                          markDirtyAndSave();
                        }}
                        isDragOver={false}
                        onDragStart={() => {}}
                        onDragOver={() => {}}
                        onDrop={() => {}}
                        onDragEnd={() => {}}
                        markDirtyAndSave={markDirtyAndSave}
                        onDesignChange={onDesignChange}
                        designState={designState}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {field.type === 'accordion_section' && (
        <div className="p-3 border-t bg-neutral-50/50 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-center bg-white border px-3 py-2 rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-black uppercase text-neutral-400">Accordion Nested Elements: {(field.accordionFields || []).length}</span>
            <button
              type="button"
              onClick={() => {
                const nextFields = [...(field.accordionFields || [])];
                nextFields.push(createField('short_text', 'New Text Field'));
                onChange(field.id, { accordionFields: nextFields });
                markDirtyAndSave();
              }}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              + Add Field
            </button>
          </div>
          <div
            className="min-h-[60px] h-auto border-2 border-dashed rounded-xl p-2.5 space-y-2 transition bg-white"
            style={{ borderColor: 'var(--color-border)' }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = 'var(--color-border)';
              const type = e.dataTransfer.getData('palette-type') as FormFieldType;
              const defaultLabel = e.dataTransfer.getData('palette-default-label');
              if (type && !['single_column_row', 'two_column_row', 'three_column_row', 'form_design_block', 'accordion_section', 'tab_container', 'repeating_section'].includes(type)) {
                const nextFields = [...(field.accordionFields || [])];
                nextFields.push(createField(type, defaultLabel));
                onChange(field.id, { accordionFields: nextFields });
                markDirtyAndSave();
              }
            }}
          >
            {(field.accordionFields || []).length === 0 && (
              <div className="flex items-center justify-center py-4">
                <span className="text-[10px] text-center font-semibold text-neutral-400">Drag & drop fields here to place inside the Accordion</span>
              </div>
            )}
            {(field.accordionFields || []).map((af, afIdx) => (
              <FieldEditor
                key={af.id || afIdx}
                field={af}
                index={afIdx}
                fields={field.accordionFields || []}
                total={(field.accordionFields || []).length}
                totalCount={(field.accordionFields || []).length}
                onChange={(subId, updates, skipSave) => {
                  const nextFields = (field.accordionFields || []).map(f => f.id === subId ? { ...f, ...updates } : f);
                  onChange(field.id, { accordionFields: nextFields }, skipSave);
                }}
                onDelete={(subId) => {
                  const nextFields = (field.accordionFields || []).filter(f => f.id !== subId);
                  onChange(field.id, { accordionFields: nextFields });
                  markDirtyAndSave();
                }}
                onMoveUp={(idx) => {
                  if (idx === 0) return;
                  const nextFields = [...(field.accordionFields || [])];
                  [nextFields[idx - 1], nextFields[idx]] = [nextFields[idx], nextFields[idx - 1]];
                  onChange(field.id, { accordionFields: nextFields });
                  markDirtyAndSave();
                }}
                onMoveDown={(idx) => {
                  const nextFields = [...(field.accordionFields || [])];
                  if (idx >= nextFields.length - 1) return;
                  [nextFields[idx], nextFields[idx + 1]] = [nextFields[idx + 1], nextFields[idx]];
                  onChange(field.id, { accordionFields: nextFields });
                  markDirtyAndSave();
                }}
                onDuplicate={(subId) => {
                  const nextFields = [...(field.accordionFields || [])];
                  const idx = nextFields.findIndex(f => f.id === subId);
                  if (idx === -1) return;
                  const src = nextFields[idx];
                  const copyLabel = src.label.endsWith(' (Copy)') ? src.label : `${src.label} (Copy)`;
                  const dup = { ...src, id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: copyLabel };
                  nextFields.splice(idx + 1, 0, dup);
                  onChange(field.id, { accordionFields: nextFields });
                  markDirtyAndSave();
                }}
                isDragOver={false}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDrop={() => {}}
                onDragEnd={() => {}}
                markDirtyAndSave={markDirtyAndSave}
                onDesignChange={onDesignChange}
                designState={designState}
              />
            ))}
          </div>
        </div>
      )}

      {field.type === 'tab_container' && (
        <div className="p-3 border-t bg-neutral-50/50 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex border-b overflow-x-auto gap-2" style={{ borderColor: 'var(--color-border)' }}>
            {(field.tabLabels || ['Tab 1', 'Tab 2']).map((lbl, idx) => {
              const activeIdx = field.scaleMin ?? 0;
              const isActive = activeIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(field.id, { scaleMin: idx })}
                  className="px-2.5 py-1.5 text-[10px] font-bold border-b-2 transition"
                  style={isActive
                    ? { color: 'var(--color-accent)', borderBottomColor: 'var(--color-accent)' }
                    : { color: 'var(--color-text-secondary)', borderBottomColor: 'transparent' }}
                >
                  {lbl}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center bg-white border px-3 py-2 rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-black uppercase text-neutral-400">Tab Content Elements</span>
            <button
              type="button"
              onClick={() => {
                const activeIdx = field.scaleMin ?? 0;
                const nextContents = [...(field.tabContents || [[], []])];
                while (nextContents.length <= activeIdx) nextContents.push([]);
                nextContents[activeIdx] = [...(nextContents[activeIdx] || []), createField('short_text', 'New Text Field')];
                onChange(field.id, { tabContents: nextContents });
                markDirtyAndSave();
              }}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              + Add Field to Active Tab
            </button>
          </div>

          <div
            className="min-h-[60px] h-auto border-2 border-dashed rounded-xl p-2.5 space-y-2 transition bg-white"
            style={{ borderColor: 'var(--color-border)' }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = 'var(--color-border)';
              const type = e.dataTransfer.getData('palette-type') as FormFieldType;
              const defaultLabel = e.dataTransfer.getData('palette-default-label');
              if (type && !['single_column_row', 'two_column_row', 'three_column_row', 'form_design_block', 'accordion_section', 'tab_container', 'repeating_section'].includes(type)) {
                const activeIdx = field.scaleMin ?? 0;
                const nextContents = [...(field.tabContents || [[], []])];
                while (nextContents.length <= activeIdx) nextContents.push([]);
                nextContents[activeIdx] = [...(nextContents[activeIdx] || []), createField(type, defaultLabel)];
                onChange(field.id, { tabContents: nextContents });
                markDirtyAndSave();
              }
            }}
          >
            {((field.tabContents || [[], []])[field.scaleMin ?? 0] || []).length === 0 && (
              <div className="flex items-center justify-center py-4">
                <span className="text-[10px] text-center font-semibold text-neutral-400">Drag & drop fields here to place inside the Active Tab</span>
              </div>
            )}
            {((field.tabContents || [[], []])[field.scaleMin ?? 0] || []).map((tf, tfIdx) => (
              <FieldEditor
                key={tf.id || tfIdx}
                field={tf}
                index={tfIdx}
                fields={((field.tabContents || [[], []])[field.scaleMin ?? 0] || [])}
                total={((field.tabContents || [[], []])[field.scaleMin ?? 0] || []).length}
                totalCount={((field.tabContents || [[], []])[field.scaleMin ?? 0] || []).length}
                onChange={(subId, updates, skipSave) => {
                  const activeIdx = field.scaleMin ?? 0;
                  const nextContents = [...(field.tabContents || [[], []])];
                  nextContents[activeIdx] = (nextContents[activeIdx] || []).map(f => f.id === subId ? { ...f, ...updates } : f);
                  onChange(field.id, { tabContents: nextContents }, skipSave);
                }}
                onDelete={(subId) => {
                  const activeIdx = field.scaleMin ?? 0;
                  const nextContents = [...(field.tabContents || [[], []])];
                  nextContents[activeIdx] = (nextContents[activeIdx] || []).filter(f => f.id !== subId);
                  onChange(field.id, { tabContents: nextContents });
                  markDirtyAndSave();
                }}
                onMoveUp={(idx) => {
                  if (idx === 0) return;
                  const activeIdx = field.scaleMin ?? 0;
                  const nextContents = [...(field.tabContents || [[], []])];
                  const list = [...(nextContents[activeIdx] || [])];
                  [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
                  nextContents[activeIdx] = list;
                  onChange(field.id, { tabContents: nextContents });
                  markDirtyAndSave();
                }}
                onMoveDown={(idx) => {
                  const activeIdx = field.scaleMin ?? 0;
                  const nextContents = [...(field.tabContents || [[], []])];
                  const list = [...(nextContents[activeIdx] || [])];
                  if (idx >= list.length - 1) return;
                  [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
                  nextContents[activeIdx] = list;
                  onChange(field.id, { tabContents: nextContents });
                  markDirtyAndSave();
                }}
                onDuplicate={(subId) => {
                  const activeIdx = field.scaleMin ?? 0;
                  const nextContents = [...(field.tabContents || [[], []])];
                  const list = [...(nextContents[activeIdx] || [])];
                  const idx = list.findIndex(f => f.id === subId);
                  if (idx === -1) return;
                  const src = list[idx];
                  const copyLabel = src.label.endsWith(' (Copy)') ? src.label : `${src.label} (Copy)`;
                  const dup = { ...src, id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: copyLabel };
                  list.splice(idx + 1, 0, dup);
                  nextContents[activeIdx] = list;
                  onChange(field.id, { tabContents: nextContents });
                  markDirtyAndSave();
                }}
                isDragOver={false}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDrop={() => {}}
                onDragEnd={() => {}}
                markDirtyAndSave={markDirtyAndSave}
                onDesignChange={onDesignChange}
                designState={designState}
              />
            ))}
          </div>
        </div>
      )}

      {field.type === 'repeating_section' && (
        <div className="p-3 border-t bg-neutral-50/50 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-center bg-white border px-3 py-2 rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-black uppercase text-neutral-400">Repeating Template Fields: {(field.repeatingFieldGroup || []).length}</span>
            <button
              type="button"
              onClick={() => {
                const nextGroup = [...(field.repeatingFieldGroup || [])];
                nextGroup.push(createField('short_text', 'Subfield Label'));
                onChange(field.id, { repeatingFieldGroup: nextGroup });
                markDirtyAndSave();
              }}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              + Add Subfield
            </button>
          </div>
          <div
            className="min-h-[60px] h-auto border-2 border-dashed rounded-xl p-2.5 space-y-2 transition bg-white"
            style={{ borderColor: 'var(--color-border)' }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = 'var(--color-border)';
              const type = e.dataTransfer.getData('palette-type') as FormFieldType;
              const defaultLabel = e.dataTransfer.getData('palette-default-label');
              if (type && !['single_column_row', 'two_column_row', 'three_column_row', 'form_design_block', 'accordion_section', 'tab_container', 'repeating_section'].includes(type)) {
                const nextGroup = [...(field.repeatingFieldGroup || [])];
                nextGroup.push(createField(type, defaultLabel));
                onChange(field.id, { repeatingFieldGroup: nextGroup });
                markDirtyAndSave();
              }
            }}
          >
            {(field.repeatingFieldGroup || []).length === 0 && (
              <div className="flex items-center justify-center py-4">
                <span className="text-[10px] text-center font-semibold text-neutral-400">Drag & drop fields here to configure the repeating group template</span>
              </div>
            )}
            {(field.repeatingFieldGroup || []).map((rf, rfIdx) => (
              <FieldEditor
                key={rf.id || rfIdx}
                field={rf}
                index={rfIdx}
                fields={field.repeatingFieldGroup || []}
                total={(field.repeatingFieldGroup || []).length}
                totalCount={(field.repeatingFieldGroup || []).length}
                onChange={(subId, updates, skipSave) => {
                  const nextGroup = (field.repeatingFieldGroup || []).map(f => f.id === subId ? { ...f, ...updates } : f);
                  onChange(field.id, { repeatingFieldGroup: nextGroup }, skipSave);
                }}
                onDelete={(subId) => {
                  const nextGroup = (field.repeatingFieldGroup || []).filter(f => f.id !== subId);
                  onChange(field.id, { repeatingFieldGroup: nextGroup });
                  markDirtyAndSave();
                }}
                onMoveUp={(idx) => {
                  if (idx === 0) return;
                  const nextGroup = [...(field.repeatingFieldGroup || [])];
                  [nextGroup[idx - 1], nextGroup[idx]] = [nextGroup[idx], nextGroup[idx - 1]];
                  onChange(field.id, { repeatingFieldGroup: nextGroup });
                  markDirtyAndSave();
                }}
                onMoveDown={(idx) => {
                  const nextGroup = [...(field.repeatingFieldGroup || [])];
                  if (idx >= nextGroup.length - 1) return;
                  [nextGroup[idx], nextGroup[idx + 1]] = [nextGroup[idx + 1], nextGroup[idx]];
                  onChange(field.id, { repeatingFieldGroup: nextGroup });
                  markDirtyAndSave();
                }}
                onDuplicate={(subId) => {
                  const nextGroup = [...(field.repeatingFieldGroup || [])];
                  const idx = nextGroup.findIndex(f => f.id === subId);
                  if (idx === -1) return;
                  const src = nextGroup[idx];
                  const copyLabel = src.label.endsWith(' (Copy)') ? src.label : `${src.label} (Copy)`;
                  const dup = { ...src, id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: copyLabel };
                  nextGroup.splice(idx + 1, 0, dup);
                  onChange(field.id, { repeatingFieldGroup: nextGroup });
                  markDirtyAndSave();
                }}
                isDragOver={false}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDrop={() => {}}
                onDragEnd={() => {}}
                markDirtyAndSave={markDirtyAndSave}
                onDesignChange={onDesignChange}
                designState={designState}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expanded config */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t text-xs" style={{ borderColor: 'var(--color-border)' }}>
              {isColumnRow && (
                <div className="space-y-4 pt-2 border-t mt-2" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Column Layout Settings</p>
                  
                  {Array.from({ length: columnCount }).map((_, colIdx) => {
                    const colLetter = String.fromCharCode(65 + colIdx); // A, B, C
                    const colHeight = field.columnHeights?.[colIdx];
                    const colWidth = field.columnWidths?.[colIdx] || '';
                    const colAlign = field.columnAlignments?.[colIdx] || 'stretch';

                    return (
                      <div key={colIdx} className="p-2.5 border rounded-lg space-y-3 bg-neutral-50/40 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="font-bold text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
                          Column {colLetter} Settings
                        </p>

                        {/* Height control */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Height (px):</span>
                            <span className="text-[10px] font-bold text-neutral-600">
                              {colHeight != null ? `${colHeight}px` : 'Auto'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min={10}
                              max={2000}
                              placeholder="Auto / None"
                              value={colHeight ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                const currentHeights = [...(field.columnHeights || [])];
                                while (currentHeights.length < columnCount) currentHeights.push(undefined as any);
                                currentHeights[colIdx] = val as any;
                                onChange(field.id, { columnHeights: currentHeights });
                              }}
                              onBlur={() => markDirtyAndSave()}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle}
                            />
                            {colHeight != null && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentHeights = [...(field.columnHeights || [])];
                                  while (currentHeights.length < columnCount) currentHeights.push(undefined as any);
                                  currentHeights[colIdx] = undefined as any;
                                  onChange(field.id, { columnHeights: currentHeights });
                                  markDirtyAndSave();
                                }}
                                className="px-2 py-1 border rounded-lg hover:border-red-400 hover:text-red-500 text-[10px] cursor-pointer"
                                style={{ borderColor: 'var(--color-border)' }}
                              >
                                Reset to Auto
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Alignment control */}
                        <div className="space-y-1.5">
                          <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Vertical Content Alignment:</span>
                          <div className="grid grid-cols-4 gap-1">
                            {(['start', 'center', 'end', 'stretch'] as const).map((align) => {
                              const isActive = colAlign === align;
                              return (
                                <button
                                  key={align}
                                  type="button"
                                  onClick={() => {
                                    const currentAlignments = [...(field.columnAlignments || [])];
                                    while (currentAlignments.length < columnCount) currentAlignments.push('stretch');
                                    currentAlignments[colIdx] = align;
                                    onChange(field.id, { columnAlignments: currentAlignments });
                                    markDirtyAndSave();
                                  }}
                                  className="py-1.5 border rounded-lg text-[10px] font-medium transition cursor-pointer capitalize text-center"
                                  style={isActive
                                    ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                                    : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
                                >
                                  {align}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Width control */}
                        <div className="space-y-1.5 font-sans">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Width (e.g. 50%, 200px):</span>
                            <span className="text-[10px] font-bold text-neutral-600 font-sans">
                              {colWidth || 'Equal'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Equal width"
                              value={colWidth}
                              onChange={(e) => {
                                const val = e.target.value;
                                const currentWidths = [...(field.columnWidths || [])];
                                while (currentWidths.length < columnCount) currentWidths.push('');
                                currentWidths[colIdx] = val || '';
                                onChange(field.id, { columnWidths: currentWidths });
                              }}
                              onBlur={() => markDirtyAndSave()}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle}
                            />
                            {colWidth !== '' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentWidths = [...(field.columnWidths || [])];
                                  while (currentWidths.length < columnCount) currentWidths.push('');
                                  currentWidths[colIdx] = '';
                                  onChange(field.id, { columnWidths: currentWidths });
                                  markDirtyAndSave();
                                }}
                                className="px-2 py-1 border rounded-lg hover:border-red-400 hover:text-red-500 text-[10px] cursor-pointer"
                                style={{ borderColor: 'var(--color-border)' }}
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hasPlaceholder && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Placeholder Text</label>
                  <input type="text" value={field.placeholder || ''} onChange={(e) => onChange(field.id, { placeholder: e.target.value }, true)}
                    onBlur={() => markDirtyAndSave()}
                    placeholder="e.g. Enter your answer here..." className="w-full border rounded-lg px-2.5 py-1.5 outline-none" style={inputStyle} />
                </div>
              )}

              {hasStyling && (
                <div className="space-y-3 pt-2 border-t mt-2" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Field Styling & Border Customisation</p>
                  
                  {/* Field Background Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Field Bg:</span>
                    <input type="color" value={field.fieldBgColor || '#ffffff'}
                      onChange={(e) => onChange(field.id, { fieldBgColor: e.target.value })}
                      onBlur={() => markDirtyAndSave()}
                      className="w-8 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }} />
                    <button type="button" onClick={() => { onChange(field.id, { fieldBgColor: undefined }); markDirtyAndSave(); }}
                      className="text-[9px] text-neutral-400 hover:text-neutral-600 underline cursor-pointer">
                      Reset
                    </button>
                  </div>

                  {/* Border Radius */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Radius: {field.borderRadius ?? 8}px</span>
                    <input type="range" min={0} max={24} step={1}
                      value={field.borderRadius ?? 8}
                      onChange={(e) => onChange(field.id, { borderRadius: Number(e.target.value) })}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="flex-1 h-1 accent-indigo-500 cursor-pointer" />
                  </div>
                  
                  {/* Border Width */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Width: {field.borderWidth ?? 1}px</span>
                    <input type="range" min={0} max={4} step={1}
                      value={field.borderWidth ?? 1}
                      onChange={(e) => onChange(field.id, { borderWidth: Number(e.target.value) })}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="flex-1 h-1 accent-indigo-500 cursor-pointer" />
                  </div>

                  {/* Border Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Color:</span>
                    <input type="color" value={field.borderColor || '#e5e7eb'}
                      onChange={(e) => onChange(field.id, { borderColor: e.target.value })}
                      onBlur={() => markDirtyAndSave()}
                      className="w-8 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }} />
                  </div>

                  {/* Border Sides */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Sides:</span>
                    {(['Top', 'Right', 'Bottom', 'Left'] as const).map(side => {
                      const key = `border${side}` as 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
                      const isOn = field[key] !== false;
                      return (
                        <button key={side} type="button"
                          onClick={() => { onChange(field.id, { [key]: !isOn }); markDirtyAndSave(); }}
                          className="text-[9px] px-2 py-1 rounded-md border font-bold transition cursor-pointer"
                          style={isOn
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          {side}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {hasOptions && (
                <div className="space-y-3">
                  <OptionsEditor
                    options={field.options || []}
                    onChange={(opts) => onChange(field.id, { options: opts }, true)}
                    markDirtyAndSave={markDirtyAndSave}
                  />
                  {(field.type === 'multi_checkbox' || field.type === 'radio') && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Option Layout:</span>
                      {(['vertical', 'horizontal'] as const).map(layout => (
                        <button key={layout} type="button"
                          onClick={() => { onChange(field.id, { optionLayout: layout }); markDirtyAndSave(); }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer"
                          style={field.optionLayout === layout || (!field.optionLayout && layout === 'vertical')
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          {layout === 'vertical' ? '☰ Vertical' : '⠿ Horizontal'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Form Title config */}
              {field.type === 'form_title' && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Title Styling</p>
                  
                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Font Size: {field.titleFontSize ?? 28}px</span>
                    <input type="range" min={16} max={64} step={1}
                      value={field.titleFontSize ?? 28}
                      onChange={(e) => onChange(field.id, { titleFontSize: Number(e.target.value) })}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="flex-1 h-1 accent-indigo-500 cursor-pointer" />
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Alignment:</span>
                    <div className="flex gap-1.5 flex-1 w-full">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button key={align} type="button"
                          onClick={() => { onChange(field.id, { titleAlign: align }); markDirtyAndSave(); }}
                          className="flex-1 px-2 py-1 text-[10px] font-bold border rounded-lg transition cursor-pointer capitalize"
                          style={(field.titleAlign || 'left') === align
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Color:</span>
                    <input type="color" value={field.titleColor || '#000000'}
                      onChange={(e) => onChange(field.id, { titleColor: e.target.value })}
                      onBlur={() => markDirtyAndSave()}
                      className="w-8 h-7 rounded border cursor-pointer"
                      style={{ borderColor: 'var(--color-border)' }} />
                    <button type="button" onClick={() => { onChange(field.id, { titleColor: '' }); markDirtyAndSave(); }}
                      className="px-2 py-1 text-[9px] border rounded-md cursor-pointer"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      Reset (Inherit)
                    </button>
                  </div>

                  {/* Font Weight */}
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Weight:</span>
                    <div className="flex gap-2 flex-1">
                      {(['normal', 'bold'] as const).map(weight => (
                        <button key={weight} type="button"
                          onClick={() => { onChange(field.id, { titleFontWeight: weight }); markDirtyAndSave(); }}
                          className="flex-1 px-2.5 py-1 text-[10px] font-bold border rounded-lg transition cursor-pointer capitalize"
                          style={(field.titleFontWeight || 'bold') === weight
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          {weight}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FEATURE 5 — Rich Text / Heading / Header Text Style panel */}
              {(field.type === 'rich_text' || field.type === 'section_header' || field.type === 'form_title') && (
                <div className="space-y-3 pt-2 border-t font-sans" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Text Style</p>

                  {/* Tag selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Tag / Element:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['h1','h2','h3','h4','h5','h6','p','span'] as const).map(tag => (
                        <button key={tag} type="button"
                          onClick={() => { onChange(field.id, { textTag: tag }); markDirtyAndSave(); }}
                          className="text-[9px] px-2 py-1 rounded-md border font-sans font-bold transition cursor-pointer"
                          style={(field.textTag || (field.type === 'section_header' ? 'h4' : field.type === 'form_title' ? 'span' : 'p')) === tag
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }}>
                          {tag.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bold / Italic / Underline */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Styling:</span>
                    <div className="flex items-center gap-2">
                      {([
                        { key: 'textBold', label: 'B' },
                        { key: 'textItalic', label: 'I' },
                        { key: 'textUnderline', label: 'U' },
                      ] as const).map(({ key, label }) => (
                        <button key={key} type="button"
                          onClick={() => { onChange(field.id, { [key]: !field[key as keyof FormField] }); markDirtyAndSave(); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition cursor-pointer font-sans"
                          style={field[key as keyof FormField]
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title Size (only for section_header and form_title which have separate titleFontSize prop) */}
                  {(field.type === 'form_title' || field.type === 'section_header') && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Title Size:</span>
                        <span className="text-[10px] font-bold">{field.titleFontSize ?? (field.type === 'form_title' ? 28 : 18)}px</span>
                      </div>
                      <input type="range" min={12} max={72} step={1}
                        value={field.titleFontSize ?? (field.type === 'form_title' ? 28 : 18)}
                        onChange={(e) => onChange(field.id, { titleFontSize: Number(e.target.value) })}
                        onMouseUp={() => markDirtyAndSave()}
                        onTouchEnd={() => markDirtyAndSave()}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200"
                        style={{ accentColor: 'var(--color-accent)' }} />
                    </div>
                  )}

                  {/* Font Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        {(field.type === 'form_title' || field.type === 'section_header') ? 'Text Size:' : 'Size:'}
                      </span>
                      <span className="text-[10px] font-bold">{field.textFontSize || 16}px</span>
                    </div>
                    <input type="range" min={10} max={72} step={1}
                      value={field.textFontSize || 16}
                      onChange={(e) => onChange(field.id, { textFontSize: Number(e.target.value) })}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200"
                      style={{ accentColor: 'var(--color-accent)' }} />
                  </div>

                  {/* Text Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-20 shrink-0 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Color:</span>
                    <input type="color" value={field.textColor || '#000000'}
                      onChange={(e) => onChange(field.id, { textColor: e.target.value })}
                      onBlur={() => markDirtyAndSave()}
                      className="w-8 h-7 rounded border cursor-pointer"
                      style={{ borderColor: 'var(--color-border)' }} />
                    <button type="button" onClick={() => { onChange(field.id, { textColor: '' }); markDirtyAndSave(); }}
                      className="px-2 py-1 text-[9px] border rounded-md cursor-pointer font-bold"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      Reset (Inherit)
                    </button>
                  </div>

                  {/* Text Transform */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Transform:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['none','uppercase','lowercase','capitalize'] as const).map(t => (
                        <button key={t} type="button"
                          onClick={() => { onChange(field.id, { textTransform: t }); markDirtyAndSave(); }}
                          className="text-[9px] px-2 py-1 rounded-md border font-bold transition cursor-pointer font-sans capitalize"
                          style={(field.textTransform || 'none') === t
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scale / Rating config */}
              {field.type === 'scale' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Display Style</label>
                    <div className="flex gap-2">
                      {(['numbers', 'stars', 'emoji'] as const).map(style => (
                        <button key={style} type="button"
                          onClick={() => onChange(field.id, { scaleStyle: style })}
                          className="flex-1 text-[10px] font-bold py-1.5 rounded-lg border capitalize transition cursor-pointer font-sans"
                          style={{
                            backgroundColor: (field.scaleStyle || 'numbers') === style ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                            color: (field.scaleStyle || 'numbers') === style ? '#fff' : 'var(--color-text-secondary)',
                            borderColor: 'var(--color-border)',
                          }}>
                          {style === 'stars' ? '⭐ Stars' : style === 'emoji' ? '😊 Emoji' : '# Numbers'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 font-sans">
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Min</label>
                      <input type="number" value={field.scaleMin ?? 1} onChange={(e) => onChange(field.id, { scaleMin: Number(e.target.value) }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs text-center" style={inputStyle} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Max</label>
                      <input type="number" value={field.scaleMax ?? 5} onChange={(e) => onChange(field.id, { scaleMax: Number(e.target.value) }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs text-center" style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}

              {/* File upload config */}
              {field.type === 'file_upload' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Accepted File Types</label>
                    <input type="text" value={field.acceptedFileTypes || ''} onChange={(e) => onChange(field.id, { acceptedFileTypes: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder=".pdf,.jpg,.png" className="w-full border rounded-lg px-2.5 py-1.5 outline-none" style={inputStyle} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Max File Size (MB)</label>
                    <input type="number" value={field.maxFileSizeMB || 10} onChange={(e) => onChange(field.id, { maxFileSizeMB: Number(e.target.value) }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs" style={inputStyle} />
                  </div>
                </div>
              )}

              {/* Price display config */}
              {field.type === 'price_display' && (
                <div className="space-y-3">
                  <div className="space-y-1 font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Display Mode</label>
                    <div className="flex gap-2">
                      {(['static', 'slider', 'manual'] as const).map(mode => (
                        <button key={mode} type="button"
                          onClick={() => onChange(field.id, { priceMode: mode })}
                          className="flex-1 text-[10px] font-bold py-1.5 rounded-lg border capitalize transition cursor-pointer"
                          style={{
                            backgroundColor: (field.priceMode || 'static') === mode ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                            color: (field.priceMode || 'static') === mode ? '#fff' : 'var(--color-text-secondary)',
                            borderColor: 'var(--color-border)',
                          }}>
                          {mode === 'static' ? '📌 Static' : mode === 'slider' ? '↔ Slider' : '✏️ Manual'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(!field.priceMode || field.priceMode === 'static') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Price to Display</label>
                      <input type="text" value={field.defaultValue || ''} onChange={(e) => onChange(field.id, { defaultValue: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        placeholder="e.g. $500 / session" className="w-full border rounded-lg px-2.5 py-1.5 outline-none" style={inputStyle} />
                    </div>
                  )}
                  {field.priceMode === 'slider' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Min Price</label>
                        <input type="number" value={field.priceSliderMin ?? 0} onChange={(e) => onChange(field.id, { priceSliderMin: Number(e.target.value) }, true)}
                          onBlur={() => markDirtyAndSave()}
                          className="w-full border rounded-lg px-2.5 py-1.5 outline-none" style={inputStyle} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Max Price</label>
                        <input type="number" value={field.priceSliderMax ?? 1000} onChange={(e) => onChange(field.id, { priceSliderMax: Number(e.target.value) }, true)}
                          onBlur={() => markDirtyAndSave()}
                          className="w-full border rounded-lg px-2.5 py-1.5 outline-none" style={inputStyle} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Currency Symbol</label>
                        <input type="text" value={field.priceCurrency || '$'} onChange={(e) => onChange(field.id, { priceCurrency: e.target.value }, true)}
                          onBlur={() => markDirtyAndSave()}
                          placeholder="$" className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs" style={inputStyle} />
                      </div>
                    </div>
                  )}
                  {field.priceMode === 'manual' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Currency Prefix</label>
                      <input type="text" value={field.priceCurrency || '$'} onChange={(e) => onChange(field.id, { priceCurrency: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        placeholder="$" className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs" style={inputStyle} />
                    </div>
                  )}
                </div>
              )}

              {/* CTA button config */}
              {field.type === 'cta_button' && (
                <div className="space-y-4 font-sans">
                  {/* FEATURE 7B — Social Media Group Toggle */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id={`ctaIsSocialGroup-${field.id}`}
                      checked={field.ctaIsSocialGroup || false}
                      onChange={(e) => {
                        onChange(field.id, { ctaIsSocialGroup: e.target.checked });
                        markDirtyAndSave();
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                    />
                    <label htmlFor={`ctaIsSocialGroup-${field.id}`} className="text-xs font-bold cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                      Use as Social Media Icons group
                    </label>
                  </div>

                  {!field.ctaIsSocialGroup ? (
                    <>
                      {/* Button Label — ALWAYS VISIBLE */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                          Button Label (Call-to-Action Text) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.ctaLabel || ''}
                          onChange={(e) => onChange(field.id, { ctaLabel: e.target.value }, true)}
                          onBlur={() => markDirtyAndSave()}
                          placeholder="e.g. Apply Now, Get Started, Book a Call"
                          className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-bold"
                          style={inputStyle}
                        />
                      </div>

                      {/* Button URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                          Button Destination URL
                        </label>
                        <input
                          type="url"
                          value={field.ctaUrl || ''}
                          onChange={(e) => onChange(field.id, { ctaUrl: e.target.value }, true)}
                          onBlur={() => markDirtyAndSave()}
                          placeholder="https://yourdomain.com/apply"
                          className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs"
                          style={inputStyle}
                        />
                      </div>

                      {/* Link Target */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                          Open Link In
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {([
                            { value: '_blank', label: '🔗 New Tab' },
                            { value: '_new',   label: '🪟 New Window' },
                            { value: '_self',  label: '↩ Same Page' },
                          ] as const).map(({ value, label }) => (
                            <button key={value} type="button"
                              onClick={() => { onChange(field.id, { ctaTarget: value }); markDirtyAndSave(); }}
                              className="px-2.5 py-1 text-[9px] font-bold border rounded-lg transition cursor-pointer"
                              style={{
                                backgroundColor: (field.ctaTarget || '_blank') === value ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                                color: (field.ctaTarget || '_blank') === value ? '#fff' : 'var(--color-text-secondary)',
                                borderColor: 'var(--color-border)',
                              }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* FEATURE 7A — Corner Radius Control */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                            Corner Radius: {field.ctaBorderRadius ?? 8}px
                          </label>
                        </div>
                        <input type="range" min={0} max={32} step={1}
                          value={field.ctaBorderRadius ?? 8}
                          onChange={(e) => { onChange(field.id, { ctaBorderRadius: Number(e.target.value) }, true); }}
                          onMouseUp={() => markDirtyAndSave()}
                          onTouchEnd={() => markDirtyAndSave()}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200"
                          style={{ accentColor: 'var(--color-accent)' }} />
                      </div>

                      {/* FEATURE 7B — Button Icon Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                          Button Icon (Optional)
                        </label>
                        <select
                          value={field.ctaIcon || ''}
                          onChange={(e) => { onChange(field.id, { ctaIcon: e.target.value }); markDirtyAndSave(); }}
                          className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold cursor-pointer"
                          style={inputStyle}
                        >
                          <option value="">None (Text Only)</option>
                          <option value="facebook">📘 Facebook</option>
                          <option value="twitter">🐦 Twitter / X</option>
                          <option value="instagram">📸 Instagram</option>
                          <option value="linkedin">💼 LinkedIn</option>
                          <option value="youtube">📺 YouTube</option>
                          <option value="whatsapp">💬 WhatsApp</option>
                        </select>
                      </div>

                      {/* Background Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Background Type</label>
                        <div className="flex gap-2 flex-wrap">
                          {(['solid', 'linear', 'radial', 'conic'] as const).map(mode => (
                            <button key={mode} type="button"
                              onClick={() => { onChange(field.id, { ctaBgMode: mode }); markDirtyAndSave(); }}
                              className="px-2.5 py-1 text-[9px] font-bold border rounded-lg capitalize transition cursor-pointer"
                              style={{
                                backgroundColor: (field.ctaBgMode || 'solid') === mode ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                                color: (field.ctaBgMode || 'solid') === mode ? '#fff' : 'var(--color-text-secondary)',
                                borderColor: 'var(--color-border)',
                              }}>
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(!field.ctaBgMode || field.ctaBgMode === 'solid') && (
                        <ColorPickerField
                          label="Button Color"
                          value={field.ctaBgColor || '#6366f1'}
                          onChange={(v) => onChange(field.id, { ctaBgColor: v }, true)}
                          onBlur={() => markDirtyAndSave()}
                        />
                      )}

                      {(field.ctaBgMode === 'linear' || field.ctaBgMode === 'radial' || field.ctaBgMode === 'conic') && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                            Gradient args (e.g. #6366f1, #a855f7)
                          </label>
                          <input type="text" value={field.ctaBgGradient || ''}
                            onChange={(e) => onChange(field.id, { ctaBgGradient: e.target.value }, true)}
                            onBlur={() => markDirtyAndSave()}
                            placeholder={`#6366f1, #a855f7`}
                            className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-mono text-[10px]"
                            style={inputStyle} />
                          <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>
                            We will wrap this expression as <code>{field.ctaBgMode}-gradient(...)</code> automatically.
                          </p>
                        </div>
                      )}

                      {field.ctaBgMode === 'linear' && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                              Gradient Angle
                            </label>
                            <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>{field.ctaGradientAngle ?? 135}°</span>
                          </div>
                          <input
                            type="range" min={0} max={360} step={5}
                            value={field.ctaGradientAngle ?? 135}
                            onChange={(e) => { onChange(field.id, { ctaGradientAngle: Number(e.target.value) }, true); }}
                            onMouseUp={() => markDirtyAndSave()}
                            onTouchEnd={() => markDirtyAndSave()}
                            className="w-full h-1.5 rounded-full cursor-pointer accent-indigo-500"
                          />
                        </div>
                      )}

                      {/* Hover Styles section */}
                      <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                          Hover Background
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {(['solid', 'linear', 'radial', 'conic'] as const).map(mode => (
                            <button key={mode} type="button"
                              onClick={() => { onChange(field.id, { ctaHoverBgMode: mode }); markDirtyAndSave(); }}
                              className="px-2.5 py-1 text-[9px] font-bold border rounded-lg capitalize transition cursor-pointer"
                              style={{
                                backgroundColor: (field.ctaHoverBgMode || 'solid') === mode ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                                color: (field.ctaHoverBgMode || 'solid') === mode ? '#fff' : 'var(--color-text-secondary)',
                                borderColor: 'var(--color-border)',
                              }}>{mode}</button>
                          ))}
                        </div>

                        {(!field.ctaHoverBgMode || field.ctaHoverBgMode === 'solid') && (
                          <ColorPickerField
                            label="Hover Color"
                            value={field.ctaHoverBgColor || '#4f46e5'}
                            onChange={(v) => onChange(field.id, { ctaHoverBgColor: v }, true)}
                            onBlur={() => markDirtyAndSave()}
                          />
                        )}

                        {(field.ctaHoverBgMode === 'linear' || field.ctaHoverBgMode === 'radial' || field.ctaHoverBgMode === 'conic') && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                              Hover Gradient args (e.g. #4f46e5, #7c3aed)
                            </label>
                            <input type="text" value={field.ctaHoverBgGradient || ''}
                              onChange={(e) => onChange(field.id, { ctaHoverBgGradient: e.target.value }, true)}
                              onBlur={() => markDirtyAndSave()}
                              placeholder="#4f46e5, #7c3aed"
                              className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-mono text-[10px]"
                              style={inputStyle} />
                          </div>
                        )}

                        {field.ctaHoverBgMode === 'linear' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Hover Angle</label>
                              <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>{field.ctaHoverGradientAngle ?? 135}°</span>
                            </div>
                            <input type="range" min={0} max={360} step={5}
                              value={field.ctaHoverGradientAngle ?? 135}
                              onChange={(e) => { onChange(field.id, { ctaHoverGradientAngle: Number(e.target.value) }, true); }}
                              onMouseUp={() => markDirtyAndSave()}
                              onTouchEnd={() => markDirtyAndSave()}
                              className="w-full h-1.5 rounded-full cursor-pointer accent-indigo-500"
                            />
                          </div>
                        )}

                        {/* Transition Duration */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Hover Transition</label>
                            <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>{field.ctaTransitionDuration ?? 300}ms</span>
                          </div>
                          <input type="range" min={100} max={1000} step={50}
                            value={field.ctaTransitionDuration ?? 300}
                            onChange={(e) => { onChange(field.id, { ctaTransitionDuration: Number(e.target.value) }, true); }}
                            onMouseUp={() => markDirtyAndSave()}
                            onTouchEnd={() => markDirtyAndSave()}
                            className="w-full h-1.5 rounded-full cursor-pointer accent-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Arrow Element */}
                      <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>→ Arrow Element</span>
                          <button type="button"
                            onClick={() => onChange(field.id, { ctaArrowEnabled: !field.ctaArrowEnabled })}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${field.ctaArrowEnabled ? 'bg-indigo-500' : 'bg-neutral-300'}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.ctaArrowEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </div>

                        {field.ctaArrowEnabled && (
                          <div className="space-y-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                            {/* Arrow background color */}
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Arrow Bg</label>
                              <input type="color" value={field.ctaArrowBgColor ?? '#ffffff'}
                                onChange={(e) => onChange(field.id, { ctaArrowBgColor: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                              <input type="text" value={field.ctaArrowBgColor ?? '#ffffff'}
                                onChange={(e) => onChange(field.id, { ctaArrowBgColor: e.target.value }, true)}
                                onBlur={() => markDirtyAndSave()}
                                className="flex-1 border rounded-lg px-2 py-1.5 outline-none text-xs font-mono" style={inputStyle} />
                            </div>

                            {/* Arrow icon color */}
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Arrow Color</label>
                              <input type="color" value={field.ctaArrowColor ?? '#6366f1'}
                                onChange={(e) => onChange(field.id, { ctaArrowColor: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                            </div>

                            {/* Arrow border radius */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Radius: {field.ctaArrowBorderRadius ?? 50}px</span>
                              <input type="range" min={0} max={50} step={1}
                                value={field.ctaArrowBorderRadius ?? 50}
                                onChange={(e) => onChange(field.id, { ctaArrowBorderRadius: Number(e.target.value) })}
                                className="flex-1 accent-indigo-500" />
                            </div>

                            {/* Arrow icon size */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Size: {field.ctaArrowSize ?? 16}px</span>
                              <input type="range" min={12} max={32} step={1}
                                value={field.ctaArrowSize ?? 16}
                                onChange={(e) => onChange(field.id, { ctaArrowSize: Number(e.target.value) })}
                                className="flex-1 accent-indigo-500" />
                            </div>

                            {/* Arrow border */}
                            <div className="flex items-center gap-2">
                              <input type="color" value={field.ctaArrowBorderColor ?? 'rgba(255,255,255,0.3)'}
                                onChange={(e) => onChange(field.id, { ctaArrowBorderColor: e.target.value })}
                                className="w-7 h-7 rounded cursor-pointer border p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Border: {field.ctaArrowBorderWidth ?? 0}px</span>
                              <input type="range" min={0} max={4} step={1}
                                value={field.ctaArrowBorderWidth ?? 0}
                                onChange={(e) => onChange(field.id, { ctaArrowBorderWidth: Number(e.target.value) })}
                                className="flex-1 accent-indigo-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {/* Layout toggle */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                          Layout Style
                        </span>
                        <div className="flex items-center gap-2">
                          {(['horizontal','vertical'] as const).map(l => (
                            <button key={l} type="button"
                              onClick={() => { onChange(field.id, { ctaSocialLayout: l }); markDirtyAndSave(); }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer"
                              style={(field.ctaSocialLayout || 'horizontal') === l
                                ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                                : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }}>
                              {l === 'horizontal' ? '⇔ Horizontal' : '⇕ Vertical'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Icon size */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                          Icon Size: {field.ctaSocialSize || 24}px
                        </span>
                        <input type="range" min={16} max={48} step={2}
                          value={field.ctaSocialSize || 24}
                          onChange={(e) => { onChange(field.id, { ctaSocialSize: Number(e.target.value) }); }}
                          onMouseUp={() => markDirtyAndSave()}
                          onTouchEnd={() => markDirtyAndSave()}
                          className="flex-1 h-1.5 rounded-full appearance-none bg-neutral-200 cursor-pointer"
                          style={{ accentColor: 'var(--color-accent)' }} />
                      </div>

                      {/* Social link entries */}
                      {(field.ctaSocialLinks || []).map((link, idx) => (
                        <div key={idx} className="border rounded-xl p-2.5 space-y-2 mt-2 animate-fade-in" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                          <div className="flex items-center justify-between">
                            <select value={link.platform}
                              onChange={(e) => {
                                const updated = [...(field.ctaSocialLinks || [])];
                                updated[idx] = { ...updated[idx], platform: e.target.value as any };
                                onChange(field.id, { ctaSocialLinks: updated });
                                markDirtyAndSave();
                              }}
                              className="text-[10px] border rounded-lg px-2 py-1 outline-none font-bold"
                              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                              {['facebook','instagram','linkedin','twitter','youtube','tiktok','whatsapp','pinterest'].map(p => (
                                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                              ))}
                            </select>
                            <button type="button" className="text-red-400 hover:text-red-600 cursor-pointer"
                              onClick={() => {
                                const updated = (field.ctaSocialLinks || []).filter((_, i) => i !== idx);
                                onChange(field.id, { ctaSocialLinks: updated });
                                markDirtyAndSave();
                              }}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input type="url" placeholder="https://..." value={link.url}
                            onChange={(e) => {
                              const updated = [...(field.ctaSocialLinks || [])];
                              updated[idx] = { ...updated[idx], url: e.target.value };
                              onChange(field.id, { ctaSocialLinks: updated });
                            }}
                            onBlur={() => markDirtyAndSave()}
                            className="w-full border rounded-lg px-2 py-1 text-[10px] outline-none font-semibold text-xs"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
                          <div className="flex items-center gap-2">
                            <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>Icon Color:</span>
                            <input type="color" value={link.color || '#6366f1'}
                              onChange={(e) => {
                                const updated = [...(field.ctaSocialLinks || [])];
                                updated[idx] = { ...updated[idx], color: e.target.value };
                                onChange(field.id, { ctaSocialLinks: updated });
                              }}
                              onBlur={() => markDirtyAndSave()}
                              className="w-7 h-6 rounded border cursor-pointer"
                              style={{ borderColor: 'var(--color-border)' }} />
                          </div>
                        </div>
                      ))}

                      {/* Add social link button */}
                      <button type="button"
                        onClick={() => {
                          const updated = [...(field.ctaSocialLinks || []), { platform: 'facebook' as const, url: '', color: '#1877F2' }];
                          onChange(field.id, { ctaSocialLinks: updated });
                          markDirtyAndSave();
                        }}
                        className="w-full py-1.5 rounded-xl border text-[10px] font-bold transition cursor-pointer hover:bg-neutral-50"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        + Add Social Link
                      </button>
                    </div>
                  )}

                  {/* Absolute Positioning Mode Controls */}
                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                      Position Mode
                    </label>
                    <div className="flex gap-1">
                      {(['flow', 'absolute'] as const).map(mode => (
                        <button key={mode} type="button"
                          onClick={() => { onChange(field.id, { positionMode: mode }); markDirtyAndSave(); }}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer border capitalize"
                          style={field.positionMode === mode
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }
                          }>
                          {mode === 'flow' ? '📐 Flow' : '🎯 Absolute'}
                        </button>
                      ))}
                    </div>

                    {(field.positionMode || 'flow') === 'absolute' && (
                      <div className="space-y-3 mt-2">
                        {/* Responsive preset buttons */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>Quick Align</label>
                          <div className="grid grid-cols-3 gap-1">
                            {([
                              { key: 'top-left', label: '↖' }, { key: 'top-center', label: '↑' }, { key: 'top-right', label: '↗' },
                              { key: 'center', label: '⊙' },
                              { key: 'bottom-left', label: '↙' }, { key: 'bottom-center', label: '↓' }, { key: 'bottom-right', label: '↘' },
                            ] as const).map(({ key, label }) => (
                              <button key={key} type="button"
                                onClick={() => { onChange(field.id, { positionPreset: key }); markDirtyAndSave(); }}
                                className="py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border"
                                style={field.positionPreset === key
                                  ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                                  : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }
                                }
                              >{label}</button>
                            ))}
                          </div>
                        </div>

                        {/* Manual X/Y */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>X (px)</label>
                            <input type="number" value={field.positionX ?? 0}
                              onChange={(e) => onChange(field.id, { positionX: Number(e.target.value), positionPreset: 'none' })}
                              onBlur={() => markDirtyAndSave()}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Y (px)</label>
                            <input type="number" value={field.positionY ?? 0}
                              onChange={(e) => onChange(field.id, { positionY: Number(e.target.value), positionPreset: 'none' })}
                              onBlur={() => markDirtyAndSave()}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle} />
                          </div>
                        </div>

                        {/* Width */}
                        <div className="space-y-1">
                          <label className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Width</label>
                          <input type="text" value={field.positionWidth ?? '100%'}
                            onChange={(e) => onChange(field.id, { positionWidth: e.target.value }, true)}
                            onBlur={() => markDirtyAndSave()}
                            placeholder="100%, 200px, auto"
                            className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                            style={inputStyle} />
                        </div>

                        {/* Opacity */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>Opacity: {field.opacity ?? 100}%</span>
                          </div>
                          <input type="range" min={0} max={100} step={1}
                            value={field.opacity ?? 100}
                            onChange={(e) => { onChange(field.id, { opacity: Number(e.target.value) }); markDirtyAndSave(); }}
                            className="w-full accent-indigo-500 cursor-pointer text-xs" />
                        </div>

                        {/* Z-Index & Layer Order */}
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <div className="space-y-1">
                            <label className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>Z-Index</label>
                            <input type="number" value={field.zIndex ?? 0}
                              onChange={(e) => { onChange(field.id, { zIndex: Number(e.target.value) }); markDirtyAndSave(); }}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] block text-center" style={{ color: 'var(--color-text-secondary)' }}>Layer Order</label>
                            <div className="flex gap-1 justify-center">
                              <button type="button"
                                onClick={() => {
                                  const absoluteFields = (fields || []).filter((f: any) => f.positionMode === 'absolute' && f.id !== field.id);
                                  const maxZ = absoluteFields.length > 0 ? Math.max(...absoluteFields.map((f: any) => f.zIndex ?? 0)) : 0;
                                  const currentZ = field.zIndex ?? 0;
                                  const targetZ = Math.max(currentZ + 1, maxZ + 1);
                                  onChange(field.id, { zIndex: targetZ });
                                  markDirtyAndSave();
                                }}
                                className="flex-1 py-1 px-1 rounded border text-[9px] font-bold transition hover:bg-neutral-50 cursor-pointer text-center"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
                                title="Bring to Front"
                              >
                                🔼 Up
                              </button>
                              <button type="button"
                                onClick={() => {
                                  const absoluteFields = (fields || []).filter((f: any) => f.positionMode === 'absolute' && f.id !== field.id);
                                  const minZ = absoluteFields.length > 0 ? Math.min(...absoluteFields.map((f: any) => f.zIndex ?? 0)) : 0;
                                  const currentZ = field.zIndex ?? 0;
                                  const targetZ = Math.min(currentZ - 1, minZ - 1);
                                  onChange(field.id, { zIndex: targetZ });
                                  markDirtyAndSave();
                                }}
                                className="flex-1 py-1 px-1 rounded border text-[9px] font-bold transition hover:bg-neutral-50 cursor-pointer text-center"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
                                title="Send to Back"
                              >
                                🔽 Back
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- New Field Types Properties --- */}

              {/* time_picker config */}
              {field.type === 'time_picker' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Time Format</label>
                    <select
                      value={field.timeFormat || '12h'}
                      onChange={(e) => { onChange(field.id, { timeFormat: e.target.value as '12h'|'24h' }); markDirtyAndSave(); }}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs text-neutral-800"
                    >
                      <option value="12h">12-Hour format (AM/PM)</option>
                      <option value="24h">24-Hour format</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Time Interval Steps (minutes)</label>
                    <input
                      type="number"
                      value={field.timeStep ?? 30}
                      onChange={(e) => onChange(field.id, { timeStep: Number(e.target.value) }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={inputStyle}
                      placeholder="e.g. 15, 30, 60"
                    />
                  </div>
                </div>
              )}

              {/* date_range config */}
              {field.type === 'date_range' && (
                <div className="space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Start Field Label</label>
                      <input
                        type="text"
                        value={field.dateRangeStartLabel || ''}
                        onChange={(e) => onChange(field.id, { dateRangeStartLabel: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                        style={inputStyle}
                        placeholder="Start Date"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>End Field Label</label>
                      <input
                        type="text"
                        value={field.dateRangeEndLabel || ''}
                        onChange={(e) => onChange(field.id, { dateRangeEndLabel: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                        style={inputStyle}
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Minimum Nights / Days Separation</label>
                    <input
                      type="number"
                      value={field.dateRangeMinNights ?? 1}
                      onChange={(e) => onChange(field.id, { dateRangeMinNights: Number(e.target.value) }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={inputStyle}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              )}

              {/* address_autocomplete config */}
              {field.type === 'address_autocomplete' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Restrict Search to Country (ISO code)</label>
                    <input
                      type="text"
                      value={field.addressCountryRestrict || ''}
                      onChange={(e) => onChange(field.id, { addressCountryRestrict: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs uppercase"
                      style={inputStyle}
                      placeholder="e.g. US, CA, GB"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Capture Address Fields</label>
                    {['street', 'city', 'state', 'zip', 'country'].map((comp) => {
                      const enabled = (field.addressComponents || []).includes(comp as any);
                      return (
                        <div key={comp} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={enabled}
                            id={`addr-comp-${field.id}-${comp}`}
                            onChange={(e) => {
                              let next = [...(field.addressComponents || [])];
                              if (e.target.checked) next.push(comp as any);
                              else next = next.filter(c => c !== comp);
                              onChange(field.id, { addressComponents: next });
                              markDirtyAndSave();
                            }}
                            className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
                          />
                          <label htmlFor={`addr-comp-${field.id}-${comp}`} className="text-xs font-semibold capitalize select-none cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                            {comp}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* color_picker config */}
              {field.type === 'color_picker' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Default Selection Hex</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.colorPickerDefault || '#6366f1'}
                        onChange={(e) => { onChange(field.id, { colorPickerDefault: e.target.value }); markDirtyAndSave(); }}
                        className="w-8 h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={field.colorPickerDefault || ''}
                        onChange={(e) => { onChange(field.id, { colorPickerDefault: e.target.value }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        placeholder="#6366f1"
                        className="flex-1 border rounded-lg px-2.5 py-1.5 outline-none text-xs font-mono"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Swatch Color Presets (comma-separated hexes)</label>
                    <input
                      type="text"
                      value={(field.colorPickerPresets || []).join(', ')}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        onChange(field.id, { colorPickerPresets: arr }, true);
                      }}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="#ffffff, #000000"
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-mono"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* signature_pad config */}
              {field.type === 'signature_pad' && (
                <div className="space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Pen Line Color</label>
                      <input
                        type="color"
                        value={field.signaturePadPenColor || '#000000'}
                        onChange={(e) => { onChange(field.id, { signaturePadPenColor: e.target.value }); markDirtyAndSave(); }}
                        className="w-full h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Pad Background</label>
                      <input
                        type="color"
                        value={field.signaturePadBgColor || '#ffffff'}
                        onChange={(e) => { onChange(field.id, { signaturePadBgColor: e.target.value }); markDirtyAndSave(); }}
                        className="w-full h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Canvas Height: {field.signaturePadHeight ?? 150}px</label>
                    <input
                      type="range"
                      min={80}
                      max={400}
                      value={field.signaturePadHeight ?? 150}
                      onChange={(e) => onChange(field.id, { signaturePadHeight: Number(e.target.value) })}
                      onMouseUp={() => markDirtyAndSave()}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* otp_input config */}
              {field.type === 'otp_input' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Code Characters Limit (OTP length)</label>
                    <input
                      type="number"
                      min={4}
                      max={12}
                      value={field.otpLength ?? 6}
                      onChange={(e) => { onChange(field.id, { otpLength: Number(e.target.value) }, true); }}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={field.otpNumericOnly !== false}
                      id={`otpNumericOnly-${field.id}`}
                      onChange={(e) => { onChange(field.id, { otpNumericOnly: e.target.checked }); markDirtyAndSave(); }}
                      className="w-4 h-4 text-indigo-600 border-neutral-300 rounded cursor-pointer"
                    />
                    <label htmlFor={`otpNumericOnly-${field.id}`} className="text-xs font-bold leading-none cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                      Numeric digits only
                    </label>
                  </div>
                </div>
              )}

              {/* hidden_field config */}
              {field.type === 'hidden_field' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Parameter Source</label>
                    <select
                      value={field.hiddenFieldSource || 'static'}
                      onChange={(e) => { onChange(field.id, { hiddenFieldSource: e.target.value as any }); markDirtyAndSave(); }}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs text-neutral-800"
                    >
                      <option value="static">Static Text Value</option>
                      <option value="utm_source">URL Parameter: utm_source</option>
                      <option value="utm_medium">URL Parameter: utm_medium</option>
                      <option value="utm_campaign">URL Parameter: utm_campaign</option>
                      <option value="referrer">Document Referrer URL</option>
                    </select>
                  </div>
                  {field.hiddenFieldSource === 'static' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Value</label>
                      <input
                        type="text"
                        value={field.hiddenFieldValue || ''}
                        onChange={(e) => onChange(field.id, { hiddenFieldValue: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                        style={inputStyle}
                        placeholder="Constant secret key or note"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* calculation_field config */}
              {field.type === 'calculation_field' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Calculation Formula Expression</label>
                    <input
                      type="text"
                      value={field.calculationExpression || ''}
                      onChange={(e) => onChange(field.id, { calculationExpression: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-mono"
                      style={inputStyle}
                      placeholder="e.g. field-xyz * 10 or field-abc + field-def"
                    />
                    <p className="text-[9px] text-neutral-400 mt-1">
                      Use other number field IDs joined with standard operators: <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>( )</code>.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Decimals</label>
                      <input
                        type="number"
                        min={0}
                        max={6}
                        value={field.calculationDecimalPlaces ?? 2}
                        onChange={(e) => onChange(field.id, { calculationDecimalPlaces: Number(e.target.value) }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Prefix</label>
                      <input
                        type="text"
                        value={field.calculationPrefix || ''}
                        onChange={(e) => onChange(field.id, { calculationPrefix: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                        placeholder="$"
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Suffix</label>
                      <input
                        type="text"
                        value={field.calculationSuffix || ''}
                        onChange={(e) => onChange(field.id, { calculationSuffix: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                        placeholder=" total"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* matrix_grid config */}
              {field.type === 'matrix_grid' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Row Titles (one per line)</label>
                    <textarea
                      value={(field.matrixRows || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(Boolean);
                        onChange(field.id, { matrixRows: lines }, true);
                      }}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={{ ...inputStyle, minHeight: '60px' }}
                      placeholder="Question Row A&#10;Question Row B"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Column Scales (one per line)</label>
                    <textarea
                      value={(field.matrixColumns || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(Boolean);
                        onChange(field.id, { matrixColumns: lines }, true);
                      }}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={{ ...inputStyle, minHeight: '60px' }}
                      placeholder="Poor&#10;Good&#10;Excellent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Input Style Mode</label>
                    <select
                      value={field.matrixInputType || 'radio'}
                      onChange={(e) => { onChange(field.id, { matrixInputType: e.target.value as 'radio'|'checkbox' }); markDirtyAndSave(); }}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs text-neutral-800"
                    >
                      <option value="radio">Radio Buttons (single per row)</option>
                      <option value="checkbox">Checkboxes (multiple selection)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ranking_field config */}
              {field.type === 'ranking_field' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Reorderable Options (one per line)</label>
                    <textarea
                      value={(field.rankingOptions || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(Boolean);
                        onChange(field.id, { rankingOptions: lines }, true);
                      }}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={{ ...inputStyle, minHeight: '80px' }}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                </div>
              )}

              {/* nps_score config */}
              {field.type === 'nps_score' && (
                <div className="space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Low End Label (0)</label>
                      <input
                        type="text"
                        value={field.npsLowLabel || ''}
                        onChange={(e) => onChange(field.id, { npsLowLabel: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                        placeholder="Not likely"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>High End Label (10)</label>
                      <input
                        type="text"
                        value={field.npsHighLabel || ''}
                        onChange={(e) => onChange(field.id, { npsHighLabel: e.target.value }, true)}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                        placeholder="Extremely likely"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* country_selector config */}
              {field.type === 'country_selector' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Default Selection Country</label>
                    <select
                      value={field.countrySelectorDefault || ''}
                      onChange={(e) => { onChange(field.id, { countrySelectorDefault: e.target.value }); markDirtyAndSave(); }}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs text-neutral-800"
                    >
                      <option value="">None (Force User Choice)</option>
                      {WORLD_COUNTRIES.map(ctry => (
                        <option key={ctry} value={ctry}>{ctry}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* terms_checkbox config */}
              {field.type === 'terms_checkbox' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Consent Prefix Text</label>
                    <input
                      type="text"
                      value={field.termsText || ''}
                      onChange={(e) => onChange(field.id, { termsText: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                      placeholder="I agree to the"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Hyperlink Label Text</label>
                    <input
                      type="text"
                      value={field.termsLinkLabel || ''}
                      onChange={(e) => onChange(field.id, { termsLinkLabel: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-bold"
                      style={inputStyle}
                      placeholder="Terms of Service & Privacy Policy"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Link URL</label>
                    <input
                      type="url"
                      value={field.termsLinkUrl || ''}
                      onChange={(e) => onChange(field.id, { termsLinkUrl: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                      placeholder="https://example.com/terms"
                    />
                  </div>
                </div>
              )}

              {/* progress_bar config */}
              {field.type === 'progress_bar' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Visual Presentation Type</label>
                    <select
                      value={field.progressBarStyle || 'bar'}
                      onChange={(e) => { onChange(field.id, { progressBarStyle: e.target.value as any }); markDirtyAndSave(); }}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs text-neutral-800"
                    >
                      <option value="bar">Classic Bar Tracker</option>
                      <option value="percentage">Percentage Text complete</option>
                      <option value="steps">Progress Step Rings</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Fill Theme Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.progressBarColor || '#6366f1'}
                        onChange={(e) => { onChange(field.id, { progressBarColor: e.target.value }); markDirtyAndSave(); }}
                        className="w-10 h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={field.progressBarColor || ''}
                        onChange={(e) => { onChange(field.id, { progressBarColor: e.target.value }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        placeholder="#6366f1"
                        className="flex-1 border rounded-lg px-2.5 py-1.5 outline-none text-xs font-mono font-semibold"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* header_image_banner config */}
              {field.type === 'header_image_banner' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Banner Image Source URL</label>
                    <input
                      type="url"
                      value={field.bannerImageUrl || ''}
                      onChange={(e) => onChange(field.id, { bannerImageUrl: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="https://... or unsplash path"
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                    />
                  </div>
                  <DeviceImageUpload
                    label="Or Upload Banner Image"
                    value={field.bannerImageUrl || ''}
                    onChange={(val) => onChange(field.id, { bannerImageUrl: val })}
                    onBlur={markDirtyAndSave}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Layout Style Fit</label>
                      <select
                        value={field.bannerObjectFit || 'cover'}
                        onChange={(e) => { onChange(field.id, { bannerObjectFit: e.target.value as any }); markDirtyAndSave(); }}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs text-neutral-800 outline-none"
                      >
                        <option value="cover">Scale/Crop (Cover)</option>
                        <option value="contain">Bound entire canvas (Contain)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Min Height (px)</label>
                      <input
                        type="number"
                        min={50}
                        max={600}
                        value={field.bannerHeight ?? 140}
                        onChange={(e) => { onChange(field.id, { bannerHeight: Number(e.target.value) }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none font-semibold"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Overlaid Text Banner Headline</label>
                    <input
                      type="text"
                      value={field.bannerOverlayText || ''}
                      onChange={(e) => onChange(field.id, { bannerOverlayText: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="Headline text of section"
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-bold"
                      style={inputStyle}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Text Alignment</label>
                      <select
                        value={field.bannerOverlayPosition || 'center'}
                        onChange={(e) => { onChange(field.id, { bannerOverlayPosition: e.target.value as any }); markDirtyAndSave(); }}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs text-neutral-800 outline-none"
                      >
                        <option value="top-left">↖ Top Left</option>
                        <option value="top-center">↑ Top Center</option>
                        <option value="top-right">↗ Top Right</option>
                        <option value="center">⊙ Center Card</option>
                        <option value="bottom-left">↙ Bottom Left</option>
                        <option value="bottom-center">↓ Bottom Center</option>
                        <option value="bottom-right">↘ Bottom Right</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Text color</label>
                      <input
                        type="color"
                        value={field.bannerOverlayTextColor || '#ffffff'}
                        onChange={(e) => { onChange(field.id, { bannerOverlayTextColor: e.target.value }); markDirtyAndSave(); }}
                        className="w-full h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Backdrop background box</label>
                      <input
                        type="color"
                        value={field.bannerOverlayBgColor || 'rgba(0,0,0,0.4)'}
                        onChange={(e) => { onChange(field.id, { bannerOverlayBgColor: e.target.value }); markDirtyAndSave(); }}
                        className="w-full h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* video_embed config */}
              {field.type === 'video_embed' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>YouTube or Vimeo video Link</label>
                    <input
                      type="url"
                      value={field.videoEmbedUrl || ''}
                      onChange={(e) => onChange(field.id, { videoEmbedUrl: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* shape_framed_image config */}
              {field.type === 'shape_framed_image' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Source Image URL</label>
                    <input
                      type="url"
                      value={field.shapeFrameImageUrl || ''}
                      onChange={(e) => onChange(field.id, { shapeFrameImageUrl: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="https://..."
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                    />
                  </div>
                  <DeviceImageUpload
                    label="Or Upload Framed Image"
                    value={field.shapeFrameImageUrl || ''}
                    onChange={(val) => onChange(field.id, { shapeFrameImageUrl: val })}
                    onBlur={markDirtyAndSave}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Frame Shape</label>
                      <select
                        value={field.shapeFrameType || 'circle'}
                        onChange={(e) => { onChange(field.id, { shapeFrameType: e.target.value as any }); markDirtyAndSave(); }}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs text-neutral-800 outline-none"
                      >
                        <option value="circle">Perfect Circle</option>
                        <option value="hexagon">Polygon Hexagon</option>
                        <option value="diamond">Apex Diamond</option>
                        <option value="square">Square Frame</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Width (px)</label>
                      <input
                        type="number"
                        min={50}
                        max={500}
                        value={field.shapeFrameSize ?? 160}
                        onChange={(e) => { onChange(field.id, { shapeFrameSize: Number(e.target.value) }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none font-semibold"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Outline Border thickness</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={field.shapeFrameBorderWidth ?? 2}
                        onChange={(e) => { onChange(field.id, { shapeFrameBorderWidth: Number(e.target.value) }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none font-semibold"
                        style={inputStyle}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Outline color</label>
                      <input
                        type="color"
                        value={field.shapeFrameBorderColor || '#6366f1'}
                        onChange={(e) => { onChange(field.id, { shapeFrameBorderColor: e.target.value }); markDirtyAndSave(); }}
                        className="w-full h-8 rounded border p-0.5 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* logo_mark config */}
              {field.type === 'logo_mark' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Logo Image Path URL</label>
                    <input
                      type="url"
                      value={field.logoMarkUrl || ''}
                      onChange={(e) => onChange(field.id, { logoMarkUrl: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="https://..."
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                    />
                  </div>
                  <DeviceImageUpload
                    label="Or Upload Logo Image"
                    value={field.logoMarkUrl || ''}
                    onChange={(val) => onChange(field.id, { logoMarkUrl: val })}
                    onBlur={markDirtyAndSave}
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Brand image diameter height: {field.logoMarkWidth ?? 48}px</label>
                    <input
                      type="range"
                      min={24}
                      max={120}
                      value={field.logoMarkWidth ?? 48}
                      onChange={(e) => onChange(field.id, { logoMarkWidth: Number(e.target.value) })}
                      onMouseUp={() => markDirtyAndSave()}
                      className="w-full accent-indigo-600 font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* accordion_section config */}
              {field.type === 'accordion_section' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Accordion Dropdown visual Title</label>
                    <input
                      type="text"
                      value={field.accordionTitle || ''}
                      onChange={(e) => onChange(field.id, { accordionTitle: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-bold"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={field.accordionDefaultOpen === true}
                      id={`accordionDefaultOpen-${field.id}`}
                      onChange={(e) => { onChange(field.id, { accordionDefaultOpen: e.target.checked }); markDirtyAndSave(); }}
                      className="w-4 h-4 text-indigo-600 border-neutral-300 rounded cursor-pointer"
                    />
                    <label htmlFor={`accordionDefaultOpen-${field.id}`} className="text-xs font-bold leading-none cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                      Start expanded / open by default
                    </label>
                  </div>
                </div>
              )}

              {/* tab_container config */}
              {field.type === 'tab_container' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Tab page sheets labels (comma-separated)</label>
                    <input
                      type="text"
                      value={(field.tabLabels || []).join(', ')}
                      onChange={(e) => {
                        const labels = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        onChange(field.id, { tabLabels: labels }, true);
                      }}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                      placeholder="Tab A, Tab B, Tab C"
                    />
                  </div>
                </div>
              )}

              {/* repeating_section config */}
              {field.type === 'repeating_section' && (
                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Action Add Button Label</label>
                    <input
                      type="text"
                      value={field.repeatingAddButtonLabel || ''}
                      onChange={(e) => onChange(field.id, { repeatingAddButtonLabel: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                      style={inputStyle}
                      placeholder="Add another Entry"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Minimum Entries</label>
                      <input
                        type="number"
                        min={0}
                        value={field.repeatingMinEntries ?? 1}
                        onChange={(e) => { onChange(field.id, { repeatingMinEntries: Number(e.target.value) }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Maximum Entries limit</label>
                      <input
                        type="number"
                        min={1}
                        value={field.repeatingMaxEntries ?? 10}
                        onChange={(e) => { onChange(field.id, { repeatingMaxEntries: Number(e.target.value) }, true); }}
                        onBlur={() => markDirtyAndSave()}
                        className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {field.type === 'divider' && (
                <div className="space-y-4 font-sans border-t pt-3 mt-2" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400" style={{ color: 'var(--color-text-secondary)' }}>Horizontal Divider Settings</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-24 shrink-0 font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Line Color:</span>
                    <input
                      type="color"
                      value={field.dividerColor || '#e5e7eb'}
                      onChange={(e) => {
                        onChange(field.id, { dividerColor: e.target.value });
                        markDirtyAndSave();
                      }}
                      className="w-8 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onChange(field.id, { dividerColor: undefined });
                        markDirtyAndSave();
                      }}
                      className="text-[9px] text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-24 shrink-0 font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Thickness: {field.dividerThickness ?? 1}px</span>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={field.dividerThickness ?? 1}
                      onChange={(e) => {
                        onChange(field.id, { dividerThickness: Number(e.target.value) });
                      }}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="flex-1 h-1 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {field.type === 'vertical_divider' && (
                <div className="space-y-4 font-sans border-t pt-3 mt-2" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400" style={{ color: 'var(--color-text-secondary)' }}>Vertical Divider Settings</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-24 shrink-0 font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Line Color:</span>
                    <input
                      type="color"
                      value={field.dividerColor || '#e5e7eb'}
                      onChange={(e) => {
                        onChange(field.id, { dividerColor: e.target.value });
                        markDirtyAndSave();
                      }}
                      className="w-8 h-7 rounded border cursor-pointer p-0.5 bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onChange(field.id, { dividerColor: undefined });
                        markDirtyAndSave();
                      }}
                      className="text-[9px] text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-24 shrink-0 font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Thickness: {field.dividerThickness ?? 2}px</span>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={field.dividerThickness ?? 2}
                      onChange={(e) => {
                        onChange(field.id, { dividerThickness: Number(e.target.value) });
                      }}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="flex-1 h-1 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-24 shrink-0 font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Height: {field.dividerHeight ?? 40}px</span>
                    <input
                      type="range"
                      min={20}
                      max={400}
                      step={1}
                      value={field.dividerHeight ?? 40}
                      onChange={(e) => {
                        onChange(field.id, { dividerHeight: Number(e.target.value) });
                      }}
                      onMouseUp={() => markDirtyAndSave()}
                      onTouchEnd={() => markDirtyAndSave()}
                      className="flex-1 h-1 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {['short_text', 'long_text'].includes(field.type) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Max Characters</label>
                  <input type="number" value={field.maxLength || ''} onChange={(e) => onChange(field.id, { maxLength: e.target.value ? Number(e.target.value) : undefined }, true)}
                    onBlur={() => markDirtyAndSave()}
                    placeholder="e.g. 500" className="w-full border rounded-lg px-2.5 py-1.5 outline-none font-semibold text-xs" style={inputStyle} />
                </div>
              )}

              {field.type === 'password' && (
                <p className="text-[10px] italic" style={{ color: 'var(--color-text-secondary)' }}>
                  Password field — masked input. Uses placeholder and required settings above.
                </p>
              )}

              {field.type === 'image_canvas' && (
                <div className="space-y-4">
                  {/* Image URL / upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>Image URL</label>
                    <input type="url" value={field.imageCanvasUrl || ''}
                      onChange={(e) => onChange(field.id, { imageCanvasUrl: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="https://... or paste a URL"
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={inputStyle} />
                  </div>

                  <DeviceImageUpload
                    label="Or Upload Device Image"
                    value={field.imageCanvasUrl || ''}
                    onChange={(val) => onChange(field.id, { imageCanvasUrl: val })}
                    onBlur={markDirtyAndSave}
                  />

                  {/* Height — manually resizable via slider */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>
                      Canvas Height: {field.imageCanvasHeight ?? 200}px
                    </label>
                    <input type="range" min={80} max={800} step={4}
                      value={field.imageCanvasHeight ?? 200}
                      onChange={(e) => onChange(field.id, { imageCanvasHeight: Number(e.target.value) })}
                      className="w-full accent-indigo-500" />
                  </div>

                  {/* Alignment — Auto-position buttons */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>Alignment</label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button key={align} type="button"
                          onClick={() => onChange(field.id, { imageCanvasAlign: align })}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer capitalize border"
                          style={field.imageCanvasAlign === align
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }
                          }>
                          {align === 'left' ? '⬛ Left' : align === 'center' ? '⬜ Center' : 'Right ⬛'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Object Fit */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>Object Fit</label>
                    <div className="flex gap-1">
                      {(['cover', 'contain', 'fill'] as const).map(fit => (
                        <button key={fit} type="button"
                          onClick={() => onChange(field.id, { imageCanvasObjectFit: fit })}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer capitalize border"
                          style={field.imageCanvasObjectFit === fit
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }
                          }>
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shape Mask Frame */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>
                      Shape Mask Frame
                    </label>
                    <select
                      value={field.imageCanvasShapeMask || 'none'}
                      onChange={(e) => { onChange(field.id, { imageCanvasShapeMask: e.target.value as any }); markDirtyAndSave(); }}
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={inputStyle}
                    >
                      <option value="none">None (Standard Rectangle)</option>
                      <option value="circle">Circle</option>
                      <option value="pentagon">Pentagon</option>
                      <option value="hexagon">Hexagon</option>
                      <option value="diamond">Diamond</option>
                      <option value="octagon">Octagon</option>
                    </select>
                  </div>

                  {/* Border Radius — modern slider */}
                  <div className={`space-y-1 transition-opacity duration-200 ${field.imageCanvasShapeMask && field.imageCanvasShapeMask !== 'none' ? 'opacity-40' : 'opacity-100'}`}
                    title={field.imageCanvasShapeMask && field.imageCanvasShapeMask !== 'none' ? "Border radius is overridden by shape mask." : undefined}
                  >
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>
                      Border Radius: {field.imageCanvasBorderRadius ?? 0}px
                    </label>
                    <input type="range" min={0} max={100} step={1}
                      disabled={!!(field.imageCanvasShapeMask && field.imageCanvasShapeMask !== 'none')}
                      value={field.imageCanvasBorderRadius ?? 0}
                      onChange={(e) => onChange(field.id, { imageCanvasBorderRadius: Number(e.target.value) })}
                      className="w-full accent-indigo-500 disabled:cursor-not-allowed" />
                    {field.imageCanvasShapeMask && field.imageCanvasShapeMask !== 'none' && (
                      <p className="text-[9px] text-amber-500 font-bold leading-tight flex items-center gap-1 animate-pulse">
                        <span>⚠️ Border radius is overridden by shape mask.</span>
                      </p>
                    )}
                  </div>

                  {/* Border Color + Width */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>Border</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={field.imageCanvasBorderColor ?? '#e2e8f0'}
                        onChange={(e) => onChange(field.id, { imageCanvasBorderColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border p-0.5 border-neutral-300"
                        style={{ borderColor: 'var(--color-border)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                        Width: {field.imageCanvasBorderWidth ?? 0}px
                      </span>
                      <input type="range" min={0} max={10} step={1}
                        value={field.imageCanvasBorderWidth ?? 0}
                        onChange={(e) => onChange(field.id, { imageCanvasBorderWidth: Number(e.target.value) })}
                        className="flex-1 accent-indigo-500" />
                    </div>
                  </div>

                  {/* Alt text */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block" style={{ color: 'var(--color-text-secondary)' }}>Alt Text</label>
                    <input type="text" value={field.imageCanvasAlt || ''}
                      onChange={(e) => onChange(field.id, { imageCanvasAlt: e.target.value }, true)}
                      onBlur={() => markDirtyAndSave()}
                      placeholder="Describe the image..."
                      className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs"
                      style={inputStyle} />
                  </div>

                  {/* Absolute Positioning Mode Controls */}
                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                      Position Mode
                    </label>
                    <div className="flex gap-1">
                      {(['flow', 'absolute'] as const).map(mode => (
                        <button key={mode} type="button"
                          onClick={() => { onChange(field.id, { positionMode: mode }); markDirtyAndSave(); }}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer border capitalize"
                          style={field.positionMode === mode
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                            : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }
                          }>
                          {mode === 'flow' ? '📐 Flow' : '🎯 Absolute'}
                        </button>
                      ))}
                    </div>

                    {(field.positionMode || 'flow') === 'absolute' && (
                      <div className="space-y-3 mt-2">
                        {/* Responsive preset buttons */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>Quick Align</label>
                          <div className="grid grid-cols-3 gap-1">
                            {([
                              { key: 'top-left', label: '↖' }, { key: 'top-center', label: '↑' }, { key: 'top-right', label: '↗' },
                              { key: 'center', label: '⊙' },
                              { key: 'bottom-left', label: '↙' }, { key: 'bottom-center', label: '↓' }, { key: 'bottom-right', label: '↘' },
                            ] as const).map(({ key, label }) => (
                              <button key={key} type="button"
                                onClick={() => { onChange(field.id, { positionPreset: key }); markDirtyAndSave(); }}
                                className="py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border"
                                style={field.positionPreset === key
                                  ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                                  : { color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'transparent' }
                                }
                              >{label}</button>
                            ))}
                          </div>
                        </div>

                        {/* Manual X/Y */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>X (px)</label>
                            <input type="number" value={field.positionX ?? 0}
                              onChange={(e) => onChange(field.id, { positionX: Number(e.target.value), positionPreset: 'none' })}
                              onBlur={() => markDirtyAndSave()}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Y (px)</label>
                            <input type="number" value={field.positionY ?? 0}
                              onChange={(e) => onChange(field.id, { positionY: Number(e.target.value), positionPreset: 'none' })}
                              onBlur={() => markDirtyAndSave()}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle} />
                          </div>
                        </div>

                        {/* Width */}
                        <div className="space-y-1">
                          <label className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Width</label>
                          <input type="text" value={field.positionWidth ?? '100%'}
                            onChange={(e) => onChange(field.id, { positionWidth: e.target.value }, true)}
                            onBlur={() => markDirtyAndSave()}
                            placeholder="100%, 200px, auto"
                            className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                            style={inputStyle} />
                        </div>

                        {/* Opacity */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>Opacity: {field.opacity ?? 100}%</span>
                          </div>
                          <input type="range" min={0} max={100} step={1}
                            value={field.opacity ?? 100}
                            onChange={(e) => { onChange(field.id, { opacity: Number(e.target.value) }); markDirtyAndSave(); }}
                            className="w-full accent-indigo-500 cursor-pointer text-xs" />
                        </div>

                        {/* Z-Index & Layer Order */}
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <div className="space-y-1">
                            <label className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>Z-Index</label>
                            <input type="number" value={field.zIndex ?? 0}
                              onChange={(e) => { onChange(field.id, { zIndex: Number(e.target.value) }); markDirtyAndSave(); }}
                              className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs"
                              style={inputStyle} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] block text-center" style={{ color: 'var(--color-text-secondary)' }}>Layer Order</label>
                            <div className="flex gap-1 justify-center">
                              <button type="button"
                                onClick={() => {
                                  const absoluteFields = (fields || []).filter((f: any) => f.positionMode === 'absolute' && f.id !== field.id);
                                  const maxZ = absoluteFields.length > 0 ? Math.max(...absoluteFields.map((f: any) => f.zIndex ?? 0)) : 0;
                                  const currentZ = field.zIndex ?? 0;
                                  const targetZ = Math.max(currentZ + 1, maxZ + 1);
                                  onChange(field.id, { zIndex: targetZ });
                                  markDirtyAndSave();
                                }}
                                className="flex-1 py-1 px-1 rounded border text-[9px] font-bold transition hover:bg-neutral-50 cursor-pointer text-center"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
                                title="Bring to Front"
                              >
                                🔼 Up
                              </button>
                              <button type="button"
                                onClick={() => {
                                  const absoluteFields = (fields || []).filter((f: any) => f.positionMode === 'absolute' && f.id !== field.id);
                                  const minZ = absoluteFields.length > 0 ? Math.min(...absoluteFields.map((f: any) => f.zIndex ?? 0)) : 0;
                                  const currentZ = field.zIndex ?? 0;
                                  const targetZ = Math.min(currentZ - 1, minZ - 1);
                                  onChange(field.id, { zIndex: targetZ });
                                  markDirtyAndSave();
                                }}
                                className="flex-1 py-1 px-1 rounded border text-[9px] font-bold transition hover:bg-neutral-50 cursor-pointer text-center"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
                                title="Send to Back"
                              >
                                🔽 Back
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Design visual panel inside FieldEditor */}
              {field.type === 'form_design_block' && onDesignChange && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
                        Form Background
                      </label>

                      {/* Mode tabs */}
                      <div className="flex gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        {(['solid', 'gradient', 'image'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => { onDesignChange({ bgMode: mode }); }}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer capitalize"
                            style={bgMode === mode
                              ? { background: 'var(--accent-gradient)', color: '#fff' }
                              : { color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }
                            }
                          >
                            {mode === 'solid' ? '🎨 Solid' : mode === 'gradient' ? '🌈 Gradient' : '🖼 Image'}
                          </button>
                        ))}
                      </div>

                      {/* Solid color */}
                      {bgMode === 'solid' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={bgSolidColor}
                              onChange={(e) => { onDesignChange({ bgSolidColor: e.target.value }); }}
                              className="w-10 h-10 rounded-lg cursor-pointer border bg-transparent p-0.5"
                              style={{ borderColor: 'var(--color-border)' }}
                            />
                            <input
                              type="text"
                              value={bgSolidColor}
                              onChange={(e) => { onDesignChange({ bgSolidColor: e.target.value }); }}
                              placeholder="#ffffff"
                              className="flex-1 border rounded-lg px-2.5 py-1.5 outline-none text-xs font-mono"
                              style={inputStyle}
                            />
                            {/* Quick color presets */}
                            <div className="flex gap-1">
                              {['#ffffff', '#f8fafc', '#f3f0ff', '#fff7ed', '#f0fdf4', '#0f172a'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => { onDesignChange({ bgSolidColor: c }); }}
                                  className="w-5 h-5 rounded-full border cursor-pointer transition hover:scale-110"
                                  style={{ backgroundColor: c, borderColor: bgSolidColor === c ? 'var(--color-accent)' : 'rgba(0,0,0,0.15)', borderWidth: bgSolidColor === c ? '2px' : '1px' }}
                                  title={c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Solid Opacity Slide Control */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                              <span>Background Opacity</span>
                              <span className="font-mono">{bgSolidOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={bgSolidOpacity}
                              onChange={(e) => { onDesignChange({ bgSolidOpacity: Number(e.target.value) }); }}
                              className="w-full"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Gradient builder */}
                      {bgMode === 'gradient' && (
                        <div className="space-y-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>

                          {/* Color stops */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Color 1</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={bgGradientColor1} onChange={(e) => { onDesignChange({ bgGradientColor1: e.target.value }); }}
                                  className="w-8 h-8 rounded-lg cursor-pointer border bg-transparent p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                <input type="text" value={bgGradientColor1} onChange={(e) => { onDesignChange({ bgGradientColor1: e.target.value }); }}
                                  className="flex-1 border rounded-lg px-2 py-1.5 outline-none text-xs font-mono" style={inputStyle} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Color 2</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={bgGradientColor2} onChange={(e) => { onDesignChange({ bgGradientColor2: e.target.value }); }}
                                  className="w-8 h-8 rounded-lg cursor-pointer border bg-transparent p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                <input type="text" value={bgGradientColor2} onChange={(e) => { onDesignChange({ bgGradientColor2: e.target.value }); }}
                                  className="flex-1 border rounded-lg px-2 py-1.5 outline-none text-xs font-mono" style={inputStyle} />
                              </div>
                            </div>
                          </div>

                          {/* Gradient preview bar */}
                          <div
                            className="h-6 rounded-lg border"
                            style={{
                              background: `linear-gradient(${bgGradientAngle}deg, ${bgGradientColor1}, ${bgGradientColor2})`,
                              borderColor: 'var(--color-border)'
                            }}
                          />

                          {/* Angle control */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Angle</label>
                              <span className="text-[10px] font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>{bgGradientAngle}°</span>
                            </div>

                            {/* Draggable angle slider */}
                            <input
                              type="range"
                              min={0}
                              max={315}
                              step={45}
                              value={bgGradientAngle}
                              onChange={(e) => { onDesignChange({ bgGradientAngle: parseInt(e.target.value) }); }}
                              className="w-full"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />

                            {/* Quick angle presets */}
                            <div className="flex gap-1 flex-wrap">
                              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                                <button
                                  key={angle}
                                  type="button"
                                  onClick={() => { onDesignChange({ bgGradientAngle: angle }); }}
                                  className="px-2 py-0.5 rounded border text-[9px] font-bold font-mono transition cursor-pointer"
                                  style={bgGradientAngle === angle
                                    ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                                    : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }
                                  }
                                >
                                  {angle}°
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Gradient quick presets */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Quick Presets</label>
                            <div className="flex gap-2 flex-wrap">
                              {[
                                { label: 'Indigo Sky',  c1: '#6366f1', c2: '#38bdf8', angle: 135 },
                                { label: 'Sunset',      c1: '#f59e0b', c2: '#ef4444', angle: 135 },
                                { label: 'Forest',      c1: '#10b981', c2: '#3b82f6', angle: 135 },
                                { label: 'Rose Gold',   c1: '#f43f5e', c2: '#fb923c', angle: 135 },
                                { label: 'Midnight',    c1: '#1e1b4b', c2: '#312e81', angle: 135 },
                                { label: 'Pearl',       c1: '#f8fafc', c2: '#e2e8f0', angle: 135 },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    onDesignChange({
                                      bgGradientColor1: preset.c1,
                                      bgGradientColor2: preset.c2,
                                      bgGradientAngle: preset.angle,
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-full text-[9px] font-bold border cursor-pointer transition hover:scale-105"
                                  style={{
                                    background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})`,
                                    color: '#fff',
                                    borderColor: 'transparent',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                  }}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Gradient Opacity Slide Control */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                              <span>Gradient Opacity</span>
                              <span className="font-mono">{bgGradientOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={bgGradientOpacity}
                              onChange={(e) => { onDesignChange({ bgGradientOpacity: Number(e.target.value) }); }}
                              className="w-full"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </div>

                        </div>
                      )}

                      {/* Image URL background */}
                      {bgMode === 'image' && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={bgImageUrl}
                            onChange={(e) => { onDesignChange({ bgImageUrl: e.target.value }); }}
                            placeholder="https://example.com/background.jpg"
                            className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                            style={inputStyle}
                          />
                          {/* Device upload button */}
                          <div className="flex items-center gap-2 mt-2">
                            <label
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition hover:bg-neutral-50"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                            >
                              <Upload className="w-3 h-3" />
                              Upload from device
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const dataUrl = reader.result as string;
                                    onDesignChange({ bgImageUrl: dataUrl });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                            <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>PNG, JPG, WEBP, SVG</span>
                          </div>
                          <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>
                            Direct image URL. Will be applied as a full-cover background.
                          </p>

                          {/* Image Color Overlay Controls */}
                          <div className="p-3 rounded-xl border space-y-3 mt-1" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Image Overlay Color</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={bgImageOverlayColor} onChange={(e) => { onDesignChange({ bgImageOverlayColor: e.target.value }); }}
                                  className="w-8 h-8 rounded-lg cursor-pointer border bg-transparent p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                <input type="text" value={bgImageOverlayColor} onChange={(e) => { onDesignChange({ bgImageOverlayColor: e.target.value }); }}
                                  className="flex-1 border rounded-lg px-2 py-1.5 outline-none text-xs font-mono" style={inputStyle} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                                <span>Overlay Opacity</span>
                                <span className="font-mono">{bgImageOverlayOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={bgImageOverlayOpacity}
                                onChange={(e) => { onDesignChange({ bgImageOverlayOpacity: Number(e.target.value) }); }}
                                className="w-full"
                                style={{ accentColor: 'var(--color-accent)' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                        {/* ✨ Glassmorphism */}
                        <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
                              ✨ Glassmorphism
                            </label>
                            <button
                              type="button"
                              onClick={() => onDesignChange?.({ bgGlassEnabled: !bgGlassEnabled })}
                              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                              style={{ backgroundColor: bgGlassEnabled ? 'var(--color-accent)' : '#d1d5db' }}
                              role="switch"
                              aria-checked={bgGlassEnabled}
                            >
                              <span
                                className="pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out"
                                style={{
                                  transform: bgGlassEnabled ? 'translateX(16px)' : 'translateX(0px)',
                                  backgroundColor: bgGlassEnabled ? '#ffffff' : 'rgba(99, 102, 241, 0.35)',  // reduced-opacity indigo when OFF
                                }}
                              />
                            </button>
                          </div>

                          {bgGlassEnabled && (
                            <div className="space-y-3">
                              {/* Blur */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Blur: {bgGlassBlur ?? 12}px</span>
                                <input type="range" min={0} max={40} step={1}
                                  value={bgGlassBlur ?? 12}
                                  onChange={(e) => onDesignChange?.({ bgGlassBlur: Number(e.target.value) })}
                                  className="flex-1 accent-indigo-500" />
                              </div>

                              {/* Border Radius */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Radius: {bgGlassBorderRadius ?? 16}px</span>
                                <input type="range" min={0} max={48} step={1}
                                  value={bgGlassBorderRadius ?? 16}
                                  onChange={(e) => onDesignChange?.({ bgGlassBorderRadius: Number(e.target.value) })}
                                  className="flex-1 accent-indigo-500" />
                              </div>

                              {/* Border */}
                              <div className="flex items-center gap-2">
                                <input type="color" value={bgGlassBorderColor ?? '#ffffff'}
                                  onChange={(e) => onDesignChange?.({ bgGlassBorderColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer border p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Border Width: {bgGlassBorderWidth ?? 1}px</span>
                                <input type="range" min={0} max={8} step={1}
                                  value={bgGlassBorderWidth ?? 1}
                                  onChange={(e) => onDesignChange?.({ bgGlassBorderWidth: Number(e.target.value) })}
                                  className="flex-1 accent-indigo-500" />
                              </div>

                              {/* Gradient angle */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Angle: {bgGlassAngle ?? 135}°</span>
                                <input type="range" min={0} max={360} step={1}
                                  value={bgGlassAngle ?? 135}
                                  onChange={(e) => onDesignChange?.({ bgGlassAngle: Number(e.target.value) })}
                                  className="flex-1 accent-indigo-500" />
                              </div>

                              {/* Color Stops — up to 6 */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                                    Color Stops ({(bgGlassColorStops ?? []).length}/6)
                                  </span>
                                  {(bgGlassColorStops ?? []).length < 6 && (
                                    <button type="button"
                                      onClick={() => onDesignChange?.({
                                        bgGlassColorStops: [
                                          ...(bgGlassColorStops ?? [{ color: '#6366f1', position: 0, opacity: 30 }, { color: '#8b5cf6', position: 100, opacity: 20 }]),
                                          { color: '#ffffff', position: 50, opacity: 15 }
                                        ]
                                      })}
                                      className="text-[10px] px-2 py-0.5 rounded border cursor-pointer bg-transparent"
                                      style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
                                      + Add Stop
                                    </button>
                                  )}
                                </div>
                                {(bgGlassColorStops ?? [{ color: '#6366f1', position: 0, opacity: 30 }, { color: '#8b5cf6', position: 100, opacity: 20 }]).map((stop, i) => (
                                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border animate-fade-in" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <input type="color" value={stop.color}
                                      onChange={(e) => {
                                        const stops = [...(bgGlassColorStops ?? [])];
                                        stops[i] = { ...stops[i], color: e.target.value };
                                        onDesignChange?.({ bgGlassColorStops: stops });
                                      }}
                                      className="w-7 h-7 rounded cursor-pointer border p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>Pos: {stop.position}%</span>
                                        <input type="range" min={0} max={100} step={1} value={stop.position}
                                          onChange={(e) => {
                                            const stops = [...(bgGlassColorStops ?? [])];
                                            stops[i] = { ...stops[i], position: Number(e.target.value) };
                                            onDesignChange?.({ bgGlassColorStops: stops });
                                          }}
                                          className="flex-1 accent-indigo-500 h-1.5" />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>α: {stop.opacity}%</span>
                                        <input type="range" min={0} max={100} step={1} value={stop.opacity}
                                          onChange={(e) => {
                                            const stops = [...(bgGlassColorStops ?? [])];
                                            stops[i] = { ...stops[i], opacity: Number(e.target.value) };
                                            onDesignChange?.({ bgGlassColorStops: stops });
                                          }}
                                          className="flex-1 accent-purple-500 h-1.5" />
                                      </div>
                                    </div>
                                    <button type="button"
                                      onClick={() => {
                                        const stops = (bgGlassColorStops ?? []).filter((_, idx) => idx !== i);
                                        onDesignChange?.({ bgGlassColorStops: stops });
                                      }}
                                      className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-0 p-1"><X className="w-3.5 h-3.5" /></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Live background preview strip */}
                      {computedFormBg && (
                        <div
                          className="h-8 rounded-xl border"
                          style={{
                            background: resolveFormBg(computedFormBg),
                            borderColor: 'var(--color-border)'
                          }}
                        />
                      )}

                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
                        Form Logo — Upload or URL
                      </label>

                      {/* Position selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>Position:</span>
                        {(['top-left', 'top-right', 'top-center'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => { onDesignChange({ formLogoPosition: pos }); }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer"
                            style={formLogoPosition === pos
                              ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }
                            }
                          >
                            {pos === 'top-left' ? '↖ Left' : pos === 'top-center' ? '↑ Center' : '↗ Right'}
                          </button>
                        ))}
                      </div>

                      {/* Upload area + URL input split */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Upload zone */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type.startsWith('image/')) handleFormLogoUpload(file);
                          }}
                          onClick={() => document.getElementById('form-logo-file-input')?.click()}
                          className="border border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-accent)] transition text-center"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', minHeight: '72px' }}
                        >
                          <input
                            id="form-logo-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFormLogoUpload(file);
                            }}
                          />
                          {logoUploading ? (
                            <span className="text-[10px] font-bold" style={{ color: 'var(--color-accent)' }}>⚡ Uploading...</span>
                          ) : formLogoUrl && (formLogoUrl.startsWith('http') || formLogoUrl.startsWith('/')) ? (
                            <>
                              <img src={formLogoUrl} alt="Logo preview" className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: 'var(--color-border)' }} />
                              <span className="text-[9px] font-bold text-emerald-500">Logo set · click to replace</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 opacity-40" style={{ color: 'var(--color-text-secondary)' }} />
                              <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>Drag & drop or click</span>
                              <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>PNG, JPG, SVG · max 500KB</span>
                            </>
                          )}
                        </div>

                        {/* URL input fallback */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold block" style={{ color: 'var(--color-text-secondary)' }}>Or paste image URL</label>
                          <input
                            type="text"
                            value={formLogoUrl}
                            onChange={(e) => { onDesignChange({ formLogoUrl: e.target.value }); }}
                            placeholder="https://example.com/logo.png"
                            className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold"
                            style={inputStyle}
                          />
                          {formLogoUrl && (
                            <button
                              type="button"
                              onClick={() => { onDesignChange({ formLogoUrl: '' }); }}
                              className="text-[9px] font-bold text-red-400 hover:text-red-600 transition cursor-pointer"
                            >
                              ✕ Remove logo
                            </button>
                          )}
                        </div>

                      </div>

                      {logoUploadError && (
                        <p className="text-[10px] text-red-500 font-bold animate-pulse">⚠️ {logoUploadError}</p>
                      )}



                    </div>
                  </div>
                </div>
              )}

              {/* Section header subtitle */}
              {!['divider', 'vertical_divider', 'page_break', 'form_design_block'].includes(field.type) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                    {field.type === 'section_header' ? 'Subtitle (shown below heading)' : 'Help Text (shown below field)'}
                  </label>
                  <input type="text" value={field.helpText || ''} onChange={(e) => onChange(field.id, { helpText: e.target.value }, true)}
                    onBlur={() => markDirtyAndSave()}
                    placeholder={field.type === 'section_header' ? 'e.g. Tell us about yourself' : "e.g. We will never share your info"}
                    className="w-full border rounded-lg px-2.5 py-1.5 outline-none" style={inputStyle} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── FileUploadPreview ─────────────────────────────────────────────────────────
function FileUploadPreview({ field, onFileChange }: { field: FormField; onFileChange: (id: string, f: File | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  return (
    <div>
      <input type="file" ref={fileRef} accept={field.acceptedFileTypes || undefined} className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          setFile(f);
          onFileChange(field.id, f);
        }} />
      <div onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50/30"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        {file ? (
          <p className="text-xs font-bold flex items-center justify-center gap-2 font-sans" style={{ color: 'var(--color-accent)' }}>
            <FileText className="w-4 h-4 text-emerald-500" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        ) : (
          <>
            <FileText className="w-6 h-6 mx-auto mb-1 opacity-40 text-neutral-400" />
            <p className="text-xs font-bold font-sans" style={{ color: 'var(--color-text-secondary)' }}>Click to upload file</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {field.acceptedFileTypes || 'Any file type'} · Max {field.maxFileSizeMB || 10}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ScalePreview ──────────────────────────────────────────────────────────────
function ScalePreview({ field, value, onChange }: { field: FormField; value: number; onChange: (v: number) => void }) {
  const min = field.scaleMin ?? 1;
  const max = field.scaleMax ?? 5;
  const style = field.scaleStyle || 'numbers';
  const items = Array.from({ length: Math.max(1, max - min + 1) }, (_, i) => min + i);

  const getLabel = (n: number) => {
    if (style === 'stars') return '★';
    if (style === 'emoji') {
      const emojis = ['😞', '😐', '🙂', '😊', '😄', '🤩'];
      return emojis[Math.min(Math.max(n - min, 0), emojis.length - 1)];
    }
    return String(n);
  };

  return (
    <div className="flex gap-1.5 flex-wrap font-sans">
      {items.map(n => {
        const active = style === 'stars' ? n <= value : n === value;
        return (
          <button key={n} type="button"
            onClick={() => onChange(n)}
            className="min-w-[32px] h-8 border-2 rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer hover:scale-110 active:scale-95"
            style={{
              borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg-card)',
              color: active ? '#fff' : 'var(--color-text-secondary)',
            }}>
            {getLabel(n)}
          </button>
        );
      })}
    </div>
  );
}

// ─── PriceDisplayPreview ───────────────────────────────────────────────────────
function PriceDisplayPreview({ field, value, onChange }: { field: FormField; value: number; onChange: (v: number) => void }) {
  const mode = field.priceMode || 'static';
  const currency = field.priceCurrency || '$';

  if (mode === 'static') {
    return (
      <div className="flex justify-between items-center py-2.5 px-3 rounded-xl border font-mono text-xs"
        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{field.label}</span>
        <span className="font-sans font-black text-xs text-indigo-500">
          {field.defaultValue || `${currency}0`}
        </span>
      </div>
    );
  }

  if (mode === 'slider') {
    const min = field.priceSliderMin ?? 0;
    const max = field.priceSliderMax ?? 1000;
    const current = value || min;
    return (
      <div className="space-y-1.5 border rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
          <span>{field.label}</span>
          <span className="text-indigo-500 font-black">{currency}{current.toLocaleString()}</span>
        </div>
        <input type="range" min={min} max={max} value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--color-accent)', backgroundColor: 'var(--color-border)' }} />
        <div className="flex justify-between text-[9px] font-mono" style={{ color: 'var(--color-text-secondary)' }}>
          <span>{currency}{min.toLocaleString()}</span>
          <span>{currency}{max.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  // manual
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{field.label}</label>
      <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <span className="px-3 py-2.5 text-xs font-bold border-r shrink-0"
          style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
          {currency}
        </span>
        <input type="number" value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0.00"
          className="flex-1 px-3 py-2 text-xs outline-none"
          style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }} />
      </div>
    </div>
  );
}

// ─── Live preview (fully interactive) ─────────────────────────────────────────
function FormPreview({
  fields, serviceName, fees, description, formBg, formLogoUrl, formLogoPosition = 'top-left', hideTitle = true,
  formBgBlendMode = 'normal', formBgSize = 'cover', formBgOpacity = 100,
  onChange, markDirtyAndSave
}: {
  fields: FormField[];
  serviceName: string;
  fees: string;
  description: string;
  formBg?: string;
  formLogoUrl?: string;
  formLogoPosition?: 'top-left' | 'top-right' | 'top-center';
  hideTitle?: boolean;
  formBgBlendMode?: string;
  formBgSize?: 'cover' | 'contain' | 'auto';
  formBgOpacity?: number;
  onChange?: (id: string, updated: Partial<FormField>) => void;
  markDirtyAndSave?: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [checkedOptions, setCheckedOptions] = useState<Record<string, string[]>>({});
  const [selectedOption, setSelectedOption] = useState<Record<string, string>>({});
  const [scaleValue, setScaleValue] = useState<Record<string, number>>({});
  const [priceValue, setPriceValue] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, number>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});

  // Canvas selection and pointer-based drag states
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    fieldId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    currentX: number;
    currentY: number;
    guides: { x?: number; y?: number } | null;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, field: FormField) => {
    e.preventDefault();
    e.stopPropagation();

    const origX = field.positionX ?? 0;
    const origY = field.positionY ?? 0;

    setActiveDrag({
      fieldId: field.id,
      startX: e.clientX,
      startY: e.clientY,
      origX,
      origY,
      currentX: origX,
      currentY: origY,
      guides: null
    });

    setSelectedFieldId(field.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    e.preventDefault();
    e.stopPropagation();

    const dragField = fields.find(f => f.id === activeDrag.fieldId);
    if (!dragField) return;

    const deltaX = e.clientX - activeDrag.startX;
    const deltaY = e.clientY - activeDrag.startY;

    let nextX = activeDrag.origX + deltaX;
    let nextY = activeDrag.origY + deltaY;

    // Alignment and snapping comparison logic
    const otherFields = fields.filter(f => f.positionMode === 'absolute' && f.id !== dragField.id);
    let guideLines: { x?: number; y?: number } | null = null;
    const snapThreshold = 6;

    for (const other of otherFields) {
      const otherX = other.positionX ?? 0;
      const otherY = other.positionY ?? 0;

      // Snap left edge
      if (Math.abs(nextX - otherX) < snapThreshold) {
        nextX = otherX;
        guideLines = { ...guideLines, x: otherX };
      }

      // Snap top edge
      if (Math.abs(nextY - otherY) < snapThreshold) {
        nextY = otherY;
        guideLines = { ...guideLines, y: otherY };
      }
    }

    setActiveDrag(prev => prev ? {
      ...prev,
      currentX: nextX,
      currentY: nextY,
      guides: guideLines
    } : null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const finalX = activeDrag.currentX;
    const finalY = activeDrag.currentY;
    const dragId = activeDrag.fieldId;

    setActiveDrag(null);

    if (onChange) {
      onChange(dragId, { positionX: finalX, positionY: finalY, positionPreset: 'none' });
      if (markDirtyAndSave) {
        markDirtyAndSave();
      }
    }
  };

  const safeMathEval = (exprString: string): number => {
    const safeExpr = exprString.replace(/[^0-9+\-*/().\s]/g, '');
    try {
      const result = new Function(`return (${safeExpr})`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  };

  const designBlock = useMemo(() => fields.find(f => f.type === 'form_design_block'), [fields]);

  useEffect(() => {
    if (designBlock) {
      if (designBlock.fontFamilyAll) loadGoogleFont(designBlock.fontFamilyAll);
      if (designBlock.fontFamilyTitle) loadGoogleFont(designBlock.fontFamilyTitle);
      if (designBlock.fontFamilyBody) loadGoogleFont(designBlock.fontFamilyBody);
      if (designBlock.fontFamilyButton) loadGoogleFont(designBlock.fontFamilyButton);
    }
  }, [designBlock]);

  const handleValue = (id: string, val: any) => setValues(prev => ({ ...prev, [id]: val }));

  const fieldInputStyle: React.CSSProperties = {
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
  };

  const getBorderStyle = (field: FormField): React.CSSProperties => {
    const style: React.CSSProperties = {
      borderTopWidth: field.borderTop !== false ? `${field.borderWidth ?? 1}px` : '0px',
      borderRightWidth: field.borderRight !== false ? `${field.borderWidth ?? 1}px` : '0px',
      borderBottomWidth: field.borderBottom !== false ? `${field.borderWidth ?? 1}px` : '0px',
      borderLeftWidth: field.borderLeft !== false ? `${field.borderWidth ?? 1}px` : '0px',
      borderStyle: 'solid',
      borderColor: field.borderColor || 'var(--color-border)',
      borderRadius: `${field.borderRadius ?? 8}px`,
    };
    if (field.fieldBgColor) {
      style.backgroundColor = field.fieldBgColor;
    }
    return style;
  };

  const getAbsoluteStyle = (field: FormField): React.CSSProperties => {
    if (field.positionMode !== 'absolute') return {};

    const preset = field.positionPreset;
    const dynamicZIndex = field.zIndex ?? 0;
    const dynamicOpacity = (field.opacity ?? 100) / 100;

    let currentX = field.positionX ?? 0;
    let currentY = field.positionY ?? 0;

    if (activeDrag && activeDrag.fieldId === field.id) {
      currentX = activeDrag.currentX;
      currentY = activeDrag.currentY;
    }

    if (preset && preset !== 'none') {
      const presets: Record<string, React.CSSProperties> = {
        'top-left':      { position: 'absolute', top: 0, left: 0 },
        'top-center':    { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' },
        'top-right':     { position: 'absolute', top: 0, right: 0 },
        'center':        { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
        'bottom-left':   { position: 'absolute', bottom: 0, left: 0 },
        'bottom-center': { position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' },
        'bottom-right':  { position: 'absolute', bottom: 0, right: 0 },
      };
      return {
        ...presets[preset],
        width: field.positionWidth ?? '100%',
        zIndex: dynamicZIndex,
        opacity: dynamicOpacity
      };
    }

    return {
      position: 'absolute',
      left: `${currentX}px`,
      top: `${currentY}px`,
      width: field.positionWidth ?? '100%',
      zIndex: dynamicZIndex,
      opacity: dynamicOpacity,
    };
  };

  const renderField = (field: FormField) => {
    const isAbsolute = field.positionMode === 'absolute';
    const isSelected = selectedFieldId === field.id;

    return (
      <div
        key={field.id}
        className={`animate-fade-in ${isAbsolute ? 'group select-none' : 'space-y-1.5'}`}
        style={getAbsoluteStyle(field)}
        onClick={(e) => {
          if (onChange && isAbsolute) {
            e.stopPropagation();
            setSelectedFieldId(field.id);
          }
        }}
      >
        {isAbsolute && onChange && (
          <>
            {/* Guide borders */}
            <div
              className={`absolute -inset-2 pointer-events-none rounded-xl border-2 border-dashed z-40 transition-all ${
                isSelected
                  ? 'border-indigo-500 opacity-100 scale-100'
                  : 'border-indigo-400 opacity-0 group-hover:opacity-40 scale-95'
              }`}
            />

            {/* Grab handle with Pointer Capture */}
            <div
              className={`absolute -top-3.5 -left-3.5 z-50 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md cursor-move select-none transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => handlePointerDown(e, field)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag field to position"
            >
              <Move className="w-3.5 h-3.5" />
            </div>
          </>
        )}
        {/* Layout: form title */}
        {field.type === 'form_title' && (() => {
          const style: React.CSSProperties = {
            fontSize: field.titleFontSize ? `${field.titleFontSize}px` : (field.textFontSize ? `${field.textFontSize}px` : '28px'),
            fontWeight: field.textBold ? 'bold' : (field.titleFontWeight || 'bold'),
            fontStyle: field.textItalic ? 'italic' : 'normal',
            textDecoration: field.textUnderline ? 'underline' : 'none',
            color: field.textColor || field.titleColor || 'var(--color-text-primary)',
            textTransform: (field.textTransform && field.textTransform !== 'none') ? field.textTransform : undefined,
            display: 'block',
            lineHeight: 1.2,
            fontFamily: designBlock?.fontFamilyTitle || designBlock?.fontFamilyAll || 'inherit',
          };
          const content = field.label;
          const alignStyle: React.CSSProperties = { textAlign: field.titleAlign || 'left' };
          const tag = field.textTag || 'span';

          return (
            <div style={alignStyle}>
              {tag === 'h1' && <h1 style={style}>{content}</h1>}
              {tag === 'h2' && <h2 style={style}>{content}</h2>}
              {tag === 'h3' && <h3 style={style}>{content}</h3>}
              {tag === 'h4' && <h4 style={style}>{content}</h4>}
              {tag === 'h5' && <h5 style={style}>{content}</h5>}
              {tag === 'h6' && <h6 style={style}>{content}</h6>}
              {tag === 'p' && <p style={style}>{content}</p>}
              {tag === 'span' && <span style={style}>{content}</span>}
            </div>
          );
        })()}

        {/* Layout: divider */}
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

        {/* Layout: vertical divider */}
        {field.type === 'vertical_divider' && (
          <div className="flex justify-center items-stretch py-1 mx-auto" style={{ minHeight: '40px' }}>
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

        {/* Layout: page break */}
        {field.type === 'page_break' && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <ChevronRight className="w-3 h-3 text-indigo-500" /> {field.label || 'Next Step'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>
        )}

        {/* Layout: section header */}
        {field.type === 'section_header' && (() => {
          const style: React.CSSProperties = {
            fontWeight: field.textBold ? 'bold' : 'bold',
            fontStyle: field.textItalic ? 'italic' : 'normal',
            textDecoration: field.textUnderline ? 'underline' : 'none',
            color: field.textColor || 'var(--color-text-primary)',
            fontSize: field.titleFontSize ? `${field.titleFontSize}px` : (field.textFontSize ? `${field.textFontSize}px` : undefined),
            textTransform: (field.textTransform && field.textTransform !== 'none') ? field.textTransform : 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            display: 'block',
          };
          const content = field.label;
          const tag = field.textTag || 'h4';

          return (
            <div className="pt-3 pb-1">
              {tag === 'h1' && <h1 style={style}>{content}</h1>}
              {tag === 'h2' && <h2 style={style}>{content}</h2>}
              {tag === 'h3' && <h3 style={style}>{content}</h3>}
              {tag === 'h4' && <h4 style={style}>{content}</h4>}
              {tag === 'h5' && <h5 style={style}>{content}</h5>}
              {tag === 'h6' && <h6 style={style}>{content}</h6>}
              {tag === 'p' && <p style={style}>{content}</p>}
              {tag === 'span' && <span style={style}>{content}</span>}
              {field.helpText && (
                <p className="text-[11px] mt-1 leading-relaxed animate-fade-in" style={{ color: 'var(--color-text-secondary)', fontSize: field.textFontSize ? `${field.textFontSize}px` : undefined }}>
                  {field.helpText}
                </p>
              )}
              <div className="mt-2 h-[2px] rounded-full" style={{ background: 'var(--accent-gradient)' }} />
            </div>
          );
        })()}

        {/* Layout: rich text */}
        {field.type === 'rich_text' && (() => {
          const style: React.CSSProperties = {
            fontWeight: field.textBold ? 'bold' : 'normal',
            fontStyle: field.textItalic ? 'italic' : 'normal',
            textDecoration: field.textUnderline ? 'underline' : 'none',
            color: field.textColor || 'var(--color-text-primary)',
            fontSize: field.textFontSize ? `${field.textFontSize}px` : undefined,
            textTransform: (field.textTransform && field.textTransform !== 'none') ? field.textTransform : undefined,
            display: 'block',
            lineHeight: 1.4,
          };
          const content = field.label;
          const tag = field.textTag || 'p';

          return (
            <div className="py-1">
              {tag === 'h1' && <h1 style={style}>{content}</h1>}
              {tag === 'h2' && <h2 style={style}>{content}</h2>}
              {tag === 'h3' && <h3 style={style}>{content}</h3>}
              {tag === 'h4' && <h4 style={style}>{content}</h4>}
              {tag === 'h5' && <h5 style={style}>{content}</h5>}
              {tag === 'h6' && <h6 style={style}>{content}</h6>}
              {tag === 'p' && <p style={style}>{content}</p>}
              {tag === 'span' && <span style={style}>{content}</span>}
              {field.helpText && (
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {field.helpText}
                </p>
              )}
            </div>
          );
        })()}

        {/* Layout: column containers */}
        {(field.type === 'single_column_row' || field.type === 'two_column_row' || field.type === 'three_column_row') && (() => {
          const defaultColData = field.type === 'single_column_row' ? [[]] : field.type === 'two_column_row' ? [[], []] : [[], [], []];
          const colsArray = field.columnFields || defaultColData;
          const colLen = colsArray.length;
          const gridColsClass = colLen === 1 ? 'grid-cols-1' : colLen === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
          return (
            <div className={`grid gap-4 ${gridColsClass}`}>
              {colsArray.map((colFields, colIdx) => (
                <div
                  key={field.columnIds?.[colIdx] ?? colIdx}
                  className="space-y-3"
                  style={{
                    height: field.columnHeights?.[colIdx] != null ? `${field.columnHeights[colIdx]}px` : 'auto',
                    minHeight: field.columnHeights?.[colIdx] != null ? undefined : '60px',
                    width: field.columnWidths?.[colIdx] || undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: field.columnAlignments?.[colIdx] ?? 'stretch',
                    overflowY: field.columnHeights?.[colIdx] != null ? 'auto' : undefined,
                  }}
                >
                  {colFields.map((cf) => renderField(cf))}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Advanced: price display */}
        {field.type === 'price_display' && (
          <PriceDisplayPreview
            field={field}
            value={priceValue[field.id] || 0}
            onChange={(v) => setPriceValue(prev => ({ ...prev, [field.id]: v }))}
          />
        )}

        {/* Advanced: CTA button */}
        {field.type === 'cta_button' && (() => {
          if (field.ctaIsSocialGroup) {
            const isVertical = field.ctaSocialLayout === 'vertical';
            const size = field.ctaSocialSize || 24;
            const links = field.ctaSocialLinks || [];

            if (links.length === 0) {
              return (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-lg space-x-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <Share2 className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">No social media links added yet.</span>
                </div>
              );
            }

            const getGroupIcon = (platform: string, color: string) => {
              const iconProps = {
                style: { width: `${size}px`, height: `${size}px`, color: color || 'currentColor' },
                className: "transition-transform duration-200 hover:scale-110 shrink-0"
              };
              switch (platform) {
                case 'facebook': return <Facebook {...iconProps} />;
                case 'instagram': return <Instagram {...iconProps} />;
                case 'linkedin': return <Linkedin {...iconProps} />;
                case 'twitter': return <Twitter {...iconProps} />;
                case 'youtube': return <Youtube {...iconProps} />;
                case 'whatsapp': return <MessageCircle {...iconProps} />;
                default: return <Share2 {...iconProps} />;
              }
            };

            return (
              <div 
                className={`flex ${isVertical ? 'flex-col space-y-3' : 'flex-row gap-4 flex-wrap justify-center'} items-center w-full`}
                style={{
                  padding: '12px',
                  borderRadius: field.ctaBorderRadius !== undefined ? `${field.ctaBorderRadius}px` : '8px',
                  border: isVertical ? '1px solid var(--color-border)' : 'none',
                  backgroundColor: 'var(--color-bg-secondary)',
                }}
              >
                {links.map((link, idx) => (
                  <React.Fragment key={idx}>
                    <a
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={!link.url ? (e) => e.preventDefault() : undefined}
                      className="inline-flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                      title={link.platform}
                    >
                      {getGroupIcon(link.platform, link.color)}
                    </a>
                    {isVertical && idx < links.length - 1 && (
                      <div className="w-full text-center text-[10px] opacity-20" style={{ color: 'var(--color-text-secondary)' }}>—</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          }

          const bgMode = field.ctaBgMode || 'solid';
          let background = field.ctaBgColor || '#6366f1';
          if (bgMode !== 'solid' && field.ctaBgGradient) {
            const angle = bgMode === 'linear' ? (field.ctaGradientAngle ?? 135) : '';
            const gradArgs = field.ctaBgGradient.includes('gradient') ? field.ctaBgGradient
              : bgMode === 'linear'
                ? `linear-gradient(${angle}deg, ${field.ctaBgGradient})`
                : `${bgMode}-gradient(${field.ctaBgGradient})`;
            background = gradArgs;
          }
          const hoverBgMode = field.ctaHoverBgMode || 'solid';
          let hoverBackground = field.ctaHoverBgColor || '#4f46e5';
          if (hoverBgMode !== 'solid' && field.ctaHoverBgGradient) {
            const hAngle = hoverBgMode === 'linear' ? (field.ctaHoverGradientAngle ?? 135) : '';
            hoverBackground = hoverBgMode === 'linear'
              ? `linear-gradient(${hAngle}deg, ${field.ctaHoverBgGradient})`
              : `${hoverBgMode}-gradient(${field.ctaHoverBgGradient})`;
          }
          const transition = `background ${field.ctaTransitionDuration ?? 300}ms ease, transform 150ms ease`;
          const target = field.ctaTarget === '_new' ? '_blank' : (field.ctaTarget || '_blank');
          const rel = target === '_blank' ? 'noopener noreferrer' : undefined;

          const getSocialIcon = () => {
            switch (field.ctaIcon) {
              case 'facebook': return <Facebook className="w-4 h-4 text-white inline-block mr-2 animate-bounce-slow" />;
              case 'twitter': return <Twitter className="w-4 h-4 text-white inline-block mr-2 animate-bounce-slow" />;
              case 'instagram': return <Instagram className="w-4 h-4 text-white inline-block mr-2" />;
              case 'linkedin': return <Linkedin className="w-4 h-4 text-white inline-block mr-2" />;
              case 'youtube': return <Youtube className="w-4 h-4 text-white inline-block mr-2" />;
              case 'whatsapp': return <MessageSquare className="w-4 h-4 text-white inline-block mr-2" />;
              default: return null;
            }
          };

          return (
            <a
              href={field.ctaUrl || '#'}
              target={target}
              rel={rel}
              onClick={!field.ctaUrl ? (e) => e.preventDefault() : undefined}
              style={{
                background,
                transition,
                display: 'flex',
                alignItems: 'center',
                justifyContent: field.ctaArrowEnabled ? 'space-between' : 'center',
                borderRadius: field.ctaBorderRadius !== undefined ? `${field.ctaBorderRadius}px` : undefined,
                fontFamily: designBlock?.fontFamilyButton || designBlock?.fontFamilyAll || 'inherit',
                paddingLeft: field.ctaArrowEnabled ? '16px' : undefined,
                paddingRight: field.ctaArrowEnabled ? '16px' : undefined,
              }}
              className="w-full py-3 text-white text-sm font-black text-center shadow-lg cursor-pointer font-sans"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBackground; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = background; }}
            >
              <div className="flex items-center">
                {getSocialIcon()}
                <span>{field.ctaLabel || field.label || 'Submit'}</span>
              </div>
              {field.ctaArrowEnabled && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: `${(field.ctaArrowSize ?? 16) + 10}px`,
                    height: `${(field.ctaArrowSize ?? 16) + 10}px`,
                    borderRadius: `${field.ctaArrowBorderRadius ?? 50}px`,
                    backgroundColor: field.ctaArrowBgColor ?? '#ffffff',
                    border: (field.ctaArrowBorderWidth ?? 0) > 0
                      ? `${field.ctaArrowBorderWidth}px solid ${field.ctaArrowBorderColor ?? 'rgba(255,255,255,0.3)'}`
                      : 'none',
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRight
                    style={{
                      width: `${field.ctaArrowSize ?? 16}px`,
                      height: `${field.ctaArrowSize ?? 16}px`,
                      color: field.ctaArrowColor ?? '#6366f1',
                    }}
                  />
                </span>
              )}
            </a>
          );
        })()}

        {/* Premium Fields: time_picker */}
        {field.type === 'time_picker' && (
          <div className="space-y-1.5 font-sans">
            <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
            </label>
            <input
              type="time"
              value={values[field.id] || ''}
              onChange={(e) => handleValue(field.id, e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-xs outline-none transition focus:ring-2"
              style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Premium Fields: date_range */}
        {field.type === 'date_range' && (
          <div className="space-y-1.5 font-sans">
            <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <CalendarRange className="w-4 h-4 text-indigo-500" />
              <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Start Date</span>
                <input
                  type="date"
                  value={(values[field.id] || {}).start || ''}
                  onChange={(e) => {
                    const existing = values[field.id] || {};
                    handleValue(field.id, { ...existing, start: e.target.value });
                  }}
                  className="w-full border rounded-xl px-3 py-2 text-xs outline-none transition"
                  style={{ ...fieldInputStyle, ...getBorderStyle(field) } as any}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">End Date</span>
                <input
                  type="date"
                  value={(values[field.id] || {}).end || ''}
                  onChange={(e) => {
                    const existing = values[field.id] || {};
                    handleValue(field.id, { ...existing, end: e.target.value });
                  }}
                  className="w-full border rounded-xl px-3 py-2 text-xs outline-none transition"
                  style={{ ...fieldInputStyle, ...getBorderStyle(field) } as any}
                />
              </div>
            </div>
            {field.dateRangeMinNights && (
              <p className="text-[10px] text-indigo-500 font-semibold">Minimum stay: {field.dateRangeMinNights} nights</p>
            )}
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Premium Fields: address_autocomplete */}
        {field.type === 'address_autocomplete' && (
          <div className="space-y-1.5 font-sans">
            <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-secondary)' }}>
                <MapPin className="w-4 h-4 text-neutral-400" />
              </span>
              <input
                type="text"
                value={values[field.id] || ''}
                onChange={(e) => handleValue(field.id, e.target.value)}
                placeholder={field.placeholder || 'Start typing your address...'}
                className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none transition focus:ring-2"
                style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
              />
            </div>
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Premium Fields: color_picker */}
        {field.type === 'color_picker' && (
          <div className="space-y-1.5 font-sans">
            <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <Pipette className="w-4 h-4 text-indigo-500" />
              <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={values[field.id] || field.colorPickerDefault || '#6366f1'}
                onChange={(e) => handleValue(field.id, e.target.value)}
                className="w-10 h-10 p-0 border rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono font-bold uppercase">{values[field.id] || field.colorPickerDefault || '#6366f1'}</span>
            </div>
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Premium Fields: signature_pad */}
        {field.type === 'signature_pad' && (() => {
          const canvasRef = useRef<HTMLCanvasElement | null>(null);
          const [isDrawing, setIsDrawing] = useState(false);

          useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.strokeStyle = field.signaturePadPenColor || '#1e1b4b';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
          }, [field.signaturePadPenColor]);

          const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            let clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            ctx.beginPath();
            ctx.moveTo(clientX - rect.left, clientY - rect.top);
            setIsDrawing(true);
          };

          const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            if (!isDrawing) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            let clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            ctx.lineTo(clientX - rect.left, clientY - rect.top);
            ctx.stroke();
          };

          const stopDrawing = () => {
            if (!isDrawing) return;
            setIsDrawing(false);
            const canvas = canvasRef.current;
            if (canvas) {
              const dataUrl = canvas.toDataURL();
              handleValue(field.id, dataUrl);
            }
          };

          const clearPad = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            handleValue(field.id, '');
          };

          return (
            <div className="space-y-1.5 font-sans">
              <label className="font-bold flex items-center justify-between" style={{ color: 'var(--color-text-primary)' }}>
                <span className="flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-indigo-500" />
                  {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                </span>
                <button type="button" onClick={clearPad} className="text-[10px] text-neutral-400 font-bold hover:text-red-500 transition">Clear</button>
              </label>
              <div className="relative border rounded-xl overflow-hidden bg-white" style={{ borderColor: 'var(--color-border)' }}>
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[120px] touch-none cursor-crosshair bg-white"
                />
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: otp_input */}
        {field.type === 'otp_input' && (() => {
          const len = field.otpLength || 6;
          const currentVal = values[field.id] || '';
          return (
            <div className="space-y-1.5 font-sans">
              <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
              </label>
              <div className="flex gap-2">
                {Array.from({ length: len }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={currentVal[i] || ''}
                    onChange={(e) => {
                      const nextChar = e.target.value.slice(-1);
                      let updated = currentVal.padEnd(len, ' ').split('');
                      updated[i] = nextChar || ' ';
                      const joined = updated.join('').trimEnd();
                      handleValue(field.id, joined);
                      if (nextChar && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className="w-10 h-10 border rounded-lg text-center text-sm font-black focus:ring-2 outline-none"
                    style={{ ...fieldInputStyle, '--tw-ring-color': 'var(--color-accent)' } as any}
                  />
                ))}
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: hidden_field */}
        {field.type === 'hidden_field' && (
          <div className="border border-dashed border-neutral-300 p-2 text-center rounded-lg bg-neutral-50 flex items-center justify-center gap-1.5 font-sans select-none">
            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">[Hidden Field] {field.label} = {values[field.id] || field.hiddenFieldValue || '(empty)'}</span>
          </div>
        )}

        {/* Premium Fields: calculation_field */}
        {field.type === 'calculation_field' && (() => {
          const expr = field.calculationExpression || '';
          let parsedExpr = expr;
          const fieldMatches = expr.match(/field-[\w\-]+/g) || [];
          fieldMatches.forEach((fId) => {
            const rawVal = values[fId];
            const numVal = rawVal !== undefined && rawVal !== null && !isNaN(Number(rawVal)) ? Number(rawVal) : 0;
            parsedExpr = parsedExpr.replaceAll(fId, String(numVal));
          });
          const result = safeMathEval(parsedExpr);
          return (
            <div className="space-y-1.5 p-3 rounded-xl border bg-neutral-50/50 font-sans" style={{ borderColor: 'var(--color-border)' }}>
              <label className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
                <Calculator className="w-3.5 h-3.5 text-indigo-500" /> {field.label}
              </label>
              <div className="text-lg font-mono font-bold text-indigo-600">
                {field.calculationPrefix || ''}{result.toLocaleString(undefined, { minimumFractionDigits: field.calculationDecimalPlaces ?? 2, maximumFractionDigits: field.calculationDecimalPlaces ?? 2 })}{field.calculationSuffix || ''}
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: matrix_grid */}
        {field.type === 'matrix_grid' && (() => {
          const rows = field.matrixRows || ['Question 1', 'Question 2'];
          const cols = field.matrixColumns || ['Option A', 'Option B', 'Option C'];
          const valObj = values[field.id] || {};
          return (
            <div className="space-y-1.5 font-sans overflow-x-auto">
              <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                <Table className="w-4 h-4 text-indigo-500" />
                <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
              </label>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="py-2 font-bold text-neutral-400" style={{ color: 'var(--color-text-secondary)' }}>Question</th>
                    {cols.map((col, idx) => (
                      <th key={idx} className="py-2 px-3 text-center font-bold text-neutral-400" style={{ color: 'var(--color-text-secondary)' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((rowName, rIdx) => (
                    <tr key={rIdx} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="py-2.5 font-semibold text-neutral-800" style={{ color: 'var(--color-text-primary)' }}>{rowName}</td>
                      {cols.map((colName, cIdx) => {
                        const checked = valObj[rowName] === colName;
                        return (
                          <td key={cIdx} className="py-2.5 px-3 text-center">
                            <input
                              type="radio"
                              name={`${field.id}_row_${rIdx}`}
                              checked={checked}
                              onChange={() => {
                                handleValue(field.id, { ...valObj, [rowName]: colName });
                              }}
                              className="h-3.5 w-3.5 text-indigo-600 focus:ring-2"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: ranking_field */}
        {field.type === 'ranking_field' && (() => {
          const items = values[field.id] || field.rankingItems || ['Item Alpha', 'Item Beta', 'Item Gamma'];
          const moveRank = (idx: number, dir: 'up' | 'down') => {
            const next = [...items];
            if (dir === 'up' && idx > 0) {
              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            } else if (dir === 'down' && idx < next.length - 1) {
              [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            }
            handleValue(field.id, next);
          };
          return (
            <div className="space-y-1.5 font-sans">
              <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                <ListOrdered className="w-4 h-4 text-indigo-500" />
                <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
              </label>
              <div className="space-y-2">
                {items.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-xs font-semibold text-neutral-800" style={{ color: 'var(--color-text-primary)' }}>{idx + 1}. {item}</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveRank(idx, 'up')}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => moveRank(idx, 'down')}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: nps_score */}
        {field.type === 'nps_score' && (() => {
          const val = values[field.id];
          return (
            <div className="space-y-1.5 font-sans">
              <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
              </label>
              <div className="flex justify-between gap-1 overflow-x-auto py-1">
                {Array.from({ length: 11 }).map((_, i) => {
                  const active = val === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleValue(field.id, i)}
                      className="w-8 h-8 rounded-full border text-xs font-black transition flex items-center justify-center shrink-0"
                      style={active
                        ? { backgroundColor: 'var(--color-accent)', color: '#ffffff', borderColor: 'var(--color-accent)' }
                        : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{field.npsMinLabel || 'Not likely'}</span>
                <span>{field.npsMaxLabel || 'Extremely likely'}</span>
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: country_selector */}
        {field.type === 'country_selector' && (
          <div className="space-y-1.5 font-sans">
            <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-secondary)' }}>
                <Globe className="w-4 h-4 text-neutral-400" />
              </span>
              <select
                value={values[field.id] || field.countrySelectorDefault || ''}
                onChange={(e) => handleValue(field.id, e.target.value)}
                className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none appearance-none transition focus:ring-2 font-sans font-medium"
                style={{ ...fieldInputStyle, '--tw-ring-color': 'var(--color-accent)' } as any}
              >
                <option value="">Select country...</option>
                {WORLD_COUNTRIES.map((ctry) => (
                  <option key={ctry} value={ctry}>{ctry}</option>
                ))}
              </select>
            </div>
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Premium Fields: terms_checkbox */}
        {field.type === 'terms_checkbox' && (
          <div className="flex items-start gap-2.5 py-1 font-sans">
            <input
              type="checkbox"
              id={field.id}
              checked={!!values[field.id]}
              onChange={(e) => handleValue(field.id, e.target.checked)}
              className="mt-1 h-3.5 w-3.5 rounded border text-indigo-600 focus:ring-2 cursor-pointer"
              style={{ accentColor: 'var(--color-accent)' }}
              required={field.required}
            />
            <label htmlFor={field.id} className="text-xs select-none leading-relaxed cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
              {field.termsText || 'I agree to the'}{' '}
              {field.termsLinkText && field.termsLinkUrl ? (
                <a href={field.termsLinkUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-80 animate-pulse text-indigo-600" style={{ color: 'var(--color-accent)' }}>
                  {field.termsLinkText}
                </a>
              ) : (
                <span className="font-bold underline text-indigo-600" style={{ color: 'var(--color-accent)' }}>Terms & Conditions</span>
              )}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
              {field.helpText && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </label>
          </div>
        )}

        {/* Premium Fields: accordion_section */}
        {field.type === 'accordion_section' && (() => {
          const subFields = field.accordionFields || [];
          const activeIndex = expandedAccordions[field.id] !== undefined ? expandedAccordions[field.id] : 0;
          return (
            <div className="space-y-2 border rounded-xl p-3 font-sans bg-white" style={{ borderColor: 'var(--color-border)' }}>
              {field.label && <label className="font-bold block text-neutral-800" style={{ color: 'var(--color-text-primary)' }}>{field.label}</label>}
              <div className="space-y-2">
                {subFields.map((f, idx) => {
                  const isOpen = activeIndex === idx;
                  return (
                    <div key={f.id} className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                      <button
                        type="button"
                        onClick={() => setExpandedAccordions(prev => ({ ...prev, [field.id]: isOpen ? -1 : idx }))}
                        className="w-full flex justify-between items-center px-3.5 py-2.5 bg-neutral-50/50 text-xs font-bold transition-colors hover:bg-neutral-50 outline-none"
                      >
                        <span style={{ color: 'var(--color-text-primary)' }}>{f.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-3 bg-white space-y-3"
                          >
                            {renderField(f)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Premium Fields: tab_container */}
        {field.type === 'tab_container' && (() => {
          const tabLabels = field.tabLabels || ['Tab A', 'Tab B'];
          const activeIdx = activeTabs[field.id] !== undefined ? activeTabs[field.id] : 0;
          const contents = field.tabContents || [[], []];
          const activeFields = contents[activeIdx] || [];
          return (
            <div className="border rounded-xl p-3 font-sans bg-white space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              {field.label && <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>{field.label}</label>}
              <div className="flex border-b overflow-x-auto gap-1" style={{ borderColor: 'var(--color-border)' }}>
                {tabLabels.map((lbl, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTabs(prev => ({ ...prev, [field.id]: idx }))}
                      className="px-3 py-1.5 text-xs font-bold border-b-2 transition"
                      style={isActive
                        ? { color: 'var(--color-accent)', borderBottomColor: 'var(--color-accent)' }
                        : { color: 'var(--color-text-secondary)', borderBottomColor: 'transparent' }}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3 pt-1">
                {activeFields.map((f) => renderField(f))}
              </div>
            </div>
          );
        })()}

        {/* Premium Fields: repeating_section */}
        {field.type === 'repeating_section' && (() => {
          const template = field.repeatingFieldGroup || [];
          const rowCount = values[`${field.id}_row_count`] || 1;
          const addRow = () => {
            const max = field.repeatingMaxRows || 10;
            if (rowCount < max) {
              handleValue(`${field.id}_row_count`, rowCount + 1);
            }
          };
          const delRow = (idx: number) => {
            const min = field.repeatingMinRows || 1;
            if (rowCount > min) {
              handleValue(`${field.id}_row_count`, rowCount - 1);
            }
          };
          return (
            <div className="border rounded-xl p-3 font-sans bg-white space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex justify-between items-center">
                <label className="font-bold flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  <Repeat className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span>{field.label}</span>
                </label>
                <button
                  type="button"
                  onClick={addRow}
                  className="text-[10px] text-indigo-600 font-black hover:underline"
                >
                  + Add Item Row
                </button>
              </div>
              <div className="space-y-3">
                {Array.from({ length: rowCount }).map((_, rIdx) => (
                  <div key={rIdx} className="border p-3 rounded-lg relative bg-neutral-50/10" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between items-center mb-2 border-b pb-1">
                      <span className="text-[10px] font-black uppercase text-neutral-400">Entry #{rIdx + 1}</span>
                      {rowCount > (field.repeatingMinRows || 1) && (
                        <button
                          type="button"
                          onClick={() => delRow(rIdx)}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          Remove Row
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {template.map((tf) => {
                        const clone = { ...tf, id: `${tf.id}_row_${rIdx}` };
                        return renderField(clone);
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Premium Fields: progress_bar */}
        {field.type === 'progress_bar' && (() => {
          const activeFields = fields.filter(f => !['form_title', 'divider', 'page_break', 'section_header', 'rich_text', 'progress_bar', 'header_image_banner', 'video_embed', 'shape_framed_image', 'logo_mark', 'form_design_block', 'single_column_row', 'two_column_row', 'three_column_row', 'accordion_section', 'tab_container', 'repeating_section'].includes(f.type));
          const completedCount = activeFields.filter(f => {
            const val = values[f.id];
            if (val === undefined || val === null || val === '') return false;
            if (Array.isArray(val) && val.length === 0) return false;
            return true;
          }).length;
          const pct = activeFields.length > 0 ? Math.round((completedCount / activeFields.length) * 100) : 0;
          return (
            <div className="py-2.5 space-y-1.5 font-sans">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> {field.label || 'Progress'}</span>
                <span>{pct}% Completed</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: 'var(--accent-gradient)' }} />
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: header_image_banner */}
        {field.type === 'header_image_banner' && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: `${field.bannerHeight || 180}px`,
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
            className="flex items-center justify-center font-sans tracking-tight shrink-0 shadow-sm"
          >
            {field.bannerImageUrl ? (
              <img
                src={field.bannerImageUrl}
                alt={field.label || 'Banner'}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: `scale(${1 + (field.bannerParallaxSpeed || 0.2)})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400">🖼 Wide Banner Image Overlay</div>
            )}
            {field.bannerOverlayText && (
              <div
                className="absolute px-5 py-2.5 rounded-lg shadow-sm font-bold text-center z-10 text-sm md:text-base border transition animate-fade-in"
                style={{
                  color: field.bannerOverlayTextColor || '#ffffff',
                  backgroundColor: field.bannerOverlayBgColor || 'rgba(0,0,0,0.4)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  ...(() => {
                    const align = field.bannerOverlayPosition || 'center';
                    const styles: Record<string, React.CSSProperties> = {
                      'top-left':      { top: '12px', left: '12px' },
                      'top-center':    { top: '12px', left: '50%', transform: 'translateX(-50%)' },
                      'top-right':     { top: '12px', right: '12px' },
                      'center':        { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
                      'bottom-left':   { bottom: '12px', left: '12px' },
                      'bottom-center': { bottom: '12px', left: '50%', transform: 'translateX(-50%)' },
                      'bottom-right':  { bottom: '12px', right: '12px' },
                    };
                    return styles[align] || styles['center'];
                  })()
                }}
              >
                {field.bannerOverlayText}
              </div>
            )}
          </div>
        )}

        {/* Premium Fields: video_embed */}
        {field.type === 'video_embed' && (() => {
          const url = field.videoUrl || '';
          let embedUrl = url;
          if (url.includes('youtube.com/watch?v=')) {
            const id = url.split('v=')[1]?.split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${id}`;
          } else if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${id}`;
          } else if (url.includes('vimeo.com/')) {
            const id = url.split('vimeo.com/')[1]?.split('?')[0];
            embedUrl = `https://player.vimeo.com/video/${id}`;
          }
          return (
            <div className="space-y-1.5 font-sans">
              {field.label && <label className="font-bold flex items-center gap-1.5 mb-1" style={{ color: 'var(--color-text-primary)' }}><Video className="w-4 h-4 text-indigo-500" /> {field.label}</label>}
              <div
                className="relative w-full rounded-xl overflow-hidden bg-black shadow"
                style={{ aspectRatio: field.videoAspectRatio || '16/9' }}
              >
                {embedUrl ? (
                  embedUrl.includes('embed') || embedUrl.includes('player.vimeo') ? (
                    <iframe
                      src={embedUrl}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0 absolute inset-0"
                    />
                  ) : (
                    <video
                      src={embedUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-neutral-400 space-y-2">
                    <Video className="w-6 h-6 text-neutral-500 animate-pulse" />
                    <span>Video container placeholder</span>
                  </div>
                )}
              </div>
              {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
            </div>
          );
        })()}

        {/* Premium Fields: shape_framed_image */}
        {field.type === 'shape_framed_image' && (() => {
          const shape = field.shapeFrameType || field.imageFrameShape || 'circle';
          const size = field.imageFrameSize ?? 120;
          let clipStyle = 'circle(50%)';
          if (shape === 'hexagon') clipStyle = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
          if (shape === 'pill') clipStyle = 'inset(0% round 9999px)';
          if (shape === 'diagonal_cut') clipStyle = 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)';
          if (shape === 'circle_badge') clipStyle = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

          const finalImgSrc = field.shapeFrameImageUrl || field.imageFrameUrl;

          return (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 font-sans">
              <div
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  clipPath: clipStyle,
                  border: (field.imageFrameBorderWidth ?? 0) > 0 ? `${field.imageFrameBorderWidth}px solid ${field.imageFrameBorderColor || '#6366f1'}` : undefined,
                  backgroundColor: 'var(--color-bg-secondary)',
                }}
                className="overflow-hidden relative transition-transform hover:scale-105"
              >
                {finalImgSrc ? (
                  <img
                    src={finalImgSrc}
                    alt={field.label || 'Framed'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="flex items-center justify-center text-center h-full text-[10px] text-neutral-400 p-2"><Shapes className="w-5 h-5 text-indigo-500" /></div>
                )}
              </div>
              {field.label && <span className="text-[11px] font-bold text-neutral-500">{field.label}</span>}
            </div>
          );
        })()}

        {/* Premium Fields: logo_mark */}
        {field.type === 'logo_mark' && (() => {
          const finalLogoSrc = field.logoMarkUrl || field.logoMarkImageUrl;
          return (
            <div className="flex flex-col items-center justify-center p-3 font-sans space-y-2">
              <div
                style={{
                  width: `${field.logoMarkSize || 64}px`,
                  height: `${field.logoMarkSize || 64}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: `${field.logoMarkBorderRadius || 12}px`,
                  border: `2px solid ${field.logoMarkColor || 'var(--color-accent)'}`,
                }}
                className="shadow-sm overflow-hidden relative transition transform hover:rotate-6"
              >
                {finalLogoSrc ? (
                  <img
                    src={finalLogoSrc}
                    alt={field.logoMarkHeadline || 'Logo'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Badge className="w-1/2 h-1/2 text-indigo-500 animate-pulse" style={{ color: field.logoMarkColor || 'var(--color-accent)' }} />
                )}
              </div>
              {field.logoMarkHeadline && (
                <span className="text-xs font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{field.logoMarkHeadline}</span>
              )}
              {field.logoMarkSubline && (
                <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.logoMarkSubline}</span>
              )}
            </div>
          );
        })()}

        {/* Design: image canvas */}
        {field.type === 'image_canvas' && (() => {
          const shape = field.imageCanvasShapeMask || 'none';
          const hasShape = shape !== 'none';
          
          let clipStyle: string | undefined = undefined;
          if (shape === 'circle') clipStyle = 'circle(50%)';
          else if (shape === 'pentagon') clipStyle = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
          else if (shape === 'hexagon') clipStyle = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
          else if (shape === 'diamond') clipStyle = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
          else if (shape === 'octagon') clipStyle = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';

          return (
            <div
              style={{
                display: 'flex',
                justifyContent: field.imageCanvasAlign ?? 'center',
                width: '100%',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${field.imageCanvasHeight ?? 200}px`,
                  /* When a shape mask other than 'none' is active, the existing imageCanvasBorderRadius property should be ignored (clip-path shapes override border-radius) */
                  borderRadius: hasShape ? '0px' : `${field.imageCanvasBorderRadius ?? 0}px`,
                  border: (field.imageCanvasBorderWidth ?? 0) > 0
                    ? `${field.imageCanvasBorderWidth}px solid ${field.imageCanvasBorderColor ?? '#e2e8f0'}`
                    : 'none',
                  clipPath: clipStyle,
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-bg-secondary)',
                  flexShrink: 0,
                }}
              >
                {field.imageCanvasUrl ? (
                  <img
                    src={field.imageCanvasUrl}
                    alt={field.imageCanvasAlt || ''}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: field.imageCanvasObjectFit ?? 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-sans text-neutral-400" style={{ color: 'var(--color-text-secondary)' }}>
                    🖼 No image — paste a URL in the editor
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Basic: text-like inputs */}
        {['short_text', 'phone', 'email', 'number'].includes(field.type) && (
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
              value={values[field.id] || ''}
              onChange={(e) => handleValue(field.id, e.target.value)}
              placeholder={field.placeholder || field.label}
              maxLength={field.maxLength}
              className="w-full border rounded-xl px-3 py-2.5 text-xs outline-none transition focus:ring-2 font-sans"
              style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Password field */}
        {field.type === 'password' && (
          <div className="space-y-1.5">
            {field.label && (
              <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
                {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
            )}
            <input
              type="password"
              placeholder={field.placeholder || '••••••••'}
              className="w-full border rounded-xl px-3 py-2.5 text-xs outline-none transition focus:ring-2 font-sans"
              style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Basic: long text */}
        {field.type === 'long_text' && (
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <textarea
              value={values[field.id] || ''}
              onChange={(e) => handleValue(field.id, e.target.value)}
              placeholder={field.placeholder || field.label}
              maxLength={field.maxLength}
              rows={3}
              className="w-full border rounded-xl px-3 py-2.5 text-xs outline-none transition focus:ring-2 font-sans"
              style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Basic: date */}
        {field.type === 'date' && (
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type="date"
              value={values[field.id] || ''}
              onChange={(e) => handleValue(field.id, e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-xs outline-none transition focus:ring-2 font-sans"
              style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Basic: dropdown */}
        {field.type === 'dropdown' && (
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="relative">
              <select
                value={values[field.id] || ''}
                onChange={(e) => handleValue(field.id, e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-xs outline-none appearance-none transition focus:ring-2 font-sans font-medium"
                style={{ ...fieldInputStyle, ...getBorderStyle(field), '--tw-ring-color': 'var(--color-accent)' } as any}
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 pointer-events-none opacity-55 text-neutral-400" />
            </div>
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Basic: checkers (checkbox config) */}
        {field.type === 'multi_checkbox' && (
          <div className="space-y-1.5 pl-0.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className={`flex pl-1.5 ${field.optionLayout === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}>
              {(field.options || []).map((opt, i) => {
                const groupKey = field.id;
                const items = checkedOptions[groupKey] || [];
                const checked = items.includes(opt);
                return (
                  <label key={i} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked ? items.filter(x => x !== opt) : [...items, opt];
                        setCheckedOptions(prev => ({ ...prev, [groupKey]: next }));
                      }}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span className="text-[11px] font-sans font-semibold text-neutral-600" style={{ color: 'var(--color-text-secondary)' }}>{opt}</span>
                  </label>
                );
              })}
            </div>
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Basic: radio */}
        {field.type === 'radio' && (
          <div className="space-y-1.5 pl-0.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className={`flex pl-1.5 ${field.optionLayout === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}>
              {(field.options || []).map((opt, i) => {
                const checked = selectedOption[field.id] === opt;
                return (
                  <label key={i} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name={field.id}
                      checked={checked}
                      onChange={() => setSelectedOption(prev => ({ ...prev, [field.id]: opt }))}
                      className="h-4 w-4"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span className="text-[11px] font-sans font-semibold text-neutral-600" style={{ color: 'var(--color-text-secondary)' }}>{opt}</span>
                  </label>
                );
              })}
            </div>
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Advanced: file upload */}
        {field.type === 'file_upload' && (
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <FileUploadPreview
              field={field}
              onFileChange={(id, file) => setUploadedFiles(prev => ({ ...prev, [id]: file }))}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}

        {/* Advanced: scale / rating */}
        {field.type === 'scale' && (
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <ScalePreview
              field={field}
              value={scaleValue[field.id] || 0}
              onChange={(v) => setScaleValue(prev => ({ ...prev, [field.id]: v }))}
            />
            {field.helpText && <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{field.helpText}</p>}
          </div>
        )}
      </div>
    );
  };

  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
      };
    }
    return {
      r: parseInt(h.slice(0, 2), 16) || 0,
      g: parseInt(h.slice(2, 4), 16) || 0,
      b: parseInt(h.slice(4, 6), 16) || 0,
    };
  };

  const glassStyle = designBlock?.bgGlassEnabled ? {
    backdropFilter: `blur(${designBlock.bgGlassBlur ?? 12}px)`,
    WebkitBackdropFilter: `blur(${designBlock.bgGlassBlur ?? 12}px)`,
    borderRadius: `${designBlock.bgGlassBorderRadius ?? 16}px`,
    border: `${designBlock.bgGlassBorderWidth ?? 1}px solid ${designBlock.bgGlassBorderColor ?? 'rgba(255,255,255,0.3)'}`,
    background: (() => {
      const stops = designBlock.bgGlassColorStops ?? [
        { color: '#6366f1', position: 0, opacity: 30 },
        { color: '#8b5cf6', position: 100, opacity: 20 }
      ];
      const stopStr = stops.map(s => {
        const rgb = hexToRgb(s.color);
        return `rgba(${rgb.r},${rgb.g},${rgb.b},${s.opacity / 100}) ${s.position}%`;
      }).join(', ');
      return `linear-gradient(${designBlock.bgGlassAngle ?? 135}deg, ${stopStr})`;
    })(),
  } : {};

  return (
    <div className="rounded-2xl border overflow-hidden min-h-fit"
      style={{ position: 'relative', borderColor: 'var(--color-border)' }}>
      {/* Custom High-Fidelity Background & Overlay System */}
      {(() => {
        const pbBgMode = designBlock?.bgMode || (formBg ? ((formBg.startsWith('http') || formBg.startsWith('/') || formBg.startsWith('data:')) ? 'image' : formBg.includes('gradient') ? 'gradient' : 'solid') : 'solid');
        const pbSolidColor = designBlock?.bgSolidColor || (formBg && !formBg.includes('gradient') && !formBg.startsWith('http') && !formBg.startsWith('/') && !formBg.startsWith('data:') ? formBg : '#ffffff');
        const pbSolidOpacity = designBlock?.bgSolidOpacity !== undefined ? designBlock.bgSolidOpacity : 100;
        
        let pbGradColor1 = '#6366f1';
        let pbGradColor2 = '#38bdf8';
        let pbGradAngle = 135;
        if (designBlock?.bgGradientColor1) {
          pbGradColor1 = designBlock.bgGradientColor1;
          pbGradColor2 = designBlock.bgGradientColor2 || '#38bdf8';
          pbGradAngle = designBlock.bgGradientAngle !== undefined ? designBlock.bgGradientAngle : 135;
        } else if (formBg && formBg.includes('gradient')) {
          try {
            const match = formBg.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,6}|rgb[^,]+),\s*(#[0-9a-fA-F]{3,6}|rgb[^,]+)\)/);
            if (match) {
              pbGradAngle = parseInt(match[1]);
              pbGradColor1 = match[2].trim();
              pbGradColor2 = match[3].trim();
            }
          } catch {}
        }
        const pbGradOpacity = designBlock?.bgGradientOpacity !== undefined ? designBlock.bgGradientOpacity : 100;

        const pbImageUrl = designBlock?.bgImageUrl || (formBg && (formBg.startsWith('http') || formBg.startsWith('/') || formBg.startsWith('data:')) ? formBg : '');

        const pbImageOverlayColor = designBlock?.bgImageOverlayColor || '#000000';
        const pbImageOverlayOpacity = designBlock?.bgImageOverlayOpacity !== undefined ? designBlock.bgImageOverlayOpacity : 0;

        return (
          <>
            {pbBgMode === 'solid' && (
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  background: hexToRgba(pbSolidColor, pbSolidOpacity),
                }}
              />
            )}
            {pbBgMode === 'gradient' && (
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  background: `linear-gradient(${pbGradAngle}deg, ${hexToRgba(pbGradColor1, pbGradOpacity)}, ${hexToRgba(pbGradColor2, pbGradOpacity)})`,
                }}
              />
            )}
            {pbBgMode === 'image' && pbImageUrl && (
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  backgroundImage: `url("${pbImageUrl}")`,
                  backgroundSize: formBgSize || 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
            {/* Image Overlay logic */}
            {pbBgMode === 'image' && pbImageUrl && pbImageOverlayOpacity > 0 && (
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  background: hexToRgba(pbImageOverlayColor, pbImageOverlayOpacity),
                }}
              />
            )}
          </>
        );
      })()}
      <div style={{ position: 'relative', zIndex: 1, ...glassStyle }}>
        {designBlock && (
          <style dangerouslySetInnerHTML={{ __html: `
            #form-preview-container-${designBlock.id} label {
              font-family: "${designBlock.fontFamilyBody || designBlock.fontFamilyAll || 'inherit'}", sans-serif !important;
            }
            #form-preview-container-${designBlock.id} input,
            #form-preview-container-${designBlock.id} textarea,
            #form-preview-container-${designBlock.id} select {
              font-family: "${designBlock.fontFamilyBody || designBlock.fontFamilyAll || 'inherit'}", sans-serif !important;
            }
          `}} />
        )}
        {formLogoUrl && (
          <div
            className={`px-4 pt-4 flex ${
              formLogoPosition === 'top-right'
                ? 'justify-end'
                : formLogoPosition === 'top-center'
                ? 'justify-center'
                : 'justify-start'
            }`}
          >
            <img
              src={formLogoUrl}
              alt="Form logo"
              className="w-12 h-12 rounded-full object-cover border-2 shadow-sm"
              style={{ borderColor: 'var(--color-border)' }}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
        <div id={designBlock ? `form-preview-container-${designBlock.id}` : undefined} className="p-4 sm:p-5 space-y-4 text-xs pb-8 form-preview-canvas" style={{ fontFamily: designBlock?.fontFamilyAll || 'inherit', position: 'relative', minHeight: '400px' }}>
          <div className="space-y-1">
            {!hideTitle && (
              <h3 className="font-black text-sm" style={{ color: 'var(--color-text-primary)' }}>{serviceName || 'Service Name'}</h3>
            )}
            {fees && <p className="font-bold text-xs" style={{ color: 'var(--color-accent)' }}>{fees}</p>}
            {description && <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>}
          </div>

          {fields.length === 0 && (
            <p className="text-[11px] text-center py-4 italic" style={{ color: 'var(--color-text-secondary)' }}>
              No fields added yet. Drag fields from the left panel.
            </p>
          )}

          {fields.map(renderField)}

          {/* Alignment Guides Overlay */}
          {activeDrag?.guides && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
              {activeDrag.guides.x !== undefined && (
                <div 
                  className="absolute top-0 bottom-0 border-l border-dashed border-indigo-500"
                  style={{ left: `${activeDrag.guides.x}px` }}
                />
              )}
              {activeDrag.guides.y !== undefined && (
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-indigo-500"
                  style={{ top: `${activeDrag.guides.y}px` }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ServiceBuilderPanel ─────────────────────────────────────────────────
interface ServiceBuilderPanelProps {
  programs: Program[];
  onSave: (data: {
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
  }) => Promise<any>;
  vertical?: string | null;
  initialProgramId?: string | null;
  onDeleteForm?: (id: string) => Promise<void>;
  templateToApply?: FormTemplate | null;
  onTemplateApplied?: () => void;
  isSuperAdmin?: boolean;
}

export default function ServiceBuilderPanel({
  programs, onSave, vertical, initialProgramId, onDeleteForm,
  templateToApply, onTemplateApplied, isSuperAdmin
}: ServiceBuilderPanelProps) {
  const isEducation = vertical === 'education';

  // Selected program to build form for (null = create new)
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    initialProgramId !== undefined && initialProgramId !== '' ? initialProgramId : (programs[0]?.id || null)
  );

  // Sync if initialProgramId updates
  useEffect(() => {
    if (initialProgramId !== undefined && initialProgramId !== '') {
      setSelectedProgramId(initialProgramId);
    }
  }, [initialProgramId]);

  // Sync if templateToApply passes from Templates tab
  useEffect(() => {
    if (templateToApply) {
      setName(templateToApply.name || '');
      setFormName(templateToApply.name || '');
      setFormBg(templateToApply.formBg || '');
      setFormLogoUrl(templateToApply.formLogoUrl || '');
      setFormLogoPosition(templateToApply.formLogoPosition || 'top-left');
      setBgBlendMode(templateToApply.formBgBlendMode || 'normal');
      setBgSize(templateToApply.formBgSize || 'cover');
      setBgOpacity(templateToApply.formBgOpacity !== undefined ? templateToApply.formBgOpacity : 100);

      const savedBg = templateToApply.formBg || '';
      if (!savedBg) {
        setBgMode('solid');
        setBgSolidColor('#ffffff');
      } else if (savedBg.startsWith('http') || savedBg.startsWith('/') || savedBg.startsWith('url(') || savedBg.startsWith('data:')) {
        setBgMode('image');
        setBgImageUrl(savedBg);
      } else if (savedBg.includes('gradient')) {
        setBgMode('gradient');
        try {
          const match = savedBg.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,6}|rgb[^,]+),\s*(#[0-9a-fA-F]{3,6}|rgb[^,]+)\)/);
          if (match) {
            setBgGradientAngle(parseInt(match[1]));
            setBgGradientColor1(match[2].trim());
            setBgGradientColor2(match[3].trim());
          }
        } catch {}
      } else {
        setBgMode('solid');
        setBgSolidColor(savedBg);
      }

      setDept(templateToApply.category || '');
      setDesc(templateToApply.description || '');
      setFields(templateToApply.formSchema || []);
      setPreviewFields(templateToApply.formSchema || []);
      setSelectedProgramId(null);

      if (onTemplateApplied) {
        onTemplateApplied();
      }
    }
  }, [templateToApply, onTemplateApplied]);

  const selectedProgram = useMemo(
    () => programs.find(p => p.id === selectedProgramId) ?? null,
    [programs, selectedProgramId]
  );

  // Meta fields (pre-filled from selected program or blank for new)
  const [name, setName] = useState(selectedProgram?.name || '');
  const [formName, setFormName] = useState('');
  const [formBg, setFormBg] = useState(selectedProgram?.formBg || '');
  const [isPublished, setIsPublished] = useState(selectedProgram?.published || false);

  const [bgMode, setBgMode] = useState<'solid' | 'gradient' | 'image'>(() => {
    const bg = selectedProgram?.formBg || '';
    if (!bg) return 'solid';
    if (bg.startsWith('http') || bg.startsWith('/') || bg.startsWith('url(')) return 'image';
    if (bg.includes('gradient')) return 'gradient';
    return 'solid';
  });
  const [bgSolidColor, setBgSolidColor] = useState<string>(() => {
    const bg = selectedProgram?.formBg || '';
    if (bg.startsWith('#') || bg.startsWith('rgb')) return bg;
    return '#ffffff';
  });
  const [bgGradientColor1, setBgGradientColor1] = useState('#6366f1');
  const [bgGradientColor2, setBgGradientColor2] = useState('#38bdf8');
  const [bgGradientAngle, setBgGradientAngle] = useState(135);
  const [bgImageUrl, setBgImageUrl] = useState<string>(() => {
    const bg = selectedProgram?.formBg || '';
    if (bg.startsWith('http') || bg.startsWith('/')) return bg;
    return '';
  });

  const [bgBlendMode, setBgBlendMode] = useState<string>(() => selectedProgram?.formBgBlendMode || 'normal');
  const [bgSize, setBgSize] = useState<'cover' | 'contain' | 'auto'>(() => selectedProgram?.formBgSize || 'cover');
  const [bgOpacity, setBgOpacity] = useState<number>(() => selectedProgram?.formBgOpacity !== undefined ? selectedProgram?.formBgOpacity : 100);

  const [bgSolidOpacity, setBgSolidOpacity] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgSolidOpacity !== undefined ? (designBlock as any).bgSolidOpacity : 100;
  });
  const [bgGradientOpacity, setBgGradientOpacity] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGradientOpacity !== undefined ? (designBlock as any).bgGradientOpacity : 100;
  });
  const [bgImageOverlayColor, setBgImageOverlayColor] = useState<string>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgImageOverlayColor || '#000000';
  });
  const [bgImageOverlayOpacity, setBgImageOverlayOpacity] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgImageOverlayOpacity !== undefined ? (designBlock as any).bgImageOverlayOpacity : 0;
  });

  const [bgGlassEnabled, setBgGlassEnabled] = useState<boolean>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassEnabled ?? false;
  });
  const [bgGlassBlur, setBgGlassBlur] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassBlur ?? 12;
  });
  const [bgGlassBorderRadius, setBgGlassBorderRadius] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassBorderRadius ?? 16;
  });
  const [bgGlassBorderColor, setBgGlassBorderColor] = useState<string>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassBorderColor || '#ffffff';
  });
  const [bgGlassBorderWidth, setBgGlassBorderWidth] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassBorderWidth ?? 1;
  });
  const [bgGlassColorStops, setBgGlassColorStops] = useState<Array<{ color: string; position: number; opacity: number }>>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassColorStops || [{ color: '#6366f1', position: 0, opacity: 30 }, { color: '#8b5cf6', position: 100, opacity: 20 }];
  });
  const [bgGlassAngle, setBgGlassAngle] = useState<number>(() => {
    const designBlock = selectedProgram?.formSchema?.find((f: any) => f.type === 'form_design_block');
    return (designBlock as any)?.bgGlassAngle ?? 135;
  });

  const computedFormBg = (() => {
    if (bgMode === 'solid') return bgSolidColor;
    if (bgMode === 'gradient') {
      return `linear-gradient(${bgGradientAngle}deg, ${bgGradientColor1}, ${bgGradientColor2})`;
    }
    if (bgMode === 'image' && bgImageUrl) return bgImageUrl;
    return '';
  })();

  useEffect(() => {
    setFormBg(computedFormBg);
  }, [bgMode, bgSolidColor, bgGradientColor1, bgGradientColor2, bgGradientAngle, bgImageUrl]);

  const [formLogoUrl, setFormLogoUrl] = useState(selectedProgram?.formLogoUrl || '');
  const [formLogoPosition, setFormLogoPosition] = useState<'top-left' | 'top-right' | 'top-center'>(
    selectedProgram?.formLogoPosition || 'top-left'
  );
  const [dept, setDept] = useState(selectedProgram?.department || '');
  const [duration, setDuration] = useState(selectedProgram?.duration || '');
  const [fees, setFees] = useState(selectedProgram?.fees || '');
  const [badge, setBadge] = useState(selectedProgram?.capacityBadge || '');
  const [desc, setDesc] = useState(selectedProgram?.description || '');
  const [fields, setFields] = useState<FormField[]>(selectedProgram?.formSchema || []);
  const [previewFields, setPreviewFields] = useState<FormField[]>(selectedProgram?.formSchema || []);

  const selectedProgramKey = (selectedProgram?.id || '') + '|' + (selectedProgram?.formBg || '') + '|' + (selectedProgram?.formLogoPosition || '') + '|' + (selectedProgram?.formBgBlendMode || '') + '|' + (selectedProgram?.formBgSize || '') + '|' + (selectedProgram?.formBgOpacity ?? 100);

  // Sync when selected program changes
  useEffect(() => {
    // Reset dirty ref on program shift so fields load correctly
    isDirtyRef.current = false;
    const p = programs.find(pr => pr.id === selectedProgramId) || null;
    setName(p?.name || '');
    setIsPublished(p?.published || false);
    if (!selectedProgramId) {
      setFormName('');
      setFormBg('');
      setFormLogoUrl('');
      setFormLogoPosition('top-left');
      setBgBlendMode('normal');
      setBgSize('cover');
      setBgOpacity(100);
      setBgSolidOpacity(100);
      setBgGradientOpacity(100);
      setBgImageOverlayColor('#000000');
      setBgImageOverlayOpacity(0);
      setBgGlassEnabled(false);
      setBgGlassBlur(12);
      setBgGlassBorderRadius(16);
      setBgGlassBorderColor('#ffffff');
      setBgGlassBorderWidth(1);
      setBgGlassColorStops([{ color: '#6366f1', position: 0, opacity: 30 }, { color: '#8b5cf6', position: 100, opacity: 20 }]);
      setBgGlassAngle(135);
    } else {
      setFormName(p?.name || '');
      setFormBg(p?.formBg || '');
      setFormLogoUrl(p?.formLogoUrl || '');
      setFormLogoPosition(p?.formLogoPosition || 'top-left');
      setBgBlendMode(p?.formBgBlendMode || 'normal');
      setBgSize(p?.formBgSize || 'cover');
      setBgOpacity(p?.formBgOpacity !== undefined ? p.formBgOpacity : 100);

      const designBlock = p?.formSchema?.find((f: any) => f.type === 'form_design_block');
      setBgSolidOpacity(designBlock?.bgSolidOpacity !== undefined ? designBlock.bgSolidOpacity : 100);
      setBgGradientOpacity(designBlock?.bgGradientOpacity !== undefined ? designBlock.bgGradientOpacity : 100);
      setBgImageOverlayColor(designBlock?.bgImageOverlayColor || '#000000');
      setBgImageOverlayOpacity(designBlock?.bgImageOverlayOpacity !== undefined ? designBlock.bgImageOverlayOpacity : 0);
      setBgGlassEnabled(Boolean(designBlock?.bgGlassEnabled));
      setBgGlassBlur(designBlock?.bgGlassBlur !== undefined ? designBlock.bgGlassBlur : 12);
      setBgGlassBorderRadius(designBlock?.bgGlassBorderRadius !== undefined ? designBlock.bgGlassBorderRadius : 16);
      setBgGlassBorderColor(designBlock?.bgGlassBorderColor || '#ffffff');
      setBgGlassBorderWidth(designBlock?.bgGlassBorderWidth !== undefined ? designBlock.bgGlassBorderWidth : 1);
      setBgGlassColorStops(designBlock?.bgGlassColorStops || [{ color: '#6366f1', position: 0, opacity: 30 }, { color: '#8b5cf6', position: 100, opacity: 20 }]);
      setBgGlassAngle(designBlock?.bgGlassAngle !== undefined ? designBlock.bgGlassAngle : 135);
    }
    // Reset background builder from saved formBg
    const savedBg = p?.formBg || '';
    if (!savedBg) {
      setBgMode('solid');
      setBgSolidColor('#ffffff');
    } else if (savedBg.startsWith('http') || savedBg.startsWith('/') || savedBg.startsWith('url(') || savedBg.startsWith('data:')) {
      setBgMode('image');
      setBgImageUrl(savedBg);
    } else if (savedBg.includes('gradient')) {
      setBgMode('gradient');
      // Attempt to parse the saved gradient — if it fails, use defaults
      try {
        const match = savedBg.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,6}|rgb[^,]+),\s*(#[0-9a-fA-F]{3,6}|rgb[^,]+)\)/);
        if (match) {
          setBgGradientAngle(parseInt(match[1]));
          setBgGradientColor1(match[2].trim());
          setBgGradientColor2(match[3].trim());
        }
      } catch {}
    } else {
      setBgMode('solid');
      setBgSolidColor(savedBg);
    }
    setDept(p?.department || '');
    setDuration(p?.duration || '');
    setFees(p?.fees || '');
    setBadge(p?.capacityBadge || '');
    setDesc(p?.description || '');
    setFields(p?.formSchema || []);
    setPreviewFields(p?.formSchema || []);
  }, [selectedProgramId]);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedOptionA, setCopiedOptionA] = useState(false);
  const [copiedOptionB, setCopiedOptionB] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>('idle');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingOverCanvas, setIsDraggingOverCanvas] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [activePaletteCategory, setActivePaletteCategory] = useState<'basic' | 'advanced' | 'layout' | 'design'>('basic');
  const [activeTab, setActiveTab ] = useState<'builder' | 'my_forms' | 'fonts'>('builder');
  const [expandedEmbedId, setExpandedEmbedId] = useState<string | null>(null);
  const [expandedFormCardId, setExpandedFormCardId] = useState<string | null>(null);

  const [previewPushed, setPreviewPushed] = useState(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');

  const [bgUploading, setBgUploading] = useState(false);
  const [bgUploadError, setBgUploadError] = useState('');

  const [publishOverlayState, setPublishOverlayState] = useState<'hidden' | 'processing' | 'success'>('hidden');
  const [successMessage, setSuccessMessage] = useState('');

  const [isPromoteTemplateOpen, setIsPromoteTemplateOpen] = useState(false);
  const [promoteName, setPromoteName] = useState('');
  const [promoteDesc, setPromoteDesc] = useState('');
  const [promoteCategory, setPromoteCategory] = useState('general');
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [isPushingTemplate, setIsPushingTemplate] = useState(false);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [browseTemplatesOpen, setBrowseTemplatesOpen] = useState(false);
  const [formTemplatesList, setFormTemplatesList] = useState<any[]>([]);
  const [loadingFormTemplates, setLoadingFormTemplates] = useState(false);

  const SUCCESS_MESSAGES = useMemo(() => [
    "🎉 Hurray! Your form is now live!",
    "🥳 Congrats! You just went live!",
    "🚀 Bravo! Your form is live and ready!",
    "🎊 Yuppi! The world can now see your form!",
    "✨ Boom! Your form just went live!",
    "🏆 Brilliant! Your form is officially live!",
  ], []);

  const shownMessagesRef = useRef<Set<string>>(new Set());

  const pickSuccessMessage = useCallback((): string => {
    const unseen = SUCCESS_MESSAGES.filter(m => !shownMessagesRef.current.has(m));
    const pool = unseen.length > 0 ? unseen : SUCCESS_MESSAGES;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    shownMessagesRef.current.add(msg);
    return msg;
  }, [SUCCESS_MESSAGES]);

  useEffect(() => {
    if (publishOverlayState === 'success') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [publishOverlayState]);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a description or prompt for the form.');
      return;
    }
    setAiGenerating(true);
    setAiError(null);
    const token = localStorage.getItem('neslead_session_token') || '';
    try {
      const res = await fetch('/api/forms/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          programId: selectedProgramId || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'AI generation failed');
      }
      if (data.fields && Array.isArray(data.fields)) {
        const updatedFields = [...fields, ...data.fields];
        setFields(updatedFields);
        setPreviewFields(updatedFields);
        markDirtyAndSave();
        setShowAIModal(false);
        setAiPrompt('');
      } else {
        throw new Error('Invalid response format received from server.');
      }
    } catch (err: any) {
      console.error('[handleAIGenerate error]', err);
      setAiError(err.message || 'AI generation experienced an issue. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePushToTemplatesDirect = async () => {
    let currentId = selectedProgramId;
    setIsPushingTemplate(true);
    try {
      const finalName = (selectedProgramId ? name : formName) || '';
      if (!finalName.trim()) {
        alert("Please provide a name for your custom form before pushing it to templates.");
        setIsPushingTemplate(false);
        return;
      }

      // Always save draft first to guarantee the template matches exactly what is in the user's builder canvas
      setSaveStatus('saving');
      const savedItem = await onSave({
        programId: currentId || undefined,
        name: finalName,
        department: dept,
        duration,
        fees,
        capacityBadge: badge,
        description: desc,
        formSchema: fields,
        published: isPublished,
        formBg,
        formLogoUrl,
        formLogoPosition,
        formBgBlendMode: bgBlendMode,
        formBgSize: bgSize,
        formBgOpacity: bgOpacity
      });

      if (savedItem && savedItem.id) {
        currentId = savedItem.id;
        setSelectedProgramId(savedItem.id);
        setName(finalName);
        setFormName(finalName);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else if (!currentId) {
        throw new Error('Failed to save the form draft before promoting to templates. Please save draft manually first.');
      }

      const token = localStorage.getItem('neslead_session_token') || '';
      const res = await fetch(`/api/programs/${currentId}/promote-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateName: finalName || 'Custom Program Form',
          description: desc || 'Sleek customized form pushed directly from builder',
          category: 'premium',
          tags: ['Community', 'Custom'],
          vertical: 'all',
          previewDescription: `${fields.length} customized fields ready`
        })
      });
      if (res.ok) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
        alert('🎉 Success! This form has been successfully pushed as a global template and added to the Master Templates Library!');
      } else {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Promotion to template failed');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to promote program to templates');
    } finally {
      setIsPushingTemplate(false);
    }
  };

  const handlePromoteToTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;
    setPromoteLoading(true);
    const token = localStorage.getItem('neslead_session_token') || '';
    try {
      const res = await fetch(`/api/programs/${selectedProgramId}/promote-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateName: promoteName,
          description: promoteDesc,
          category: promoteCategory,
          tags: ['Community', 'Custom'],
          vertical: 'all',
          previewDescription: `${fields.length} customized fields ready`
        })
      });
      if (res.ok) {
        setIsPromoteTemplateOpen(false);
        setPromoteName('');
        setPromoteDesc('');
        alert('🎉 Success! This program has been promoted to a global template and added to the Master Templates Library!');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Promotion to template failed');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to promote program');
    } finally {
      setPromoteLoading(false);
    }
  };

  const loadTemplatesForBrowsing = async () => {
    setLoadingFormTemplates(true);
    const token = localStorage.getItem('neslead_session_token') || '';
    try {
      const res = await fetch('/api/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFormTemplatesList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFormTemplates(false);
    }
  };

  useEffect(() => {
    if (browseTemplatesOpen) {
      loadTemplatesForBrowsing();
    }
  }, [browseTemplatesOpen]);

  const handleApplyTemplateInline = (tmpl: any) => {
    if (window.confirm(`Are you sure you want to initialize your form canvas using the "${tmpl.name}" template? This will replace your current fields draft.`)) {
      setFields(tmpl.formSchema || []);
      if (tmpl.formBg) {
        setFormBg(tmpl.formBg);
        if (tmpl.formBg.includes('gradient')) {
          setBgMode('gradient');
        } else if (tmpl.formBg.startsWith('http') || tmpl.formBg.startsWith('/')) {
          setBgMode('image');
          setBgImageUrl(tmpl.formBg);
        } else {
          setBgMode('solid');
          setBgSolidColor(tmpl.formBg);
        }
      }
      if (tmpl.formLogoUrl) setFormLogoUrl(tmpl.formLogoUrl);
      if (tmpl.formLogoPosition) setFormLogoPosition(tmpl.formLogoPosition);
      if (tmpl.formBgBlendMode) setBgBlendMode(tmpl.formBgBlendMode);
      if (tmpl.formBgSize) setBgSize(tmpl.formBgSize);
      if (tmpl.formBgOpacity !== undefined) setBgOpacity(tmpl.formBgOpacity);
      setBrowseTemplatesOpen(false);
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleFormBgUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 1500 * 1024) {
      setBgUploadError('Image must be under 1.5MB.');
      setTimeout(() => setBgUploadError(''), 4000);
      return;
    }
    setBgUploading(true);
    setBgUploadError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const token = localStorage.getItem('neslead_session_token') || '';
        try {
          const res = await fetch('/api/widget/upload-bg', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ base64Data, fileName: file.name, mimeType: file.type }),
          });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          setBgImageUrl(data.imageUrl);
          markDirtyAndSave();
        } catch (err: any) {
          setBgUploadError(err.message || 'Upload failed.');
        } finally {
          setBgUploading(false);
        }
      };
      reader.onerror = () => {
        setBgUploadError('Could not read file.');
        setBgUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setBgUploadError('Unexpected error.');
      setBgUploading(false);
    }
  };

  const handleFormLogoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 500 * 1024) {
      setLogoUploadError('Image must be under 500KB.');
      setTimeout(() => setLogoUploadError(''), 4000);
      return;
    }
    setLogoUploading(true);
    setLogoUploadError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const token = localStorage.getItem('neslead_session_token') || '';
        try {
          const res = await fetch('/api/widget/upload-logo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ base64Data, fileName: file.name, mimeType: file.type }),
          });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          setFormLogoUrl(data.imageUrl);
          markDirtyAndSave();
        } catch (err: any) {
          setLogoUploadError(err.message || 'Upload failed.');
        } finally {
          setLogoUploading(false);
        }
      };
      reader.onerror = () => {
        setLogoUploadError('Could not read file.');
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setLogoUploadError('Unexpected error.');
      setLogoUploading(false);
    }
  };

  // Auto-save on field blur / design modification
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      const finalName = selectedProgramId ? name : formName;
      if (!finalName.trim()) return;
      setSaveStatus('saving');
      try {
        await onSave({
          programId: selectedProgramId || undefined,
          name: finalName,
          department: dept,
          duration,
          fees,
          capacityBadge: badge,
          description: desc,
          formSchema: fields,
          published: isPublished,
          formBg,
          formLogoUrl,
          formLogoPosition,
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    }, 1200);
  }, [name, formName, dept, duration, fees, badge, desc, fields, formBg, formLogoUrl, formLogoPosition, selectedProgramId, isPublished, onSave]);

  const isFirstRender = useRef(true);
  const isDirtyRef = useRef(false);

  const markDirtyAndSave = useCallback(() => {
    isDirtyRef.current = true;
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Drag from palette
  const handlePaletteDragStart = (e: React.DragEvent<any>, item: PaletteItem) => {
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:-1000px;left:-1000px;width:1px;height:1px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
    e.dataTransfer.setData('palette-type', item.type);
    e.dataTransfer.setData('palette-default-label', item.defaultLabel);
    e.dataTransfer.effectAllowed = 'copy';
    e.target.addEventListener('dragend', () => {
      setDragOverIndex(null);
      setIsDraggingOverCanvas(false);
    }, { once: true });
  };

  const handleCanvasDragOver = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOverCanvas) setIsDraggingOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent<any>) => {
    // Only clear if leaving the canvas container itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverCanvas(false);
      setDragOverIndex(null);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent<any>) => {
    e.preventDefault();
    setIsDraggingOverCanvas(false);
    setDragOverIndex(null);
    const type = e.dataTransfer.getData('palette-type') as FormFieldType;
    const defaultLabel = e.dataTransfer.getData('palette-default-label');
    if (type) {
      if (type === 'form_design_block' && fields.some(f => f.type === 'form_design_block')) {
        return;
      }
      setFields(prev => [...prev, createField(type, defaultLabel)]);
      markDirtyAndSave();
    }
  };

  // Reorder on canvas
  const handleFieldDragStart = (e: React.DragEvent<any>, index: number) => {
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:-1000px;left:-1000px;width:1px;height:1px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
    e.dataTransfer.setData('canvas-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
    dragIndexRef.current = index;
  };

  const handleFieldDragOver = (e: React.DragEvent<any>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleFieldDrop = (e: React.DragEvent<any>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const fromIndexStr = e.dataTransfer.getData('canvas-index');
    if (fromIndexStr === '') {
      // Drop from palette
      const type = e.dataTransfer.getData('palette-type') as FormFieldType;
      const defaultLabel = e.dataTransfer.getData('palette-default-label');
      if (type) {
        if (type === 'form_design_block' && fields.some(f => f.type === 'form_design_block')) return;
        setFields(prev => {
          const copy = [...prev];
          copy.splice(dropIndex, 0, createField(type, defaultLabel));
          return copy;
        });
        markDirtyAndSave();
      }
    } else {
      const fromIndex = parseInt(fromIndexStr, 10);
      const targetIndex = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
      if (fromIndex !== targetIndex) {
        setFields(prev => {
          const copy = [...prev];
          const [moved] = copy.splice(fromIndex, 1);
          copy.splice(targetIndex, 0, moved);
          return copy;
        });
        markDirtyAndSave();
      }
    }
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  const handleFieldDragEnd = () => { setDragOverIndex(null); dragIndexRef.current = null; };

  const handleFieldChange = useCallback((id: string, updated: Partial<FormField>, skipSave = false) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
    if (!skipSave) {
      markDirtyAndSave();
    }
  }, [markDirtyAndSave]);

  const handleDesignChange = useCallback((patch: Partial<{
    bgMode: 'solid' | 'gradient' | 'image';
    bgSolidColor: string;
    bgGradientColor1: string;
    bgGradientColor2: string;
    bgGradientAngle: number;
    bgImageUrl: string;
    formLogoUrl: string;
    formLogoPosition: 'top-left' | 'top-right' | 'top-center';
    bgBlendMode: string;
    bgSize: 'cover' | 'contain' | 'auto';
    bgOpacity: number;
    bgSolidOpacity?: number;
    bgGradientOpacity?: number;
    bgImageOverlayColor?: string;
    bgImageOverlayOpacity?: number;
    bgGlassEnabled?: boolean;
    bgGlassBlur?: number;
    bgGlassBorderRadius?: number;
    bgGlassBorderColor?: string;
    bgGlassBorderWidth?: number;
    bgGlassColorStops?: Array<{ color: string; position: number; opacity: number }>;
    bgGlassAngle?: number;
  }>) => {
    if (patch.bgMode !== undefined) setBgMode(patch.bgMode);
    if (patch.bgSolidColor !== undefined) setBgSolidColor(patch.bgSolidColor);
    if (patch.bgGradientColor1 !== undefined) setBgGradientColor1(patch.bgGradientColor1);
    if (patch.bgGradientColor2 !== undefined) setBgGradientColor2(patch.bgGradientColor2);
    if (patch.bgGradientAngle !== undefined) setBgGradientAngle(patch.bgGradientAngle);
    if (patch.bgImageUrl !== undefined) setBgImageUrl(patch.bgImageUrl);
    if (patch.formLogoUrl !== undefined) setFormLogoUrl(patch.formLogoUrl);
    if (patch.formLogoPosition !== undefined) setFormLogoPosition(patch.formLogoPosition);
    if (patch.bgBlendMode !== undefined) setBgBlendMode(patch.bgBlendMode);
    if (patch.bgSize !== undefined) setBgSize(patch.bgSize);
    if (patch.bgOpacity !== undefined) setBgOpacity(patch.bgOpacity);

    if (patch.bgSolidOpacity !== undefined) setBgSolidOpacity(patch.bgSolidOpacity);
    if (patch.bgGradientOpacity !== undefined) setBgGradientOpacity(patch.bgGradientOpacity);
    if (patch.bgImageOverlayColor !== undefined) setBgImageOverlayColor(patch.bgImageOverlayColor);
    if (patch.bgImageOverlayOpacity !== undefined) setBgImageOverlayOpacity(patch.bgImageOverlayOpacity);

    if (patch.bgGlassEnabled !== undefined) setBgGlassEnabled(patch.bgGlassEnabled);
    if (patch.bgGlassBlur !== undefined) setBgGlassBlur(patch.bgGlassBlur);
    if (patch.bgGlassBorderRadius !== undefined) setBgGlassBorderRadius(patch.bgGlassBorderRadius);
    if (patch.bgGlassBorderColor !== undefined) setBgGlassBorderColor(patch.bgGlassBorderColor);
    if (patch.bgGlassBorderWidth !== undefined) setBgGlassBorderWidth(patch.bgGlassBorderWidth);
    if (patch.bgGlassColorStops !== undefined) setBgGlassColorStops(patch.bgGlassColorStops);
    if (patch.bgGlassAngle !== undefined) setBgGlassAngle(patch.bgGlassAngle);

    // Also update designBlock field if present in fields list
    setFields(prev => {
      const idx = prev.findIndex(f => f.type === 'form_design_block');
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...patch };
        return copy;
      }
      return prev;
    });

    markDirtyAndSave();
  }, [markDirtyAndSave]);

  const handleFieldDelete = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    markDirtyAndSave();
  }, [markDirtyAndSave]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setFields(prev => { const copy = [...prev]; [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]; return copy; });
    markDirtyAndSave();
  }, [markDirtyAndSave]);

  const handleMoveDown = useCallback((index: number) => {
    setFields(prev => {
      if (index === prev.length - 1) return prev;
      const copy = [...prev]; [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]]; return copy;
    });
    markDirtyAndSave();
  }, [markDirtyAndSave]);

  const handleSaveAll = async (publish: boolean) => {
    const finalName = selectedProgramId ? name : formName;
    if (!finalName.trim()) return;

    if (publish) {
      setPublishOverlayState('processing');
    }
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await onSave({
        programId: selectedProgramId || undefined,
        name: finalName,
        department: dept,
        duration,
        fees,
        capacityBadge: badge,
        description: desc,
        formSchema: fields,
        published: publish,
        formBg,
        formLogoUrl,
        formLogoPosition,
        formBgBlendMode: bgBlendMode,
        formBgSize: bgSize,
        formBgOpacity: bgOpacity
      });
      setSaveStatus('saved');
      if (publish) {
        setIsPublished(true);
        setSuccessMessage(pickSuccessMessage());
        setPublishOverlayState('success');
        // Auto-close after 4500ms
        setTimeout(() => setPublishOverlayState('hidden'), 4500);
      } else {
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch {
      setSaveStatus('error');
      setPublishOverlayState('hidden');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)',
  };

  const filteredPaletteItems = PALETTE_ITEMS.filter(i => i.category === activePaletteCategory);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-ai-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes custom-ai-shimmer {
          0% { transform: skewX(-25deg) translateX(-200%); }
          15% { transform: skewX(-25deg) translateX(-200%); }
          85% { transform: skewX(-25deg) translateX(200%); }
          100% { transform: skewX(-25deg) translateX(200%); }
        }
        @keyframes custom-pulse-glow {
          0%, 100% { opacity: 0.14; transform: scale(1); filter: blur(40px); }
          50% { opacity: 0.32; transform: scale(1.1); filter: blur(55px); }
        }
        @keyframes custom-ai-shadow-glow {
          0% { box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.05); }
          50% { box-shadow: 0 4px 20px rgba(236, 72, 153, 0.45), 0 0 0 1.5px rgba(236, 72, 153, 0.1); }
          100% { box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.05); }
        }
      `}} />

      {/* Publishing overlay */}
      <AnimatePresence>
        {publishOverlayState !== 'hidden' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-sm w-full mx-4 text-center"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              {publishOverlayState === 'processing' ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center animate-bounce duration-1000" style={{ background: 'var(--accent-gradient)' }}>
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div>
                    <p className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>Publishing your form...</p>
                    <p className="text-sm mt-1 animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>We're updating your form. Just a moment!</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Confetti effect using CSS keyframe animation on emoji spans */}
                  <div className="text-5xl animate-bounce">🎉</div>
                  <div>
                    <p className="text-xl font-black font-sans leading-snug" style={{ color: 'var(--color-text-primary)' }}>{successMessage}</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Your form is live and accepting responses.</p>
                  </div>
                  <div className="flex gap-2 text-2xl">
                    {['🎊','✨','🚀','🏆','🥳'].map((emoji, i) => (
                      <span key={i} className="animate-ping" style={{ animationDelay: `${i * 0.12}s`, animationDuration: '0.9s' }}>{emoji}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPublishOverlayState('hidden')}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-black cursor-pointer transition hover:scale-105 active:scale-95 shadow-md"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    Awesome, close!
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 gap-3 flex-wrap sm:flex-nowrap"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <Wand2 className="w-4 h-4 shrink-0 text-indigo-500" style={{ color: 'var(--color-accent)' }} />
          <div>
            <p className="text-xs font-black font-sans" style={{ color: 'var(--color-text-primary)' }}>
              {isEducation ? 'Program' : 'Service'} Form Builder
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
              Drag fields from the palette onto the canvas · auto-saves on change
            </p>
          </div>
          {/* Program selector */}
          {programs.length > 0 && (
            <select
              value={selectedProgramId || ''}
              onChange={(e) => setSelectedProgramId(e.target.value || null)}
              className="border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer font-sans"
              style={inputStyle}
            >
              <option value="">— New {isEducation ? 'Program' : 'Service'} —</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {!selectedProgramId && (
            <div className="flex flex-col">
              <div className="relative font-sans">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  onBlur={() => markDirtyAndSave()}
                  placeholder="Name this form..."
                  className="border rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-bold outline-none"
                  style={inputStyle}
                />
                {formName && (
                  <button type="button" onClick={() => { setFormName(''); markDirtyAndSave(); }}
                    className="absolute right-2 top-2.5 text-neutral-400 hover:text-neutral-600 transition">
                    <X className="w-3" />
                  </button>
                )}
              </div>
              <p className="text-[9px] font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                🔒 Internal label only — not shown to users in preview
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end ml-auto">
          <AnimatePresence><AutoSaveIndicator status={saveStatus} /></AnimatePresence>

          <button
            type="button"
            onClick={() => {
              setAiError(null);
              setShowAIModal(true);
            }}
            className="relative h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer overflow-hidden transition-all duration-300 hover:opacity-90 active:opacity-100 font-sans text-white border-0 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #9333ea, #db2777, #2563eb)',
              backgroundSize: '300% 300%',
              animation: 'custom-ai-gradient 8s ease infinite, custom-ai-shadow-glow 4s ease infinite',
            }}
          >
            {/* Elegant glass shimmer scanner overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                width: '50%',
                top: 0,
                bottom: 0,
                transform: 'skewX(-25deg) translateX(-150%)',
                animation: 'custom-ai-shimmer 3s infinite ease-in-out',
              }}
            />
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-bounce shrink-0" />
            <span className="tracking-wide hidden md:inline">Generate with AI</span>
            <span className="tracking-wide md:hidden">AI</span>
          </button>
          
          <button
            type="button"
            disabled={isPushingTemplate}
            onClick={handlePushToTemplatesDirect}
            className="h-8 px-2.5 sm:px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:bg-neutral-500/10 active:bg-neutral-500/20 disabled:opacity-40 disabled:cursor-not-allowed font-sans shrink-0 bg-transparent"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            title={!selectedProgramId ? "Save draft and push to global templates library in one single click" : "Push custom form structure to templates library"}
          >
            {isPushingTemplate ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            )}
            <span className="hidden lg:inline">Push to Templates</span>
            <span className="lg:hidden">Push</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 640) {
                setShowMobilePreview(true);
              } else {
                setShowPreview(v => !v);
              }
            }}
            className="h-8 px-2.5 sm:px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:bg-neutral-500/10 active:bg-neutral-500/20 font-sans shrink-0 bg-transparent"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFullscreenPreview(true)}
            className="h-8 px-2.5 sm:px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:bg-neutral-500/10 active:bg-neutral-500/20 font-sans hidden sm:flex shrink-0 bg-transparent"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            title="Open fullscreen form preview"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden md:inline">Fullscreen</span>
          </button>
          
          {selectedProgramId && (
            <button
              type="button"
              onClick={() => setShowEmbedModal(true)}
              className="h-8 px-2.5 sm:px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:bg-neutral-500/10 active:bg-neutral-500/20 font-sans shrink-0 bg-transparent"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              title="Get standalone form embed code"
            >
              <Code className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Embed Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs bar */}
      <div className="flex border-b shrink-0 px-4 sm:px-6 overflow-x-auto scrollbar-none"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        {([
          { id: 'builder',  label: '✏️ Builder' },
          { id: 'fonts',    label: '🔤 Fonts' },
          { id: 'my_forms', label: '📋 My Forms' },
        ] as const).map(tab => (
          <button key={tab.id} type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer -mb-px font-sans whitespace-nowrap"
            style={{
              borderColor: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'builder' && (
        <>
          {/* Main 3-column body */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left: palette (sm+) */}
            <div className="hidden sm:flex w-48 border-r flex-col shrink-0 overflow-y-auto"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
              <div className="px-3 pt-3 pb-2 sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Field Types</p>
                <div className="flex gap-1">
                  {(['basic', 'advanced', 'layout', 'design'] as const).map(cat => (
                    <button key={cat} type="button" onClick={() => setActivePaletteCategory(cat)}
                      className="flex-1 text-[9px] font-bold py-1 rounded-lg cursor-pointer transition capitalize font-sans"
                      style={{
                        backgroundColor: activePaletteCategory === cat ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: activePaletteCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >{cat}</button>
                  ))}
                </div>
              </div>
              <div className="p-2 space-y-1 flex-1">
                {filteredPaletteItems.map((item) => (
                  <div key={item.type} draggable onDragStart={(e) => handlePaletteDragStart(e, item)}
                    onClick={() => {
                      if (item.type === 'form_design_block' && fields.some(f => f.type === 'form_design_block')) {
                        return;
                      }
                      setFields(prev => [...prev, createField(item.type, item.defaultLabel)]);
                      markDirtyAndSave();
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer select-none transition hover:border-indigo-400 group"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                    title={`${item.description} (Drag to form, or click to add)`}
                  >
                    <span className="shrink-0 text-indigo-400 group-hover:text-indigo-500 transition">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                      <p className="text-[9px] mt-0.5 leading-none truncate" style={{ color: 'var(--color-text-secondary)' }}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: meta fields + canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile palette */}
              <div className="sm:hidden flex flex-col gap-1 px-4 py-2 border-b shrink-0 bg-[var(--color-bg-card)]" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {(['basic', 'advanced', 'layout', 'design'] as const).map(cat => (
                    <button key={cat} type="button" onClick={() => setActivePaletteCategory(cat)}
                      className="text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full transition cursor-pointer capitalize"
                      style={{
                        backgroundColor: activePaletteCategory === cat ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: activePaletteCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >{cat}</button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pt-1">
                  {PALETTE_ITEMS.filter(i => i.category === activePaletteCategory).map(item => (
                    <button key={item.type} type="button"
                      onClick={() => {
                        if (item.type === 'form_design_block' && fields.some(f => f.type === 'form_design_block')) {
                          return;
                        }
                        setFields(prev => [...prev, createField(item.type, item.defaultLabel)]);
                        markDirtyAndSave();
                      }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-bold cursor-pointer font-sans"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-200"
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
                onDragEnd={() => { setDragOverIndex(null); setIsDraggingOverCanvas(false); }}
                style={{
                  outline: isDraggingOverCanvas ? '2.5px dashed var(--color-accent)' : '2.5px dashed transparent',
                  outlineOffset: '-4px',
                  borderRadius: '12px',
                  backgroundColor: isDraggingOverCanvas ? 'color-mix(in srgb, var(--color-accent) 5%, transparent)' : undefined,
                  transition: 'outline 0.15s ease, background-color 0.15s ease',
                }}
              >
                {/* Form style container */}
                {false && (
                <div className="border rounded-xl p-4 mb-4 space-y-3 shadow-xs" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-bold text-xs font-sans" style={{ color: 'var(--color-text-primary)' }}>Form Visual Design Styles</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
                        Form Background
                      </label>

                      {/* Mode tabs */}
                      <div className="flex gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        {(['solid', 'gradient', 'image'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => { setBgMode(mode); markDirtyAndSave(); }}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer capitalize"
                            style={bgMode === mode
                              ? { background: 'var(--accent-gradient)', color: '#fff' }
                              : { color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }
                            }
                          >
                            {mode === 'solid' ? '🎨 Solid' : mode === 'gradient' ? '🌈 Gradient' : '🖼 Image'}
                          </button>
                        ))}
                      </div>

                      {/* Solid color */}
                      {bgMode === 'solid' && (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={bgSolidColor}
                            onChange={(e) => { setBgSolidColor(e.target.value); markDirtyAndSave(); }}
                            className="w-10 h-10 rounded-lg cursor-pointer border bg-transparent p-0.5"
                            style={{ borderColor: 'var(--color-border)' }}
                          />
                          <input
                            type="text"
                            value={bgSolidColor}
                            onChange={(e) => setBgSolidColor(e.target.value)}
                            onBlur={() => markDirtyAndSave()}
                            placeholder="#ffffff"
                            className="flex-1 border rounded-lg px-2.5 py-1.5 outline-none text-xs font-mono"
                            style={inputStyle}
                          />
                          {/* Quick color presets */}
                          <div className="flex gap-1">
                            {['#ffffff', '#f8fafc', '#f3f0ff', '#fff7ed', '#f0fdf4', '#0f172a'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => { setBgSolidColor(c); markDirtyAndSave(); }}
                                className="w-5 h-5 rounded-full border cursor-pointer transition hover:scale-110"
                                style={{ backgroundColor: c, borderColor: bgSolidColor === c ? 'var(--color-accent)' : 'rgba(0,0,0,0.15)', borderWidth: bgSolidColor === c ? '2px' : '1px' }}
                                title={c}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gradient builder */}
                      {bgMode === 'gradient' && (
                        <div className="space-y-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>

                          {/* Color stops */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Color 1</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={bgGradientColor1} onChange={(e) => { setBgGradientColor1(e.target.value); markDirtyAndSave(); }}
                                  className="w-8 h-8 rounded-lg cursor-pointer border bg-transparent p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                <input type="text" value={bgGradientColor1} onChange={(e) => setBgGradientColor1(e.target.value)}
                                  onBlur={() => markDirtyAndSave()}
                                  className="flex-1 border rounded-lg px-2 py-1.5 outline-none text-xs font-mono" style={inputStyle} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Color 2</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={bgGradientColor2} onChange={(e) => { setBgGradientColor2(e.target.value); markDirtyAndSave(); }}
                                  className="w-8 h-8 rounded-lg cursor-pointer border bg-transparent p-0.5" style={{ borderColor: 'var(--color-border)' }} />
                                <input type="text" value={bgGradientColor2} onChange={(e) => setBgGradientColor2(e.target.value)}
                                  onBlur={() => markDirtyAndSave()}
                                  className="flex-1 border rounded-lg px-2 py-1.5 outline-none text-xs font-mono" style={inputStyle} />
                              </div>
                            </div>
                          </div>

                          {/* Gradient preview bar */}
                          <div
                            className="h-6 rounded-lg border"
                            style={{
                              background: `linear-gradient(${bgGradientAngle}deg, ${bgGradientColor1}, ${bgGradientColor2})`,
                              borderColor: 'var(--color-border)'
                            }}
                          />

                          {/* Angle control */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Angle</label>
                              <span className="text-[10px] font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>{bgGradientAngle}°</span>
                            </div>

                            {/* Draggable angle slider */}
                            <input
                              type="range"
                              min={0}
                              max={315}
                              step={45}
                              value={bgGradientAngle}
                              onChange={(e) => { setBgGradientAngle(parseInt(e.target.value)); markDirtyAndSave(); }}
                              className="w-full"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />

                            {/* Quick angle presets — the exact angles requested */}
                            <div className="flex gap-1 flex-wrap">
                              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                                <button
                                  key={angle}
                                  type="button"
                                  onClick={() => { setBgGradientAngle(angle); markDirtyAndSave(); }}
                                  className="px-2 py-0.5 rounded border text-[9px] font-bold font-mono transition cursor-pointer"
                                  style={bgGradientAngle === angle
                                    ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                                    : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }
                                  }
                                >
                                  {angle}°
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Gradient quick presets */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>Quick Presets</label>
                            <div className="flex gap-2 flex-wrap">
                              {[
                                { label: 'Indigo Sky',  c1: '#6366f1', c2: '#38bdf8', angle: 135 },
                                { label: 'Sunset',      c1: '#f59e0b', c2: '#ef4444', angle: 135 },
                                { label: 'Forest',      c1: '#10b981', c2: '#3b82f6', angle: 135 },
                                { label: 'Rose Gold',   c1: '#f43f5e', c2: '#fb923c', angle: 135 },
                                { label: 'Midnight',    c1: '#1e1b4b', c2: '#312e81', angle: 135 },
                                { label: 'Pearl',       c1: '#f8fafc', c2: '#e2e8f0', angle: 135 },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    setBgGradientColor1(preset.c1);
                                    setBgGradientColor2(preset.c2);
                                    setBgGradientAngle(preset.angle);
                                    markDirtyAndSave();
                                  }}
                                  className="px-2.5 py-1 rounded-full text-[9px] font-bold border cursor-pointer transition hover:scale-105"
                                  style={{
                                    background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})`,
                                    color: '#fff',
                                    borderColor: 'transparent',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                  }}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Image URL background */}
                      {bgMode === 'image' && (
                        <div className="space-y-4">
                          {/* File upload zone for background */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                              Background Image Upload
                            </label>
                            <div
                              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith('image/')) handleFormBgUpload(file);
                              }}
                              onClick={() => document.getElementById('form-bg-file-input')?.click()}
                              className="border border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-accent)] transition text-center"
                              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', minHeight: '80px' }}
                            >
                              <input
                                id="form-bg-file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFormBgUpload(file);
                                }}
                              />
                              {bgUploading ? (
                                <span className="text-[10px] font-bold" style={{ color: 'var(--color-accent)' }}>⚡ Uploading...</span>
                              ) : bgImageUrl && (bgImageUrl.startsWith('http') || bgImageUrl.startsWith('/') || bgImageUrl.startsWith('data:')) ? (
                                <>
                                  <img src={bgImageUrl} alt="Background Preview" className="w-16 h-10 object-cover rounded border" style={{ borderColor: 'var(--color-border)' }} />
                                  <span className="text-[9px] font-bold text-emerald-500">Image loaded · click to replace</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-indigo-500" />
                                  <p className="text-[10px] font-bold" style={{ color: 'var(--color-text-primary)' }}>Drop image here or click to browse</p>
                                  <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>Supports PNG, JPG, WEBP</p>
                                </>
                              )}
                            </div>
                            {bgUploadError && (
                              <p className="text-[10px] text-red-500 font-bold animate-pulse">⚠️ {bgUploadError}</p>
                            )}
                          </div>

                          {/* Image URL fallback */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                              Or use External Image URL
                            </label>
                            <input
                              type="text"
                              value={bgImageUrl.startsWith('data:') ? '' : bgImageUrl}
                              onChange={(e) => { setBgImageUrl(e.target.value); markDirtyAndSave(); }}
                              onBlur={() => markDirtyAndSave()}
                              placeholder="https://example.com/background.jpg"
                              className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-medium"
                              style={inputStyle}
                            />
                            {/* Device upload button */}
                            <div className="flex items-center gap-2 mt-2">
                              <label
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition hover:bg-neutral-50"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                              >
                                <Upload className="w-3 h-3" />
                                Upload from device
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFormBgUpload(file);
                                  }}
                                />
                              </label>
                              <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>PNG, JPG, WEBP, SVG</span>
                            </div>
                            <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>
                              Direct image URL. Useful if hosting externally.
                            </p>
                          </div>

                          {/* Fit & Layout Options */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                                Layout Style
                              </label>
                              <select
                                value={bgSize}
                                onChange={(e) => { setBgSize(e.target.value as any); markDirtyAndSave(); }}
                                className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs font-semibold"
                                style={inputStyle}
                              >
                                <option value="cover">🔄 Fill (Cover)</option>
                                <option value="contain">🔍 Fit (Contain)</option>
                                <option value="auto">📍 Natural (Auto)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wide block" style={{ color: 'var(--color-text-secondary)' }}>
                                Blend Mode
                              </label>
                              <select
                                value={bgBlendMode}
                                onChange={(e) => { setBgBlendMode(e.target.value); markDirtyAndSave(); }}
                                className="w-full border rounded-lg px-2 py-1.5 outline-none text-xs font-semibold"
                                style={inputStyle}
                              >
                                <option value="normal">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                                <option value="color-dodge">Color Dodge</option>
                                <option value="color-burn">Color Burn</option>
                                <option value="difference">Difference</option>
                                <option value="luminosity">Luminosity</option>
                              </select>
                            </div>
                          </div>

                          {/* Opacity slider */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                                Background Opacity
                              </label>
                              <span className="text-[10px] font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>{bgOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={bgOpacity}
                              onChange={(e) => { setBgOpacity(Number(e.target.value)); markDirtyAndSave(); }}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{ accentColor: 'var(--color-accent)', backgroundColor: 'var(--color-border)' }}
                            />
                          </div>

                        </div>
                      )}

                      {/* Live background preview strip */}
                      {computedFormBg && (
                        <div
                          className="h-8 rounded-xl border"
                          style={{
                            background: resolveFormBg(computedFormBg),
                            borderColor: 'var(--color-border)'
                          }}
                        />
                      )}

                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider block" style={{ color: 'var(--color-text-secondary)' }}>
                        Form Logo — Upload or URL
                      </label>

                      {/* Position selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>Position:</span>
                        {(['top-left', 'top-right', 'top-center'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => { setFormLogoPosition(pos); markDirtyAndSave(); }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer"
                            style={formLogoPosition === pos
                              ? { background: 'var(--accent-gradient)', color: '#fff', borderColor: 'transparent' }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-secondary)' }
                            }
                          >
                            {pos === 'top-left' ? '↖ Left' : pos === 'top-center' ? '↑ Center' : '↗ Right'}
                          </button>
                        ))}
                      </div>

                      {/* Upload area + URL input split */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Upload zone */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type.startsWith('image/')) handleFormLogoUpload(file);
                          }}
                          onClick={() => document.getElementById('form-logo-file-input')?.click()}
                          className="border border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-accent)] transition text-center"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', minHeight: '72px' }}
                        >
                          <input
                            id="form-logo-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFormLogoUpload(file);
                            }}
                          />
                          {logoUploading ? (
                            <span className="text-[10px] font-bold" style={{ color: 'var(--color-accent)' }}>⚡ Uploading...</span>
                          ) : formLogoUrl && (formLogoUrl.startsWith('http') || formLogoUrl.startsWith('/')) ? (
                            <>
                              <img src={formLogoUrl} alt="Logo preview" className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: 'var(--color-border)' }} />
                              <span className="text-[9px] font-bold text-emerald-500">Logo set · click to replace</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 opacity-40" style={{ color: 'var(--color-text-secondary)' }} />
                              <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>Drag & drop or click</span>
                              <span className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>PNG, JPG, SVG · max 500KB</span>
                            </>
                          )}
                        </div>

                        {/* URL input fallback */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold block" style={{ color: 'var(--color-text-secondary)' }}>Or paste image URL</label>
                          <input
                            type="text"
                            value={formLogoUrl}
                            onChange={(e) => { setFormLogoUrl(e.target.value); markDirtyAndSave(); }}
                            onBlur={() => markDirtyAndSave()}
                            placeholder="https://example.com/logo.png"
                            className="w-full border rounded-lg px-2.5 py-1.5 outline-none text-xs font-medium"
                            style={inputStyle}
                          />
                          {formLogoUrl && (
                            <button
                              type="button"
                              onClick={() => { setFormLogoUrl(''); markDirtyAndSave(); }}
                              className="text-[9px] font-bold text-red-400 hover:text-red-600 transition cursor-pointer"
                            >
                              ✕ Remove logo
                            </button>
                          )}
                        </div>

                      </div>

                      {logoUploadError && (
                        <p className="text-[10px] text-red-500 font-bold animate-pulse">⚠️ {logoUploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
                )}



                {/* Clean full-width editor interface */}
                <div className="w-full transition-all duration-300 font-sans mx-auto max-w-full">

                  {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-12 sm:py-16 text-center transition px-4"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
                      <Plus className="w-8 h-8 mb-3 opacity-25 text-indigo-400" />
                      <p className="text-sm font-bold font-sans" style={{ color: 'var(--color-text-primary)' }}>Drop fields here</p>
                      <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Drag from the left palette, or tap a basic field on mobile to customize your flow.
                      </p>
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => setBrowseTemplatesOpen(true)}
                          className="px-4 py-2 text-white text-xs font-extrabold rounded-xl hover:scale-105 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                          style={{ background: 'var(--accent-gradient)' }}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Start from Template
                        </button>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-0">
                        {/* Drop zone BEFORE first field */}
                        <DropZoneLine
                          index={0}
                          isActive={dragOverIndex === 0}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(0); }}
                          onDrop={(e) => handleFieldDrop(e, 0)}
                        />
                        {fields.map((field, index) => (
                          <React.Fragment key={field.id}>
                            <FieldEditor
                              field={field}
                              index={index}
                              fields={fields}
                              total={fields.length}
                              onChange={handleFieldChange}
                              onDelete={handleFieldDelete}
                              onMoveUp={handleMoveUp}
                              onMoveDown={handleMoveDown}
                              isDragOver={false}
                              onDragStart={handleFieldDragStart}
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onDrop={(e) => { e.stopPropagation(); }}
                              onDragEnd={handleFieldDragEnd}
                              markDirtyAndSave={markDirtyAndSave}
                              onDesignChange={handleDesignChange}
                              designState={{
                                bgMode,
                                bgSolidColor,
                                bgGradientColor1,
                                bgGradientColor2,
                                bgGradientAngle,
                                bgImageUrl,
                                formLogoUrl,
                                formLogoPosition,
                                computedFormBg,
                                logoUploading,
                                logoUploadError,
                                handleFormLogoUpload,
                                bgSolidOpacity,
                                bgGradientOpacity,
                                bgImageOverlayColor,
                                bgImageOverlayOpacity,
                                bgGlassEnabled,
                                bgGlassBlur,
                                bgGlassBorderRadius,
                                bgGlassBorderColor,
                                bgGlassBorderWidth,
                                bgGlassColorStops,
                                bgGlassAngle,
                              }}
                            />
                            {/* Drop zone AFTER each field */}
                            <DropZoneLine
                              index={index + 1}
                              isActive={dragOverIndex === index + 1}
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(index + 1); }}
                              onDrop={(e) => handleFieldDrop(e, index + 1)}
                            />
                          </React.Fragment>
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>

            {/* Right: desktop live preview (clamp) */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-l overflow-y-auto shrink-0 hidden sm:block"
                  style={{ width: 'clamp(280px, 30%, 380px)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  <div className="px-4 py-3.5 sticky top-0 z-10 border-b" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-wider font-sans" style={{ color: 'var(--color-text-secondary)' }}>Interactive Live Preview</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Autosaved form design · Click 'Push to Preview' to sync changes</p>
                  </div>
                  <div className="p-4">
                    <FormPreview
                      fields={previewFields}
                      serviceName={selectedProgramId ? name : formName}
                      fees={fees}
                      description={desc}
                      formBg={formBg}
                      formLogoUrl={formLogoUrl}
                      formLogoPosition={formLogoPosition}
                      formBgBlendMode={bgBlendMode}
                      formBgSize={bgSize}
                      formBgOpacity={bgOpacity}
                      hideTitle={true}
                      onChange={(fieldId, updates) => {
                        handleFieldChange(fieldId, updates);
                        setPreviewFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
                      }}
                      markDirtyAndSave={markDirtyAndSave}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t shrink-0 flex-wrap gap-3"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <p className="text-[11px] font-sans text-neutral-500" style={{ color: 'var(--color-text-secondary)' }}>
              {fields.length > 0
                ? `${fields.length} field${fields.length !== 1 ? 's' : ''} configured · updates autosave`
                : `No custom fields — ${isEducation ? 'program' : 'service'} will use basic info default template only`}
            </p>
            <div className="flex items-center gap-2 ml-auto flex-wrap font-sans">
              {fields.length > 0 && (
                <button type="button"
                  onClick={() => {
                    setPreviewFields([...fields.map(f => ({ ...f }))]);
                    setShowPreview(true);
                    setPreviewPushed(true);
                    setTimeout(() => setPreviewPushed(false), 1500);
                  }}
                  className="px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition hover:bg-neutral-100"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
                  <Eye className="w-3.5 h-3.5" />
                  {previewPushed ? '✓ Preview Updated' : 'Push to Preview'}
                </button>
              )}
              <button type="button" onClick={() => handleSaveAll(false)} disabled={!(selectedProgramId ? name : formName).trim() || isSaving}
                className="px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition hover:bg-neutral-100 disabled:opacity-40"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>

              {isSuperAdmin && selectedProgramId && fields.length > 0 && (
                <button type="button" 
                  onClick={() => {
                    setPromoteName(name || '');
                    setPromoteDesc(desc || '');
                    setIsPromoteTemplateOpen(true);
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition hover:bg-neutral-100 disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Save as Template
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveAll(true)}
                disabled={!(selectedProgramId ? name : formName).trim() || isSaving}
                className="px-5 py-2 rounded-xl text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 shadow-lg"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {isSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</>
                ) : isPublished ? (
                  <><RefreshCw className="w-3.5 h-3.5" /> Republish</>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                    Go Live
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'fonts' && (() => {
        const designBlock = fields.find(f => f.type === 'form_design_block');
        return (
          <div className="flex-grow flex flex-col min-h-0 bg-[var(--color-bg-base)] overflow-y-auto p-4 sm:p-6 font-sans">
            <div className="max-w-xl mx-auto w-full bg-[var(--color-bg-card)] border rounded-2xl p-6 shadow-xs space-y-6" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-150/30">
                  <span className="text-lg">🔤</span>
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Typography & Google Fonts</h2>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>Changes apply to all form elements live.</p>
                </div>
              </div>

              {!designBlock ? (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-2xl mb-1.5 font-sans">🎨</p>
                  <p className="text-xs font-bold leading-relaxed font-sans" style={{ color: 'var(--color-text-secondary)' }}>
                    Add a 'Form Design Block' field to your form first to unlock typography settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    {([
                      { label: 'All Elements', key: 'fontFamilyAll' },
                      { label: 'Form Title', key: 'fontFamilyTitle' },
                      { label: 'Body / Labels', key: 'fontFamilyBody' },
                      { label: 'Buttons', key: 'fontFamilyButton' },
                    ] as const).map(({ label, key }) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
                          <span className="text-[10px] font-mono text-neutral-400 capitalize">{(designBlock as any)[key] || 'Default'}</span>
                        </div>
                        <select
                          value={(designBlock as any)[key] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            loadGoogleFont(val);
                            handleFieldChange(designBlock.id, { [key]: val });
                            markDirtyAndSave();
                          }}
                          className="w-full border rounded-xl px-3 py-2 text-xs outline-none cursor-pointer transition focus:border-indigo-400"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border)',
                            fontFamily: (designBlock as any)[key] || 'inherit'
                          }}
                        >
                          <option value="">Default (system font)</option>
                          {GOOGLE_FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-5 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Live Font Preview</p>
                    <div 
                      className="p-5 border rounded-xl space-y-3.5 bg-neutral-50/40 select-none" 
                      style={{ 
                        borderColor: 'var(--color-border)',
                        fontFamily: designBlock.fontFamilyAll || 'inherit'
                      }}
                    >
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-505 tracking-wider font-mono">Form Title Preview</p>
                        <h4 
                          className="text-lg font-bold tracking-tight mt-0.5"
                          style={{ fontFamily: designBlock.fontFamilyTitle || designBlock.fontFamilyAll || 'inherit', color: 'var(--color-text-primary)' }}
                        >
                          The Art of Digital Design & Layouts
                        </h4>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-505 tracking-wider font-mono">Body / Labels Preview</p>
                        <p 
                          className="text-xs leading-relaxed mt-0.5"
                          style={{ fontFamily: designBlock.fontFamilyBody || designBlock.fontFamilyAll || 'inherit', color: 'var(--color-text-secondary)' }}
                        >
                          This text displays how descriptions, labels, and standard inline helper messages will look when configured with chosen typography.
                        </p>
                      </div>

                      <div className="pt-1.5">
                        <p className="text-[10px] uppercase font-bold text-indigo-505 tracking-wider font-mono mb-1.5">Buttons Preview</p>
                        <button
                          type="button"
                          className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs"
                          style={{ 
                            fontFamily: designBlock.fontFamilyButton || designBlock.fontFamilyAll || 'inherit',
                            background: 'var(--accent-gradient)'
                          }}
                        >
                          Submit Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === 'my_forms' && (
        <div className="flex-grow flex flex-col min-h-0 bg-[var(--color-bg-base)] overflow-y-auto">
          {(() => {
            const formsWithSchema = programs.filter(p => p.formSchema && p.formSchema.length > 0);
            return (
              <div className="flex-1 p-4 sm:p-6 space-y-3">
                {formsWithSchema.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm font-black font-sans" style={{ color: 'var(--color-text-secondary)' }}>No interactive forms saved yet.</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Use the Form Builder tab on the left to design your custom form schemas.
                    </p>
                    <button type="button" onClick={() => setActiveTab('builder')}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition hover:scale-105 active:scale-95 shadow-md font-sans"
                      style={{ background: 'var(--accent-gradient)' }}>
                      Go to Builder
                    </button>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider mb-2 font-sans" style={{ color: 'var(--color-text-secondary)' }}>
                      My Saved Forms ({formsWithSchema.length})
                    </h2>
                    {formsWithSchema.map(p => (
                      <div key={p.id} className="border rounded-xl overflow-hidden shadow-xs transition-all"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
                        {/* Row */}
                        <div 
                          className="flex items-center gap-3 px-4 py-3 flex-wrap sm:flex-nowrap cursor-pointer hover:bg-neutral-50/50"
                          onClick={() => setExpandedFormCardId(expandedFormCardId === p.id ? null : p.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black truncate font-sans" style={{ color: 'var(--color-text-primary)' }}>{p.name}</p>
                              {onDeleteForm && (
                                <button type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteForm(p.id);
                                  }}
                                  className="text-red-400 hover:text-red-600 transition cursor-pointer p-1 rounded-md hover:bg-red-50"
                                  title="Delete Form">
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 font-sans">
                              <span className="text-[10px] font-mono select-all px-1.5 py-0.5 rounded cursor-copy border"
                                onClick={(e) => e.stopPropagation()}
                                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                                title="Click to select form ID">
                                ID: {p.id}
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                                · {p.formSchema?.length ?? 0} field{(p.formSchema?.length ?? 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          {/* Published status */}
                          <span className="flex items-center gap-1.5 text-[10px] font-bold font-sans">
                            <span className={`w-2 h-2 rounded-full ${p.published ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                            {p.published ? 'Published' : 'Draft'}
                          </span>
                          {/* Actions */}
                          <button type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProgramId(p.id);
                              setActiveTab('builder');
                            }}
                            className="px-3 py-1.5 border rounded-xl text-[10px] font-bold cursor-pointer transition hover:bg-neutral-100 font-sans"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                            Edit
                          </button>
                          <button type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedEmbedId(expandedEmbedId === p.id ? null : p.id);
                            }}
                            className="px-3 py-1.5 border rounded-xl text-[10px] font-bold cursor-pointer transition hover:bg-neutral-100 flex items-center gap-1 font-sans"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
                            <Code className="w-3.5 h-3.5 text-indigo-500" /> Embed
                          </button>
                        </div>
                        {/* Expand accordion */}
                        <AnimatePresence>
                          {expandedFormCardId === p.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                  Fields in this form:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(p.formSchema || []).map((f, i) => (
                                    <span key={f.id || i}
                                      className="text-[10px] px-2 py-0.5 rounded-md border font-mono"
                                      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                      {f.label || f.type}
                                    </span>
                                  ))}
                                  {(p.formSchema || []).length === 0 && (
                                    <span className="text-[10px] italic" style={{ color: 'var(--color-text-secondary)' }}>No fields yet</span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {/* Embed accordion */}
                        <AnimatePresence>
                          {expandedEmbedId === p.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }} className="overflow-hidden">
                              <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <EmbedCodeBlock programId={p.id} programName={p.name} fieldCount={p.formSchema?.length ?? 0} isPublished={p.published} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Mobile Sliding Fullscreen Preview Overlay */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg-base)] sm:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
              <div>
                <p className="text-xs font-black font-sans" style={{ color: 'var(--color-text-primary)' }}>Mobile Live Preview</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Fully interactive form render view</p>
              </div>
              <button type="button" onClick={() => setShowMobilePreview(false)}
                className="p-1 px-3 rounded-lg border text-xs font-bold hover:bg-neutral-100 transition cursor-pointer font-sans"
                style={{ borderColor: 'var(--color-border)' }}>
                Close Preview
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <FormPreview
                fields={fields}
                serviceName={selectedProgramId ? name : formName}
                fees={fees}
                description={desc}
                formBg={formBg}
                formLogoUrl={formLogoUrl}
                formLogoPosition={formLogoPosition}
                formBgBlendMode={bgBlendMode}
                formBgSize={bgSize}
                formBgOpacity={bgOpacity}
                hideTitle={true}
                onChange={handleFieldChange}
                markDirtyAndSave={markDirtyAndSave}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen Preview Overlay (Desktop) ── */}
      <AnimatePresence>
        {showFullscreenPreview && (
          <motion.div
            key="fullscreen-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between px-6 py-3 border-b shrink-0 gap-4"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-xs font-black font-sans" style={{ color: 'var(--color-text-primary)' }}>
                  Fullscreen Form Preview
                </p>
                <p className="text-[10px] font-sans" style={{ color: 'var(--color-text-secondary)' }}>
                  This is exactly how the form appears to your end users
                </p>
              </div>

              {/* Centered Device Toggles */}
              <div className="flex items-center gap-0.5 p-1 rounded-xl border shrink-0 bg-neutral-100 dark:bg-neutral-800" style={{ borderColor: 'var(--color-border)' }}>
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
                  const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor;
                  const isActive = previewDevice === device;
                  return (
                    <button
                      key={device}
                      type="button"
                      onClick={() => setPreviewDevice(device)}
                      className="p-1 px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold font-sans"
                      style={{
                        backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                      }}
                      title={`Preview in ${device} width`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{device}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFullscreenPreview(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition hover:bg-neutral-100 font-sans flex items-center gap-1.5"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  <X className="w-3.5 h-3.5" />
                  Return to Editor
                </button>
              </div>
            </div>

            {/* Scrollable form content — centered, dynamic device wrapper */}
            <div
              className="flex-1 overflow-y-auto flex justify-center items-start py-10 px-4"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <div
                className={`w-full transition-all duration-300 font-sans ${
                  previewDevice === 'mobile'
                    ? 'max-w-[375px] border-[12px] border-neutral-800 dark:border-neutral-700 rounded-[2.2rem] bg-white dark:bg-neutral-900 shadow-2xl overflow-y-auto h-[680px] max-h-[75vh] relative p-4 flex flex-col'
                    : previewDevice === 'tablet'
                    ? 'max-w-[768px] border-[8px] border-neutral-600 dark:border-neutral-500 rounded-[1.8rem] bg-white dark:bg-neutral-900 shadow-xl overflow-y-auto h-[880px] max-h-[85vh] relative p-6 flex flex-col'
                    : 'max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border'
                }`}
                style={previewDevice === 'desktop' ? { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' } : {}}
              >
                {/* Subtle mobile screen status/header bars */}
                {previewDevice === 'mobile' && (
                  <div className="w-full flex items-center justify-between text-[10px] text-neutral-400 font-medium px-2 pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-3 shrink-0 select-none">
                    <span>9:41 AM</span>
                    <div className="w-12 h-3.5 bg-neutral-800 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-neutral-950 dark:bg-neutral-900 mr-1.5 animate-pulse" />
                      <div className="w-5 h-1 bg-neutral-600 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2.5 border border-neutral-400 rounded-xs p-0.5 flex items-center justify-start"><div className="w-full h-full bg-neutral-400 rounded-xs" /></div>
                    </div>
                  </div>
                )}
                <FormPreview
                  fields={fields}
                  serviceName={selectedProgramId ? name : formName}
                  fees={fees}
                  description={desc}
                  formBg={formBg}
                  formLogoUrl={formLogoUrl}
                  formLogoPosition={formLogoPosition}
                  formBgBlendMode={bgBlendMode}
                  formBgSize={bgSize}
                  formBgOpacity={bgOpacity}
                  hideTitle={true}
                  onChange={handleFieldChange}
                  markDirtyAndSave={markDirtyAndSave}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Save as Master Template */}
      <AnimatePresence>
        {isPromoteTemplateOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPromoteTemplateOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl overflow-hidden font-sans border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-lg font-black leading-tight" style={{ color: 'var(--color-text-primary)' }}>Promote to Form Template</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Publish this custom form structure as a master template in the global Templates Library for other flows to reuse.
              </p>

              <form onSubmit={handlePromoteToTemplateSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Template Display Name</label>
                  <input
                    type="text"
                    required
                    value={promoteName}
                    onChange={(e) => setPromoteName(e.target.value)}
                    placeholder="e.g. Standard Admissions Request"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border bg-transparent font-sans text-[var(--color-text-primary)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Detailed Description & Purpose</label>
                  <textarea
                    required
                    value={promoteDesc}
                    onChange={(e) => setPromoteDesc(e.target.value)}
                    placeholder="Describe what makes this form high-converting or standard..."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border bg-transparent font-sans text-[var(--color-text-primary)] h-20"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Template Category</label>
                  <select
                    value={promoteCategory}
                    onChange={(e) => setPromoteCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border bg-transparent text-[var(--color-text-primary)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="general" className="bg-neutral-950 text-white">Lead Capture</option>
                    <option value="registration" className="bg-neutral-950 text-white">Registration</option>
                    <option value="onboarding" className="bg-neutral-950 text-white">Onboarding</option>
                    <option value="feedback" className="bg-neutral-950 text-white">Feedback & Surveys</option>
                    <option value="premium" className="bg-neutral-950 text-white">High-Converting</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPromoteTemplateOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-neutral-100 transition cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={promoteLoading}
                    className="px-5 py-2 text-white text-xs font-black rounded-xl hover:scale-105 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {promoteLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Promote & Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Standalone Form Embed Snippet */}
      <AnimatePresence>
        {showEmbedModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowEmbedModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl overflow-hidden font-sans border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black leading-tight" style={{ color: 'var(--color-text-primary)' }}>Embed Standalone Form</h2>
                <button type="button" onClick={() => setShowEmbedModal(false)} className="text-neutral-400 hover:text-neutral-600 transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Integrate this beautiful intake form directly onto any external landing page, website builder, or custom platform.
              </p>

              <div className="space-y-4">
                {/* Option A — iframe embed */}
                <div className="border rounded-2xl p-4 transition-all" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold font-mono text-indigo-500">Option A — Interactive Iframe Embed</span>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `<iframe src="${window.location.origin}/form-embed?programId=${selectedProgramId}" style="width:100%;border:none;min-height:600px;" title="${name || formName || 'Intake Form'}"></iframe>`;
                        navigator.clipboard.writeText(code).then(() => {
                          setCopiedOptionA(true);
                          setTimeout(() => setCopiedOptionA(false), 2000);
                        });
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition flex items-center gap-1 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      style={{ borderColor: 'var(--color-border)', color: copiedOptionA ? '#10b981' : 'var(--color-text-primary)' }}
                    >
                      {copiedOptionA ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono p-3 rounded-xl overflow-x-auto leading-relaxed bg-neutral-900 border border-neutral-800 text-slate-300 whitespace-pre-wrap word-break-all">
                    {`<iframe src="${window.location.origin}/form-embed?programId=${selectedProgramId}" style="width:100%;border:none;min-height:600px;" title="${name || formName || 'Intake Form'}"></iframe>`}
                  </pre>
                  <p className="text-[10px] mt-2 text-slate-500 font-medium">
                    Perfect for fast, sandboxed integration on any website creator (Wix, Webflow, WordPress, custom code).
                  </p>
                </div>

                {/* Option B — script embed (auto-resizing) */}
                <div className="border rounded-2xl p-4 transition-all" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold font-mono text-indigo-500">Option B — Dynamic Script Embed (Recommended)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `<div id="neslead-form-${selectedProgramId}"></div>\n<script src="${window.location.origin}/form-embed.js?programId=${selectedProgramId}"></script>`;
                        navigator.clipboard.writeText(code).then(() => {
                          setCopiedOptionB(true);
                          setTimeout(() => setCopiedOptionB(false), 2000);
                        });
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition flex items-center gap-1 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      style={{ borderColor: 'var(--color-border)', color: copiedOptionB ? '#10b981' : 'var(--color-text-primary)' }}
                    >
                      {copiedOptionB ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono p-3 rounded-xl overflow-x-auto leading-relaxed bg-neutral-900 border border-neutral-800 text-slate-300 whitespace-pre-wrap word-break-all">
                    {`<div id="neslead-form-${selectedProgramId}"></div>\n<script src="${window.location.origin}/form-embed.js?programId=${selectedProgramId}"></script>`}
                  </pre>
                  <p className="text-[10px] mt-2 text-slate-500 font-medium">
                    Recommended. Automatically resizes the embedded form wrapper to fit your fields perfectly on all viewports.
                  </p>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/30">
                <p className="text-[10.5px] font-medium text-indigo-900 dark:text-indigo-400 leading-relaxed text-center">
                  💡 <strong>Note:</strong> This embed always reflects your latest saved form — no need to update the embed code when you edit fields.
                </p>
              </div>

              <div className="flex items-center justify-end mt-5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmbedModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 border transition cursor-pointer"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AI Form Generation */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { if (!aiGenerating) setShowAIModal(false); }}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl overflow-hidden font-sans border"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              {/* Premium shifting gradient background mesh (large, ambient glowing spots) */}
              <div 
                className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full pointer-events-none transition-all duration-1000" 
                style={{
                  background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.15) 50%, transparent 100%)',
                  animation: 'custom-pulse-glow 8s infinite ease-in-out',
                }}
              />
              <div 
                className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 rounded-full pointer-events-none transition-all duration-1000" 
                style={{
                  background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.15) 50%, transparent 100%)',
                  animation: 'custom-pulse-glow 11s infinite ease-in-out',
                }}
              />

              {/* Ultra-sleek glowing top border streak */}
              <div 
                className="absolute top-0 left-0 right-0 h-[3.5px] pointer-events-none" 
                style={{
                  background: 'linear-gradient(90deg, #4f46e5, #ec4899, #8b5cf6, #3b82f6, #4f46e5)',
                  backgroundSize: '400% 100%',
                  animation: 'custom-ai-gradient 12s linear infinite',
                }}
              />

              <div className="flex items-center gap-2.5 mb-2.5 relative z-10">
                <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-100/30">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                </div>
                <h2 className="text-xl font-black leading-tight tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Generate Form with AI</h2>
              </div>
              <p className="text-xs leading-relaxed relative z-10" style={{ color: 'var(--color-text-secondary)' }}>
                Describe any fields, questions, dropdowns, or custom sections you need. Our advanced Gemini engine will automatically generate and attach those components to your current workspace.
              </p>

              <div className="mt-5 space-y-4 relative z-10">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>AI Input Prompt</label>
                  <textarea
                    required
                    disabled={aiGenerating}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Add a contact form with fields for full name, business email, phone number, company size dropdown, and a message box."
                    className="w-full text-xs px-3 py-3 rounded-2xl border bg-transparent font-sans text-[var(--color-text-primary)] h-32 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(120, 120, 120, 0.05)' }}
                  />
                </div>

                {aiError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">⚠️</span> 
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 justify-end pt-2">
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={() => setShowAIModal(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer disabled:opacity-55"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={aiGenerating || !aiPrompt.trim()}
                    onClick={handleAIGenerate}
                    className="relative overflow-hidden px-5 py-2 text-white text-xs font-black rounded-xl hover:scale-105 active:scale-[0.98] transition-all duration-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-55 border-0"
                    style={{ 
                      background: 'linear-gradient(135deg, #4f46e5, #9333ea, #db2777, #2563eb)',
                      backgroundSize: '300% 300%',
                      animation: 'custom-ai-gradient 8s ease infinite',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                    }}
                  >
                    {/* Inner gloss shimmer on generated fields action button */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        width: '50%',
                        top: 0,
                        bottom: 0,
                        transform: 'skewX(-25deg) translateX(-150%)',
                        animation: 'custom-ai-shimmer 3s infinite ease-in-out',
                      }}
                    />
                    {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-200" />}
                    {aiGenerating ? 'Generating Fields...' : 'Generate Fields'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Browse Master Templates Inline */}
      <AnimatePresence>
        {browseTemplatesOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setBrowseTemplatesOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl overflow-hidden font-sans border max-h-[80vh] flex flex-col"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <h2 className="text-base font-black" style={{ color: 'var(--color-text-primary)' }}>Select Form Template</h2>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>Choose a framework to instantly pre-populate your builder canvas.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setBrowseTemplatesOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg transition text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                {loadingFormTemplates ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Loading templates library...</p>
                  </div>
                ) : formTemplatesList.length === 0 ? (
                  <div className="text-center py-12">
                    <Layout className="w-8 h-8 text-neutral-300 mx-auto mb-1.5" />
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>No templates available currently</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Ask an Admin to create the first staff pick templates.</p>
                  </div>
                ) : (
                  formTemplatesList.map(tmpl => (
                    <div 
                      key={tmpl.id} 
                      className="p-3 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50/20 cursor-pointer transition flex items-start gap-3 text-left"
                      style={{ borderColor: 'var(--color-border)' }}
                      onClick={() => handleApplyTemplateInline(tmpl)}
                    >
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <Layout className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black truncate text-[var(--color-text-primary)]">{tmpl.name}</h4>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] line-clamp-2 mt-0.5 text-[var(--color-text-secondary)]">{tmpl.description || 'Professional drag-and-drop styled template layout'}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-400 font-medium">
                          <span>{tmpl.formSchema?.length || 0} fields</span>
                          <span>•</span>
                          <span>Used {tmpl.useCount || 0} times</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-end pt-4 border-t mt-4" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setBrowseTemplatesOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-neutral-100 transition cursor-pointer"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
