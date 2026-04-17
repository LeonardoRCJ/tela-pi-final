import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria o contexto
export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  // Estados de acessibilidade
  const [fonteMaior, setFonteMaior] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);

  // Carrega as preferências salvas ao abrir o app
  useEffect(() => {
    const loadSettings = async () => {
      const savedFonte = await AsyncStorage.getItem('@acessibilidade_fonte');
      const savedContraste = await AsyncStorage.getItem('@acessibilidade_contraste');
      if (savedFonte === 'true') setFonteMaior(true);
      if (savedContraste === 'true') setAltoContraste(true);
    };
    loadSettings();
  }, []);

  // Funções para alterar e salvar no aparelho
  const toggleFonteMaior = async () => {
    const newValue = !fonteMaior;
    setFonteMaior(newValue);
    await AsyncStorage.setItem('@acessibilidade_fonte', String(newValue));
  };

  const toggleAltoContraste = async () => {
    const newValue = !altoContraste;
    setAltoContraste(newValue);
    await AsyncStorage.setItem('@acessibilidade_contraste', String(newValue));
  };

  // Função utilitária que será usada nas telas para calcular o tamanho da fonte
  const getFontSize = (baseSize) => {
    return fonteMaior ? baseSize + 4 : baseSize; // Aumenta 4px se ativado
  };

  // Função utilitária para cores de texto secundário (cinza vs branco)
  const getTextColor = (defaultColor) => {
    return altoContraste ? '#FFFFFF' : defaultColor; // Força branco se alto contraste
  };

  return (
    <AccessibilityContext.Provider value={{ 
      fonteMaior, toggleFonteMaior, getFontSize, 
      altoContraste, toggleAltoContraste, getTextColor 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Hook personalizado para facilitar o uso nas telas
export const useAccessibility = () => useContext(AccessibilityContext);