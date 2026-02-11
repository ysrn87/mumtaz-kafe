'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface SalesReportTableProps {
  sales: Array<{
    id: string;
    saleNumber: string;
    total: number;  // Changed from 'any' to 'number'
    paymentMethod: string;
    createdAt: Date;
    customer: {
      name: string;
      email: string;
    } | null;
    items: Array<{
      quantity: number;
      price: number;  // Changed from 'any' to 'number'
      variant: {
        name: string;
        product: {
          name: string;
        };
      };
    }>;
  }>;
}

export function SalesReportTable({ sales }: SalesReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale ID #</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Pembayaran</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-xs'>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No sales data available
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                <TableCell>
                  {new Date(sale.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {sale.customer ? (
                    <div>
                      <p className="font-medium">{sale.customer.name}</p>
                      <p className="text-muted-foreground">{sale.customer.email}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Guest</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    {sale.items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-muted-foreground">
                        {item.quantity}x {item.variant.product.name}
                      </p>
                    ))}
                    {sale.items.length > 2 && (
                      <p className="text-muted-foreground">
                        +{sale.items.length - 2} more
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {sale.paymentMethod}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(sale.total)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}