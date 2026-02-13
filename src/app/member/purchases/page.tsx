import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getPointsConversionRate } from '@/actions/settings';
import { Gift } from 'lucide-react';

async function getPurchaseHistory(userId: string) {
  return db.sale.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: 'desc' },
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
  });
}

export default async function MemberPurchasesPage() {
  const session = await auth();
  if (!session) return null;

  const [purchases, conversionRate] = await Promise.all([
    getPurchaseHistory(session.user.id),
    getPointsConversionRate(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Riwayat Pembelian</h1>
        <p className="text-gray-600">Lihat semua pembelian terdahulu</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No purchases yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const pointsRedeemed = purchase.pointsRedeemed || 0;
            const pointDiscount = pointsRedeemed * conversionRate;
            
            return (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 mb-2">
                        {purchase.pointsEarned > 0 && (
                          <p className="inline-flex items-center px-2 py-1 rounded-full text-sm 
                         font-medium bg-blue-100 text-blue-800">
                            +{purchase.pointsEarned} poin
                          </p>
                        )}
                        {pointsRedeemed > 0 && (
                          <p className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm 
                         font-medium bg-purple-100 text-purple-800">
                            <Gift className="w-4 h-4" />
                            -{pointsRedeemed} poin ditukar
                          </p>
                        )}
                      </div>
                      <CardTitle className="text-lg">Order {purchase.saleNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(purchase.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">

                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchase.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.variant.product.name}
                          </TableCell>
                          <TableCell>{item.variant.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(item.price))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(item.subtotal))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(Number(purchase.subtotal))}</span>
                    </div>
                    {Number(purchase.discount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(Number(purchase.discount))}</span>
                      </div>
                    )}
                    {pointsRedeemed > 0 && (
                      <div className="flex justify-between text-purple-600 font-medium">
                        <span>Point Discount ({pointsRedeemed} pts):</span>
                        <span>-{formatCurrency(pointDiscount)}</span>
                      </div>
                    )}
                    {Number(purchase.tax) > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(Number(purchase.tax))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(Number(purchase.total))}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Metode Bayar: <span className="font-medium">{purchase.paymentMethod}</span>
                    </p>
                    {purchase.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Notes: {purchase.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}