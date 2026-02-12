import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CashflowDialog } from '@/components/cashflow/cashflow-dialog';
import { CashflowTable } from '@/components/cashflow/cashflow-table';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

async function getCashflowData(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    db.cashflow.findMany({
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.cashflow.count(),
  ]);

  return {
    transactions: transactions.map(t => ({
      ...t,
      amount: Number(t.amount),
    })),
    total,
  };
}

async function getCashflowStats() {
  const [totalIncome, totalExpense] = await Promise.all([
    db.cashflow.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true },
    }),
    db.cashflow.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
    }),
  ]);

  const income = Number(totalIncome._sum.amount || 0);
  const expense = Number(totalExpense._sum.amount || 0);
  const balance = income - expense;

  return { income, expense, balance };
}

export default async function AdminCashflowPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const { transactions, total } = await getCashflowData(page, limit);
  const stats = await getCashflowStats();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cashflow</h1>
          <p className="text-gray-600">Kelola pemasukan dan pengeluaran operasional</p>
        </div>
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
            <p className="text-xs text-muted-foreground">Total pendapatan</p>
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
            <p className="text-xs text-muted-foreground">Total biaya</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Pendapatan - Pengeluaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
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