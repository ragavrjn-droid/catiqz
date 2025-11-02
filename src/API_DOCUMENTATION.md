# CatIQz API Documentation

This document outlines the API endpoints required by the CatIQz frontend application. Your backend Node.js server should implement all these endpoints.

## Base URL

Configure in `.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

All endpoints below are relative to this base URL.

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get Events

**Endpoint:** `GET /api/events`

**Description:** Fetches market catalyst events with optional filters

**Query Parameters:**
- `since` (optional): ISO 8601 timestamp - fetch events since this time
- `impact` (optional): `High` | `Medium` | `Low` - filter by impact level
- `sector` (optional): string - filter by sector name
- `country` (optional): string - filter by country code (e.g., `IN`, `US`)

**Example Request:**
```bash
GET /api/events?since=2025-10-24T00:00:00Z&impact=High&country=IN
```

**Response Schema:**
```typescript
Array<{
  id: string
  title: string
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  impact_level: 'High' | 'Medium' | 'Low'
  probability: number // 0-100
  affected_sectors: string[]
  affected_symbols: string[]
  sources: Array<{
    name: string
    url: string
    ts: string // ISO 8601
  }>
  reasoning: string
  model_used: string
  provenance: {
    weights: Record<string, number>
    similar_event_ids: string[]
  }
  timestamp: string // ISO 8601
}>
```

**Example Response:**
```json
[
  {
    "id": "evt_123",
    "title": "RBI signals rate pause after inflation data",
    "summary": "RBI likely to hold rates due to sticky CPI; potential headwind for rate-sensitive sectors.",
    "sentiment": "bearish",
    "impact_level": "High",
    "probability": 85,
    "affected_sectors": ["Banks", "NBFC"],
    "affected_symbols": ["BANKNIFTY", "HDFCBANK", "ICICIBANK"],
    "sources": [
      {
        "name": "Reuters",
        "url": "https://reuters.com/article/...",
        "ts": "2025-10-25T09:02:00Z"
      }
    ],
    "reasoning": "Higher inflation -> central bank cautious -> short-term pressure on rate-sensitive names",
    "model_used": "mistral-instruct-1",
    "provenance": {
      "weights": {
        "source": 15,
        "regulator": 20,
        "historical": 10
      },
      "similar_event_ids": ["evt_45"]
    },
    "timestamp": "2025-10-25T09:02:00Z"
  }
]
```

---

### 2. Get Stock Data

**Endpoint:** `GET /api/stocks/:ticker`

**Description:** Fetches detailed stock information including fundamentals, technicals, and AI analysis

**Path Parameters:**
- `ticker`: Stock ticker symbol (e.g., `RELIANCE`, `TCS`)

**Example Request:**
```bash
GET /api/stocks/RELIANCE
```

**Response Schema:**
```typescript
{
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  fundamentals: {
    pe: number
    marketCap: string
    dividendYield: number
  }
  technical: {
    ma50: number
    ma200: number
    rsi: number
    macd: {
      value: number
      signal: number
    }
  }
  aiSummary: string
  sparkline: number[] // Last 14 days of closing prices
}
```

**Example Response:**
```json
{
  "ticker": "RELIANCE",
  "name": "Reliance Industries Ltd",
  "price": 2845.50,
  "change": 45.20,
  "changePercent": 1.61,
  "fundamentals": {
    "pe": 24.5,
    "marketCap": "18.2L Cr",
    "dividendYield": 0.35
  },
  "technical": {
    "ma50": 2800.00,
    "ma200": 2750.00,
    "rsi": 62,
    "macd": {
      "value": 12.5,
      "signal": 8.3
    }
  },
  "aiSummary": "RELIANCE shows strong fundamentals with stable earnings growth. Technical indicators suggest bullish momentum with RSI at 62 and price trading above both moving averages. Recent energy sector tailwinds support positive outlook.",
  "sparkline": [2800, 2810, 2815, 2820, 2830, 2825, 2835, 2840, 2838, 2842, 2845, 2843, 2845, 2845.50]
}
```

---

### 3. Get Calendar Events

**Endpoint:** `GET /api/calendar`

**Description:** Fetches macro economic calendar events

**Query Parameters:**
- `country` (optional): Country code (e.g., `IN`, `US`)
- `from` (optional): ISO 8601 date - start of date range
- `to` (optional): ISO 8601 date - end of date range

**Example Request:**
```bash
GET /api/calendar?country=IN&from=2025-10-01&to=2025-10-31
```

**Response Schema:**
```typescript
Array<{
  id: string
  date: string // ISO 8601
  country: string
  event: string
  importance: 'High' | 'Medium' | 'Low'
  forecast?: string
  previous?: string
  aiSummary: string
  affectedMarkets: string[]
}>
```

**Example Response:**
```json
[
  {
    "id": "cal_1",
    "date": "2025-10-25T10:00:00Z",
    "country": "IN",
    "event": "RBI Monetary Policy Decision",
    "importance": "High",
    "forecast": "6.50%",
    "previous": "6.50%",
    "aiSummary": "Expected to maintain status quo on rates due to persistent inflation concerns",
    "affectedMarkets": ["Banks", "Fixed Income", "Currency"]
  }
]
```

---

### 4. Validate Invite Token

**Endpoint:** `POST /api/invite/validate`

**Description:** Validates an invite token for new user signup

**Query Parameters:**
- `token`: The invite token to validate

**Example Request:**
```bash
POST /api/invite/validate?token=INV-2024-ABC123
```

**Response Schema:**
```typescript
{
  valid: boolean
  message?: string
}
```

**Example Response:**
```json
{
  "valid": true
}
```

Or if invalid:
```json
{
  "valid": false,
  "message": "Token expired or already used"
}
```

---

### 5. Admin Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates admin user (bypasses invite requirement)

**Request Body:**
```typescript
{
  email: string
  password: string
}
```

**Example Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@catiqz.com",
  "password": "securepassword"
}
```

