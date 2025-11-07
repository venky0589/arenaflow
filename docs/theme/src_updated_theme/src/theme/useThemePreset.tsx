import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { THEME_PRESETS, PresetName } from './presets';

type Mode = 'light' | 'dark';
type Ctx = {
    preset: PresetName;
    mode: Mode;
    setPreset: (p: PresetName) => void;
    toggleMode: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemePresetProvider({ children, initialPreset = 'tealOrange', initialMode = 'dark' as Mode }: { children: ReactNode; initialPreset?: PresetName; initialMode?: Mode }) {
    const [preset, setPresetState] = useState<PresetName>(() => (localStorage.getItem('preset') as PresetName) || initialPreset);
    const [mode, setModeState] = useState<Mode>(() => (localStorage.getItem('mode') as Mode) || initialMode);

    const setPreset = useCallback((p: PresetName) => {
        setPresetState(p);
        localStorage.setItem('preset', p);
    }, []);

    const toggleMode = useCallback(() => {
        setModeState((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    }, []);

    const theme = useMemo(() => {
        console.log('Theme changing to:', preset, mode); // Debug log
        return THEME_PRESETS[preset][mode];
    }, [preset, mode]);

    const api = useMemo<Ctx>(() => ({
        preset,
        mode,
        setPreset,
        toggleMode,
    }), [preset, mode, setPreset, toggleMode]);

    return (
        <ThemeCtx.Provider value={api}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeCtx.Provider>
    );
}

export function useThemePreset() {
    const ctx = useContext(ThemeCtx);
    if (!ctx) throw new Error('useThemePreset must be used inside ThemePresetProvider');
    return ctx;
}
