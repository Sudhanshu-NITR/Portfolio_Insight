"use client";
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboard } from '@/store/portfolioSlice';
import axios from 'axios';

import HoldingsTable from '@/components/holdings/HoldingsTable';
import ImportCSVDialog from '@/components/holdings/ImportCSVDialog';
import EditHoldingDialog from '@/components/holdings/EditHoldingDialog';
import DeleteHoldingDialog from '@/components/holdings/DeleteHoldingDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Plus } from 'lucide-react';

export default function HoldingsPage() {
  const dispatch = useDispatch();
  const { holdings, loading } = useSelector(state => state.portfolio);

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);

  const [editForm, setEditForm] = useState({
    ticker: '',
    exchange: 'NSE',
    shares: '',
    purchase_price: '',
    purchase_date: '',
    sector: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get('/api/export-holdings', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `holdings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export holdings. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importHoldings = async (file) => {
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/import-holdings', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      dispatch(fetchDashboard());
      return response;
    } catch (error) {
      throw error.response?.data?.error || new Error('Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleEdit = (holding) => {
    setSelectedHolding(holding);
    setEditForm({
      ticker: holding.ticker,
      exchange: holding.exchange || 'NSE',
      shares: holding.shares.toString(),
      purchase_price: holding.purchasePrice.toString(),
      purchase_date: holding.purchaseDate ? new Date(holding.purchaseDate).toISOString().split('T')[0] : '',
      sector: holding.sector || '',
      notes: holding.notes || ''
    });
    setEditOpen(true);
  };

  const handleUpdateHolding = async () => {
    try {
      await axios.patch('/api/update-holding', {
        holdingId: selectedHolding.id,
        ...editForm,
        shares: parseFloat(editForm.shares),
        purchase_price: parseFloat(editForm.purchase_price)
      });
      dispatch(fetchDashboard());
      setEditOpen(false);
    } catch (error) {
      alert('Failed to update holding: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = (holding) => {
    setSelectedHolding(holding);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete('/api/delete-holding', { 
        data: { holdingId: selectedHolding.id } 
      });
      dispatch(fetchDashboard());
      setDeleteOpen(false);
    } catch (error) {
      alert('Failed to delete holding: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <>
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
            
            <ImportCSVDialog 
              open={importOpen} 
              onOpenChange={setImportOpen} 
              onImport={importHoldings} 
            />
            
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
              <HoldingsTable 
                holdings={holdings} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            )}
          </CardContent>
        </Card>
      </div>

      <EditHoldingDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        form={editForm} 
        onChange={setEditForm} 
        onSave={handleUpdateHolding} 
      />

      <DeleteHoldingDialog 
        open={deleteOpen} 
        onOpenChange={setDeleteOpen} 
        holding={selectedHolding} 
        onConfirm={handleConfirmDelete} 
      />
    </>
  );
}