import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ClubCard } from '@/components/clubs/ClubCard';
import { EventCard } from '@/components/events/EventCard';
import { mockClubs, mockEvents } from '@/data/mockData';
import { 
  Calendar, 
  Building2, 
  Users, 
  CheckSquare,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const pendingClubs = mockClubs.filter(c => c.status === 'pending');
  const pendingEvents = mockEvents.filter(e => e.status === 'pending');
  const approvedClubs = mockClubs.filter(c => c.status === 'approved');
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming' || e.status === 'approved');

  const stats = [
    { title: 'Total Clubs', value: mockClubs.length, icon: Building2, variant: 'primary' as const },
    { title: 'Total Events', value: mockEvents.length, icon: Calendar, variant: 'accent' as const },
    { title: 'Pending Approvals', value: pendingClubs.length + pendingEvents.length, icon: CheckSquare, variant: 'warning' as const },
    { title: 'Active Users', value: '1,234', icon: Users, variant: 'success' as const },
  ];

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage clubs, events, and approvals across the platform.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Club Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Pending Club Approvals
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/approvals">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingClubs.length > 0 ? (
                <div className="space-y-4">
                  {pendingClubs.slice(0, 2).map((club) => (
                    <ClubCard key={club.id} club={club} showActions />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No pending club approvals
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pending Event Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Pending Event Approvals
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/approvals">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingEvents.length > 0 ? (
                <div className="space-y-4">
                  {pendingEvents.slice(0, 2).map((event) => (
                    <EventCard key={event.id} event={event} showActions={false} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No pending event approvals
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} showActions={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
