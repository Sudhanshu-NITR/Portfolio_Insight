'use client'
import React, { useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export default function ImportCSVDialog({ open, onOpenChange, onImport }) {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    setError('');
    setSuccess('');
    if (!file || file.type !== 'text/csv') {
      setError('Please select a valid CSV file');
      return;
    }
    setImporting(true);

    try {
      await onImport(file);
      setSuccess('Import successful');
      setTimeout(() => {
        setSuccess('');
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"mb-3 text-xl"}>Import Holdings from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file" className={"mb-3"}>Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={importing}
              className={"mb-3"}
            />
            <p className="text-sm text-muted-foreground mt-2">
              CSV format: ticker,exchange,shares,purchase_price,purchase_date,sector,notes
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          {importing && <p className="text-sm text-blue-600">Importing holdings...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}