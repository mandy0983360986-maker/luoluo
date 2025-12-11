import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, Receipt, PieChart, LogOut, Menu, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string } | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { firestoreError } = useData();

  const navItems = [
    { path: '/', label: '總覽 Dashboard', icon: LayoutDashboard },
    { path: '/accounts', label: '銀行帳戶', icon: Wallet },
    { path: '/transactions', label: '收支紀錄', icon: Receipt },
    { path: '/stocks', label: '股票投資', icon: TrendingUp },
    { path: '/reports', label: '財務報表', icon: PieChart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">F</div>
            <span className="text-xl font-bold tracking-wide">FinAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive(item.path) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">一般會員</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>登出</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">F</div>
            <span className="text-lg font-bold text-slate-900">FinAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Firestore Permissions Error Banner */}
            {firestoreError && firestoreError.code === 'permission-denied' && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start">
                <AlertTriangle className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-800 mb-1">Firestore 權限不足 (Permission Denied)</h3>
                  <p className="text-amber-700 text-sm mb-3">
                    應用程式無法讀取或寫入資料庫。請前往 Firebase Console 檢查您的 Firestore Security Rules。
                  </p>
                  
                  <div className="bg-amber-100 p-3 rounded text-xs font-mono text-amber-900 mb-3 overflow-x-auto">
                    <p className="text-slate-500 mb-1">// 建議的開發用規則 (允許已登入使用者存取)</p>
                    <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>
                  </div>
                  
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-bold text-amber-700 hover:text-amber-900 underline"
                  >
                    前往 Firebase Console <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            )}
            
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;