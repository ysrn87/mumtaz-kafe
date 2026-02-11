import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Award } from 'lucide-react';
import { CustomerDialog } from '@/components/customers/customer-dialog';
import { CustomersTable } from '@/components/customers/customers-table';

async function getCustomerStats() {
  const [totalCustomers, totalPurchases, totalPoints] = await Promise.all([
    db.user.count({
      where: { role: 'MEMBER' },
    }),
    db.sale.count(),
    db.user.aggregate({
      _sum: { points: true },
      where: { role: 'MEMBER' },
    }),
  ]);

  return {
    totalCustomers,
    totalPurchases,
    totalPoints: totalPoints._sum.points || 0,
  };
}

async function getCustomers() {
  const customers = await db.user.findMany({
    where: { role: 'MEMBER' },
    orderBy: { createdAt: 'desc' },
    include: {
      sales: {
        select: {
          id: true,
          total: true,
        },
      },
      _count: {
        select: {
          sales: true,
        },
      },
    },
  });

  const serializedCustomers = customers.map(customer => ({
    ...customer,
    sales: customer.sales.map(sale => ({
      ...sale,
      total: Number(sale.total),
    })),
  }));

  return serializedCustomers;
}

export default async function AdminCustomersPage() {
  const [stats, customers] = await Promise.all([
    getCustomerStats(),
    getCustomers(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pelanggan</h1>
          <p className="text-gray-600">Kelola database member</p>
        </div>
        <CustomerDialog mode="create" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Member</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersTable customers={customers} showActions={true} />
        </CardContent>
      </Card>
    </div>
  );
}
