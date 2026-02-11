'use client';

import { deleteCustomerAction } from '@/actions/members';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';

interface CustomerDeleteButtonProps {
  customerId: string;
  onSuccess?: () => void;
}

export function CustomerDeleteButton({ customerId, onSuccess }: CustomerDeleteButtonProps) {
  const handleDelete = async () => {
    const result = await deleteCustomerAction(customerId);
    if (result.success && onSuccess) {
      onSuccess();
    }
    return result;
  };

  return (
    <DeleteConfirmDialog
      title="Delete Customer"
      description="Are you sure you want to delete this customer? This action cannot be undone if the customer has no sales history."
      onConfirm={handleDelete}
    />
  );
}
