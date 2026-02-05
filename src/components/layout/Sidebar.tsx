import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  CheckSquare,
  Settings,
  FileText,
  PlusCircle,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { href: `/${user.role === 'admin' ? 'admin' : user.role === 'club_admin' ? 'club-admin' : 'student'}`, label: 'Dashboard', icon: LayoutDashboard },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin/clubs', label: 'Manage Clubs', icon: Building2 },
          { href: '/admin/events', label: 'Manage Events', icon: Calendar },
          { href: '/admin/approvals', label: 'Approvals', icon: CheckSquare },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      case 'club_admin':
        return [
          ...baseItems,
          { href: '/club-admin/events', label: 'My Events', icon: Calendar },
          { href: '/club-admin/create-event', label: 'Create Event', icon: PlusCircle },
          { href: '/club-admin/registrations', label: 'Registrations', icon: ClipboardList },
          { href: '/club-admin/club-profile', label: 'Club Profile', icon: Building2 },
        ];
      case 'student':
        return [
          ...baseItems,
          { href: '/student/events', label: 'Browse Events', icon: Calendar },
          { href: '/student/registered', label: 'My Registrations', icon: FileText },
          { href: '/student/clubs', label: 'Explore Clubs', icon: Building2 },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={cn(
      "w-64 min-h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border",
      className
    )}>
      <div className="p-4">
        <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
          <p className="font-semibold text-sm truncate">{user?.name}</p>
          <p className="text-xs text-primary capitalize">{user?.role.replace('_', ' ')}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
