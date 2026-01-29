import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { faqsAPI } from '@/lib/api';

const emptyFAQ = { question: '', answer: '', sort_order: 0 };

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState(emptyFAQ);

  const fetchFAQs = async () => {
    try { const res = await faqsAPI.getAll(); setFaqs(res.data); } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFAQs(); }, []);

  const handleOpenDialog = (faq = null) => {
    if (faq) { setEditingFAQ(faq); setFormData({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order }); }
    else { setEditingFAQ(null); setFormData(emptyFAQ); }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) { toast.error('Question and answer are required'); return; }
    try {
      if (editingFAQ) { await faqsAPI.update(editingFAQ.id, formData); toast.success('FAQ updated!'); }
      else { await faqsAPI.create(formData); toast.success('FAQ created!'); }
      setIsDialogOpen(false);
      fetchFAQs();
    } catch (error) { toast.error(error.response?.data?.detail || 'Error saving FAQ'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await faqsAPI.delete(id); toast.success('FAQ deleted!'); fetchFAQs(); } catch (error) { toast.error('Error deleting FAQ'); }
  };

  const handleReorder = async (startIndex, endIndex) => {
    if (startIndex === endIndex) return;
    const newFaqs = [...faqs];
    const [removed] = newFaqs.splice(startIndex, 1);
    newFaqs.splice(endIndex, 0, removed);
    setFaqs(newFaqs);
    try { await faqsAPI.reorder(newFaqs.map(f => f.id)); toast.success('Order updated'); } catch (error) { toast.error('Failed to reorder'); fetchFAQs(); }
  };

  return (
    <AdminLayout title="FAQs">
      <div className="space-y-4 lg:space-y-6" data-testid="admin-faqs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-white/60 text-sm lg:text-base">Manage frequently asked questions displayed on the FAQ page</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto" data-testid="add-faq-btn"><Plus className="h-4 w-4 mr-2" />Add FAQ</Button>
        </div>

        <div className="space-y-2">
          {isLoading ? <div className="text-center py-8 text-white/40">Loading...</div> : faqs.length === 0 ? (
            <div className="text-center py-12 bg-card border border-white/10 rounded-lg"><HelpCircle className="h-12 w-12 mx-auto text-white/20 mb-4" /><p className="text-white/40">No FAQs yet</p></div>
          ) : faqs.map((faq, index) => (
            <div key={faq.id} className="bg-card border border-white/10 rounded-lg p-4 hover:border-gold-500/30 transition-all" data-testid={`faq-row-${faq.id}`}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => handleReorder(index, index - 1)} disabled={index === 0} className="text-white/40 hover:text-gold-500 disabled:opacity-30 disabled:cursor-not-allowed"><GripVertical className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-white mb-1 line-clamp-1">{faq.question}</h3>
                  <p className="text-white/60 text-sm line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(faq)} className="text-white/60 hover:text-gold-500 p-2"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(faq.id)} className="text-white/60 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-lg sm:mx-auto">
            <DialogHeader><DialogTitle className="font-heading text-xl uppercase">{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <div className="space-y-2"><Label>Question</Label><Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="bg-black border-white/20" placeholder="How do I place an order?" required data-testid="faq-question-input" /></div>
              <div className="space-y-2"><Label>Answer</Label><Textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} className="bg-black border-white/20 min-h-[100px]" placeholder="Provide a helpful answer..." required data-testid="faq-answer-input" /></div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto" data-testid="save-faq-btn">{editingFAQ ? 'Update' : 'Create'} FAQ</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
