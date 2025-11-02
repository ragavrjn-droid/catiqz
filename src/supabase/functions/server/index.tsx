import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { demoEvents, demoStocks, demoCalendarEvents, demoInvites, demoUser } from "./init-data.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-2dfefaa8/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize demo data (call this once to populate the database)
app.post("/make-server-2dfefaa8/init-demo-data", async (c) => {
  try {
    // Initialize events
    for (const event of demoEvents) {
      await kv.set(`event:${event.id}`, event);
    }

    // Initialize stocks
    for (const stock of demoStocks) {
      await kv.set(`stock:${stock.ticker}`, stock);
    }

    // Initialize calendar events
    for (const calEvent of demoCalendarEvents) {
      await kv.set(`calendar:${calEvent.id}`, calEvent);
    }

    // Initialize invites
    for (const invite of demoInvites) {
      await kv.set(`invite:${invite.token}`, invite);
    }

    // Initialize demo user
    await kv.set(`user:${demoUser.email}`, demoUser);

    return c.json({ 
      success: true, 
      message: 'Demo data initialized',
      data: {
        events: demoEvents.length,
        stocks: demoStocks.length,
        calendarEvents: demoCalendarEvents.length,
        invites: demoInvites.length,
        users: 1
      }
    });
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return c.json({ error: 'Failed to initialize demo data' }, 500);
  }
});

