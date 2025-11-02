import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Sparkline } from './TinyChart';
import { Stock } from '../utils/api';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
}

export function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-foreground">{stock.ticker}</h4>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-muted-foreground">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="text-foreground">₹{stock.price.toFixed(2)}</div>
          <div className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {isPositive ? '+' : ''}
            {stock.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {stock.sparkline && stock.sparkline.length > 0 && (
        <div className="mb-3">
          <Sparkline data={stock.sparkline} />
        </div>
      )}

      <div className="flex gap-2">
        <Badge variant="outline" className="text-xs">
          PE: {stock.fundamentals.pe.toFixed(1)}
        </Badge>
        <Badge variant="outline" className="text-xs">
          RSI: {stock.technical.rsi.toFixed(0)}
        </Badge>
      </div>
    </div>
  );
}
