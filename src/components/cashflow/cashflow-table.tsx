'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CashflowTableProps {
  transactions: Array<{
    id: string;
    type: string;
    amount: number;  // Changed from 'any' to 'number'
    category: string;
    description: string | null;
    date: Date;
    createdBy: {
      name: string;
    };
  }>;
}

export function CashflowTable({ transactions }: CashflowTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead>Recorder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-xs'>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Belum ada transaksi
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === 'INCOME' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Pemasukan</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Pengeluaran</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{transaction.category}</TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.description || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type === 'INCOME' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(transaction.amount))}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {transaction.createdBy.name}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}