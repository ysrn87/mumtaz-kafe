'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { MoreHorizontal, Eye, Award } from 'lucide-react';
import { CustomerDetailsDialog } from './customer-details-dialog';
import { useState } from 'react';
import { CustomerDialog } from './customer-dialog';
import { CustomerDeleteButton } from './customer-delete-button';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  birthday?: Date | null;
  photoUrl?: string | null;
  points: number;
  createdAt: Date;
  sales: Array<{
    id: string;
    total: any;
  }>;
  _count: {
    sales: number;
  };
}

interface CustomersTableProps {
  customers: Customer[];
  showActions?: boolean;
}

export function CustomersTable({ customers, showActions = false }: CustomersTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Poin</TableHead>
              <TableHead>Total Pembelian</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='text-xs'>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Tidak ditemukan pelanggan
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const totalSpent = customer.sales.reduce((sum, sale) => sum + Number(sale.total), 0);

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold">{customer.points}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer._count.sales}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(totalSpent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {showActions ? (
                        // Admin view with Edit & Delete
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <CustomerDialog
                            mode="edit"
                            customer={{
                              id: customer.id,
                              name: customer.name,
                              email: customer.email,
                              phone: customer.phone ?? undefined,
                              birthday: customer.birthday ?? undefined,
                              photoUrl: customer.photoUrl ?? undefined,
                              points: customer.points,
                            }}
                          />
                          <CustomerDeleteButton customerId={customer.id} />
                        </div>
                      ) : (
                        // Manager view (view only)
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
}