'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/utils';

const sectorColor = {
  IT: '#8884d8',
  Banking: '#82ca9d',
  Energy: '#ffab40',
  Pharma: '#ffc658',
  Auto: '#ff7c7c',
  FMCG: '#8dd1e1',
  Infrastructure: '#607d8b',
  Others: '#d084d0'
};

export default function SectorPie({ sectorPie }) {
  if (!sectorPie || sectorPie.length === 0) return null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Sector Allocation
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {/* Pie Chart */}
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'hsl(var(--background))',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                }}
                formatter={(value, name) => [formatCurrency(value), name]}
              />
              <Pie
                data={sectorPie}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={3}
                cornerRadius={4}
                dataKey="amount"
                nameKey="name"
                label={({ name, value }) => `${name}\n${formatCurrency(value)}`}
                labelLine={false}
              >
                {sectorPie.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={sectorColor[entry.name] || '#BDBDBD'}
                    stroke="none"
                  />
                ))}
              </Pie>


            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {sectorPie.map((sector) => (
            <div key={sector.name} className="flex items-center">
              <div
                className="w-3.5 h-3.5 rounded-full mr-2"
                style={{ backgroundColor: sectorColor[sector.name] || '#BDBDBD' }}
              />
              <span className="truncate">
                {sector.name}: {(sector.value?.toFixed(1) ?? 0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
