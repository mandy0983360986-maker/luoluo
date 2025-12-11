import { BankAccount, Transaction, StockHolding, TransactionType } from './types';

export const DEMO_ACCOUNTS: BankAccount[] = [
  { id: '1', name: '主要帳戶 (玉山)', type: 'Checking', balance: 158000, currency: 'TWD', color: 'bg-blue-500' },
  { id: '2', name: '高利活存 (Richart)', type: 'Savings', balance: 320000, currency: 'TWD', color: 'bg-green-500' },
  { id: '3', name: '信用卡 (國泰)', type: 'Credit', balance: -15000, currency: 'TWD', color: 'bg-red-500' },
  { id: '4', name: '美股投資 (Firstrade)', type: 'Investment', balance: 12500, currency: 'USD', color: 'bg-purple-500' },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', accountId: '1', type: TransactionType.INCOME, amount: 55000, category: '薪資', date: '2023-10-05', note: '十月薪資' },
  { id: '2', accountId: '1', type: TransactionType.EXPENSE, amount: 12000, category: '房租', date: '2023-10-06', note: '十月房租' },
  { id: '3', accountId: '3', type: TransactionType.EXPENSE, amount: 350, category: '飲食', date: '2023-10-07', note: '午餐' },
  { id: '4', accountId: '3', type: TransactionType.EXPENSE, amount: 1200, category: '交通', date: '2023-10-08', note: '高鐵票' },
  { id: '5', accountId: '2', type: TransactionType.INCOME, amount: 450, category: '利息', date: '2023-10-21', note: '活存利息' },
  { id: '6', accountId: '3', type: TransactionType.EXPENSE, amount: 2500, category: '娛樂', date: '2023-10-25', note: '電影與聚餐' },
];

export const DEMO_STOCKS: StockHolding[] = [
  { id: '1', symbol: '2330.TW', name: '台積電', quantity: 1000, avgCost: 550, currentPrice: 580, currency: 'TWD', sector: 'Semiconductor' },
  { id: '2', symbol: '0050.TW', name: '元大台灣50', quantity: 2000, avgCost: 120, currentPrice: 132, currency: 'TWD', sector: 'ETF' },
  { id: '3', symbol: 'AAPL', name: 'Apple Inc.', quantity: 15, avgCost: 145, currentPrice: 175, currency: 'USD', sector: 'Tech' },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA', quantity: 10, avgCost: 400, currentPrice: 460, currency: 'USD', sector: 'Tech' },
];

export const CATEGORIES = [
  '飲食', '交通', '居住', '薪資', '娛樂', '醫療', '教育', '投資', '利息', '其他'
];