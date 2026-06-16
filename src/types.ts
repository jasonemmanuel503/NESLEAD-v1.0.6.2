export type Role = 'OWNER' | 'ADMIN' | 'ADVISOR' | 'AGENT' | 'MANAGER' | 'VIEWER';

export interface ThemeToken {
  bg_primary: string;
  bg_secondary: string;
  bg_card: string;
  border: string;
  text_primary: string;
  text_secondary: string;
  accent: string;
  accent_hover: string;
  accent_gradient: string;
  accent_shadow: string;
  badge_bg: string;
  badge_text: string;
  nav_active_bg: string;
  nav_active_text: string;
  success: string;
  warning: string;
  danger: string;
  launcher_gradient: string;
}

export type ThemeId = 'slate_coral' | 'midnight' | 'aurora' | 'forest' | 'carbon' | 'sunset' | 'ocean' | 'neon_cosmos' | 'coral_spark';

export type WidgetSkin = 'solid' | 'glass' | 'dark' | 'soft' | 'minimal';

export interface AppTheme {
  id: ThemeId;
  label: string;
  mode: 'light' | 'dark' | 'gradient';
  tokens: ThemeToken;
}

export interface VisitorGeo {
  country: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  language: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge';
  os: 'Windows' | 'macOS' | 'Android' | 'iOS' | 'Linux';
  referrer: string;
  page_visited: string;
  time_on_page_before_chat: number;
  ip_address: string;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  programInterest: string;
  status: 'HOT' | 'WARM' | 'COLD' | 'CONTACTED' | 'CONVERTED';
  score: number;
  source: string;
  createdAt: string;
  lastContactedAt: string;
  geo?: VisitorGeo;
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'AGENT';
  content: string;
  confidence?: number; // 0-100
  citationSource?: string;
  createdAt: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface Conversation {
  id: string;
  leadId?: string;
  sessionId: string;
  status: 'ACTIVE' | 'CLOSED' | 'ESCALATED' | 'RESOLVED';
  startedAt: string;
  endedAt?: string;
  messages: Message[];
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent';
  unreadCount?: number;
}

export type FormFieldType =
  | 'short_text'
  | 'long_text'
  | 'dropdown'
  | 'multi_checkbox'
  | 'radio'
  | 'date'
  | 'phone'
  | 'email'
  | 'number'
  | 'file_upload'
  | 'scale'
  | 'price_display'
  | 'section_header'
  | 'page_break'
  | 'divider'
  | 'cta_button'
  | 'password'
  | 'two_column_row'
  | 'three_column_row'
  | 'single_column_row'
  | 'vertical_divider'
  | 'form_title'
  | 'rich_text'
  | 'form_design_block'
  | 'image_canvas'
  | 'time_picker'
  | 'date_range'
  | 'address_autocomplete'
  | 'color_picker'
  | 'signature_pad'
  | 'otp_input'
  | 'hidden_field'
  | 'calculation_field'
  | 'matrix_grid'
  | 'ranking_field'
  | 'nps_score'
  | 'country_selector'
  | 'terms_checkbox'
  | 'accordion_section'
  | 'tab_container'
  | 'repeating_section'
  | 'progress_bar'
  | 'header_image_banner'
  | 'video_embed'
  | 'shape_framed_image'
  | 'logo_mark';

export interface ConditionalRule {
  fieldId: string;       // ID of the field whose value controls this rule
  operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty';
  value: string;
  action: 'show' | 'hide' | 'require';
}

export interface FormField {
  id: string;           // unique ID like `field-${Date.now()}-${Math.random().toString(36).slice(2)}`
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];   // for dropdown, multi_checkbox, radio
  helpText?: string;    // small description below the field
  defaultValue?: string;
  maxLength?: number;   // for short_text and long_text
  acceptedFileTypes?: string; // for file_upload, e.g. '.pdf,.jpg'
  maxFileSizeMB?: number;     // for file_upload
  scaleMin?: number;          // for scale
  scaleMax?: number;          // for scale
  conditions?: ConditionalRule[]; // conditional logic rules
  scaleStyle?: 'numbers' | 'stars' | 'emoji';
  priceMode?: 'static' | 'slider' | 'manual';
  priceCurrency?: string;
  priceSliderMin?: number;
  priceSliderMax?: number;
  ctaUrl?: string;
  ctaBgMode?: 'solid' | 'linear' | 'radial' | 'conic';
  ctaBgColor?: string;
  ctaBgGradient?: string;
  ctaLabel?: string;           // button display text
  ctaGradientAngle?: number;   // 0–360 for linear gradient
  ctaHoverBgMode?: 'solid' | 'linear' | 'radial' | 'conic';
  ctaHoverBgColor?: string;
  ctaHoverBgGradient?: string;
  ctaHoverGradientAngle?: number;
  ctaTransitionDuration?: number; // ms, e.g. 300
  ctaTarget?: '_blank' | '_new' | '_self'; // link behavior
  columnFields?: FormField[][];
  columnIds?: string[];   // stable UUID per column slot, parallel to columnFields
  columnHeights?: number[];        // explicit px height per column slot, undefined = auto
  columnWidths?: string[];         // CSS width per column, e.g. '50%', '200px', undefined = equal
  columnAlignments?: ('start' | 'center' | 'end' | 'stretch')[];  // align-items per column
  optionLayout?: 'vertical' | 'horizontal';
  titleFontSize?: number;
  titleFontWeight?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleColor?: string;
  borderRadius?: number;
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
  borderWidth?: number;
  borderColor?: string;
  fieldBgColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textColor?: string;
  textFontSize?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  fontFamilyAll?: string;
  fontFamilyTitle?: string;
  fontFamilyBody?: string;
  fontFamilyButton?: string;
  ctaBorderRadius?: number;
  ctaIcon?: string;
  ctaIsSocialGroup?: boolean;
  ctaSocialLinks?: Array<{
    platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok' | 'whatsapp' | 'pinterest';
    url: string;
    color: string;
  }>;
  ctaSocialLayout?: 'horizontal' | 'vertical';
  ctaSocialSize?: number;

  // Nested arrow element in CTA button
  ctaArrowEnabled?: boolean;
  ctaArrowBgColor?: string;
  ctaArrowBgMode?: 'solid' | 'linear';
  ctaArrowBgGradient?: string;
  ctaArrowBorderRadius?: number; // 0–50 (50 = full circle)
  ctaArrowBorderColor?: string;
  ctaArrowBorderWidth?: number;
  ctaArrowSize?: number; // icon size in px, 12–32
  ctaArrowColor?: string; // arrow icon color

  // Absolute positioning (opt-in per field)
  positionMode?: 'flow' | 'absolute'; // default: 'flow'
  positionX?: number;   // px from left edge of form
  positionY?: number;   // px from top edge of form
  positionWidth?: string; // CSS width, e.g. '100%', '200px', 'auto'
  opacity?: number;     // 0-100, default 100
  zIndex?: number;      // stacking order among absolutely-positioned fields, default 0
  // Responsive alignment presets (applied when positionMode === 'absolute')
  positionPreset?: 'none' | 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  // Form Design Block specific background overlay parameters
  bgMode?: 'solid' | 'gradient' | 'image';
  bgSolidColor?: string;
  bgGradientColor1?: string;
  bgGradientColor2?: string;
  bgGradientAngle?: number;
  bgImageUrl?: string;
  bgSolidOpacity?: number;
  bgGradientOpacity?: number;
  bgImageOverlayColor?: string;
  bgImageOverlayOpacity?: number;

  // image_canvas fields
  imageCanvasUrl?: string;         // uploaded or pasted image URL
  imageCanvasHeight?: number;      // height in px, default 200, min 80, max 800
  imageCanvasAlign?: 'left' | 'center' | 'right'; // horizontal alignment
  imageCanvasObjectFit?: 'cover' | 'contain' | 'fill'; // CSS object-fit
  imageCanvasBorderRadius?: number; // 0–100px
  imageCanvasBorderColor?: string;
  imageCanvasBorderWidth?: number;  // 0–10px
  imageCanvasBorderGradient?: string; // CSS gradient string for border
  imageCanvasAlt?: string;
  imageCanvasShapeMask?: 'none' | 'circle' | 'pentagon' | 'hexagon' | 'diamond' | 'octagon';

  // Glassmorphism parameters
  bgGlassEnabled?: boolean;
  bgGlassBlur?: number;          // px, 0–40
  bgGlassBorderRadius?: number;  // 0–48
  bgGlassBorderColor?: string;
  bgGlassBorderWidth?: number;   // 0–8
  bgGlassColorStops?: Array<{ color: string; position: number; opacity: number }>; // up to 6 stops
  bgGlassAngle?: number;         // 0–360 for gradient direction

  // Divider lines controls (Horizontal and Vertical)
  dividerColor?: string;      // hex color, default undefined (uses var(--color-border))
  dividerThickness?: number;  // px, default 1, range 1–20
  dividerHeight?: number;     // px, for vertical divider explicit height control

  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // time_picker
  timeFormat?: '12h' | '24h';
  timeStep?: number; // minutes, e.g. 15, 30, 60

  // date_range
  dateRangeStartLabel?: string;
  dateRangeEndLabel?: string;
  dateRangeMinNights?: number;

  // address_autocomplete (Google Places API)
  addressCountryRestrict?: string; // ISO country code, optional restriction
  addressComponents?: ('street' | 'city' | 'state' | 'zip' | 'country')[]; // which sub-fields to capture

  // color_picker
  colorPickerDefault?: string; // hex default
  colorPickerPresets?: string[]; // array of hex preset swatches

  // signature_pad
  signaturePadHeight?: number; // px, default 150
  signaturePadBgColor?: string;
  signaturePadPenColor?: string;

  // otp_input
  otpLength?: number; // default 6
  otpNumericOnly?: boolean;

  // hidden_field
  hiddenFieldValue?: string; // static value, or a token like '{{utm_source}}' resolved at render time
  hiddenFieldSource?: 'static' | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'referrer';

  // calculation_field
  calculationExpression?: string; // e.g. "field-123 * field-456 + field-789"
  calculationDecimalPlaces?: number;
  calculationPrefix?: string; // e.g. '$'
  calculationSuffix?: string; // e.g. ' total'

  // matrix_grid
  matrixRows?: string[]; // row question labels
  matrixColumns?: string[]; // column scale labels
  matrixInputType?: 'radio' | 'checkbox';

  // ranking_field
  rankingOptions?: string[]; // initial order, user drags to reorder

  // nps_score
  npsLowLabel?: string; // default 'Not at all likely'
  npsHighLabel?: string; // default 'Extremely likely'

  // country_selector
  countrySelectorDefault?: string; // ISO country code

  // terms_checkbox
  termsText?: string; // e.g. 'I agree to the'
  termsLinkLabel?: string; // e.g. 'Terms & Conditions'
  termsLinkUrl?: string;

  // accordion_section / tab_container (layout containers — hold nested FormField arrays)
  accordionTitle?: string;
  accordionDefaultOpen?: boolean;
  accordionFields?: FormField[];
  tabLabels?: string[];
  tabContents?: FormField[][]; // parallel array to tabLabels

  // repeating_section
  repeatingFieldGroup?: FormField[]; // the template group repeated per entry
  repeatingMinEntries?: number;
  repeatingMaxEntries?: number;
  repeatingAddButtonLabel?: string; // default 'Add Another'

  // progress_bar
  progressBarStyle?: 'steps' | 'percentage' | 'bar';
  progressBarColor?: string;

  // header_image_banner
  bannerImageUrl?: string;
  bannerHeight?: number; // px
  bannerOverlayText?: string;
  bannerOverlayTextColor?: string;
  bannerOverlayPosition?: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  bannerOverlayBgColor?: string; // semi-transparent backdrop behind overlay text
  bannerObjectFit?: 'cover' | 'contain';

  // video_embed
  videoEmbedUrl?: string; // YouTube/Vimeo URL
  videoEmbedAspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  videoEmbedAutoplay?: boolean;

  // shape_framed_image
  shapeFrameType?: 'square' | 'rectangle' | 'circle' | 'pentagon' | 'hexagon' | 'diamond' | 'octagon';
  shapeFrameImageUrl?: string;
  shapeFrameSize?: number; // px, width/height of the frame container
  shapeFrameBorderColor?: string;
  shapeFrameBorderWidth?: number;

