@echo off
echo 🚀 TradeKaro Deployment Starting...

echo 📦 Installing Surge...
npm install -g surge

echo 🔨 Installing dependencies...
npm install --legacy-peer-deps

echo 🏗️ Building TradeKaro...
npm run build

echo 🌐 Deploying to Surge...
echo tradekaro-india.surge.sh > out\CNAME
copy out\index.html out\200.html

surge out tradekaro-india.surge.sh

echo ✅ TradeKaro deployed!
echo 🌐 Live at: https://tradekaro-india.surge.sh
pause
