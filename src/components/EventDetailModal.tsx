import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Event } from '../utils/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Bookmark,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
} from 'lucide-react';
import { TinyChart } from './TinyChart';
import { toast } from 'sonner@2.0.3';

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (event: Event, note: string, tags: string[]) => void;
}

export function EventDetailModal({
  event,
  open,
  onOpenChange,
  onSave,
}: EventDetailModalProps) {
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  if (!event) return null;

  const impactColors = {
    High: 'text-red-500 border-red-500',
    Medium: 'text-amber-500 border-amber-500',
    Low: 'text-slate-500 border-slate-500',
  };

  const sentimentIcons = {
    bullish: <TrendingUp className="w-5 h-5 text-green-500" />,
    bearish: <TrendingDown className="w-5 h-5 text-red-500" />,
    neutral: <Minus className="w-5 h-5 text-slate-500" />,
  };

  const handleSave = () => {
    onSave?.(event, note, tags);
    toast('Event saved with your notes');
    setNote('');
    setTags([]);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Mock price data for demonstration
  const mockPriceData = Array.from({ length: 24 }, (_, i) => 
    100 + Math.random() * 10 - 5
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {sentimentIcons[event.sentiment]}
              <span>{event.title}</span>
            </div>
            <Badge
              variant="outline"
              className={`${impactColors[event.impact_level]}`}
            >
              {event.impact_level} Impact
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div>
            <h4 className="mb-2 text-muted-foreground">AI Summary</h4>
            <p className="text-foreground">{event.summary}</p>
          </div>

          {/* Reasoning */}
          <div>
            <h4 className="mb-2 text-muted-foreground">Analysis</h4>
            <p className="text-foreground">{event.reasoning}</p>
          </div>

          {/* Probability & Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-muted-foreground mb-1">Probability</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${event.probability}%` }}
                  />
                </div>
                <span className="text-foreground">{event.probability}%</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-muted-foreground mb-1">Model Used</div>
              <div className="text-foreground">{event.model_used}</div>
            </div>
          </div>

          {/* Affected Sectors & Symbols */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 text-muted-foreground">Affected Sectors</h4>
              <div className="flex flex-wrap gap-2">
                {event.affected_sectors.map((sector) => (
                  <Badge key={sector} variant="secondary">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-muted-foreground">Affected Symbols</h4>
              <div className="flex flex-wrap gap-2">
                {event.affected_symbols.map((symbol) => (
                  <Badge key={symbol} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 24h Price Chart */}
          <div>
            <h4 className="mb-2 text-muted-foreground">24-72h Price Movement (Primary Symbol)</h4>
            <div className="bg-muted/50 rounded-lg p-4 h-32">
              <TinyChart data={mockPriceData} color="#60A5FA" height={96} />
            </div>
          </div>

          {/* Provenance */}
          <div>
            <h4 className="mb-2 text-muted-foreground">Provenance</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex gap-4">
                {Object.entries(event.provenance.weights).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="capitalize text-muted-foreground">{key}:</span>
                    <span className="text-foreground">{value}%</span>
                  </div>
                ))}
              </div>
              {event.provenance.similar_event_ids.length > 0 && (
                <div className="text-muted-foreground">
                  Similar events: {event.provenance.similar_event_ids.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Sources */}
          <div>
            <h4 className="mb-2 text-muted-foreground">Sources</h4>
            <div className="space-y-2">
              {event.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{source.name}</span>
                  <span className="text-muted-foreground">
                    • {new Date(source.ts).toLocaleString()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Save with Note */}
          <div className="border-t border-border pt-4">
            <h4 className="mb-3 text-muted-foreground">Save Event</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add your analysis or reminders..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                <Bookmark className="w-4 h-4 mr-2" />
                Save Event
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
