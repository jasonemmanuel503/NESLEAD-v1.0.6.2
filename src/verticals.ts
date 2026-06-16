import { VERTICAL_LABELS } from './lib/industryPersona';

export type IndustryVertical = string;

export interface VerticalItem {
  id: string;
  label: string;
}

export interface VerticalQuestion {
  id: string;
  type: 'text' | 'tel' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

export interface VerticalTemplate {
  id: string;
  label: string;
  serviceLabel: string;
  leadFormQuestions?: VerticalQuestion[];
}

export const VERTICALS: VerticalItem[] = Object.entries(VERTICAL_LABELS).map(([id, label]) => ({
  id,
  label
}));

export const VERTICAL_TEMPLATES: Record<string, VerticalTemplate> = {
  'technology': {
    id: 'technology',
    label: 'Technology',
    serviceLabel: 'SaaS & IT Support Helpdesk',
    leadFormQuestions: [
      { id: 'tech-needs', type: 'select', label: 'Service Needed', required: true, options: ['Software Development', 'IT Consulting', 'Cloud Migration', 'Security Audit'] },
      { id: 'tech-timeline', type: 'select', label: 'Timeline', required: true, options: ['Immediate', '1-3 Months', '3-6 Months', 'Flexible'] },
      { id: 'tech-phone', type: 'tel', label: 'Best Contact Number', required: true }
    ]
  },
  'healthcare': {
    id: 'healthcare',
    label: 'Healthcare',
    serviceLabel: 'Clinic Intake & Booking Desk',
    leadFormQuestions: [
      { id: 'med-reason', type: 'select', label: 'Appointment Reason', required: true, options: ['General Checkup', 'Specialist Consult', 'Follow-up appointment', 'Emergency triage'] },
      { id: 'med-ins', type: 'select', label: 'Do you have Insurance?', required: true, options: ['Yes', 'No', 'Prefer not to say'] },
      { id: 'med-phone', type: 'tel', label: 'Emergency Contact Phone', required: true }
    ]
  },
  'financial-services': {
    id: 'financial-services',
    label: 'Financial Services',
    serviceLabel: 'Advisory intake & Booking',
    leadFormQuestions: [
      { id: 'fin-type', type: 'select', label: 'Area of Interest', required: true, options: ['Financial Planning', 'Tax Structuring', 'Wealth Portfolio Mgmt', 'Mortgage Solutions'] },
      { id: 'fin-val', type: 'select', label: 'Estimated Assets', required: true, options: ['$0 - $50k', '$50k - $250k', '$250k+', 'Prefer not to say'] },
      { id: 'fin-phone', type: 'tel', label: 'Phone Number', required: true }
    ]
  },
  'retail-ecommerce': {
    id: 'retail-ecommerce',
    label: 'Retail & E-commerce',
    serviceLabel: 'Order Status & Return Support',
    leadFormQuestions: [
      { id: 'ret-reason', type: 'select', label: 'Query Category', required: true, options: ['Order Status', 'Exchange/Return Support', 'Bulk Order Inquiry', 'Product Stock Question'] },
      { id: 'ret-phone', type: 'tel', label: 'Contact Phone Number', required: true }
    ]
  },
  'real-estate': {
    id: 'real-estate',
    label: 'Real Estate',
    serviceLabel: 'Buying, Selling, or Leasing Advice',
    leadFormQuestions: [
      { id: 're-type', type: 'select', label: 'Are you buying or selling?', required: true, options: ['Buying a Home', 'Selling a Property', 'Leasing/Renting', 'Commercial Advisory'] },
      { id: 're-phone', type: 'tel', label: 'Best Contact Number', required: true }
    ]
  },
  'education': {
    id: 'education',
    label: 'Education',
    serviceLabel: 'Enrolment Advisory Panel',
    leadFormQuestions: [
      { id: 'edu-program', type: 'select', label: 'Program Interest', required: true, options: ['Undergraduate Degrees', 'Postgraduate Diplomas', 'Professional Certifications', 'Short Courses'] },
      { id: 'edu-phone', type: 'tel', label: 'Contact Phone', required: true }
    ]
  },
  'legal-services': {
    id: 'legal-services',
    label: 'Legal Services',
    serviceLabel: 'Strictly Confidential Case Evaluation',
    leadFormQuestions: [
      { id: 'leg-area', type: 'select', label: 'Practice Area', required: true, options: ['Corporate Legal Counsel', 'Family Litigation', 'Property & Estate Conveyancing', 'Personal Injury'] },
      { id: 'leg-phone', type: 'tel', label: 'Direct Phone Line', required: true }
    ]
  },
  'hr-staffing': {
    id: 'hr-staffing',
    label: 'Human Resources & Staffing',
    serviceLabel: 'Talent Acquisition Registry',
    leadFormQuestions: [
      { id: 'hr-role', type: 'select', label: 'Hiring Needs', required: true, options: ['Temporary contractors', 'Full-time permanent roles', 'Executive executive searches', 'General consultation'] },
      { id: 'hr-phone', type: 'tel', label: 'Immediate Phone Contact', required: true }
    ]
  },
  'professional-services': {
    id: 'professional-services',
    label: 'Professional Services',
    serviceLabel: 'Client Discovery Desk',
    leadFormQuestions: [
      { id: 'prof-need', type: 'select', label: 'Primary Need', required: true, options: ['Strategic Consulting', 'Brand Identity Design', 'Process Automation', 'General Discovery'] },
      { id: 'prof-phone', type: 'tel', label: 'Primary Phone', required: true }
    ]
  }
};
