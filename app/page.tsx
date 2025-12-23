'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, MessageCircle, Heart, Users, ArrowRight } from 'lucide-react';
import { useAppStore } from '../lib/store';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [user, router, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto"></div>
          <p className="text-center mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if no user
  if (!user) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              CYBER COMMENTS
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Experience the future of real-time communication with our cutting-edge comment system
            </p>
            <motion.button
              onClick={() => router.push('/auth')}
              className="cyber-button text-lg px-8 py-4 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter the Matrix
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 neon-border text-center"
            >
              <MessageCircle className="h-12 w-12 text-neon-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Comments</h3>
              <p className="text-gray-400">Instant messaging with live updates across all connected users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 neon-border text-center"
            >
              <Heart className="h-12 w-12 text-neon-pink mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Interactive Likes</h3>
              <p className="text-gray-400">Express yourself with real-time like system and notifications</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 neon-border text-center"
            >
              <Users className="h-12 w-12 text-neon-purple mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">User Profiles</h3>
              <p className="text-gray-400">Connect with others through detailed profiles and follow system</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Show user profile section if logged in
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        {/* User Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8 neon-border"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={user.profilePicture || '/default-avatar.svg'}
                alt={user.username}
                className="w-20 h-20 rounded-full border-4 border-neon-blue/50"
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-neon-green rounded-full border-2 border-dark-900"></div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neon-blue mb-2">{user.username}</h1>
              <p className="text-gray-400 mb-4">{user.email}</p>
              <p className="text-gray-300">{user.bio || 'No bio available'}</p>
            </div>

            <div className="text-center">
              <div className="flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-neon-blue">{user.followersCount || 0}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neon-purple">{user.followingCount || 0}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="glass-card p-6 hover:bg-white/10 transition-colors neon-border"
            whileHover={{ scale: 1.02 }}
          >
            <MessageCircle className="h-8 w-8 text-neon-blue mb-3" />
            <h3 className="font-semibold mb-2">Comments Feed</h3>
            <p className="text-sm text-gray-400">View and interact with comments</p>
          </motion.button>

          <motion.button
            onClick={() => router.push('/profile')}
            className="glass-card p-6 hover:bg-white/10 transition-colors neon-border"
            whileHover={{ scale: 1.02 }}
          >
            <User className="h-8 w-8 text-neon-purple mb-3" />
            <h3 className="font-semibold mb-2">Edit Profile</h3>
            <p className="text-sm text-gray-400">Manage your profile settings</p>
          </motion.button>

          <motion.button
            onClick={() => router.push('/profile')}
            className="glass-card p-6 hover:bg-white/10 transition-colors neon-border"
            whileHover={{ scale: 1.02 }}
          >
            <Users className="h-8 w-8 text-neon-pink mb-3" />
            <h3 className="font-semibold mb-2">Follow Users</h3>
            <p className="text-sm text-gray-400">Connect with other users</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}