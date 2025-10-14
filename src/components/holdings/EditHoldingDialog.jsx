'use client'
import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditHoldingDialog({ open, onOpenChange, form, onChange, onSave }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-xl mb-4"}>Edit Holding</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-ticker" className={"mb-3"}>Ticker</Label>
              <Input
                id="edit-ticker"
                value={form.ticker}
                onChange={(e) => onChange({...form, ticker: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <Label htmlFor="edit-exchange"  className={"mb-3"}>Exchange</Label>
              <select
                id="edit-exchange"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={form.exchange}
                onChange={(e) => onChange({...form, exchange: e.target.value})}
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-shares" className={"mb-3"}>Shares</Label>
              <Input
                id="edit-shares"
                type="number"
                value={form.shares}
                onChange={(e) => onChange({...form, shares: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-price" className={"mb-3"}>Purchase Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={form.purchase_price}
                onChange={(e) => onChange({...form, purchase_price: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-date" className={"mb-3"}>Purchase Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={form.purchase_date}
                onChange={(e) => onChange({...form, purchase_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-sector" className={"mb-3"}>Sector</Label>
              <Input
                id="edit-sector"
                value={form.sector}
                onChange={(e) => onChange({...form, sector: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-notes" className={"mb-3"}>Notes</Label>
            <Input
              id="edit-notes"
              value={form.notes}
              onChange={(e) => onChange({...form, notes: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Update Holding
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}