import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { socketService } from './socket';

interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
  following?: string[];
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  replies?: Comment[];
  parentComment?: string;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  sender: {
    username: string;
    profilePicture: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface AppState {
  user: User | null;
  token: string | null;
  comments: Comment[];
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initializeSocket: () => void;
}

export const useAppStore = create<AppState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    comments: [],
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setComments: (comments) => set({ comments: Array.isArray(comments) ? comments : [] }),
    addComment: (comment) => set((state) => ({ 
      comments: [comment, ...state.comments] 
    })),
    updateComment: (commentId, updates) => set((state) => ({
      comments: state.comments.map(comment => 
        comment._id === commentId ? { ...comment, ...updates } : comment
      )
    })),
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) => set((state) => ({ 
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),
    setUnreadCount: (unreadCount) => set({ unreadCount }),
    setLoading: (isLoading) => set({ isLoading }),
    
    logout: () => {
      socketService.disconnect();
      set({ 
        user: null, 
        token: null, 
        comments: [], 
        notifications: [], 
        unreadCount: 0 
      });
    },

    initializeSocket: () => {
      const { token } = get();
      if (token) {
        const socket = socketService.connect(token);
        
        socket.on('new_comment', (comment) => {
          get().addComment(comment);
        });

        socket.on('comment_reply', (notification) => {
          get().addNotification(notification);
        });

        socket.on('comment_like', (notification) => {
          get().addNotification(notification);
        });

        socket.on('new_follower', (notification) => {
          get().addNotification(notification);
        });

        socket.on('like_update', ({ commentId, likesCount }) => {
          get().updateComment(commentId, { likesCount });
        });

        socket.on('notification_received', (notification) => {
          get().addNotification(notification);
        });
      }
    },
  }),
  {
    name: 'cyber-comments-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ 
      user: state.user, 
      token: state.token 
    }),
  }
));