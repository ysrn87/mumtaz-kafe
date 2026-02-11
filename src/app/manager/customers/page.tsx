import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Award } from 'lucide-react';
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

async function getAllCustomers() {
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

export default async function ManagerCustomersPage() {
  const stats = await getCustomerStats();
  const customers = await getAllCustomers();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kelola Pelanggan</h1>
          <p className="text-gray-600">Lihat akun dan aktifitas pelanggan</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Member terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">Semua transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akumulasi Poin</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">Loyalty points</p>
          </CardContent>
        </Card>
      </div>

      {/* All Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Semua Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersTable customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}