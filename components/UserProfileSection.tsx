'use client';

import { motion } from 'framer-motion';
import { Edit, Users, UserPlus, X } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { usersAPI } from '../lib/api';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function UserProfileSection() {
  const { user, setUser } = useAppStore();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userFollowing, setUserFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Debug: Log user data
  console.log('User data in profile section:', user);
  console.log('Profile picture:', user?.profilePicture);

  if (!user) return null;

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getFollowers();
      setFollowers(response.data.followers || []);
    } catch (error) {
      toast.error('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const [usersResponse, profileResponse] = await Promise.all([
        usersAPI.getAllUsers(),
        usersAPI.getProfile()
      ]);
      setAllUsers(usersResponse.data || []);
      setUserFollowing(profileResponse.data.following?.map((f: any) => f._id) || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await usersAPI.followUser(userId);
      setUserFollowing([...userFollowing, userId]);
      // Update user's following count
      if (user) {
        setUser({ ...user, followingCount: (user.followingCount || 0) + 1 });
      }
      toast.success('User followed!');
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await usersAPI.unfollowUser(userId);
      setUserFollowing(userFollowing.filter(id => id !== userId));
      // Update user's following count
      if (user) {
        setUser({ ...user, followingCount: Math.max(0, (user.followingCount || 0) - 1) });
      }
      toast.success('User unfollowed!');
    } catch (error) {
      toast.error('Failed to unfollow user');
    }
  };

  const handleFollowersClick = () => {
    setShowFollowersModal(true);
    fetchFollowers();
  };

  const handleFollowingClick = () => {
    setShowFollowingModal(true);
    fetchFollowing();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6 neon-border"
    >
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        {/* Profile Picture with Online Status */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full border-2 border-neon-blue/50 p-1">
            <img
              src={user.profilePicture || '/default-avatar.svg'}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                console.log('Image failed to load:', user.profilePicture);
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
          </div>
          {/* Online Status Indicator */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-900"></div>
        </div>

        {/* Username and Email */}
        <h2 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-1">
          {user.username}
        </h2>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>

      {/* Followers and Following Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleFollowersClick}
          className="glass-card p-4 border border-neon-blue/30 rounded-lg hover:border-neon-blue/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-neon-blue" />
            <span className="text-neon-blue text-sm font-medium">Followers</span>
          </div>
          <div className="text-2xl font-bold text-neon-blue">
            {user.followersCount || 0}
          </div>
        </button>

        <button
          onClick={handleFollowingClick}
          className="glass-card p-4 border border-neon-purple/30 rounded-lg hover:border-neon-purple/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-neon-purple" />
            <span className="text-neon-purple text-sm font-medium">Following</span>
          </div>
          <div className="text-2xl font-bold text-neon-purple">
            {user.followingCount || 0}
          </div>
        </button>
      </div>

      {/* Bio Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Bio</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1 bg-neon-blue/20 border border-neon-blue/50 rounded-lg text-sm text-neon-blue hover:bg-neon-blue/30 transition-colors"
          >
            <Edit className="h-3 w-3" />
            Edit
          </motion.button>
        </div>
        <div className="glass-card p-4 border border-white/10 rounded-lg bg-dark-800/30">
          <p className="text-gray-300">
            {user.bio || 'No bio available'}
          </p>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-xl border border-neon-blue/50 w-96 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neon-blue">Followers</h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-center py-4">Loading...</p>
            ) : followers.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No followers yet</p>
            ) : (
              <div className="space-y-3">
                {followers.map((follower: any, index) => (
                  <div key={follower._id || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <img
                      src={follower.profilePicture || '/default-avatar.svg'}
                      alt={follower.username}
                      className="w-10 h-10 rounded-full border border-neon-blue/50"
                    />
                    <div>
                      <p className="font-medium text-white">{follower.username}</p>
                      <p className="text-sm text-gray-400">{follower.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Following Modal - Show All Users */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-xl border border-neon-purple/50 w-96 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neon-purple">Discover Users</h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {loading ? (
              <p className="text-gray-400 text-center py-4">Loading...</p>
            ) : allUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No users found</p>
            ) : (
              <div className="space-y-3">
                {allUsers.map((user: any, index) => (
                  <div key={user._id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture || '/default-avatar.svg'}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border border-neon-purple/50"
                      />
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.followersCount || 0} followers</p>
                      </div>
                    </div>
                    {userFollowing.includes(user._id) ? (
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(user._id)}
                        className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}