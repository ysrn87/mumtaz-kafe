import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { StockTable } from '@/components/stock/stock-table';

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

  // Convert Decimal to Number for client component
  const serializedMovements = recentMovements.map(movement => ({
    ...movement,
    variant: {
      ...movement.variant,
      price: Number(movement.variant.price),
      cost: Number(movement.variant.cost),
    },
  }));

  return {
    totalVariants,
    lowStockCount,
    totalStock: stockValue._sum.stock || 0,
    recentMovements: serializedMovements,
  };
}

async function getAllStock(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    db.productVariant.findMany({
      skip,
      take: limit,
      include: {
        product: true,
      },
      orderBy: [
        { stock: 'asc' },
        { product: { name: 'asc' } },
      ],
    }),
    db.productVariant.count(),
  ]);

  // Convert Decimal to Number for client component
  const serializedItems = items.map(item => ({
    ...item,
    price: Number(item.price),
    cost: Number(item.cost),
  }));

  return { items: serializedItems, total };
}

export default async function ManagerStockPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;

  const stats = await getStockData();
  const { items: stockItems, total } = await getAllStock(page, limit);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
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
            <p className="text-xs text-muted-foreground">Varian Produk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Butuh pembaruan</p>
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
          <CardTitle>Semua Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <StockTable 
            stockItems={stockItems}
            currentPage={page}
            pageSize={limit}
            totalItems={total}
          />
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Pembaruan Stok Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pembaharuan</p>
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
                      <p className="text-sm font-medium">
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