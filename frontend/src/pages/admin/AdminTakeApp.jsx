import { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Store, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { takeappAPI } from '@/lib/api';

export default function AdminTakeApp() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [storeRes, ordersRes, inventoryRes] = await Promise.all([
        takeappAPI.getStore().catch(err => { if (err.response?.status === 400) setApiKeyMissing(true); throw err; }),
        takeappAPI.getOrders().catch(() => ({ data: [] })),
        takeappAPI.getInventory().catch(() => ({ data: [] })),
      ]);
      setStoreInfo(storeRes.data);
      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
    } catch (error) {
      if (!apiKeyMissing) console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success('Data refreshed!');
  };

  if (apiKeyMissing) {
    return (
      <AdminLayout title="Take.app Integration">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6" data-testid="takeapp-api-missing">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading text-lg font-semibold text-yellow-500 mb-2">Take.app API Key Required</h3>
              <p className="text-white/60 mb-4">To use Take.app integration, you need to add your API key to the backend environment variables.</p>
              <div className="bg-black/50 rounded-lg p-4 text-sm"><code className="text-gold-500">TAKEAPP_API_KEY=your_api_key_here</code></div>
              <p className="text-white/40 text-sm mt-4">Get your API key from <a href="https://take.app/settings/api" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Take.app Settings</a></p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Take.app Integration">
      <div className="space-y-4 lg:space-y-6" data-testid="admin-takeapp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-white/60 text-sm lg:text-base">Manage your Take.app store integration</p>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="border-gold-500 text-gold-500 w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh Data
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-lg"></div>)}</div>
        ) : (
          <>
            {storeInfo && (
              <div className="bg-card border border-white/10 rounded-lg p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4"><Store className="h-5 w-5 text-gold-500" /><h2 className="font-heading text-lg font-semibold text-white uppercase">Store Info</h2></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><span className="text-white/60 text-sm">Store Name</span><p className="text-white font-medium">{storeInfo.name || 'N/A'}</p></div>
                  <div><span className="text-white/60 text-sm">Alias</span><p className="text-white font-medium">{storeInfo.alias || 'N/A'}</p></div>
                  <div><span className="text-white/60 text-sm">Currency</span><p className="text-white font-medium">{storeInfo.currency || 'NPR'}</p></div>
                  <div><a href={`https://take.app/${storeInfo.alias}`} target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline flex items-center gap-1 text-sm">Visit Store <ExternalLink className="h-3 w-3" /></a></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-card border border-white/10 rounded-lg p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4"><ShoppingCart className="h-5 w-5 text-gold-500" /><h2 className="font-heading text-lg font-semibold text-white uppercase">Recent Orders ({orders.length})</h2></div>
                {orders.length === 0 ? <p className="text-white/40 text-center py-4">No orders yet</p> : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} className="bg-black/50 rounded-lg p-3 flex items-center justify-between">
                        <div><p className="text-white text-sm font-medium">#{order.number || order.id}</p><p className="text-white/40 text-xs">{order.customer_name}</p></div>
                        <div className="text-right"><p className="text-gold-500 font-medium">Rs {order.total_amount}</p><p className="text-white/40 text-xs">{order.status}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card border border-white/10 rounded-lg p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4"><Package className="h-5 w-5 text-gold-500" /><h2 className="font-heading text-lg font-semibold text-white uppercase">Inventory ({inventory.length})</h2></div>
                {inventory.length === 0 ? <p className="text-white/40 text-center py-4">No inventory items</p> : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {inventory.map((item) => (
                      <div key={item.id} className="bg-black/50 rounded-lg p-3 flex items-center justify-between">
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className={`font-medium ${item.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>{item.quantity} in stock</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
