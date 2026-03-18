import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // State for two-way binding
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registering with:', formData);
    // Simulate API call then navigate
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#202222] rounded-xl border border-white/5 shadow-2xl">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Create an account</h2>
          <p className="text-sm text-gray-400">Start your journey with us today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal-400 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#191A1A] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#191A1A] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#191A1A] border border-white/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-500 hover:bg-teal-400 text-[#191A1A] font-semibold rounded-lg transition-all duration-200 transform active:scale-[0.98]"
          >
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
