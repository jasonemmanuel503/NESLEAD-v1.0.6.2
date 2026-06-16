import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  label: string;
  symbol: string;
  rate: number;
}

export const countryToCurrencyMap: Record<string, { name: string, currency: string, symbol: string }> = {
  US: { name: 'United States', currency: 'USD', symbol: '$' },
  CA: { name: 'Canada', currency: 'CAD', symbol: 'CA$' },
  GB: { name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  CM: { name: 'Cameroon', currency: 'XAF', symbol: 'FCFA' },
  NG: { name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  ZA: { name: 'South Africa', currency: 'ZAR', symbol: 'R' },
  IN: { name: 'India', currency: 'INR', symbol: '₹' },
  FR: { name: 'France', currency: 'EUR', symbol: '€' },
  DE: { name: 'Germany', currency: 'EUR', symbol: '€' },
  ES: { name: 'Spain', currency: 'EUR', symbol: '€' },
  IT: { name: 'Italy', currency: 'EUR', symbol: '€' },
  NL: { name: 'Netherlands', currency: 'EUR', symbol: '€' },
  BE: { name: 'Belgium', currency: 'EUR', symbol: '€' },
  AT: { name: 'Austria', currency: 'EUR', symbol: '€' },
  PT: { name: 'Portugal', currency: 'EUR', symbol: '€' },
  IE: { name: 'Ireland', currency: 'EUR', symbol: '€' },
  FI: { name: 'Finland', currency: 'EUR', symbol: '€' },
  GR: { name: 'Greece', currency: 'EUR', symbol: '€' },
  AU: { name: 'Australia', currency: 'AUD', symbol: 'A$' },
  NZ: { name: 'New Zealand', currency: 'NZD', symbol: 'NZ$' },
  JP: { name: 'Japan', currency: 'JPY', symbol: '¥' },
  CN: { name: 'China', currency: 'CNY', symbol: '¥' },
  BR: { name: 'Brazil', currency: 'BRL', symbol: 'R$' },
  MX: { name: 'Mexico', currency: 'MXN', symbol: '$' },
  SN: { name: 'Senegal', currency: 'XOF', symbol: 'FCFA' },
  CI: { name: 'Ivory Coast', currency: 'XOF', symbol: 'FCFA' },
  GA: { name: 'Gabon', currency: 'XAF', symbol: 'FCFA' },
  CG: { name: 'Congo', currency: 'XAF', symbol: 'FCFA' },
  GQ: { name: 'Equatorial Guinea', currency: 'XAF', symbol: 'FCFA' },
  TD: { name: 'Chad', currency: 'XAF', symbol: 'FCFA' },
  CF: { name: 'Central African Republic', currency: 'XAF', symbol: 'FCFA' },
  GH: { name: 'Ghana', currency: 'GHS', symbol: 'GH₵' },
  KE: { name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  UG: { name: 'Uganda', currency: 'UGX', symbol: 'USh' },
  TZ: { name: 'Tanzania', currency: 'TZS', symbol: 'TSh' },
  RW: { name: 'Rwanda', currency: 'RWF', symbol: 'RF' }
};

interface CurrencyContextProps {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
  isLoading: boolean;
  error: string | null;
  userPreference: string | null;
  lastUpdated: number;
  availableCurrencies: Currency[];
  changeCurrencyOverride: (code: string) => void;
  resetToAutoDetect: () => void;
  convertAndFormat: (amount: number) => string;
  convertPrice: (amount: number) => number;
  // Deprecated compatibility variables (from old implementation)
  currency: string;
  detectedCountry: string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Geolocation states
  const [countryCode, setCountryCode] = useState<string>('US');
  const [countryName, setCountryName] = useState<string>('United States');
  const [currencyCode, setCurrencyCode] = useState<string>('USD');

  // Rates states initialized with robust fallbacks to prevent flash
  const [rates, setRates] = useState<Record<string, number>>({
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    CAD: 1.36,
    AUD: 1.51,
    NGN: 1500.0,
    XAF: 605.0,
    XOF: 605.0,
    ZAR: 18.5,
    INR: 83.4
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // User preference overridden from local storage
  const [userPreference, setUserPreference] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('neslead_user_currency');
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;

    const performInternationalizationResolution = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Step 1: Detect User Country (Priority 1: Cloudflare/Server, Priority 2: IPInfo, Priority 3: Browser Locale)
        let resolvedCountryCode = 'US';
        let resolvedCountryName = 'United States';
        let resolvedCurrencyCode = 'USD';

        try {
          const geoRes = await fetch('/api/geolocation');
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData && geoData.success) {
              resolvedCountryCode = geoData.countryCode || 'US';
              resolvedCountryName = geoData.country || 'United States';
              resolvedCurrencyCode = geoData.currency || 'USD';
            }
          }
        } catch (geoErr) {
          console.warn('[Currency Service] Server Geolocation failed, attempting dynamic browser locale fallback', geoErr);
          
          // Browser locale fallback
          if (typeof navigator !== 'undefined') {
            const locale = navigator.language || 'en-US';
            const browserCountry = locale.split('-')[1]?.toUpperCase();
            if (browserCountry && countryToCurrencyMap[browserCountry]) {
              const details = countryToCurrencyMap[browserCountry];
              resolvedCountryCode = browserCountry;
              resolvedCountryName = details.name;
              resolvedCurrencyCode = details.currency;
            }
          }
        }

        if (!isMounted) return;

        setCountryCode(resolvedCountryCode);
        setCountryName(resolvedCountryName);

        // Apply user override if it has been customized
        const activeCurrencyCode = userPreference || resolvedCurrencyCode;
        setCurrencyCode(activeCurrencyCode);

        // Step 2: Fetch Secure Cached Live Exchange Rates
        try {
          const ratesRes = await fetch('/api/payment/exchange-rate');
          if (ratesRes.ok) {
            const ratesData = await ratesRes.json();
            if (ratesData && ratesData.success && ratesData.rates) {
              setRates(ratesData.rates);
              setLastUpdated(ratesData.timestamp || Date.now());
            }
          } else {
            console.warn('[Currency Service] Rates endpoint returned failure code, relying on local stable estimates');
          }
        } catch (ratesErr) {
          console.error('[Currency Service] Error resolving exchange rates', ratesErr);
        }

      } catch (err: any) {
        setError(err.message || 'An error occurred establishing location and exchange rates.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performInternationalizationResolution();

    return () => {
      isMounted = false;
    };
  }, [userPreference]);

  // Set up available currencies structure
  const availableCurrencies: Currency[] = [
    { code: 'USD', label: 'USD ($)', symbol: '$', rate: rates['USD'] || 1.0 },
    { code: 'EUR', label: 'EUR (€)', symbol: '€', rate: rates['EUR'] || 0.92 },
    { code: 'GBP', label: 'GBP (£)', symbol: '£', rate: rates['GBP'] || 0.78 },
    { code: 'CAD', label: 'CAD (CA$)', symbol: 'CA$', rate: rates['CAD'] || 1.36 },
    { code: 'AUD', label: 'AUD (A$)', symbol: 'A$', rate: rates['AUD'] || 1.51 },
    { code: 'NGN', label: 'NGN (₦)', symbol: '₦', rate: rates['NGN'] || 1500.0 },
    { code: 'XAF', label: 'XAF (FCFA)', symbol: 'FCFA', rate: rates['XAF'] || 605.0 },
    { code: 'XOF', label: 'XOF (FCFA)', symbol: 'FCFA', rate: rates['XOF'] || 605.0 },
    { code: 'ZAR', label: 'ZAR (R)', symbol: 'R', rate: rates['ZAR'] || 18.5 },
    { code: 'INR', label: 'INR (₹)', symbol: '₹', rate: rates['INR'] || 83.4 }
  ];

  const activeCurrency = availableCurrencies.find(c => c.code === currencyCode) || { symbol: '$', rate: 1.0 };
  const currencySymbol = activeCurrency.symbol;
  const exchangeRate = activeCurrency.rate;

  // Conversion functions
  const convertPrice = (amount: number): number => {
    return amount * exchangeRate;
  };

  const convertAndFormat = (amount: number): string => {
    const converted = convertPrice(amount);

    // Custom formatters for West & Central African CFA franc (trailing FCFA)
    if (currencyCode === 'XAF' || currencyCode === 'XOF') {
      return `${Math.round(converted).toLocaleString('fr-FR')} FCFA`;
    }

    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
      });
      return formatter.format(converted);
    } catch (err) {
      // Direct fallback formatting
      return `${currencySymbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
  };

  const changeCurrencyOverride = (code: string) => {
    localStorage.setItem('neslead_user_currency', code);
    setUserPreference(code);
    setCurrencyCode(code);
  };

  const resetToAutoDetect = () => {
    localStorage.removeItem('neslead_user_currency');
    setUserPreference(null);
  };

  return (
    <CurrencyContext.Provider value={{
      countryCode,
      countryName,
      currencyCode,
      currencySymbol,
      exchangeRate,
      isLoading,
      error,
      userPreference,
      lastUpdated,
      availableCurrencies,
      changeCurrencyOverride,
      resetToAutoDetect,
      convertAndFormat,
      convertPrice,
      // Compatibility layers down to legacy consumers from original placeholder
      currency: currencyCode,
      detectedCountry: countryName
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
