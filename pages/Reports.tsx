import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Reports: React.FC = () => {
  const { transactions, accounts, stocks } = useData();
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const dataByMonth = useMemo(() => {
    const data: Record<string, { name: string, income: number, expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!data[key]) {
        data[key] = { name: key, income: 0, expense: 0 };
      }
      
      if (t.type === 'INCOME') data[key].income += t.amount;
      if (t.type === 'EXPENSE') data[key].expense += t.amount;
    });

    return Object.values(data).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  const handleGetAdvice = async () => {
    if (!process.env.API_KEY) {
      alert("請先設定 API KEY 環境變數");
      return;
    }
    setLoadingAdvice(true);
    
    const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalStocks = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
    const lastMonth = dataByMonth[dataByMonth.length - 1];
    
    const summary = `
      總現金資產: ${totalAssets}
      股票投資總值: ${totalStocks}
      最近月份收入: ${lastMonth?.income || 0}
      最近月份支出: ${lastMonth?.expense || 0}
      支出占比前三高的類別: 飲食, 居住, 娛樂 (模擬)
    `;
    
    const result = await getFinancialAdvice(summary);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Sparkles className="mr-2" /> AI 財務顧問
            </h2>
            <p className="text-indigo-100 mb-4">
              根據您的資產配置與近期消費行為，取得個人化的理財建議。
            </p>
            {advice ? (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                <p className="leading-relaxed">{advice}</p>
              </div>
            ) : (
              <button 
                onClick={handleGetAdvice}
                disabled={loadingAdvice}
                className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition shadow-md disabled:opacity-70"
              >
                {loadingAdvice ? '分析中...' : '產生建議'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">收支趨勢圖</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Legend />
              <Bar dataKey="income" name="收入" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="支出" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;