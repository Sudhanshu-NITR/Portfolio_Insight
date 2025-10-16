import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function RiskMetrics({ metrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Sharpe Ratio</span>
              <span className="font-medium">{metrics.sharpeRatio ?? '—'}</span>
            </div>
            <Progress value={Math.min(((metrics.sharpeRatio ?? 0) * 50), 100)} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Volatility</span>
              <span className="font-medium">{metrics.volatility != null ? `${metrics.volatility}%` : '—'}</span>
            </div>
            <Progress value={Math.min(((metrics.volatility ?? 0) * 2), 100)} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Max Drawdown</span>
              <span className="font-medium text-red-600">
                {metrics.maxDrawdown != null ? `${metrics.maxDrawdown}%` : '—'}
              </span>
            </div>
            <Progress value={Math.min(Math.abs(metrics.maxDrawdown ?? 0) * 5, 100)} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Beta (vs Nifty)</span>
              <span className="font-medium">{metrics.beta ?? '—'}</span>
            </div>
            <Progress value={Math.min(((metrics.beta ?? 0) * 50), 100)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}