// ===== EVENTS API =====
app.get("/make-server-2dfefaa8/api/events", async (c) => {
  try {
    const since = c.req.query('since');
    const impact = c.req.query('impact');
    const sector = c.req.query('sector');
    const country = c.req.query('country');

    // Get events from KV store
    const events = await kv.getByPrefix('event:') || [];
    
    let filteredEvents = events;
    
    // Apply filters
    if (since) {
      const sinceDate = new Date(since).getTime();
      filteredEvents = filteredEvents.filter((e: any) => 
        new Date(e.timestamp).getTime() >= sinceDate
      );
    }
    
    if (impact) {
      filteredEvents = filteredEvents.filter((e: any) => 
        e.impact_level === impact
      );
    }
    
    if (sector) {
      filteredEvents = filteredEvents.filter((e: any) => 
        e.affected_sectors?.includes(sector)
      );
    }

    return c.json(filteredEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// ===== STOCKS API =====
app.get("/make-server-2dfefaa8/api/stocks/:ticker", async (c) => {
  try {
    const ticker = c.req.param('ticker');
    const stock = await kv.get(`stock:${ticker.toUpperCase()}`);
    
    if (!stock) {
      return c.json({ error: 'Stock not found' }, 404);
    }
    
    return c.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return c.json({ error: 'Failed to fetch stock data' }, 500);
  }
});

// ===== CALENDAR API =====
app.get("/make-server-2dfefaa8/api/calendar", async (c) => {
  try {
    const country = c.req.query('country');
    const from = c.req.query('from');
    const to = c.req.query('to');

    const calendarEvents = await kv.getByPrefix('calendar:') || [];
    
    let filtered = calendarEvents;
    
    if (country) {
      filtered = filtered.filter((e: any) => e.country === country);
    }
    
    if (from) {
      const fromDate = new Date(from).getTime();
      filtered = filtered.filter((e: any) => 
        new Date(e.date).getTime() >= fromDate
      );
    }
    
    if (to) {
      const toDate = new Date(to).getTime();
      filtered = filtered.filter((e: any) => 
        new Date(e.date).getTime() <= toDate
      );
    }

    return c.json(filtered);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return c.json({ error: 'Failed to fetch calendar events' }, 500);
  }
});

// ===== INVITE VALIDATION API =====
app.post("/make-server-2dfefaa8/api/invite/validate", async (c) => {
  try {
    const url = new URL(c.req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return c.json({ valid: false, message: 'No token provided' });
    }
    
    const inviteData = await kv.get(`invite:${token}`);
    
    if (!inviteData) {
      return c.json({ valid: false, message: 'Invalid or expired invite token' });
    }
    
    // Check if already used
    if (inviteData.used) {
      return c.json({ valid: false, message: 'This invite has already been used' });
    }
    
    return c.json({ valid: true });
  } catch (error) {
    console.error('Error validating invite:', error);
    return c.json({ error: 'Failed to validate invite' }, 500);
  }
});

// ===== AUTH API =====
app.post("/make-server-2dfefaa8/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }
    
    // Get user from KV store
    const user = await kv.get(`user:${email}`);
    
    if (!user || user.password !== password) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate simple token (in production, use proper JWT)
    const token = btoa(`${email}:${Date.now()}`);
    
    // Store session
    await kv.set(`session:${token}`, {
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString()
    });
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    return c.json({ 
      token, 
      user: userData 
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.post("/make-server-2dfefaa8/api/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, capital, riskProfile, inviteToken } = body;
    
    if (!email || !password || !inviteToken) {
      return c.json({ error: 'Email, password, and invite token required' }, 400);
    }
    
    // Validate invite token
    const inviteData = await kv.get(`invite:${inviteToken}`);
    if (!inviteData || inviteData.used) {
      return c.json({ error: 'Invalid or used invite token' }, 400);
    }
    
    // Check if user exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }
    
    // Create user
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email,
      name,
      password,
      capital: capital || 0,
      riskProfile: riskProfile || 'moderate',
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`user:${email}`, user);
    
    // Mark invite as used
    await kv.set(`invite:${inviteToken}`, { ...inviteData, used: true, usedBy: email });
    
    // Generate token
    const token = btoa(`${email}:${Date.now()}`);
    
    // Create session
    await kv.set(`session:${token}`, {
      userId,
      email,
      createdAt: new Date().toISOString()
    });
    
    const { password: _, ...userData } = user;
    
    return c.json({ token, user: userData });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// ===== SAVED ITEMS API =====
app.get("/make-server-2dfefaa8/api/saved", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const session = await kv.get(`session:${token}`);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    const savedItems = await kv.getByPrefix(`saved:${session.userId}:`) || [];
    return c.json(savedItems);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    return c.json({ error: 'Failed to fetch saved items' }, 500);
  }
});

app.post("/make-server-2dfefaa8/api/saved", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const session = await kv.get(`session:${token}`);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    const body = await c.req.json();
    const { type, itemId, note, tags } = body;
    
    const savedItemId = crypto.randomUUID();
    const savedItem = {
      id: savedItemId,
      type,
      itemId,
      note,
      tags: tags || [],
      savedAt: new Date().toISOString(),
      userId: session.userId
    };
    
    await kv.set(`saved:${session.userId}:${savedItemId}`, savedItem);
    
    return c.json(savedItem);
  } catch (error) {
    console.error('Error saving item:', error);
    return c.json({ error: 'Failed to save item' }, 500);
  }
});

app.delete("/make-server-2dfefaa8/api/saved/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const session = await kv.get(`session:${token}`);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(`saved:${session.userId}:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved item:', error);
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

// ===== REFRESH API =====
app.post("/make-server-2dfefaa8/api/refresh", async (c) => {
  try {
    // This would trigger a refresh of data from external sources
    // For now, just return success
    return c.json({ success: true, message: 'Refresh triggered' });
  } catch (error) {
    console.error('Error triggering refresh:', error);
    return c.json({ error: 'Failed to trigger refresh' }, 500);
  }
});

// ===== ADMIN API - Invite Management =====
app.get("/make-server-2dfefaa8/api/admin/invites", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const session = await kv.get(`session:${token}`);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    const user = await kv.get(`user:${session.email}`);
    if (!user?.isAdmin) {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }
    
    const invites = await kv.getByPrefix('invite:') || [];
    return c.json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return c.json({ error: 'Failed to fetch invites' }, 500);
  }
});

app.post("/make-server-2dfefaa8/api/admin/invites", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const session = await kv.get(`session:${token}`);
    if (!session) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    
    const user = await kv.get(`user:${session.email}`);
    if (!user?.isAdmin) {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }
    
    const body = await c.req.json();
    const { count = 1 } = body;
    
    const invites = [];
    for (let i = 0; i < count; i++) {
      const inviteToken = crypto.randomUUID();
      const invite = {
        token: inviteToken,
        createdAt: new Date().toISOString(),
        used: false,
        createdBy: session.email
      };
      await kv.set(`invite:${inviteToken}`, invite);
      invites.push(invite);
    }
    
    return c.json(invites);
  } catch (error) {
    console.error('Error creating invites:', error);
    return c.json({ error: 'Failed to create invites' }, 500);
  }
});

Deno.serve(app.fetch);