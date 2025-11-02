# CatIQz Backend Integration Guide

This guide helps you connect the CatIQz frontend to your Node.js backend with Supabase.

## Quick Start

### 1. Setup Your Backend

Your Node.js backend should:
- Run on `http://localhost:3000` (or configure different URL)
- Implement all endpoints in `API_DOCUMENTATION.md`
- Use Supabase for authentication and data storage
- Integrate an LLM for AI summaries (Mistral, GPT-4, etc.)

### 2. Configure Frontend

Create a `.env` file in the frontend root:

```bash
cp .env.example .env
```

Update the backend URL:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Test Connection

The frontend will automatically connect when you:
1. Start your backend server
2. Open the application in Figma Make
3. Try to validate an invite token or login

---

## Backend Tech Stack (Recommended)

```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js or Fastify",
  "database": "Supabase (Postgres)",
  "auth": "Supabase Auth",
  "llm": "Mistral AI, OpenAI GPT-4, or Anthropic Claude",
  "caching": "Redis (optional)",
  "deployment": "Render, Railway, or Vercel"
}
```

---

## Step-by-Step Integration

### Step 1: Initialize Backend Project

```bash
mkdir catiqz-backend
cd catiqz-backend
npm init -y
npm install express cors dotenv @supabase/supabase-js
```

### Step 2: Create Basic Server

**`index.js`:**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-figma-make-url.com'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
const eventsRouter = require('./routes/events');
const stocksRouter = require('./routes/stocks');
const calendarRouter = require('./routes/calendar');
const authRouter = require('./routes/auth');
const savedRouter = require('./routes/saved');

app.use('/api/events', eventsRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/auth', authRouter);
app.use('/api/saved', savedRouter);

app.listen(PORT, () => {
  console.log(`CatIQz API running on port ${PORT}`);
});
```

### Step 3: Setup Supabase

**`.env`:**
```env
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# LLM API Keys
MISTRAL_API_KEY=your-mistral-key
# or
OPENAI_API_KEY=your-openai-key

# Data Sources
REUTERS_API_KEY=your-reuters-key
# Add other source API keys
```

**`supabase/client.js`:**
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
```

### Step 4: Implement Events Endpoint

**`routes/events.js`:**
```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../supabase/client');
const { generateEventSummary } = require('../services/llm');

router.get('/', async (req, res) => {
  try {
    const { since, impact, sector, country } = req.query;
    
    let query = supabase
      .from('events')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (since) {
      query = query.gte('timestamp', since);
    }
    if (impact) {
      query = query.eq('impact_level', impact);
    }
    if (sector) {
      query = query.contains('affected_sectors', [sector]);
    }
    if (country) {
      query = query.eq('country', country);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      message: error.message 
    });
  }
});

module.exports = router;
```

### Step 5: Implement LLM Service

**`services/llm.js`:**
```javascript
const Mistral = require('@mistralai/mistralai');

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

async function generateEventSummary(rawEventData) {
  const prompt = `
Analyze this market event and provide:
1. A concise one-sentence summary
2. Sentiment (bullish/bearish/neutral)
3. Impact level (High/Medium/Low)
4. Affected sectors and symbols
5. Probability score (0-100)
6. Reasoning

Event data: ${JSON.stringify(rawEventData)}

Respond in JSON format.
  `;

  const response = await client.chat({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { generateEventSummary };
```

### Step 6: Implement Authentication

**`routes/auth.js`:**
```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../supabase/client');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userData.name,
        isAdmin: userData.is_admin,
        capital: userData.capital,
        riskProfile: userData.risk_profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

module.exports = router;
```

### Step 7: Setup Database Schema

**Supabase SQL Schema:**
```sql
-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  impact_level TEXT CHECK (impact_level IN ('High', 'Medium', 'Low')),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  affected_sectors TEXT[],
  affected_symbols TEXT[],
  sources JSONB,
  reasoning TEXT,
  model_used TEXT,
  provenance JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stocks table (cache)
CREATE TABLE stocks (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL,
  change DECIMAL,
  change_percent DECIMAL,
  fundamentals JSONB,
  technical JSONB,
  ai_summary TEXT,
  sparkline DECIMAL[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  country TEXT,
  event TEXT NOT NULL,
  importance TEXT CHECK (importance IN ('High', 'Medium', 'Low')),
  forecast TEXT,
  previous TEXT,
  ai_summary TEXT,
  affected_markets TEXT[]
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  capital DECIMAL,
  risk_profile TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved items table
CREATE TABLE saved_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('event', 'stock')),
  item_id TEXT NOT NULL,
  note TEXT,
  tags TEXT[],
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite tokens table
CREATE TABLE invite_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_impact ON events(impact_level);
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
```

---

## Data Source Integration

### Example: Reuters Feed Integration

```javascript
// services/reuters.js
async function fetchReutersData() {
  const response = await fetch('https://api.reuters.com/...', {
    headers: {
      'Authorization': `Bearer ${process.env.REUTERS_API_KEY}`
    }
  });
  
  const rawData = await response.json();
  
  // Process each article
  for (const article of rawData.articles) {
    // Generate AI summary
    const analysis = await generateEventSummary(article);
    
    // Store in Supabase
    await supabase.from('events').insert({
      id: `evt_${Date.now()}`,
      title: article.headline,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
      impact_level: analysis.impact,
      probability: analysis.probability,
      affected_sectors: analysis.sectors,
      affected_symbols: analysis.symbols,
      sources: [{
        name: 'Reuters',
        url: article.url,
        ts: article.publishedAt
      }],
      reasoning: analysis.reasoning,
      model_used: 'mistral-small-latest',
      provenance: {
        weights: { source: 15, regulator: 0, historical: 10 },
        similar_event_ids: []
      },
      timestamp: article.publishedAt,
      country: article.country || 'IN'
    });
  }
}
```

---

## Deployment

### Option 1: Render

```bash
# Install Render CLI
npm install -g render-cli

# Deploy
render deploy
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Option 3: Vercel (Serverless)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## Testing the Integration

### 1. Test Backend Locally

```bash
# Start backend
cd catiqz-backend
npm start

# Test health endpoint
curl http://localhost:3000/health
```

### 2. Test from Frontend

Update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

Open the app and check browser console for API requests.

### 3. Test Individual Endpoints

```bash
# Get events
curl "http://localhost:3000/api/events?impact=High"

# Get stock
curl "http://localhost:3000/api/stocks/RELIANCE"

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catiqz.com","password":"password"}'
```

---

## Troubleshooting

### CORS Errors

**Problem:** `Access to fetch at 'http://localhost:3000/api/events' has been blocked by CORS policy`

**Solution:** Ensure CORS is properly configured in backend:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-url.com'],
  credentials: true
}));
```

### Authentication Fails

**Problem:** Login returns 401 Unauthorized

**Solution:** 
1. Check Supabase credentials in `.env`
2. Verify user exists in Supabase Auth
3. Check JWT token generation

### Data Not Loading

**Problem:** Dashboard shows "Failed to load events"

**Solution:**
1. Check backend is running on correct port
2. Verify `VITE_API_BASE_URL` in frontend `.env`
3. Check browser Network tab for failed requests
4. Review backend logs for errors

### LLM Summaries Not Generating

**Problem:** Events have empty summaries

**Solution:**
1. Verify LLM API key is set
2. Check API quota/rate limits
3. Review error logs for API failures
4. Add fallback logic for API failures

---

## Production Checklist

Before deploying to production:

- [ ] All API endpoints implemented and tested
- [ ] CORS configured for production domain
- [ ] Environment variables set in production
- [ ] Database migrations run
- [ ] Rate limiting implemented
- [ ] Error logging configured (e.g., Sentry)
- [ ] API key rotation strategy in place
- [ ] Backup strategy for Supabase data
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Documentation updated

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Mistral AI Docs:** https://docs.mistral.ai
- **Express.js Docs:** https://expressjs.com
- **API Reference:** See `API_DOCUMENTATION.md`

---

## Next Steps

1. **Complete Backend Implementation**
   - Implement all endpoints from API documentation
   - Set up LLM integration for AI summaries
   - Configure data source feeds

2. **Connect Frontend**
   - Update `.env` with backend URL
   - Test all pages and features
   - Verify real-time data updates

3. **Deploy**
   - Deploy backend to Render/Railway/Vercel
   - Update frontend with production API URL
   - Test end-to-end in production

4. **Monitor & Optimize**
   - Set up error tracking
   - Monitor API performance
   - Optimize LLM costs
   - Scale as needed

---

**Questions or issues?** Review the API documentation and ensure all endpoints match the expected request/response formats.
