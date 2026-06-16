export const VERTICAL_LABELS: Record<string, string> = {
  'technology': 'Technology',
  'healthcare': 'Healthcare',
  'financial-services': 'Financial Services',
  'retail-ecommerce': 'Retail & E-commerce',
  'real-estate': 'Real Estate',
  'construction': 'Construction',
  'manufacturing': 'Manufacturing',
  'transportation-logistics': 'Transportation & Logistics',
  'education': 'Education',
  'energy-utilities': 'Energy & Utilities',
  'telecommunications': 'Telecommunications',
  'media-entertainment': 'Media & Entertainment',
  'hospitality-tourism': 'Hospitality & Tourism',
  'food-beverage': 'Food & Beverage',
  'agriculture': 'Agriculture',
  'automotive': 'Automotive',
  'professional-services': 'Professional Services',
  'legal-services': 'Legal Services',
  'marketing-advertising': 'Marketing & Advertising',
  'hr-staffing': 'Human Resources & Staffing',
  'government-public': 'Government & Public Sector',
  'nonprofit': 'Nonprofit & Social Services',
  'insurance': 'Insurance',
  'aerospace-defense': 'Aerospace & Defense',
  'biotech-life-sciences': 'Biotechnology & Life Sciences',
  'consumer-goods': 'Consumer Goods',
  'wholesale-distribution': 'Wholesale & Distribution',
  'mining-natural-resources': 'Mining & Natural Resources',
  'sports-recreation': 'Sports & Recreation',
  'fashion-apparel': 'Fashion & Apparel',
  'beauty-personal-care': 'Beauty & Personal Care',
  'home-improvement': 'Home Improvement & Home Services',
  'security-services': 'Security Services',
  'environmental-services': 'Environmental Services',
  'waste-management': 'Waste Management',
  'electronics-semiconductors': 'Electronics & Semiconductors',
  'chemicals': 'Chemicals',
  'maritime-shipping': 'Maritime & Shipping',
  'publishing': 'Publishing',
  'gaming-esports': 'Gaming & Esports',
  'immigration': 'Immigration Services'
};

export interface TermOverrides {
  service: string;
  servicePlural: string;
  dept: string;
}

export const VERTICAL_TERMS: Record<string, TermOverrides> = {
  'education': { service: 'Program', servicePlural: 'Programs', dept: 'Department' },
  'legal-services': { service: 'Practice Area', servicePlural: 'Practice Areas', dept: 'Law Division' },
  'healthcare': { service: 'Service', servicePlural: 'Services', dept: 'Specialty Department' },
  'real-estate': { service: 'Listing', servicePlural: 'Listings', dept: 'Property Category' },
  'immigration': { service: 'Visa Category', servicePlural: 'Visa Categories', dept: 'Country Focus' },
  'hr-staffing': { service: 'Role Placement', servicePlural: 'Role Placements', dept: 'Industry Practice' },
  'financial-services': { service: 'Advisory Solution', servicePlural: 'Advisory Solutions', dept: 'Wealth Department' },
  'retail-ecommerce': { service: 'Product Group', servicePlural: 'Product Groups', dept: 'Store Collection' },
  'technology': { service: 'Feature Tier', servicePlural: 'Feature Tiers', dept: 'System Module' },
  'hospitality-tourism': { service: 'Booking Stream', servicePlural: 'Booking Streams', dept: 'Accommodation' },
  'professional-services': { service: 'Service Offered', servicePlural: 'Services Offered', dept: 'Operations' },
};

export function getTermOverrides(vertical: string | undefined): TermOverrides {
  if (!vertical) return { service: 'Service', servicePlural: 'Services', dept: 'Department' };
  return VERTICAL_TERMS[vertical] || { service: 'Service', servicePlural: 'Services', dept: 'Department' };
}

export const WORLD_COUNTRIES: string[] = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "India", "China", "Brazil",
  "Mexico", "Italy", "Spain", "Singapore", "Netherlands", "Switzerland", "Sweden", "Norway", "Denmark", "Finland",
  "New Zealand", "South Africa", "Ireland", "Belgium", "Austria", "United Arab Emirates", "Saudi Arabia", "South Korea",
  "Argentina", "Chile", "Colombia", "Peru", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines", "Turkey",
  "Egypt", "Nigeria", "Kenya", "Ghana", "Poland", "Greece", "Portugal", "Czech Republic", "Hungary", "Ukraine"
];


