'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Building2, Calendar, Users, ClipboardList, PlusCircle, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clubs', label: 'Clubs', icon: Building2 },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/requests', label: 'Club Requests', icon: ClipboardList },
];

const clubAdminLinks = [
  { href: '/club-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/club-admin/events', label: 'My Events', icon: Calendar },
  { href: '/club-admin/events/new', label: 'Add Event', icon: PlusCircle },
  { href: '/club-admin/settings', label: 'Club Settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user?.role === 'super_admin' ? adminLinks : clubAdminLinks;

  return (
    <aside className="w-64 min-h-screen glass border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <p className="text-xs text-gray-500 mb-1">Logged in as</p>
        <p className="font-semibold text-white truncate">{user?.name}</p>
        <span className="badge bg-indigo-500/20 text-indigo-300 mt-1">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={clsx('sidebar-link', pathname === href && 'active')}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={logout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
