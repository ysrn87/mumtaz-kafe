import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { StockAdjustmentDialog } from '@/components/stock/stock-adjustment-dialog';

async function getStockData() {
  const [totalVariants, lowStockCount, stockValue, recentMovements] = await Promise.all([
    db.productVariant.count(),
    db.productVariant.count({
      where: {
        stock: {
          lte: db.productVariant.fields.lowStock,
        },
      },
    }),
    db.productVariant.aggregate({
      _sum: {
        stock: true,
      },
    }),
    db.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    }),
  ]);

  return {
    totalVariants,
    lowStockCount,
    totalStock: stockValue._sum.stock || 0,
    recentMovements,
  };
}

async function getAllStock() {
  return await db.productVariant.findMany({
    include: {
      product: true,
    },
    orderBy: [
      { stock: 'asc' },
      { product: { name: 'asc' } },
    ],
  });
}

export default async function AdminStockPage() {
  const stats = await getStockData();
  const stockItems = await getAllStock();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kelola Stok Produk</h1>
          <p className="text-gray-600">Memantau dan mengelola ketersediaan barang</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
            <p className="text-xs text-muted-foreground">Varian produk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Kurang</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Butuh penambahan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
            <p className="text-xs text-muted-foreground">Total unit</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ketersediaan Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Varian</TableHead>
                  <TableHead>Stok Tersedia</TableHead>
                  <TableHead>Stok Minimum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Tidak ada produk tersedia
                    </TableCell>
                  </TableRow>
                ) : (
                  stockItems.map((item) => {
                    const isLowStock = item.stock <= item.lowStock;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <span className={isLowStock ? 'text-red-600 font-bold' : ''}>
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell>{item.lowStock}</TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Stok rendah
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Tersedia
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>
                          <StockAdjustmentDialog 
                            variantId={item.id} 
                            variantName={`${item.product.name} - ${item.name}`} 
                            currentStock={item.stock} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Sirkulasi Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada riwayat tercatat</p>
            ) : (
              stats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    {movement.type === 'IN' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : movement.type === 'OUT' ? (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <Package className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <p className="text-xs font-medium">
                        {movement.variant.product.name} - {movement.variant.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {movement.type} • {movement.quantity} units
                        {movement.notes && ` • ${movement.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(movement.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}