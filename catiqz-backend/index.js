// index.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// API KEYS
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_KEY = process.env.ALPHAVANTAGE_API_KEY;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

// --- Helpers ---

/**
 * Fetch and parse RSS feed URL. Returns array of items { title, link, pubDate, description }.
 */
async function fetchRSS(rssUrl) {
  try {
    const res = await axios.get(rssUrl);
    const text = res.data;
    const parsed = await parseStringPromise(text, { trim: true, explicitArray: false });
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];
    return Array.isArray(items)
      ? items.map(i => ({
          title: i.title,
          link: i.link,
          pubDate: i.pubDate,
          description: i.description || i["media:description"] || ""
        }))
      : [{
          title: items.title,
          link: items.link,
          pubDate: items.pubDate,
          description: items.description || ""
        }];
  } catch (err) {
    console.error("RSS parse error", err.message);
    return [];
  }
}

/**
 * Fetch latest general news from Finnhub
 */
async function fetchFinnhubNews() {
  if (!FINNHUB_KEY) return [];
  try {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
    const r = await axios.get(url, { timeout: 8000 });
    return Array.isArray(r.data) ? r.data.map(n => ({
      title: n.headline,
      link: n.url,
      pubDate: n.datetime ? new Date(n.datetime * 1000).toISOString() : null,
      summary: n.summary || ""
    })) : [];
  } catch (err) {
    console.error("finnhub news error", err.message);
    return [];
  }
}

/**
 * Query Alpha Vantage time series (global quote)
 */
async function getAlphaQuote(symbol) {
  if (!ALPHA_KEY) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_KEY}`;
    const r = await axios.get(url, { timeout: 8000 });
    const data = r.data?.["Global Quote"];
    if (!data) return null;
    return {
      price: parseFloat(data["05. price"]),
      change: parseFloat(data["09. change"]) || 0,
      changePercent: data["10. change percent"] || null,
      raw: data
    };
  } catch (err) {
    console.error("alpha quote error", err.message);
    return null;
  }
}

/**
 * Call Hugging Face Inference for a short summary (use a small summarization model)
 * Uses the /models/:model endpoint - we use "sshleifer/distilbart-cnn-12-6" as a standard summarizer
 */
async function hfSummarize(text) {
  if (!HF_KEY) {
    // If HF key missing, do a trivial fallback: return the first 200 chars
    return { summary: text?.slice(0, 300) || "", model: "none" };
  }
  try {
    const model = "sshleifer/distilbart-cnn-12-6"; // reasonable summarizer
    const url = `https://api-inference.huggingface.co/models/${model}`;
    const r = await axios.post(url, { inputs: text }, {
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });
    // Many HF inference responses return [{ summary_text: "..." }] or a string
    const out = Array.isArray(r.data) ? r.data[0]?.summary_text || "" : (r.data?.summary_text || (typeof r.data === "string" ? r.data : ""));
    return { summary: out, model };
  } catch (err) {
    if (err.response) {
  console.error("HF summarization error:", err.response.status, err.response.data);
} else {
  console.error("HF summarization error:", err.message);
}
return { summary: text?.slice(0, 300) || "", model: "error" };
}
}

/**
 * Save event object to Supabase events table
 */
