export const Colors = {
  primary: '#ea580c', // orange-600
  secondary: '#f97316', // orange-500
  accent: '#ef4444', // red-500
  
  light: {
    background: '#fafafa', // zinc-50
    card: '#ffffff',
    text: '#18181b', // zinc-900
    textMuted: '#71717a', // zinc-500
    border: '#e4e4e7', // zinc-200
    input: '#ffffff',
  },
  
  dark: {
    background: '#0f172a', // slate-900
    card: '#1e293b', // slate-800
    text: '#f8fafc', // slate-50
    textMuted: '#94a3b8', // slate-400
    border: '#334155', // slate-700
    input: 'rgba(255, 255, 255, 0.05)',
  },
  
  success: '#10b981', // emerald-500
  error: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  info: '#06b6d4', // cyan-500
  
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export type ThemeType = 'light' | 'dark';