**Response Schema:**
```typescript
{
  token: string
  user: {
    id: string
    email: string
    name: string
    isAdmin: boolean
    capital?: number
    riskProfile?: string
  }
}
```

**Example Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "admin@catiqz.com",
    "name": "Admin User",
    "isAdmin": true
  }
}
```

---

### 6. Save Item

**Endpoint:** `POST /api/saved`

**Description:** Saves an event or stock to user's collection

**Authentication:** Required

**Request Body:**
```typescript
{
  type: 'event' | 'stock'
  itemId: string
  note?: string
  tags?: string[]
}
```

**Example Request:**
```bash
POST /api/saved
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "event",
  "itemId": "evt_123",
  "note": "Important for banking sector analysis",
  "tags": ["banking", "rates", "watchlist"]
}
```

**Response Schema:**
```typescript
{
  id: string
  type: 'event' | 'stock'
  itemId: string
  note?: string
  tags?: string[]
  savedAt: string // ISO 8601
  data: Event | Stock // Full event or stock object
}
```

---

### 7. Get Saved Items

**Endpoint:** `GET /api/saved`

**Description:** Retrieves all saved items for the authenticated user

**Authentication:** Required

**Example Request:**
```bash
GET /api/saved
Authorization: Bearer <token>
```

**Response Schema:**
```typescript
Array<{
  id: string
  type: 'event' | 'stock'
  itemId: string
  note?: string
  tags?: string[]
  savedAt: string
  data: Event | Stock
}>
```

---

### 8. Delete Saved Item

**Endpoint:** `DELETE /api/saved/:id`

**Description:** Removes a saved item from user's collection

**Authentication:** Required

**Path Parameters:**
- `id`: ID of the saved item

**Example Request:**
```bash
DELETE /api/saved/saved_123
Authorization: Bearer <token>
```

**Response:** 204 No Content

---

### 9. Manual Refresh

**Endpoint:** `POST /api/refresh`

**Description:** Triggers immediate data fetch from all sources

**Authentication:** Required (Admin only recommended)

**Example Request:**
```bash
POST /api/refresh
Authorization: Bearer <token>
```

**Response Schema:**
```typescript
{
  success: boolean
  message?: string
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Data refresh initiated"
}
```

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- **200 OK**: Successful GET/POST
- **201 Created**: Successful resource creation
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

**Error Response Format:**
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

---

## Rate Limiting

Recommended rate limits:
- `/api/events`: 60 requests/minute
- `/api/stocks/:ticker`: 120 requests/minute
- `/api/calendar`: 60 requests/minute
- `/api/saved`: 120 requests/minute
- `/api/refresh`: 1 request/5 minutes

---

## CORS Configuration

Your backend should allow requests from the frontend domain:

```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

---

## Backend Implementation Notes

### LLM Integration

Events should include AI-generated summaries. Recommended approach:

1. Fetch raw data from sources (Reuters, Economic Times, SEBI, etc.)
2. Process with LLM (e.g., Mistral, GPT-4) to generate:
   - Summary
   - Sentiment analysis
   - Impact prediction
   - Reasoning
   - Affected sectors/symbols
3. Store in Supabase with provenance data

### Supabase Schema

Recommended tables:
- `events`: Market catalyst events
- `stocks`: Stock data cache
- `calendar_events`: Macro economic events
- `saved_items`: User saved collections
- `users`: User accounts and profiles
- `invite_tokens`: Invite token management

### Caching Strategy

- Cache stock data for 5 minutes
- Cache events for 2 minutes
- Real-time updates for high-impact events
- Use Redis or Supabase for caching

---

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Test get events
curl -X GET "http://localhost:3000/api/events?impact=High"

# Test get stock
curl -X GET "http://localhost:3000/api/stocks/RELIANCE"

# Test save item (with auth)
curl -X POST "http://localhost:3000/api/saved" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"event","itemId":"evt_123","note":"Test note"}'
```

---

## Support

For integration questions or issues, ensure:
1. Backend implements all endpoints with correct schemas
2. CORS is properly configured
3. Authentication tokens are properly generated and validated
4. Error responses include helpful messages
5. Rate limiting is implemented to prevent abuse
