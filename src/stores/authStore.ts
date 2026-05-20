import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

export type Role = 'admin' | 'club_admin' | 'student';

export interface AppUser {
  id: string;
  name: string;
  email: string;
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
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
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

    // 1) Listener FIRST
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        authUser: session?.user ?? null,
        isAuthenticated: !!session,
      });
      if (session?.user) {
        // Load profile immediately — no defer
        get().loadProfile(session.user.id);
      } else {
        set({ user: null, roles: [], primaryRole: null });
      }
    });

    // 2) Then existing session
    const { data: { session } } = await supabase.auth.getSession();
    set({
      session,
      authUser: session?.user ?? null,
      isAuthenticated: !!session,
      initialized: true,
      isLoading: false,
    });
    if (session?.user) {
      await get().loadProfile(session.user.id);
    }
  },

  loadProfile: async (userId: string) => {
    const [{ data: profile }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('id, name, email, avatar_url').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    const roles = (rolesData?.map((r) => r.role) || []) as Role[];
    set({
      user: profile ? { id: profile.id, name: profile.name, email: profile.email, avatar_url: profile.avatar_url } : null,
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

  signUp: async (name, email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name },
      },
    });
    if (error) { set({ isLoading: false }); return { error: error.message }; }
    if (data.user) await get().loadProfile(data.user.id);
    set({ isLoading: false });
    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, roles: [], primaryRole: null, session: null, authUser: null, isAuthenticated: false });
  },
}));
