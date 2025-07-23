# 🚀 TradeKaro Deployment Guide

This guide covers deploying TradeKaro to production environments with optimal performance and security.

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Firebase project configured
- [ ] Environment variables set
- [ ] Database schema deployed
- [ ] API keys secured
- [ ] Domain configured
- [ ] SSL certificate ready

### ✅ Performance Optimization
- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals optimized
- [ ] SEO meta tags configured

### ✅ Security
- [ ] API keys in environment variables
- [ ] Firebase security rules configured
- [ ] CORS policies set
- [ ] Rate limiting implemented
- [ ] Input validation enabled

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Why Vercel?**
- Optimized for Next.js
- Automatic deployments
- Edge functions
- Built-in analytics
- Zero configuration

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   # ... add all environment variables
   ```

5. **Custom Domain**
   ```bash
   vercel domains add yourdomain.com
   ```

### 2. Netlify

**Steps:**

1. **Build Command**
   ```bash
   npm run build
   ```

2. **Publish Directory**
   ```
   out
   ```

3. **Environment Variables**
   Add in Netlify dashboard under Site Settings > Environment Variables

4. **netlify.toml Configuration**
   ```toml
   [build]
     command = "npm run build"
     publish = "out"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### 3. AWS Amplify

**Steps:**

1. **Connect Repository**
   - Link GitHub/GitLab repository
   - Select branch for deployment

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   Add in Amplify console under App Settings > Environment Variables

### 4. Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  tradekaro:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    restart: unless-stopped
```

## 🔧 Environment Variables

### Required Variables
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Market Data APIs (Optional)
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
```

### Security Best Practices
- Never commit `.env` files to version control
- Use different Firebase projects for development/production
- Rotate API keys regularly
- Implement rate limiting for API endpoints
- Use Firebase Security Rules for database access

## 📊 Performance Optimization

### 1. Bundle Analysis
```bash
npm run analyze
```

### 2. Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Optimize image formats (WebP, AVIF)
- Use CDN for static assets

### 3. Code Splitting
- Implement dynamic imports
- Use React.lazy for components
- Split vendor bundles

### 4. Caching Strategy
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Configuration

### Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Holdings are private to users
    match /holdings/{holdingId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
    }
    
    // Transactions are private to users
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
    }
  }
}
```

### Content Security Policy
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com;
      style-src 'self' 'unsafe-inline' *.googleapis.com;
      img-src 'self' data: blob: *.googleapis.com;
      font-src 'self' *.googleapis.com *.gstatic.com;
      connect-src 'self' *.googleapis.com *.firebaseio.com wss://*.firebaseio.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

## 📈 Monitoring & Analytics

### 1. Performance Monitoring
- Set up Vercel Analytics
- Configure Google Analytics 4
- Implement error tracking (Sentry)
- Monitor Core Web Vitals

### 2. Business Metrics
- Track user registrations
- Monitor trading activity
- Analyze portfolio performance
- Track feature usage

### 3. Health Checks
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... other environment variables
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🎯 Post-Deployment

### 1. Verification Checklist
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Trading functionality operational
- [ ] Portfolio data displays
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

### 2. Monitoring Setup
- Configure uptime monitoring
- Set up error alerting
- Monitor performance metrics
- Track user analytics

### 3. Backup Strategy
- Regular database backups
- Code repository backups
- Environment configuration backups
- Disaster recovery plan

---

**🎉 Congratulations! TradeKaro is now live and ready for users!**

For support, contact: support@tradekaro.com
