import { createContext, useContext, useState } from 'react';
import enDict from './en.json';
import esDict from './es.json';

const LanguageContext = createContext();

export function LanguageProvider({
  children,
  initialLang = undefined,
  initialDictionaries = { en: enDict, es: esDict },
}) {
  const [lang, setLangState] = useState(() => {
    if (initialLang !== undefined) {
      return initialLang;
    }
    try {
      return window.localStorage.getItem('mb-lang') || 'en';
    } catch {
      // localStorage may throw SecurityError if blocked by browser/sandbox/privacy settings
      return 'en';
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      window.localStorage.setItem('mb-lang', newLang);
    } catch {
      // storage blocked, in-memory state above still updates
    }
  };

  const t = (key) => {
    const dict = initialDictionaries[lang];
    const segments = key.split('.');

    let value = dict;
    for (const segment of segments) {
      if (value && typeof value === 'object' && segment in value) {
        value = value[segment];
      } else {
        return key;
      }
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
