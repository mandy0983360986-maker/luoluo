import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const { accounts, transactions, stocks } = useData();

  const totalAssets = useMemo(() => {
    const cash = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const stockValue = stocks.reduce((sum, s) => {
      // Simple currency conversion handling (Simulated: USD * 30 = TWD)
      const price = s.currentPrice;
      const value = price * s.quantity;
      return sum + (s.currency === 'USD' ? value * 32 : value);
    }, 0);
    return cash + stockValue;
  }, [accounts, stocks]);

  const monthlyStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const currentMonth = new Date().getMonth();
    
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth) {
        if (t.type === 'INCOME') income += t.amount;
        if (t.type === 'EXPENSE') expense += t.amount;
      }
    });
    return { income, expense };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Assets Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">總資產 (預估 TWD)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                ${totalAssets.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>資產健康</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">本月收入</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                ${monthlyStats.income.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">本月支出</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                ${monthlyStats.expense.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ArrowDownRight size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-4">近期交易</h4>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    t.type === 'INCOME' ? 'bg-green-500' : 'bg-slate-400'
                  }`}>
                    {t.type === 'INCOME' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{t.category}</p>
                    <p className="text-xs text-slate-500">{t.date} • {t.note}</p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Structure */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h4 className="text-lg font-bold text-slate-900 mb-4">支出結構</h4>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
             {expenseByCategory.map((entry, index) => (
               <div key={entry.name} className="flex items-center text-xs text-slate-600">
                 <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 {entry.name}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;