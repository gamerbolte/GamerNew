import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reviewsAPI } from '@/lib/api';

const emptyReview = { reviewer_name: '', rating: 5, comment: '', review_date: '' };

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState(emptyReview);

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getAll();
      setReviews(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleOpenDialog = (review = null) => {
    if (review) { setEditingReview(review); setFormData({ reviewer_name: review.reviewer_name, rating: review.rating, comment: review.comment, review_date: review.review_date ? review.review_date.split('T')[0] : '' }); }
    else { setEditingReview(null); setFormData(emptyReview); }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reviewer_name || !formData.comment) { toast.error('Name and comment are required'); return; }
    try {
      const submitData = { ...formData, review_date: formData.review_date ? new Date(formData.review_date).toISOString() : new Date().toISOString() };
      if (editingReview) { await reviewsAPI.update(editingReview.id, submitData); toast.success('Review updated!'); }
      else { await reviewsAPI.create(submitData); toast.success('Review created!'); }
      setIsDialogOpen(false);
      fetchReviews();
    } catch (error) { toast.error(error.response?.data?.detail || 'Error saving review'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try { await reviewsAPI.delete(id); toast.success('Review deleted!'); fetchReviews(); } catch (error) { toast.error('Error deleting review'); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <AdminLayout title="Reviews">
      <div className="space-y-4 lg:space-y-6" data-testid="admin-reviews">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-white/60 text-sm lg:text-base">Manage customer reviews displayed on the homepage</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto" data-testid="add-review-btn"><Plus className="h-4 w-4 mr-2" />Add Review</Button>
        </div>

        <div className="space-y-3">
          {isLoading ? <div className="text-center py-8 text-white/40">Loading...</div> : reviews.length === 0 ? (
            <div className="text-center py-12 bg-card border border-white/10 rounded-lg"><Star className="h-12 w-12 mx-auto text-white/20 mb-4" /><p className="text-white/40 mb-4">No reviews yet</p><Button onClick={() => handleOpenDialog()} variant="outline" className="border-gold-500 text-gold-500"><Plus className="h-4 w-4 mr-2" />Add Your First Review</Button></div>
          ) : reviews.map((review) => (
            <div key={review.id} className="bg-card border border-white/10 rounded-lg p-4 hover:border-gold-500/30 transition-all" data-testid={`review-row-${review.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-heading font-semibold text-white">{review.reviewer_name}</h3>
                    <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-white/20'}`} />)}</div>
                    <span className="text-white/40 text-xs">{formatDate(review.review_date)}</span>
                  </div>
                  <p className="text-white/70 text-sm line-clamp-2">"{review.comment}"</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(review)} className="text-white/60 hover:text-gold-500 p-2" data-testid={`edit-review-${review.id}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(review.id)} className="text-white/60 hover:text-red-500 p-2" data-testid={`delete-review-${review.id}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-md mx-4">
            <DialogHeader><DialogTitle className="font-heading text-xl uppercase">{editingReview ? 'Edit Review' : 'Add Review'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <div className="space-y-2"><Label>Reviewer Name</Label><Input value={formData.reviewer_name} onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })} className="bg-black border-white/20" placeholder="e.g. John Doe" required data-testid="review-name-input" /></div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-2">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setFormData({ ...formData, rating: star })} className="p-1"><Star className={`h-6 w-6 transition-colors ${star <= formData.rating ? 'text-gold-500 fill-gold-500' : 'text-white/30'}`} /></button>)}</div>
              </div>
              <div className="space-y-2"><Label>Comment</Label><Textarea value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} className="bg-black border-white/20" placeholder="Write the review..." rows={4} required data-testid="review-comment-input" /></div>
              <div className="space-y-2"><Label>Review Date (optional)</Label><Input type="date" value={formData.review_date} onChange={(e) => setFormData({ ...formData, review_date: e.target.value })} className="bg-black border-white/20" data-testid="review-date-input" /></div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto" data-testid="save-review-btn">{editingReview ? 'Update' : 'Create'} Review</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
