import { createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

// Base typography configuration (shared between light and dark themes)
const typography = {
  fontFamily: '"Manrope", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
};

// Base component overrides (shared between light and dark themes)
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'uppercase' as const,
        borderRadius: '8px',
        fontWeight: 700,
        letterSpacing: '0.5px',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        fontFamily: '"Manrope", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 500,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
};

// Light theme colors
const lightPalette = {
  primary: {
    main: '#3b82f6', // Blue primary color
    light: '#60a5fa',
    dark: '#1d4ed8',
  },
  secondary: {
    main: '#10b981', // Green secondary color
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#ef4444',
  },
  warning: {
    main: '#f59e0b',
  },
  success: {
    main: '#10b981',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
  },
  ui: 'rgb(232, 234, 240)',
  uiForm: '#fafafa',
  uiTabs: '#f5f5f5',
  todoCompleted: '#fafafa',
  todoPriority: '#f9edbe',
};

// Dark theme colors
const darkPalette = {
  primary: {
    main: '#60a5fa', // Lighter blue for dark mode
    light: '#93c5fd',
    dark: '#3b82f6',
  },
  secondary: {
    main: '#34d399', // Lighter green for dark mode
    light: '#6ee7b7',
    dark: '#10b981',
  },
  error: {
    main: '#f87171',
  },
  warning: {
    main: '#fbbf24',
  },
  success: {
    main: '#34d399',
  },
  background: {
    default: '#0f172a', // Dark slate background
    paper: '#1e293b',   // Dark slate paper
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
  },
  ui: 'rgb(32, 38, 48)',
  uiForm: 'rgb(32, 38, 48)',
  uiTabs: 'rgb(32, 38, 48)',
  todoCompleted: 'rgb(32, 38, 48)',
  todoPriority: '#f0c36d',
};

// Create light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...lightPalette,
  },
  typography,
  components,
});

// Create dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...darkPalette,
  },
  typography,
  components: {
    ...components,
    // Dark mode specific component overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
          backgroundColor: '#1e293b',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#1e293b',
        },
      },
    },
  },
});

// Hook to get the appropriate theme based on system preference
export const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );

  return theme;
};

// Default export for backward compatibility
export const theme = lightTheme;
