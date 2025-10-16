'use client'
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils';

export default function HoldingsTable({ holdings, onEdit, onDelete }) {
    const gainColor = (value) => value >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Market Price</TableHead>
                    <TableHead className="text-right">Investment</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {holdings.map(holding => (
                    <TableRow key={holding.id}>
                        <TableCell>
                            <div>
                                <p className="font-medium">{holding.ticker}</p>
                                {holding.sector && <p className="text-sm text-muted-foreground">{holding.sector}</p>}
                            </div>
                        </TableCell>
                        <TableCell>{holding.exchange}</TableCell>
                        <TableCell className="text-right">{holding.shares}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.purchasePrice)}</TableCell>
                        <TableCell className="text-right">
                            {holding.marketPrice ? formatCurrency(holding.marketPrice) : '—'}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.invested)}</TableCell>
                        <TableCell className="text-right">
                            {holding.value ? formatCurrency(holding.value) : '—'}
                        </TableCell>
                        <TableCell className={`text-right ${gainColor(holding.gain || 0)}`}>
                            <div>
                                <p>{holding.gain ? formatCurrency(holding.gain) : '—'}</p>
                                <p className="text-sm">{holding.gainPct ? formatPercent(holding.gainPct) : '—'}</p>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => onEdit(holding)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => onDelete(holding)}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}