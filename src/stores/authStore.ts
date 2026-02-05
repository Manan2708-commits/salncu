import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string, role: UserRole) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - find user by email and role
    const user = mockUsers.find(u => u.email === email && u.role === role);
    
    if (user || email.includes('@')) {
      const mockUser: User = user || {
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email,
        role,
        createdAt: new Date(),
      };
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },

  signup: async (name: string, email: string, password: string, role: UserRole) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      createdAt: new Date(),
    };
    
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('user');
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));

// Initialize from localStorage
const storedUser = localStorage.getItem('user');
if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    useAuthStore.getState().setUser(user);
  } catch (e) {
    localStorage.removeItem('user');
  }
}
