import { createContext, useContext, useState, ReactNode } from 'react';

export interface AppTheme {
  kawaii: boolean;
  // Core palette
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primarySoft: string;
  // Surfaces
  bg: string;
  surface: string;
  surfaceHover: string;
  surfaceAlt: string;
  // Borders
  border: string;
  borderStrong: string;
  // Text
  text: string;
  textMuted: string;
  textSubtle: string;
  // Shape
  radiusPill: number;
  radiusCard: number;
  radiusMd: number;
  radiusSm: number;
  // Nav
  navBg: string;
  navBorder: string;
  // Shadows
  shadow: string;
  shadowMd: string;
  shadowLg: string;
  // Font weight adjustments
  headingWeight: number;
  labelWeight: number;
}

export const kawaiiTheme: AppTheme = {
  kawaii: true,
  primary: '#E91E8C',
  primaryHover: '#C2185B',
  primaryLight: '#FCE4EC',
  primarySoft: '#FFF0F5',
  bg: '#FFF0F5',
  surface: '#ffffff',
  surfaceHover: '#FFF5F9',
  surfaceAlt: '#FFF8FC',
  border: '#FCE4EC',
  borderStrong: '#F48FB1',
  text: '#3D1A2E',
  textMuted: '#7B3F6E',
  textSubtle: '#AD6590',
  radiusPill: 50,
  radiusCard: 20,
  radiusMd: 14,
  radiusSm: 8,
  navBg: 'rgba(255,240,245,0.92)',
  navBorder: '#F48FB1',
  shadow: '0 2px 12px rgba(233,30,140,0.10)',
  shadowMd: '0 4px 20px rgba(233,30,140,0.18)',
  shadowLg: '0 8px 40px rgba(233,30,140,0.22)',
  headingWeight: 900,
  labelWeight: 800,
};

export const normalTheme: AppTheme = {
  kawaii: false,
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryLight: '#e0e7ff',
  primarySoft: '#f5f3ff',
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHover: '#f8fafc',
  surfaceAlt: '#f1f5f9',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#94a3b8',
  radiusPill: 8,
  radiusCard: 12,
  radiusMd: 8,
  radiusSm: 6,
  navBg: 'rgba(255,255,255,0.95)',
  navBorder: '#e2e8f0',
  shadow: '0 1px 4px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.10)',
  headingWeight: 700,
  labelWeight: 600,
};

interface ThemeCtx {
  theme: AppTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: kawaiiTheme, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [kawaii, setKawaii] = useState(true);
  const theme = kawaii ? kawaiiTheme : normalTheme;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setKawaii(k => !k) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
