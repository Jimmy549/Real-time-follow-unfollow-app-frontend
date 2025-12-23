'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { authAPI } from '../../lib/api';
import { useAppStore } from '../../lib/store';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const router = useRouter();
  const { user, setUser, setToken, initializeSocket } = useAppStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && user) {
      router.push('/dashboard');
    }
  }, [user, router, isHydrated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = isLogin 
        ? await authAPI.login({ username: formData.username, password: formData.password })
        : await authAPI.register(formData);

      const { access_token, user } = response.data;
      
      setToken(access_token);
      setUser(user);
      initializeSocket();
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 neon-border">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              CYBER COMMENTS
            </motion.h1>
            <p className="text-gray-400 mt-2">
              {isLogin ? 'Access the neural network' : 'Join the digital realm'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-neon-blue" />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="cyber-input pl-12 w-full"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-neon-blue" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="cyber-input pl-12 w-full"
                    required
                  />
                </div>
                <div className="relative">
                  <textarea
                    placeholder="Bio (optional)"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="cyber-input w-full h-20 resize-none"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-neon-blue" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="cyber-input pl-12 w-full"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="cyber-button w-full flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  {isLogin ? 'CONNECT' : 'INITIALIZE'}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-blue hover:text-neon-purple transition-colors"
            >
              {isLogin ? 'Need an account? Initialize' : 'Already connected? Access'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}