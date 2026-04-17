import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('pt');

  const toggleLang = () => {
    setLang(prev => (prev === 'pt' ? 'en' : 'pt'));
  };

  const texts = {
    pt: {
      login: "Entrar",
      logout: "Sair da Conta",
      theme: "Tema",
      language: "Idioma",
    },
    en: {
      login: "Login",
      logout: "Logout",
      theme: "Theme",
      language: "Language",
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: texts[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}