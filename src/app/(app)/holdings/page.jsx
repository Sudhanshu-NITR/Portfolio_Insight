"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboard } from '@/store/portfolioSlice';
import axios from 'axios';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons
import {
    Upload,
    Download,
    Edit,
    Trash2,
    Plus,
    RefreshCw
} from 'lucide-react';

// Utils
import { formatCurrency, formatPercent } from '@/utils';

export default function HoldingsPage() {
    const dispatch = useDispatch();
    const { holdings, loading } = useSelector(state => state.portfolio);

    // States
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedHolding, setSelectedHolding] = useState(null);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState('');

    // Form states for editing
    const [editForm, setEditForm] = useState({
        ticker: '',
        exchange: 'NSE',
        shares: '',
        purchase_price: '',
        purchase_date: '',
        sector: '',
        notes: ''
    });

    // File input ref
    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    // Export CSV functionality
    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const response = await axios.get('/api/export-holdings', {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `holdings-${new Date().toISOString().split('T')}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export holdings. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Import CSV functionality
    const handleFileSelect = (event) => {
        const file = event.target.files;
        if (file && file.type === 'text/csv') {
            importCSV(file);
        } else {
            setImportError('Please select a valid CSV file');
        }
    };

    const importCSV = async (file) => {
        setIsImporting(true);
        setImportError('');
        setImportSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/import-holdings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setImportSuccess(`Successfully imported ${response.data.imported} holdings`);
            dispatch(fetchDashboard()); // Refresh data
            setTimeout(() => {
                setImportModalOpen(false);
                setImportSuccess('');
            }, 2000);

        } catch (error) {
            setImportError(error.response?.data?.error || 'Failed to import CSV');
        } finally {
            setIsImporting(false);
        }
    };

    // Edit holding
    const handleEdit = (holding) => {
        setSelectedHolding(holding);
        setEditForm({
            ticker: holding.ticker,
            exchange: holding.exchange || 'NSE',
            shares: holding.shares.toString(),
            purchase_price: holding.purchasePrice.toString(),
            purchase_date: holding.purchaseDate ? new Date(holding.purchaseDate).toISOString().split('T') : '',
            sector: holding.sector || '',
            notes: holding.notes || ''
        });
        setEditModalOpen(true);
    };

    const handleUpdateHolding = async () => {
        try {
            await axios.patch(`/api/update-holding`, {
                holdingId: selectedHolding.id,
                ...editForm,
                shares: parseFloat(editForm.shares),
                purchase_price: parseFloat(editForm.purchase_price)
            });

            dispatch(fetchDashboard()); // Refresh data
            setEditModalOpen(false);
        } catch (error) {
            alert('Failed to update holding: ' + (error.response?.data?.error || error.message));
        }
    };

    // Delete holding
    const handleDelete = (holding) => {
        setSelectedHolding(holding);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/delete-holding`, {
                data: { holdingId: selectedHolding.id }
            });

            dispatch(fetchDashboard()); // Refresh data
            setDeleteDialogOpen(false);
        } catch (error) {
            alert('Failed to delete holding: ' + (error.response?.data?.error || error.message));
        }
    };

    const gainColor = (value) => value >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Holdings</h1>
                    <p className="text-muted-foreground">Manage your portfolio holdings</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => dispatch(fetchDashboard())}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Import CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Holdings from CSV</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="csv-file">Select CSV File</Label>
                                    <Input
                                        id="csv-file"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        ref={fileInputRef}
                                        disabled={isImporting}
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        CSV format: ticker,exchange,shares,purchase_price,purchase_date,sector,notes
                                    </p>
                                </div>

                                {importError && (
                                    <p className="text-sm text-red-600">{importError}</p>
                                )}

                                {importSuccess && (
                                    <p className="text-sm text-green-600">{importSuccess}</p>
                                )}

                                {isImporting && (
                                    <p className="text-sm text-blue-600">Importing holdings...</p>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={handleExportCSV}
                        disabled={isExporting || !holdings?.length}
                        variant="outline"
                        size="sm"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Holdings ({holdings?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {!holdings || holdings.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No holdings found</p>
                            <Button className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Holding
                            </Button>
                        </div>
                    ) : (
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
                                {holdings.map((holding) => (
                                    <TableRow key={holding.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{holding.ticker}</p>
                                                {holding.sector && (
                                                    <p className="text-sm text-muted-foreground">{holding.sector}</p>
                                                )}
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(holding)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(holding)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Holding</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-ticker">Ticker</Label>
                                <Input
                                    id="edit-ticker"
                                    value={editForm.ticker}
                                    onChange={(e) => setEditForm({ ...editForm, ticker: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-exchange">Exchange</Label>
                                <select
                                    id="edit-exchange"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editForm.exchange}
                                    onChange={(e) => setEditForm({ ...editForm, exchange: e.target.value })}
                                >
                                    <option value="NSE">NSE</option>
                                    <option value="BSE">BSE</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-shares">Shares</Label>
                                <Input
                                    id="edit-shares"
                                    type="number"
                                    value={editForm.shares}
                                    onChange={(e) => setEditForm({ ...editForm, shares: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-price">Purchase Price</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={editForm.purchase_price}
                                    onChange={(e) => setEditForm({ ...editForm, purchase_price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-date">Purchase Date</Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={editForm.purchase_date}
                                    onChange={(e) => setEditForm({ ...editForm, purchase_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-sector">Sector</Label>
                                <Input
                                    id="edit-sector"
                                    value={editForm.sector}
                                    onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Input
                                id="edit-notes"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateHolding}>
                            Update Holding
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the holding for {selectedHolding?.ticker}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
