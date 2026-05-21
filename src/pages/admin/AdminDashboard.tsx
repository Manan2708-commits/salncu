import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Calendar, Building2, Users, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClubs, useClubRequests } from '@/hooks/useClubs';
import { useEvents } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981',
  '#3b82f6','#ef4444','#14b8a6','#f97316','#a855f7',
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data: allClubs = [] } = useClubs();
  const { data: allEvents = [] } = useEvents();
  const { data: clubRequests = [] } = useClubRequests({ status: ['pending'] });

  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';

  const { data: userCount = 0 } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Events per club (top 10 by count)
  const eventsPerClub = Object.entries(
    allEvents.reduce((acc: Record<string, number>, e: any) => {
      const name = e.club?.name || e.club_id || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + '…' : name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Event status breakdown for pie chart
  const statusBreakdown = Object.entries(
    allEvents.reduce((acc: Record<string, number>, e: any) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Events by month (line chart)
  const eventsByMonth = allEvents.reduce((acc: Record<string, number>, e: any) => {
    const d = new Date(e.event_date);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const monthlyData = Object.entries(eventsByMonth)
    .map(([month, count]) => ({ month, count }))
    .slice(-8);

  const stats = [
    { title: 'Total Clubs', value: allClubs.length, icon: Building2, variant: 'primary' as const },
    { title: 'Total Events', value: allEvents.length, icon: Calendar, variant: 'accent' as const },
    { title: 'Pending Requests', value: clubRequests.length, icon: CheckSquare, variant: 'warning' as const },
    { title: 'Registered Users', value: userCount, icon: Users, variant: 'success' as const },
  ];

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Welcome, {displayName} 👋</h1>
          <p className="text-muted-foreground">Here's an overview of all club activity on campus.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Bar chart — events per club */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events per Club (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsPerClub.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">No event data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={eventsPerClub} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
                  />
                  <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
                    {eventsPerClub.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart — event status breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {statusBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Line chart — events over months */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Events Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Events"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ fill: '#6366f1', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
