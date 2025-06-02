#!/bin/bash

# PWA Validation Script
# This script performs basic validation of PWA implementation

echo "🔍 ADHDO PWA Validation Script"
echo "================================"

# Check if production build exists
if [ ! -d "dist" ]; then
    echo "❌ Error: Production build not found. Run 'npm run build' first."
    exit 1
fi

echo "✅ Production build found"

# Check required PWA files
PWA_FILES=(
    "dist/manifest.webmanifest"
    "dist/sw.js"
    "dist/registerSW.js"
    "dist/icons/icon-192x192.png"
    "dist/icons/icon-512x512.png"
)

echo ""
echo "📁 Checking PWA files..."
for file in "${PWA_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Missing!"
    fi
done

# Check manifest content
echo ""
echo "📋 Validating manifest..."
if [ -f "dist/manifest.webmanifest" ]; then
    # Check if manifest contains required fields
    if grep -q '"name"' dist/manifest.webmanifest; then
        echo "✅ Manifest contains name field"
    fi
    if grep -q '"start_url"' dist/manifest.webmanifest; then
        echo "✅ Manifest contains start_url field"
    fi
    if grep -q '"display"' dist/manifest.webmanifest; then
        echo "✅ Manifest contains display field"
    fi
    if grep -q '"icons"' dist/manifest.webmanifest; then
        echo "✅ Manifest contains icons field"
    fi
    if grep -q '"theme_color"' dist/manifest.webmanifest; then
        echo "✅ Manifest contains theme_color field"
    fi

    # Extract name for display
    NAME=$(grep -o '"name":"[^"]*"' dist/manifest.webmanifest | cut -d'"' -f4)
    echo "✅ App name: $NAME"
else
    echo "❌ Manifest file not found"
fi

# Check service worker content
echo ""
echo "🔧 Validating service worker..."
if [ -f "dist/sw.js" ]; then
    if grep -q "workbox" dist/sw.js; then
        echo "✅ Service worker uses Workbox"
    fi
    if grep -q "precacheAndRoute" dist/sw.js; then
        echo "✅ Service worker has precaching"
    fi
    if grep -q "registerRoute" dist/sw.js; then
        echo "✅ Service worker has runtime caching"
    fi
else
    echo "❌ Service worker not found"
fi

# Check icon files
echo ""
echo "🖼️  Validating icons..."
if [ -f "dist/icons/icon-192x192.png" ]; then
    SIZE=$(file dist/icons/icon-192x192.png | grep -o '[0-9]\+ x [0-9]\+')
    echo "✅ 192x192 icon: $SIZE"
fi
if [ -f "dist/icons/icon-512x512.png" ]; then
    SIZE=$(file dist/icons/icon-512x512.png | grep -o '[0-9]\+ x [0-9]\+')
    echo "✅ 512x512 icon: $SIZE"
fi

# Check HTML meta tags
echo ""
echo "📄 Validating HTML meta tags..."
if [ -f "dist/index.html" ]; then
    if grep -q 'name="theme-color"' dist/index.html; then
        echo "✅ Theme color meta tag found"
    fi
    if grep -q 'rel="manifest"' dist/index.html; then
        echo "✅ Manifest link found"
    fi
    if grep -q 'apple-touch-icon' dist/index.html; then
        echo "✅ Apple touch icon found"
    fi
    if grep -q 'mobile-web-app-capable' dist/index.html; then
        echo "✅ Mobile web app capable meta tag found"
    fi
else
    echo "❌ HTML file not found"
fi

echo ""
echo "🎯 PWA Validation Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Start a local server: cd dist && python3 -m http.server 3001"
echo "2. Open browser: http://localhost:3001"
echo "3. Test PWA installation and offline functionality"
echo "4. Use Chrome DevTools > Application > Manifest & Service Workers"
echo ""
echo "📱 For mobile testing:"
echo "1. Deploy to HTTPS server or use ngrok for testing"
echo "2. Test installation on Android Chrome and iOS Safari"
echo "3. Verify offline functionality and app-like behavior"
