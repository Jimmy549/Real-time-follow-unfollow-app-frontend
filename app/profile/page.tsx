'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Edit3, Save, X, UserPlus, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { usersAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    profilePicture: '',
  });
  
  const router = useRouter();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }
    
    setProfileData({
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
    });
    
    loadAllUsers();
  }, [user, router, isHydrated]);

  const loadAllUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await usersAPI.followUser(userId);
      toast.success('User followed!');
      
      // Update current user's following list
      const updatedUser = {
        ...user,
        following: [...(user.following || []), userId],
        followingCount: (user.followingCount || 0) + 1
      };
      setUser(updatedUser);
      
      loadAllUsers();
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await usersAPI.unfollowUser(userId);
      toast.success('User unfollowed!');
      
      // Update current user's following list
      const updatedUser = {
        ...user,
        following: (user.following || []).filter(id => id !== userId),
        followingCount: Math.max(0, (user.followingCount || 0) - 1)
      };
      setUser(updatedUser);
      
      loadAllUsers();
    } catch (error) {
      toast.error('Failed to unfollow user');
    }
  };

  const handleSave = async () => {
    try {
      const response = await usersAPI.updateProfile(profileData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!isHydrated || !user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg bg-dark-800/50 border border-white/20 hover:border-neon-blue/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            NEURAL PROFILE
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 neon-border"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-neon-blue/50 mx-auto animate-glow"
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-neon-green rounded-full border-2 border-dark-900"></div>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-neon-blue">{user.username}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setShowFollowers(!showFollowers)}
              className="glass-card p-4 text-center hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-neon-blue" />
                <span className="text-sm text-gray-400">Followers</span>
              </div>
              <span className="text-2xl font-bold text-neon-blue">{user.followersCount || 0}</span>
            </button>
            <button
              onClick={() => setShowFollowing(!showFollowing)}
              className="glass-card p-4 text-center hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-neon-purple" />
                <span className="text-sm text-gray-400">Following</span>
              </div>
              <span className="text-2xl font-bold text-neon-purple">{user.followingCount || 0}</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bio</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg hover:bg-neon-blue/30 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 border border-neon-green/50 rounded-lg hover:bg-neon-green/30 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        bio: user.bio || '',
                        profilePicture: user.profilePicture || '',
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell the network about yourself..."
                className="cyber-input w-full h-32 resize-none"
              />
            ) : (
              <div className="glass-card p-4">
                <p className="text-gray-300">
                  {user.bio || 'No bio available. Click edit to add one.'}
                </p>
              </div>
            )}
          </div>

          {/* Users List */}
          {(showFollowers || showFollowing) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 glass-card p-4"
            >
              <h3 className="text-lg font-semibold mb-4">
                {showFollowers ? 'All Users' : 'All Users'}
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                {allUsers.filter(u => u._id !== user.id).map((otherUser) => {
                  const isFollowing = user.following?.includes(otherUser._id);
                  return (
                    <div key={otherUser._id} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={otherUser.profilePicture || '/default-avatar.svg'}
                          alt={otherUser.username}
                          className="w-10 h-10 rounded-full border border-neon-blue/50"
                        />
                        <div>
                          <p className="font-medium">{otherUser.username}</p>
                          <p className="text-sm text-gray-400">{otherUser.followersCount || 0} followers</p>
                        </div>
                      </div>
                      <button
                        onClick={() => isFollowing ? handleUnfollow(otherUser._id) : handleFollow(otherUser._id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                          isFollowing 
                            ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400'
                            : 'bg-neon-blue/20 border border-neon-blue/50 hover:bg-neon-blue/30 text-neon-blue'
                        }`}
                      >
                        {isFollowing ? (
                          <><UserMinus className="h-4 w-4" /> Unfollow</>
                        ) : (
                          <><UserPlus className="h-4 w-4" /> Follow</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}