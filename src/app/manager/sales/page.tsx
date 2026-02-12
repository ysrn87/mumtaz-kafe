import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { NewSaleDialog } from '@/components/sales/new-sale-dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { getPointsConversionRate } from '@/actions/settings';

async function getSales() {
  const sales = await db.sale.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      cashier: {
        select: {
          name: true,
        },
      },
      items: true,
    },
  });

  return sales.map(sale => ({
    ...sale,
    total: Number(sale.total),
  }));
}

async function getVariants() {
  const variants = await db.productVariant.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    include: {
      product: true,
    },
    orderBy: {
      product: {
        name: 'asc',
      },
    },
  });

  return variants.map(v => ({
    id: v.id,
    name: v.name,
    price: Number(v.price),
    stock: v.stock,
    product: {
      name: v.product.name,
    },
  }));
}

async function getCustomers() {
  return db.user.findMany({
    where: { role: 'MEMBER' },
    select: {
      id: true,
      name: true,
      points: true, // Add points field
    },
    orderBy: { name: 'asc' },
  });
}

export default async function ManagerSalesPage() {
  const [sales, variants, customers, conversionRate] = await Promise.all([
    getSales(),
    getVariants(),
    getCustomers(),
    getPointsConversionRate(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Penjualan</h1>
          <p className="text-gray-600">Proses dan lihat transaksi penjualan</p>
        </div>
        <NewSaleDialog variants={variants} customers={customers} conversionRate={conversionRate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Penjualan Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada penjualan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='text-xs'>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                    <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                    <TableCell>{sale.customer?.name || 'Walk-in'}</TableCell>
                    <TableCell>{sale.items.length}</TableCell>
                    <TableCell>{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sale.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" title="View details">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
