import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CATEGORIES } from '../constants';
import { TransactionType } from '../types';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';

const Transactions: React.FC = () => {
  const { transactions, accounts, addTransaction, deleteTransaction } = useData();
  const [filter, setFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTransactions = transactions.filter(t => 
    t.category.includes(filter) || 
    t.note?.includes(filter) ||
    accounts.find(a => a.id === t.accountId)?.name.includes(filter)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: Number(amount),
        category,
        accountId,
        date,
        note
      });

      setIsFormOpen(false);
      setAmount('');
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">收支紀錄</h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          記帳
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
          <h3 className="text-lg font-bold mb-4 text-slate-800">新增紀錄</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-3 flex space-x-4 mb-2">
               <label className="flex items-center cursor-pointer">
                 <input type="radio" checked={type === TransactionType.EXPENSE} onChange={() => setType(TransactionType.EXPENSE)} className="mr-2" />
                 <span className="text-red-500 font-bold">支出</span>
               </label>
               <label className="flex items-center cursor-pointer">
                 <input type="radio" checked={type === TransactionType.INCOME} onChange={() => setType(TransactionType.INCOME)} className="mr-2" />
                 <span className="text-green-500 font-bold">收入</span>
               </label>
            </div>
            
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="p-2 border rounded-lg"
              required 
            />
            <input 
              type="number" 
              placeholder="金額" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="p-2 border rounded-lg"
              required 
            />
            <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="p-2 border rounded-lg">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
            </select>
            <input 
              type="text" 
              placeholder="備註" 
              value={note} 
              onChange={e => setNote(e.target.value)}
              className="p-2 border rounded-lg md:col-span-2"
            />
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-70">
                {isSubmitting ? '儲存中...' : '儲存'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="搜尋備註、分類或帳戶..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full outline-none text-slate-600"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-3 text-left">日期</th>
                <th className="px-6 py-3 text-left">分類</th>
                <th className="px-6 py-3 text-left">備註</th>
                <th className="px-6 py-3 text-left">帳戶</th>
                <th className="px-6 py-3 text-right">金額</th>
                <th className="px-6 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-600">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{t.note || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {accounts.find(a => a.id === t.accountId)?.name}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-slate-400">沒有符合的交易紀錄</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;