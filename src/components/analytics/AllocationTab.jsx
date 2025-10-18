'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import SectorPie from '@/components/dashboard/SectorPie';
import { useMemo } from 'react';

export default function AllocationTab({ sectorAllocation, holdings }) {
    // 🧮 Calculate average returns per sector from holdings
    const sectorReturns = useMemo(() => {
        if (!holdings || holdings.length === 0) return [];
        const grouped = {};

        holdings.forEach((h) => {
            if (!grouped[h.sector]) grouped[h.sector] = { total: 0, count: 0 };
            grouped[h.sector].total += h.gainPct;
            grouped[h.sector].count += 1;
        });

        return Object.entries(grouped).map(([sector, { total, count }]) => ({
            name: sector,
            returns: total / count,
        }));
    }, [holdings]);

    // 🔗 Merge sectorAllocation + returns for combined chart
    const sectorAnalysis = useMemo(() => {
        if (!sectorAllocation || sectorAllocation.length === 0) return [];
        return sectorAllocation.map((s) => {
            const match = sectorReturns.find((r) => r.name === s.name);
            return {
                sector: s.name,
                allocation: s.value, // %
                returns: match ? match.returns : 0, // avg gain %
            };
        });
    }, [sectorAllocation, sectorReturns]);

    const formatPercent = (value) => `${value.toFixed(2)}%`;


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Sector Allocation Pie (component) */}
            <SectorPie sectorPie={sectorAllocation} />

            {/* Right: Allocation vs Returns */}
            <Card>
                <CardHeader>
                    <CardTitle>Allocation vs Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sectorAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sector" />
                            <YAxis yAxisId="left" orientation="left" tickFormatter={formatPercent} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={formatPercent} />
                            <Tooltip formatter={(value) => formatPercent(value)} />
                            <Bar
                                yAxisId="left"
                                dataKey="allocation"
                                fill="#8884d8"
                                name="Allocation %"
                                radius={[3, 3, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="returns"
                                fill="#82ca9d"
                                name="Returns %"
                                radius={[3, 3, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
