import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RefreshCw, Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { StockHolding } from '../types';

const Stocks: React.FC = () => {
  const { stocks, addStock, deleteStock, updateStockPrices, isLoadingStocks } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState<Partial<StockHolding>>({
    symbol: '', name: '', quantity: 0, avgCost: 0, currentPrice: 0, currency: 'TWD'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateReturn = (stock: StockHolding) => {
    const cost = stock.avgCost * stock.quantity;
    const value = stock.currentPrice * stock.quantity;
    const diff = value - cost;
    const percent = cost === 0 ? 0 : (diff / cost) * 100;
    return { diff, percent, value };
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.symbol || !newStock.quantity) return;
    
    setIsSubmitting(true);
    try {
      await addStock({
        symbol: newStock.symbol.toUpperCase(),
        name: newStock.name || newStock.symbol,
        quantity: Number(newStock.quantity),
        avgCost: Number(newStock.avgCost),
        currentPrice: Number(newStock.currentPrice || newStock.avgCost),
        currency: newStock.currency || 'TWD'
      });
      setIsModalOpen(false);
      setNewStock({ symbol: '', name: '', quantity: 0, avgCost: 0, currentPrice: 0, currency: 'TWD' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">投資組合管理</h2>
          <p className="text-slate-500 text-sm mt-1">使用 Gemini AI 模擬市場數據更新</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={updateStockPrices}
            disabled={isLoadingStocks || stocks.length === 0}
            className={`px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center hover:bg-slate-50 transition ${isLoadingStocks ? 'opacity-70' : ''}`}
          >
            <RefreshCw size={18} className={`mr-2 ${isLoadingStocks ? 'animate-spin' : ''}`} />
            {isLoadingStocks ? '更新中...' : '更新股價'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition"
          >
            <Plus size={18} className="mr-2" />
            新增持股
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map(stock => {
          const { diff, percent, value } = calculateReturn(stock);
          const isProfitable = diff >= 0;
          
          return (
            <div key={stock.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{stock.symbol}</h3>
                  <p className="text-sm text-slate-500">{stock.name}</p>
                </div>
                <div className={`flex items-center text-sm font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                  {isProfitable ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  {percent.toFixed(2)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">現價</p>
                  <p className="font-semibold text-slate-900">{stock.currentPrice}</p>
                </div>
                <div>
                   <p className="text-xs text-slate-500">成本</p>
                   <p className="font-semibold text-slate-900">{stock.avgCost}</p>
                </div>
                <div>
                   <p className="text-xs text-slate-500">持有股數</p>
                   <p className="font-semibold text-slate-900">{stock.quantity}</p>
                </div>
                <div>
                   <p className="text-xs text-slate-500">市值 ({stock.currency})</p>
                   <p className="font-semibold text-slate-900">{value.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                 <div className={`text-sm font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                    損益: {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                 </div>
                 <button onClick={() => deleteStock(stock.id)} className="text-slate-400 hover:text-red-500">
                   <Trash2 size={18} />
                 </button>
              </div>
            </div>
          );
        })}
        {stocks.length === 0 && (
           <div className="col-span-1 md:col-span-3 text-center p-8 text-slate-400">
              尚未建立投資組合，請點擊上方按鈕新增。
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">新增持股</h3>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="代號 (如 2330.TW)" 
                  value={newStock.symbol}
                  onChange={e => setNewStock({...newStock, symbol: e.target.value})}
                  className="p-2 border rounded-lg" required
                />
                 <input 
                  type="text" 
                  placeholder="名稱 (選填)" 
                  value={newStock.name}
                  onChange={e => setNewStock({...newStock, name: e.target.value})}
                  className="p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="股數" 
                  value={newStock.quantity || ''}
                  onChange={e => setNewStock({...newStock, quantity: Number(e.target.value)})}
                  className="p-2 border rounded-lg" required
                />
                 <input 
                  type="number" 
                  placeholder="平均成本" 
                  value={newStock.avgCost || ''}
                  onChange={e => setNewStock({...newStock, avgCost: Number(e.target.value)})}
                  className="p-2 border rounded-lg" required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="目前市價 (選填)" 
                  value={newStock.currentPrice || ''}
                  onChange={e => setNewStock({...newStock, currentPrice: Number(e.target.value)})}
                  className="p-2 border rounded-lg"
                />
                <select 
                   value={newStock.currency}
                   onChange={e => setNewStock({...newStock, currency: e.target.value})}
                   className="p-2 border rounded-lg"
                >
                  <option value="TWD">TWD</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70">
                  {isSubmitting ? '新增中...' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;