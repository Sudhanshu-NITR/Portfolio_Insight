'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Scatter,
  ScatterChart
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// Mock data for analytics
const performanceData = [
  { date: '2024-01', portfolio: 1000000, nifty: 100, sensex: 105 },
  { date: '2024-02', portfolio: 1050000, nifty: 105, sensex: 110 },
  { date: '2024-03', portfolio: 980000, nifty: 98, sensex: 102 },
  { date: '2024-04', portfolio: 1120000, nifty: 112, sensex: 118 },
  { date: '2024-05', portfolio: 1180000, nifty: 118, sensex: 125 },
  { date: '2024-06', portfolio: 1250000, nifty: 125, sensex: 132 }
];

const monthlyReturns = [
  { month: 'Jan', returns: 5.2 },
  { month: 'Feb', returns: -2.1 },
  { month: 'Mar', returns: 14.3 },
  { month: 'Apr', returns: 5.4 },
  { month: 'May', returns: -1.8 },
  { month: 'Jun', returns: 5.9 }
];

const sectorAnalysis = [
  { sector: 'IT', allocation: 35, returns: 18.5, volatility: 22.1 },
  { sector: 'Banking', allocation: 25, returns: 12.3, volatility: 28.4 },
  { sector: 'Pharma', allocation: 15, returns: 8.7, volatility: 31.2 },
  { sector: 'Auto', allocation: 12, returns: -2.1, volatility: 35.8 },
  { sector: 'FMCG', allocation: 8, returns: 6.4, volatility: 18.9 },
  { sector: 'Others', allocation: 5, returns: 3.2, volatility: 25.6 }
];

const riskReturnData = sectorAnalysis.map(sector => ({
  sector: sector.sector,
  risk: sector.volatility,
  return: sector.returns,
  allocation: sector.allocation
}));

const drawdownData = [
  { date: '2024-01', drawdown: 0 },
  { date: '2024-02', drawdown: -2.1 },
  { date: '2024-03', drawdown: -6.7 },
  { date: '2024-04', drawdown: -3.2 },
  { date: '2024-05', drawdown: -1.8 },
  { date: '2024-06', drawdown: 0 }
];

const correlationMatrix = [
  { asset: 'Portfolio', portfolio: 1.00, nifty: 0.85, sensex: 0.82 },
  { asset: 'Nifty 50', portfolio: 0.85, nifty: 1.00, sensex: 0.94 },
  { asset: 'Sensex', portfolio: 0.82, nifty: 0.94, sensex: 1.00 }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6M');
  const [selectedMetric, setSelectedMetric] = useState('returns');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const metrics = {
    totalReturn: 25.0,
    annualizedReturn: 18.5,
    volatility: 22.3,
    sharpeRatio: 1.34,
    maxDrawdown: -6.7,
    beta: 1.02,
    alpha: 3.2,
    var95: -4.2
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your portfolio performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1M">1 Month</SelectItem>
            <SelectItem value="3M">3 Months</SelectItem>
            <SelectItem value="6M">6 Months</SelectItem>
            <SelectItem value="1Y">1 Year</SelectItem>
            <SelectItem value="3Y">3 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercent(metrics.totalReturn)}
            </div>
            <p className="text-xs text-muted-foreground">Since inception</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.volatility}%</div>
            <p className="text-xs text-muted-foreground">Annualized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPercent(metrics.maxDrawdown)}
            </div>
            <p className="text-xs text-muted-foreground">Peak to trough</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio vs Benchmark */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Performance vs Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'portfolio' ? formatCurrency(value) : `${value}%`,
                        name === 'portfolio' ? 'Portfolio' : name === 'nifty' ? 'Nifty 50' : 'Sensex'
                      ]}
                    />
                    <Line type="monotone" dataKey="portfolio" stroke="#8884d8" strokeWidth={3} name="portfolio" />
                    <Line type="monotone" dataKey="nifty" stroke="#82ca9d" strokeWidth={2} name="nifty" />
                    <Line type="monotone" dataKey="sensex" stroke="#ffc658" strokeWidth={2} name="sensex" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Returns */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyReturns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPercent(value), 'Returns']} />
                    <Bar
                      dataKey="returns"
                      fill={(entry) => entry >= 0 ? '#22c55e' : '#ef4444'}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Drawdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={drawdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPercent(value), 'Drawdown']} />
                    <Area
                      type="monotone"
                      dataKey="drawdown"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
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
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.sector}
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
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Current Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                    <PieChart
                      data={sectorAnalysis}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="allocation"
                      nameKey="sector"
                    >
                      {sectorAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </PieChart>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Allocation vs Returns */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation vs Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="allocation" fill="#8884d8" name="Allocation %" />
                    <Bar yAxisId="right" dataKey="returns" fill="#82ca9d" name="Returns %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2"></th>
                      {correlationMatrix.map((item) => (
                        <th key={item.asset} className="text-center p-2 text-sm">
                          {item.asset}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.map((row) => (
                      <tr key={row.asset}>
                        <td className="p-2 font-medium text-sm">{row.asset}</td>
                        <td className="p-2 text-center">
                          <Badge variant={row.portfolio === 1.00 ? "default" : "secondary"}>
                            {row.portfolio.toFixed(2)}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant={row.nifty === 1.00 ? "default" : "secondary"}>
                            {row.nifty.toFixed(2)}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant={row.sensex === 1.00 ? "default" : "secondary"}>
                            {row.sensex.toFixed(2)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}