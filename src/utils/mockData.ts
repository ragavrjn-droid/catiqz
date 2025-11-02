// Mock data for development and demonstration
// Use this when backend is not available

import { Event, Stock, CalendarEvent } from './api';

export const mockEvents: Event[] = [
  {
    id: 'evt_001',
    title: 'RBI signals rate pause after inflation data',
    summary: 'RBI likely to hold rates due to sticky CPI; potential headwind for rate-sensitive sectors.',
    sentiment: 'bearish',
    impact_level: 'High',
    probability: 85,
    affected_sectors: ['Banks', 'NBFC', 'Real Estate'],
    affected_symbols: ['BANKNIFTY', 'HDFCBANK', 'ICICIBANK', 'SBIN'],
    sources: [
      {
        name: 'Reuters',
        url: 'https://reuters.com',
        ts: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    reasoning:
      'Higher inflation leads to central bank maintaining cautious stance, creating short-term pressure on rate-sensitive names. Banks may see margin compression while borrowers face higher costs.',
    model_used: 'mistral-instruct-1',
    provenance: {
      weights: { source: 15, regulator: 20, historical: 10 },
      similar_event_ids: ['evt_045'],
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'evt_002',
    title: 'IT sector sees strong Q3 guidance upgrades',
    summary:
      'Major IT companies raise revenue forecasts on robust demand from BFSI and retail sectors.',
    sentiment: 'bullish',
    impact_level: 'High',
    probability: 78,
    affected_sectors: ['IT', 'Services', 'Technology'],
    affected_symbols: ['NIFTYIT', 'TCS', 'INFY', 'WIPRO', 'TECHM'],
    sources: [
      {
        name: 'Economic Times',
        url: 'https://economictimes.com',
        ts: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        name: 'Bloomberg',
        url: 'https://bloomberg.com',
        ts: new Date(Date.now() - 7500000).toISOString(),
      },
    ],
    reasoning:
      'Strong deal pipeline and improved client spending indicate sustained growth momentum. Digital transformation initiatives continue to drive demand.',
    model_used: 'mistral-instruct-1',
    provenance: {
      weights: { source: 18, earnings: 25, historical: 12 },
      similar_event_ids: [],
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'evt_003',
    title: 'Auto sales data exceeds expectations',
    summary:
      'Festive season drives record sales across passenger and commercial vehicles.',
    sentiment: 'bullish',
    impact_level: 'Medium',
    probability: 72,
    affected_sectors: ['Auto', 'Manufacturing'],
    affected_symbols: ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO'],
    sources: [
      {
        name: 'Bloomberg',
        url: 'https://bloomberg.com',
        ts: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    reasoning:
      'Strong rural demand and urban recovery support positive outlook. Inventory levels remain healthy.',
    model_used: 'mistral-instruct-1',
    provenance: {
      weights: { source: 12, industry: 20, historical: 8 },
      similar_event_ids: ['evt_089'],
    },
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'evt_004',
    title: 'Pharma exports surge on US FDA approvals',
    summary:
      'Indian pharma companies receive multiple approvals for generic drugs in US market.',
    sentiment: 'bullish',
    impact_level: 'Medium',
    probability: 68,
    affected_sectors: ['Pharma', 'Healthcare'],
    affected_symbols: ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'LUPIN'],
    sources: [
      {
        name: 'Reuters',
        url: 'https://reuters.com',
        ts: new Date(Date.now() - 14400000).toISOString(),
      },
    ],
    reasoning:
      'FDA approvals open new revenue streams. US generic market remains strong with pricing stabilization.',
    model_used: 'mistral-instruct-1',
    provenance: {
      weights: { source: 14, regulator: 22, historical: 9 },
      similar_event_ids: [],
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'evt_005',
    title: 'Crude oil prices spike on Middle East tensions',
    summary:
      'Geopolitical concerns push Brent crude above $90, impacting energy and transport sectors.',
    sentiment: 'bearish',
    impact_level: 'High',
    probability: 82,
    affected_sectors: ['Energy', 'Oil & Gas', 'Aviation', 'Logistics'],
    affected_symbols: ['RELIANCE', 'ONGC', 'BPCL', 'IOC'],
    sources: [
      {
        name: 'Bloomberg',
        url: 'https://bloomberg.com',
        ts: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    reasoning:
      'Higher crude impacts OMC margins negatively while benefiting upstream players. Transport costs rise.',
    model_used: 'mistral-instruct-1',
    provenance: {
      weights: { source: 16, geopolitical: 25, historical: 14 },
      similar_event_ids: ['evt_234', 'evt_189'],
    },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const mockStocks: Record<string, Stock> = {
  RELIANCE: {
    ticker: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    price: 2845.5,
    change: 45.2,
    changePercent: 1.61,
    fundamentals: {
      pe: 24.5,
      marketCap: '18.2L Cr',
      dividendYield: 0.35,
    },
    technical: {
      ma50: 2800.0,
      ma200: 2750.0,
      rsi: 62,
      macd: { value: 12.5, signal: 8.3 },
    },
    aiSummary:
      'RELIANCE shows strong fundamentals with stable earnings growth across petrochemicals, refining, and telecom divisions. Technical indicators suggest bullish momentum with RSI at 62 and price trading above both 50-day and 200-day moving averages. Recent energy sector tailwinds and Jio expansion support positive outlook. Consider for medium-term growth with moderate risk profile.',
    sparkline: [2800, 2810, 2815, 2820, 2830, 2825, 2835, 2840, 2838, 2842, 2845, 2843, 2845, 2845.5],
  },
  TCS: {
    ticker: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    price: 3652.3,
    change: -28.4,
    changePercent: -0.77,
    fundamentals: {
      pe: 28.3,
      marketCap: '13.4L Cr',
      dividendYield: 1.2,
    },
    technical: {
      ma50: 3680.0,
      ma200: 3700.0,
      rsi: 45,
      macd: { value: -5.2, signal: -2.1 },
    },
    aiSummary:
      'TCS demonstrates resilient business model with strong order book and client retention. Technical indicators show consolidation near support levels with RSI at 45 suggesting neutral momentum. Recent guidance upgrades across BFSI and retail verticals provide confidence. Dividend yield of 1.2% adds stability. Suitable for conservative investors seeking quality exposure.',
    sparkline: [3680, 3670, 3665, 3660, 3655, 3652, 3658, 3654, 3650, 3648, 3652, 3651, 3652, 3652.3],
  },
  HDFCBANK: {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    price: 1734.2,
    change: -12.5,
    changePercent: -0.72,
    fundamentals: {
      pe: 19.8,
      marketCap: '13.2L Cr',
      dividendYield: 1.1,
    },
    technical: {
      ma50: 1750.0,
      ma200: 1720.0,
      rsi: 48,
      macd: { value: -2.3, signal: -1.5 },
    },
    aiSummary:
      'HDFC Bank maintains strong asset quality and deposit franchise despite rate headwinds. Integration with HDFC Ltd progressing well. Technical consolidation around 1730-1750 range with support at 200-day MA. NIM pressure from rate plateau offset by volume growth. Quality banking play for long-term holders.',
    sparkline: [1750, 1745, 1742, 1738, 1735, 1732, 1730, 1728, 1730, 1732, 1734, 1733, 1734, 1734.2],
  },
  INFY: {
    ticker: 'INFY',
    name: 'Infosys Ltd',
    price: 1523.8,
    change: 18.6,
    changePercent: 1.24,
    fundamentals: {
      pe: 26.4,
      marketCap: '6.3L Cr',
      dividendYield: 2.1,
    },
    technical: {
      ma50: 1500.0,
      ma200: 1480.0,
      rsi: 58,
      macd: { value: 8.2, signal: 5.4 },
    },
    aiSummary:
      'Infosys shows strong momentum with recent deal wins and margin expansion. AI and automation capabilities driving differentiation. Technical breakout above 1500 with positive RSI divergence. Higher dividend yield of 2.1% attractive. Well-positioned for digital transformation wave.',
    sparkline: [1480, 1485, 1490, 1495, 1500, 1505, 1510, 1512, 1515, 1518, 1520, 1522, 1523, 1523.8],
  },
};

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal_001',
    date: new Date().toISOString(),
    country: 'IN',
    event: 'RBI Monetary Policy Decision',
    importance: 'High',
    forecast: '6.50%',
    previous: '6.50%',
    aiSummary:
      'Expected to maintain status quo on rates due to persistent inflation concerns. Governor commentary on liquidity and growth outlook will be key.',
    affectedMarkets: ['Banks', 'Fixed Income', 'Currency', 'Equity Indices'],
  },
  {
    id: 'cal_002',
    date: new Date(Date.now() + 86400000).toISOString(),
    country: 'IN',
    event: 'CPI Inflation Data',
    importance: 'High',
    forecast: '5.2%',
    previous: '5.5%',
    aiSummary:
      'Lower inflation reading could support dovish policy stance. Food prices remain key variable with festive demand impact.',
    affectedMarkets: ['Bonds', 'Currency', 'FMCG'],
  },
  {
    id: 'cal_003',
    date: new Date(Date.now() + 172800000).toISOString(),
    country: 'IN',
    event: 'GDP Growth Numbers',
    importance: 'High',
    forecast: '6.8%',
    previous: '7.2%',
    aiSummary:
      'Moderation expected but still healthy growth trajectory. Services sector strength offsetting manufacturing slowdown.',
    affectedMarkets: ['Equity Indices', 'Currency', 'All Sectors'],
  },
  {
    id: 'cal_004',
    date: new Date(Date.now() + 259200000).toISOString(),
    country: 'IN',
    event: 'Manufacturing PMI',
    importance: 'Medium',
    forecast: '57.5',
    previous: '57.8',
    aiSummary:
      'Expansion continues with slight moderation. New orders and production remain robust. Export outlook mixed.',
    affectedMarkets: ['Manufacturing', 'Industrials', 'Auto'],
  },
  {
    id: 'cal_005',
    date: new Date(Date.now() + 345600000).toISOString(),
    country: 'US',
    event: 'Federal Reserve Interest Rate Decision',
    importance: 'High',
    forecast: '5.50%',
    previous: '5.50%',
    aiSummary:
      'Expected to hold rates steady. Focus on dot plot and Powell press conference for future guidance. Impact on global risk sentiment.',
    affectedMarkets: ['Global Equities', 'Currency', 'Commodities'],
  },
  {
    id: 'cal_006',
    date: new Date(Date.now() + 432000000).toISOString(),
    country: 'IN',
    event: 'IIP (Industrial Production)',
    importance: 'Medium',
    forecast: '5.1%',
    previous: '5.7%',
    aiSummary:
      'Some deceleration expected after festive boost. Core industries showing resilience. Mining sector outlook positive.',
    affectedMarkets: ['Industrials', 'Capital Goods'],
  },
];

export const mockSectors = [
  { name: 'Banks', change: 2.3, events: 5 },
  { name: 'IT', change: -1.2, events: 3 },
  { name: 'Auto', change: 1.8, events: 4 },
  { name: 'Pharma', change: -0.5, events: 2 },
  { name: 'Energy', change: 3.1, events: 6 },
  { name: 'FMCG', change: 0.4, events: 1 },
  { name: 'Metals', change: -1.8, events: 2 },
  { name: 'Realty', change: 1.2, events: 3 },
];

export const mockTopMovers: Stock[] = [
  mockStocks.RELIANCE,
  mockStocks.TCS,
  mockStocks.HDFCBANK,
  mockStocks.INFY,
];
