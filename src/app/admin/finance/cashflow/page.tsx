import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CashflowDialog } from '@/components/cashflow/cashflow-dialog';
import { CashflowTable } from '@/components/cashflow/cashflow-table';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { SearchFilterBar } from '@/components/filters/search-filter-bar';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildDateWhere(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return undefined;

  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) {
    range.gte = new Date(dateFrom);
  }
  if (dateTo) {
  range.lte = new Date(dateTo);
  }
  return range;
}

function formatDateLabel(dateFrom?: string, dateTo?: string): string | null {
  if (!dateFrom && !dateTo) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  if (dateFrom && dateTo) return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  if (dateFrom) return `Dari ${fmt(dateFrom)}`;
  return `Sampai ${fmt(dateTo!)}`;
}

// ─── data fetchers ───────────────────────────────────────────────────────────

async function getCashflowData(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = 'all',
    sort = 'date_desc',
    dateFrom,
    dateTo,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' as const } },
      { category: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  if (type !== 'all') {
    where.type = type;
  }

  const dateRange = buildDateWhere(dateFrom, dateTo);
  if (dateRange) {
    where.date = dateRange;
  }

  const orderBy: any = [];
  switch (sort) {
    case 'date_asc':
      orderBy.push({ date: 'asc' });
      break;
    case 'date_desc':
      orderBy.push({ date: 'desc' });
      break;
    case 'amount_asc':
      orderBy.push({ amount: 'asc' });
      break;
    case 'amount_desc':
      orderBy.push({ amount: 'desc' });
      break;
    default:
      orderBy.push({ date: 'desc' });
  }

  const [transactions, total] = await Promise.all([
    db.cashflow.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.cashflow.count({ where }),
  ]);

  return {
    transactions: transactions.map(t => ({
      ...t,
      amount: Number(t.amount),
    })),
    total,
  };
}

async function getCashflowStats(params: {
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const { dateFrom, dateTo } = params;
  const dateRange = buildDateWhere(dateFrom, dateTo);

  const incomeWhere: any = { type: 'INCOME' };
  const expenseWhere: any = { type: 'EXPENSE' };

  if (dateRange) {
    incomeWhere.date = dateRange;
    expenseWhere.date = dateRange;
  }

  const [totalIncome, totalExpense] = await Promise.all([
    db.cashflow.aggregate({
      where: incomeWhere,
      _sum: { amount: true },
    }),
    db.cashflow.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
    }),
  ]);

  const income = Number(totalIncome._sum.amount || 0);
  const expense = Number(totalExpense._sum.amount || 0);
  const balance = income - expense;

  return { income, expense, balance };
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function AdminCashflowPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    type?: string;
    sort?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const type = params.type || 'all';
  const sort = params.sort || 'date_desc';
  const dateFrom = params.dateFrom || '';
  const dateTo = params.dateTo || '';

  const { transactions, total } = await getCashflowData({
    page,
    limit,
    search,
    type,
    sort,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const stats = await getCashflowStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const isDateFiltered = !!(dateFrom || dateTo);
  const dateLabel = formatDateLabel(dateFrom || undefined, dateTo || undefined);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <CashflowDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.income)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDateFiltered ? dateLabel : 'Total pendapatan'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.expense)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDateFiltered ? dateLabel : 'Total biaya'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDateFiltered ? dateLabel : 'Pendapatan - Pengeluaran'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className={`text-sm font-medium ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <p>Bagi hasil system (10%) • {stats.balance >= 0 ? formatCurrency(stats.balance / 10) : formatCurrency(0)}</p>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter Bar */}
          <SearchFilterBar
            searchPlaceholder="Search by description or category..."
            dateRange={{
              fromKey: 'dateFrom',
              toKey: 'dateTo',
              fromLabel: 'Dari Tanggal',
              toLabel: 'Sampai Tanggal',
            }}
            filters={[
              {
                key: 'type',
                label: 'Transaction Type',
                defaultValue: 'all',
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'INCOME', label: 'Income' },
                  { value: 'EXPENSE', label: 'Expense' },
                ],
              },
            ]}
            sortOptions={[
              { value: 'date_desc', label: 'Newest First' },
              { value: 'date_asc', label: 'Oldest First' },
              { value: 'amount_desc', label: 'Highest Amount' },
              { value: 'amount_asc', label: 'Lowest Amount' },
            ]}
            defaultSort="date_desc"
          />

          {/* Cashflow Table */}
          <CashflowTable
            transactions={transactions}
            currentPage={page}
            pageSize={limit}
            totalItems={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}
