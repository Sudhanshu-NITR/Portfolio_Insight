"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import axios from 'axios';

const portfolioData = {
  totalValue: 1250000,
  totalInvested: 1000000,
  totalGainLoss: 250000,
  totalGainLossPercent: 25.0,
  todayGainLoss: 15000,
  todayGainLossPercent: 1.2
};

const performanceData = [
  { date: '2024-01', portfolio: 1000000, nifty: 100 },
  { date: '2024-02', portfolio: 1050000, nifty: 105 },
  { date: '2024-03', portfolio: 980000, nifty: 98 },
  { date: '2024-04', portfolio: 1120000, nifty: 112 },
  { date: '2024-05', portfolio: 1180000, nifty: 118 },
  { date: '2024-06', portfolio: 1250000, nifty: 125 }
];

const sectorAllocation = [
  { name: 'IT', value: 35, amount: 437500, color: '#8884d8' },
  { name: 'Banking', value: 25, amount: 312500, color: '#82ca9d' },
  { name: 'Pharma', value: 15, amount: 187500, color: '#ffc658' },
  { name: 'Auto', value: 12, amount: 150000, color: '#ff7c7c' },
  { name: 'FMCG', value: 8, amount: 100000, color: '#8dd1e1' },
  { name: 'Others', value: 5, amount: 62500, color: '#d084d0' }
];

const topPerformers = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', gain: 15.2, value: 125000 },
  { symbol: 'INFY', name: 'Infosys Limited', gain: 12.8, value: 98000 },
  { symbol: 'HDFC', name: 'HDFC Bank', gain: 8.5, value: 87500 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', gain: 6.2, value: 156000 }
];

const marketMetrics = {
  sharpeRatio: 1.34,
  volatility: 18.5,
  maxDrawdown: -12.3,
  beta: 1.02
};

export default function Dashboard() {
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

  // useEffect(() => {
  //   // 1. Define an async function inside the effect
  //   const fetchData = async () => {
  //     try {
  //       // const res = await fetch('/api/dashboard-data'); // 'GET' is the default method
  //       const res = await axios.get(
  //         '/api/dashboard-data',
  //         {
  //           withCredentials: true
  //         }
  //       );

  //       // 2. Check if the response was successful
  //       // if (!res.ok) {
  //       //   throw new Error(`HTTP error! Status: ${res.status}`);
  //       // }

  //       // 3. You need to parse the response body to see the data
  //       // const data = await res.json();
  //       console.log("Data from API:", res);

  //     } catch (e) {
  //       console.error("Failed to fetch dashboard data:", e);
  //     }
  //   };

  //   // 4. Call the async function
  //   fetchData();

  // }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Overview of your investment portfolio</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              {formatPercent(portfolioData.todayGainLossPercent)} today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Your total investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(portfolioData.totalGainLoss)}
            </div>
            <div className="text-xs text-green-600">
              {formatPercent(portfolioData.totalGainLossPercent)} overall
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(portfolioData.todayGainLoss)}
            </div>
            <div className="text-xs text-green-600">
              {formatPercent(portfolioData.todayGainLossPercent)} change
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Portfolio Performance vs Nifty 50</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'portfolio' ? formatCurrency(value) : `${value}%`,
                    name === 'portfolio' ? 'Portfolio' : 'Nifty 50'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="portfolio"
                />
                <Line
                  type="monotone"
                  dataKey="nifty"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="nifty"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
                <RechartsPieChart
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sectorAllocation.map((sector) => (
                <div key={sector.name} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: sector.color }}
                  />
                  <span className="text-muted-foreground">{sector.name}: {sector.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(stock.value)}</p>
                    <p className="text-sm text-green-600">{formatPercent(stock.gain)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sharpe Ratio</span>
                  <span className="font-medium">{marketMetrics.sharpeRatio}</span>
                </div>
                <Progress value={Math.min(marketMetrics.sharpeRatio * 50, 100)} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Volatility</span>
                  <span className="font-medium">{marketMetrics.volatility}%</span>
                </div>
                <Progress value={marketMetrics.volatility * 2} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Max Drawdown</span>
                  <span className="font-medium text-red-600">{marketMetrics.maxDrawdown}%</span>
                </div>
                <Progress value={Math.abs(marketMetrics.maxDrawdown) * 5} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Beta (vs Nifty)</span>
                  <span className="font-medium">{marketMetrics.beta}</span>
                </div>
                <Progress value={marketMetrics.beta * 50} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}