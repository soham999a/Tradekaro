#!/bin/bash

# 🚀 TradeKaro Static Deployment Script
echo "🚀 Building TradeKaro for static deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out
rm -rf .next

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build static export
echo "🔨 Building static export..."
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful! Static files are in the 'out' directory."
    echo "📁 Files ready for deployment:"
    ls -la out/
    
    echo ""
    echo "🌐 You can now deploy the 'out' directory to any static hosting service:"
    echo "   • Netlify: Drag & drop the 'out' folder"
    echo "   • GitHub Pages: Push to gh-pages branch"
    echo "   • Surge.sh: Run 'surge out' in terminal"
    echo "   • Vercel: Import as static site"
    
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi
