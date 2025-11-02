// Initialize demo data for CatIQz
// This file contains sample data for development and testing

export const demoEvents = [
  {
    id: 'evt-001',
    title: 'Fed Signals Rate Cut in Q2 2025',
    summary: 'Federal Reserve officials hint at potential interest rate reduction following cooler inflation data.',
    sentiment: 'bullish' as const,
    impact_level: 'High' as const,
    probability: 78,
    affected_sectors: ['Technology', 'Real Estate', 'Financials'],
    affected_symbols: ['SPY', 'QQQ', 'IWM', 'XLF'],
    sources: [
      { name: 'Bloomberg', url: 'https://bloomberg.com', ts: '2025-10-25T10:30:00Z' },
      { name: 'Reuters', url: 'https://reuters.com', ts: '2025-10-25T11:00:00Z' }
    ],
    reasoning: 'Multiple Fed officials have referenced the recent CPI data showing inflation at 2.4%, closer to the 2% target. Historical patterns suggest rate cuts typically boost equity valuations, especially in growth sectors.',
    model_used: 'GPT-4 Turbo',
    provenance: {
      weights: { 'Bloomberg': 0.4, 'Reuters': 0.3, 'WSJ': 0.3 },
      similar_event_ids: ['evt-historic-001', 'evt-historic-045']
    },
    timestamp: '2025-10-25T12:00:00Z'
  },
  {
    id: 'evt-002',
    title: 'Tech Earnings Beat Expectations',
    summary: 'Major tech companies report stronger-than-expected Q3 earnings, driven by AI adoption.',
    sentiment: 'bullish' as const,
    impact_level: 'High' as const,
    probability: 85,
    affected_sectors: ['Technology', 'Communication Services'],
    affected_symbols: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
    sources: [
      { name: 'CNBC', url: 'https://cnbc.com', ts: '2025-10-24T16:00:00Z' },
      { name: 'Financial Times', url: 'https://ft.com', ts: '2025-10-24T17:30:00Z' }
    ],
    reasoning: 'Cloud computing revenue up 25% YoY, AI infrastructure spending accelerating. Enterprise AI adoption reaching inflection point.',
    model_used: 'GPT-4 Turbo',
    provenance: {
      weights: { 'CNBC': 0.5, 'Financial Times': 0.5 },
      similar_event_ids: ['evt-historic-012', 'evt-historic-078']
    },
    timestamp: '2025-10-24T18:00:00Z'
  },
  {
    id: 'evt-003',
    title: 'Oil Supply Concerns Ease',
    summary: 'OPEC+ announces production increase, alleviating supply shortage fears.',
    sentiment: 'bearish' as const,
    impact_level: 'Medium' as const,
    probability: 72,
    affected_sectors: ['Energy', 'Transportation'],
    affected_symbols: ['XLE', 'CVX', 'XOM', 'COP'],
    sources: [
      { name: 'Reuters', url: 'https://reuters.com', ts: '2025-10-23T09:00:00Z' }
    ],
    reasoning: 'Increased production of 500k barrels/day will ease tight supply conditions. Airlines and transportation sectors benefit from lower fuel costs.',
    model_used: 'GPT-4 Turbo',
    provenance: {
      weights: { 'Reuters': 0.7, 'Bloomberg': 0.3 },
      similar_event_ids: ['evt-historic-034']
    },
    timestamp: '2025-10-23T10:00:00Z'
  }
];

export const demoStocks = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 178.45,
    change: 2.34,
    changePercent: 1.33,
    fundamentals: {
      pe: 29.5,
      marketCap: '2.8T',
      dividendYield: 0.52
    },
    technical: {
      ma50: 175.20,
      ma200: 168.90,
      rsi: 62,
      macd: { value: 1.2, signal: 0.8 }
    },
    aiSummary: 'Strong uptrend with bullish technicals. Recent iPhone 16 sales exceeding expectations. Services revenue growth continues. Recommendation: BUY',
    sparkline: [172, 173, 175, 174, 176, 178, 179, 177, 178, 178.45]
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    price: 242.80,
    change: -3.15,
    changePercent: -1.28,
    fundamentals: {
      pe: 68.2,
      marketCap: '771B',
      dividendYield: 0
    },
    technical: {
      ma50: 245.60,
      ma200: 238.40,
      rsi: 48,
      macd: { value: -0.5, signal: 0.2 }
    },
    aiSummary: 'Consolidating after recent rally. Cybertruck production ramping up. FSD improvements noted. Watch for support at $240. Recommendation: HOLD',
    sparkline: [248, 246, 245, 243, 244, 242, 243, 241, 242, 242.80]
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF',
    price: 458.32,
    change: 1.28,
    changePercent: 0.28,
    fundamentals: {
      pe: 21.3,
      marketCap: '451B',
      dividendYield: 1.35
    },
    technical: {
      ma50: 452.10,
      ma200: 445.80,
      rsi: 58,
      macd: { value: 0.8, signal: 0.5 }
    },
    aiSummary: 'Broad market showing strength. Breaking above 50-day MA with volume. Fed rate cut expectations supportive. Recommendation: BUY',
    sparkline: [452, 453, 454, 455, 456, 457, 457, 458, 459, 458.32]
  }
];

export const demoCalendarEvents = [
  {
    id: 'cal-001',
    date: '2025-10-28',
    country: 'US',
    event: 'GDP Growth Rate (Q3)',
    importance: 'High' as const,
    forecast: '2.8%',
    previous: '3.0%',
    aiSummary: 'Slight moderation expected in GDP growth. Still healthy economic expansion. Market likely to focus on Fed rate path implications.',
    affectedMarkets: ['USD', 'Bonds', 'Equities']
  },
  {
    id: 'cal-002',
    date: '2025-10-29',
    country: 'US',
    event: 'Core PCE Price Index',
    importance: 'High' as const,
    forecast: '2.6%',
    previous: '2.7%',
    aiSummary: 'Fed\'s preferred inflation gauge showing continued disinflation. Below forecast could accelerate rate cut timeline.',
    affectedMarkets: ['USD', 'Bonds', 'Gold']
  },
  {
    id: 'cal-003',
    date: '2025-10-30',
    country: 'EU',
    event: 'ECB Interest Rate Decision',
    importance: 'High' as const,
    forecast: '4.25%',
    previous: '4.50%',
    aiSummary: 'ECB expected to cut rates by 25bps. European economy showing weakness. Euro may weaken on dovish guidance.',
    affectedMarkets: ['EUR', 'European Equities', 'Euro Bonds']
  },
  {
    id: 'cal-004',
    date: '2025-11-01',
    country: 'US',
    event: 'Non-Farm Payrolls',
    importance: 'High' as const,
    forecast: '175K',
    previous: '254K',
    aiSummary: 'Labor market cooling as expected. Lower job gains support Fed easing cycle. Watch for wage growth component.',
    affectedMarkets: ['USD', 'Equities', 'Bonds']
  },
  {
    id: 'cal-005',
    date: '2025-11-04',
    country: 'CN',
    event: 'Caixin Services PMI',
    importance: 'Medium' as const,
    forecast: '51.2',
    previous: '50.3',
    aiSummary: 'Services sector expansion continuing. Policy support measures showing effect. Positive for Asian equities.',
    affectedMarkets: ['CNY', 'Asian Equities', 'Commodities']
  }
];

export const demoInvites = [
  {
    token: 'demo-invite-001',
    createdAt: '2025-10-20T10:00:00Z',
    used: false,
    createdBy: 'admin@catiqz.com'
  },
  {
    token: 'demo-invite-002',
    createdAt: '2025-10-21T14:30:00Z',
    used: true,
    usedBy: 'user@example.com',
    createdBy: 'admin@catiqz.com'
  }
];

export const demoUser = {
  id: 'demo-user-001',
  email: 'demo@catiqz.com',
  password: 'demo123', // In production, this would be hashed
  name: 'Demo User',
  capital: 100000,
  riskProfile: 'moderate',
  isAdmin: true,
  createdAt: '2025-10-15T00:00:00Z'
};
