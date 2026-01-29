import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { paymentMethodsAPI } from '@/lib/api';

const emptyMethod = { name: '', image_url: '', is_active: true, sort_order: 0 };

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState(emptyMethod);

  const fetchMethods = async () => {
    try { const res = await paymentMethodsAPI.getAllAdmin(); setMethods(res.data); } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleOpenDialog = (method = null) => {
    if (method) { setEditingMethod(method); setFormData({ name: method.name, image_url: method.image_url, is_active: method.is_active, sort_order: method.sort_order }); }
    else { setEditingMethod(null); setFormData(emptyMethod); }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image_url) { toast.error('Name and image URL are required'); return; }
    try {
      if (editingMethod) { await paymentMethodsAPI.update(editingMethod.id, formData); toast.success('Payment method updated!'); }
      else { await paymentMethodsAPI.create(formData); toast.success('Payment method created!'); }
      setIsDialogOpen(false);
      fetchMethods();
    } catch (error) { toast.error(error.response?.data?.detail || 'Error saving payment method'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await paymentMethodsAPI.delete(id); toast.success('Payment method deleted!'); fetchMethods(); } catch (error) { toast.error('Error deleting payment method'); }
  };

  return (
    <AdminLayout title="Payment Methods">
      <div className="space-y-4 lg:space-y-6" data-testid="admin-payment-methods">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-white/60 text-sm lg:text-base">Manage payment methods displayed on the homepage</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto" data-testid="add-payment-method-btn"><Plus className="h-4 w-4 mr-2" />Add Payment Method</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {isLoading ? [1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-lg"></div>) : methods.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card border border-white/10 rounded-lg"><CreditCard className="h-12 w-12 mx-auto text-white/20 mb-4" /><p className="text-white/40">No payment methods yet</p></div>
          ) : methods.map((method) => (
            <div key={method.id} className={`bg-card border rounded-lg p-4 hover:border-gold-500/30 transition-all ${method.is_active ? 'border-white/10' : 'border-red-500/30 opacity-60'}`} data-testid={`payment-method-${method.id}`}>
              <div className="flex items-center gap-3">
                <img src={method.image_url} alt={method.name} className="h-10 w-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
                <div className="flex-1 min-w-0"><h3 className="font-heading font-semibold text-white">{method.name}</h3>{!method.is_active && <span className="text-red-400 text-xs">Inactive</span>}</div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(method)} className="text-white/60 hover:text-gold-500 p-2"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(method.id)} className="text-white/60 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-md sm:mx-auto">
            <DialogHeader><DialogTitle className="font-heading text-xl uppercase">{editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-black border-white/20" placeholder="e.g. eSewa" required /></div>
              <div className="space-y-2">
                <Label>Logo Image URL</Label>
                <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="bg-black border-white/20" placeholder="https://..." required />
                {formData.image_url && <div className="mt-2 flex items-center gap-2"><img src={formData.image_url} alt="Preview" className="h-10 w-auto" onError={(e) => e.target.style.display = 'none'} /><span className="text-white/40 text-xs">Preview</span></div>}
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} /><Label>Active</Label></div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto">{editingMethod ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
