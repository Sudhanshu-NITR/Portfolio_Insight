import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercent = (percent) => {
  if (percent === null || percent === undefined || !isFinite(percent)) return '—';
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

const gainColor = (value) => (value >= 0 ? 'text-green-600' : 'text-red-600');

export default function TopPerformers({ performers }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.map((stock) => (
            <div key={`${stock.symbol}:${stock.exchange}`} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{stock.symbol}</p>
                <p className="text-sm text-muted-foreground">{stock.exchange}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(stock.value)}</p>
                <p className={`text-sm ${gainColor(stock.gain)}`}>{formatPercent(stock.gain)}</p>
              </div>
            </div>
          ))}
          {performers.length === 0 && (
            <p className="text-sm text-muted-foreground">No performers to display.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}