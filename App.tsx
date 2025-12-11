import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Stocks from './pages/Stocks';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { auth } from './services/firebase';

const AppRoutes: React.FC = () => {
  const { currentUser, loadingData } = useData();

  if (loadingData && !currentUser) {
    // Show a simple loading screen while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    auth.signOut();
  };

  const userDisplay = currentUser ? {
    name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email || ''
  } : null;

  return (
    <Routes>
      <Route path="/login" element={
        currentUser ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/*" element={
        currentUser ? (
          <Layout user={userDisplay} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </HashRouter>
  );
};

export default App;