import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Award, TrendingUp, TrendingDown, ShoppingBag, ArrowUp, ArrowDown } from 'lucide-react';
import { MemberCard } from '@/components/customers/member-card';

async function getMemberData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [user, pointsHistory, todayPurchases, yesterdayPurchases] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        points: true,
        name: true,
        email: true,
        phone: true,
        birthday: true,
        photoUrl: true,
        createdAt: true,
      },
    }),
    db.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.sale.findMany({
      where: {
        customerId: userId,
        createdAt: { gte: today }
      },
      include: {
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
    }),
    db.sale.findMany({
      where: {
        customerId: userId,
        createdAt: {
          gte: yesterday,
          lt: today
        }
      },
      include: {
        items: true,
      },
    }),
  ]);

  return { user, pointsHistory, todayPurchases, yesterdayPurchases };
}

export default async function MemberDashboard() {
  const session = await auth();
  if (!session) return null;

  const { user, pointsHistory, todayPurchases, yesterdayPurchases } = await getMemberData(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Selamat datang, {user?.name}!</h1>
        <p className="text-gray-600">Profil dan poin keanggotaan Anda</p>
      </div>

      {/* Member Card */}
      {user && (
        <MemberCard
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            birthday: user.birthday,
            photoUrl: user.photoUrl,
            points: user.points,
            createdAt: user.createdAt,
          }}
          showMembershipId={true}
        />
      )}

      {/* Today's Purchase Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-xl">
            <ShoppingBag className="w-5 h-5" />
            Pembelian Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm font-semibold">{todayPurchases.length}</p>
                  <p className="text-xs text-muted-foreground">Transaksi</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {todayPurchases.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.quantity, 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Item</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {formatCurrency(todayPurchases.reduce((sum, p) => sum + Number(p.total), 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>

              {/* Comparison with Yesterday */}
              {(() => {
                const todayTotal = todayPurchases.reduce((sum, p) => sum + Number(p.total), 0);
                const yesterdayTotal = yesterdayPurchases.reduce((sum, p) => sum + Number(p.total), 0);

                if (yesterdayTotal === 0) return null;

                const percentageChange = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
                const isIncrease = percentageChange > 0;

                return (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`flex items-center gap-1 ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncrease ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">
                          {Math.abs(percentageChange).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        vs yesterday ({formatCurrency(yesterdayTotal)})
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-xl">
            <Award className="w-5 h-5" />
            Riwayat Poin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pointsHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No points activity yet</p>
          ) : (
            <div className="space-y-4 text-xs">
              {pointsHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${history.points > 0
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                        }`}
                    >
                      {history.points > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{history.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(history.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${history.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {history.points > 0 ? '+' : ''}
                    {history.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
