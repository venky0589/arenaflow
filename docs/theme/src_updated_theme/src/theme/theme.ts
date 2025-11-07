// src/theme/theme.ts
import { createTheme, alpha } from '@mui/material/styles';

/* ===========================
   Stadium Night — DARK theme
   =========================== */
const night = {
  bg0: '#0B0F14',
  bg1: '#121821',
  bg2: '#171F2A',
  primary: '#10D3C6',   // Neon Teal
  accent:  '#FF6B2C',   // Victory Orange
  textPri: '#EAF2FF',
  textSec: '#98A7BD',
  divider: '#233042',
};

export const stadiumNightTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: night.primary, contrastText: '#001317' },
    secondary:{ main: night.accent,  contrastText: '#1A0B06' },
    background:{ default: night.bg0, paper: night.bg1 },
    divider: night.divider,
    text: { primary: night.textPri, secondary: night.textSec },
    success: { main: '#17C964' },
    warning: { main: '#FDB813' },
    info:    { main: '#3BA1FF' },
    error:   { main: '#FF5A5F' },
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(1200px 400px at 50% -100px, ${alpha('#2C3E50',0.35)}, transparent)`,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'transparent', elevation: 0 },
      styleOverrides: { root: { backdropFilter: 'blur(10px)', borderBottom: `1px solid ${night.divider}` } }
    },
    MuiPaper: { styleOverrides: { root: { border: `1px solid ${night.divider}`, backgroundColor: night.bg1 } } },
    MuiTableHead: { styleOverrides: { root: { backgroundColor: alpha(night.textSec, 0.05) } } },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: alpha(night.primary, 0.06) } },
        selected: { '& td': { backgroundColor: alpha(night.primary, 0.08) }, borderLeft: `2px solid ${night.primary}` }
      }
    },
    MuiTableCell: { styleOverrides: { root: { borderColor: night.divider } } },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
        containedPrimary: { boxShadow: `0 6px 16px ${alpha(night.primary, .25)}` },
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600 },
        colorSuccess: { boxShadow: `0 0 0 3px ${alpha('#17C964', .18)} inset` }
      }
    },
  },
})

/* ===========================
   Court Daylight — LIGHT theme
   =========================== */
const day = {
  bg0: '#F8FBFE',
  bg1: '#FFFFFF',
  bg2: '#F2F6FB',
  primary: '#2BB673',   // Court Green
  accent:  '#FF6B2C',   // Matchday Orange
  textPri: '#142033',
  textSec: '#5C6C84',
  divider: '#E4ECF4',
};

export const courtDaylightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: day.primary, contrastText: '#FFFFFF' },
    secondary:{ main: day.accent,  contrastText: '#FFFFFF' },
    background:{ default: day.bg0, paper: day.bg1 },
    divider: day.divider,
    text: { primary: day.textPri, secondary: day.textSec },
    success: { main: '#0E9F6E' },
    warning: { main: '#F59E0B' },
    info:    { main: '#2274E5' },
    error:   { main: '#D32F2F' },
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
  components: {
    MuiAppBar: {
      defaultProps: { color: 'default', elevation: 0 },
      styleOverrides: { root: { borderBottom: `1px solid ${day.divider}` } }
    },
    MuiPaper: { styleOverrides: { root: { border: `1px solid ${day.divider}`, backgroundColor: day.bg1, boxShadow: 'none' } } },
    MuiTableHead: { styleOverrides: { root: { backgroundColor: alpha(day.primary, 0.06) } } },
    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: alpha(day.primary, 0.05) } } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: day.divider } } },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 999 } }
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 600 } } },
  },
})

/* ========================================
   Helper
   ======================================== */
export type ThemePreset = 'stadiumNight' | 'courtDaylight'
export const getTheme = (preset: ThemePreset) => preset === 'stadiumNight' ? stadiumNightTheme : courtDaylightTheme
