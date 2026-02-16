import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewSaleDialog } from '@/components/sales/new-sale-dialog';
import { ManagerSalesTable } from '@/components/sales/manager-sales-table';
import { getPointsConversionRate } from '@/actions/settings';

async function getSales(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [sales, total] = await Promise.all([
    db.sale.findMany({
      skip,
      take: limit,
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
        items: {
          select: {
            quantity: true,
          },
        },
      },
    }),
    db.sale.count(),
  ]);

  return {
    sales: sales.map(sale => ({
      ...sale,
      total: Number(sale.total),
    })),
    total,
  };
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
      points: true,
    },
    orderBy: { name: 'asc' },
  });
}

export default async function ManagerSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const [{ sales, total }, variants, customers, conversionRate] = await Promise.all([
    getSales(page, limit),
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
          <ManagerSalesTable 
            sales={sales}
            currentPage={page}
            pageSize={limit}
            totalItems={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}