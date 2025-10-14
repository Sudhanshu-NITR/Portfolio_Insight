import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils';

const gainColor = (value) => (value >= 0 ? 'text-green-600' : 'text-red-600');

const gainIcon = (value) =>
  value >= 0 ? <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> : <TrendingDown className="w-3 h-3 mr-1 text-red-500" />;

export default function SummaryCards({ summary }) {
  const totalValue = summary?.totalValue ?? 0;
  const totalInvested = summary?.totalInvested ?? 0;
  const totalGainLoss = summary?.totalGainLoss ?? 0;
  const totalGainLossPercent = summary?.totalGainLossPercent ?? 0;
  const todayGainLoss = summary?.todayGainLoss ?? 0;
  const todayGainLossPercent = summary?.todayGainLossPercent ?? 0;

  const isUpToday = (todayGainLossPercent ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <div className={`flex items-center text-xs ${isUpToday ? 'text-green-600' : 'text-red-600'}`}>
            {gainIcon(todayGainLossPercent)}
            {formatPercent(todayGainLossPercent)} today
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
          <p className="text-xs text-muted-foreground">Total principal deployed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${gainColor(totalGainLoss)}`}>
            {formatCurrency(totalGainLoss)}
          </div>
          <div className={`text-xs ${gainColor(totalGainLossPercent)}`}>
            {formatPercent(totalGainLossPercent)} overall
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${gainColor(todayGainLoss)}`}>
            {formatCurrency(todayGainLoss)}
          </div>
          <div className={`text-xs ${gainColor(todayGainLossPercent)}`}>
            {formatPercent(todayGainLossPercent)} change
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
