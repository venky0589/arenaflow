import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
//import { lightTheme, darkTheme } from './theme'
import { stadiumNightTheme, courtDaylightTheme } from './theme';
type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'admin-ui-theme-mode'

/**
 * Custom hook to access theme context
 */
export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider')
  }
  return context
}

/**
 * Theme Provider component that wraps the app
 * Provides theme switching functionality with localStorage persistence
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default to dark (Stadium Night theme)
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY)
    // return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'dark'
    return (savedMode == 'dark' || savedMode === 'light') ? savedMode : 'dark'
  })

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  // Toggle between light and dark
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  // Set specific theme
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode)
  }

  // Select the appropriate theme based on mode
  const theme = useMemo(() => {
    return mode === 'light' ? courtDaylightTheme : stadiumNightTheme
  }, [mode])

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setTheme,
    }),
    [mode]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
