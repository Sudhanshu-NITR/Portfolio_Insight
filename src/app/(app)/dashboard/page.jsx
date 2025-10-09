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





// 'use client';
// import React, { useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDashboard } from '@/store/portfolioSlice';

// // =================== UI Imports =================== //
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import {
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   BarChart3,
//   Activity
// } from 'lucide-react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart as RechartsPieChart,
//   Cell,
//   Pie
// } from 'recharts';
// // =================== UI Imports =================== //

// const sectorColor = {
//   IT: '#8884d8',
//   Banking: '#82ca9d',
//   Energy: '#ffab40',
//   Pharma: '#ffc658',
//   Auto: '#ff7c7c',
//   FMCG: '#8dd1e1',
//   Others: '#d084d0'
// }

// export default function Dashboard() {
//   const dispatch = useDispatch();
//   const {
//     summary,
//     performance,
//     sectorAllocation,
//     topPerformers,
//     riskMetrics,
//     loading,
//     error,
//   } = useSelector((state) => state.portfolio);

//   useEffect(() => {
//     dispatch(fetchDashboard());
//   }, [dispatch]);

//   const formatCurrency = (amount) => {
//     if (amount === null || amount === undefined) return '—';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatPercent = (percent) => {
//     if (percent === null || percent === undefined || !isFinite(percent)) return '—';
//     const sign = percent >= 0 ? '+' : '';
//     return `${sign}${percent.toFixed(2)}%`;
//   };

//   // Derived values with safe fallbacks
//   const totalValue = summary?.totalValue ?? 0;
//   const totalInvested = summary?.totalInvested ?? 0;
//   const totalGainLoss = summary?.totalGainLoss ?? 0;
//   const totalGainLossPercent = summary?.totalGainLossPercent ?? 0;
//   const todayGainLoss = summary?.todayGainLoss ?? 0;
//   const todayGainLossPercent = summary?.todayGainLossPercent ?? 0;

//   // Normalize performance data shape for chart
//   const performanceData = useMemo(() => {
//     if (!Array.isArray(performance) || performance.length === 0) return [];

//     // normalize names to lowercase keys we expect
//     const normalized = {};
//     performance.forEach(p => {
//       const key = String(p.name || p.name).toLowerCase(); // e.g., 'portfolio' / 'nifty' / 'sensex'
//       normalized[key] = Array.isArray(p.series) ? p.series : [];
//     });

//     // find months list (take from portfolio first, else from nifty, else from any series)
//     const monthsSource =
//       normalized.portfolio?.length > 0 ? normalized.portfolio
//         : normalized.nifty?.length > 0 ? normalized.nifty
//           : Object.values(normalized).find(s => s.length > 0) || [];

//     const months = monthsSource.map(s => s.month);

//     // build flat array for recharts
//     const data = months.map((m, i) => {
//       const out = { month: m };

//       // helper to pull value at index i or by matching month
//       const getVal = (series) => {
//         if (!series) return null;
//         // prefer matching by month (safer if series orders differ)
//         const rec = series.find(r => r.month === m) || series[i] || null;
//         return rec && typeof rec.growthPct === 'number' ? rec.growthPct : null;
//       };

//       out.portfolio = getVal(normalized.portfolio);
//       out.nifty = getVal(normalized.nifty);
//       out.sensex = getVal(normalized.sensex);

//       return out;
//     });

//     return data;
//   }, [performance]);

//   // Normalize sector allocation for pie
//   const sectorPie = useMemo(() => {
//     // Expected server DTO: [{ name, value: percent, amount }]
//     return Array.isArray(sectorAllocation) ? sectorAllocation : [];
//   }, [sectorAllocation]);

//   const performers = useMemo(() => {
//     // Expected server DTO: [{ symbol, name, gain, value }]
//     return Array.isArray(topPerformers) ? topPerformers : [];
//   }, [topPerformers]);

//   const metrics = riskMetrics ?? {
//     // TODO: server to populate real metrics; these are display fallbacks
//     sharpeRatio: null,
//     volatility: null,
//     maxDrawdown: null,
//     beta: null,
//   };

//   const isUpToday = (todayGainLossPercent ?? 0) >= 0;
//   const gainColor = (value) => (value >= 0 ? 'text-green-600' : 'text-red-600');
//   const gainIcon = (value) =>
//     value >= 0 ? <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> : <TrendingDown className="w-3 h-3 mr-1 text-red-500" />;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
//           <p className="text-muted-foreground">Overview of your investment portfolio</p>
//         </div>
//         <Badge variant="outline" className="text-sm">
//           {loading ? 'Loading…' : `Last updated: ${new Date().toLocaleTimeString()}`}
//         </Badge>
//       </div>

//       {error && (
//         <div className="text-sm text-red-600">
//           {String(error)}
//         </div>
//       )}

//       {/* Portfolio Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
//             <div className={`flex items-center text-xs ${isUpToday ? 'text-green-600' : 'text-red-600'}`}>
//               {gainIcon(todayGainLossPercent)}
//               {formatPercent(todayGainLossPercent)} today
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
//             <p className="text-xs text-muted-foreground">Total principal deployed</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${gainColor(totalGainLoss)}`}>
//               {formatCurrency(totalGainLoss)}
//             </div>
//             <div className={`text-xs ${gainColor(totalGainLossPercent)}`}>
//               {formatPercent(totalGainLossPercent)} overall
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
//             <BarChart3 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${gainColor(todayGainLoss)}`}>
//               {formatCurrency(todayGainLoss)}
//             </div>
//             <div className={`text-xs ${gainColor(todayGainLossPercent)}`}>
//               {formatPercent(todayGainLossPercent)} change
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Performance Chart */}
//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <CardTitle>Portfolio Performance vs Nifty 50</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={performanceData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" tickMargin={15}/>
//                 <YAxis
//                   tickFormatter={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
//                   domain={[
//                     (dataMin) => (dataMin - Math.abs(dataMin * 0.10)),
//                     (dataMax) => (dataMax + Math.abs(dataMax * 0.10))
//                   ]}
//                   // This prevents numbers from being cropped at the edges
//                   allowDataOverflow={false}
//                   tickMargin={10}
//                 />
//                 <Tooltip
//                   formatter={(value, name) => {
//                     // value may be null
//                     if (value == null) return ['—', name];
//                     // name is the dataKey (portfolio/nifty/sensex) or the 'name' prop of the Line
//                     // Show percent with sign
//                     const formatted = `${Number(value).toFixed(2)}%`;
//                     return [formatted, name === 'portfolio' ? 'Portfolio' : (name === 'nifty' ? 'Nifty 50' : 'Sensex')];
//                   }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="portfolio"
//                   stroke="#8884d8"
//                   strokeWidth={2}
//                   name="portfolio"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="nifty"
//                   stroke="#82ca9d"
//                   strokeWidth={2}
//                   name="nifty"
//                 />
//                 {/* optional: show sensex */}
//                 <Line
//                   type="monotone"
//                   dataKey="sensex"
//                   stroke="#ffab40"
//                   strokeWidth={2}
//                   name="sensex"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//             {/* TODO: If benchmark key differs (e.g., 'benchmark'), remap to 'nifty' above */}
//           </CardContent>
//         </Card>

