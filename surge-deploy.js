#!/usr/bin/env node

// Surge.sh deployment script for TradeKaro
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TradeKaro Surge Deployment Starting...');

// Check if surge is installed
try {
  execSync('surge --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installing Surge CLI...');
  execSync('npm install -g surge', { stdio: 'inherit' });
}

// Build the project
console.log('🔨 Building TradeKaro...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create surge deployment configuration
const surgeConfig = {
  domain: 'tradekaro-india.surge.sh',
  project: './out'
};

// Create CNAME file for custom domain
fs.writeFileSync('./out/CNAME', surgeConfig.domain);

// Create 200.html for SPA routing
const indexContent = fs.readFileSync('./out/index.html', 'utf8');
fs.writeFileSync('./out/200.html', indexContent);

console.log('🌐 Deploying to Surge...');
console.log(`📍 Domain: https://${surgeConfig.domain}`);

// Deploy to surge
try {
  execSync(`surge ${surgeConfig.project} ${surgeConfig.domain}`, { stdio: 'inherit' });
  console.log('✅ TradeKaro deployed successfully!');
  console.log(`🎯 Live at: https://${surgeConfig.domain}`);
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
