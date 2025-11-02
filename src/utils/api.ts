// API Integration Layer for CatIQz
import { projectId, publicAnonKey } from './supabase/info';

// Use the Supabase edge function server
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Event {
  id: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact_level: 'High' | 'Medium' | 'Low';
  probability: number;
  affected_sectors: string[];
  affected_symbols: string[];
  sources: Array<{ name: string; url: string; ts: string }>;
  reasoning: string;
  model_used: string;
  provenance: {
    weights: Record<string, number>;
    similar_event_ids: string[];
  };
  timestamp: string;
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  fundamentals: {
    pe: number;
    marketCap: string;
    dividendYield: number;
  };
  technical: {
    ma50: number;
    ma200: number;
    rsi: number;
    macd: { value: number; signal: number };
  };
  aiSummary: string;
  sparkline: number[];
}

export interface CalendarEvent {
  id: string;
  date: string;
  country: string;
  event: string;
  importance: 'High' | 'Medium' | 'Low';
  forecast?: string;
  previous?: string;
  aiSummary: string;
  affectedMarkets: string[];
}

export interface SavedItem {
  id: string;
  type: 'event' | 'stock';
  itemId: string;
  note?: string;
  tags?: string[];
  savedAt: string;
  data: Event | Stock;
}

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Use user token if available, otherwise use public anon key for Supabase
      Authorization: `Bearer ${this.token || publicAnonKey}`,
      ...options?.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Events
  async getEvents(params?: {
    since?: string;
    impact?: string;
    sector?: string;
    country?: string;
  }): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (params?.since) queryParams.append('since', params.since);
    if (params?.impact) queryParams.append('impact', params.impact);
    if (params?.sector) queryParams.append('sector', params.sector);
    if (params?.country) queryParams.append('country', params.country);

    const query = queryParams.toString();
    return this.request<Event[]>(`/api/events${query ? `?${query}` : ''}`);
  }

  // Stocks
  async getStock(ticker: string): Promise<Stock> {
    return this.request<Stock>(`/api/stocks/${ticker}`);
  }

  // Calendar
  async getCalendar(params: {
    country?: string;
    from?: string;
    to?: string;
  }): Promise<CalendarEvent[]> {
    const queryParams = new URLSearchParams();
    if (params.country) queryParams.append('country', params.country);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    return this.request<CalendarEvent[]>(`/api/calendar?${queryParams}`);
  }

  // Invite validation
  async validateInvite(token: string): Promise<{ valid: boolean; message?: string }> {
    return this.request<{ valid: boolean; message?: string }>(
      `/api/invite/validate?token=${token}`,
      { method: 'POST' }
    );
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const result = await this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async signup(data: {
    name: string;
    email: string;
    password: string;
    capital?: number;
    riskProfile?: string;
    inviteToken: string;
  }): Promise<{ token: string; user: any }> {
    const result = await this.request<{ token: string; user: any }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  // Saved items
  async saveItem(item: {
    type: 'event' | 'stock';
    itemId: string;
    note?: string;
    tags?: string[];
  }): Promise<SavedItem> {
    return this.request<SavedItem>('/api/saved', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getSavedItems(): Promise<SavedItem[]> {
    return this.request<SavedItem[]>('/api/saved');
  }

  async deleteSavedItem(id: string): Promise<void> {
    return this.request<void>(`/api/saved/${id}`, {
      method: 'DELETE',
    });
  }

  // Manual refresh trigger
  async triggerRefresh(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/refresh', {
      method: 'POST',
    });
  }

  // Admin - Invite management
  async getInvites(): Promise<Array<{
    token: string;
    createdAt: string;
    used: boolean;
    usedBy?: string;
    createdBy: string;
  }>> {
    return this.request('/api/admin/invites');
  }

  async createInvites(count: number = 1): Promise<Array<{
    token: string;
    createdAt: string;
    used: boolean;
    createdBy: string;
  }>> {
    return this.request('/api/admin/invites', {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  }
}

export const api = new APIClient();
