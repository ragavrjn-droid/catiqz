import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Trash2, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EventCard } from '../components/EventCard';
import { StockCard } from '../components/StockCard';
import { api, SavedItem } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function SavedCollections() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      const items = await api.getSavedItems();
      setSavedItems(items);
    } catch (error) {
      console.error('Failed to fetch saved items:', error);
      
      // Mock data for demo
      setSavedItems([
        {
          id: 'saved_1',
          type: 'event',
          itemId: 'evt_123',
          note: 'Important for banking sector analysis',
          tags: ['banking', 'rates', 'watchlist'],
          savedAt: new Date(Date.now() - 86400000).toISOString(),
          data: {
            id: 'evt_123',
            title: 'RBI signals rate pause after inflation data',
            summary: 'RBI likely to hold rates due to sticky CPI',
            sentiment: 'bearish',
            impact_level: 'High',
            probability: 85,
            affected_sectors: ['Banks', 'NBFC'],
            affected_symbols: ['BANKNIFTY', 'HDFCBANK'],
            sources: [{ name: 'Reuters', url: '#', ts: new Date().toISOString() }],
            reasoning: 'Higher inflation pressure',
            model_used: 'mistral-instruct-1',
            provenance: { weights: { source: 15 }, similar_event_ids: [] },
            timestamp: new Date().toISOString(),
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSavedItem(id);
      setSavedItems(savedItems.filter((item) => item.id !== id));
      toast('Item removed from saved');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast('Failed to remove item');
    }
  };

  const handleExportPDF = () => {
    toast('Exporting to PDF...');
    // In a real app, generate PDF with saved items
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast('Share link copied to clipboard');
  };

  const eventItems = savedItems.filter((item) => item.type === 'event');
  const stockItems = savedItems.filter((item) => item.type === 'stock');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2>Saved Collections</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({savedItems.length})
            </TabsTrigger>
            <TabsTrigger value="events">
              Events ({eventItems.length})
            </TabsTrigger>
            <TabsTrigger value="stocks">
              Stocks ({stockItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <Card className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ) : savedItems.length > 0 ? (
              savedItems.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      {item.type === 'event' ? (
                        <EventCard event={item.data as any} />
                      ) : (
                        <StockCard stock={item.data as any} />
                      )}
                      
                      {item.note && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="text-muted-foreground mb-1">Your Note</div>
                              <p className="text-foreground">{item.note}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 text-muted-foreground">
                        Saved {new Date(item.savedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-muted-foreground mb-2">No saved items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Save events and stocks from the dashboard to build your personalized collection
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {eventItems.length > 0 ? (
              eventItems.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <EventCard event={item.data as any} />
                      
                      {item.note && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="text-muted-foreground mb-1">Your Note</div>
                              <p className="text-foreground">{item.note}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No saved events</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stocks" className="space-y-4">
            {stockItems.length > 0 ? (
              stockItems.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <StockCard stock={item.data as any} />
                      
                      {item.note && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="text-muted-foreground mb-1">Your Note</div>
                              <p className="text-foreground">{item.note}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No saved stocks</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
