'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface InventoryReportTableProps {
  inventory: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStock: number;
    cost: number;  // Changed from 'any' to 'number'
    price: number;  // Changed from 'any' to 'number'
    product: {
      name: string;
    };
  }>;
}

export function InventoryReportTable({ inventory }: InventoryReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Stock Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-xs'>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No inventory data available
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item) => {
              const isLowStock = item.stock <= item.lowStock;
              const stockValue = Number(item.cost) * item.stock;
              
              return (
                <TableRow key={item.id} className={isLowStock ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    <span className={isLowStock ? 'text-red-600 font-bold' : 'font-semibold'}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(Number(item.cost))}</TableCell>
                  <TableCell>{formatCurrency(Number(item.price))}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(stockValue)}
                  </TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Stok Rendah
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Tersedia
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}