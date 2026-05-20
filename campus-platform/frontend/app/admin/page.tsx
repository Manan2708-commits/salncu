'use client';
import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/api';
import { Users, Building2, Calendar, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalClubs: 0, totalEvents: 0, pendingRequests: 0 });

  useEffect(() => {
    api.get('/users/analytics').then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="indigo" />
        <StatCard title="Total Clubs" value={stats.totalClubs} icon={Building2} color="purple" />
        <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} color="green" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={ClipboardList} color="yellow" />
      </div>
    </div>
  );
}
