import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function PerformanceChart({ performanceData }) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Portfolio Performance vs Nifty 50</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickMargin={15}/>
            <YAxis
              tickFormatter={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
              domain={[
                (dataMin) => (dataMin - Math.abs(dataMin * 0.10)),
                (dataMax) => (dataMax + Math.abs(dataMax * 0.10))
              ]}
              allowDataOverflow={false}
              tickMargin={10}
            />
            <Tooltip
              formatter={(value, name) => {
                if (value == null) return ['—', name];
                const formatted = `${Number(value).toFixed(2)}%`;
                return [formatted, name === 'portfolio' ? 'Portfolio' : (name === 'nifty' ? 'Nifty 50' : 'Sensex')];
              }}
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
            <Line
              type="monotone"
              dataKey="sensex"
              stroke="#ffab40"
              strokeWidth={2}
              name="sensex"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
