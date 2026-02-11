'use client';

import { deleteProductAction, deleteVariantAction } from '@/actions/products';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';

interface ProductDeleteButtonProps {
  productId: string;
}

export function ProductDeleteButton({ productId }: ProductDeleteButtonProps) {
  return (
    <DeleteConfirmDialog
      title="Delete Product"
      description="Are you sure you want to delete this product? All variants will also be deleted."
      onConfirm={async () => await deleteProductAction(productId)}
    />
  );
}

interface VariantDeleteButtonProps {
  variantId: string;
}

export function VariantDeleteButton({ variantId }: VariantDeleteButtonProps) {
  return (
    <DeleteConfirmDialog
      title="Delete Variant"
      description="Are you sure you want to delete this variant?"
      onConfirm={async () => await deleteVariantAction(variantId)}
    />
  );
}
