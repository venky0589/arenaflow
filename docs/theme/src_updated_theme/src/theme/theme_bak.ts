import { createTheme, ThemeOptions } from '@mui/material/styles'

/**
 * Common theme options shared between light and dark modes
 */
const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
}

/**
 * Light theme configuration - Orange Accent
 */
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#F44A22',      // Orange Red - Primary accent
      light: '#FF5722',     // Warm Orange - Hover/pressed state
      dark: '#D43B1A',      // Darker orange for emphasis
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF5722',      // Warm Orange - Secondary actions
      light: '#FF7043',
      dark: '#E64A19',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFDF9',   // Soft Cream White - Main page background
      paper: '#FFFFFF',     // Off White - Cards, panels, modals
    },
    text: {
      primary: '#161616',   // Charcoal Black - Main text and headings
      secondary: '#5C5C5C', // Stone Grey - Secondary text, muted labels
    },
    divider: '#E4E2E3',     // Neutral Grey - Borders, dividers
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#F57C00',
    },
    info: {
      main: '#FFF0E8',      // Pale Orange Tint - Info backgrounds
      contrastText: '#161616',
    },
    success: {
      main: '#388E3C',
    },
  },
})

/**
 * Dark theme configuration - Orange Accent on Dark Background
 */
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#F44A22',      // Orange Red - Primary accent
      light: '#FF5722',     // Warm Orange - Hover/pressed state
      dark: '#D43B1A',      // Darker orange for emphasis
      contrastText: '#FEF8E8',
    },
    secondary: {
      main: '#FF5722',      // Warm Orange - Secondary actions
      light: '#FF7043',
      dark: '#E64A19',
      contrastText: '#FEF8E8',
    },
    background: {
      default: '#161616',   // Midnight Black - Main page background
      paper: '#1E1E1E',     // Dark Grey - Panels, cards, modals
    },
    text: {
      primary: '#FEF8E8',   // Silver White - Headings, labels
      secondary: '#A8AAAC', // Stone Grey - Secondary text, muted labels
    },
    divider: '#2A2A2A',     // Neutral Grey - Borders, dividers
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FFA726',
    },
    info: {
      main: '#E4E2E3',      // Light Grey - Info backgrounds
      contrastText: '#161616',
    },
    success: {
      main: '#66BB6A',
    },
  },
})
