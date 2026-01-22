# Deployment Guide

This guide will walk you through deploying the LINE Rich Menu Maker application to Vercel.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deploying to Vercel](#deploying-to-vercel)
- [Environment Variables](#environment-variables)
- [Database Initialization](#database-initialization)
- [Post-Deployment Verification](#post-deployment-verification)
- [CI/CD Setup](#cicd-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

2. **PostgreSQL Database**
   - Your DigitalOcean PostgreSQL database should be accessible
   - Note your database credentials:
     - Host: `db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com`
     - Port: `25060`
     - User: `doadmin`
     - Password: `AVNS_fSdVchp9k4CbGWGAVRP`
     - Database: `defaultdb`

3. **Git Repository**
   - Push your code to a Git provider (GitHub, GitLab, or Bitbucket)
   - Vercel will deploy from this repository

## Deploying to Vercel

### Option 1: Using Vercel Dashboard (Recommended for first deployment)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Set Environment Variables**
   - Click "Environment Variables"
   - Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require` | Production, Preview, Development |
| `DATABASE_USER` | `doadmin` | Production, Preview, Development |
| `DATABASE_PASSWORD` | `AVNS_fSdVchp9k4CbGWGAVRP` | Production, Preview, Development |
| `DATABASE_HOST` | `db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com` | Production, Preview, Development |
| `DATABASE_PORT` | `25060` | Production, Preview, Development |
| `DATABASE_NAME` | `defaultdb` | Production, Preview, Development |

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Using Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   cd bookchaowalit-linerichmenu-frontend
   vercel
   ```

3. **Follow the prompts**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for new project)
   - What's your project's name? `line-rich-menu-maker` (or your preferred name)
   - In which directory is your code located? `./` (default)

4. **Set environment variables**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add DATABASE_USER production
   vercel env add DATABASE_PASSWORD production
   vercel env add DATABASE_HOST production
   vercel env add DATABASE_PORT production
   vercel env add DATABASE_NAME production
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required Variables

All of the following environment variables must be set in your Vercel project:

```bash
DATABASE_URL=postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require
DATABASE_USER=doadmin
DATABASE_PASSWORD=AVNS_fSdVchp9k4CbGWGAVRP
DATABASE_HOST=db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com
DATABASE_PORT=25060
DATABASE_NAME=defaultdb
```

### Setting Variables in Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter the variable name and value
5. Select environments (Production, Preview, Development)
6. Click **Save**

### Setting Variables via CLI

```bash
# For production
vercel env add DATABASE_URL production
vercel env add DATABASE_USER production
vercel env add DATABASE_PASSWORD production
vercel env add DATABASE_HOST production
vercel env add DATABASE_PORT production
vercel env add DATABASE_NAME production

# For preview deployments
vercel env add DATABASE_URL preview
vercel env add DATABASE_USER preview
vercel env add DATABASE_PASSWORD preview
vercel env add DATABASE_HOST preview
vercel env add DATABASE_PORT preview
vercel env add DATABASE_NAME preview

# For development
vercel env add DATABASE_URL development
vercel env add DATABASE_USER development
vercel env add DATABASE_PASSWORD development
vercel env add DATABASE_HOST development
vercel env add DATABASE_PORT development
vercel env add DATABASE_NAME development
```

## Database Initialization

After deploying, you need to initialize the database tables. Here's how:

### Method 1: Via Web Interface

1. Open your deployed application
2. You'll see a "Database Not Initialized" warning
3. Click the **"Initialize Database"** button
4. Wait for the success message

### Method 2: Via API Endpoint

You can also initialize the database using curl:

```bash
curl -X POST https://your-project-name.vercel.app/api/init
```

Expected response:
```json
{
  "message": "Database initialized successfully",
  "statementsExecuted": 7
}
```

### Method 3: Via Vercel CLI

```bash
# Create a temporary script
cat > init-db.js << 'EOF'
const https = require('https');

const data = new TextEncoder().encode(JSON.stringify({}));

const options = {
  hostname: 'your-project-name.vercel.app',
  port: 443,
  path: '/api/init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
EOF

# Run it
node init-db.js
```

### What Gets Created

The initialization creates:

1. **rich_menus table** - Stores rich menu configurations
2. **rich_menu_areas table** - Stores interactive areas for each menu
3. **Indexes** - For optimized queries
4. **Triggers** - For automatic timestamp updates
5. **Functions** - Helper functions for database operations

## Post-Deployment Verification

After deployment, verify everything is working:

### 1. Check Application Health

```bash
curl https://your-project-name.vercel.app
```

You should see the LINE Rich Menu Maker homepage.

### 2. Check Database Connection

```bash
curl https://your-project-name.vercel.app/api/init
```

Expected response:
```json
{
  "initialized": true,
  "message": "Database is already initialized"
}
```

### 3. Test API Endpoints

```bash
# Get all menus (should return empty array initially)
curl https://your-project-name.vercel.app/api/menus

# Expected:
# {"menus":[]}
```

### 4. Test Creating a Menu

```bash
curl -X POST https://your-project-name.vercel.app/api/menus \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Menu",
    "width": 800,
    "height": 270
  }'
```

### 5. Check Vercel Function Logs

1. Go to your Vercel Dashboard
2. Select your project
3. Click **Functions** tab
4. Check for any errors in the logs

## CI/CD Setup

### Automatic Deployments with GitHub

1. **Connect GitHub to Vercel**
   - Go to Vercel Dashboard → Settings → Git
   - Click "Connect to GitHub"
   - Select your repository

2. **Configure Branches**
   - Main branch: Deploy to production
   - Pull requests: Deploy to preview URLs

3. **Set Environment Variables for PRs**
   - Use the same database credentials for preview deployments
   - Or create a separate staging database

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

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
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Add these secrets to your GitHub repository:
- `VERCEL_TOKEN` - Create at vercel.com/account/tokens
- `VERCEL_ORG_ID` - Get from Vercel Dashboard
- `VERCEL_PROJECT_ID` - Get from Vercel Dashboard

## Monitoring and Maintenance

### Vercel Analytics

1. Go to your project in Vercel Dashboard
2. Click **Analytics** tab
3. Enable Analytics to track:
   - Page views
   - Visitors
   - Performance metrics
   - Error rates

### Error Tracking

Consider integrating error tracking:

**Sentry Setup:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Add to your environment variables:
```
SENTRY_DSN=your-sentry-dsn
```

### Database Backups

DigitalOcean automatically backs up your PostgreSQL database. To manually backup:

```bash
# Using Vercel CLI in production
vercel exec bash --prod

# In the shell
pg_dump $DATABASE_URL > backup.sql

# Or download locally
pg_dump "postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require" > backup.sql
```

### Performance Optimization

1. **Enable Edge Functions** (if needed)
   ```javascript
   export const config = {
     runtime: 'edge',
   }
   ```

2. **Cache API Responses**
   ```javascript
   export async function GET() {
     return new Response(JSON.stringify(data), {
       headers: {
         'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
       }
     });
   }
   ```

3. **Monitor Database Connections**
   - Check connection pool usage
   - Adjust pool size in `lib/db.ts` if needed

## Troubleshooting

### Common Issues

#### 1. Database Connection Timeout

**Symptoms:**
- API calls return 504 errors
- "Database connection timeout" in logs

**Solutions:**
```bash
# Test connection from local machine
psql "postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

# If connection works locally but not on Vercel:
# 1. Check if database allows connections from Vercel IPs
# 2. Verify SSL configuration
# 3. Check Vercel's network settings
```

#### 2. Build Fails

**Symptoms:**
- Deployment fails during build step
- TypeScript or lint errors

**Solutions:**
```bash
# Build locally first to catch errors
npm run build
npm run lint

# Fix any errors before deploying
# Clear Vercel cache in Dashboard → Settings → Git → Ignored Build Step
```

#### 3. Environment Variables Not Loading

**Symptoms:**
- Database connection errors
- `process.env.DATABASE_URL` is undefined

**Solutions:**
```bash
# Verify variables are set
vercel env ls

# Redeploy after setting variables
vercel --prod

# Check next.config.js has the variables
```

#### 4. API Routes Not Working

**Symptoms:**
- 404 errors on API endpoints
- Next.js routing issues

**Solutions:**
```json
// Check vercel.json configuration
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 5. Export Functionality Fails

**Symptoms:**
- Cannot export menu as image
- html2canvas errors

**Solutions:**
```javascript
// Ensure the canvas element has proper styling
// Check browser console for CORS errors
// Test in different browsers
```

### Getting Help

If you encounter issues:

1. **Check Vercel Logs**
   - Dashboard → Functions → Logs
   - Look for error messages and stack traces

2. **Check DigitalOcean Database Logs**
   - Login to DigitalOcean dashboard
   - Navigate to Databases → Your database → Logs

3. **Test Locally**
   - Reproduce the issue locally with the same database
   - This helps isolate if it's a deployment-specific issue

4. **Verify Configuration**
   ```bash
   # List all environment variables
   vercel env ls
   
   # Check build output
   vercel logs --prod
   ```

5. **Rollback Deployment**
   ```bash
   # Rollback to previous successful deployment
   vercel rollback --prod
   ```

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [DigitalOcean Database Docs](https://docs.digitalocean.com/products/databases/)
- [GitHub Issues](https://github.com/your-repo/issues)

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use Vercel Environment Variables** for sensitive data
3. **Enable HTTPS** (automatic on Vercel)
4. **Monitor for security vulnerabilities**
   ```bash
   npm audit
   ```
5. **Regular dependency updates**
   ```bash
   npm update
   ```
6. **Review Vercel security settings**
   - Enable password protection for preview deployments
   - Use Vercel's analytics to detect anomalies

## Scaling Considerations

As your application grows:

1. **Database Scaling**
   - Monitor connection pool usage
   - Consider connection pooling services (PgBouncer, Neon)
   - Implement caching layer (Redis)

2. **Performance Optimization**
   - Implement API response caching
   - Use CDN for static assets
   - Optimize database queries with indexes

3. **Rate Limiting**
   ```javascript
   // Add rate limiting to API routes
   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";
   ```

## Conclusion

Your LINE Rich Menu Maker is now deployed to Vercel! 

Remember to:
- Monitor application performance
- Keep dependencies updated
- Backup your database regularly
- Review logs for errors

For additional help, refer to the main [README.md](./README.md) file.