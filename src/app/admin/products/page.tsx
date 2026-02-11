import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { ProductDialog } from '@/components/products/product-dialog';
import { VariantDialog } from '@/components/products/variant-dialog';
import { ProductDeleteButton, VariantDeleteButton } from '@/components/products/delete-buttons';

async function getProducts() {
  const products = await db.product.findMany({
    include: {
      variants: true,
      createdBy: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(product => ({
    ...product,
    variants: product.variants.map(v => ({
      ...v,
      price: Number(v.price),
      cost: Number(v.cost),
    })),
  }));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produk & Varian</h1>
          <p className="text-gray-600">Kelola katalog produk Anda</p>
        </div>
        <ProductDialog mode="create" />
      </div>

      <div className="space-y-6">
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Belum ada produk tersedia. Buat produk pertama!</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      SKU: {product.sku} • {product.variants.length} varian
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <ProductDialog 
                      mode="edit" 
                      product={{
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        sku: product.sku,
                      }} 
                    />
                    <ProductDeleteButton productId={product.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {product.variants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Belum ada varian tersedia</p>
                    <VariantDialog mode="create" productId={product.id} />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Varian</h4>
                      <VariantDialog mode="create" productId={product.id} />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className='text-xs'>
                        {product.variants.map((variant) => (
                          <TableRow key={variant.id}>
                            <TableCell className="font-medium">{variant.name}</TableCell>
                            <TableCell>{variant.sku}</TableCell>
                            <TableCell>{formatCurrency(variant.price)}</TableCell>
                            <TableCell>{formatCurrency(variant.cost)}</TableCell>
                            <TableCell>
                              <span className={variant.stock <= variant.lowStock ? 'text-red-600 font-medium' : ''}>
                                {variant.stock}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                variant.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {variant.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <VariantDialog 
                                  mode="edit" 
                                  variant={{
                                    id: variant.id,
                                    name: variant.name,
                                    sku: variant.sku,
                                    price: variant.price,
                                    cost: variant.cost,
                                    stock: variant.stock,
                                    lowStock: variant.lowStock,
                                    points: variant.points,
                                  }} 
                                />
                                <VariantDeleteButton variantId={variant.id} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
