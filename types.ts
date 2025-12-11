export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Credit' | 'Investment' | 'Cash';
  balance: number;
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currency: string;
  sector?: string;
}

export interface FinancialData {
  accounts: BankAccount[];
  transactions: Transaction[];
  stocks: StockHolding[];
}

export interface StockPriceUpdate {
  symbol: string;
  price: number;
}