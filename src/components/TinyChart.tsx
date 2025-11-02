import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface TinyChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function TinyChart({ data, color = '#60A5FA', height = 40 }: TinyChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface SparklineProps {
  data: number[];
  className?: string;
}

export function Sparkline({ data, className = '' }: SparklineProps) {
  const isPositive = data[data.length - 1] > data[0];
  const color = isPositive ? '#10B981' : '#EF4444';

  return (
    <div className={className}>
      <TinyChart data={data} color={color} height={32} />
    </div>
  );
}
