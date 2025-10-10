'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    TrendingUp,
    TrendingDown,
    FileText,
    Upload
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '@/store/portfolioSlice';

export default function Holdings() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('symbol');
    const [sortOrder, setSortOrder] = useState('asc');

    const dispatch = useDispatch();

    // read from redux but protect against undefined
    const store = useSelector((state) => state?.portfolio ?? {});
    const summary = store?.summary ?? {};
    const holdings = Array.isArray(store?.holdings) ? store.holdings : [];

    // fetch dashboard on mount if dispatch exists
    useEffect(() => {
        try {
            if (typeof dispatch === 'function') dispatch(fetchDashboard());
        } catch (e) {
            // safe fallback — do not crash if dispatch unavailable
            // console.warn('dispatch unavailable', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // helpers to format numbers safely
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Number(amount));
    };

    const formatPercent = (percent) => {
        if (percent === null || percent === undefined || !isFinite(percent)) return '—';
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    };

    const totalCurrent = Number(summary?.totalValue ?? 0);
    const totalInvested = Number(summary?.totalInvested ?? 0);
    const totalPnL = Number(summary?.totalGainLoss ?? 0);
    const totalPnLPercent = Number(summary?.totalGainLossPercent ?? 0);

    const holdingss = useMemo(() => {
        return holdings.map(h => (h && typeof h === 'object') ? h : {});
    }, [holdings]);

    const filteredHoldings = useMemo(() => {
        const q = String(searchTerm || '').toLowerCase().trim();

        const arr = holdingss.filter(h => {
            const ticker = String(h?.ticker ?? h?.symbol ?? '').toLowerCase();
            const name = String(h?.name ?? '').toLowerCase();
            if (!q) return true;
            return ticker.includes(q) || name.includes(q);
        });

        // safe sorting — use a getter, handle missing values gracefully
        const getVal = (item, key) => {
            if (!item) return undefined;
            // support nested or alternative names used across code (shares/quantity, marketPrice/currentPrice)
            if (key === 'symbol' || key === 'ticker') return item?.ticker ?? item?.symbol;
            if (key === 'quantity' || key === 'shares') return item?.shares ?? item?.quantity;
            if (key === 'currentPrice' || key === 'marketPrice') return item?.marketPrice ?? item?.currentPrice;
            return item[key];
        };

        arr.sort((a, b) => {
            const aRaw = getVal(a, sortBy);
            const bRaw = getVal(b, sortBy);

            // push undefined/null to end
            if (aRaw == null && bRaw == null) return 0;
            if (aRaw == null) return 1;
            if (bRaw == null) return -1;

            // numeric compare first
            const aNum = Number(aRaw);
            const bNum = Number(bRaw);
            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // fallback to string compare
            const aStr = String(aRaw);
            const bStr = String(bRaw);
            return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });

        return arr;
    }, [holdingss, searchTerm, sortBy, sortOrder]);

    const handleSort = (column) => {
        if (sortBy === column) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Edit: robust prompt fallback (no crash)
    const handleEdit = async (holding) => {
        if (!holding || !holding.id) {
            alert('Cannot edit: invalid holding');
            return;
        }
        const currShares = numericSafe(holding.shares ?? holding.quantity ?? 0);
        const input = prompt(`Edit shares for ${holding.ticker ?? holding.symbol ?? 'holding'}`, String(currShares));
        if (input == null) return; // user cancelled
        const newShares = Number(input);
        if (!Number.isFinite(newShares) || newShares < 0) {
            alert('Invalid shares value');
            return;
        }

        // Attempt API call; if you don't have an API, simply refetch dashboard if dispatch exists
        try {
            const body = { ...holding, shares: newShares };
            // If your backend supports PUT /api/holdings/:id uncomment the fetch block below and adapt path
            /*
            const res = await fetch(`/api/holdings/${holding.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Update failed');
            */
            if (typeof dispatch === 'function') dispatch(fetchDashboard());
        } catch (e) {
            console.error('Edit failed', e);
            alert('Failed to update holding (check console).');
        }
    };

    // Delete: robust, confirm, attempt API then refresh
    const handleDelete = async (holdingId) => {
        if (!holdingId) {
            alert('Invalid holding id');
            return;
        }
        const confirmed = confirm('Delete this holding? This cannot be undone.');
        if (!confirmed) return;

        try {
            // If backend exists: uncomment and adapt
            /*
            const res = await fetch(`/api/holdings/${holdingId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            */
            if (typeof dispatch === 'function') dispatch(fetchDashboard());
        } catch (e) {
            console.error('Delete failed', e);
            alert('Failed to delete holding (check console).');
        }
    };

    // small utility
    function numericSafe(x) {
        const n = Number(x);
        return Number.isFinite(n) ? n : 0;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Holdings</h1>
                    <p className="text-muted-foreground">Manage your stock portfolio</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => alert('Import not configured')}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert('Export not configured')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalCurrent)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(totalPnL)}
                        </div>
                        <div className={`text-sm ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(totalPnLPercent)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Your Holdings ({filteredHoldings.length})</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search holdings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 w-64"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('symbol')}
                                    >
                                        Symbol
                                        {sortBy === 'symbol' && (
                                            sortOrder === 'asc' ? <TrendingUp className="inline w-3 h-3 ml-1" /> : <TrendingDown className="inline w-3 h-3 ml-1" />
                                        )}
                                    </TableHead>
                                    {/* <TableHead>Exchange</TableHead> */}
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 text-center"
                                        onClick={() => handleSort('shares')}
                                    >
                                        Quantity
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 text-center"
                                        onClick={() => handleSort('marketPrice')}
                                    >
                                        Market Price
                                    </TableHead>
                                    <TableHead className="text-center">Invested</TableHead>
                                    <TableHead className="text-center">Current Value</TableHead>
                                    <TableHead className="text-center">P&L</TableHead>
                                    <TableHead>Sector</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredHoldings.map((holdingRaw) => {

                                    const h = holdingRaw ?? {};
                                    const ticker = h.ticker ?? h.symbol ?? '—';
                                    const exchange = h.exchange ?? 'NSE';
                                    const shares = numericSafe(h.shares ?? h.quantity ?? 0);
                                    const marketPrice = numericSafe(h.marketPrice ?? h.currentPrice ?? h.marketPrice ?? 0);
                                    const invested = numericSafe(h.invested ?? (shares * (Number(h.purchase_price ?? h.avgPrice ?? 0))));
                                    const value = numericSafe(h.value ?? (shares * marketPrice));
                                    const gain = numericSafe(h.gain ?? (value - invested));
                                    const gainPct = (h.gainPct != null && isFinite(Number(h.gainPct))) ? Number(h.gainPct) : (invested > 0 ? (gain / invested) * 100 : null);
                                    const sector = h.sector ?? 'Unknown';

                                    return (
                                        <TableRow key={h.id ?? `${ticker}-${Math.random()}`}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold">{ticker}</div>
                                                    <Badge variant="outline" className="text-xs">{exchange}</Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center font-medium">{shares}</TableCell>

                                            <TableCell className="text-center">{formatCurrency(marketPrice)}</TableCell>

                                            <TableCell className="text-center">{formatCurrency(invested)}</TableCell>

                                            <TableCell className="text-center font-medium">{formatCurrency(value)}</TableCell>

                                            <TableCell className="text-center">
                                                <div className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    <div className="font-medium">{formatCurrency(gain)}</div>
                                                    <div className="text-sm">{formatPercent(gainPct)}</div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{sector}</Badge>
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(h)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(h.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {filteredHoldings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-6">
                                            No holdings found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