  // logo_mark
  logoMarkUrl?: string;
  logoMarkWidth?: number; // px
  logoMarkPosition?: 'top-left' | 'top-center' | 'top-right';
  logoMarkLinkUrl?: string; // optional click-through link

  // missing form builder panel specific keys for linter satisfaction
  rankingItems?: string[];
  npsMinLabel?: string;
  npsMaxLabel?: string;
  termsLinkText?: string;
  repeatingMaxRows?: number;
  repeatingMinRows?: number;
  bannerParallaxSpeed?: number;
  videoUrl?: string;
  videoAspectRatio?: string;
  imageFrameShape?: string;
  imageFrameSize?: number;
  imageFrameBorderWidth?: number;
  imageFrameBorderColor?: string;
  imageFrameUrl?: string;
  logoMarkSize?: number;
  logoMarkBorderRadius?: number;
  logoMarkColor?: string;
  logoMarkImageUrl?: string;
  logoMarkHeadline?: string;
  logoMarkSubline?: string;
}

export interface Program {
  id: string;
  name: string;
  department: string;
  duration: string;
  fees: string;
  capacityBadge: string;
  rating: number;
  description: string;
  formSchema: FormField[] | null;  // the drag-and-drop built form
  published: boolean;
  formBg?: string;
  formLogoUrl?: string;
  formLogoPosition?: 'top-left' | 'top-right' | 'top-center';
  formBgBlendMode?: string;
  formBgSize?: 'cover' | 'contain' | 'auto';
  formBgOpacity?: number; // 0–100
  canvas?: {
    width: number;
    height: number;
    unit: 'px' | 'cm' | 'in';
    preset: string;       // e.g. 'desktop_form', 'a4_portrait', 'custom', etc.
  };
  createdAt?: string;   // ISO 8601 timestamp — set once on creation
  updatedAt?: string;   // ISO 8601 timestamp — updated on every save
}

export type TemplateStatus = 'coming_soon' | 'active';

export type TemplateCategory =
  | 'general'
  | 'education'
  | 'healthcare'
  | 'real_estate'
  | 'consulting'
  | 'hr'
  | 'events'
  | 'e_commerce'
  | 'fitness'
  | 'legal'
  | 'finance'
  | 'hospitality';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory | string;
  tags: string[];
  thumbnailUrl: string;
  formSchema: FormField[];
  formBg: string;
  formLogoUrl: string;
  formLogoPosition: 'top-left' | 'top-right' | 'top-center';
  formBgBlendMode: string;
  formBgSize: 'cover' | 'contain' | 'auto';
  formBgOpacity: number;
  status: TemplateStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  useCount: number;
  isFeatured: boolean;
  vertical: string;
  previewDescription: string;
}

export interface KnowledgeDocument {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  chunkCount: number;
  uploadedAt: string;
}

export interface Appointment {
  id: string;
  leadName: string;
  program: string;
  date: string;
  time: string;
  timezone: string;
  type: 'VIDEO' | 'PHONE' | 'CAMPUS';
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

export interface WidgetConfig {
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  theme: ThemeId;
  language: 'en' | 'fr';
  leadCaptureEnabled: boolean;
  bookingEnabled: boolean;
  humanHandoffEnabled: boolean;
  confidenceDisplayEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  
  // Triggers
  timeTriggerEnabled: boolean;
  timeTriggerDelay: number; // seconds
  scrollTriggerEnabled: boolean;
  scrollTriggerPercent: number;
  exitIntentEnabled: boolean;
  idleTriggerEnabled: boolean;

  // Real-time custom branding launcher parameters
  position?: string;
  launcherEmoji?: string;
  pulseEnabled?: boolean;
  customAccent?: string;
  vertical?: string;
  launcherLogoUrl?: string;
  widgetSkin?: WidgetSkin;
  botTheme?: ThemeId;
}

export type ColorMode = 'solid' | 'gradient' | 'glass';
export type GradientType = 'linear' | 'radial' | 'conic';

export interface GradientStop {
  color: string;
  position: number;
}

export type GlassPreset = 'frosted' | 'dark_glass' | 'aurora_glass' | 'smoke' | 'crystal' | 'neon_glass';
