import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const sectorColor = {
  IT: '#8884d8',
  Banking: '#82ca9d',
  Energy: '#ffab40',
  Pharma: '#ffc658',
  Auto: '#ff7c7c',
  FMCG: '#8dd1e1',
  Others: '#d084d0'
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function SectorPie({ sectorPie }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
            <Pie
              data={sectorPie}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
              nameKey="name"
            >
              {sectorPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={sectorColor[entry.name] || '#BDBDBD'} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {sectorPie.map((sector) => (
            <div key={sector.name} className="flex items-center text-sm">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: sectorColor[sector.name] || '#BDBDBD' }}
              />
              <span className="text-muted-foreground">
                {sector.name}: {(sector.value?.toFixed(2) ?? 0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
