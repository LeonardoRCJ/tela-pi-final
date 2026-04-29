import { PortalHost } from "@rn-primitives/portal";
import React, { createContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);

  const toggleTheme = () => setDark((prev) => !prev);

  const theme = dark
    ? {
        bg: "#0F0F0F",
        card: "#1A1A1A",
        text: "#FFF",
      }
    : {
        bg: "#F5F5F5",
        card: "#FFF",
        text: "#000",
      };

  return (
    <ThemeContext.Provider value={{ theme, dark, toggleTheme }}>
      {children}
      <PortalHost />
    </ThemeContext.Provider>
  );
}
