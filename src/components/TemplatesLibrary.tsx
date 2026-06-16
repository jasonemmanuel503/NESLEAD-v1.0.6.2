import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Search, Filter, CheckCircle, Clock, Star, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { FormTemplate } from '../types';

interface TemplatesLibraryProps {
  onApplyTemplate: (template: FormTemplate, targetId?: string) => Promise<void>;
  programs: any[];
  tenantProfile: any;
  vertical?: string | null;
  authFetch: (url: string, opts?: any) => Promise<Response>;
}

export default function TemplatesLibrary({
  onApplyTemplate,
  programs,
  tenantProfile,
  vertical,
  authFetch,
}: TemplatesLibraryProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Custom states for choosing a program if programs.length > 1
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [interactiveLoading, setInteractiveLoading] = useState(false);

  // Fallbacks in case the api is empty or fails
  const fallbackTemplates: FormTemplate[] = [
    {
      id: 'template-contact',
      name: 'Dynamic Client Intake Desk',
      description: 'Sleek, high-converting consultation and client intake card suited for modern services.',
      category: 'general',
      tags: ['leads', 'onboarding'],
      thumbnailUrl: '',
      formSchema: [
        { id: 'f-name', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Dr. Jordan Vance' },
        { id: 'f-email', type: 'email', label: 'Work Email Address', required: true, placeholder: 'name@company.com' },
        { id: 'f-phone', type: 'phone', label: 'Phone Number', required: false, placeholder: '+1 (555) 0199' },
        { id: 'f-notes', type: 'long_text', label: 'Inquiry Specifics', required: true, placeholder: 'Briefly describe your situation...' }
      ],
      formBg: '',
      formLogoUrl: '',
      formLogoPosition: 'top-left',
      formBgBlendMode: 'normal',
      formBgSize: 'cover',
      formBgOpacity: 100,
      status: 'active',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: 184,
      isFeatured: true,
      vertical: 'all',
      previewDescription: 'Standard 4-field inquiry capture card.'
    },
    {
      id: 'template-healthcare-intake',
      name: 'Clinic Patient Booking Flow',
      description: 'Advanced check-in booking portal complete with insurance screening fields and reason for visit dropdown.',
      category: 'healthcare',
      tags: ['leads', 'healthcare'],
      thumbnailUrl: '',
      formSchema: [
        { id: 'h-name', type: 'short_text', label: 'Patient Name', required: true, placeholder: 'e.g. Robin Doe' },
        { id: 'h-email', type: 'email', label: 'Patient Email', required: true },
        { id: 'h-phone', type: 'phone', label: 'Emergency Contact Phone', required: true },
        { id: 'h-reason', type: 'dropdown', label: 'Appointment Reason', required: true, options: ['General Checkup', 'Specialist Consult', 'Follow-up appointment', 'Emergency triage'] },
        { id: 'h-ins', type: 'radio', label: 'Do you have insurance?', required: true, options: ['Yes', 'No'] }
      ],
      formBg: '',
      formLogoUrl: '',
      formLogoPosition: 'top-left',
      formBgBlendMode: 'normal',
      formBgSize: 'cover',
      formBgOpacity: 100,
      status: 'active',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: 92,
      isFeatured: true,
      vertical: 'healthcare',
      previewDescription: 'In-depth clinic pre-patient booking flow.'
    },
    {
      id: 'template-legal-intake',
      name: 'Confidential Case Evaluator',
      description: 'Strictly secure intake assessment for legal entities, designed to prioritize high-value claims.',
      category: 'legal',
      tags: ['leads', 'legal'],
      thumbnailUrl: '',
      formSchema: [
        { id: 'l-name', type: 'short_text', label: 'Client Full Name', required: true },
        { id: 'l-email', type: 'email', label: 'Confidential Email Address', required: true },
        { id: 'l-phone', type: 'phone', label: 'Direct Phone Line', required: true },
        { id: 'l-area', type: 'dropdown', label: 'Legal Practice Area', required: true, options: ['Corporate Legal Counsel', 'Family Litigation', 'Property & Estate Conveyancing', 'Personal Injury'] },
        { id: 'l-desc', type: 'long_text', label: 'Summary of Case Details', required: true }
      ],
      formBg: '',
      formLogoUrl: '',
      formLogoPosition: 'top-left',
      formBgBlendMode: 'normal',
      formBgSize: 'cover',
      formBgOpacity: 100,
      status: 'active',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: 140,
      isFeatured: false,
      vertical: 'legal-services',
      previewDescription: 'High commitment diagnostic evaluation template.'
    },
    {
      id: 'template-newsletter-signup',
      name: 'Newsletter & Updates Signup',
      description: 'Ultra-simplified subscriber onboarding card focused on fast, high-conversion rates.',
      category: 'general',
      tags: ['marketing', 'quick'],
      thumbnailUrl: '',
      formSchema: [
        { id: 'n-first', type: 'short_text', label: 'First Name', required: true, placeholder: 'e.g. Robin' },
        { id: 'n-email', type: 'email', label: 'Email Address', required: true, placeholder: 'robin@example.com' }
      ],
      formBg: '',
      formLogoUrl: '',
      formLogoPosition: 'top-left',
      formBgBlendMode: 'normal',
      formBgSize: 'cover',
      formBgOpacity: 100,
      status: 'active',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: 312,
      isFeatured: false,
      vertical: 'all',
      previewDescription: 'Frictionless 2-field update list card.'
    },
    {
      id: 'template-tech-support',
      name: 'IT Helpdesk Ticket System (Coming Soon)',
      description: 'Robust technical support ticket intake specifying severity criteria levels.',
      category: 'technology',
      tags: ['leads', 'it-support'],
      thumbnailUrl: '',
      formSchema: [],
      formBg: '',
      formLogoUrl: '',
      formLogoPosition: 'top-left',
      formBgBlendMode: 'normal',
      formBgSize: 'cover',
      formBgOpacity: 100,
      status: 'coming_soon',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: 0,
      isFeatured: false,
      vertical: 'technology',
      previewDescription: 'IT assistance triage template.'
    }
  ];

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await authFetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          const items = data.templates || data;
          if (Array.isArray(items) && items.length > 0) {
            setTemplates(items);
          } else {
            setTemplates(fallbackTemplates);
          }
        } else {
          setTemplates(fallbackTemplates);
        }
      } catch (err) {
        console.error('Failed fetching templates library:', err);
        setTemplates(fallbackTemplates);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Pre-fill program selector with first program
  useEffect(() => {
    if (programs && programs.length > 0) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs]);

  const handleApply = async (template: FormTemplate) => {
    if (template.status === 'coming_soon') return;
    setStatusMessage(null);

    // 1. Check bounds
    if (!programs || programs.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please create a program first before applying a template.' });
      return;
    }

    setInteractiveLoading(true);

    try {
      if (programs.length === 1) {
        await onApplyTemplate(template, programs[0].id);
      } else {
        // If multiple programs and picker is already open on this template, proceed
        if (applyingTemplateId === template.id) {
          if (!selectedProgramId) {
            setStatusMessage({ type: 'error', text: 'Please select a program to apply the template to.' });
            setInteractiveLoading(false);
            return;
          }
          await onApplyTemplate(template, selectedProgramId);
        } else {
          // Open program selection UI
          setApplyingTemplateId(template.id);
          setInteractiveLoading(false);
          return;
        }
      }

      // Record count on successful apply
      try {
        await authFetch(`/api/templates/${template.id}/use`, {
          method: 'POST',
        });
      } catch (e) {
        console.warn('Unable to log template usage statistics:', e);
      }

      setStatusMessage({ type: 'success', text: `Template "${template.name}" applied successfully!` });
      setApplyingTemplateId(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error applying form template' });
    } finally {
      setInteractiveLoading(false);
    }
  };

  // Filtering Logic
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      template.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim() ||
      template.vertical?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="templates-library-widget">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-400" />
            Interactive Layouts Library
          </h3>
          <p className="text-xs text-neutral-400">Instantly deploy customized medical, legal, and operational lead capturing form models.</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-bold leading-normal ${statusMessage.type === 'success' ? 'bg-emerald-505 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusMessage.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2" id="library-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search templates by name, keyword, features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-xs font-semibold text-white placeholder-neutral-550 transition-colors"
          />
        </div>

        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 focus:border-indigo-500 outline-none text-xs font-bold text-white cursor-pointer appearance-none"
          >
            <option value="all">All Industries</option>
            <option value="general">General</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="legal">Legal & Advisory</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider">Retrieving pre-built blueprints...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-20 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-400">
          <p className="text-xs font-bold leading-normal">No templates matches your searching qualifiers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="templates-grid">
          {filteredTemplates.map((template) => {
            const isComingSoon = template.status === 'coming_soon';
            const isApplyingThis = applyingTemplateId === template.id;

            return (
              <div
                key={template.id}
                className={`flex flex-col justify-between p-5 rounded-3xl border transition-all relative ${
                  isComingSoon
                    ? 'border-neutral-850 bg-neutral-950/40 opacity-60'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70'
                }`}
                id={`template-card-${template.id}`}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] uppercase font-black tracking-widest rounded-full bg-neutral-800 text-neutral-350">
                      {template.category}
                    </span>
                    
                    <div className="flex gap-1">
                      {template.isFeatured && (
                        <span className="p-1 rounded-lg bg-yellow-500/10 text-yellow-500" title="Featured Blueprint">
                          <Star className="w-3.5 h-3.5 fill-yellow-500/20" />
                        </span>
                      )}
                      {isComingSoon && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase font-bold rounded-lg bg-neutral-800 text-neutral-500">
                          <Clock className="w-3 h-3" />
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-base tracking-tight leading-snug">{template.name}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed font-semibold">{template.description}</p>
                  </div>

                  {template.formSchema && template.formSchema.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-850 text-[10px] text-neutral-400 leading-relaxed space-y-1">
                      <p className="font-bold text-neutral-300">Layout Structure ({template.formSchema.length} fields):</p>
                      <p className="truncate">{template.formSchema.map((f) => f.label).join(' → ')}</p>
                    </div>
                  )}
                </div>

                {/* Applying Option Selector when multiple options exist */}
                {isApplyingThis && programs && programs.length > 1 && (
                  <div className="mt-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Choose Target Program:</label>
                    <select
                      value={selectedProgramId}
                      onChange={(e) => setSelectedProgramId(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-bold text-white focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-5">
                  <button
                    onClick={() => handleApply(template)}
                    disabled={isComingSoon || interactiveLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold leading-normal text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg ${
                      isComingSoon
                        ? 'bg-neutral-850 text-neutral-650 cursor-not-allowed border border-neutral-800'
                        : isApplyingThis && programs && programs.length > 1
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-605 shadow-emerald-600/10'
                        : 'bg-indigo-605 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white shadow-indigo-605 shadow-indigo-600/10'
                    }`}
                  >
                    {interactiveLoading && isApplyingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isComingSoon ? (
                      'Unavailable'
                    ) : isApplyingThis && programs && programs.length > 1 ? (
                      'Confirm Apply Template'
                    ) : (
                      'Use Template'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
