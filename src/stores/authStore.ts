import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

export type Role = 'admin' | 'club_admin' | 'student';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  session: Session | null;
  authUser: AuthUser | null;
  user: AppUser | null;
  roles: Role[];
  primaryRole: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const pickPrimaryRole = (roles: Role[]): Role | null => {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('club_admin')) return 'club_admin';
  if (roles.includes('student')) return 'student';
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  authUser: null,
  user: null,
  roles: [],
  primaryRole: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ isLoading: true });

    // Get existing session first
    const { data: { session } } = await supabase.auth.getSession();

    // Load profile if session exists BEFORE marking initialized
    if (session?.user) {
      set({ session, authUser: session.user, isAuthenticated: true });
      await get().loadProfile(session.user.id);
    }

    set({ initialized: true, isLoading: false });

    // Listen for future auth changes (sign in / sign out from other tabs)
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const prevUserId = get().authUser?.id;
      const newUserId = newSession?.user?.id;

      set({
        session: newSession,
        authUser: newSession?.user ?? null,
        isAuthenticated: !!newSession,
      });

      if (newSession?.user && newUserId !== prevUserId) {
        // Only reload profile if it's a different user (avoid double-load on same session)
        await get().loadProfile(newSession.user.id);
      } else if (!newSession) {
        set({ user: null, roles: [], primaryRole: null });
      }
    });
  },

  loadProfile: async (userId: string) => {
    const [{ data: profile }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('id, name, email, phone, avatar_url').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    const roles = (rolesData?.map((r) => r.role) || []) as Role[];
    set({
      user: profile
        ? { id: profile.id, name: profile.name, email: profile.email, phone: profile.phone, avatar_url: profile.avatar_url }
        : null,
      roles,
      primaryRole: pickPrimaryRole(roles),
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ isLoading: false }); return { error: error.message }; }
    if (data.user) await get().loadProfile(data.user.id);
    set({ isLoading: false });
    return {};
  },

  signUp: async (name, email, password, phone?: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) { set({ isLoading: false }); return { error: error.message }; }
    if (data.user) {
      // Save phone to profile
      if (phone) {
        await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
      }
      await get().loadProfile(data.user.id);
    }
    set({ isLoading: false });
    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, roles: [], primaryRole: null, session: null, authUser: null, isAuthenticated: false });
  },
}));
