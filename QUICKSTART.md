# Quick Start Guide

Get your LINE Rich Menu Maker up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

### 1. Install Dependencies

```bash
cd bookchaowalit-linerichmenu-frontend
npm install
```

### 2. Configure Environment

The database credentials are already configured in `.env.local`. You can verify them:

```bash
cat .env.local
```

Your DigitalOcean PostgreSQL database is ready to use with these credentials:
- **Host**: `db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com`
- **Port**: `25060`
- **User**: `doadmin`
- **Database**: `defaultdb`
- **SSL**: Required

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 5. Initialize Database

On first load, you'll see a warning banner. Click **"Initialize Database"** to set up the tables.

That's it! Your app is ready. 🎉

## Basic Usage

### Create Your First Menu

1. Click **"New Menu"**
2. Enter a name (e.g., "My Menu")
3. Select a size (Small is default: 800×270px)
4. Click **"Create Menu"**

### Add Interactive Areas

1. In the editor, click and drag on the canvas to create an area
2. Configure the action:
   - **Message**: Send text to user
   - **URI**: Open a webpage
   - **Postback**: Send data to your server
   - And more...
3. Click **"Save Menu"**

### Export Your Menu

1. Click **"Export"** button in the editor
2. Choose PNG or JPEG format
3. The image downloads automatically

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Build and start production server
npm run prod
```

## Project Structure

```
bookchaowalit-linerichmenu-frontend/
├── app/
│   ├── api/          # API routes (Vercel functions)
│   └── page.tsx      # Main page
├── components/
│   ├── editor/       # Rich menu editor
│   └── ui/           # Shadcn UI components
├── lib/
│   ├── db.ts         # Database client
│   └── types.ts      # TypeScript types
└── public/           # Static assets
```

## Features

✅ **Visual Editor** - Drag and drop to create menu areas  
✅ **Multiple Sizes** - Small, Mini, Medium, Large  
✅ **Database Storage** - Save and retrieve menus  
✅ **Export** - Download as PNG or JPEG  
✅ **Full CRUD** - Create, read, update, delete menus  
✅ **Responsive** - Works on desktop and mobile  

## Supported Menu Sizes

| Size | Width | Height |
|------|-------|--------|
| Small | 800px | 270px |
| Mini | 800px | 540px |
| Medium | 2500px | 843px |
| Large | 2500px | 1686px |

## Action Types

- **Message** - Send text message
- **Postback** - Send data to server
- **URI** - Open web link
- **Datetimepicker** - Date/time selection
- **Camera** - Open camera
- **Camera Roll** - Open photo gallery
- **Location** - Request location

## Troubleshooting

### Database Connection Error

```bash
# Test connection locally
psql "postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

### Port Already in Use

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

- 📖 Read the full [README.md](./README.md) for detailed documentation
- 🚀 Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel
- 🎨 Start creating your rich menus!

## Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Review the [README.md](./README.md) troubleshooting section
3. Ensure your database credentials are correct
4. Verify you're using Node.js 18+

## Database Management

### Reset Database

```bash
# Delete and recreate tables
curl -X POST http://localhost:3000/api/init
```

### Check Database Status

```bash
curl http://localhost:3000/api/init
```

### View All Menus

```bash
curl http://localhost:3000/api/menus
```

Happy creating! 🎨✨