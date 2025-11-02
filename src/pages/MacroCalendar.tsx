import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { api, CalendarEvent } from '../utils/api';

export function MacroCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN');

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const from = new Date(selectedDate);
      from.setDate(1);
      const to = new Date(selectedDate);
      to.setMonth(to.getMonth() + 1);
      to.setDate(0);

      const data = await api.getCalendar({
        country: selectedCountry,
        from: from.toISOString(),
        to: to.toISOString(),
      });
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      
      // Mock data for demo
      setEvents([
        {
          id: 'cal_1',
          date: new Date().toISOString(),
          country: 'IN',
          event: 'RBI Monetary Policy Decision',
          importance: 'High',
          forecast: '6.50%',
          previous: '6.50%',
          aiSummary: 'Expected to maintain status quo on rates due to inflation concerns',
          affectedMarkets: ['Banks', 'Fixed Income'],
        },
        {
          id: 'cal_2',
          date: new Date(Date.now() + 86400000).toISOString(),
          country: 'IN',
          event: 'CPI Inflation Data',
          importance: 'High',
          forecast: '5.2%',
          previous: '5.5%',
          aiSummary: 'Lower inflation reading could support dovish policy stance',
          affectedMarkets: ['Bonds', 'Currency'],
        },
        {
          id: 'cal_3',
          date: new Date(Date.now() + 172800000).toISOString(),
          country: 'IN',
          event: 'GDP Growth Numbers',
          importance: 'High',
          forecast: '6.8%',
          previous: '7.2%',
          aiSummary: 'Moderation expected but still healthy growth trajectory',
          affectedMarkets: ['Equity Indices', 'Currency'],
        },
        {
          id: 'cal_4',
          date: new Date(Date.now() + 259200000).toISOString(),
          country: 'IN',
          event: 'Manufacturing PMI',
          importance: 'Medium',
          forecast: '57.5',
          previous: '57.8',
          aiSummary: 'Expansion continues with slight moderation',
          affectedMarkets: ['Manufacturing', 'Industrials'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedDate, selectedCountry]);

  const impactColors = {
    High: 'border-red-500 bg-red-500/10',
    Medium: 'border-amber-500 bg-amber-500/10',
    Low: 'border-slate-500 bg-slate-500/10',
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const todayEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2>Macro Economic Calendar</h2>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="mb-4">
                <label className="text-muted-foreground mb-2 block">Country</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="EU">Eurozone</option>
                  <option value="JP">Japan</option>
                  <option value="CN">China</option>
                </select>
              </div>

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">High Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Medium Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-muted-foreground">Low Impact</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3>
                Events for {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <Badge variant="outline">{todayEvents.length} events</Badge>
            </div>

            <div className="space-y-4">
              {loading ? (
                <Card className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </Card>
              ) : todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={`p-6 border-l-4 ${impactColors[event.importance]}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{event.country}</Badge>
                          <Badge
                            variant={
                              event.importance === 'High'
                                ? 'destructive'
                                : event.importance === 'Medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {event.importance}
                          </Badge>
                        </div>
                        <h4 className="text-foreground mb-2">{event.event}</h4>
                        <p className="text-muted-foreground mb-3">{event.aiSummary}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {event.forecast && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-muted-foreground mb-1">Forecast</div>
                          <div className="text-foreground">{event.forecast}</div>
                        </div>
                      )}
                      {event.previous && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-muted-foreground mb-1">Previous</div>
                          <div className="text-foreground">{event.previous}</div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-muted-foreground mb-2">Affected Markets</div>
                      <div className="flex flex-wrap gap-2">
                        {event.affectedMarkets.map((market) => (
                          <Badge key={market} variant="secondary">
                            {market}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-muted-foreground mb-2">No events scheduled</h3>
                  <p className="text-muted-foreground">
                    No economic events found for this date
                  </p>
                </Card>
              )}
            </div>

            {/* Upcoming Events Preview */}
            {todayEvents.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4">This Week's Key Events</h3>
                <div className="grid gap-3">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDate(new Date(event.date))}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        event.importance === 'High' ? 'bg-red-500' :
                        event.importance === 'Medium' ? 'bg-amber-500' :
                        'bg-slate-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-foreground">{event.event}</div>
                        <div className="text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <Badge variant="outline">{event.country}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
