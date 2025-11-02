import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Moon, Sun, Bookmark, Settings } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { EventCard } from '../components/EventCard';
import { StockCard } from '../components/StockCard';
import { SectorHeatmap } from '../components/SectorHeatmap';
import { EventDetailModal } from '../components/EventDetailModal';
import { EventCardSkeleton, StockCardSkeleton } from '../components/SkeletonLoader';
import { useTheme } from '../utils/theme';
import { api, Event, Stock } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { mockEvents, mockSectors, mockTopMovers } from '../utils/mockData';

export function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('IN');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - 1);
      
      const data = await api.getEvents({
        since: since.toISOString(),
        impact: impactFilter || undefined,
        sector: sectorFilter || undefined,
        country: countryFilter || undefined,
      });
      
      setEvents(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast('Failed to load events. Using demo data.');
      
      // Use mock data as fallback
      setEvents(mockEvents);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [impactFilter, sectorFilter, countryFilter]);

  const handleRefresh = async () => {
    toast('Refreshing data...');
    try {
      await api.triggerRefresh();
      await fetchEvents();
      toast('Data refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast('Refresh failed, showing cached data');
    }
  };

  const handleSaveEvent = async (event: Event, note?: string, tags?: string[]) => {
    try {
      await api.saveItem({
        type: 'event',
        itemId: event.id,
        note,
        tags,
      });
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleOpenEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setDetailModalOpen(true);
  };

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.summary.toLowerCase().includes(query) ||
        event.affected_symbols.some(s => s.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-foreground">CatIQz</h2>
              <nav className="hidden md:flex gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/stocks')}>
                  Stock Analyzer
                </Button>
                <Button variant="ghost" onClick={() => navigate('/calendar')}>
                  Calendar
                </Button>
                <Button variant="ghost" onClick={() => navigate('/saved')}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground hidden md:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Search & Filters */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
              <div className="space-y-4">
                <div>
                  <label className="text-muted-foreground mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Ticker or topic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-muted-foreground mb-2 block">Impact Level</label>
                  <div className="flex flex-wrap gap-2">
                    {['High', 'Medium', 'Low'].map((level) => (
                      <Badge
                        key={level}
                        variant={impactFilter === level ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setImpactFilter(impactFilter === level ? '' : level)}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground mb-2 block">Sector</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                  >
                    <option value="">All Sectors</option>
                    <option value="Banks">Banks</option>
                    <option value="IT">IT</option>
                    <option value="Auto">Auto</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Energy">Energy</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-2 block">Country</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>

                <Button onClick={handleRefresh} className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </aside>

          {/* Middle - Live Feed */}
          <main className="col-span-12 lg:col-span-6">
            <div className="mb-4 flex items-center justify-between">
              <h3>Live Market Catalysts</h3>
              <Badge variant="outline">{filteredEvents.length} events</Badge>
            </div>

            <div className="space-y-4">
              {loading ? (
                <>
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </>
              ) : (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSave={handleSaveEvent}
                    onOpenDetail={handleOpenEventDetail}
                  />
                ))
              )}

              {!loading && filteredEvents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No events found matching your filters
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar - Insights */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <SectorHeatmap sectors={mockSectors} />

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="mb-4">Top Movers</h3>
              <div className="space-y-3">
                {mockTopMovers.map((stock) => (
                  <StockCard
                    key={stock.ticker}
                    stock={stock}
                    onClick={() => navigate(`/stocks?ticker=${stock.ticker}`)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="mb-3">Quick Analyze</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter ticker..."
                  className="pl-10"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/stocks?ticker=${e.currentTarget.value}`);
                    }
                  }}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
