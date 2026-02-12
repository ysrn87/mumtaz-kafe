'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createSaleAction } from '@/actions/sales';
import { Plus, Trash2, Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SaleItem {
  variantId: string;
  variantName: string;
  quantity: number;
  price: number;
}

interface NewSaleDialogProps {
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    product: {
      name: string;
    };
  }>;
  customers: Array<{
    id: string;
    name: string;
    points: number;
  }>;
  conversionRate?: number; // Points to Rupiah conversion rate
}

export function NewSaleDialog({ variants, customers, conversionRate = 1000 }: NewSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerId, setCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const { toast } = useToast();

  // Get selected customer's available points
  const selectedCustomer = customers.find(c => c.id === customerId);
  const availablePoints = selectedCustomer?.points || 0;
  const pointDiscount = pointsToRedeem * conversionRate; // Use configurable rate

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discount - pointDiscount + tax;

  // Validate discount doesn't exceed subtotal
  const handleDiscountChange = (value: number) => {
    if (value > subtotal) {
      toast({
        title: 'Invalid Discount',
        description: 'Discount cannot exceed subtotal amount.',
        variant: 'destructive',
      });
      setDiscount(subtotal);
    } else {
      setDiscount(value);
    }
  };

  // Handle point redemption
  const handlePointsRedeemChange = (value: number) => {
    if (value > availablePoints) {
      toast({
        title: 'Insufficient Points',
        description: `Customer only has ${availablePoints} points available.`,
        variant: 'destructive',
      });
      setPointsToRedeem(availablePoints);
    } else if (value < 0) {
      setPointsToRedeem(0);
    } else {
      setPointsToRedeem(value);
    }
  };

  // Reset points when customer changes
  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setPointsToRedeem(0); // Reset points when changing customer
  };

  const addItem = () => {
    if (!selectedVariantId || quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Please select a product and enter quantity.',
        variant: 'destructive',
      });
      return;
    }

    const variant = variants.find(v => v.id === selectedVariantId);
    if (!variant) return;

    if (quantity > variant.stock) {
      toast({
        title: 'Error',
        description: `Only ${variant.stock} units available in stock.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if item already exists
    const existingItemIndex = items.findIndex(item => item.variantId === selectedVariantId);
    
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += quantity;
      setItems(newItems);
    } else {
      setItems([...items, {
        variantId: variant.id,
        variantName: `${variant.product.name} - ${variant.name}`,
        quantity,
        price: variant.price,
      }]);
    }

    setSelectedVariantId('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast({
        title: 'Error',
        description: 'Please select a customer.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item to the sale.',
        variant: 'destructive',
      });
      return;
    }

    if (discount > subtotal) {
      toast({
        title: 'Error',
        description: 'Discount cannot exceed subtotal amount.',
        variant: 'destructive',
      });
      return;
    }

    if (pointsToRedeem > availablePoints) {
      toast({
        title: 'Error',
        description: 'Points to redeem exceed available points.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createSaleAction({
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        customerId: customerId === 'WALK_IN' ? null : customerId,
        paymentMethod,
        discount,
        tax,
        pointsRedeemed: customerId !== 'WALK_IN' ? pointsToRedeem : 0,
      });
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: `Sale completed. Total: ${formatCurrency(total)}`,
        });
        setItems([]);
        setCustomerId('');
        setDiscount(0);
        setTax(0);
        setPointsToRedeem(0);
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to process sale.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Customer Selection - Required First */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900">Langkah 1: Pilih Pelanggan *</h3>
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Pelanggan Umum</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.points} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Selection - Only show if customer is selected */}
          {customerId && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold">Langkah 2: Tambah Item</h3>
                <div className="grid grid-cols-[1fr,100px,auto] gap-2">
                  <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih product" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.filter(v => v.stock > 0).map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.product.name} - {variant.name} ({formatCurrency(variant.price)}) - Stock: {variant.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                  />
                  <Button className="bg-blue-900 text-white" type="button" onClick={addItem} variant="outline">
                    + Add
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Items ({items.length})</h3>
                  <div className="border rounded-lg divide-y">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <p className="font-medium">{item.variantName}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Methode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount & Tax */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount (Max: {formatCurrency(subtotal)})</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tax}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Point Redemption - Only for members */}
              {customerId && customerId !== 'WALK_IN' && (
                <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">Redeem Points</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Available Points:</span>
                      <span className="font-semibold text-purple-900">{availablePoints} points</span>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="pointsRedeem" className="text-purple-900">
                        Points to Redeem (Max: {availablePoints})
                      </Label>
                      <Input
                        id="pointsRedeem"
                        type="number"
                        min="0"
                        max={availablePoints}
                        value={pointsToRedeem}
                        onChange={(e) => handlePointsRedeemChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-white"
                      />
                      <p className="text-xs text-purple-600">
                        1 point = Rp {conversionRate.toLocaleString('id-ID')} discount • {pointsToRedeem} points = {formatCurrency(pointDiscount)}
                      </p>
                    </div>

                    {pointsToRedeem > 0 && (
                      <div className="p-3 bg-white rounded border border-purple-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-700">Point Discount:</span>
                          <span className="text-lg font-bold text-purple-900">-{formatCurrency(pointDiscount)}</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Note: You won't earn points from this sale when redeeming points
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {items.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  {pointsToRedeem > 0 && (
                    <div className="flex justify-between text-sm text-purple-600 font-medium">
                      <span>Point Discount ({pointsToRedeem} pts):</span>
                      <span>-{formatCurrency(pointDiscount)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || items.length === 0 || !customerId}>
            {loading ? 'Processing...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