//         {/* Sector Allocation */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Sector Allocation</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <RechartsPieChart>
//                 <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
//                 <Pie
//                   data={sectorPie}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="amount"
//                   nameKey="name"
//                 >
//                   {sectorPie.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={sectorColor[entry.name] || '#BDBDBD'} />
//                   ))}
//                 </Pie>
//               </RechartsPieChart>
//             </ResponsiveContainer>
//             <div className="grid grid-cols-2 gap-2 mt-4">
//               {sectorPie.map((sector) => (
//                 <div key={sector.name} className="flex items-center text-sm">
//                   <div
//                     className="w-3 h-3 rounded mr-2"
//                     style={{ backgroundColor: sectorColor[sector.name] || '#BDBDBD' }}
//                   />
//                   <span className="text-muted-foreground">
//                     {sector.name}: {sector.value.toFixed(2) ?? 0}%
//                   </span>
//                 </div>
//               ))}
//             </div>
//             {/* TODO: If 'value' is not percent on server, compute percent from amounts */}
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Top Performers */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Top Performers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {performers.map((stock) => (
//                 <div key={`${stock.symbol}:${stock.exchange}`} className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium">{stock.symbol}</p>
//                     <p className="text-sm text-muted-foreground">{stock.exchange}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">{formatCurrency(stock.value)}</p>
//                     <p className={`text-sm ${gainColor(stock.gain)}`}>{formatPercent(stock.gain)}</p>
//                   </div>
//                 </div>
//               ))}
//               {performers.length === 0 && (
//                 <p className="text-sm text-muted-foreground">No performers to display.</p>
//               )}
//             </div>
//             {/* TODO: Add a link or action to view all holdings once holdings table is implemented */}
//           </CardContent>
//         </Card>

//         {/* Risk Metrics */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Risk Metrics</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Sharpe Ratio</span>
//                   <span className="font-medium">{metrics.sharpeRatio ?? '—'}</span>
//                 </div>
//                 <Progress value={Math.min(((metrics.sharpeRatio ?? 0) * 50), 100)} />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Volatility</span>
//                   <span className="font-medium">{metrics.volatility != null ? `${metrics.volatility}%` : '—'}</span>
//                 </div>
//                 <Progress value={Math.min(((metrics.volatility ?? 0) * 2), 100)} />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Max Drawdown</span>
//                   <span className="font-medium text-red-600">
//                     {metrics.maxDrawdown != null ? `${metrics.maxDrawdown}%` : '—'}
//                   </span>
//                 </div>
//                 <Progress value={Math.min(Math.abs(metrics.maxDrawdown ?? 0) * 5, 100)} />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Beta (vs Nifty)</span>
//                   <span className="font-medium">{metrics.beta ?? '—'}</span>
//                 </div>
//                 <Progress value={Math.min(((metrics.beta ?? 0) * 50), 100)} />
//               </div>
//             </div>
//             {/* TODO: Add info tooltips explaining each metric and methodology */}
//           </CardContent>
//         </Card>
//       </div>

//       {/* TODO: Add Holdings table fed from store.holdings with pagination and sorting */}
//       {/* TODO: Add a refresh button to re-dispatch fetchDashboard and show optimistic loading state */}
//     </div>
//   );
// }




















// "use client";

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDashboard } from '@/store/portfolioSlice';

// // =================== UI Imports =================== //
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import {
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   BarChart3,
//   PieChart,
//   Activity
// } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
// // =================== UI Imports =================== //


// const portfolioData = {
//   totalValue: 1250000,
//   totalInvested: 1000000,
//   totalGainLoss: 250000,
//   totalGainLossPercent: 25.0,
//   todayGainLoss: 15000,
//   todayGainLossPercent: 1.2
// };

// const performanceData = [
//   { date: '2024-01', portfolio: 1000000, nifty: 100 },
//   { date: '2024-02', portfolio: 1050000, nifty: 105 },
//   { date: '2024-03', portfolio: 980000, nifty: 98 },
//   { date: '2024-04', portfolio: 1120000, nifty: 112 },
//   { date: '2024-05', portfolio: 1180000, nifty: 118 },
//   { date: '2024-06', portfolio: 1250000, nifty: 125 }
// ];

// const sectorAllocation = [
//   { name: 'IT', value: 35, amount: 437500, color: '#8884d8' },
//   { name: 'Banking', value: 25, amount: 312500, color: '#82ca9d' },
//   { name: 'Pharma', value: 15, amount: 187500, color: '#ffc658' },
//   { name: 'Auto', value: 12, amount: 150000, color: '#ff7c7c' },
//   { name: 'FMCG', value: 8, amount: 100000, color: '#8dd1e1' },
//   { name: 'Others', value: 5, amount: 62500, color: '#d084d0' }
// ];


// const sectorColor = {
//   IT : '#8884d8',
//   Banking : '#82ca9d',
//   Pharma : '#ffc658',
//   Auto : '#ff7c7c',
//   FMCG : '#8dd1e1',
//   Others : '#d084d0'
// }


// const topPerformers = [
//   { symbol: 'TCS', name: 'Tata Consultancy Services', gain: 15.2, value: 125000 },
//   { symbol: 'INFY', name: 'Infosys Limited', gain: 12.8, value: 98000 },
//   { symbol: 'HDFC', name: 'HDFC Bank', gain: 8.5, value: 87500 },
//   { symbol: 'RELIANCE', name: 'Reliance Industries', gain: 6.2, value: 156000 }
// ];

// const marketMetrics = {
//   sharpeRatio: 1.34,
//   volatility: 18.5,
//   maxDrawdown: -12.3,
//   beta: 1.02
// };

// export default function Dashboard() {
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatPercent = (percent) => {
//     return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
//   };

//   useEffect(() => {
//     // 1. Define an async function inside the effect
//     const fetchData = async () => {
//       try {
//         // const res = await fetch('/api/dashboard-data'); // 'GET' is the default method
//         const res = await axios.get(
//           '/api/dashboard-data',
//           {
//             withCredentials: true
//           }
//         );

//         // 2. Check if the response was successful
//         // if (!res.ok) {
//         //   throw new Error(`HTTP error! Status: ${res.status}`);
//         // }

//         // 3. You need to parse the response body to see the data
//         // const data = await res.json();
//         console.log("Data from API:", res);

//       } catch (e) {
//         console.error("Failed to fetch dashboard data:", e);
//       }
//     };

//     // 4. Call the async function
//     fetchData();

//   }, []);

//   const dispatch = useDispatch();
//   const {
//     summary,
//     performance,
//     sectorAllocation,
//     topPerformers,
//     riskMetrics,
//     loading,
//     error,
//   } = useSelector(state => state.portfolio);

//   useEffect(() => {
//     dispatch(fetchDashboard());
//   }, [dispatch]);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
//           <p className="text-muted-foreground">Overview of your investment portfolio</p>
//         </div>
//         <Badge variant="outline" className="text-sm">
//           Last updated: {new Date().toLocaleTimeString()}
//         </Badge>
//       </div>

//       {/* Portfolio Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</div>
//             <div className="flex items-center text-xs text-muted-foreground">
//               <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
//               {formatPercent(portfolioData.todayGainLossPercent)} today
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalInvested)}</div>
//             <p className="text-xs text-muted-foreground">Your total investment</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">
//               {formatCurrency(portfolioData.totalGainLoss)}
//             </div>
//             <div className="text-xs text-green-600">
//               {formatPercent(portfolioData.totalGainLossPercent)} overall
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
//             <BarChart3 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">
//               {formatCurrency(portfolioData.todayGainLoss)}
//             </div>
//             <div className="text-xs text-green-600">
//               {formatPercent(portfolioData.todayGainLossPercent)} change
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Performance Chart */}
//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <CardTitle>Portfolio Performance vs Nifty 50</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={performanceData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip
//                   formatter={(value, name) => [
//                     name === 'portfolio' ? formatCurrency(value) : `${value}%`,
//                     name === 'portfolio' ? 'Portfolio' : 'Nifty 50'
//                   ]}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="portfolio"
//                   stroke="#8884d8"
//                   strokeWidth={2}
//                   name="portfolio"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="nifty"
//                   stroke="#82ca9d"
//                   strokeWidth={2}
//                   name="nifty"
//                 />
//               </LineChart>
//             </ResponsiveContainer>

// </CardContent>


//         </Card>

//         {/* Sector Allocation */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Sector Allocation</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <RechartsPieChart>
//                 <Tooltip
//                   formatter={(value, name) => [formatCurrency(value), name]}
//                 />
//                 <RechartsPieChart
//                   data={sectorAllocation}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="amount"
//                 >
//                   {sectorAllocation.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </RechartsPieChart>
//               </RechartsPieChart>
//             </ResponsiveContainer>
//             <div className="grid grid-cols-2 gap-2 mt-4">
//               {sectorAllocation.map((sector) => (
//                 <div key={sector.name} className="flex items-center text-sm">
//                   <div
//                     className="w-3 h-3 rounded mr-2"
//                     style={{ backgroundColor: sector.color }}
//                   />
//                   <span className="text-muted-foreground">{sector.name}: {sector.value}%</span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Top Performers */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Top Performers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {topPerformers.map((stock) => (
//                 <div key={stock.symbol} className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium">{stock.symbol}</p>
//                     <p className="text-sm text-muted-foreground">{stock.name}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">{formatCurrency(stock.value)}</p>
//                     <p className="text-sm text-green-600">{formatPercent(stock.gain)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Risk Metrics */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Risk Metrics</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Sharpe Ratio</span>
//                   <span className="font-medium">{marketMetrics.sharpeRatio}</span>
//                 </div>
//                 <Progress value={Math.min(marketMetrics.sharpeRatio * 50, 100)} />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Volatility</span>
//                   <span className="font-medium">{marketMetrics.volatility}%</span>
//                 </div>
//                 <Progress value={marketMetrics.volatility * 2} />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Max Drawdown</span>
//                   <span className="font-medium text-red-600">{marketMetrics.maxDrawdown}%</span>
//                 </div>
//                 <Progress value={Math.abs(marketMetrics.maxDrawdown) * 5} />
//               </div>

//               <div>
//                 <div className="flex justify-between text-sm mb-1">
//                   <span>Beta (vs Nifty)</span>
//                   <span className="font-medium">{marketMetrics.beta}</span>
//                 </div>
//                 <Progress value={marketMetrics.beta * 50} />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }