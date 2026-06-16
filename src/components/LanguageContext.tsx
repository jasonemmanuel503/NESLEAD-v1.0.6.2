import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr' | 'es';

interface LanguageContextProps {
  translate: (key: string) => string;
  activeLanguage: Language;
  setIsLanguage: (lang: Language) => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    leads: 'Leads',
    conversations: 'Inbox',
    knowledgeBase: 'Knowledge Base',
    programs: 'Programs',
    appointments: 'Appointments',
    reports: 'Reports',
    widgetConfig: 'Widget Config',
    billing: 'Billing',
    upgradeNow: 'Upgrade Now',
    fullNameField: 'Full Name',
    save: 'Save Changes',
    collectLeadTitle: 'Connect with Us',
    collectLeadDesc: 'Leave your details to get started.',
    emailField: 'Email Address',
    phoneField: 'Phone Number',
    submitField: 'Submit',
    sending: 'Sending...',
    bookCallTitle: 'Schedule a Call',
    bookCallDesc: 'Choose a date and time for a session.',
    confirmBooking: 'Confirm Appointment',
    bookSuccessMessage: 'Appointment booked successfully!',
    StarterName: 'Starter Plan',
    GrowthName: 'Growth Plan',
    ProName: 'Enterprise',
    AgencyName: 'Agency',
    FreeTierName: 'Free Tier',
    landingSubtitle: 'Automate student onboarding & inquiry handling with AI.',
    getStartedButton: 'Get Started',
    tryDemoButton: 'Try Live Widget',
    problemTitle: 'The Recruitment Bottleneck',
    problemBefore: 'Traditional Methods',
    problemAfter: 'NesLead Powered',
  },
  fr: {
    dashboard: 'Tableau de bord',
    leads: 'Prospects',
    conversations: 'Messagerie',
    knowledgeBase: 'Base de connaissances',
    programs: 'Programmes',
    appointments: 'Rendez-vous',
    reports: 'Rapports',
    widgetConfig: 'Configuration',
    billing: 'Facturation',
    upgradeNow: 'Mettre à niveau',
    fullNameField: 'Nom complet',
    save: 'Enregistrer',
    collectLeadTitle: 'Contactez-nous',
    collectLeadDesc: 'Laissez vos coordonnées pour commencer.',
    emailField: 'Adresse e-mail',
    phoneField: 'Numéro de téléphone',
    submitField: 'Envoyer',
    sending: 'Envoi en cours...',
    bookCallTitle: 'Planifier un appel',
    bookCallDesc: 'Choisissez une date et heure.',
    confirmBooking: 'Confirmer le rendez-vous',
    bookSuccessMessage: 'Rendez-vous planifié avec succès !',
    StarterName: 'Passe Starter',
    GrowthName: 'Passe Croissance',
    ProName: 'Professionnel',
    AgencyName: 'Agence',
    FreeTierName: 'Accès Gratuit',
    landingSubtitle: 'Automatisez l’onboarding des étudiants avec l’IA.',
    getStartedButton: 'Commencer',
    tryDemoButton: 'Essayer le Widget',
    problemTitle: 'Le goulot d’étranglement du recrutement',
    problemBefore: 'Méthodes traditionnelles',
    problemAfter: 'Propulsé par NesLead',
  },
  es: {
    dashboard: 'Tablero',
    leads: 'Prospectos',
    conversations: 'Mensajes',
    knowledgeBase: 'Base de datos',
    programs: 'Programas',
    appointments: 'Citas',
    reports: 'Reportes',
    widgetConfig: 'Configuración',
    billing: 'Facturación',
    upgradeNow: 'Actualizar',
    fullNameField: 'Nombre completo',
    save: 'Guardar',
    collectLeadTitle: 'Contactar',
    collectLeadDesc: 'Deja tus datos para empezar.',
    emailField: 'Correo electrónico',
    phoneField: 'Teléfono',
    submitField: 'Enviar',
    sending: 'Enviando...',
    bookCallTitle: 'Programar llamada',
    bookCallDesc: 'Elige fecha y hora.',
    confirmBooking: 'Confirmar cita',
    bookSuccessMessage: '¡Cita programada con éxito!',
    StarterName: 'Plan Starter',
    GrowthName: 'Plan Growth',
    ProName: 'Plan Pro',
    AgencyName: 'Plan Agency',
    FreeTierName: 'Nivel Gratuito',
    landingSubtitle: 'Automatice la incorporación de estudiantes con IA.',
    getStartedButton: 'Comenzar',
    tryDemoButton: 'Probar Widget',
    problemTitle: 'El cuello de botella',
    problemBefore: 'Métodos tradicionales',
    problemAfter: 'Impulsado por NesLead',
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeLanguage, setIsLanguage] = useState<Language>('en');

  const translate = (key: string): string => {
    return translations[activeLanguage]?.[key] ?? translations['en']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ translate, activeLanguage, setIsLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
