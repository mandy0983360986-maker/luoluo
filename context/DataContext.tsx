import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BankAccount, Transaction, StockHolding, TransactionType } from '../types';
import { fetchStockPrices } from '../services/geminiService';
import { db, auth, initializationError } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface DataContextType {
  accounts: BankAccount[];
  transactions: Transaction[];
  stocks: StockHolding[];
  addAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateAccount: (account: BankAccount) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addStock: (stock: Omit<StockHolding, 'id'>) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
  updateStockPrices: () => Promise<void>;
  isLoadingStocks: boolean;
  currentUser: FirebaseUser | null;
  loadingData: boolean;
  configError: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  // Default loading to true, but check initialization immediately
  const [loadingData, setLoadingData] = useState(!initializationError);
  const [configError, setConfigError] = useState<string | null>(initializationError ? initializationError.message : null);

  // Monitor Auth State
  useEffect(() => {
    if (initializationError) {
      setConfigError(initializationError.message);
      setLoadingData(false);
      return;
    }

    if (!auth) {
      setConfigError("Firebase auth service not available.");
      setLoadingData(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // Clear data on logout
        setAccounts([]);
        setTransactions([]);
        setStocks([]);
      }
      // Auth check complete
      setLoadingData(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Listeners
  useEffect(() => {
    if (!currentUser || !db) return;

    setLoadingData(true);
    const userId = currentUser.uid;

    // Accounts Listener
    const qAccounts = query(collection(db, 'accounts'), where("userId", "==", userId));
    const unsubscribeAccounts = onSnapshot(qAccounts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankAccount));
      setAccounts(data);
    });

    // Transactions Listener
    const qTransactions = query(collection(db, 'transactions'), where("userId", "==", userId));
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      // Sort locally or add orderBy index in Firestore
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    // Stocks Listener
    const qStocks = query(collection(db, 'stocks'), where("userId", "==", userId));
    const unsubscribeStocks = onSnapshot(qStocks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHolding));
      setStocks(data);
      setLoadingData(false);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
      unsubscribeStocks();
    };
  }, [currentUser]);

  const addAccount = async (account: Omit<BankAccount, 'id'>) => {
    if (!currentUser || !db) return;
    await addDoc(collection(db, 'accounts'), { ...account, userId: currentUser.uid });
  };

  const deleteAccount = async (id: string) => {
    if (!currentUser || !db) return;
    await deleteDoc(doc(db, 'accounts', id));
  };

  const updateAccount = async (updated: BankAccount) => {
    if (!currentUser || !db) return;
    const { id, ...data } = updated;
    await updateDoc(doc(db, 'accounts', id), data as any);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!currentUser || !db) return;
    
    // Create a batch to update transaction and account balance atomically
    const batch = writeBatch(db);
    
    // 1. Add Transaction
    const txRef = doc(collection(db, 'transactions'));
    batch.set(txRef, { ...transaction, userId: currentUser.uid });

    // 2. Update Account Balance
    const account = accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const amountDiff = transaction.type === TransactionType.EXPENSE ? -transaction.amount : transaction.amount;
      const accRef = doc(db, 'accounts', account.id);
      batch.update(accRef, { balance: account.balance + amountDiff });
    }

    await batch.commit();
  };

  const deleteTransaction = async (id: string) => {
    if (!currentUser || !db) return;
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const batch = writeBatch(db);

    // 1. Delete Transaction
    const txRef = doc(db, 'transactions', id);
    batch.delete(txRef);

    // 2. Revert Balance
    const account = accounts.find(a => a.id === tx.accountId);
    if (account) {
      const amountDiff = tx.type === TransactionType.EXPENSE ? tx.amount : -tx.amount;
      const accRef = doc(db, 'accounts', account.id);
      batch.update(accRef, { balance: account.balance + amountDiff });
    }

    await batch.commit();
  };

  const addStock = async (stock: Omit<StockHolding, 'id'>) => {
    if (!currentUser || !db) return;
    await addDoc(collection(db, 'stocks'), { ...stock, userId: currentUser.uid });
  };

  const deleteStock = async (id: string) => {
    if (!currentUser || !db) return;
    await deleteDoc(doc(db, 'stocks', id));
  };

  const updateStockPrices = async () => {
    if (!currentUser || !db || stocks.length === 0) return;
    setIsLoadingStocks(true);
    try {
      const updates = await fetchStockPrices(stocks);
      if (updates.length > 0) {
        const batch = writeBatch(db);
        stocks.forEach(stock => {
          const update = updates.find(u => u.symbol === stock.symbol);
          if (update) {
            const stockRef = doc(db, 'stocks', stock.id);
            batch.update(stockRef, { currentPrice: update.price });
          }
        });
        await batch.commit();
      }
    } finally {
      setIsLoadingStocks(false);
    }
  };

  return (
    <DataContext.Provider value={{
      accounts,
      transactions,
      stocks,
      addAccount,
      deleteAccount,
      updateAccount,
      addTransaction,
      deleteTransaction,
      addStock,
      deleteStock,
      updateStockPrices,
      isLoadingStocks,
      currentUser,
      loadingData,
      configError
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};