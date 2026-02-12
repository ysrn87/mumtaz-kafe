import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomersTable } from '@/components/customers/customers-table';
import { CustomerDialog } from '@/components/customers/customer-dialog';

async function getCustomers(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [customers, total] = await Promise.all([
    db.user.findMany({
      where: { role: 'MEMBER' },
      skip,
      take: limit,
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
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count({ where: { role: 'MEMBER' } }),
  ]);

  // Convert Decimal to Number for client component
  const serializedCustomers = customers.map(customer => ({
    ...customer,
    sales: customer.sales.map(sale => ({
      id: sale.id,
      total: Number(sale.total),
    })),
  }));

  return { customers: serializedCustomers, total };
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const { customers, total } = await getCustomers(page, limit);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kelola Member</h1>
          <p className="text-gray-600">Lihat dan kelola data semua member</p>
        </div>
        <CustomerDialog mode="create" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Member</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersTable 
            customers={customers} 
            showActions={true}
            currentPage={page}
            pageSize={limit}
            totalItems={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}