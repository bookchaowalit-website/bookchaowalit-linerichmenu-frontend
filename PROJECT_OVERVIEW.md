# LINE Rich Menu Maker - Project Overview

## Executive Summary

The LINE Rich Menu Maker is a modern web application designed to simplify the creation, management, and deployment of LINE rich menus. Built with cutting-edge technologies including Next.js 14, Shadcn UI, and PostgreSQL, this application provides an intuitive drag-and-drop interface for designing interactive rich menus that can be exported as images or integrated with LINE's messaging API.

## Project Vision

To provide developers and businesses with an accessible, powerful tool for creating professional LINE rich menus without requiring deep knowledge of LINE's API specifications or manual JSON configuration.

## Core Features

### 1. **Visual Menu Editor**
- Intuitive drag-and-drop interface
- Real-time area creation and manipulation
- Canvas-based drawing with mouse interactions
- Area selection, editing, and deletion
- Preview mode for final layout verification

### 2. **Rich Menu Management**
- Full CRUD operations for menus
- Menu metadata management (name, size, dimensions)
- Multiple menu support with search and filtering
- Persistent storage in PostgreSQL database
- Automatic timestamp tracking

### 3. **Interactive Areas**
- Seven action types supported:
  - **Message**: Send text messages to users
  - **Postback**: Send structured data to server
  - **URI**: Open web links in browser
  - **Datetimepicker**: Date and time selection
  - **Camera**: Device camera access
  - **Camera Roll**: Photo gallery access
  - **Location**: User location request
- Flexible positioning and sizing
- Action-specific configuration dialogs

### 4. **Export Functionality**
- Export to PNG format (lossless)
- Export to JPEG format (compressed)
- High-resolution output (2x scale)
- Automatic filename generation
- Browser-based export using html2canvas

### 5. **Multiple Menu Sizes**
- **Small**: 800 × 270px (default)
- **Mini**: 800 × 540px
- **Medium**: 2500 × 843px
- **Large**: 2500 × 1686px
- Predefined presets for LINE specifications
- Custom size support

## Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development

### UI Components
- **Shadcn UI**: Accessible, customizable components
- **Radix UI**: Unstyled, accessible primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional styling utilities

### Backend & Database
- **PostgreSQL**: Relational database
- **node-postgres (pg)**: PostgreSQL client for Node.js
- **Vercel Serverless Functions**: API endpoints
- **Connection Pooling**: Optimized database connections

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking
- **Git**: Version control

### Deployment
- **Vercel**: Hosting platform
- **Docker**: Containerization support
- **Continuous Integration**: GitHub Actions ready

## Architecture Overview

### Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Page Layer   │  │ Component     │  │ UI Components  │  │
│  │               │  │ Layer         │  │               │  │
│  │ - Main Page   │  │ - RichMenu    │  │ - Button      │  │
│  │ - Editor Page │  │   Editor      │  │ - Dialog      │  │
│  │               │  │ - Menu List   │  │ - Card        │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Serverless Functions                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  GET  /api/menus          - List all menus          │    │
│  │  POST /api/menus          - Create new menu         │    │
│  │  GET  /api/menus/[id]     - Get specific menu       │    │
│  │  PUT  /api/menus/[id]     - Update menu             │    │
│  │  DELETE /api/menus/[id]   - Delete menu             │    │
│  │  GET  /api/init           - Check DB status         │    │
│  │  POST /api/init           - Initialize DB           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Table: rich_menus                                   │    │
│  │    - id, name, width, height                        │    │
│  │    - created_at, updated_at                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Table: rich_menu_areas                              │    │
│  │    - id, rich_menu_id                               │    │
│  │    - x, y, width, height                           │    │
│  │    - action_type, action_data (JSONB)              │    │
│  │    - order_index, created_at, updated_at            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → Frontend Component
2. **State Update** → React State Management
3. **API Call** → Fetch/Axios to Serverless Function
4. **Database Query** → PostgreSQL via node-postgres
5. **Response** → Processed and returned to Frontend
6. **UI Update** → React re-renders with new data

