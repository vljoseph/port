import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Key, Mail, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@portfolio.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isForgotPassword) {
      try {
        const response = await api.post('/auth/forgot-password', { email, newPassword: password });
        setSuccess(response.data.message);
        setIsForgotPassword(false);
        setPassword('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reset password');
      }
    } else {
      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
          localStorage.setItem('adminToken', response.data.token);
          navigate('/admin/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred connecting to the server');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 transition-colors z-10"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 md:p-10 rounded-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Lock className="text-purple-600 dark:text-purple-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{isForgotPassword ? 'Reset Password' : 'Admin Portal'}</h2>
          <p className="text-slate-600 dark:text-slate-400">{isForgotPassword ? 'Enter your registered email and a new password.' : 'Secure access to content management'}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm">
            {success}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email / Username</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="admin@portfolio.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{isForgotPassword ? 'New Password' : 'Password'}</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-12 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isForgotPassword && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-500 focus:ring-purple-500" />
                Remember me
              </label>
              <button type="button" onClick={() => {setIsForgotPassword(true); setError(''); setSuccess(''); setPassword('');}} className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors">Forgot Password?</button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isForgotPassword ? 'Reset Password' : 'Secure Login'
            )}
          </button>
          
          {isForgotPassword && (
            <div className="text-center mt-4">
              <button type="button" onClick={() => {setIsForgotPassword(false); setError(''); setSuccess(''); setPassword('');}} className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Back to Login</button>
            </div>
          )}
        </form>


      </motion.div>
    </div>
  );
};

export default AdminLogin;
