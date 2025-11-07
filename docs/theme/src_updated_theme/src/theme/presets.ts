import { createTheme, Theme } from '@mui/material/styles';

export type PresetName =
    | 'tealOrange'      // Image 1 – teal + orange landing
    | 'midnightEmber'   // Image 2 – deep navy + ember orange moodboard
    | 'coralTeal'       // Image 3 – coral + teal mobile UI
    | 'sunsetGlass'     // Image 4 – orange + blue “glass” cards
    | 'navyWave';       // Image 5 – navy backdrop + flowing orange wave

type PaletteBase = {
    primary: string;
    primaryLight?: string;
    primaryDark?: string;
    accent: string;
    // Light mode surfaces
    lightBg: string;
    lightPaper: string;
    lightText: string;
    lightSubtext: string;
    lightDivider: string;
    // Dark mode surfaces
    darkBg: string;
    darkPaper: string;
    darkText: string;
    darkSubtext: string;
    darkDivider: string;
};

const presets: Record<PresetName, PaletteBase> = {
    /** Image 1: teal hero + orange slash (corporate) */
    tealOrange: {
        primary: '#1FBAC4',         // teal
        primaryLight: '#4DD3DB',
        primaryDark: '#0E6B73',
        accent: '#F44A22',          // orange-red
        lightBg: '#F7FCFD',
        lightPaper: '#FFFFFF',
        lightText: '#0F172A',
        lightSubtext: '#64748B',
        lightDivider: '#E2E8F0',
        darkBg: '#0F2430',
        darkPaper: '#122A37',
        darkText: '#E6F6F8',
        darkSubtext: '#9ECAD0',
        darkDivider: '#1F3B47',
    },

    /** Image 2: midnight blues + ember orange */
    midnightEmber: {
        primary: '#0F2847',         // deep midnight
        primaryLight: '#17365F',
        primaryDark: '#0B1C34',
        accent: '#FF6A2A',          // ember
        lightBg: '#F8FAFF',
        lightPaper: '#FFFFFF',
        lightText: '#0B1C34',
        lightSubtext: '#51607A',
        lightDivider: '#E6ECF5',
        darkBg: '#0A1424',
        darkPaper: '#0E1B2E',
        darkText: '#EAF2FF',
        darkSubtext: '#9DB3D4',
        darkDivider: '#15243C',
    },

    /** Image 3: coral + teal, soft neumorphic vibe */
    coralTeal: {
        primary: '#FF5A3C',         // coral
        primaryLight: '#FF7B61',
        primaryDark: '#E0462C',
        accent: '#1FB6EA',          // teal-blue
        lightBg: '#F9FBFF',
        lightPaper: '#FFFFFF',
        lightText: '#1F2937',
        lightSubtext: '#6B7280',
        lightDivider: '#E5E7EB',
        darkBg: '#0F172A',
        darkPaper: '#121B32',
        darkText: '#FDF6F3',
        darkSubtext: '#F1B7AB',
        darkDivider: '#1B2540',
    },

    /** Image 4: warm orange + bright blue (glass cards) */
    sunsetGlass: {
        primary: '#FF6B3D',         // warm orange
        primaryLight: '#FF8A63',
        primaryDark: '#E3532A',
        accent: '#1E88E5',          // bright blue
        lightBg: '#FDF7F3',
        lightPaper: '#FFFFFF',
        lightText: '#101828',
        lightSubtext: '#667085',
        lightDivider: '#EDE7E3',
        darkBg: '#0B1223',
        darkPaper: '#111B30',
        darkText: '#FFF3EC',
        darkSubtext: '#FFD0BD',
        darkDivider: '#1B2742',
    },

    /** Image 5: navy backdrop + flowing orange wave */
    navyWave: {
        primary: '#FF8A3D',         // vibrant orange
        primaryLight: '#FFA868',
        primaryDark: '#E56E23',
        accent: '#0B2545',          // rich navy accent
        lightBg: '#FFFDF9',
        lightPaper: '#FFFFFF',
        lightText: '#161616',
        lightSubtext: '#5C5C5C',
        lightDivider: '#E4E2E3',
        darkBg: '#081C34',
        darkPaper: '#0B2545',
        darkText: '#FEF8E8',
        darkSubtext: '#B9C7DA',
        darkDivider: '#13345A',
    },
};

function makeThemes(p: PaletteBase): { light: Theme; dark: Theme } {
    const common = {
        shape: { borderRadius: 14 },
        typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
        components: {
            MuiPaper: { styleOverrides: { root: { border: '1px solid', borderColor: 'divider' } } },
            MuiButton: { defaultProps: { size: 'small', disableElevation: true } },
            MuiIconButton: { defaultProps: { size: 'small' } },
            MuiTableCell: { styleOverrides: { head: { fontWeight: 700 } } },
        },
    } as const;

    const light = createTheme({
        ...common,
        palette: {
            mode: 'light',
            primary: { main: p.primary, light: p.primaryLight ?? p.primary, dark: p.primaryDark ?? p.primary, contrastText: '#FFFFFF' },
            secondary: { main: p.accent, contrastText: '#FFFFFF' },
            background: { default: p.lightBg, paper: p.lightPaper },
            text: { primary: p.lightText, secondary: p.lightSubtext },
            divider: p.lightDivider,
            error: { main: '#D32F2F' }, warning: { main: '#F59E0B' }, success: { main: '#22C55E' }, info: { main: '#E6EEF9', contrastText: p.lightText },
        },
    });

    const dark = createTheme({
        ...common,
        palette: {
            mode: 'dark',
            primary: { main: p.primary, light: p.primaryLight ?? p.primary, dark: p.primaryDark ?? p.primary, contrastText: '#FEF8E8' },
            secondary: { main: p.accent, contrastText: '#FEF8E8' },
            background: { default: p.darkBg, paper: p.darkPaper },
            text: { primary: p.darkText, secondary: p.darkSubtext },
            divider: p.darkDivider,
            error: { main: '#F97066' }, warning: { main: '#FDB022' }, success: { main: '#32D583' }, info: { main: '#243B53', contrastText: '#E5EAF0' },
        },
    });

    return { light, dark };
}

export const THEME_PRESETS: Record<PresetName, { light: Theme; dark: Theme }> = {
    tealOrange: makeThemes(presets.tealOrange),
    midnightEmber: makeThemes(presets.midnightEmber),
    coralTeal: makeThemes(presets.coralTeal),
    sunsetGlass: makeThemes(presets.sunsetGlass),
    navyWave: makeThemes(presets.navyWave),
};
