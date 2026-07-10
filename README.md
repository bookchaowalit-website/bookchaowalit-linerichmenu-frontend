# LINE Rich Menu Maker

A modern web application for creating, editing, and managing LINE rich menus. Built with Next.js 14, Shadcn UI, Tailwind CSS, and PostgreSQL.

## Features

- 🎨 **Visual Editor**: Intuitive drag-and-drop interface for creating rich menu areas
- 📱 **Multiple Menu Sizes**: Support for all LINE rich menu sizes (Small, Mini, Medium, Large)
- 🗄️ **Database Storage**: PostgreSQL backend for persistent menu storage
- 🔄 **Full CRUD Operations**: Create, read, update, and delete rich menus
- 🎯 **Action Types**: Support for message, postback, URI, datetime picker, camera, camera roll, and location actions
- 📥 **Export Functionality**: Export menus as PNG or JPEG images
- 🌐 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Vercel Deployment**: Optimized for Vercel platform with serverless functions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: Shadcn UI, Radix UI primitives
- **Styling**: Tailwind CSS, Tailwind Animate
- **Database**: PostgreSQL with node-postgres
- **Deployment**: Vercel (serverless functions)
- **Image Export**: html2canvas
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or use DigitalOcean managed database)
- npm or yarn package manager
- Vercel account (for deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookchaowalit-linerichmenu-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://doadmin:AVNS_fSdVchp9k4CbGWGAVRP@db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com:25060/defaultdb?sslmode=require
   DATABASE_USER=doadmin
   DATABASE_PASSWORD=AVNS_fSdVchp9k4CbGWGAVRP
   DATABASE_HOST=db-postgresql-sgp1-04384-do-user-16924107-0.f.db.ondigitalocean.com
   DATABASE_PORT=25060
   DATABASE_NAME=defaultdb
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Initialize the database**
   - On first load, you'll see a "Database Not Initialized" warning
   - Click the "Initialize Database" button to set up the required tables
   - This will create the `rich_menus` and `rich_menu_areas` tables

## Database Schema

The application uses two main tables:

### rich_menus
- `id`: Serial primary key
- `name`: Menu name (varchar 255)
- `width`: Menu width in pixels
- `height`: Menu height in pixels
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### rich_menu_areas
- `id`: Serial primary key
- `rich_menu_id`: Foreign key to rich_menus
- `x`, `y`: Area position coordinates
- `width`, `height`: Area dimensions
- `action_type`: Type of action (message, postback, uri, etc.)
- `action_data`: JSONB data for action configuration
- `order_index`: Display order
- `created_at`, `updated_at`: Timestamps

## API Routes

### GET /api/menus
Get all rich menus with their areas.

**Response:**
```json
{
  "menus": [
    {
      "id": 1,
      "name": "My Menu",
      "width": 800,
      "height": 270,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "areas": [...]
    }
  ]
}
```

### POST /api/menus
Create a new rich menu.

**Body:**
```json
{
  "name": "My Menu",
  "width": 800,
  "height": 270
}
```

### GET /api/menus/[id]
Get a specific rich menu with areas.

### PUT /api/menus/[id]
Update a rich menu.

**Body:**
```json
{
  "name": "Updated Menu",
  "width": 800,
  "height": 270,
  "areas": [...]
}
```

### DELETE /api/menus/[id]
Delete a rich menu.

### GET /api/init
Check database initialization status.

### POST /api/init
Initialize database tables.

## Deployment to Vercel

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
   vercel
   ```
   
   Follow the prompts and confirm all settings.

4. **Set Environment Variables**
   
   Go to your Vercel project dashboard:
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     - `DATABASE_URL`
     - `DATABASE_USER`
     - `DATABASE_PASSWORD`
     - `DATABASE_HOST`
     - `DATABASE_PORT`
     - `DATABASE_NAME`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

6. **Initialize Database**
   - Open your deployed site
   - Click "Initialize Database" if prompted
   - Alternatively, call the initialization endpoint:
     ```bash
     curl -X POST https://your-app.vercel.app/api/init
     ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Full PostgreSQL connection string | Yes |
| `DATABASE_USER` | Database username | Yes |
| `DATABASE_PASSWORD` | Database password | Yes |
| `DATABASE_HOST` | Database host address | Yes |
| `DATABASE_PORT` | Database port | Yes |
| `DATABASE_NAME` | Database name | Yes |

## LINE Rich Menu Sizes

| Size | Width | Height | Description |
|------|-------|--------|-------------|
| Small | 800px | 270px | Default size |
| Mini | 800px | 540px | Small tall |
| Medium | 2500px | 843px | Medium landscape |
| Large | 2500px | 1686px | Large landscape |

## Action Types

- **message**: Send a text message
- **postback**: Send postback data to server
- **uri**: Open a web URL
- **datetimepicker**: Open date/time picker
- **camera**: Open camera
- **cameraroll**: Open camera roll
- **location**: Request location

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL database

**Solutions**:
1. Verify database credentials are correct
2. Check if SSL is required (most managed databases require it)
3. Ensure database allows connections from your IP
4. Test connection locally:
   ```bash
   psql "postgresql://doadmin:password@host:port/dbname?sslmode=require"
   ```

### Build Errors

**Problem**: Next.js build fails

**Solutions**:
1. Clear cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run lint`

### Export Issues

**Problem**: Cannot export menu as image

**Solutions**:
1. Ensure browser supports canvas (Chrome, Firefox, Safari, Edge)
2. Check for CORS issues with images
3. Try different export format (PNG vs JPEG)

### Vercel Deployment Issues

**Problem**: Deployment fails or database errors

**Solutions**:
1. Verify all environment variables are set in Vercel dashboard
2. Check Vercel function logs
3. Ensure database is accessible from Vercel's IP ranges
4. Initialize database after deployment

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
bookchaowalit-linerichmenu-frontend/
├── app/
│   ├── api/
│   │   ├── init/
│   │   └── menus/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── editor/
│   │   └── RichMenuEditor.tsx
│   └── ui/
├── lib/
│   ├── db.ts
│   ├── schema.sql
│   ├── types.ts
│   └── utils.ts
├── public/
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [PostgreSQL](https://www.postgresql.org/)
- Deployed on [Vercel](https://vercel.com/)

## Related

- **Mobile App:** [bookchaowalit-linerichmenu-mobile](https://github.com/bookchaowalit-mobile/bookchaowalit-linerichmenu-mobile)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