async function saveEventToSupabase(eventObj) {
  try {
    // Upsert by id if provided, otherwise insert
    const payload = {
      id: eventObj.id,
      title: eventObj.title,
      summary: eventObj.summary,
      sentiment: eventObj.sentiment || null,
      impact_level: eventObj.impact_level || null,
      probability: eventObj.probability || null,
      affected_sectors: eventObj.affected_sectors || null,
      affected_symbols: eventObj.affected_symbols || null,
      sources: eventObj.sources || null,
      reasoning: eventObj.reasoning || null,
      model_used: eventObj.model_used || null,
      provenance: eventObj.provenance || null,
      timestamp: eventObj.timestamp ? new Date(eventObj.timestamp) : new Date()
    };
    const { data, error } = await supabase.from("events").insert([payload]);
    if (error) {
      console.error("Supabase insert error:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("saveEvent error", err.message);
    return null;
  }
}

// --- Routes ---

app.get("/", (req, res) => {
  res.send("✅ CatIQz Backend is running successfully!");
});

/**
 * /api/fetch-live
 * One-shot fetch from configured sources, summarize via HF, store into supabase events.
 * This is a simple aggregator for MVP. You can call this via cron or UI "Refresh".
 */
app.post("/api/fetch-live", async (req, res) => {
  try {
    // 1) RSS sources: example Google News RSS queries (customize)
    const googleIndia = "https://news.google.com/rss/search?q=india+economy&hl=en-IN&gl=IN&ceid=IN:en";
    const oilNews = "https://news.google.com/rss/search?q=oil+price&hl=en-US&gl=US&ceid=US:en";

    const [rss1, rss2, finnhub] = await Promise.all([
      fetchRSS(googleIndia),
      fetchRSS(oilNews),
      fetchFinnhubNews()
    ]);

    // combine and dedupe by link/title
    let combined = [...rss1, ...rss2, ...finnhub];
    // dedupe by link
    const seen = new Set();
    combined = combined.filter(item => {
      const key = (item.link || item.title || "").trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // For each item, run summarization and prepare event object
    const processed = [];
    for (const it of combined.slice(0, 40)) { // limit processing per run
      const text = (it.summary || it.description || it.title || "").slice(0, 3000);
      const { summary, model } = await hfSummarize(text || it.title || "");
      const eventObj = {
        id: `evt-${Math.random().toString(36).slice(2,9)}`,
        title: it.title,
        summary,
        sentiment: null,
        impact_level: null,
        probability: null,
        affected_sectors: null,
        affected_symbols: null,
        sources: [{ url: it.link, ts: it.pubDate || new Date().toISOString() }],
        reasoning: `Auto-summarized by ${model}`,
        model_used: model,
        provenance: { source_count: 1 },
        timestamp: it.pubDate || new Date().toISOString()
      };
      // Save to supabase (optional)
      await saveEventToSupabase(eventObj);
      console.log(`✅ Inserted: ${eventObj.title}`);
      processed.push(eventObj);
    }

    res.json({ success: true, inserted: processed.length });
  } catch (err) {
    console.error("fetch-live error", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * /api/events - read events from supabase (frontend uses this)
 * Accepts query params: since, impact, sector, country
 */
app.get("/api/events", async (req, res) => {
  try {
    const { since, impact } = req.query;
    let q = supabase.from("events").select("*").order("timestamp", { ascending: false });
    if (impact) q = q.eq("impact_level", impact);
    if (since) q = q.gte("timestamp", new Date(since).toISOString());
    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    console.error("events read error", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * /api/stock/:ticker - fetch price/quote (AlphaVantage fallback to Finnhub)
 */
app.get("/api/stock/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    // Try Alpha Vantage first
    const quote = await getAlphaQuote(ticker);
    if (quote) return res.json({ source: "alphavantage", quote });
    // fallback to Finnhub quote
    if (FINNHUB_KEY) {
      const fin = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`);
      return res.json({ source: "finnhub", quote: fin.data });
    }
    return res.status(404).json({ error: "No quote available" });
  } catch (err) {
    console.error("stock error", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * /api/summary - return HF summary for an arbitrary text (POST)
 * { text: "..." }
 */
app.post("/api/summary", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const out = await hfSummarize(text);
    return res.json(out);
  } catch (err) {
    console.error("summary error", err.message);
    return res.status(500).json({ error: err.message });
  }
});

import cron from "node-cron";

// 🔁 Function to trigger fetch-live endpoint
async function triggerFetch() {
  try {
    console.log("🔄 Fetch triggered...");
    const res = await fetch("http://localhost:3000/api/fetch-live", { method: "POST" });
    const data = await res.json();
    console.log("✅ Fetch result:", data);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
  }
}

// 🕒 1️⃣ Run once immediately at startup
(async () => {
  console.log("🚀 Initial auto-fetch triggered at startup...");
  await triggerFetch();
})();

// 🕒 2️⃣ Then schedule it every 1 minute
cron.schedule("* * * * *", async () => {
  console.log("⏰ Auto-fetch cron triggered (every 1 min)");
  await triggerFetch();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
