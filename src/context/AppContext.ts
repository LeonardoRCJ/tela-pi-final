/**
 * AppContext — agora é apenas um re-export de ThemeContext.
 *
 * Mantido para não quebrar imports antigos enquanto você migra as telas.
 * A médio prazo, substitua todos os `useContext(AppContext)` por `useTheme()`.
 */

export { ThemeContext as AppContext, ThemeProvider as AppProvider, useTheme as useApp } from "./ThemeContext";