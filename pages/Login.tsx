import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { useData } from '../context/DataContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Settings, Save } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Configuration State
  const { configError } = useData();
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  useEffect(() => {
    // Automatically show config form if there is a config error
    if (configError === "Firebase Configuration Missing") {
      setShowConfig(true);
    }
  }, [configError]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('firebase_config', JSON.stringify(configForm));
      window.location.reload();
    } catch (err) {
      setError("無法儲存設定");
    }
  };

  const handleClearConfig = () => {
    localStorage.removeItem('firebase_config');
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!auth) {
      setError('Firebase 並未正確初始化，無法進行登入。');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('帳號或密碼錯誤');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('此 Email 已被註冊');
      } else if (err.code === 'auth/weak-password') {
        setError('密碼長度需至少 6 個字元');
      } else {
        setError('登入失敗，請稍後再試: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render Configuration Form
  if (showConfig) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-slate-900">Firebase 設定</h1>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-800">
            檢測到環境變數缺失。請手動輸入 Firebase 專案設定以繼續使用。
            <br />
            <span className="text-xs opacity-75">這些資訊將儲存在您的瀏覽器中。</span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field}</label>
                  <input
                    type="text"
                    required
                    value={(configForm as any)[field]}
                    onChange={(e) => setConfigForm({...configForm, [field]: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              {configError !== "Firebase Configuration Missing" && (
                <button 
                  type="button" 
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700"
                >
                  取消
                </button>
              )}
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center"
              >
                <Save size={18} className="mr-2" />
                儲存並重整
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Login Form
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl text-white font-bold text-3xl mb-4">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-900">歡迎使用 FinAI</h1>
          <p className="text-slate-500 mt-2">您的個人智慧財務管家</p>
          
          {/* Settings Button (Hidden trigger for manual config update) */}
          <button 
            onClick={() => setShowConfig(true)}
            className="absolute top-0 right-0 text-slate-300 hover:text-slate-500 transition"
            title="設定 Firebase"
          >
            <Settings size={20} />
          </button>
        </div>

        {configError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
             <strong>設定錯誤：</strong> {configError}
             <div className="mt-2 flex space-x-2">
               <button 
                 onClick={() => setShowConfig(true)}
                 className="text-xs font-bold underline hover:text-red-900"
               >
                 手動輸入設定
               </button>
               {localStorage.getItem('firebase_config') && (
                 <button 
                   onClick={handleClearConfig}
                   className="text-xs opacity-75 hover:opacity-100 underline"
                 >
                   清除快取設定
                 </button>
               )}
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
              {error}
            </div>
          )}
          
          {isRegister && (
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="您的姓名"
                required={isRegister}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !!configError}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center ${loading || !!configError ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              isRegister ? '註冊帳號' : '登入'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            disabled={!!configError}
            className="text-sm text-slate-500 hover:text-blue-600 transition disabled:opacity-50"
          >
            {isRegister ? '已有帳號？點此登入' : '沒有帳號？註冊一個'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;