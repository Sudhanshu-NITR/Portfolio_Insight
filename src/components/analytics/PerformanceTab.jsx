'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { useMemo } from 'react';

export default function PerformanceTab({ performanceData }) {

    const monthlyReturns = useMemo(() => {
        if (!performanceData || performanceData.length < 2) return [];
        return performanceData.slice(1).map((item, i) => ({
            month: item.month,
            portfolio: ((item.portfolio - performanceData[i].portfolio) / performanceData[i].portfolio * 100),
            nifty: ((item.nifty - performanceData[i].nifty) / performanceData[i].nifty * 100),
            sensex: ((item.sensex - performanceData[i].sensex) / performanceData[i].sensex * 100),
        }));
    }, [performanceData]);

    const drawdownData = useMemo(() => {
        if (!performanceData || performanceData.length === 0) return [];
        let peak = performanceData[0].portfolio;
        return performanceData.map(item => {
            peak = Math.max(peak, item.portfolio);
            const dd = ((item.portfolio - peak) / peak * 100);
            return { month: item.month, drawdown: dd };
        });
    }, [performanceData]);

    const formatPercent = (percent) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;

    return (
        <div className="space-y-6">
            <div className="w-full">
                <PerformanceChart performanceData={performanceData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <Tooltip formatter={(value) => [formatPercent(value), 'Portfolio Return']} />
                                <Bar dataKey="portfolio" radius={[2, 2, 0, 0]}>
                                    {monthlyReturns.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.portfolio >= 0 ? '#22c55e' : '#ef4444'}
                                        />
                                    ))}
                                </Bar>
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
                                <XAxis dataKey="month" />
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
        </div>
    );
}
