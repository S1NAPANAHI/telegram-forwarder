# Modern Telegram Bot Admin Interface

A comprehensive, modern admin panel for managing your Telegram forwarder bot with enhanced UI/UX and real-time monitoring capabilities.

## 🚀 Features

### Core Functionality
- **Dashboard Overview**: Real-time statistics and performance metrics
- **Keywords Management**: Full CRUD operations with advanced filtering
- **Channel Monitoring**: Telegram and Eitaa channel management
- **Destinations Control**: Configure forwarding destinations
- **Analytics Dashboard**: Interactive charts and data visualization
- **Real-time Monitoring**: Live activity feeds and notifications

### Modern UI/UX
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Modern data tables with search, sort, and pagination
- **Real-time Charts**: Dynamic data visualization using Recharts
- **Professional Design**: Clean, modern interface following 2025 design trends
- **Accessibility**: Full keyboard navigation and screen reader support

### Technical Features
- **Next.js 15**: Latest React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **React Query**: Advanced data fetching and caching
- **Heroicons**: Beautiful SVG icons
- **i18next**: Internationalization support (English/Persian)
- **Component Architecture**: Reusable, modular components

## 📁 Project Structure

```
frontend/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout with sidebar and header
│   ├── StatCard.tsx     # Statistics display cards
│   └── DataTable.tsx    # Advanced data table component
├── pages/               # Next.js pages
│   ├── dashboard-new.tsx # Enhanced dashboard
│   ├── keywords.tsx     # Keywords management
│   ├── analytics.tsx    # Analytics dashboard
│   └── ...
├── styles/              # CSS styles
│   └── globals.css      # Global styles with dark mode
└── context/             # React contexts
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main brand color
- **Success**: Green (#10B981) - Success states
- **Warning**: Amber (#F59E0B) - Warning states
- **Danger**: Red (#EF4444) - Error states
- **Gray Scale**: Comprehensive gray palette for text and UI elements

### Components
- **StatCard**: Enhanced statistics cards with loading states and change indicators
- **DataTable**: Advanced table with search, sorting, pagination, and actions
- **Layout**: Responsive layout with collapsible sidebar and dark mode toggle
- **Navigation**: Intuitive navigation with active states and breadcrumbs

## 📊 Key Pages

### Enhanced Dashboard (`dashboard-new.tsx`)
- Real-time statistics cards
- Interactive activity charts (7-day trends)
- Recent activity table with status indicators
- Quick keyword addition modal
- Top keyword performance metrics

### Keywords Management (`keywords.tsx`)
- Complete CRUD operations (Create, Read, Update, Delete)
- Advanced filtering and search
- Bulk operations support
- Settings configuration (case sensitive, exact match)
- Performance metrics per keyword

### Analytics Dashboard (`analytics.tsx`)
- Interactive charts with multiple metrics
- Time range selection (7d, 30d, 90d)
- Keyword performance analysis
- Channel activity monitoring
- Activity heatmap by hour
- Data export functionality

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Configure your API endpoints
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend API URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000  # Frontend URL
```

### Theme Configuration
The app automatically detects system theme preferences and allows manual switching. Theme preference is persisted in localStorage.

### Internationalization
Supports English and Persian (Farsi) languages. Language switching maintains user preference across sessions.

## 🚀 Integration with Existing Backend

The new UI components are designed to work with your existing API endpoints:

- `GET /api/keywords` - Fetch keywords
- `POST /api/keywords` - Create keyword
- `PUT /api/keywords/:id` - Update keyword
- `DELETE /api/keywords/:id` - Delete keyword
- `GET /api/channels` - Fetch channels
- `GET /api/logs` - Fetch activity logs
- `GET /api/analytics` - Fetch analytics data

## 📱 Responsive Design

The interface is fully responsive and optimized for:
- **Desktop**: Full sidebar layout with all features
- **Tablet**: Collapsible sidebar with touch-optimized interactions
- **Mobile**: Mobile-first design with slide-out navigation

## 🎯 Usage Instructions

1. **Replace Current Dashboard**: Rename `dashboard-new.tsx` to `dashboard.tsx`
2. **Update Layout**: Wrap your existing pages with the new `Layout` component
3. **Use Components**: Replace existing components with the new enhanced versions
4. **Apply Styles**: The global CSS includes dark mode and modern styling
5. **Test Integration**: Verify API integration with the enhanced data handling

## 🔄 Migration from Old UI

To migrate from your current interface:

1. **Backup Current Files**: Save your existing pages as `.old` files
2. **Replace Components**: Use the new component structure
3. **Update API Calls**: Ensure API integration matches the new data handling
4. **Test Functionality**: Verify all features work with the enhanced UI
5. **Apply Custom Branding**: Modify colors and branding in the Tailwind config

## 🤝 Contributing

This modern interface provides a solid foundation for your Telegram bot admin panel. You can:

- Customize colors and branding in `tailwind.config.js`
- Add new features by extending the existing components
- Integrate additional analytics and monitoring features
- Enhance the mobile experience further

## 📄 License

This interface enhancement maintains compatibility with your existing project structure while providing a modern, professional admin experience.

---

**Note**: This interface is designed to replace your current frontend while maintaining full compatibility with your existing backend infrastructure. All API endpoints and data structures remain unchanged.