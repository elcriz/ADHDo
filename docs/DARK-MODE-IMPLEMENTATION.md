# Dark Mode Implementation Guide

## Overview

The ADHDO application now includes automatic dark mode support that responds to the user's system preferences. The dark mode implementation uses Material UI's theming system and React hooks to provide a seamless experience.

## Features

✅ **Automatic Detection**: Dark mode is automatically triggered based on the user's OS/browser setting (`prefers-color-scheme: dark`)
✅ **Seamless Switching**: Themes switch instantly when system preferences change
✅ **Optimized Colors**: Carefully chosen dark theme colors for better readability and reduced eye strain
✅ **Consistent Components**: All Material UI components automatically adapt to the selected theme
✅ **Performance Optimized**: Uses React's `useMemo` hook to prevent unnecessary re-renders

## Implementation Details

### Theme Architecture

The implementation consists of:

1. **Base Configuration**: Shared typography and component styles
2. **Light Theme Palette**: Colors optimized for light backgrounds
3. **Dark Theme Palette**: Colors optimized for dark backgrounds  
4. **Dynamic Theme Hook**: `useAppTheme()` that detects system preferences
5. **Component Integration**: Material UI components with theme-aware styling

### File Structure

```
src/
├── theme.ts          # Theme configuration and useAppTheme hook
├── App.tsx           # Main app component using dynamic theme
└── App.css           # Minimal custom styles (mostly handled by Material UI)
```

### Key Files Modified

#### `src/theme.ts`
- **Light Theme**: Clean whites and light grays with blue/green accents
- **Dark Theme**: Dark slate backgrounds with lighter, more vibrant accent colors
- **Dynamic Hook**: `useAppTheme()` automatically selects theme based on system preference

#### `src/App.tsx`
- Updated to use `useAppTheme()` hook instead of static theme
- Theme provider automatically updates when system preference changes

## Color Schemes

### Light Mode Colors
```css
Background: #f8fafc (Light gray)
Paper: #ffffff (White)
Primary: #3b82f6 (Blue)
Secondary: #10b981 (Green)
Text Primary: #1f2937 (Dark gray)
Text Secondary: #6b7280 (Medium gray)
```

### Dark Mode Colors
```css
Background: #0f172a (Dark slate)
Paper: #1e293b (Medium slate)
Primary: #60a5fa (Light blue)
Secondary: #34d399 (Light green)
Text Primary: #f1f5f9 (Light gray)
Text Secondary: #94a3b8 (Medium light gray)
```

## How It Works

### System Preference Detection
```typescript
const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );

  return theme;
};
```

### Component Integration
```typescript
function App() {
  const theme = useAppTheme(); // Automatically selects light/dark theme
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Rest of app */}
    </ThemeProvider>
  );
}
```

## Testing Dark Mode

### Desktop Testing
1. **macOS**: System Preferences → General → Appearance → Dark
2. **Windows**: Settings → Personalization → Colors → Choose your color (Dark)
3. **Linux**: Varies by desktop environment

### Browser Testing
You can also test by opening browser developer tools and simulating dark mode:

#### Chrome/Edge DevTools
1. Open DevTools (F12)
2. Press `Ctrl/Cmd + Shift + P`
3. Type "dark" and select "Emulate CSS prefers-color-scheme: dark"

#### Firefox DevTools  
1. Open DevTools (F12)
2. Go to Settings (gear icon)
3. Under "Inspector", check "Simulate prefers-color-scheme"
4. Select "dark" from dropdown

### Mobile Testing
- **iOS**: Settings → Display & Brightness → Dark
- **Android**: Settings → Display → Dark theme

## Benefits for Neurodivergent Users

### Reduced Eye Strain
- Dark backgrounds reduce overall screen brightness
- Lower contrast ratios are easier on sensitive eyes
- Blue light reduction improves comfort during extended use

### Better Focus
- Dark UI elements reduce visual distractions
- High contrast text maintains readability
- Consistent color scheme reduces cognitive load

### Accessibility
- Automatic adaptation reduces need for manual preference setting
- Respects system-wide accessibility preferences
- Maintains design consistency across light/dark modes

## Future Enhancements

Potential improvements for the dark mode implementation:

1. **Manual Toggle**: Add a theme switcher button for user override
2. **Time-Based Switching**: Automatic switching based on time of day
3. **Custom Color Profiles**: User-selectable color themes beyond light/dark
4. **High Contrast Mode**: Enhanced contrast option for accessibility
5. **Theme Persistence**: Remember user's manual theme preference

## Technical Notes

### Performance
- Theme detection uses native CSS media queries (very fast)
- `useMemo` prevents unnecessary theme object recreation
- Material UI's theme caching optimizes component rendering

### Browser Support
- Modern browsers support `prefers-color-scheme` media query
- Fallback to light theme for older browsers
- Progressive enhancement approach ensures compatibility

### PWA Compatibility
- Dark mode works seamlessly with PWA installation
- Service worker caches both light and dark theme assets
- Offline functionality maintains theme preferences

---

**Status**: ✅ **Dark Mode Implementation Complete**

The ADHDO application now provides an optimal viewing experience in both light and dark environments, automatically adapting to user preferences for improved accessibility and comfort.
