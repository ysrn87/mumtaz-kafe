import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Award } from 'lucide-react';
import { CustomersTable } from '@/components/customers/customers-table';
import { SearchFilterBar } from '@/components/filters/search-filter-bar';

// ✅ Calculate days until next birthday (month+day only, year-agnostic)
function getDaysUntilNextBirthday(birthday: Date | null): number {
  if (!birthday) return Number.MAX_SAFE_INTEGER;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  next.setHours(0, 0, 0, 0);

  if (next < today) {
    next = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
  }

  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

async function getCustomerStats() {
  const [totalCustomers, totalPurchases, totalPoints] = await Promise.all([
    db.user.count({ where: { role: 'MEMBER' } }),
    db.sale.count(),
    db.user.aggregate({ _sum: { points: true }, where: { role: 'MEMBER' } }),
  ]);

  return {
    totalCustomers,
    totalPurchases,
    totalPoints: totalPoints._sum.points || 0,
  };
}

async function getAllCustomers(params: {
  page?: number;
  limit?: number;
  search?: string;
  points?: string;
  sort?: string;
}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    points = 'all',
    sort = 'joined_desc',
  } = params;

  const skip = (page - 1) * limit;

  const where: any = { role: 'MEMBER' };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } },
      { phone: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  if (points !== 'all') {
    switch (points) {
      case 'low':    where.points = { lt: 100 };            break;
      case 'medium': where.points = { gte: 100, lt: 500 }; break;
      case 'high':   where.points = { gte: 500 };           break;
    }
  }

  const includeClause = {
    sales: { select: { id: true, total: true } },
    _count: { select: { sales: true } },
  };

  const serialize = (customers: any[]) =>
    customers.map(c => ({
      ...c,
      sales: c.sales.map((s: any) => ({ id: s.id, total: Number(s.total) })),
    }));

  // ✅ Birthday sort: fetch all matching rows, sort in app, then paginate manually
  if (sort === 'birthday_asc') {
    const all = await db.user.findMany({ where, orderBy: { name: 'asc' }, include: includeClause });

    const sorted = all.sort(
      (a, b) => getDaysUntilNextBirthday(a.birthday) - getDaysUntilNextBirthday(b.birthday)
    );

    return {
      customers: serialize(sorted.slice(skip, skip + limit)),
      total: sorted.length,
    };
  }

  // Normal DB-level sort for all other options
  const orderBy: any = [];
  switch (sort) {
    case 'name_asc':     orderBy.push({ name: 'asc' });       break;
    case 'name_desc':    orderBy.push({ name: 'desc' });      break;
    case 'points_asc':   orderBy.push({ points: 'asc' });     break;
    case 'points_desc':  orderBy.push({ points: 'desc' });    break;
    case 'joined_asc':   orderBy.push({ createdAt: 'asc' });  break;
    case 'joined_desc':  orderBy.push({ createdAt: 'desc' }); break;
    default:             orderBy.push({ createdAt: 'desc' });
  }

  const [customers, total] = await Promise.all([
    db.user.findMany({ where, skip, take: limit, orderBy, include: includeClause }),
    db.user.count({ where }),
  ]);

  return { customers: serialize(customers), total };
}

export default async function ManagerCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    points?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const points = params.points || 'all';
  const sort = params.sort || 'joined_desc';

  const stats = await getCustomerStats();
  const { customers, total } = await getAllCustomers({ page, limit, search, points, sort });

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
        <CardContent className="space-y-4">
          {/* ✅ Search & Filter Bar added to manager view */}
          <SearchFilterBar
            searchPlaceholder="Search by name, phone, or email..."
            filters={[
              {
                key: 'points',
                label: 'Points Range',
                defaultValue: 'all',
                options: [
                  { value: 'all', label: 'All Points' },
                  { value: 'low', label: '< 100 points' },
                  { value: 'medium', label: '100-499 points' },
                  { value: 'high', label: '500+ points' },
                ],
              },
            ]}
            sortOptions={[
              { value: 'joined_desc', label: 'Recently Joined' },
              { value: 'joined_asc', label: 'Oldest Members' },
              { value: 'name_asc', label: 'Name (A-Z)' },
              { value: 'name_desc', label: 'Name (Z-A)' },
              { value: 'points_desc', label: 'Highest Points' },
              { value: 'points_asc', label: 'Lowest Points' },
              // ✅ New sort option
              { value: 'birthday_asc', label: '🎂 Ulang Tahun Terdekat' },
            ]}
            defaultSort="joined_desc"
          />

          <CustomersTable 
            customers={customers} 
            showActions={false}
            currentPage={page}
            pageSize={limit}
            totalItems={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}
