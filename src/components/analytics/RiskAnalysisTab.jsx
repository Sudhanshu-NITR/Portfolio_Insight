'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RiskAnalysisTab({ riskReturnData, metrics, sectorAnalysis }) {
  const formatPercent = (percent) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk-Return Scatter */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Risk-Return Analysis by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={riskReturnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk" name="Risk (%)" />
              <YAxis dataKey="return" name="Return (%)" />
              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'risk' ? 'Volatility' : 'Returns'
                ]}
                labelFormatter={(label, payload) => payload?.payload?.sector}
              />
              <Scatter dataKey="return" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Beta (vs Nifty)</span>
              <Badge variant="outline">{metrics.beta}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Alpha</span>
              <Badge variant="outline" className="text-green-600">
                {formatPercent(metrics.alpha)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>VaR (95%)</span>
              <Badge variant="outline" className="text-red-600">
                {formatPercent(metrics.var95)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Information Ratio</span>
              <Badge variant="outline">0.78</Badge>
            </div>
            <div className="flex justify-between">
              <span>Tracking Error</span>
              <Badge variant="outline">4.2%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector Risk Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sectorAnalysis.map((sector) => (
              <div key={sector.sector} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{sector.sector}</span>
                  <span>{sector.volatility}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(sector.volatility / 40) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
