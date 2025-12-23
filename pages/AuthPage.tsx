
import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Default admin initialization
  useEffect(() => {
    const savedAdmins = localStorage.getItem('edustream_admins');
    if (!savedAdmins) {
      localStorage.setItem('edustream_admins', JSON.stringify([{ username: 'admin', password: 'admin' }]));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Harap isi semua kolom.');
      return;
    }

    const savedAdmins = JSON.parse(localStorage.getItem('edustream_admins') || '[]');

    if (isLogin) {
      const found = savedAdmins.find((a: any) => a.username === username && a.password === password);
      if (found) {
        onLoginSuccess();
      } else {
        setError('Username atau password salah.');
      }
    } else {
      const exists = savedAdmins.find((a: any) => a.username === username);
      if (exists) {
        setError('Username sudah terdaftar.');
      } else {
        const newAdmins = [...savedAdmins, { username, password }];
        localStorage.setItem('edustream_admins', JSON.stringify(newAdmins));
        setIsLogin(true);
        setError('');
        alert('Registrasi Instructor Berhasil! Silakan Login.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-indigo-600 p-10 text-white text-center space-y-2">
          <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-2 backdrop-blur-md">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">Instructor Portal</h2>
          <p className="text-indigo-100 font-medium opacity-80">
            {isLogin ? 'Masuk untuk mengelola kursus' : 'Daftarkan akun instructor baru'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Login Sekarang' : 'Daftar Instructor'}
          </button>

          <div className="pt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors"
            >
              {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Login di sini'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
