import React, { createContext, useContext } from "react";
import type { ResolvedTheme, ResolvedBrand } from "./types";

interface ThemeContextValue {
  colors: ResolvedTheme["colors"];
  fonts: ResolvedTheme["fonts"];
  gradients: ResolvedTheme["gradients"];
  brand: ResolvedBrand;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{
  theme: ResolvedTheme;
  brand: ResolvedBrand;
  children: React.ReactNode;
}> = ({ theme, brand, children }) => {
  const value: ThemeContextValue = {
    colors: theme.colors,
    fonts: theme.fonts,
    gradients: theme.gradients,
    brand,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
