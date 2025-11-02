import React from "react";
import {
  Bookmark,
  ExternalLink,
  Share2,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Event } from "../utils/api";
import { toast } from "sonner";

interface EventCardProps {
  event: Event;
  onSave?: (event: Event) => void;
  onOpenDetail?: (event: Event) => void;
  onShare?: (event: Event) => void;
}

export function EventCard({
  event,
  onSave,
  onOpenDetail,
  onShare,
}: EventCardProps) {
  const impactColors: Record<string, string> = {
    High: "bg-red-500",
    Medium: "bg-amber-500",
    Low: "bg-slate-400",
  };

  const sentimentIcons: Record<string, JSX.Element> = {
    bullish: <TrendingUp className="w-4 h-4 text-green-500" />,
    bearish: <TrendingDown className="w-4 h-4 text-red-500" />,
    neutral: <Minus className="w-4 h-4 text-slate-500" />,
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(event);
    toast("Saved");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(event);
    navigator.clipboard.writeText(window.location.origin + "/event/" + event.id);
    toast("Link copied to clipboard");
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // ✅ Safe handling for missing or empty sources
  const sourceName =
    event?.sources?.[0]?.name && event.sources[0].name.length > 0
      ? event.sources[0].name
      : "Unknown Source";

  const sourceInitial = sourceName.substring(0, 1).toUpperCase();

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={() => onOpenDetail?.(event)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {sourceInitial}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground">
              {timeAgo(event.timestamp)}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                impactColors[event.impact_level] || "bg-gray-400"
              }`}
            />
            <Badge variant="outline" className="text-xs">
              {event.impact_level || "N/A"}
            </Badge>
            {sentimentIcons[event.sentiment || "neutral"]}
          </div>

          <h3 className="mb-2 text-foreground">{event.title}</h3>

          <p className="text-muted-foreground mb-3 line-clamp-2">
            {event.summary}
          </p>

          {event.affected_sectors?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {event.affected_sectors.slice(0, 3).map((sector) => (
                <Badge key={sector} variant="secondary" className="text-xs">
                  {sector}
                </Badge>
              ))}
              {event.affected_sectors.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.affected_sectors.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.(event);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Details
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
