# CatIQz - The Intelligence Behind Market Moves

A polished, responsive, invite-only web application that fetches live data from a Supabase backend, displays AI-summarized market catalysts, and enables users to save/bookmark events and stocks.

## 🎯 Features

### Core Functionality
- **Invite-Only Access**: Token-based signup with admin bypass
- **Live Market Data**: Real-time event feed from multiple sources
- **AI Summaries**: LLM-powered market catalyst analysis
- **Stock Analyzer**: Comprehensive technical and fundamental analysis
- **Macro Calendar**: Economic events with AI predictions
- **Saved Collections**: Bookmark events and stocks with notes and tags
- **Dark/Light Theme**: Full theme customization

### Pages
1. **Invite Landing** - Token validation and user onboarding
2. **Dashboard** - 3-column layout with live feed, filters, and insights
3. **Stock Analyzer** - Deep dive into individual stocks
4. **Macro Calendar** - Economic event calendar with AI summaries
5. **Saved Collections** - Personal collection management
6. **Settings/Admin** - User preferences and admin panel

## 🏗️ Architecture

### Frontend Stack
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Shadcn/UI** component library
- **React Router** for navigation

### Component Library

#### Core Components
- `EventCard` - Display market catalyst events
- `StockCard` - Stock summary with sparkline
- `SectorHeatmap` - Visual sector performance
- `EventDetailModal` - Full event analysis view
- `TinyChart` / `Sparkline` - Compact price charts
- `SkeletonLoader` - Loading states

#### Utility Files
- `/utils/api.ts` - API integration layer
- `/utils/theme.tsx` - Theme management context
- `/utils/auth.tsx` - Authentication context

## 🔌 Backend Integration

### Required API Endpoints

Your backend should provide these endpoints:

```
GET  /api/events?since=<ISO>&impact=<level>&sector=<name>&country=<code>
GET  /api/stocks/:ticker
GET  /api/calendar?country=<code>&from=<ISO>&to=<ISO>
POST /api/invite/validate?token=<token>
POST /api/auth/login
POST /api/saved
GET  /api/saved
DELETE /api/saved/:id
POST /api/refresh
```

### Event Object Schema

```typescript
{
  id: string
  title: string
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  impact_level: 'High' | 'Medium' | 'Low'
  probability: number
  affected_sectors: string[]
  affected_symbols: string[]
  sources: Array<{ name: string; url: string; ts: string }>
  reasoning: string
  model_used: string
  provenance: {
    weights: Record<string, number>
    similar_event_ids: string[]
  }
  timestamp: string
}
```

## 🚀 Getting Started

### Quick Start with Demo Data

The application automatically initializes with demo data on first load. You can login with:

**Demo Credentials:**
- Email: `demo@catiqz.com`
- Password: `demo123`

This demo user has admin privileges and can access all features including invite token management.

**Available Demo Invite Token:**
- Token: `demo-invite-001`

### How It Works

1. **First Load**: Demo data is automatically populated in the Supabase backend
2. **Login**: Use the demo credentials above to access the app
3. **Explore**: Navigate through all features with live backend integration
4. **Test Signup**: Use the demo invite token to test the signup flow

### Backend Architecture

The application uses:
- **Supabase Edge Functions** running a Hono web server
- **Supabase KV Store** for data persistence
- Endpoints prefix: `/make-server-2dfefaa8/api/*`
- Authentication via bearer tokens

## 🎨 Design System

### Colors

**Light Mode:**
- Background: `#F7FAFC`
- Primary: `#030213`
- Accent: `#60A5FA` (Sky Blue) / `#5EEAD4` (Mint)

**Dark Mode:**
- Background: `#0F1724`
- Primary: `#FFFFFF`
- Accent: `#60A5FA` (Sky Blue) / `#5EEAD4` (Mint)

### Impact Indicators
- **High**: `#EF4444` (Red)
- **Medium**: `#F59E0B` (Amber)
- **Low**: `#94A3B8` (Slate)

### Typography
- Font Family: Inter / Poppins
- Body: 14px
- Headings: 18-24px

## 📱 Responsive Design

The application is desktop-first but includes responsive breakpoints:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## 🔐 Authentication Flow

1. User lands on invite page
2. Validates invite token via API
3. Completes onboarding (name, email, password, capital, risk profile)
4. Redirected to dashboard
5. Admin can bypass with direct login

## 🎯 Key Interactions

### Dashboard
- **Search**: Filter events by ticker or topic
- **Filters**: Impact level, sector, country
- **Refresh**: Manual data update
- **Theme Toggle**: Switch between light/dark
- **Save Event**: Bookmark with notes and tags

### Stock Analyzer
- **Search**: Enter ticker symbol
- **View Analysis**: Fundamentals, technicals, AI summary
- **Related Events**: See market events affecting the stock

### Macro Calendar
- **Date Selection**: View events for specific dates
- **Country Filter**: Filter by country
- **Event Details**: View AI predictions and affected markets

## 🛠️ Customization

### Adding New Sectors
Update the sector filter in `/pages/Dashboard.tsx`:
```typescript
<option value="NewSector">New Sector</option>
```

### Modifying Refresh Interval
Default is 5 minutes. Users can customize in Settings.

### Adding Alert Preferences
Extend the Settings page to include new notification types.

## 📊 Data Flow

1. **Frontend** makes API calls via `/utils/api.ts`
2. **Backend** fetches data from sources (Reuters, ET, SEBI, etc.)
3. **LLM** generates summaries and predictions
4. **Supabase** stores user data, saved items, and auth
5. **Frontend** displays data with real-time updates

## 🔍 API Request Examples

### Fetch High Impact Events
```javascript
const events = await api.getEvents({
  impact: 'High',
  country: 'IN'
});
```

### Get Stock Data
```javascript
const stock = await api.getStock('RELIANCE');
```

### Save Event
```javascript
await api.saveItem({
  type: 'event',
  itemId: 'evt_123',
  note: 'Important for banking sector',
  tags: ['banking', 'rates']
});
```

## 🐛 Troubleshooting

### API Connection Issues
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running and accessible
- Review browser console for CORS errors

### Authentication Not Working
- Ensure backend implements `/api/auth/login` correctly
- Verify JWT token handling
- Check localStorage for saved tokens

### Data Not Loading
- Check backend endpoint responses
- Verify API response format matches TypeScript interfaces
- Review network tab for failed requests

## 📝 License

This is a proprietary application for CatIQz. All rights reserved.

## 🤝 Support

For backend integration support or questions:
1. Review API endpoint documentation
2. Check the `/utils/api.ts` file for expected request/response formats
3. Ensure all required endpoints are implemented
4. Test endpoints with tools like Postman before frontend integration

---

**Built with ❤️ using Figma Make**
