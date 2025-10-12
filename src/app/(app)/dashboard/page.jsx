'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '@/store/portfolioSlice';
import { Badge } from '@/components/ui/badge';
import SummaryCards from '@/components/dashboard/SummaryCards';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SectorPie from '@/components/dashboard/SectorPie';
import TopPerformers from '@/components/dashboard/TopPerformers';
import RiskMetrics from '@/components/dashboard/RiskMetrics';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const dispatch = useDispatch();
  const {
    summary,
    performance,
    sectorAllocation,
    topPerformers,
    riskMetrics,
    loading,
    error,
  } = useSelector((state) => state.portfolio);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchDashboard());
      setLastUpdated(new Date());
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // Normalize performance data shape for chart
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

  const sectorPie = useMemo(() => {
    return Array.isArray(sectorAllocation) ? sectorAllocation : [];
  }, [sectorAllocation]);

  const performers = useMemo(() => {
    return Array.isArray(topPerformers) ? topPerformers : [];
  }, [topPerformers]);

  const metrics = riskMetrics ?? {
    sharpeRatio: null,
    volatility: null,
    maxDrawdown: null,
    beta: null,
  };

  useEffect(()=> {
    const fetchData = async () => {
      try {
        const res = await axios.post('/api/test-api', { tickers : ["RELIANCE","TCS","HDFCBANK"] });
        console.log(res.data);
        
      } catch (error) {
        console.error("Error fetchong test data, e: ", error);
      }
    }

    fetchData();
  }, [])





  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Overview of your investment portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="text-sm">
            {loading ? 'Loading…' : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {String(error)}
        </div>
      )}

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart performanceData={performanceData} />
        <SectorPie sectorPie={sectorPie} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformers performers={performers} />
        <RiskMetrics metrics={metrics} />
      </div>
    </div>
  );
}
