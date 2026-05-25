import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, type Role } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Calendar, Users, Building2, CheckSquare, Settings,
  FileText, PlusCircle, ClipboardList, Award, Upload,
} from 'lucide-react';

interface SidebarProps { className?: string }

export function Sidebar({ className }: SidebarProps) {
  const { user, primaryRole } = useAuthStore();
  const location = useLocation();

  const getNavItems = () => {
    if (!primaryRole) return [];
    const baseHome = primaryRole === 'admin' ? '/admin' : primaryRole === 'club_admin' ? '/club-admin' : '/student';
    const base = [{ href: baseHome, label: 'Dashboard', icon: LayoutDashboard }];
    switch (primaryRole as Role) {
      case 'admin':
        return [
          ...base,
          { href: '/admin/clubs', label: 'Manage Clubs', icon: Building2 },
          { href: '/admin/events', label: 'Manage Events', icon: Calendar },
          { href: '/admin/create-event', label: 'Create SAL Event', icon: PlusCircle },
          { href: '/admin/approvals', label: 'Approvals', icon: CheckSquare },
          { href: '/admin/club-requests', label: 'Club Requests', icon: ClipboardList },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/certificates', label: 'Certificates', icon: Award },
          { href: '/admin/cert-templates', label: 'Certificate Templates', icon: Upload },
        ];
      case 'club_admin':
        return [
          ...base,
          { href: '/club-admin/events', label: 'My Events', icon: Calendar },
          { href: '/club-admin/create-event', label: 'Create Event', icon: PlusCircle },
          { href: '/club-admin/registrations', label: 'Registrations', icon: ClipboardList },
          { href: '/club-admin/certificates', label: 'Certificates', icon: Award },
        ];
      case 'student':
        return [
          ...base,
          { href: '/student/events', label: 'Browse Events', icon: Calendar },
          { href: '/student/registered', label: 'My Registrations', icon: FileText },
          { href: '/student/clubs', label: 'Explore Clubs', icon: Building2 },
          { href: '/register-club', label: 'Register a Club', icon: PlusCircle },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={cn('w-64 min-h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border', className)}>
      <div className="p-4">
        <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
          <p className="font-semibold text-sm truncate">{user?.name}</p>
          <p className="text-xs text-primary capitalize">{primaryRole?.replace('_', ' ')}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
