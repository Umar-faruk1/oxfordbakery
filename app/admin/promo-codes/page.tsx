'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expiry_date: string;
  created_at: string;
}

export default function PromoCodesPage() {
  const { user, isAdmin } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPromoCodes();
    }
  }, [user, isAdmin]);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !discountPercentage || !expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase.from('promo_codes').insert([
        {
          code: newCode.toUpperCase(),
          discount_percentage: parseInt(discountPercentage),
          expiry_date: new Date(expiryDate).toISOString(),
          is_active: true,
        },
      ]);

      if (error) throw error;

      toast.success('Promo code created successfully');
      setIsDialogOpen(false);
      setNewCode('');
      setDiscountPercentage('');
      setExpiryDate('');
      fetchPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast.error('Failed to create promo code');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Promo code status updated');
      fetchPromoCodes();
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast.error('Failed to update promo code status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);

      if (error) throw error;

      toast.success('Promo code deleted successfully');
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Failed to delete promo code');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Promo Codes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Promo Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Enter promo code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Percentage
                </label>
                <Input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="Enter discount percentage"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Date
                </label>
                <Input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Promo Code
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.map((code) => (
            <TableRow key={code.id}>
              <TableCell>{code.code}</TableCell>
              <TableCell>{code.discount_percentage}%</TableCell>
              <TableCell>
                <Button
                  variant={code.is_active ? 'default' : 'secondary'}
                  onClick={() => handleToggleActive(code.id, code.is_active)}
                >
                  {code.is_active ? 'Active' : 'Inactive'}
                </Button>
              </TableCell>
              <TableCell>
                {format(new Date(code.expiry_date), 'PPp')}
              </TableCell>
              <TableCell>
                {format(new Date(code.created_at), 'PPp')}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(code.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 