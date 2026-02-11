import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { FileText, TrendingUp, Package, DollarSign } from 'lucide-react';
import { SalesReportTable } from '@/components/reports/sales-report-table';
import { InventoryReportTable } from '@/components/reports/inventory-report-table';
import { FinancialSummary } from '@/components/reports/financial-summary';

async function getSalesReport() {
  const sales = await db.sale.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      customer: {
        select: { name: true, email: true },
      },
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const totalSales = await db.sale.aggregate({
    _sum: { total: true },
    _count: true,
  });

  // Convert ALL Decimal fields to numbers
  const serializedSales = sales.map(sale => ({
    ...sale,
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount),
    tax: Number(sale.tax),
    total: Number(sale.total),
    items: sale.items.map(item => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      variant: {
        ...item.variant,
        price: Number(item.variant.price),
        cost: Number(item.variant.cost),
      },
    })),
  }));

  return {
    sales: serializedSales,
    totalRevenue: Number(totalSales._sum.total) || 0,
    totalTransactions: totalSales._count,
  };
}

async function getInventoryReport() {
  const inventory = await db.productVariant.findMany({
    include: {
      product: true,
    },
    orderBy: {
      stock: 'asc',
    },
  });

  const totalProducts = await db.productVariant.count();
  const lowStockCount = await db.productVariant.count({
    where: {
      stock: {
        lte: db.productVariant.fields.lowStock,
      },
    },
  });

  // Convert ALL Decimal fields to numbers
  const serializedInventory = inventory.map(item => ({
    ...item,
    price: Number(item.price),
    cost: Number(item.cost),
  }));

  const inventoryValue = serializedInventory.reduce((sum, item) => {
    return sum + (item.cost * item.stock);
  }, 0);

  return {
    inventory: serializedInventory,
    totalProducts,
    lowStockCount,
    inventoryValue,
  };
}

async function getFinancialReport() {
  const [income, expenses, sales] = await Promise.all([
    db.cashflow.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' },
    }),
    db.cashflow.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
    }),
    db.sale.aggregate({
      _sum: { total: true },
    }),
  ]);

  const totalIncome = Number(income._sum.amount) || 0;
  const totalExpenses = Number(expenses._sum.amount) || 0;
  const totalSalesRevenue = Number(sales._sum.total) || 0;
  const netProfit = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalSalesRevenue,
    netProfit,
  };
}

export default async function AdminReportsPage() {
  const [salesData, inventoryData, financialData] = await Promise.all([
    getSalesReport(),
    getInventoryReport(),
    getFinancialReport(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Laporan & Analisis</h1>
        <p className="text-gray-600">Laporan umum bisnis secara menyeluruh</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Penjualan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesData.totalTransactions} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialData.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Pemasukan - Pengeluaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(inventoryData.inventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {inventoryData.totalProducts} produk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryData.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Butuh penambahan</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Reports */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="financial">Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Penjualan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesReportTable sales={salesData.sales} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryReportTable inventory={inventoryData.inventory} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <FinancialSummary data={financialData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
