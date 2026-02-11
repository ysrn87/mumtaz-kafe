'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { createCustomerAction, updateCustomerAction } from '@/actions/members';
import { Plus, Pencil } from 'lucide-react';

interface CustomerDialogProps {
  mode: 'create' | 'edit';
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    birthday?: Date;
    photoUrl?: string;
    points: number;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CustomerDialog({ mode, customer, trigger, onSuccess }: CustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(customer?.photoUrl || '');
  const { toast } = useToast();

  // Sync photoUrl state when dialog opens or customer changes
  useEffect(() => {
    if (open) {
      setPhotoUrl(customer?.photoUrl || '');
    }
  }, [open, customer?.photoUrl]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = mode === 'create'
        ? await createCustomerAction(formData)
        : await updateCustomerAction(customer!.id, formData);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: `Customer ${mode === 'create' ? 'created' : 'updated'} successfully.`,
        });
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to ${mode} customer.`,
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
          <Button variant={mode === 'create' ? 'default' : 'ghost'} size={mode === 'create' ? 'default' : 'sm'}>
            {mode === 'create' ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Member' : 'Edit Member'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={customer?.name}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email}
                placeholder="john@example.com"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">No. WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={customer?.phone}
                placeholder="+62 812-3456-7890"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="birthday">Tanggal Lahir</Label>
              <Input
                id="birthday"
                name="birthday"
                type="date"
                defaultValue={customer?.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : ''}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <div className="flex gap-3 items-start">
                <Avatar className="w-16 h-16 border-2 border-gray-200">
                  <AvatarImage 
                    src={photoUrl || undefined} 
                    alt="Preview"
                    className="object-cover object-center"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {customer?.name?.slice(0, 2).toUpperCase() || 'PH'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a direct link to the customer's photo
                  </p>
                </div>
              </div>
            </div>

            {mode === 'create' && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  minLength={6}
                  disabled={loading}
                />
              </div>
            )}

            {mode === 'edit' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="points">Loyalty Points</Label>
                  <Input
                    id="points"
                    name="points"
                    type="number"
                    min="0"
                    defaultValue={customer?.points}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Changes will be recorded in points history
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">New Password (Optional)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Leave empty to keep current password"
                    minLength={6}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Min. 6 characters. Leave empty to keep current password.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Register Member' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}