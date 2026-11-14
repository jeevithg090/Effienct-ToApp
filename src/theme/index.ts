import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import type { Priority } from '../types/todo';

/** 4-pt spacing scale. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
} as const;

/** Minimum touch target size recommended by Apple/Google HIG and WCAG 2.5.5. */
export const TOUCH_TARGET = 44;

export interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  focus: string;
  overlay: string;
  priority: Record<Priority, { solid: string; soft: string; text: string }>;
  categories: readonly { background: string; text: string }[];
}

// All text/background pairs below meet WCAG AA (≥ 4.5:1) for normal text.
const light: Palette = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1F6',
  border: '#DCE1EA',
  borderStrong: '#8A93A6',
  text: '#141A26',
  textMuted: '#525C6F',
  textInverse: '#FFFFFF',
  primary: '#1F5FD1',
  primaryPressed: '#184CA8',
  primarySoft: '#E5EEFD',
  danger: '#B42318',
  dangerSoft: '#FDECEA',
  success: '#067647',
  focus: '#1F5FD1',
  overlay: 'rgba(15, 20, 30, 0.55)',
  priority: {
    high: { solid: '#D92D20', soft: '#FDECEA', text: '#A31B12' },
    medium: { solid: '#DC8A06', soft: '#FEF4E2', text: '#8A4B05' },
    low: { solid: '#12A05C', soft: '#E6F6EE', text: '#05603A' },
  },
  categories: [
    { background: '#E5EEFD', text: '#1846A3' },
    { background: '#EFE8FD', text: '#5225B5' },
    { background: '#FDEBF3', text: '#9E1A54' },
    { background: '#E2F5F4', text: '#0B5F5B' },
    { background: '#FEF0E2', text: '#8A4209' },
    { background: '#EAF0E4', text: '#3B5B1A' },
  ],
};

const dark: Palette = {
  background: '#0E1117',
  surface: '#171B24',
  surfaceMuted: '#20252F',
  border: '#2C3340',
  borderStrong: '#6B7486',
  text: '#ECEFF5',
  textMuted: '#A5AEBF',
  textInverse: '#0E1117',
  primary: '#7AA9FF',
  primaryPressed: '#5C93F7',
  primarySoft: '#1C2A45',
  danger: '#FF8A80',
  dangerSoft: '#3A1D1C',
  success: '#5CD69B',
  focus: '#7AA9FF',
  overlay: 'rgba(0, 0, 0, 0.65)',
  priority: {
    high: { solid: '#F97066', soft: '#3A1D1C', text: '#FFB4AD' },
    medium: { solid: '#F5B546', soft: '#3A2C14', text: '#FFD58F' },
    low: { solid: '#47CD89', soft: '#163126', text: '#9BE8C0' },
  },
  categories: [
    { background: '#1C2A45', text: '#A9C7FF' },
    { background: '#2A2147', text: '#CDB8FF' },
    { background: '#3D1D2C', text: '#FFB3D1' },
    { background: '#14312F', text: '#8FE3DC' },
    { background: '#3A2A17', text: '#FFCB94' },
    { background: '#232F1A', text: '#BFE09A' },
  ],
};

export interface Theme {
  dark: boolean;
  colors: Palette;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return useMemo(() => ({ dark: isDark, colors: isDark ? dark : light }), [isDark]);
}

export const palettes = { light, dark };
