import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { TRANSLATIONS } from "../i18n/translations";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type ColorScheme = "dark" | "light";
export type Language = "pt-BR" | "en-US";

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  accentForeground: string;
  danger: string;
  success: string;
  warning: string;
  inputBg: string;
}

export interface ThemeContextData {
  // Esquema
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  isDark: boolean;
  colors: ThemeColors;

  // Idioma
  language: Language;
  toggleLanguage: () => void;
  t: Record<string, string>;

  // Acessibilidade
  largeFonts: boolean;
  toggleLargeFonts: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;

  // Helpers
  fs: (base: number) => number;
  tc: (defaultColor: string) => string;
}

// ─── PALETAS ──────────────────────────────────────────────────────────────────

const DARK: ThemeColors = {
  bg: "#0B0B0B",
  bgSecondary: "#121212",

  card: "#181818",
  cardBorder: "#303030",

  text: "#FFFFFF",
  textMuted: "#B3B3B3",

  accent: "#E0B84D",
  accentForeground: "#000000",

  danger: "#FF5C5C",
  success: "#38D27A",
  warning: "#FFD447",

  inputBg: "#222222",
};

const LIGHT: ThemeColors = {
  bg: "#FAFAFA",
  bgSecondary: "#F0F0F0",

  card: "#FFFFFF",
  cardBorder: "#D8D8D8",

  text: "#111111",
  textMuted: "#4F4F4F",

  accent: "#9E7B18",
  accentForeground: "#FFFFFF",

  danger: "#B3261E",
  success: "#1B7F3B",
  warning: "#9A6700",

  inputBg: "#ECECEC",
};

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────

const KEYS = {
  colorScheme: "@theme:colorScheme",
  language: "@theme:language",
  largeFonts: "@theme:largeFonts",
  highContrast: "@theme:highContrast",
} as const;

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextData>(
  {} as ThemeContextData,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const [language, setLanguage] = useState<Language>("pt-BR");
  const [largeFonts, setLargeFonts] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Carrega preferências salvas
  useEffect(() => {
    (async () => {
      const [cs, lang, lf, hc] = await Promise.all([
        AsyncStorage.getItem(KEYS.colorScheme),
        AsyncStorage.getItem(KEYS.language),
        AsyncStorage.getItem(KEYS.largeFonts),
        AsyncStorage.getItem(KEYS.highContrast),
      ]);
      if (cs === "dark" || cs === "light") setColorScheme(cs);
      if (lang === "pt-BR" || lang === "en-US") setLanguage(lang);
      if (lf === "true") setLargeFonts(true);
      if (hc === "true") setHighContrast(true);
    })();
  }, []);

  const toggleColorScheme = async () => {
    const next: ColorScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(next);
    await AsyncStorage.setItem(KEYS.colorScheme, next);
  };

  const toggleLanguage = async () => {
    const next: Language = language === "pt-BR" ? "en-US" : "pt-BR";
    setLanguage(next);
    await AsyncStorage.setItem(KEYS.language, next);
  };

  const toggleLargeFonts = async () => {
    const next = !largeFonts;
    setLargeFonts(next);
    await AsyncStorage.setItem(KEYS.largeFonts, String(next));
  };

  const toggleHighContrast = async () => {
    const next = !highContrast;
    setHighContrast(next);
    await AsyncStorage.setItem(KEYS.highContrast, String(next));
  };

  // Helper: tamanho de fonte acessível
  const fs = (base: number) => (largeFonts ? base + 4 : base);

  // Helper: cor com alto contraste
  const tc = (defaultColor: string) =>
    highContrast ? colors.text : defaultColor;

  const isDark = colorScheme === "dark";
  const colors = isDark ? DARK : LIGHT;
  const t = TRANSLATIONS[language];

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        toggleColorScheme,
        isDark,
        colors,
        language,
        toggleLanguage,
        t,
        largeFonts,
        toggleLargeFonts,
        highContrast,
        toggleHighContrast,
        fs,
        tc,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}