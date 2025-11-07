import { createTheme } from '@mui/material/styles'

/**
 * Custom Dark Theme for Badminton Tournament Admin Dashboard
 * Based on the design specification with Orange Red primary color
 */
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F44A22', // Orange Red
      light: '#FF5722', // Warm Orange (hover/pressed state)
      dark: '#D43E1A', // Darker orange
      contrastText: '#FEF8E8', // Silver White
    },
    secondary: {
      main: '#A8AAAC', // Stone Grey
      light: '#C0C2C4',
      dark: '#8A8C8E',
      contrastText: '#FEF8E8',
    },
    background: {
      default: '#161616', // Midnight Black (main page background)
      paper: '#1E1E1E', // Dark Grey (cards, panels, modals)
    },
    text: {
      primary: '#FEF8E8', // Silver White (headings, primary text)
      secondary: '#A8AAAC', // Stone Grey (secondary text, muted labels)
    },
    divider: '#2A2A2A', // Neutral Grey (borders, dividers)
    // Status colors
    success: {
      main: '#4CAF50', // Completed
      light: '#66BB6A',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800', // Ongoing/Delayed
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336', // Cancelled/Error
      light: '#E57373',
      dark: '#D32F2F',
    },
    info: {
      main: '#2196F3', // Upcoming/Info
      light: '#64B5F6',
      dark: '#1976D2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: '#FEF8E8',
      fontWeight: 700,
    },
    h2: {
      color: '#FEF8E8',
      fontWeight: 700,
    },
    h3: {
      color: '#FEF8E8',
      fontWeight: 600,
    },
    h4: {
      color: '#FEF8E8',
      fontWeight: 600,
    },
    h5: {
      color: '#FEF8E8',
      fontWeight: 600,
    },
    h6: {
      color: '#FEF8E8',
      fontWeight: 500,
    },
    subtitle1: {
      color: '#FEF8E8',
      fontWeight: 500,
    },
    subtitle2: {
      color: '#A8AAAC',
      fontWeight: 500,
    },
    body1: {
      color: '#FEF8E8',
    },
    body2: {
      color: '#A8AAAC',
    },
    button: {
      textTransform: 'none', // Disable uppercase for buttons
      fontWeight: 500,
    },
    caption: {
      color: '#A8AAAC',
    },
    overline: {
      color: '#A8AAAC',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#161616',
          color: '#FEF8E8',
          scrollbarColor: '#2A2A2A #161616',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#2A2A2A',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#3A3A3A',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#161616',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderBottom: '1px solid #2A2A2A',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        contained: {
          backgroundColor: '#F44A22',
          color: '#FEF8E8',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#FF5722',
            boxShadow: '0 2px 8px rgba(244, 74, 34, 0.3)',
          },
          '&:active': {
            backgroundColor: '#D43E1A',
          },
        },
        outlined: {
          borderColor: '#2A2A2A',
          color: '#FEF8E8',
          '&:hover': {
            borderColor: '#F44A22',
            backgroundColor: 'rgba(244, 74, 34, 0.08)',
          },
        },
        text: {
          color: '#FEF8E8',
          '&:hover': {
            backgroundColor: 'rgba(254, 248, 232, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderRadius: 8,
          border: '1px solid #2A2A2A',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          backgroundImage: 'none', // Remove default MUI gradient
        },
        outlined: {
          border: '1px solid #2A2A2A',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        filled: {
          backgroundColor: '#2A2A2A',
          color: '#FEF8E8',
        },
        outlined: {
          borderColor: '#2A2A2A',
          color: '#FEF8E8',
        },
        colorPrimary: {
          backgroundColor: '#F44A22',
          color: '#FEF8E8',
        },
        colorSuccess: {
          backgroundColor: '#4CAF50',
          color: '#FEF8E8',
        },
        colorWarning: {
          backgroundColor: '#FF9800',
          color: '#161616',
        },
        colorError: {
          backgroundColor: '#F44336',
          color: '#FEF8E8',
        },
        colorInfo: {
          backgroundColor: '#2196F3',
          color: '#FEF8E8',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#2A2A2A',
            },
            '&:hover fieldset': {
              borderColor: '#3A3A3A',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F44A22',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#A8AAAC',
          },
          '& .MuiInputBase-input': {
            color: '#FEF8E8',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2A2A2A',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3A3A3A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F44A22',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(244, 74, 34, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(244, 74, 34, 0.16)',
            '&:hover': {
              backgroundColor: 'rgba(244, 74, 34, 0.24)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E1E1E',
          border: '1px solid #2A2A2A',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#FEF8E8',
          borderBottom: '1px solid #2A2A2A',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: '1px solid #2A2A2A',
          padding: '16px 24px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#2A2A2A',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#2A2A2A',
          color: '#FEF8E8',
        },
        head: {
          backgroundColor: '#1E1E1E',
          color: '#FEF8E8',
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(254, 248, 232, 0.05)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#FEF8E8',
          '&:hover': {
            backgroundColor: 'rgba(254, 248, 232, 0.08)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E1E1E',
          border: '1px solid #2A2A2A',
          color: '#FEF8E8',
        },
        arrow: {
          color: '#1E1E1E',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.16)',
          color: '#4CAF50',
          '& .MuiAlert-icon': {
            color: '#4CAF50',
          },
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.16)',
          color: '#F44336',
          '& .MuiAlert-icon': {
            color: '#F44336',
          },
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.16)',
          color: '#FF9800',
          '& .MuiAlert-icon': {
            color: '#FF9800',
          },
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.16)',
          color: '#2196F3',
          '& .MuiAlert-icon': {
            color: '#2196F3',
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            backgroundColor: '#1E1E1E',
            border: '1px solid #2A2A2A',
          },
        },
      },
    },
  },
})
