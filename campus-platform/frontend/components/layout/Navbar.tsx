'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardPath = user?.role === 'super_admin' ? '/admin' : user?.role === 'club_admin' ? '/club-admin' : '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">CampusHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/clubs" className="hover:text-white transition-colors">Clubs</Link>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            {user && <Link href="/club-request" className="hover:text-white transition-colors">Register Club</Link>}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardPath} className="btn-outline text-sm py-2 px-4">Dashboard</Link>
                <button onClick={logout} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline text-sm py-2 px-4">Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-2">
          <Link href="/clubs" className="block py-2 text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Clubs</Link>
          <Link href="/events" className="block py-2 text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Events</Link>
          {user ? (
            <>
              <Link href={dashboardPath} className="block py-2 text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={logout} className="block py-2 text-gray-400 hover:text-white w-full text-left">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2 text-indigo-400 font-medium" onClick={() => setOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
