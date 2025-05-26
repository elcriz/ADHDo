# PWA Testing Guide

## Overview

This guide provides comprehensive testing procedures for the ADHDO Progressive Web App (PWA) implementation. Follow these steps to ensure all PWA features are working correctly.

## Pre-Testing Setup

### 1. Build the Application

```bash
npm run build
```

### 2. Serve the Built Application

For accurate PWA testing, serve the production build:

```bash
# Option 1: Using a simple HTTP server
npx serve dist -p 3000

# Option 2: Using Python (if available)
cd dist && python -m http.server 3000

# Option 3: Using VS Code Live Server extension
# Right-click on dist/index.html and select "Open with Live Server"
```

### 3. Start Backend Server

```bash
cd backend && npm run dev
```

## Testing Checklist

### ✅ Web App Manifest Testing

1. **Manifest Validation**:
   - Open `http://localhost:3000/manifest.webmanifest`
   - Verify JSON is valid and contains correct metadata
   - Check icons are properly referenced

2. **Browser DevTools Check**:
   - Open Chrome DevTools → Application tab
   - Check "Manifest" section shows app details
   - Verify no manifest errors are displayed

### ✅ Service Worker Testing

1. **Registration Check**:
   - DevTools → Application → Service Workers
   - Verify SW is registered and activated
   - Status should show "activated and running"

2. **Cache Inspection**:
   - DevTools → Application → Cache Storage
   - Should see caches: `workbox-precache-v2-...` and others
   - Verify static assets are cached

3. **Offline Functionality**:
   - DevTools → Network tab → Check "Offline"
   - Refresh the page - should load from cache
   - Test navigation between pages

### ✅ Install Prompt Testing

#### Desktop Testing (Chrome/Edge)

1. **Automatic Prompt**:
   - Visit the app in Chrome/Edge
   - Look for install prompt in address bar
   - Should see a "⊕" or install icon

2. **Manual Installation**:
   - Chrome: Three dots menu → "Install ADHDO"
   - Edge: Three dots menu → "Apps" → "Install this site as an app"

3. **Custom Install Prompt**:
   - Should see Material UI install prompt
   - Click "Install App" button
   - Verify installation dialog appears

#### Mobile Testing (Android Chrome)

1. **Add to Home Screen Banner**:
   - Open in Chrome mobile
   - Should see "Add ADHDO to Home screen" banner
   - Tap to install

2. **Menu Installation**:
   - Three dots menu → "Add to Home screen"
   - App should install with proper icon

#### iOS Testing (Safari)

1. **Manual Installation**:
   - Open in Safari on iOS
   - Tap Share button
   - Select "Add to Home Screen"
   - Verify app icon and name

### ✅ PWA Features Testing

1. **Standalone Mode**:
   - After installation, app should open in standalone mode
   - No browser UI (address bar, bookmarks) should be visible
   - Should have native app-like appearance

2. **Splash Screen**:
   - On app launch, should show splash screen with app icon
   - Background color should match manifest theme

3. **App Icon**:
   - Home screen icon should be high quality
   - Icon should match app branding

### ✅ Performance Testing

1. **Loading Speed**:
   - First load should be reasonably fast
   - Subsequent loads should be very fast (cached)

2. **Offline Performance**:
   - Test all major app functions offline
   - Todo viewing, creation, editing should work
   - Authentication should persist

### ✅ Cross-Platform Testing

#### Required Test Devices

1. **Desktop Browsers**:
   - Chrome 67+ ✓
   - Edge 79+ ✓
   - Firefox 79+ ✓
   - Safari 14+ ✓

2. **Mobile Devices**:
   - Android Chrome ✓
   - iOS Safari ✓
   - Samsung Internet ✓

## Automated Testing Commands

### 1. PWA Audit (when Node.js 18.20+ available)

```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run PWA audit
lighthouse http://localhost:3000 --only-categories=pwa --view

# Save results
lighthouse http://localhost:3000 --only-categories=pwa --output=json --output-path=pwa-audit.json
```

### 2. Service Worker Testing

```bash
# Test service worker in Chrome headless
npx puppeteer-core test-sw.js
```

### 3. Manifest Validation

```bash
# Use web-app-manifest-validator
npm install -g web-app-manifest-validator
manifest-validator http://localhost:3000/manifest.webmanifest
```

## Common Issues & Solutions

### Install Prompt Not Showing

**Symptoms**: Custom install prompt doesn't appear
**Solutions**:
1. Ensure HTTPS or localhost
2. Check service worker is registered
3. Verify manifest is valid
4. Clear browser cache and cookies

### Service Worker Not Updating

**Symptoms**: Changes not reflected after deployment
**Solutions**:
1. Update cache names in service worker
2. Call `skipWaiting()` in SW install event
3. Clear application data in DevTools
4. Hard refresh (Ctrl+Shift+R)

### Offline Mode Issues

**Symptoms**: App doesn't work offline
**Solutions**:
1. Check cache strategies in service worker
2. Verify API endpoints are being cached
3. Review network requests in DevTools
4. Test with Network throttling

### iOS Installation Issues

**Symptoms**: App doesn't install properly on iOS
**Solutions**:
1. Ensure proper meta tags in HTML
2. Check icon specifications
3. Verify standalone display mode
4. Test with latest Safari version

## Success Criteria

### Minimum PWA Requirements ✅

- [x] Web App Manifest present and valid
- [x] Service Worker registered and functional
- [x] HTTPS served (or localhost for development)
- [x] App is responsive and mobile-friendly
- [x] Install prompt available

### Enhanced PWA Features ✅

- [x] Offline functionality working
- [x] Custom install prompt
- [x] Appropriate caching strategies
- [x] Background sync capabilities
- [x] Push notification ready (structure in place)

### User Experience ✅

- [x] Fast loading times
- [x] Native app-like appearance
- [x] Smooth navigation
- [x] Consistent branding
- [x] Error handling for offline scenarios

## Reporting Issues

When testing reveals issues:

1. **Document the Issue**:
   - Browser and version
   - Device type and OS
   - Steps to reproduce
   - Expected vs actual behavior

2. **Include Screenshots**:
   - DevTools console errors
   - Network tab issues
   - Visual problems

3. **Test Environment**:
   - Development vs production
   - Network conditions
   - Cache state

## Next Steps After Testing

1. **Performance Optimization**:
   - Bundle size analysis
   - Critical resource hints
   - Advanced caching strategies

2. **Feature Enhancements**:
   - Push notifications implementation
   - Background sync refinement
   - Offline analytics

3. **App Store Deployment**:
   - PWA Builder for Microsoft Store
   - Trusted Web Activity for Play Store
   - macOS App Store via PWA

## Resources

- [PWA Testing Checklist](https://web.dev/pwa-checklist/)
- [Chrome DevTools PWA Features](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)
- [Lighthouse PWA Audits](https://web.dev/lighthouse-pwa/)
- [Service Worker Testing](https://developers.google.com/web/fundamentals/primers/service-workers/test)
