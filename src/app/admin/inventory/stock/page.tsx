import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle } from 'lucide-react';
import { StockTable } from '@/components/stock/stock-table';
import { StockMovementsTable } from '@/components/stock/stock-movements-table';

async function getStockMovements(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [movements, total] = await Promise.all([
    db.stockMovement.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    }),
    db.stockMovement.count(),
  ]);

  return { movements, total };
}

async function getStockData() {
  const [totalVariants, lowStockCount, stockValue] = await Promise.all([
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
  ]);

  return {
    totalVariants,
    lowStockCount,
    totalStock: stockValue._sum.stock || 0,
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

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    limit?: string;
    movementPage?: string;
    movementLimit?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const movementPage = Number(params.movementPage) || 1;
  const movementLimit = Number(params.movementLimit) || 10;

  const stats = await getStockData();
  const { items: stockItems, total } = await getAllStock(page, limit);
  const { movements, total: movementsTotal } = await getStockMovements(movementPage, movementLimit);

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
          <CardTitle>Riwayat Sirkulasi Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <StockMovementsTable 
            movements={movements}
            currentPage={movementPage}
            pageSize={movementLimit}
            totalItems={movementsTotal}
          />
        </CardContent>
      </Card>
    </div>
  );
}