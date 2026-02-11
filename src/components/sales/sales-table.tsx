'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { SaleDetailsDialog } from './sale-details-dialog';
import { Eye } from 'lucide-react';

interface SalesTableProps {
  sales: any[];
}

export function SalesTable({ sales }: SalesTableProps) {
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setShowDetailsDialog(true);
  };

  if (sales.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sales yet</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale ID #</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Cashier</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pembayaran</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-xs'>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.saleNumber}</TableCell>
              <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
              <TableCell>{sale.customer?.name || 'Walk-in'}</TableCell>
              <TableCell>{sale.cashier.name}</TableCell>
              <TableCell>{sale.items.length}</TableCell>
              <TableCell>{formatCurrency(sale.total)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {sale.paymentMethod}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(sale)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedSale && (
        <SaleDetailsDialog
          sale={selectedSale}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onUpdate={() => window.location.reload()}
        />
      )}
    </>
  );
}
