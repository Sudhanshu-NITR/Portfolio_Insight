'use client'
import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceTab from '@/components/analytics/PerformanceTab';
import AllocationTab from '@/components/analytics/AllocationTab';
import CorrelationTab from '@/components/analytics/CorrelationTab';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '@/store/portfolioSlice';

export default function AnalyticsPage() {  
  const dispatch = useDispatch();
  const {
    performance,
    sectorAllocation,
    holdings,
    loading,
    error,
  } = useSelector((state) => state.portfolio);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);


  // Performance Tab Data
  const performanceData = useMemo(() => {
    if (!Array.isArray(performance) || performance.length === 0) return [];

    const normalized = {};
    performance.forEach(p => {
      const key = String(p.name || p.name).toLowerCase();
      normalized[key] = Array.isArray(p.series) ? p.series : [];
    });

    const monthsSource =
      normalized.portfolio?.length > 0 ? normalized.portfolio
        : normalized.nifty?.length > 0 ? normalized.nifty
          : Object.values(normalized).find(s => s.length > 0) || [];

    const months = monthsSource.map(s => s.month);

    const data = months.map((m, i) => {
      const out = { month: m };

      const getVal = (series) => {
        if (!series) return null;
        const rec = series.find(r => r.month === m) || series[i] || null;
        return rec && typeof rec.growthPct === 'number' ? rec.growthPct : null;
      };

      out.portfolio = getVal(normalized.portfolio);
      out.nifty = getVal(normalized.nifty);
      out.sensex = getVal(normalized.sensex);
      return out;
    });

    return data;
  }, [performance]);

  // Performance Tab

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your portfolio performance</p>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          {/* <TabsTrigger value="risk">Risk Analysis</TabsTrigger> */}
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceTab
            performanceData={performanceData}
          />
        </TabsContent>

        <TabsContent value="allocation">
          <AllocationTab sectorAllocation={sectorAllocation} holdings={holdings}/>
        </TabsContent>

        <TabsContent value="correlation">
          <CorrelationTab performance={performance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
