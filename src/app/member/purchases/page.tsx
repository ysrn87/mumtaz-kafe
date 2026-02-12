import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/utils';

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

  const purchases = await getPurchaseHistory(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Purchase History</h1>
        <p className="text-gray-600">View all your past purchases</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No purchases yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order {purchase.saleNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(purchase.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(Number(purchase.total))}</p>
                    <p className="text-sm text-green-600 font-medium">
                      +{purchase.pointsEarned} poin bertambah
                    </p>
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
          ))}
        </div>
      )}
    </div>
  );
}
