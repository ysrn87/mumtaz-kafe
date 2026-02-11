import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { CashflowDialog } from '@/components/cashflow/cashflow-dialog'; 
import { CashflowTable } from '@/components/cashflow/cashflow-table';

async function getCashflowStats() {
  const [totalIncome, totalExpense, recentTransactions] = await Promise.all([
    db.cashflow.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' },
    }),
    db.cashflow.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
    }),
    db.cashflow.findMany({
      take: 20,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    }),
  ]);

  const income = Number(totalIncome._sum.amount) || 0;
  const expense = Number(totalExpense._sum.amount) || 0;
  const netCashflow = income - expense;

  // Convert Decimal to number
  const serializedTransactions = recentTransactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return {
    totalIncome: income,
    totalExpense: expense,
    netCashflow,
    recentTransactions: serializedTransactions,
  };
}

export default async function AdminCashflowPage() {
  const stats = await getCashflowStats();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kelola Arus Kas</h1>
          <p className="text-gray-600">Catatan pemasukan dan pengeluaran</p>
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
              {formatCurrency(Number(stats.totalIncome))}
            </div>
            <p className="text-xs text-muted-foreground">Seluruh pemasukan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Number(stats.totalExpense))}
            </div>
            <p className="text-xs text-muted-foreground">Seluruh pengeluaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netCashflow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netCashflow)}
            </div>
            <p className="text-xs text-muted-foreground">Pemasukan - Pengeluaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Cashflow Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <CashflowTable transactions={stats.recentTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}