### Component Hierarchy

```
App
├── Page (app/page.tsx)
│   ├── MenuList
│   │   ├── MenuCard
│   │   └── NewMenuDialog
│   ├── RichMenuEditor (components/editor/RichMenuEditor.tsx)
│   │   ├── MenuSettings
│   │   ├── CanvasEditor
│   │   │   ├── MenuCanvas
│   │   │   ├── AreaComponent
│   │   │   └── NewAreaPreview
│   │   └── AreasPanel
│   │       ├── AreaList
│   │       └── AreaEditorDialog
│   └── Notifications
└── UI Components (components/ui/)
    ├── Button, Dialog, Input
    ├── Card, Select, Label
    └── Toast (for notifications)
```

## Database Schema

### rich_menus Table
Stores the main menu configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Menu display name |
| width | INTEGER | Canvas width in pixels |
| height | INTEGER | Canvas height in pixels |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### rich_menu_areas Table
Stores interactive areas for each menu.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| rich_menu_id | INTEGER | Foreign key to rich_menus |
| x | INTEGER | X coordinate |
| y | INTEGER | Y coordinate |
| width | INTEGER | Area width |
| height | INTEGER | Area height |
| action_type | VARCHAR(50) | Type of action |
| action_data | JSONB | Action configuration |
| order_index | INTEGER | Display order |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Indexes
- `idx_rich_menus_created_at`: Optimizes menu listing queries
- `idx_rich_menu_areas_rich_menu_id`: Fast area lookup by menu
- `idx_rich_menu_areas_order_index`: Ordered area retrieval

## API Reference

### Menu Endpoints

#### GET /api/menus
Retrieve all rich menus with their areas.

**Response:**
```json
{
  "menus": [
    {
      "id": 1,
      "name": "Main Menu",
      "width": 800,
      "height": 270,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "areas": [...]
    }
  ]
}
```

#### POST /api/menus
Create a new rich menu.

**Request Body:**
```json
{
  "name": "New Menu",
  "width": 800,
  "height": 270
}
```

**Response:**
```json
{
  "menu": {
    "id": 2,
    "name": "New Menu",
    "width": 800,
    "height": 270,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/menus/[id]
Retrieve a specific menu with all areas.

#### PUT /api/menus/[id]
Update an existing menu and its areas.

**Request Body:**
```json
{
  "name": "Updated Menu",
  "width": 800,
  "height": 270,
  "areas": [
    {
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 270,
      "action_type": "message",
      "action_data": {
        "type": "message",
        "text": "Hello!"
      },
      "order_index": 0
    }
  ]
}
```

#### DELETE /api/menus/[id]
Delete a menu and all its areas (cascade delete).

### Database Endpoints

#### GET /api/init
Check database initialization status.

**Response:**
```json
{
  "initialized": true,
  "message": "Database is already initialized"
}
```

#### POST /api/init
Initialize database tables and create necessary structures.

**Response:**
```json
{
  "message": "Database initialized successfully",
  "statementsExecuted": 7
}
```

## Key Components

### RichMenuEditor
The core editor component that provides:
- Canvas rendering with scale support
- Mouse event handling for drawing and dragging
- Area management (create, edit, delete)
- Export functionality
- Preview mode toggle

**Key Methods:**
- `handleMouseDown()`: Start drawing or dragging
- `handleMouseMove()`: Update area dimensions or position
- `handleMouseUp()`: Finalize area creation
- `handleExport()`: Generate image using html2canvas
- `handleAddArea()`: Add new area to menu

### Database Client
Singleton PostgreSQL connection pool with:
- Automatic connection management
- Query logging and error handling
- Transaction support
- SSL configuration for secure connections

### Type System
Comprehensive TypeScript types for:
- Rich menu configuration
- Area specifications
- Action data structures
- API request/response schemas

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env.local`
3. Start dev server: `npm run dev`
4. Open browser: `http://localhost:3000`
5. Initialize database via UI or API

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Pre-commit hooks for validation

### Testing Strategy
- Manual testing of all features
- API endpoint verification
- Database operation testing
- Cross-browser compatibility checks

