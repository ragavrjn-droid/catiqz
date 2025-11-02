import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { TinyChart } from '../components/TinyChart';
import { EventCard } from '../components/EventCard';
import { api, Stock, Event } from '../utils/api';
import { StockCardSkeleton } from '../components/SkeletonLoader';

export function StockAnalyzer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTicker = searchParams.get('ticker') || '';

  const [ticker, setTicker] = useState(initialTicker);
  const [searchInput, setSearchInput] = useState(initialTicker);
  const [stock, setStock] = useState<Stock | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async (symbol: string) => {
    if (!symbol) return;
    
    setLoading(true);
    try {
      const stockData = await api.getStock(symbol.toUpperCase());
      setStock(stockData);

      // Fetch related events
      const events = await api.getEvents({});
      const related = events.filter((event) =>
        event.affected_symbols.some(
          (s) => s.toUpperCase() === symbol.toUpperCase()
        )
      );
      setRelatedEvents(related);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      
      // Mock data for demo
      setStock({
        ticker: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Ltd.`,
        price: 1234.56,
        change: 23.45,
        changePercent: 1.93,
        fundamentals: {
          pe: 24.5,
          marketCap: '50,000 Cr',
          dividendYield: 1.2,
        },
        technical: {
          ma50: 1200,
          ma200: 1180,
          rsi: 62,
          macd: { value: 15, signal: 12 },
        },
        aiSummary: `${symbol.toUpperCase()} shows strong fundamentals with a PE ratio of 24.5. Technical indicators suggest bullish momentum with RSI at 62 and price trading above both 50-day and 200-day moving averages. Recent catalysts include positive sector trends and improved earnings guidance. Consider this stock for medium-term growth with moderate risk profile.`,
        sparkline: Array.from({ length: 14 }, (_, i) => 1200 + Math.random() * 50),
      });

      setRelatedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicker) {
      fetchStockData(initialTicker);
    }
  }, [initialTicker]);

  const handleSearch = () => {
    if (searchInput) {
      setTicker(searchInput);
      fetchStockData(searchInput);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2>Stock Analyzer</h2>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ticker (e.g., RELIANCE, TCS, INFY)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Analyze</Button>
          </div>
        </Card>

        {loading && <StockCardSkeleton />}

        {!loading && stock && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Card */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2>{stock.ticker}</h2>
                      {stock.change >= 0 ? (
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground">₹{stock.price.toFixed(2)}</div>
                    <div className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="h-48 mb-6">
                  <TinyChart data={stock.sparkline} color="#60A5FA" height={192} />
                </div>

                <div className="text-muted-foreground mb-2">14-Day Price Movement</div>
              </Card>

              {/* Fundamentals */}
              <Card className="p-6">
                <h3 className="mb-4">Fundamentals</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-muted-foreground mb-1">P/E Ratio</div>
                    <div className="text-foreground">{stock.fundamentals.pe}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-muted-foreground mb-1">Market Cap</div>
                    <div className="text-foreground">₹{stock.fundamentals.marketCap}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-muted-foreground mb-1">Div. Yield</div>
                    <div className="text-foreground">{stock.fundamentals.dividendYield}%</div>
                  </div>
                </div>
              </Card>

              {/* Technical */}
              <Card className="p-6">
                <h3 className="mb-4">Technical Indicators</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">50-Day MA</span>
                    <span className="text-foreground">₹{stock.technical.ma50.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">200-Day MA</span>
                    <span className="text-foreground">₹{stock.technical.ma200.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">RSI (14)</span>
                    <Badge
                      variant={stock.technical.rsi > 70 ? 'destructive' : stock.technical.rsi < 30 ? 'default' : 'secondary'}
                    >
                      {stock.technical.rsi.toFixed(0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">MACD</span>
                    <span className="text-foreground">
                      {stock.technical.macd.value.toFixed(2)} / {stock.technical.macd.signal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* AI Summary */}
              <Card className="p-6">
                <h3 className="mb-4">AI Analysis Summary</h3>
                <p className="text-foreground leading-relaxed">{stock.aiSummary}</p>
              </Card>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div>
                  <h3 className="mb-4">Related Market Events</h3>
                  <div className="space-y-4">
                    {relatedEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Quick Stats */}
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="mb-3 text-muted-foreground">Trading Signals</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>MA Signal</span>
                    <Badge variant={stock.price > stock.technical.ma50 ? 'default' : 'destructive'}>
                      {stock.price > stock.technical.ma50 ? 'Bullish' : 'Bearish'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RSI Signal</span>
                    <Badge
                      variant={
                        stock.technical.rsi > 70
                          ? 'destructive'
                          : stock.technical.rsi < 30
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {stock.technical.rsi > 70
                        ? 'Overbought'
                        : stock.technical.rsi < 30
                        ? 'Oversold'
                        : 'Neutral'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MACD Signal</span>
                    <Badge
                      variant={
                        stock.technical.macd.value > stock.technical.macd.signal
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {stock.technical.macd.value > stock.technical.macd.signal
                        ? 'Bullish'
                        : 'Bearish'}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="mb-3 text-muted-foreground">Price Levels</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-foreground">
                    <span>Current</span>
                    <span>₹{stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-500">
                    <span>Day High</span>
                    <span>₹{(stock.price * 1.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Day Low</span>
                    <span>₹{(stock.price * 0.98).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {!loading && !stock && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-muted-foreground">Search for a stock to analyze</h3>
            <p className="text-muted-foreground">
              Enter a ticker symbol to view detailed analysis and AI insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
