import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { useData } from '../context/DataContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Settings, Save, AlertCircle, ExternalLink } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [errorLink, setErrorLink] = useState(''); // New state for actionable error links
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
    // Automatically show config form if there is ANY config error (missing or invalid)
    if (configError) {
      setShowConfig(true);
    }
  }, [configError]);

  useEffect(() => {
    // Load existing config into form when opening settings
    if (showConfig) {
      try {
        const localConfig = localStorage.getItem('firebase_config');
        if (localConfig) {
          setConfigForm(JSON.parse(localConfig));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [showConfig]);

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
    setErrorLink('');
    
    if (!auth) {
      setError('Firebase 並未正確初始化，無法進行登入。');
      setShowConfig(true); // Ensure modal opens if they try to submit without valid auth
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim();

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
    } catch (err: any) {
      console.error(err);
      const errorCode = err.code;
      const errorMessage = err.message || '';

      if (errorCode === 'auth/invalid-credential') {
        setError('帳號或密碼錯誤');
      } else if (errorCode === 'auth/email-already-in-use') {
        setError('此 Email 已被註冊');
      } else if (errorCode === 'auth/weak-password') {
        setError('密碼長度需至少 6 個字元');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Email 格式不正確');
      } else if (errorCode === 'auth/operation-not-allowed') {
        setError('尚未啟用 Email 登入功能。');
        // Construct a direct link to the Firebase Console Authentication page
        const projectId = auth.app.options.projectId || configForm.projectId;
        if (projectId) {
          setErrorLink(`https://console.firebase.google.com/project/${projectId}/authentication/providers`);
        } else {
          setErrorLink('https://console.firebase.google.com/');
        }
      } else if (
        errorCode === 'auth/invalid-api-key' || 
        errorCode === 'auth/api-key-not-valid' ||
        errorMessage.includes('api-key-not-valid')
      ) {
        setError('Firebase API Key 無效。請檢查設定。');
        setShowConfig(true); 
      } else {
        setError('登入失敗: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render Configuration Form
  if (showConfig) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 z-50 fixed inset-0">
        <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-slate-900">Firebase 設定</h1>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-800">
             {configError ? (
               <div className="flex items-start">
                 <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                 <span>
                   <strong>設定需修正：</strong> {configError}
                   <br/>請輸入正確的 Firebase 專案設定。
                 </span>
               </div>
             ) : (
               "請輸入正確的 Firebase 專案設定。"
             )}
            <br />
            <span className="text-xs opacity-75 mt-2 block">這些資訊將儲存在您的瀏覽器中。</span>
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
                    onChange={(e) => setConfigForm({...configForm, [field]: e.target.value.trim()})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={handleClearConfig}
                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg mr-auto text-sm"
              >
                清除設定
              </button>

              {/* Allow cancelling only if there is no critical config error preventing the app from working at all */}
              {!configError && (
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
             <div className="mt-2">
               <button 
                 onClick={() => setShowConfig(true)}
                 className="text-xs font-bold underline hover:text-red-900"
               >
                 點此修正設定
               </button>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center break-words flex flex-col items-center justify-center">
              <div className="flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {errorLink && (
                <a 
                  href={errorLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 text-xs font-bold text-blue-600 underline flex items-center hover:text-blue-800"
                >
                  <ExternalLink size={12} className="mr-1" />
                  前往 Console 啟用 Email/Password
                </a>
              )}
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
            onClick={() => { setIsRegister(!isRegister); setError(''); setErrorLink(''); }}
            className="text-sm text-slate-500 hover:text-blue-600 transition"
          >
            {isRegister ? '已有帳號？點此登入' : '沒有帳號？註冊一個'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;