import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { BankAccount } from '../types';

const Accounts: React.FC = () => {
  const { accounts, addAccount, deleteAccount } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    name: '', type: 'Checking', balance: 0, currency: 'TWD', color: 'bg-blue-500'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;
    
    setIsSubmitting(true);
    try {
      await addAccount({
        name: newAccount.name,
        type: newAccount.type as any,
        balance: Number(newAccount.balance),
        currency: newAccount.currency || 'TWD',
        color: newAccount.color || 'bg-blue-500'
      });
      setIsModalOpen(false);
      setNewAccount({ name: '', type: 'Checking', balance: 0, currency: 'TWD', color: 'bg-blue-500' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">銀行與現金帳戶</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition relative group">
            <button 
              onClick={() => confirm("確定刪除此帳戶？(相關交易紀錄將保留)") && deleteAccount(account.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={18} />
            </button>
            <div className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{account.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{account.type} • {account.currency}</p>
            <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-500' : 'text-slate-900'}`}>
              {account.currency} ${account.balance.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">新增帳戶</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶名稱</label>
                <input 
                  type="text" 
                  required
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">類型</label>
                  <select 
                    value={newAccount.type}
                    onChange={e => setNewAccount({...newAccount, type: e.target.value as any})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="Checking">一般活存</option>
                    <option value="Savings">高利活存</option>
                    <option value="Credit">信用卡</option>
                    <option value="Investment">投資帳戶</option>
                    <option value="Cash">現金</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">幣別</label>
                  <select 
                    value={newAccount.currency}
                    onChange={e => setNewAccount({...newAccount, currency: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="TWD">TWD</option>
                    <option value="USD">USD</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">初始餘額</label>
                <input 
                  type="number" 
                  value={newAccount.balance}
                  onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70">
                  {isSubmitting ? '建立中...' : '建立'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;