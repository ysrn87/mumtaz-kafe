'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createVariantAction, updateVariantAction } from '@/actions/products';
import { Plus, Pencil } from 'lucide-react';

interface VariantDialogProps {
  mode: 'create' | 'edit';
  productId?: string;
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    cost: number;
    stock: number;
    lowStock: number;
  };
  trigger?: React.ReactNode;
}

export function VariantDialog({ mode, productId, variant, trigger }: VariantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      if (mode === 'create' && productId) {
        formData.append('productId', productId);
      }

      const result = mode === 'create' 
        ? await createVariantAction(formData)
        : await updateVariantAction(variant!.id, formData);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: `Variant ${mode === 'create' ? 'created' : 'updated'} successfully.`,
        });
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to ${mode} variant.`,
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
        {trigger || (
          <Button variant={mode === 'create' ? 'outline' : 'ghost'} size="sm">
            {mode === 'create' ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Varian
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Variant' : 'Edit Variant'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Variant Name *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={variant?.name}
                placeholder="e.g., Small - Black, 32x32 - Blue"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                required
                defaultValue={variant?.sku}
                placeholder="e.g., TSH-001-S-BLK"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={variant?.price}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cost">Cost *</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={variant?.cost}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            {mode === 'create' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Initial Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    defaultValue="0"
                    placeholder="0"
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lowStock">Low Stock Alert *</Label>
                  <Input
                    id="lowStock"
                    name="lowStock"
                    type="number"
                    min="0"
                    required
                    defaultValue={variant?.lowStock || 10}
                    placeholder="10"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {mode === 'edit' && (
              <div className="grid gap-2">
                <Label htmlFor="lowStock">Low Stock Alert *</Label>
                <Input
                  id="lowStock"
                  name="lowStock"
                  type="number"
                  min="0"
                  required
                  defaultValue={variant?.lowStock}
                  placeholder="10"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Variant' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