## Deployment Strategy

### Vercel Deployment
1. **Build Process**: Next.js optimized build
2. **Serverless Functions**: API routes deployed as Edge functions
3. **Environment Variables**: Secure credential management
4. **Automatic HTTPS**: SSL certificates included
5. **Global CDN**: Fast content delivery

### Environment Configuration
- **Development**: Local development server
- **Preview**: Pull request deployments
- **Production**: Main branch deployment

### Continuous Integration
- Automated builds on push
- Preview deployments for PRs
- Production deployments on merge to main
- Rollback capability for failed deployments

## Security Considerations

### Database Security
- SSL-only connections
- Credentials stored in environment variables
- Connection pooling with limits
- Query parameterization to prevent SQL injection

### API Security
- Environment variable validation
- Input sanitization
- Error message sanitization
- Request size limits

### Frontend Security
- Content Security Policy headers
- XSS prevention via React
- HTTPS enforcement
- Secure cookie handling

## Performance Optimization

### Frontend
- React.memo for component optimization
- Lazy loading where applicable
- Image optimization via Next.js
- Code splitting for smaller bundles

### Backend
- Connection pooling for database
- Query optimization with indexes
- Response caching where appropriate
- Edge function deployment

### Database
- Indexed queries for fast lookups
- Connection pool management
- Efficient data structures (JSONB)
- Regular maintenance routines

## Future Enhancements

### Planned Features
1. **Image Upload**: Background image support for menus
2. **Templates**: Pre-built menu templates
3. **Collaboration**: Multi-user editing
4. **Version Control**: Menu version history
5. **Direct LINE Integration**: Push to LINE API
6. **Analytics**: Usage tracking and statistics
7. **Undo/Redo**: Editor state management
8. **Keyboard Shortcuts**: Power user features
9. **Dark Mode**: Theme switching
10. **Mobile App**: Native mobile application

### Technical Improvements
1. **WebSocket Support**: Real-time collaboration
2. **Redis Caching**: Faster data access
3. **Advanced Search**: Full-text search for menus
4. **Export Options**: More formats and settings
5. **Accessibility**: WCAG AA compliance
6. **Testing**: Unit and integration tests
7. **Monitoring**: Application performance monitoring
8. **Documentation**: API documentation with Swagger

## Project Metrics

### Code Statistics
- **Total Files**: ~50
- **Lines of Code**: ~5,000
- **Components**: 20+
- **API Endpoints**: 7
- **Database Tables**: 2
- **Dependencies**: 25

### Performance Targets
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Database Query**: < 100ms
- **Export Time**: < 3 seconds
- **Editor Responsiveness**: 60 FPS

## Team and Responsibilities

### Development Team
- **Frontend Development**: React, Next.js, UI components
- **Backend Development**: API routes, database schema
- **DevOps**: Deployment, CI/CD, monitoring
- **Design**: UX/UI design, accessibility

### Project Status
- **Phase**: Complete (MVP)
- **Last Updated**: 2024
- **Version**: 1.0.0
- **Status**: Production Ready

## Documentation

### Available Documentation
- `README.md`: Main project documentation
- `QUICKSTART.md`: Quick start guide
- `DEPLOYMENT.md`: Deployment instructions
- `PROJECT_OVERVIEW.md`: This document
- Code comments: In-code documentation

### Support Channels
- GitHub Issues: Bug reports and feature requests
- Email: Support contact
- Documentation: Comprehensive guides and API reference

## Conclusion

The LINE Rich Menu Maker represents a modern, scalable solution for LINE rich menu management. With its intuitive interface, robust architecture, and comprehensive feature set, it provides developers and businesses with a powerful tool for creating engaging LINE messaging experiences.

The application is production-ready, fully documented, and designed for future growth and enhancement. Its modular architecture allows for easy extension and customization to meet specific business requirements.

---

**Project Repository**: [GitHub Repository URL]  
**Live Demo**: [Deployment URL]  
**Version**: 1.0.0  
**Last Updated**: 2024