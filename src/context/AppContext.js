import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [idioma, setIdioma] = useState('pt-BR');

  // NOVOS ESTADOS DE ACESSIBILIDADE
  const [fonteMaior, setFonteMaior] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);

  // Carrega as preferências salvas ao abrir o app
  useEffect(() => {
    const carregarConfigs = async () => {
      const temaSalvo = await AsyncStorage.getItem('@tema');
      const idiomaSalvo = await AsyncStorage.getItem('@idioma');
      const savedFonte = await AsyncStorage.getItem('@acessibilidade_fonte');
      const savedContraste = await AsyncStorage.getItem('@acessibilidade_contraste');

      if (temaSalvo !== null) setIsDarkTheme(JSON.parse(temaSalvo));
      if (idiomaSalvo) setIdioma(idiomaSalvo);
      
      // Carrega acessibilidade
      if (savedFonte === 'true') setFonteMaior(true);
      if (savedContraste === 'true') setAltoContraste(true);
    };
    carregarConfigs();
  }, []);

  // Funções para alterar e salvar as preferências de Tema e Idioma
  const toggleTheme = async (value) => {
    setIsDarkTheme(value);
    await AsyncStorage.setItem('@tema', JSON.stringify(value));
  };

  const mudarIdioma = async () => {
    const novoIdioma = idioma === 'pt-BR' ? 'en-US' : 'pt-BR';
    setIdioma(novoIdioma);
    await AsyncStorage.setItem('@idioma', novoIdioma);
  };

  // --- NOVAS FUNÇÕES DE ACESSIBILIDADE ---

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

  // Função para calcular tamanho da fonte dinamicamente
  const getFontSize = (baseSize) => {
    return fonteMaior ? baseSize + 4 : baseSize;
  };

  // Função para definir cor baseada no contraste
  const getTextColor = (defaultColor) => {
    return altoContraste ? '#FFFFFF' : defaultColor;
  };

  return (
    <AppContext.Provider value={{ 
      isDarkTheme, 
      toggleTheme, 
      idioma, 
      mudarIdioma,
      fonteMaior, 
      toggleFonteMaior, 
      getFontSize,
      altoContraste, 
      toggleAltoContraste, 
      getTextColor
    }}>
      {children}
    </AppContext.Provider>
  );
};