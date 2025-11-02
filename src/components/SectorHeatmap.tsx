import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Sector {
  name: string;
  change: number;
  events: number;
}

interface SectorHeatmapProps {
  sectors: Sector[];
}

export function SectorHeatmap({ sectors }: SectorHeatmapProps) {
  const getColorClass = (change: number) => {
    if (change > 2) return 'bg-green-600 text-white';
    if (change > 0.5) return 'bg-green-500 text-white';
    if (change > 0) return 'bg-green-400 text-white';
    if (change > -0.5) return 'bg-red-400 text-white';
    if (change > -2) return 'bg-red-500 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="mb-4">Sector Heatmap</h3>
      <div className="grid grid-cols-2 gap-2">
        {sectors.slice(0, 6).map((sector) => (
          <div
            key={sector.name}
            className={`rounded-lg p-3 transition-all hover:scale-105 cursor-pointer ${getColorClass(
              sector.change
            )}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="truncate">{sector.name}</span>
              {sector.change >= 0 ? (
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>
                {sector.change >= 0 ? '+' : ''}
                {sector.change.toFixed(2)}%
              </span>
              <span className="opacity-80">{sector.events} events</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
