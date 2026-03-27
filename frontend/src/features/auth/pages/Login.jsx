// ✅ src/features/auth/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ Add this
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from "../hook/useAuth"

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, loading, error } = useAuth(); // ✅ Get loading & error
  const { isAuthenticated } = useSelector((state) => state.auth); // ✅ Watch auth state
  
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(formData);
    // ✅ Don't navigate here - let useEffect handle it after Redux updates
  };

  // ✅ Redirect ONLY after auth state is updated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Authenticated, redirecting to dashboard...");
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#202222] rounded-xl border border-white/5 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h2>
          <p className="text-sm text-gray-400">Enter your credentials to access your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <Mail size={18} className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal-400 transition-colors" />
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#191A1A] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                placeholder="name@example.com" required disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock size={18} className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal-400 transition-colors" />
              <input
                type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#191A1A] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                placeholder="••••••••" required disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-600 text-[#191A1A] font-semibold rounded-lg transition-all duration-200 transform active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#191A1A] border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;