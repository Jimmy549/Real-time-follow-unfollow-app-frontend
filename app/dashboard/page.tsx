'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, MessageCircle, Bell, User, LogOut } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { commentsAPI, notificationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import UserProfileSection from '../../components/UserProfileSection';

// Extend window type
declare global {
  interface Window {
    socketInitialized?: boolean;
  }
}

export default function DashboardPage() {
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const { 
    user, 
    comments, 
    notifications, 
    unreadCount,
    setComments, 
    setNotifications,
    setUnreadCount,
    logout,
    updateComment,
    setUser
  } = useAppStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Load fresh user profile data
    loadUserProfile();
    
    // Initialize socket connection
    if (user && typeof window !== 'undefined' && !window.socketInitialized) {
      window.socketInitialized = true;
      const { initializeSocket } = useAppStore.getState();
      initializeSocket();
    }
    
    loadComments();
    loadNotifications();
  }, [user, router, isHydrated]);

  const loadUserProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user profile');
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getAllComments();
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const loadNotifications = async () => {
    try {
      const [notifResponse, countResponse] = await Promise.all([
        notificationsAPI.getUserNotifications(),
        notificationsAPI.getUnreadCount()
      ]);
      setNotifications(notifResponse.data);
      setUnreadCount(countResponse.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await commentsAPI.createComment({ content: commentText });
      setCommentText('');
      toast.success('Comment posted!');
      loadComments();
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await commentsAPI.createComment({ 
        content: replyText, 
        parentComment: parentId 
      });
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted!');
      loadComments();
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleLike = async (commentId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!commentId) return;
    
    try {
      await commentsAPI.likeComment(commentId);
      setTimeout(() => {
        loadComments();
      }, 100);
    } catch (error: any) {
      console.error('Like error:', error);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.socketInitialized = false;
    }
    logout();
    router.push('/auth');
  };

  if (!isHydrated || !user) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            CYBER FEED
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    setUnreadCount(0);
                  }
                }}
                className="p-2 rounded-lg bg-dark-800/50 border border-white/20 hover:border-neon-blue/50 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-80 glass-card border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-hide"
                >
                  <h3 className="font-semibold mb-3">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((notif, index) => (
                      <div key={notif._id || `notif-${index}`} className="p-2 border-b border-white/10 last:border-b-0">
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
            
            <button
              onClick={() => router.push('/profile')}
              className="p-2 rounded-lg bg-dark-800/50 border border-white/20 hover:border-neon-blue/50 transition-colors"
            >
              <User className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-dark-800/50 border border-white/20 hover:border-red-500/50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* User Profile Section */}
        <UserProfileSection />
        
        {/* Comment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 neon-border"
        >
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts with the network..."
              className="cyber-input w-full h-24 resize-none mb-4"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Connected as {user.username}
              </span>
              <motion.button
                type="submit"
                className="cyber-button flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-4 w-4" />
                TRANSMIT
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Comments Feed */}
        <div className="space-y-4">
          {Array.isArray(comments) && comments
            .filter((comment, index, arr) => arr.findIndex(c => c._id === comment._id) === index)
            .map((comment, commentIndex) => (
            <motion.div
              key={comment._id || `comment-${commentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={comment.author?.profilePicture || '/default-avatar.svg'}
                  alt={comment.author?.username || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-neon-blue/50"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-neon-blue">
                      {comment.author?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {comment.createdAt && comment.createdAt !== 'Invalid Date' 
                        ? new Date(comment.createdAt).toLocaleString() 
                        : new Date().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-4 break-words overflow-wrap-anywhere">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLike(comment._id, e)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-neon-pink transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      {comment.likesCount}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-neon-blue transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={(e) => handleSubmitReply(e, comment._id)}
                      className="mt-4 p-4 bg-dark-800/30 rounded-lg border border-white/10"
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="cyber-input w-full h-20 resize-none mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded text-sm hover:bg-neon-blue/30 transition-colors"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-2 bg-gray-600/20 border border-gray-600/50 rounded text-sm hover:bg-gray-600/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {comment.replies.map((reply, replyIndex) => (
                        <div key={reply._id || `reply-${replyIndex}`} className="flex items-start gap-3 p-3 bg-dark-800/20 rounded-lg border-l-2 border-neon-purple/50">
                          <img
                            src={reply.author?.profilePicture || '/default-avatar.svg'}
                            alt={reply.author?.username || 'User'}
                            className="w-8 h-8 rounded-full border border-neon-purple/50"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-neon-purple text-sm">
                                {reply.author?.username || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : new Date().toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm break-words overflow-wrap-anywhere">{reply.content}</p>
                            <button
                              onClick={(e) => {
                                console.log('Reply like clicked:', reply._id);
                                handleLike(reply._id, e);
                              }}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-neon-pink transition-colors mt-2"
                            >
                              <Heart className="h-3 w-3" />
                              {reply.likesCount || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}